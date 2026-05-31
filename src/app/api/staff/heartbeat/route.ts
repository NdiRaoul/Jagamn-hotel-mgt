import { NextResponse } from "next/server";
import { updateActivityCookie } from "@/lib/auth/session-timeout";

export async function POST() {
  const response = NextResponse.json({ success: true });
  updateActivityCookie(response);
  return response;
}
