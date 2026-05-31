import { NextRequest, NextResponse } from "next/server";
import {
  createSupabaseServerClient,
  supabaseAdmin,
} from "@/lib/supabase-server";

const ADMIN_ROLES = ["owner", "admin", "manager"];

async function requireAdmin(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile, error: profileError } = await supabaseAdmin
    .from("staff")
    .select("role")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (profileError || !profile || !ADMIN_ROLES.includes(profile.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return null;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const guard = await requireAdmin(request);
  if (guard) return guard;

  const p = await params;

  const { data, error } = await supabaseAdmin
    .from("staff")
    .select(
      "id,auth_user_id,full_name,email,role,status,avatar_url,created_at,updated_at",
    )
    .eq("id", p.id)
    .maybeSingle();

  if (error) {
    console.error("[admin/staff/id] fetch failed:", error);
    return NextResponse.json(
      { error: "Could not load staff member" },
      { status: 500 },
    );
  }

  if (!data) {
    return NextResponse.json({ error: "Staff not found" }, { status: 404 });
  }

  return NextResponse.json({ staff: data });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const guard = await requireAdmin(request);
  if (guard) return guard;

  const p = await params;

  const body = await request.json().catch(() => ({}));
  const { full_name, email, role, status, avatar_url } = body as Record<
    string,
    unknown
  >;

  const updatePayload: Record<string, unknown> = {};
  if (full_name) updatePayload.full_name = String(full_name);
  if (email) updatePayload.email = String(email);
  if (role) updatePayload.role = String(role);
  if (status) updatePayload.status = String(status);
  if (avatar_url) updatePayload.avatar_url = String(avatar_url);

  if (Object.keys(updatePayload).length === 0) {
    return NextResponse.json(
      { error: "No update fields provided" },
      { status: 400 },
    );
  }

  const { data, error } = await supabaseAdmin
    .from("staff")
    .update(updatePayload)
    .eq("id", p.id)
    .select(
      "id,auth_user_id,full_name,email,role,status,avatar_url,created_at,updated_at",
    )
    .maybeSingle();

  if (error) {
    console.error("[admin/staff/id] update failed:", error);
    return NextResponse.json(
      { error: "Could not update staff record" },
      { status: 500 },
    );
  }

  if (!data) {
    return NextResponse.json(
      { error: "Staff member not found" },
      { status: 404 },
    );
  }

  return NextResponse.json({ staff: data });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const guard = await requireAdmin(request);
  if (guard) return guard;

  const p = await params;

  const { error } = await supabaseAdmin.from("staff").delete().eq("id", p.id);

  if (error) {
    console.error("[admin/staff/id] delete failed:", error);
    return NextResponse.json(
      { error: "Could not delete staff member" },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true });
}
