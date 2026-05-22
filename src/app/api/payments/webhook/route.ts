/**
 * POST /api/payments/webhook — Stripe webhook handler.
 *
 * Uses the shared confirmBookingFromPayment() helper so confirmation logic
 * is identical whether triggered by webhook, status-poll (Fix 1), or the
 * reconcile queue (Fix 2). Idempotency is enforced inside that helper.
 */
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseAdmin } from "@/lib/supabase-server";
import {
  confirmBookingFromPayment,
  expireBooking,
} from "@/lib/payments/confirm-booking";

// Stripe webhooks need the raw body for signature verification — Node runtime required.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-04-22.dahlia",
});

export async function POST(request: NextRequest) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret) {
    return NextResponse.json(
      { error: "Missing signature or secret" },
      { status: 400 },
    );
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("[stripe-webhook] signature verification failed:", msg);
    return NextResponse.json(
      { error: "Webhook signature verification failed" },
      { status: 400 },
    );
  }

  try {
    if (event.type === "payment_intent.succeeded") {
      const pi = event.data.object as Stripe.PaymentIntent;
      const bookingRef = pi.metadata?.bookingRef;

      if (bookingRef) {
        await confirmBookingFromPayment({
          provider: "stripe",
          eventKey: pi.id, // Stripe event.id is unique per delivery; pi.id is stable
          bookingRef,
          transactionId: pi.id,
          amount: pi.amount / 100, // Stripe stores in cents
          currency: pi.currency.toUpperCase(),
          paymentMethod: "card",
        });
      }
    }

    if (event.type === "payment_intent.payment_failed") {
      const pi = event.data.object as Stripe.PaymentIntent;
      const bookingRef = pi.metadata?.bookingRef;
      if (bookingRef) {
        await expireBooking({ bookingRef, transactionId: pi.id });
      }
    }

    if (event.type === "charge.refunded") {
      const charge = event.data.object as Stripe.Charge;
      const { data: payment } = await supabaseAdmin
        .from("payments")
        .select("booking_id")
        .eq("stripe_payment_intent_id", charge.payment_intent as string)
        .maybeSingle();

      if (payment) {
        await supabaseAdmin
          .from("bookings")
          .update({ payment_status: "refunded" })
          .eq("id", payment.booking_id);
      }
    }
  } catch (err) {
    console.error("[stripe-webhook] processing error:", err);
    // Return 200 so Stripe doesn't retry — we log and the reconcile queue
    // will catch any missed confirmations.
  }

  return NextResponse.json({ received: true });
}
