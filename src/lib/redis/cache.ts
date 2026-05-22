/**
 * Three-layer cache-aside helpers — server-only.
 *
 * Layer order (fastest → authoritative):
 *   1. Upstash Redis  — shared, sub-ms under load
 *   2. Next.js unstable_cache — per-deployment in-process cache
 *   3. Supabase (loader fn) — always correct, source of truth
 *
 * When Redis is healthy:
 *   Redis hit → return immediately.
 *   Redis miss → run loader (wrapped in unstable_cache), write back to Redis.
 *
 * When Redis is DOWN or throws:
 *   Skip Redis, run the unstable_cache-wrapped loader directly.
 *   Supabase is always correct; Next.js cache absorbs repeat reads.
 *
 * NEVER cache: payment status, booking status, money-received decisions,
 * auth/session — always live from Postgres/Stripe/Fapshi.
 *
 * Key naming: entity:scope:id
 *   e.g. roomtype:slug:maharaja-suite
 *        availability:<slug>:<checkIn>:<checkOut>
 *
 * TTLs:
 *   room-type detail  300 s
 *   availability       30–60 s
 *   pricing           300 s
 *   dashboard stats    60–120 s
 */
import "server-only";
import { unstable_cache, revalidateTag } from "next/cache";

// Next.js 16 revalidateTag requires a second "profile" argument.
// We pass an empty config object to satisfy the signature while keeping
// the default revalidation behaviour.
const revalidate = (tag: string) => revalidateTag(tag, {});
import { safeRedis } from "./client";

// ── helpers ──────────────────────────────────────────────────────────────────

/** Derive a stable Next.js cache tag from a Redis key. */
function tagFromKey(key: string): string {
  // e.g. "roomtype:slug:maharaja-suite" → "roomtype"
  return key.split(":")[0] ?? key;
}

/**
 * Wrap a loader in Next.js unstable_cache so that even when Redis is down,
 * repeated reads within the revalidate window are served from the platform
 * cache without hitting Supabase every time.
 */
function withNextCache<T>(
  loader: () => Promise<T | null>,
  key: string,
  ttlSeconds: number,
): () => Promise<T | null> {
  return unstable_cache(loader, [key], {
    revalidate: ttlSeconds,
    tags: [tagFromKey(key), key],
  });
}

// ── public API ────────────────────────────────────────────────────────────────

/**
 * getCached<T>(key, ttlSeconds, loader)
 *
 * Tries layers in order:
 *   1. Upstash Redis
 *   2. Next.js unstable_cache-wrapped Supabase loader
 *
 * Returns the first successful result, or null if all layers fail.
 */
export async function getCached<T>(
  key: string,
  ttlSeconds: number,
  loader: () => Promise<T | null>,
): Promise<T | null> {
  // Layer 1 — Upstash Redis
  const cached = await safeRedis<T | null>((r) => r.get<T>(key));
  if (cached !== null && cached !== undefined) {
    return cached;
  }

  // Layer 2 — Next.js unstable_cache + Supabase (source of truth)
  const cachedLoader = withNextCache(loader, key, ttlSeconds);
  const value = await cachedLoader();

  if (value !== null && value !== undefined) {
    // Populate Redis for the next request (best-effort, non-blocking)
    safeRedis((r) => r.set(key, value, { ex: ttlSeconds })).catch(() => {});
  }

  return value ?? null;
}

/**
 * setCached — explicitly write a value to Redis (and let Next.js cache
 * handle itself via getCached on the next read).
 */
export async function setCached<T>(
  key: string,
  value: T,
  ttlSeconds: number,
): Promise<void> {
  await safeRedis((r) => r.set(key, value, { ex: ttlSeconds }));
}

/**
 * invalidate — clear a single key from Redis and revalidate the
 * corresponding Next.js cache tag.
 */
export async function invalidate(key: string): Promise<void> {
  await safeRedis((r) => r.del(key));
  try {
    revalidate(key);
    revalidate(tagFromKey(key));
  } catch {
    // revalidateTag throws outside a request context — safe to ignore
  }
}
/**
 * invalidateByPrefix — clear all Redis keys matching a prefix pattern
 * and revalidate the corresponding Next.js tag.
 *
 * Uses SCAN to avoid blocking the Redis server.
 */
export async function invalidateByPrefix(prefix: string): Promise<void> {
  await safeRedis(async (r) => {
    let cursor = 0;
    do {
      const [nextCursor, keys] = await r.scan(cursor, {
        match: `${prefix}*`,
        count: 100,
      });
      cursor = Number(nextCursor);
      if (keys.length > 0) {
        // del requires at least one key — guaranteed by the length check above
        const [first, ...rest] = keys as string[];
        await r.del(first, ...rest);
      }
    } while (cursor !== 0);
    return null;
  });

  try {
    revalidate(prefix.replace(/:$/, ""));
  } catch {
    // safe to ignore outside request context
  }
}
