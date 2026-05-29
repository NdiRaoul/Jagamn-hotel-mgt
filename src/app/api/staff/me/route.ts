import { NextRequest, NextResponse } from "next/server";
import { getStaffSession } from "@/lib/auth/staff-session";

export async function GET(request: NextRequest) {
  const session = await getStaffSession(request);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.staff.status !== "active") {
    return NextResponse.json(
      { error: "Access denied / account suspended" },
      { status: 403 },
    );
  }

  return NextResponse.json({
    staff: session.staff,
    role: session.role,
    must_reset_pw: session.staff.must_reset_pw,
  });
}
