import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-04-30.basil",
});

// POST /api/payments/stripe — create PaymentIntent
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bookingRef, totalAmount, currency = "usd" } = body;

    if (!bookingRef || !totalAmount) {
      return NextResponse.json(
        { error: "bookingRef and totalAmount are required" },
        { status: 400 }
      );
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalAmount * 100), // convert to cents
      currency,
      metadata: { bookingRef },
    });

    return NextResponse.json({ clientSecret: paymentIntent.client_secret });
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
