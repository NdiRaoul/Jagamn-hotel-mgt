/**
 * Distributed locks + booking-session TTL — server-only.
 *
 * WHY NO CRON:
 * ─────────────────────────────────────────────────────────────────────────────
 * Cron-based expiry is fundamentally broken for booking systems:
 *   • It runs on a fixed interval (e.g. every 10 min), so a booking can stay
 *     "pending" for up to 10 minutes after it should have expired — during
 *     which the room appears unavailable to other guests.
 *   • Under concurrent load, multiple cron workers can race to expire the same
 *     booking, causing duplicate state transitions.
 *   • Cron adds operational complexity (secrets, schedules, monitoring) for
 *     something that can be solved purely in the data layer.
 *
 * EVENT-DRIVEN REPLACEMENT:
 * ─────────────────────────────────────────────────────────────────────────────
 * 1. Redis TTL (this file) — room holds and booking sessions auto-expire.
 *    When a guest abandons checkout, the Redis hold key simply disappears
 *    after TTL seconds. No scan, no job, no delay.
 *
 * 2. PostgreSQL trigger (see schema-additions.sql) — a DB-level trigger fires
 *    on booking INSERT and sets a pg_notify event. A Supabase Realtime
 *    subscription in the booking route listens and can expire the row if
 *    payment never arrives within the window.
 *
 * 3. Webhook-driven confirmation — Stripe and Fapshi call our webhook the
 *    moment payment settles. We confirm or expire the booking immediately,
 *    not on the next cron tick.
 *
 * LOCK GUARANTEE:
 * ─────────────────────────────────────────────────────────────────────────────
 * Redis locks are an OPTIMISATION — they prevent two users from even starting
 * payment on the same room+dates simultaneously, improving UX.
 * The PostgreSQL no_overlap exclusion constraint is the ABSOLUTE guarantee.
 * If Redis is down, acquireLock returns null → we skip the lock and let the
 * DB constraint reject any true double-booking.
 *
 * KEY NAMING CONVENTIONS:
 *   lock:room:<roomId>:<checkIn>:<checkOut>   — room hold during payment (15 min)
 *   session:booking:<bookingId>               — pending booking session (15 min)
 *
 * TTL RECOMMENDATIONS:
 *   Room hold:       900 s  (15 min) — matches typical payment timeout
 *   Booking session: 900 s  (15 min) — same window
 *   Webhook dedup:  86400 s (24 h)   — see webhook.ts
 *   Room type cache: 300 s  (5 min)  — see cache.ts
 *   Availability:    60 s   (1 min)  — see cache.ts
 */
import "server-only";
import { randomUUID } from "crypto";
import { safeRedis } from "./client";

// ── TTL constants ─────────────────────────────────────────────────────────────

/** Payment window: how long a room is held while a guest completes checkout. */
export const PAYMENT_WINDOW_SECONDS = 900; // 15 minutes

// ── Key builders ──────────────────────────────────────────────────────────────

/** Redis key for a room hold during the payment window. */
export function roomHoldKey(
  roomId: string,
  checkIn: string,
  checkOut: string,
): string {
  return `lock:room:${roomId}:${checkIn}:${checkOut}`;
}

/** Redis key for a pending booking session. */
export function bookingSessionKey(bookingId: string): string {
  return `session:booking:${bookingId}`;
}

// ── Distributed lock ──────────────────────────────────────────────────────────

/**
 * Attempt to acquire a distributed lock using SET NX EX.
 *
 * Returns a unique token if acquired, or null if:
 *   - the lock is already held by another request, OR
 *   - Redis is unavailable (fail-open: let the DB constraint decide)
 *
 * The token MUST be passed to releaseLock to prevent another holder from
 * accidentally releasing a lock they don't own.
 */
export async function acquireLock(
  key: string,
  ttlSeconds: number = PAYMENT_WINDOW_SECONDS,
): Promise<string | null> {
  const token = randomUUID();
  const result = await safeRedis((r) =>
    r.set(key, token, { nx: true, ex: ttlSeconds }),
  );
  // "OK" → acquired; null → already held or Redis down
  return result === "OK" ? token : null;
}

/**
 * Release a lock atomically — only if the stored value matches our token.
 *
 * Uses a Lua check-and-delete so we never accidentally release a lock
 * that was re-acquired by a different request after our TTL expired.
 *
 * Returns true if the lock was released, false if it was already gone
 * or owned by someone else.
 */
export async function releaseLock(
  key: string,
  token: string,
): Promise<boolean> {
  const lua = `
    if redis.call("get", KEYS[1]) == ARGV[1] then
      return redis.call("del", KEYS[1])
    else
      return 0
    end
  `;
  const result = await safeRedis(
    (r) => r.eval(lua, [key], [token]) as Promise<number>,
  );
  return result === 1;
}

// ── Booking session (replaces cron-based expiry) ──────────────────────────────

/**
 * Register a pending booking session in Redis with a TTL.
 *
 * WHY THIS REPLACES CRON:
 * When the TTL expires, the key simply disappears. The booking row in
 * Postgres remains in "pending" state, but:
 *   1. The room hold (lock:room:*) also expires, so new bookings can proceed.
 *   2. The Stripe/Fapshi webhook will never arrive for an abandoned session,
 *      so the booking stays "pending" indefinitely — harmless, because the
 *      room is freed by the lock expiry.
 *   3. The PostgreSQL trigger (trg_expire_stale_booking) fires on the next
 *      write to the bookings table and marks truly stale rows "expired" as
 *      a background cleanup — no polling required.
 *
 * The session value stores the room hold token so we can release it
 * explicitly if the user cancels before the TTL fires.
 */
export async function registerBookingSession(
  bookingId: string,
  roomHoldToken: string | null,
  ttlSeconds: number = PAYMENT_WINDOW_SECONDS,
): Promise<void> {
  const key = bookingSessionKey(bookingId);
  const value = JSON.stringify({ roomHoldToken, createdAt: Date.now() });
  await safeRedis((r) => r.set(key, value, { ex: ttlSeconds }));
}

/**
 * Explicitly expire a booking session (e.g. user cancels checkout).
 * Also releases the associated room hold if a token is stored.
 */
export async function expireBookingSession(
  bookingId: string,
  roomId: string,
  checkIn: string,
  checkOut: string,
): Promise<void> {
  const sessionKey = bookingSessionKey(bookingId);

  // Read the stored token before deleting
  const raw = await safeRedis((r) => r.get<string>(sessionKey));
  if (raw) {
    try {
      const { roomHoldToken } = JSON.parse(raw) as {
        roomHoldToken: string | null;
      };
      if (roomHoldToken) {
        await releaseLock(
          roomHoldKey(roomId, checkIn, checkOut),
          roomHoldToken,
        );
      }
    } catch {
      // Malformed value — safe to ignore, TTL will clean up
    }
  }

  await safeRedis((r) => r.del(sessionKey));
}

/**
 * Check whether a booking session is still active (i.e. within the payment
 * window). Returns false if the session has expired or Redis is down.
 *
 * Used by the payment initiation routes to reject payment attempts on
 * sessions that have already timed out.
 */
export async function isBookingSessionActive(
  bookingId: string,
): Promise<boolean> {
  const key = bookingSessionKey(bookingId);
  const exists = await safeRedis((r) => r.exists(key));
  // exists returns 1 if key present, 0 if not, null if Redis down
  // Fail-open: if Redis is down, allow the payment attempt (DB will validate)
  return exists === null ? true : exists === 1;
}
