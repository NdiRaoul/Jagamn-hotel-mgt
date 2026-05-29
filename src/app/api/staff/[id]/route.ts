import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import { getStaffSession } from "@/lib/auth/staff-session";
import { getStaffById, updateStaff, setStaffStatus } from "@/lib/data/staff";

const ADMIN_ROLES = ["admin"];
const MANAGER_ROLES = ["admin", "manager"];

async function requireRole(request: NextRequest, roles: string[]) {
  const session = await getStaffSession(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (
    session.staff.status !== "active" ||
    !roles.includes(session.staff.role)
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return session;
}

// PATCH /api/staff/[id] — edit profile + role
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await requireRole(request, MANAGER_ROLES);
  if (session instanceof NextResponse) return session;

  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const {
    full_name,
    email,
    phone,
    department,
    position,
    role,
    salary,
    hire_date,
    avatar_url,
  } = body as Record<string, unknown>;

  const existing = await getStaffById(id);
  if (!existing) {
    return NextResponse.json({ error: "Staff not found" }, { status: 404 });
  }

  const patch: Record<string, unknown> = {};
  if (typeof full_name === "string") patch.full_name = full_name;
  if (typeof phone === "string") patch.phone = phone;
  if (typeof department === "string") patch.department = department;
  if (typeof position === "string") patch.position = position;
  if (typeof role === "string") patch.role = role;
  if (typeof salary === "number") patch.salary = salary;
  if (typeof hire_date === "string") patch.hire_date = hire_date;
  if (typeof avatar_url === "string") patch.avatar_url = avatar_url;

  // If email changed, update auth user too
  if (typeof email === "string" && email !== existing.email) {
    const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(
      existing.auth_user_id,
      { email },
    );
    if (authError) {
      return NextResponse.json(
        { error: "Failed to update auth email: " + authError.message },
        { status: 400 },
      );
    }
    patch.email = email;
  }

  const updated = await updateStaff(id, patch);

  await supabaseAdmin.from("audit_log").insert({
    actor_id: session.staff.auth_user_id,
    actor_role: session.staff.role,
    action: "staff.update",
    target_type: "staff",
    target_id: id,
    payload: patch,
    ip: request.headers.get("x-forwarded-for") || "unknown",
  });

  return NextResponse.json({ staff: updated });
}

// DELETE /api/staff/[id] — soft-delete + revoke login
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await requireRole(request, ADMIN_ROLES);
  if (session instanceof NextResponse) return session;

  const { id } = await params;
  const existing = await getStaffById(id);
  if (!existing) {
    return NextResponse.json({ error: "Staff not found" }, { status: 404 });
  }

  // Soft-delete
  await setStaffStatus(id, "removed");

  // Revoke auth login
  if (existing.auth_user_id) {
    await supabaseAdmin.auth.admin.deleteUser(existing.auth_user_id);
  }

  await supabaseAdmin.from("audit_log").insert({
    actor_id: session.staff.auth_user_id,
    actor_role: session.staff.role,
    action: "staff.delete",
    target_type: "staff",
    target_id: id,
    payload: { email: existing.email },
    ip: request.headers.get("x-forwarded-for") || "unknown",
  });

  return NextResponse.json({ success: true });
}
