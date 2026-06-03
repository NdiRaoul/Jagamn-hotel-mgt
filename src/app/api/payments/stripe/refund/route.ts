import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createSupabaseServerClient } from "@/lib/supabase-server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-05-27.dahlia",
});

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { paymentIntentId, refundAmountXaf } = await request.json();

  // XAF is zero-decimal in Stripe - send whole franc amount (no ×100)
  const refund = await stripe.refunds.create({
    payment_intent: paymentIntentId,
    amount: Math.round(refundAmountXaf),
  });

  return NextResponse.json({ refundId: refund.id, status: refund.status });
}
