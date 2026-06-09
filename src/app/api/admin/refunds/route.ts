import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseAdmin } from "@/lib/supabase-server";
import { getStaffSession } from "@/lib/auth/staff-session";
import { randomUUID } from "crypto";

const ALLOWED_ROLES = ["owner", "admin"];

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-05-27.dahlia",
});

/**
 * POST /api/admin/refunds
 * Body: { paymentId: string, amountXaf?: number, reason?: string }
 *
 * Issues a refund against a payment_ledger row. Resolves the processor ref and
 * provider server-side, records a `refunds` row (so the Stripe charge.refunded
 * webhook can reconcile it), and calls the correct provider. Amount defaults to
 * the full ledger amount (whole XAF). Admin / owner only.
 */
export async function POST(request: NextRequest) {
  const session = await getStaffSession();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.status !== "active" || !ALLOWED_ROLES.includes(session.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const { paymentId, amountXaf, reason } = body as {
    paymentId?: string;
    amountXaf?: number;
    reason?: string;
  };

  if (!paymentId) {
    return NextResponse.json(
      { error: "paymentId is required" },
      { status: 400 },
    );
  }

  const { data: ledger } = await supabaseAdmin
    .from("payment_ledger")
    .select("id,booking_ref,provider,processor_ref,amount_minor")
    .eq("id", paymentId)
    .maybeSingle();

  if (!ledger || !ledger.processor_ref) {
    return NextResponse.json(
      { error: "Payment not found or not yet processed" },
      { status: 404 },
    );
  }

  // Default to a full refund (ledger amount is XAF×100 minor units).
  const fullXaf = Math.round(ledger.amount_minor / 100);
  const refundXaf =
    typeof amountXaf === "number" && amountXaf > 0
      ? Math.min(Math.round(amountXaf), fullXaf)
      : fullXaf;

  // Record the refund first so the webhook can find and update it.
  const idempotencyKey = randomUUID();
  const { data: refundRow } = await supabaseAdmin
    .from("refunds")
    .insert({
      payment_id: ledger.id,
      booking_ref: ledger.booking_ref,
      amount_minor: refundXaf * 100,
      currency: "XAF",
      status: "requested",
      requested_by: session.auth_user_id,
      client_idempotency_key: idempotencyKey,
      reason: reason ?? null,
    })
    .select("id")
    .maybeSingle();

  try {
    let processorRefundId: string | null = null;

    if (ledger.provider === "stripe") {
      const refund = await stripe.refunds.create({
        payment_intent: ledger.processor_ref,
        amount: refundXaf, // XAF is zero-decimal in Stripe
      });
      processorRefundId = refund.id;
    } else {
      const res = await fetch(`${process.env.FAPSHI_BASE_URL}/refund`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apiuser: process.env.FAPSHI_API_USER || "",
          apikey: process.env.FAPSHI_API_KEY || "",
        },
        body: JSON.stringify({
          transId: ledger.processor_ref,
          amount: refundXaf,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Fapshi refund failed");
      processorRefundId = data.transId || data.refundId || ledger.processor_ref;
    }

    // Mark the refund succeeded and reflect it on the booking.
    await supabaseAdmin
      .from("refunds")
      .update({
        status: "succeeded",
        processor_refund_id: processorRefundId,
        updated_at: new Date().toISOString(),
      })
      .eq("id", refundRow?.id);

    await supabaseAdmin
      .from("bookings")
      .update({
        payment_status:
          refundXaf >= fullXaf ? "refunded" : "partially_refunded",
      })
      .eq("booking_ref", ledger.booking_ref);

    await supabaseAdmin.from("audit_log").insert({
      actor_id: session.auth_user_id,
      actor_role: session.role,
      action: "payment.refund",
      target_type: "payment_ledger",
      target_id: ledger.id,
      payload: { refundXaf, provider: ledger.provider, reason },
      ip: request.headers.get("x-forwarded-for") || "unknown",
    });

    return NextResponse.json({
      status: "succeeded",
      refundXaf,
      processorRefundId,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Refund failed";
    console.error("[POST /api/admin/refunds] error:", err);
    await supabaseAdmin
      .from("refunds")
      .update({ status: "failed", updated_at: new Date().toISOString() })
      .eq("id", refundRow?.id);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
