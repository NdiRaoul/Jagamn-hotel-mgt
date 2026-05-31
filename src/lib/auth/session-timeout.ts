import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const IDLE_TIMEOUT_MINUTES = 20;
export const ACTIVITY_COOKIE_NAME = "staff_last_activity";

export async function checkSessionActivity(): Promise<boolean> {
  const cookieStore = await cookies();
  const lastActivityStr = cookieStore.get(ACTIVITY_COOKIE_NAME)?.value;
  
  if (!lastActivityStr) return false;
  
  const lastActivity = parseInt(lastActivityStr, 10);
  const now = Date.now();
  const diffMinutes = (now - lastActivity) / (1000 * 60);
  
  if (diffMinutes > IDLE_TIMEOUT_MINUTES) {
    return false; // Session expired
  }
  
  return true; // Session active
}

export function updateActivityCookie(response: NextResponse) {
  response.cookies.set(ACTIVITY_COOKIE_NAME, Date.now().toString(), {
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: IDLE_TIMEOUT_MINUTES * 60,
  });
}
