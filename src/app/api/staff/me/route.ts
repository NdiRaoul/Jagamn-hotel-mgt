import { NextResponse } from "next/server";
import { getStaffSession } from "@/lib/auth/staff-session";
import { updateActivityCookie } from "@/lib/auth/session-timeout";

export async function GET() {
  const session = await getStaffSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.status !== "active") {
    return NextResponse.json(
      { error: "Access denied / account suspended" },
      { status: 403 },
    );
  }

  const response = NextResponse.json({
    staff: session,
    role: session.role,
    must_reset_pw: session.must_reset_pw,
  });
  
  updateActivityCookie(response);
  return response;
}
