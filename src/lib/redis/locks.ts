/**
 * Distributed lock helpers — server-only.
 *
 * Uses Redis SET key value NX EX ttl.
 * Release uses a Lua check-and-delete so only the lock owner can release it.
 *
 * IMPORTANT: The lock is an OPTIMISATION to reduce collisions and improve UX.
 * The DB no_overlap exclusion constraint (Phase A) is the ABSOLUTE guarantee.
 * If Redis is down, acquireLock returns null (lock skipped) and the constraint
 * does its job.
 *
 * Usage:
 *   const token = await acquireLock("hold:roomId:checkIn:checkOut", 900);
 *   if (!token) { // Redis down or lock held — let DB constraint decide }
 *   // ... payment window ...
 *   await releaseLock("hold:roomId:checkIn:checkOut", token);
 */
import "server-only";
import { randomUUID } from "crypto";
import { safeRedis } from "./client";

/**
 * Attempt to acquire a distributed lock.
 *
 * @param key       Lock key, e.g. "hold:<roomId>:<checkIn>:<checkOut>"
 * @param ttlSeconds  How long the lock is held (auto-expires)
 * @returns  A unique token string if the lock was acquired, or null if the
 *           lock is already held OR Redis is unavailable.
 */
export async function acquireLock(
  key: string,
  ttlSeconds: number,
): Promise<string | null> {
  const token = randomUUID();
  const result = await safeRedis((r) =>
    r.set(key, token, { nx: true, ex: ttlSeconds }),
  );
  // "OK" → acquired; null → already held or Redis down
  return result === "OK" ? token : null;
}

/**
 * Release a lock — only if the stored value matches the token we hold.
 * Uses a Lua script for atomic check-and-delete.
 */
export async function releaseLock(
  key: string,
  token: string,
): Promise<boolean> {
  // Lua: only delete if the value matches our token
  const luaScript = `
    if redis.call("get", KEYS[1]) == ARGV[1] then
      return redis.call("del", KEYS[1])
    else
      return 0
    end
  `;

  const result = await safeRedis(
    (r) => r.eval(luaScript, [key], [token]) as Promise<number>,
  );

  return result === 1;
}

/**
 * Convenience: build the standard room-hold key.
 * Lock is held for 15 minutes (900 s) — the payment window.
 */
export function roomHoldKey(
  roomId: string,
  checkIn: string,
  checkOut: string,
): string {
  return `hold:${roomId}:${checkIn}:${checkOut}`;
}
