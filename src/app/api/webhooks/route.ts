/**
 * POST /api/webhooks — Fapshi webhook handler.
 *
 * Uses the shared confirmBookingFromPayment() helper so confirmation logic
 * is identical whether triggered by webhook, status-poll (Fix 1), or the
 * reconcile queue (Fix 2). Idempotency is enforced inside that helper.
 */
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import {
  confirmBookingFromPayment,
  expireBooking,
} from "@/lib/payments/confirm-booking";
import { appendEvent } from "@/lib/payments/ledger";
import { isEventProcessed, markEventProcessed } from "@/lib/redis/webhook";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const FAPSHI_BASE_URL =
  process.env.FAPSHI_BASE_URL || "https://sandbox.fapshi.com";

// Fapshi sends a POST with { transId, status, externalId, amount }
// status values: "SUCCESSFUL" | "FAILED" | "EXPIRED"
export async function POST(request: NextRequest) {
  // Authenticate using the x-wh-secret header.
  const webhookSecret = process.env.FAPSHI_WEBHOOK_SECRET;
  if (webhookSecret) {
    const incomingSecret = request.headers.get("x-wh-secret");
    if (!incomingSecret || incomingSecret !== webhookSecret) {
      console.warn("[fapshi-webhook] rejected: invalid or missing x-wh-secret");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  } else {
    console.warn(
      "[fapshi-webhook] FAPSHI_WEBHOOK_SECRET is not set — webhook is unauthenticated",
    );
  }

  try {
    const body = (await request.json()) as {
      transId?: string;
      status?: string;
      externalId?: string;
      amount?: number;
      refundId?: string;
      type?: string;
    };
    const {
      transId,
      status,
      externalId: bookingRef,
      amount,
      refundId,
      type,
    } = body;

    if (!transId || !status) {
      return NextResponse.json(
        { error: "Missing transId or status" },
        { status: 400 },
      );
    }

    const eventKey = `fapshi:${transId}:${status}`;
    const duplicate = await isEventProcessed("fapshi", eventKey);
    if (duplicate) {
      return NextResponse.json({ received: true });
    }

    let { data: ledger } = await supabaseAdmin
      .from("payment_ledger")
      .select("id, booking_ref")
      .eq("processor_ref", transId)
      .maybeSingle();

    if (!ledger && bookingRef) {
      const fallback = await supabaseAdmin
        .from("payment_ledger")
        .select("id, booking_ref")
        .eq("booking_ref", bookingRef)
        .maybeSingle();
      ledger = fallback.data ?? null;
    }

    const resolvedBookingRef = bookingRef ?? ledger?.booking_ref;

    if (status === "SUCCESSFUL") {
      try {
        const verifyRes = await fetch(
          `${FAPSHI_BASE_URL}/payment-status/${transId}`,
          {
            headers: {
              apiuser: process.env.FAPSHI_API_USER || "",
              apikey: process.env.FAPSHI_API_KEY || "",
            },
          },
        );
        const verifyData = (await verifyRes.json()) as { status?: string };
        if (!verifyRes.ok || verifyData.status !== "SUCCESSFUL") {
          console.warn(
            "[fapshi-webhook] re-verification failed for transId:",
            transId,
            verifyData,
          );
          return NextResponse.json(
            { error: "Payment verification failed" },
            { status: 400 },
          );
        }
      } catch (verifyErr) {
        console.error("[fapshi-webhook] re-verification error:", verifyErr);
        return NextResponse.json(
          { error: "Could not verify payment" },
          { status: 500 },
        );
      }

      if (ledger?.id) {
        await appendEvent(ledger.id, "processor_succeeded", {
          source: "webhook",
          payload: { transId, amount },
        });
      }

      if (resolvedBookingRef) {
        await confirmBookingFromPayment({
          provider: "fapshi",
          eventKey: `${transId}:SUCCESSFUL`,
          bookingRef: resolvedBookingRef,
          transactionId: transId,
          amount,
          currency: "XAF",
          paymentMethod: "mobile_money",
        });
      }
    } else if (status === "FAILED" || status === "EXPIRED") {
      if (ledger?.id) {
        await appendEvent(ledger.id, "processor_failed", {
          source: "webhook",
          payload: { transId, amount },
        });
      }
      if (resolvedBookingRef) {
        await expireBooking({
          bookingRef: resolvedBookingRef,
          transactionId: transId,
        });
      }
    }

    await markEventProcessed("fapshi", eventKey);
    return NextResponse.json({ received: true });
  } catch (err: unknown) {
    console.error("[fapshi-webhook] error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
