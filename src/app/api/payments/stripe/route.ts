import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseAdmin } from "@/lib/supabase-server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-04-22.dahlia",
});

// POST /api/payments/stripe — create PaymentIntent
// Loads the booking total from the DB — never trusts client-sent amounts.
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bookingRef, currency = "usd", savedPaymentMethodId } = body;

    if (!bookingRef) {
      return NextResponse.json(
        { error: "bookingRef is required" },
        { status: 400 },
      );
    }

    // Load the authoritative total from the database
    const { data: booking, error: bookingError } = await supabaseAdmin
      .from("bookings")
      .select("total_amount, payment_status")
      .eq("booking_ref", bookingRef)
      .maybeSingle();

    if (bookingError || !booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    if (booking.payment_status === "paid") {
      return NextResponse.json(
        { error: "Booking is already paid" },
        { status: 409 },
      );
    }

    if (!booking.total_amount || booking.total_amount <= 0) {
      return NextResponse.json(
        { error: "Invalid booking total" },
        { status: 400 },
      );
    }

    const piParams: Stripe.PaymentIntentCreateParams = {
      amount: Math.round(booking.total_amount * 100),
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
