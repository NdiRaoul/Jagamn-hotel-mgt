import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import { sendConfirmationEmail } from "@/lib/emails/send-confirmation";
import { isEventProcessed, markEventProcessed } from "@/lib/redis/webhook";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const FAPSHI_BASE_URL =
  process.env.FAPSHI_BASE_URL || "https://sandbox.fapshi.com";

// Fapshi sends a POST with { transId, status, externalId, amount }
// status values: "SUCCESSFUL" | "FAILED" | "EXPIRED"
export async function POST(request: NextRequest) {
  // Fix 5: Authenticate the webhook using the x-wh-secret header.
  // Set FAPSHI_WEBHOOK_SECRET in your env to match the secret configured
  // on the Fapshi dashboard. Reject anything that doesn't match.
  const webhookSecret = process.env.FAPSHI_WEBHOOK_SECRET;
  if (webhookSecret) {
    const incomingSecret = request.headers.get("x-wh-secret");
    if (!incomingSecret || incomingSecret !== webhookSecret) {
      console.warn("[fapshi-webhook] rejected: invalid or missing x-wh-secret");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  } else {
    // Log a warning in production if the secret is not configured
    console.warn(
      "[fapshi-webhook] FAPSHI_WEBHOOK_SECRET is not set — webhook is unauthenticated",
    );
  }

  try {
    const body = await request.json();
    const { transId, status, externalId: bookingRef, amount } = body;

    if (!transId || !status) {
      return NextResponse.json(
        { error: "Missing transId or status" },
        { status: 400 },
      );
    }

    // Idempotency guard — key includes status so SUCCESSFUL and FAILED are
    // treated as distinct events (defense in depth on top of DB upserts).
    const eventKey = `${transId}:${status}`;
    const isDuplicate = await isEventProcessed("fapshi", eventKey);
    if (isDuplicate) {
      return NextResponse.json({ received: true });
    }

    if (status === "SUCCESSFUL") {
      // Defense-in-depth: re-verify the payment status directly with Fapshi
      // before marking the booking paid, so a forged webhook can't trigger a
      // free booking even if the secret check above is somehow bypassed.
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
        const verifyData = await verifyRes.json();
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

      // 1. Mark booking confirmed — only happens here, never at booking creation
      const { data: booking } = await supabaseAdmin
        .from("bookings")
        .update({ payment_status: "paid", status: "confirmed" })
        .eq("booking_ref", bookingRef)
        .select("id, user_id, app_user_id, total_amount")
        .single();

      // 2. Upsert payment record — idempotent on fapshi_trans_id so duplicate
      //    webhook deliveries don't create duplicate rows.
      if (booking) {
        await supabaseAdmin.from("payments").upsert(
          {
            booking_id: booking.id,
            booking_ref: bookingRef,
            // user_id = auth.users id (null for guests — that's fine)
            user_id: booking.user_id,
            // app_user_id = our users table id (exists for BOTH guests and members)
            app_user_id: booking.app_user_id,
            amount: booking.total_amount,
            currency: "XAF",
            payment_method: "mobile_money",
            provider: "fapshi",
            provider_tx_id: transId,
            fapshi_trans_id: transId,
            status: "paid",
          },
          { onConflict: "fapshi_trans_id" },
        );
      }

      // 3. Send the real "Booking Confirmed" email only now that payment succeeded.
      //    Email always goes to booking.guest_email (the address the user typed).
      if (bookingRef) {
        await sendConfirmationEmail(bookingRef);
      }
    } else if (status === "FAILED" || status === "EXPIRED") {
      await supabaseAdmin
        .from("bookings")
        .update({ payment_status: "failed" })
        .eq("booking_ref", bookingRef);
    }

    // Mark as processed in Redis + durable DB table
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
