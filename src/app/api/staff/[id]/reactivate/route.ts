import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import { getStaffSession } from "@/lib/auth/staff-session";
import { getStaffById, setStaffStatus } from "@/lib/data/staff";

const ADMIN_ROLES = ["admin"];

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getStaffSession(request);
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (
    session.staff.status !== "active" ||
    !ADMIN_ROLES.includes(session.staff.role)
  )
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const existing = await getStaffById(id);
  if (!existing)
    return NextResponse.json({ error: "Staff not found" }, { status: 404 });

  const updated = await setStaffStatus(id, "active");

  await supabaseAdmin.from("audit_log").insert({
    actor_id: session.staff.auth_user_id,
    actor_role: session.staff.role,
    action: "staff.reactivate",
    target_type: "staff",
    target_id: id,
    payload: { email: existing.email },
    ip: request.headers.get("x-forwarded-for") || "unknown",
  });

  return NextResponse.json({ staff: updated });
}
