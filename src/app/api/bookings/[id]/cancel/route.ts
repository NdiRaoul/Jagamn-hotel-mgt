import { NextRequest, NextResponse } from "next/server";
import {
  supabaseAdmin,
  createSupabaseServerClient,
} from "@/lib/supabase-server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-05-27.dahlia",
});

const FAPSHI_BASE_URL =
  process.env.FAPSHI_BASE_URL || "https://sandbox.fapshi.com";

type PaymentRow = {
  id: string;
  status: string;
  provider: string | null;
  stripe_payment_intent_id: string | null;
  fapshi_trans_id: string | null;
};

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: userRow } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("auth_user_id", user.id)
      .maybeSingle();

    if (!userRow)
      return NextResponse.json({ error: "User not found" }, { status: 404 });

    const { data: booking } = await supabaseAdmin
      .from("bookings")
      .select("*, payments(*)")
      .eq("id", id)
      .eq("app_user_id", userRow.id)
      .single();

    if (!booking)
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    if (booking.status === "cancelled")
      return NextResponse.json({ error: "Already cancelled" }, { status: 400 });

    const cancellationFee = Math.round(booking.total_amount * 0.15);
    const refundAmount = booking.total_amount - cancellationFee;

    const payment = ((booking.payments as PaymentRow[]) || []).find(
      (p) => p.status === "paid",
    );
    let refundTxId: string | null = null;
    let refundStatus = "pending";

    if (payment) {
      try {
        if (payment.provider === "stripe" && payment.stripe_payment_intent_id) {
          // Stripe XAF is zero-decimal - send whole franc amount (no ×100)
          const refund = await stripe.refunds.create({
            payment_intent: payment.stripe_payment_intent_id,
            amount: Math.round(refundAmount),
          });
          refundTxId = refund.id;
          refundStatus = refund.status === "succeeded" ? "refunded" : "pending";
        } else if (payment.provider === "fapshi" && payment.fapshi_trans_id) {
          // Fapshi is XAF-native - pass XAF directly (no conversion)
          const res = await fetch(`${FAPSHI_BASE_URL}/refund`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              apiuser: process.env.FAPSHI_API_USER || "",
              apikey: process.env.FAPSHI_API_KEY || "",
            },
            body: JSON.stringify({
              transId: payment.fapshi_trans_id,
              amount: Math.round(refundAmount),
            }),
          });
          const d = await res.json();
          refundTxId = d.transId || null;
          refundStatus = res.ok ? "refunded" : "failed";
        }
      } catch (e) {
        console.error("[cancel] refund error:", e);
        refundStatus = "failed";
      }

      await supabaseAdmin
        .from("payments")
        .update({ refund_status: refundStatus, refund_tx_id: refundTxId })
        .eq("id", payment.id);
    }

    await supabaseAdmin
      .from("bookings")
      .update({
        status: "cancelled",
        cancelled_at: new Date().toISOString(),
        cancellation_fee: cancellationFee,
        refund_amount: refundAmount,
        payment_status:
          refundStatus === "refunded" ? "refunded" : "cancellation_pending",
      })
      .eq("id", id);

    try {
      const { resend } = await import("@/lib/resend");
      await resend.emails.send({
        from: "Jagamn Palace <reservations@jagamnpalace.com>",
        to: [booking.guest_email],
        subject: `Booking Cancelled — ${booking.booking_ref} | Jagamn Palace`,
        html: `<div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;padding:40px;">
          <h1 style="color:#00152A;">Booking Cancellation</h1>
          <p>Dear ${booking.guest_name},</p>
          <p>Your booking <strong>${booking.booking_ref}</strong> has been cancelled.</p>
          <p>Cancellation fee (15%): <strong>$${cancellationFee}</strong></p>
          <p>Refund (85%): <strong>$${refundAmount}</strong> — processed within 5–10 business days.</p>
        </div>`,
      });
    } catch (e) {
      console.error("[cancel] email error:", e);
    }

    return NextResponse.json({
      success: true,
      cancellationFee,
      refundAmount,
      refundStatus,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
