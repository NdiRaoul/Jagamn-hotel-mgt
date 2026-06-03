/**
 * Pure, dependency-free session-timeout constants and helpers.
 *
 * IMPORTANT: this module must stay free of `next/headers`, `next/server`, and
 * any Node-only API so it can be imported from BOTH client components (the idle
 * hook / session guard) and server code (proxy.ts, route handlers).
 */

export const IDLE_TIMEOUT_MINUTES = 20;
export const IDLE_TIMEOUT_MS = IDLE_TIMEOUT_MINUTES * 60 * 1000;
/** Show the "still there?" warning this long before the hard logout. */
export const IDLE_WARNING_MS = 60 * 1000;
export const ACTIVITY_COOKIE_NAME = "staff_last_activity";

/** Parse the activity cookie value into a millisecond timestamp, or null. */
export function parseLastActivity(
  value: string | undefined | null,
): number | null {
  if (!value) return null;
  const ts = parseInt(value, 10);
  return Number.isFinite(ts) ? ts : null;
}

/**
 * Returns true when the last-activity timestamp is older than the idle window.
 * An absent / unparseable timestamp is treated as NOT expired (a fresh login
 * has not written the cookie yet, so it must be allowed).
 */
export function isIdleExpired(
  lastActivity: number | null,
  now: number = Date.now(),
): boolean {
  if (lastActivity === null) return false;
  return now - lastActivity > IDLE_TIMEOUT_MS;
}
