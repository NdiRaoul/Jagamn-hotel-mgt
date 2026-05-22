/**
 * Upstash Redis singleton — server-only.
 *
 * Layer order: Upstash → Supabase (source of truth) → Next.js cache.
 * Lock → rely on the DB no_overlap constraint if Redis is down.
 * Rate-limit → fail-open if Redis is down.
 * Webhook dedup → fall back to the webhook_events table
 *   (unique provider+event_key) if Redis is down.
 *
 * CRITICAL: Redis is NEVER the source of truth. Postgres + Stripe/Fapshi are.
 * Every Redis call is wrapped in try/catch; on error the app continues normally.
 */
import "server-only";
import { Redis } from "@upstash/redis";

let _redis: Redis | null = null;

/** True when the singleton was successfully created from env vars. */
export let redisAvailable = false;

function getRedis(): Redis | null {
  if (_redis) return _redis;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    // Env vars not set — Redis layer is disabled; app works without it.
    return null;
  }

  try {
    _redis = new Redis({ url, token });
    redisAvailable = true;
    return _redis;
  } catch (err) {
    console.error("[redis/client] failed to create Redis client:", err);
    return null;
  }
}

/**
 * Execute a Redis operation safely.
 * Returns `null` (and logs) on any error so callers can fall through to
 * the next layer without crashing.
 */
export async function safeRedis<T>(
  fn: (r: Redis) => Promise<T>,
): Promise<T | null> {
  const r = getRedis();
  if (!r) return null;
  try {
    return await fn(r);
  } catch (err) {
    console.error("[redis/client] operation failed (degraded mode):", err);
    redisAvailable = false; // mark degraded for this request
    return null;
  }
}

export { getRedis };
