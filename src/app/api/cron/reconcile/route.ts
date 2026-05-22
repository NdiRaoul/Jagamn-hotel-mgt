/**
 * GET /api/cron/reconcile — Vercel Cron job (Node runtime).
 *
 * Runs every 10 minutes on Pro plan (see vercel.json).
 * On Hobby plan, change the schedule to "0 * * * *" (hourly).
 *
 * What it does:
 *   (a) Find bookings stuck in status = "pending" older than STALE_MINUTES
 *       and mark them "expired", freeing the room.
 *   (b) For any pending booking with a Fapshi transId, call Fapshi
 *       GET /payment-status/:transId and reconcile to paid/failed.
 *   (c) Stale Redis room-holds auto-expire by TTL — no action needed.
 *
 * Security: only accepts requests with
 *   Authorization: Bearer <CRON_SECRET>
 * Vercel automatically sends this header for cron invocations when
 * CRON_SECRET is set in the project environment variables.
 */
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import { sendConfirmationEmail } from "@/lib/emails/send-confirmation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const FAPSHI_BASE_URL =
  process.env.FAPSHI_BASE_URL || "https://sandbox.fapshi.com";

/** Bookings pending longer than this are considered abandoned. */
const STALE_MINUTES = 30;

export async function GET(request: NextRequest) {
  // ── Auth ──────────────────────────────────────────────────────────────────
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    console.error("[cron/reconcile] CRON_SECRET env var is not set");
    return NextResponse.json(
      { error: "Server misconfiguration" },
      { status: 500 },
    );
  }

  const authHeader = request.headers.get("authorization");
  const token = authHeader?.replace(/^Bearer\s+/i, "");
  if (!token || token !== cronSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results = {
    expired: 0,
    reconciled_paid: 0,
    reconciled_failed: 0,
    errors: 0,
  };

  try {
    const staleThreshold = new Date(
      Date.now() - STALE_MINUTES * 60 * 1000,
    ).toISOString();

    // ── (a) Find all stale pending bookings ──────────────────────────────────
    const { data: stalePending, error: fetchError } = await supabaseAdmin
      .from("bookings")
      .select("id, booking_ref, payment_method, created_at")
      .eq("status", "pending")
      .lt("created_at", staleThreshold);

    if (fetchError) {
      console.error("[cron/reconcile] fetch error:", fetchError);
      return NextResponse.json({ error: "DB fetch failed" }, { status: 500 });
    }

    if (!stalePending || stalePending.length === 0) {
      return NextResponse.json({ ...results, message: "Nothing to reconcile" });
    }

    for (const booking of stalePending) {
      try {
        // ── (b) Fapshi reconciliation ──────────────────────────────────────
        // Check if there's a Fapshi payment record for this booking
        const { data: payment } = await supabaseAdmin
          .from("payments")
          .select("fapshi_trans_id, status")
          .eq("booking_ref", booking.booking_ref)
          .eq("provider", "fapshi")
          .maybeSingle();

        if (payment?.fapshi_trans_id) {
          // Re-query Fapshi for the live status
          try {
            const res = await fetch(
              `${FAPSHI_BASE_URL}/payment-status/${payment.fapshi_trans_id}`,
              {
                headers: {
                  apiuser: process.env.FAPSHI_API_USER || "",
                  apikey: process.env.FAPSHI_API_KEY || "",
                },
              },
            );
            const data = await res.json();

            if (res.ok && data.status === "SUCCESSFUL") {
              // Payment succeeded but webhook was missed — reconcile now
              await supabaseAdmin
                .from("bookings")
                .update({ payment_status: "paid", status: "confirmed" })
                .eq("id", booking.id);

              await supabaseAdmin.from("payments").upsert(
                {
                  booking_id: booking.id,
                  booking_ref: booking.booking_ref,
                  fapshi_trans_id: payment.fapshi_trans_id,
                  status: "paid",
                },
                { onConflict: "fapshi_trans_id" },
              );

              await sendConfirmationEmail(booking.booking_ref);
              results.reconciled_paid++;
              continue; // skip expiry for this booking
            } else if (
              res.ok &&
              (data.status === "FAILED" || data.status === "EXPIRED")
            ) {
              await supabaseAdmin
                .from("bookings")
                .update({ payment_status: "failed", status: "expired" })
                .eq("id", booking.id);
              results.reconciled_failed++;
              continue;
            }
          } catch (fapshiErr) {
            console.error(
              "[cron/reconcile] Fapshi status check failed for",
              payment.fapshi_trans_id,
              fapshiErr,
            );
            results.errors++;
          }
        }

        // ── (a) Mark as expired (no payment found or Fapshi still pending) ──
        await supabaseAdmin
          .from("bookings")
          .update({ status: "expired" })
          .eq("id", booking.id);
        results.expired++;
      } catch (bookingErr) {
        console.error(
          "[cron/reconcile] error processing booking",
          booking.booking_ref,
          bookingErr,
        );
        results.errors++;
      }
    }

    console.log("[cron/reconcile] completed:", results);
    return NextResponse.json(results);
  } catch (err) {
    console.error("[cron/reconcile] unexpected error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
