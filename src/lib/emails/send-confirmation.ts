/**
 * Shared helper: send the "Booking Confirmed" email ONLY after payment succeeds.
 * Called from both the Stripe and Fapshi webhooks — never from booking creation.
 * The recipient is always the booking's guest_email (the address the user typed),
 * never the session/auth account email.
 *
 * Idempotent: checks receipt_sent_at before sending. Returns true if the email
 * was sent (or was already sent). Returns false on transient failure so the
 * caller can retry later (receipt_sent_at stays NULL).
 */
import { supabaseAdmin } from "@/lib/supabase-server";
import { resend, EMAIL_FROM } from "@/lib/resend";
import { buildReceiptEmailHtml } from "@/lib/emails/booking-receipt";

export async function sendConfirmationEmail(
  bookingRef: string,
): Promise<boolean> {
  // Without an API key Resend can never deliver. Return false (not "sent") so
  // receipt_sent_at stays NULL and a later poll/reconcile retries once it's set.
  if (!process.env.RESEND_API_KEY) {
    console.error(
      "[sendConfirmationEmail] RESEND_API_KEY is not set — cannot send receipt for",
      bookingRef,
    );
    return false;
  }

  // Load the full booking row so we always use the stored guest_email
  const { data: booking, error } = await supabaseAdmin
    .from("bookings")
    .select(
      "booking_ref, guest_name, guest_email, room_slug, check_in, check_out, nights, guests, room_price_per_night, tax_amount, total_amount, payment_method, receipt_sent_at",
    )
    .eq("booking_ref", bookingRef)
    .single();

  if (error || !booking) {
    // If receipt_sent_at column doesn't exist yet (migration pending), retry
    // without it — we'll skip the idempotency guard but still send the email.
    if (
      error?.message?.includes("receipt_sent_at") ||
      error?.code === "42703"
    ) {
      const { data: fallback, error: fallbackErr } = await supabaseAdmin
        .from("bookings")
        .select(
          "booking_ref, guest_name, guest_email, room_slug, check_in, check_out, nights, guests, room_price_per_night, tax_amount, total_amount, payment_method",
        )
        .eq("booking_ref", bookingRef)
        .single();
      if (fallbackErr || !fallback) {
        console.error(
          "[sendConfirmationEmail] could not load booking (fallback):",
          bookingRef,
          fallbackErr,
        );
        return false;
      }
      // Proceed with fallback booking data (no receipt_sent_at guard)
      return sendEmailAndMark(
        { ...fallback, receipt_sent_at: null },
        bookingRef,
      );
    }
    console.error(
      "[sendConfirmationEmail] could not load booking:",
      bookingRef,
      error,
    );
    return false;
  }

  return sendEmailAndMark(booking, bookingRef);
}

async function sendEmailAndMark(
  booking: {
    booking_ref: string;
    guest_name: string;
    guest_email: string;
    room_slug: string;
    check_in: string;
    check_out: string;
    nights: number | null;
    guests: number | null;
    room_price_per_night: number;
    tax_amount: number | null;
    total_amount: number;
    payment_method: string | null;
    receipt_sent_at?: string | null;
  },
  bookingRef: string,
): Promise<boolean> {
  // Idempotency guard — already sent, no double-send
  if (booking.receipt_sent_at) {
    return true;
  }

  // Resolve a human-readable room name from the room_types table if possible
  const { data: roomType, error: roomTypeError } = await supabaseAdmin
    .from("room_types")
    .select("name")
    .eq("slug", booking.room_slug)
    .maybeSingle();

  if (roomTypeError) {
    console.error(
      "[sendConfirmationEmail] could not resolve room name:",
      bookingRef,
      roomTypeError,
    );
  }

  const roomName = roomType?.name || booking.room_slug;

  try {
    const { data: sendData, error: sendError } = await resend.emails.send({
      from: EMAIL_FROM,
      // Always send to the email the guest typed — never the auth account email
      to: [booking.guest_email],
      subject: `Booking Confirmed — ${booking.booking_ref} | Jagamn Palace`,
      html: buildReceiptEmailHtml({
        bookingRef: booking.booking_ref,
        guestName: booking.guest_name,
        roomName,
        checkIn: booking.check_in,
        checkOut: booking.check_out,
        nights: booking.nights || 1,
        guests: booking.guests || 1,
        pricePerNight: booking.room_price_per_night,
        taxAmount: booking.tax_amount || 0,
        totalAmount: booking.total_amount,
        paymentMethod: booking.payment_method || "Online Payment",
      }),
    });

    if (sendError) {
      console.error(
        "[sendConfirmationEmail] Resend API error for",
        bookingRef,
        sendError,
      );
      // Leave receipt_sent_at NULL so a later reconcile can retry
      return false;
    }

    console.log(
      "[sendConfirmationEmail] receipt sent for",
      bookingRef,
      "to",
      booking.guest_email,
      "id:",
      sendData?.id,
    );
  } catch (emailErr) {
    console.error(
      "[sendConfirmationEmail] email send failed for",
      bookingRef,
      emailErr,
    );
    // Leave receipt_sent_at NULL so a later reconcile can retry
    return false;
  }

  // Mark as sent AFTER successful delivery
  const { error: updateError } = await supabaseAdmin
    .from("bookings")
    .update({ receipt_sent_at: new Date().toISOString() })
    .eq("booking_ref", bookingRef);

  if (updateError) {
    console.error(
      "[sendConfirmationEmail] failed to update receipt_sent_at for",
      bookingRef,
      updateError,
    );
    // Email was sent but we couldn't record it — return true to avoid
    // a retry that would double-send. The next call will re-check receipt_sent_at.
    return true;
  }

  return true;
}
