/**
 * confirmBookingFromPayment — shared confirmation logic.
 *
 * Called from:
 *   - Stripe webhook (payment_intent.succeeded)
 *   - Fapshi webhook (status: SUCCESSFUL)
 *   - Fapshi status poll (GET /api/payments/fapshi) — Fix 1 reconcile-on-read
 *   - Reconcile queue drain (drainReconcileQueue) — Fix 2 opportunistic queue
 *
 * Idempotent: guarded by isEventProcessed / markEventProcessed so the
 * booking can never be double-confirmed and the email never double-sent,
 * regardless of how many callers race to confirm the same payment.
 *
 * Postgres is ALWAYS the source of truth. Redis is only used for dedup
 * and cache invalidation.
 */
import "server-only";
import { supabaseAdmin } from "@/lib/supabase-server";
import { sendConfirmationEmail } from "@/lib/emails/send-confirmation";
import { isEventProcessed, markEventProcessed } from "@/lib/redis/webhook";
import { invalidate } from "@/lib/redis/cache";
import { releaseLock, roomHoldKey } from "@/lib/redis/locks";

export type Provider = "stripe" | "fapshi";

export interface ConfirmResult {
  /** true = booking was confirmed in this call */
  confirmed: boolean;
  /** true = already confirmed by a previous call (idempotent no-op) */
  duplicate: boolean;
  bookingRef?: string;
}

/**
 * Confirm a booking after a successful payment.
 *
 * @param provider   "stripe" | "fapshi"
 * @param eventKey   Unique event identifier for dedup:
 *                   Stripe → PaymentIntent id (pi_xxx)
 *                   Fapshi → `${transId}:SUCCESSFUL`
 * @param bookingRef The booking reference (JP-XXXX-YY)
 * @param transactionId  Provider transaction id (pi_xxx or fapshi transId)
 * @param amount     Amount paid (in the provider's currency unit)
 * @param currency   Currency code (e.g. "USD", "XAF")
 * @param paymentMethod  "card" | "mobile_money" | "orange_money"
 */
export async function confirmBookingFromPayment({
  provider,
  eventKey,
  bookingRef,
  transactionId,
  amount,
  currency,
  paymentMethod,
}: {
  provider: Provider;
  eventKey: string;
  bookingRef: string;
  transactionId: string;
  amount?: number;
  currency?: string;
  paymentMethod?: string;
}): Promise<ConfirmResult> {
  // ── Idempotency guard ────────────────────────────────────────────────────
  // Fast path: Redis SET NX. Fallback: webhook_events table.
  // If already processed → return immediately without touching the DB.
  const isDuplicate = await isEventProcessed(provider, eventKey);
  if (isDuplicate) {
    return { confirmed: false, duplicate: true, bookingRef };
  }

  // ── Confirm booking in Postgres ──────────────────────────────────────────
  const { data: booking, error: updateError } = await supabaseAdmin
    .from("bookings")
    .update({ payment_status: "paid", status: "confirmed" })
    .eq("booking_ref", bookingRef)
    .select(
      "id, user_id, app_user_id, total_amount, room_id, room_slug, check_in, check_out",
    )
    .maybeSingle();

  if (updateError) {
    console.error("[confirm-booking] DB update error:", updateError);
    throw updateError;
  }

  if (!booking) {
    // Booking not found — could be a webhook for a booking we don't have yet
    // (race between booking creation and webhook). Log and return.
    console.warn("[confirm-booking] booking not found for ref:", bookingRef);
    return { confirmed: false, duplicate: false, bookingRef };
  }

  // ── Upsert payment row ───────────────────────────────────────────────────
  const conflictColumn =
    provider === "stripe" ? "stripe_payment_intent_id" : "fapshi_trans_id";

  await supabaseAdmin.from("payments").upsert(
    {
      booking_id: booking.id,
      booking_ref: bookingRef,
      user_id: booking.user_id,
      app_user_id: booking.app_user_id,
      amount: amount ?? booking.total_amount,
      currency: currency ?? (provider === "fapshi" ? "XAF" : "USD"),
      payment_method:
        paymentMethod ?? (provider === "fapshi" ? "mobile_money" : "card"),
      provider,
      provider_tx_id: transactionId,
      ...(provider === "stripe"
        ? { stripe_payment_intent_id: transactionId }
        : { fapshi_trans_id: transactionId }),
      status: "paid",
    },
    { onConflict: conflictColumn },
  );

  // ── Release room hold + invalidate cache ─────────────────────────────────
  if (booking.room_id) {
    await releaseLock(
      roomHoldKey(booking.room_id, booking.check_in, booking.check_out),
      transactionId, // token may differ — releaseLock is a no-op if mismatch
    );
  }
  await invalidate(`availability:slug:${booking.room_slug}`);
  await invalidate(`roomtype:slug:${booking.room_slug}`);

  // ── Mark event processed (Redis + DB) ────────────────────────────────────
  // Do this BEFORE sending email so a crash after email doesn't re-send.
  await markEventProcessed(provider, eventKey);

  // ── Send confirmation email ──────────────────────────────────────────────
  // Always uses booking.guest_email — never the auth account email.
  await sendConfirmationEmail(bookingRef);

  return { confirmed: true, duplicate: false, bookingRef };
}

/**
 * Expire a booking that failed or was abandoned.
 * Idempotent — safe to call multiple times.
 */
export async function expireBooking({
  bookingRef,
  bookingId,
  transactionId,
}: {
  bookingRef?: string;
  bookingId?: string;
  transactionId?: string;
}): Promise<void> {
  const query = supabaseAdmin
    .from("bookings")
    .update({ payment_status: "failed", status: "expired" })
    .eq("status", "pending")
    .select("room_id, room_slug, check_in, check_out");

  if (bookingRef) query.eq("booking_ref", bookingRef);
  else if (bookingId) query.eq("id", bookingId);
  else return;

  const { data: rows } = await query;

  for (const b of rows ?? []) {
    if (b.room_id && transactionId) {
      await releaseLock(
        roomHoldKey(b.room_id, b.check_in, b.check_out),
        transactionId,
      );
    }
    await invalidate(`availability:slug:${b.room_slug}`);
  }
}
