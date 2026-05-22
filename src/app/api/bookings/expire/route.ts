/**
 * POST /api/bookings/expire
 *
 * Event-driven booking expiry — called in two ways:
 *
 *   1. By the payment route when a payment definitively fails/times out.
 *   2. By a Supabase Database Webhook (pg_net / HTTP trigger) fired by the
 *      PostgreSQL trigger `trg_notify_stale_booking` when a booking row
 *      has been pending for longer than the payment window.
 *
 * WHY THIS REPLACES CRON:
 * ─────────────────────────────────────────────────────────────────────────────
 * Instead of "scan every N minutes for stale bookings", we use two
 * complementary event sources:
 *
 *   A. Redis TTL — the room hold key (lock:room:*) auto-expires after 15 min.
 *      This immediately frees the room for new bookings without any DB write.
 *      The booking row stays "pending" but is harmless — no room is blocked.
 *
 *   B. This route — called by a DB trigger via Supabase's pg_net extension
 *      (HTTP call from inside Postgres) when a booking has been pending for
 *      > PAYMENT_WINDOW_SECONDS. It writes the "expired" status to Postgres
 *      so dashboards and reports show the correct state.
 *
 * The combination means:
 *   - Room availability is restored within seconds (Redis TTL)
 *   - Booking status is corrected within the same window (DB trigger → this route)
 *   - No polling, no cron, no scheduled jobs
 *
 * SECURITY:
 * This route is protected by INTERNAL_WEBHOOK_SECRET so only our own
 * infrastructure (the DB trigger via pg_net) can call it.
 * Set INTERNAL_WEBHOOK_SECRET to a random 32+ char string in env vars.
 */
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import { invalidate } from "@/lib/redis/cache";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  // ── Auth ──────────────────────────────────────────────────────────────────
  const secret = process.env.INTERNAL_WEBHOOK_SECRET;
  if (!secret) {
    console.error("[bookings/expire] INTERNAL_WEBHOOK_SECRET not set");
    return NextResponse.json(
      { error: "Server misconfiguration" },
      { status: 500 },
    );
  }

  const authHeader = request.headers.get("authorization");
  const token = authHeader?.replace(/^Bearer\s+/i, "");
  if (!token || token !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ── Body ──────────────────────────────────────────────────────────────────
  let bookingId: string | undefined;
  let bookingRef: string | undefined;

  try {
    const body = (await request.json()) as {
      bookingId?: string;
      bookingRef?: string;
    };
    bookingId = body.bookingId;
    bookingRef = body.bookingRef;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!bookingId && !bookingRef) {
    return NextResponse.json(
      { error: "bookingId or bookingRef required" },
      { status: 400 },
    );
  }

  try {
    // Only expire if still pending — idempotent, safe to call multiple times
    const query = supabaseAdmin
      .from("bookings")
      .update({ status: "expired" })
      .eq("status", "pending")
      .select("id, booking_ref, room_slug, room_id, check_in, check_out");

    if (bookingId) query.eq("id", bookingId);
    else if (bookingRef) query.eq("booking_ref", bookingRef);

    const { data: expired, error } = await query;

    if (error) {
      console.error("[bookings/expire] DB update error:", error);
      return NextResponse.json({ error: "DB error" }, { status: 500 });
    }

    // Invalidate availability cache for each expired booking's room.
    for (const b of expired ?? []) {
      await invalidate(`availability:slug:${b.room_slug}`);
      await invalidate(`roomtype:slug:${b.room_slug}`);
    }

    return NextResponse.json({
      expired: expired?.length ?? 0,
      ids: expired?.map((b) => b.id) ?? [],
    });
  } catch (err) {
    console.error("[bookings/expire] unexpected error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
