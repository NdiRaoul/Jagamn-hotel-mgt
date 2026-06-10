import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getOrCreateLedger, appendEvent } from "@/lib/payments/ledger";
import { supabaseAdmin } from "@/lib/supabase-server";
import { enqueueReconcile } from "@/lib/redis/reconcile";
import { paymentLimiter } from "@/lib/redis/rate-limit";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-05-27.dahlia",
});

// POST /api/payments/stripe — create PaymentIntent
export async function POST(request: NextRequest) {
  try {
    // Rate limiting — distributed, prevents PaymentIntent-creation abuse.
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    const { success: withinLimit } = await paymentLimiter.limit(`pay:${ip}`);
    if (!withinLimit) {
      return NextResponse.json(
        { error: "Too many requests. Please wait a moment." },
        { status: 429 },
      );
    }

    const body = await request.json();
    const { bookingRef, clientIdempotencyKey } = body;

    if (!bookingRef || !clientIdempotencyKey) {
      return NextResponse.json(
        { error: "bookingRef and clientIdempotencyKey are required" },
        { status: 400 },
      );
    }

    // ── Server-authoritative amount ──────────────────────────────────────────
    // The amount to charge is read from the booking row, never trusted from the
    // client. This prevents a tampered request from paying less than the booking
    // total. confirmBookingFromPayment then settles against this same figure.
    const { data: booking } = await supabaseAdmin
      .from("bookings")
      .select("id, total_amount, payment_status")
      .eq("booking_ref", bookingRef)
      .maybeSingle();

    if (!booking) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 },
      );
    }
    if (booking.payment_status === "paid") {
      return NextResponse.json(
        { error: "Booking is already paid" },
        { status: 409 },
      );
    }

    // Compute explicit units:
    // - `amountForStripe` is the whole-franc integer Stripe expects for XAF (zero-decimal)
    // - `amountMinor` is XAF ×100 used by our internal ledger/folio fields
    const amountForStripe = Math.round(booking.total_amount);
    const amountMinor = Math.round(booking.total_amount * 100);
    const ledger = await getOrCreateLedger({
      bookingRef,
      provider: "stripe",
      amountMinor,
      currency: "XAF",
      clientIdempotencyKey,
    });

    if (!ledger.processor_ref) {
      await appendEvent(ledger.id, "intent_created", { source: "server" });
    }

    let paymentIntent: Stripe.PaymentIntent;
    if (ledger.processor_ref) {
      paymentIntent = await stripe.paymentIntents.retrieve(
        ledger.processor_ref,
      );
    } else {
      // Stripe XAF is zero-decimal: send the whole XAF amount (not ×100)
      paymentIntent = await stripe.paymentIntents.create(
        {
          amount: amountForStripe,
          currency: "xaf",
          metadata: { bookingRef, payment_id: ledger.id },
        },
        { idempotencyKey: clientIdempotencyKey },
      );

      await supabaseAdmin
        .from("payment_ledger")
        .update({ processor_ref: paymentIntent.id })
        .eq("id", ledger.id);

      await appendEvent(ledger.id, "processor_sent", {
        source: "server",
        payload: { paymentIntentId: paymentIntent.id },
      });
    }

    // Backstop: enqueue for reconciliation so the booking still settles if the
    // webhook is missed and the guest closes the tab. No-op when Redis is absent.
    await enqueueReconcile({
      bookingId: booking.id,
      bookingRef,
      provider: "stripe",
      transactionId: paymentIntent.id,
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentId: ledger.id,
      paymentIntentId: paymentIntent.id,
    });
  } catch (err: unknown) {
    console.error("[POST /api/payments/stripe] error:", err);
    const message =
      err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// PUT /api/payments/stripe — create SetupIntent (save card)
export async function PUT(request: NextRequest) {
  try {
    const setupIntent = await stripe.setupIntents.create({
      usage: "off_session",
    });

    return NextResponse.json({ clientSecret: setupIntent.client_secret });
  } catch (err: unknown) {
    console.error("[PUT /api/payments/stripe] error:", err);
    const message =
      err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
