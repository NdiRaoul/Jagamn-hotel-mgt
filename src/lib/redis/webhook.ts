/**
 * Webhook idempotency helpers — server-only.
 *
 * Fast path: Redis SET NX with 24-hour TTL.
 * Fallback (Redis down): insert into webhook_events table (unique on
 *   provider + event_key). A unique-violation means it's a duplicate.
 *
 * Usage:
 *   const dup = await isEventProcessed("stripe", event.id);
 *   if (dup) return 200 without re-processing;
 *   await markEventProcessed("stripe", event.id);
 *   // ... process ...
 */
import "server-only";
import { safeRedis } from "./client";
import { supabaseAdmin } from "@/lib/supabase-server";

const TTL_SECONDS = 86_400; // 24 hours

function redisKey(provider: string, eventKey: string): string {
  return `webhook:${provider}:${eventKey}`;
}

/**
 * Returns true if this event has already been processed (duplicate).
 * Uses Redis SET NX as the fast path; falls back to the webhook_events
 * table when Redis is unavailable.
 */
export async function isEventProcessed(
  provider: string,
  eventKey: string,
): Promise<boolean> {
  const key = redisKey(provider, eventKey);

  // Fast path — Redis SET NX: returns "OK" on first set, null if key existed
  const result = await safeRedis((r) =>
    r.set(key, "1", { nx: true, ex: TTL_SECONDS }),
  );

  if (result !== null) {
    // Redis responded: "OK" means first time, null means already existed
    return result !== "OK";
  }

  // Redis is down — fall back to the durable webhook_events table
  return isEventProcessedInDb(provider, eventKey);
}

/**
 * Mark an event as processed in the durable fallback table.
 * Call this AFTER successfully processing the event so that if Redis is
 * down the DB record acts as the permanent dedup record.
 */
export async function markEventProcessed(
  provider: string,
  eventKey: string,
): Promise<void> {
  // Best-effort Redis write (may already be set from isEventProcessed)
  const key = redisKey(provider, eventKey);
  await safeRedis((r) => r.set(key, "1", { ex: TTL_SECONDS }));

  // Always write to the durable table as the permanent record
  await markEventProcessedInDb(provider, eventKey);
}

// ── DB fallback ───────────────────────────────────────────────────────────────

async function isEventProcessedInDb(
  provider: string,
  eventKey: string,
): Promise<boolean> {
  try {
    const { data } = await supabaseAdmin
      .from("webhook_events")
      .select("id")
      .eq("provider", provider)
      .eq("event_key", eventKey)
      .maybeSingle();
    return data !== null;
  } catch (err) {
    console.error("[redis/webhook] DB fallback check failed:", err);
    // On DB error, allow processing (better to process twice than miss)
    return false;
  }
}

async function markEventProcessedInDb(
  provider: string,
  eventKey: string,
): Promise<void> {
  try {
    await supabaseAdmin
      .from("webhook_events")
      .insert({ provider, event_key: eventKey })
      .throwOnError();
  } catch (err: unknown) {
    // Unique violation (23505) means it was already recorded — that's fine
    const code = (err as { code?: string }).code;
    if (code !== "23505") {
      console.error("[redis/webhook] DB fallback insert failed:", err);
    }
  }
}
