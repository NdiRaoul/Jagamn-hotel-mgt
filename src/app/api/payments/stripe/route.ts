import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getOrCreateLedger, appendEvent } from "@/lib/payments/ledger";
import { supabaseAdmin } from "@/lib/supabase-server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-04-22.dahlia",
});

// POST /api/payments/stripe — create PaymentIntent
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      bookingRef,
      totalAmount,
      currency = "usd",
      clientIdempotencyKey,
    } = body;

    if (!bookingRef || !totalAmount || !clientIdempotencyKey) {
      return NextResponse.json(
        {
          error:
            "bookingRef, totalAmount and clientIdempotencyKey are required",
        },
        { status: 400 },
      );
    }

    const amountMinor = Math.round(totalAmount * 100);
    const ledger = await getOrCreateLedger({
      bookingRef,
      provider: "stripe",
      amountMinor,
      currency: currency.toUpperCase(),
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
      paymentIntent = await stripe.paymentIntents.create(
        {
          amount: amountMinor,
          currency,
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

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentId: ledger.id,
    });
  } catch (err: any) {
    console.error("[POST /api/payments/stripe] error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PUT /api/payments/stripe — create SetupIntent (save card)
export async function PUT(request: NextRequest) {
  try {
    const setupIntent = await stripe.setupIntents.create({
      usage: "off_session",
    });

    return NextResponse.json({ clientSecret: setupIntent.client_secret });
  } catch (err: any) {
    console.error("[PUT /api/payments/stripe] error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
