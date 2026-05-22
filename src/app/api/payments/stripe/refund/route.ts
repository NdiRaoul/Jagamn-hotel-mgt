import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import {
  supabaseAdmin,
  createSupabaseServerClient,
} from "@/lib/supabase-server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-04-22.dahlia",
});

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { paymentIntentId } = await request.json();

  if (!paymentIntentId) {
    return NextResponse.json(
      { error: "paymentIntentId is required" },
      { status: 400 },
    );
  }

  // Look up the payment row and verify the authenticated user owns it.
  // Never trust a client-supplied refund amount — use the stored amount.
  const { data: userRow } = await supabaseAdmin
    .from("users")
    .select("id")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (!userRow) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const { data: payment } = await supabaseAdmin
    .from("payments")
    .select("id, amount, stripe_payment_intent_id, booking_id")
    .eq("stripe_payment_intent_id", paymentIntentId)
    .eq("app_user_id", userRow.id)
    .maybeSingle();

  if (!payment) {
    // Either the payment doesn't exist or it belongs to a different user
    return NextResponse.json(
      { error: "Payment not found or access denied" },
      { status: 404 },
    );
  }

  try {
    // Refund the amount stored on the payment row — never the client-supplied figure
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount: payment.amount * 100, // stored in cents-equivalent USD; Stripe expects cents
    });

    return NextResponse.json({ refundId: refund.id, status: refund.status });
  } catch (err: unknown) {
    console.error("[stripe-refund] error:", err);
    return NextResponse.json(
      { error: "Refund failed. Please contact support." },
      { status: 500 },
    );
  }
}
