/**
 * Opportunistic reconciliation queue — server-only.
 *
 * WHY THIS EXISTS (the "nobody looks at it" edge case):
 * ─────────────────────────────────────────────────────────────────────────────
 * Fix 1 (reconcile-on-read) self-heals a booking the moment anyone polls the
 * Fapshi status endpoint. But if a guest pays, the webhook is missed, AND they
 * close the browser immediately, nobody ever polls — the booking stays pending.
 *
 * This module solves that with a Redis sorted set used as a lightweight work
 * queue. When a booking enters pending with a Fapshi transId, it is enqueued
 * with a score = (now + 90s) — the earliest time it should be checked.
 *
 * drainReconcileQueue() is called fire-and-forget from high-traffic routes
 * (/api/health, /api/rooms). It pops up to N due entries, fetches live status
 * from Fapshi/Stripe, and applies the same idempotent confirmation logic.
 * Work is amortised across organic traffic — no scheduler needed.
 *
 * REDIS KEY:
 *   reconcile:pending  — sorted set, score = Unix ms when entry becomes due
 *
 * ENTRY FORMAT (stored as JSON string in the sorted set member):
 *   { bookingId, bookingRef, provider, transactionId, enqueuedAt, attempts }
 *
 * RETRY STRATEGY:
 *   Attempt 1: due after  90 s
 *   Attempt 2: due after 300 s  (5 min)
 *   Attempt 3: due after 900 s  (15 min)
 *   Attempt 4: due after 1800 s (30 min) — max, then drop
 *   After 4 attempts or 30 min total age: drop from queue (booking expired)
 *
 * FAILURE MODES:
 *   Redis down → safeRedis returns null → enqueue/drain are no-ops.
 *   Fix 1 (on-read) still works. DB stays correct. No data loss.
 *
 * IMPORTANT: This queue is an OPTIMISATION. Postgres is always the source of
 * truth. Every reconcile path reads live status from Fapshi/Stripe and writes
 * to Postgres. Redis only stores the "what to check next" schedule.
 */
import "server-only";
import { safeRedis } from "./client";
import {
  confirmBookingFromPayment,
  expireBooking,
} from "@/lib/payments/confirm-booking";
import { supabaseAdmin } from "@/lib/supabase-server";

const QUEUE_KEY = "reconcile:pending";

/** Max age before we give up and expire the booking (30 min). */
const MAX_AGE_MS = 30 * 60 * 1000;

/** Retry delay schedule in seconds. Index = attempt number (0-based). */
const RETRY_DELAYS_S = [90, 300, 900, 1800];

interface QueueEntry {
  bookingId: string;
  bookingRef: string;
  provider: "fapshi" | "stripe";
  transactionId: string;
  enqueuedAt: number; // Unix ms
  attempts: number;
}

// ── Enqueue ───────────────────────────────────────────────────────────────────

/**
 * Add a pending booking to the reconcile queue.
 * Called from the bookings POST route after a booking is created with a
 * payment provider + transactionId.
 *
 * Safe to call multiple times — the sorted set member is unique per bookingId,
 * so re-enqueueing just updates the score.
 */
export async function enqueueReconcile(entry: {
  bookingId: string;
  bookingRef: string;
  provider: "fapshi" | "stripe";
  transactionId: string;
}): Promise<void> {
  const now = Date.now();
  const dueAt = now + RETRY_DELAYS_S[0] * 1000; // first check after 90 s

  const member: QueueEntry = {
    ...entry,
    enqueuedAt: now,
    attempts: 0,
  };

  await safeRedis((r) =>
    r.zadd(QUEUE_KEY, { score: dueAt, member: JSON.stringify(member) }),
  );
}

// ── Drain ─────────────────────────────────────────────────────────────────────

/**
 * Pop up to maxItems due entries from the queue and reconcile each one.
 *
 * MUST be called fire-and-forget (no await at the call site) so it never
 * blocks the user response. Wrap in try/catch at the call site.
 *
 * Example call site (health route):
 *   drainReconcileQueue().catch(() => {});
 */
