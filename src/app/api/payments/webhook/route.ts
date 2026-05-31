import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseAdmin } from "@/lib/supabase-server";
import { isEventProcessed, markEventProcessed } from "@/lib/redis/webhook";
import { appendEvent, getStatus } from "@/lib/payments/ledger";
import {
  confirmBookingFromPayment,
  expireBooking,
} from "@/lib/payments/confirm-booking";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-04-22.dahlia" as Stripe.LatestApiVersion,
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
  } catch (err: any) {
    console.error("[webhook] signature verification failed:", err.message);
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 },
    );
  }

  try {
    if (event.type === "payment_intent.succeeded") {
      const pi = event.data.object as Stripe.PaymentIntent;
      const eventKey = `payment_intent.succeeded:${pi.id}`;
      const duplicate = await isEventProcessed("stripe", eventKey);
      if (duplicate) {
        return NextResponse.json({ received: true });
      }

      let bookingRef = pi.metadata?.bookingRef;
      let paymentId = pi.metadata?.payment_id as string | undefined;

      if (!paymentId) {
        const { data: ledger } = await supabaseAdmin
          .from("payment_ledger")
          .select("id, booking_ref")
          .eq("processor_ref", pi.id)
          .maybeSingle();
        if (ledger) {
          paymentId = ledger.id;
          bookingRef = bookingRef ?? ledger.booking_ref;
        }
      }

      if (paymentId) {
        await appendEvent(paymentId, "processor_succeeded", {
          source: "webhook",
          payload: { stripeEventId: event.id, amount: pi.amount },
        });
      }

      if (bookingRef) {
        await confirmBookingFromPayment({
          provider: "stripe",
          eventKey,
          bookingRef,
          transactionId: pi.id,
          amount: pi.amount ? pi.amount / 100 : undefined,
          currency: pi.currency?.toUpperCase(),
          paymentMethod: "card",
          paymentId,
        });
      }

      await markEventProcessed("stripe", eventKey);
      return NextResponse.json({ received: true });
    }

    if (event.type === "payment_intent.payment_failed") {
      const pi = event.data.object as Stripe.PaymentIntent;
      const eventKey = `payment_intent.payment_failed:${pi.id}`;
      const duplicate = await isEventProcessed("stripe", eventKey);
      if (duplicate) {
        return NextResponse.json({ received: true });
      }

      let bookingRef = pi.metadata?.bookingRef;
      let paymentId = pi.metadata?.payment_id as string | undefined;

      if (!paymentId) {
        const { data: ledger } = await supabaseAdmin
          .from("payment_ledger")
          .select("id, booking_ref")
          .eq("processor_ref", pi.id)
          .maybeSingle();
        if (ledger) {
          paymentId = ledger.id;
          bookingRef = bookingRef ?? ledger.booking_ref;
        }
      }

      if (paymentId) {
        await appendEvent(paymentId, "processor_failed", {
          source: "webhook",
          payload: { stripeEventId: event.id, amount: pi.amount },
        });
      }

      if (bookingRef) {
        await supabaseAdmin
          .from("bookings")
          .update({ payment_status: "failed" })
          .eq("booking_ref", bookingRef);
      }

      await markEventProcessed("stripe", eventKey);
      return NextResponse.json({ received: true });
    }

    if (event.type === "charge.refunded") {
      const charge = event.data.object as Stripe.Charge;
      const refund = Array.isArray(charge.refunds?.data)
        ? charge.refunds.data[charge.refunds.data.length - 1]
        : undefined;
      const refundId = refund?.id || charge.id;
      const eventKey = `charge.refunded:${refundId}`;
      const duplicate = await isEventProcessed("stripe", eventKey);
      if (duplicate) {
        return NextResponse.json({ received: true });
      }

      const paymentIntentId = charge.payment_intent as string | undefined;
      const { data: ledger } = paymentIntentId
        ? await supabaseAdmin
            .from("payment_ledger")
            .select("id, booking_ref")
            .eq("processor_ref", paymentIntentId)
            .maybeSingle()
        : { data: null };

      if (ledger?.id) {
        await appendEvent(ledger.id, "refund_succeeded", {
          source: "webhook",
          amountMinor: refund?.amount ?? null,
          payload: { refundId, stripeRefundStatus: refund?.status },
        });

        await supabaseAdmin
          .from("refunds")
          .update({ status: "succeeded", processor_refund_id: refundId })
          .eq("payment_id", ledger.id)
          .eq("processor_refund_id", refundId);

        const ledgerStatus = await getStatus(ledger.id);
        if (ledgerStatus) {
          await supabaseAdmin
            .from("bookings")
            .update({ payment_status: ledgerStatus })
            .eq("booking_ref", ledger.booking_ref);
        }
      }

      await markEventProcessed("stripe", eventKey);
      return NextResponse.json({ received: true });
    }
  } catch (err) {
    console.error("[webhook] processing error:", err);
  }

  return NextResponse.json({ received: true });
}
