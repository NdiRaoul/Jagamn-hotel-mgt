import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import { getStaffSession } from "@/lib/auth/staff-session";
import { getStaffById, updateStaff } from "@/lib/data/staff";

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

  // Generate new temp password
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%";
  let tempPassword = "";
  for (let i = 0; i < 16; i++)
    tempPassword += chars[Math.floor(Math.random() * chars.length)];

  const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(
    existing.auth_user_id,
    { password: tempPassword },
  );
  if (authError) {
    return NextResponse.json({ error: authError.message }, { status: 400 });
  }

  await updateStaff(id, { must_reset_pw: true });

  await supabaseAdmin.from("audit_log").insert({
    actor_id: session.staff.auth_user_id,
    actor_role: session.staff.role,
    action: "staff.reset_password",
    target_type: "staff",
    target_id: id,
    payload: { email: existing.email },
    ip: request.headers.get("x-forwarded-for") || "unknown",
  });

  return NextResponse.json({ tempPassword });
}
