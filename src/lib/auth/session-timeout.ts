import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  ACTIVITY_COOKIE_NAME,
  IDLE_TIMEOUT_MINUTES,
  isIdleExpired,
  parseLastActivity,
} from "./session-constants";

// Re-export for backwards compatibility with existing importers.
export { ACTIVITY_COOKIE_NAME, IDLE_TIMEOUT_MINUTES };

/**
 * Server-side idle check using the HttpOnly activity cookie.
 * An absent cookie is treated as a fresh session (allowed).
 */
export async function checkSessionActivity(): Promise<boolean> {
  const cookieStore = await cookies();
  const lastActivity = parseLastActivity(
    cookieStore.get(ACTIVITY_COOKIE_NAME)?.value,
  );
  return !isIdleExpired(lastActivity);
}

/** Refresh the rolling 20-minute activity cookie on the outgoing response. */
export function updateActivityCookie(response: NextResponse) {
  response.cookies.set(ACTIVITY_COOKIE_NAME, Date.now().toString(), {
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: IDLE_TIMEOUT_MINUTES * 60,
  });
}