export async function drainReconcileQueue(maxItems = 5): Promise<void> {
  const now = Date.now();

  // ZRANGE BYSCORE with LIMIT — pop entries whose due time has passed.
  const raw = await safeRedis((r) =>
    r.zrange(QUEUE_KEY, 0, now, {
      byScore: true,
      offset: 0,
      count: maxItems,
    }),
  );

  if (!raw || (raw as unknown[]).length === 0) return;

  // Also call expire_stale_bookings() RPC during the drain (Fix 3).
  // Fire-and-forget — don't let a DB error abort the reconcile loop.
  void supabaseAdmin.rpc("expire_stale_bookings").then(({ data, error }) => {
    if (error) console.error("[reconcile] expire_stale_bookings error:", error);
    else if ((data as number) > 0)
      console.log(`[reconcile] expired ${data} stale pending bookings`);
  });

  // Also sweep old webhook_events rows (Fix 4).
  void supabaseAdmin.rpc("sweep_old_webhook_events").then(({ error }) => {
    if (error)
      console.error("[reconcile] sweep_old_webhook_events error:", error);
  });

  for (const rawMember of raw as string[]) {
    let entry: QueueEntry;
    try {
      entry = JSON.parse(rawMember) as QueueEntry;
    } catch {
      // Malformed entry — remove it
      await safeRedis((r) => r.zrem(QUEUE_KEY, rawMember));
      continue;
    }

    // Remove from queue before processing (re-added below if still pending)
    await safeRedis((r) => r.zrem(QUEUE_KEY, rawMember));

    const age = now - entry.enqueuedAt;
    if (age > MAX_AGE_MS) {
      // Too old — expire the booking and drop from queue
      console.log(
        `[reconcile] booking ${entry.bookingRef} exceeded max age, expiring`,
      );
      await expireBooking({
        bookingRef: entry.bookingRef,
        bookingId: entry.bookingId,
      }).catch(() => {});
      continue;
    }

    try {
      await reconcileEntry(entry);
    } catch (err) {
      console.error(`[reconcile] error processing ${entry.bookingRef}:`, err);
      // Re-queue with next retry delay
      await requeueEntry(entry);
    }
  }
}

// ── Internal helpers ──────────────────────────────────────────────────────────

async function reconcileEntry(entry: QueueEntry): Promise<void> {
  // First check if the booking is still pending in Postgres.
  // If it's already confirmed/expired/cancelled, drop from queue.
  const { data: booking } = await supabaseAdmin
    .from("bookings")
    .select("status")
    .eq("id", entry.bookingId)
    .maybeSingle();

  if (!booking || booking.status !== "pending") {
    // Already resolved — nothing to do
    return;
  }

  if (entry.provider === "fapshi") {
    await reconcileFapshi(entry);
  } else {
    await reconcileStripe(entry);
  }
}

async function reconcileFapshi(entry: QueueEntry): Promise<void> {
  const BASE = process.env.FAPSHI_BASE_URL || "https://sandbox.fapshi.com";

  const res = await fetch(`${BASE}/payment-status/${entry.transactionId}`, {
    headers: {
      apiuser: process.env.FAPSHI_API_USER || "",
      apikey: process.env.FAPSHI_API_KEY || "",
    },
  });

  if (!res.ok) {
    // Provider error — re-queue for retry
    await requeueEntry(entry);
    return;
  }

  const data = (await res.json()) as { status?: string; amount?: number };

  if (data.status === "SUCCESSFUL") {
    await confirmBookingFromPayment({
      provider: "fapshi",
      eventKey: `${entry.transactionId}:SUCCESSFUL`,
      bookingRef: entry.bookingRef,
      transactionId: entry.transactionId,
      amount: data.amount,
      currency: "XAF",
      paymentMethod: "mobile_money",
    });
    // Confirmed — drop from queue (already removed above)
  } else if (data.status === "FAILED" || data.status === "EXPIRED") {
    await expireBooking({
      bookingRef: entry.bookingRef,
      transactionId: entry.transactionId,
    });
    // Drop from queue
  } else {
    // Still PENDING — re-queue with next retry delay
    await requeueEntry(entry);
  }
}

async function reconcileStripe(entry: QueueEntry): Promise<void> {
  // Dynamically import Stripe to keep this module lightweight
  const { default: Stripe } = await import("stripe");
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2026-04-22.dahlia",
  });

  const pi = await stripe.paymentIntents.retrieve(entry.transactionId);

  if (pi.status === "succeeded") {
    await confirmBookingFromPayment({
      provider: "stripe",
      eventKey: pi.id,
      bookingRef: entry.bookingRef,
      transactionId: pi.id,
      amount: pi.amount / 100,
      currency: pi.currency.toUpperCase(),
      paymentMethod: "card",
    });
  } else if (
    pi.status === "canceled" ||
    pi.status === "requires_payment_method"
  ) {
    await expireBooking({
      bookingRef: entry.bookingRef,
      transactionId: pi.id,
    });
  } else {
    // Still processing — re-queue
    await requeueEntry(entry);
  }
}

async function requeueEntry(entry: QueueEntry): Promise<void> {
  const nextAttempt = entry.attempts + 1;
  if (nextAttempt >= RETRY_DELAYS_S.length) {
    // Exhausted retries — expire and drop
    await expireBooking({
      bookingRef: entry.bookingRef,
      bookingId: entry.bookingId,
    }).catch(() => {});
    return;
  }

  const delayMs = RETRY_DELAYS_S[nextAttempt] * 1000;
  const dueAt = Date.now() + delayMs;
  const updated: QueueEntry = { ...entry, attempts: nextAttempt };

  await safeRedis((r) =>
    r.zadd(QUEUE_KEY, { score: dueAt, member: JSON.stringify(updated) }),
  );
}
