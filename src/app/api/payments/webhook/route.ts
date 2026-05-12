import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseAdmin } from "@/lib/supabase-server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-04-30.basil",
});

export async function POST(request: NextRequest) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret) {
    return NextResponse.json({ error: "Missing signature or secret" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err: any) {
    console.error("[webhook] signature verification failed:", err.message);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  try {
    if (event.type === "payment_intent.succeeded") {
      const pi = event.data.object as Stripe.PaymentIntent;
      const bookingRef = pi.metadata?.bookingRef;

      if (bookingRef) {
        // Update booking payment status
        await supabaseAdmin
          .from("bookings")
          .update({ payment_status: "paid", status: "confirmed" })
          .eq("booking_ref", bookingRef);

        // Get booking for payment record
        const { data: booking } = await supabaseAdmin
          .from("bookings")
          .select("id, user_id, total_amount")
          .eq("booking_ref", bookingRef)
          .single();

        if (booking) {
          await supabaseAdmin.from("payments").insert({
            booking_id: booking.id,
            booking_ref: bookingRef,
            user_id: booking.user_id,
            amount: booking.total_amount,
            currency: pi.currency.toUpperCase(),
            payment_method: "card",
            provider: "stripe",
            provider_tx_id: pi.id,
            stripe_payment_intent_id: pi.id,
            status: "paid",
          });
        }
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
  } catch (err) {
    console.error("[webhook] processing error:", err);
  }

  return NextResponse.json({ received: true });
}
