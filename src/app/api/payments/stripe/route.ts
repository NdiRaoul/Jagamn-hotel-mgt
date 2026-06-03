import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getOrCreateLedger, appendEvent } from "@/lib/payments/ledger";
import { supabaseAdmin } from "@/lib/supabase-server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-05-27.dahlia",
});

// POST /api/payments/stripe — create PaymentIntent
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      bookingRef,
      totalAmount,
      currency = "xaf",
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

    // Compute explicit units:
    // - `amountForStripe` is the whole-franc integer Stripe expects for XAF (zero-decimal)
    // - `amountMinor` is XAF ×100 used by our internal ledger/folio fields
    const amountForStripe = Math.round(totalAmount);
    const amountMinor = Math.round(totalAmount * 100);
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

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentId: ledger.id,
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
