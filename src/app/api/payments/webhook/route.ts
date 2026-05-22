import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseAdmin } from "@/lib/supabase-server";
import { sendConfirmationEmail } from "@/lib/emails/send-confirmation";
import { isEventProcessed, markEventProcessed } from "@/lib/redis/webhook";

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
    // Idempotency guard — fast path via Redis, fallback to webhook_events table.
    // Defense in depth: the DB upserts below are the durable backstop.
    const isDuplicate = await isEventProcessed("stripe", event.id);
    if (isDuplicate) {
      return NextResponse.json({ received: true });
    }

    if (event.type === "payment_intent.succeeded") {
      const pi = event.data.object as Stripe.PaymentIntent;
      const bookingRef = pi.metadata?.bookingRef;

      if (bookingRef) {
        // Mark booking confirmed — only happens here, never at booking creation
        await supabaseAdmin
          .from("bookings")
          .update({ payment_status: "paid", status: "confirmed" })
          .eq("booking_ref", bookingRef);

        // Load booking to get IDs for the payment row
        const { data: booking } = await supabaseAdmin
          .from("bookings")
          .select("id, user_id, app_user_id, total_amount")
          .eq("booking_ref", bookingRef)
          .single();

        if (booking) {
          // Upsert on stripe_payment_intent_id so duplicate webhook deliveries
          // don't create duplicate payment rows (idempotent).
          await supabaseAdmin.from("payments").upsert(
            {
              booking_id: booking.id,
              booking_ref: bookingRef,
              // user_id = auth.users id (null for guests — that's fine)
              user_id: booking.user_id,
              // app_user_id = our users table id (exists for BOTH guests and members)
              app_user_id: booking.app_user_id,
              amount: booking.total_amount,
              currency: pi.currency.toUpperCase(),
              payment_method: "card",
              provider: "stripe",
              provider_tx_id: pi.id,
              stripe_payment_intent_id: pi.id,
              status: "paid",
            },
            { onConflict: "stripe_payment_intent_id" },
          );
        }

        // Send the real "Booking Confirmed" email only now that payment succeeded.
        // Email always goes to booking.guest_email (the address the user typed).
        await sendConfirmationEmail(bookingRef);
      }
    }

    if (event.type === "payment_intent.payment_failed") {
      const pi = event.data.object as Stripe.PaymentIntent;
      const bookingRef = pi.metadata?.bookingRef;

      if (bookingRef) {
        await supabaseAdmin
          .from("bookings")
          .update({ payment_status: "failed" })
          .eq("booking_ref", bookingRef);
      }
    }

    // Handle refund webhook
    if (event.type === "charge.refunded") {
      const charge = event.data.object as Stripe.Charge;
      const { data: payment } = await supabaseAdmin
        .from("payments")
        .select("booking_id")
        .eq("stripe_payment_intent_id", charge.payment_intent as string)
        .single();

      if (payment) {
        await supabaseAdmin
          .from("bookings")
          .update({ payment_status: "refunded" })
          .eq("id", payment.booking_id);
      }
    }

    // Mark as processed in Redis + durable DB table
    await markEventProcessed("stripe", event.id);
  } catch (err) {
    console.error("[stripe-webhook] processing error:", err);
  }

  return NextResponse.json({ received: true });
}
