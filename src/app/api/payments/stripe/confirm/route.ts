import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseAdmin } from "@/lib/supabase-server";
import { confirmBookingFromPayment } from "@/lib/payments/confirm-booking";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-05-27.dahlia",
});

/**
 * POST /api/payments/stripe/confirm
 *
 * Server-verified confirmation so card payments settle even when the Stripe
 * webhook is never delivered (the sandbox case). The client calls this right
 * after stripe.confirmCardPayment() succeeds. We re-read the PaymentIntent from
 * Stripe — never trusting a client-asserted status — and reuse the idempotent
 * confirmBookingFromPayment(), so a later webhook is a harmless no-op.
 *
 * Body: { bookingRef: string, paymentIntentId?: string }
 * If paymentIntentId is omitted we resolve it from payment_ledger.processor_ref.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bookingRef } = body as {
      bookingRef?: string;
      paymentIntentId?: string;
    };
    let { paymentIntentId } = body as { paymentIntentId?: string };

    if (!bookingRef) {
      return NextResponse.json(
        { error: "bookingRef is required" },
        { status: 400 },
      );
    }

    // Resolve the PaymentIntent id from the ledger if the client didn't send it.
    if (!paymentIntentId) {
      const { data: ledger } = await supabaseAdmin
        .from("payment_ledger")
        .select("processor_ref")
        .eq("booking_ref", bookingRef)
        .eq("provider", "stripe")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      paymentIntentId = ledger?.processor_ref ?? undefined;
    }

    if (!paymentIntentId) {
      return NextResponse.json(
        { error: "No PaymentIntent found for this booking" },
        { status: 404 },
      );
    }

    const pi = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (pi.status === "succeeded") {
      await confirmBookingFromPayment({
        provider: "stripe",
        eventKey: pi.id,
        bookingRef,
        transactionId: pi.id,
        // Stripe XAF is zero-decimal — pi.amount is already whole francs.
        amount: pi.amount,
        currency: pi.currency.toUpperCase(),
        paymentMethod: "card",
      });
    }

    return NextResponse.json({ status: pi.status });
  } catch (err: unknown) {
    console.error("[POST /api/payments/stripe/confirm] error:", err);
    const message =
      err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
