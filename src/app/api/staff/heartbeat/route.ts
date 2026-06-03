import { NextResponse } from "next/server";
import {
  checkSessionActivity,
  updateActivityCookie,
} from "@/lib/auth/session-timeout";

/**
 * Keep-alive heartbeat for staff portals. Refreshes the rolling activity
 * cookie while the session is still within the idle window, and returns 401
 * once it has expired so the client can hard-logout.
 */
export async function POST() {
  const active = await checkSessionActivity();
  if (!active) {
    return NextResponse.json({ error: "Session expired" }, { status: 401 });
  }

  const response = NextResponse.json({ success: true });
  updateActivityCookie(response);
  return response;
}
