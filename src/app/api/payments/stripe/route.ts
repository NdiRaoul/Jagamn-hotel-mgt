import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

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
      savedPaymentMethodId,
    } = body;

    if (!bookingRef || !totalAmount) {
      return NextResponse.json(
        { error: "bookingRef and totalAmount are required" },
        { status: 400 },
      );
    }

    const piParams: Stripe.PaymentIntentCreateParams = {
      amount: Math.round(totalAmount * 100),
      currency,
      metadata: { bookingRef },
      ...(savedPaymentMethodId
        ? {
            payment_method: savedPaymentMethodId,
            confirm: true,
            off_session: true,
          }
        : {}),
    };

    const paymentIntent = await stripe.paymentIntents.create(piParams, {
      idempotencyKey: `booking-${bookingRef}`,
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      status: paymentIntent.status,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[POST /api/payments/stripe] error:", err);
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
    const message = err instanceof Error ? err.message : String(err);
    console.error("[PUT /api/payments/stripe] error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
