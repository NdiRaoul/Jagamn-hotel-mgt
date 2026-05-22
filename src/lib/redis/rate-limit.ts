/**
 * Upstash sliding-window rate limiters — server-only.
 *
 * Fail-open: if Redis is unavailable, all limiters return { success: true }
 * so the app keeps working without Redis.
 *
 * Named limiters:
 *   bookingLimiter     — 5 requests / 60 s per IP
 *   authLimiter        — 10 requests / 60 s per IP  (login, forgot-password)
 *   checkEmailLimiter  — 10 requests / 60 s per IP  (check-email endpoint)
 *   paymentLimiter     — 10 requests / 60 s per IP  (payment initiation)
 */
import "server-only";
import { Ratelimit } from "@upstash/ratelimit";
import { getRedis } from "./client";

interface LimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

/** Fail-open result used when Redis is unavailable. */
const ALLOW: LimitResult = { success: true, limit: 0, remaining: 0, reset: 0 };

function makeLimiter(requests: number, windowSeconds: number) {
  return {
    async limit(identifier: string): Promise<LimitResult> {
      const redis = getRedis();
      if (!redis) return ALLOW;

      try {
        const rl = new Ratelimit({
          redis,
          limiter: Ratelimit.slidingWindow(requests, `${windowSeconds} s`),
          prefix: "rl",
        });
        const result = await rl.limit(identifier);
        return result;
      } catch (err) {
        console.error("[redis/rate-limit] error (fail-open):", err);
        return ALLOW;
      }
    },
  };
}

export const bookingLimiter = makeLimiter(5, 60);
export const authLimiter = makeLimiter(10, 60);
export const checkEmailLimiter = makeLimiter(10, 60);
export const paymentLimiter = makeLimiter(10, 60);
