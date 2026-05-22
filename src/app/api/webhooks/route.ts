/**
 * POST /api/webhooks — Fapshi webhook handler.
 *
 * Uses the shared confirmBookingFromPayment() helper so confirmation logic
 * is identical whether triggered by webhook, status-poll (Fix 1), or the
 * reconcile queue (Fix 2). Idempotency is enforced inside that helper.
 */
import { NextRequest, NextResponse } from "next/server";
import {
  confirmBookingFromPayment,
  expireBooking,
} from "@/lib/payments/confirm-booking";

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
    };
    const { transId, status, externalId: bookingRef, amount } = body;

    if (!transId || !status) {
      return NextResponse.json(
        { error: "Missing transId or status" },
        { status: 400 },
      );
    }

    if (status === "SUCCESSFUL") {
      // Defense-in-depth: re-verify directly with Fapshi before confirming.
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

      if (bookingRef) {
        await confirmBookingFromPayment({
          provider: "fapshi",
          eventKey: `${transId}:SUCCESSFUL`,
          bookingRef,
          transactionId: transId,
          amount,
          currency: "XAF",
          paymentMethod: "mobile_money",
        });
      }
    } else if (status === "FAILED" || status === "EXPIRED") {
      if (bookingRef) {
        await expireBooking({ bookingRef, transactionId: transId });
      }
    }

    return NextResponse.json({ received: true });
  } catch (err: unknown) {
    console.error("[fapshi-webhook] error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
