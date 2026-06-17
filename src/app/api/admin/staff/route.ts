import { NextRequest, NextResponse } from "next/server";
import {
  createSupabaseServerClient,
  supabaseAdmin,
} from "@/lib/supabase-server";
import { canAssignRole } from "@/lib/auth/staff-permissions";

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

  return { role: profile.role as string };
}

export async function GET(request: NextRequest) {
  const guard = await requireAdmin(request);
  if (guard instanceof NextResponse) return guard;

  const { data, error } = await supabaseAdmin
    .from("staff")
    .select(
      "id,auth_user_id,full_name,email,role,status,avatar_url,created_at,updated_at",
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[admin/staff] fetch failed:", error);
    return NextResponse.json(
      { error: "Could not load staff directory" },
      { status: 500 },
    );
  }

  return NextResponse.json({ staff: data || [] });
}

export async function POST(request: NextRequest) {
  const guard = await requireAdmin(request);
  if (guard instanceof NextResponse) return guard;

  const body = await request.json().catch(() => ({}));
  const { full_name, email, role, status, auth_user_id, avatar_url } =
    body as Record<string, unknown>;

  if (!full_name || !email || !role) {
    return NextResponse.json(
      { error: "full_name, email and role are required" },
      { status: 400 },
    );
  }

  // Only the owner may create admin/manager accounts; admins and managers may
  // only create operational staff.
  if (!canAssignRole(guard.role, String(role))) {
    return NextResponse.json(
      {
        error:
          guard.role === "owner"
            ? "Invalid role."
            : "Only the owner can create admin or manager accounts.",
      },
      { status: 403 },
    );
  }

  const { data, error } = await supabaseAdmin
    .from("staff")
    .insert({
      full_name: String(full_name),
      email: String(email),
      role: String(role),
      status: String(status || "active"),
      auth_user_id: typeof auth_user_id === "string" ? auth_user_id : null,
      avatar_url: typeof avatar_url === "string" ? avatar_url : null,
      must_reset_pw: false,
    })
    .select(
      "id,auth_user_id,full_name,email,role,status,avatar_url,created_at,updated_at",
    )
    .maybeSingle();

  if (error || !data) {
    console.error("[admin/staff] create failed:", error);
    return NextResponse.json(
      { error: "Could not create staff record" },
      { status: 500 },
    );
  }

  return NextResponse.json({ staff: data });
}
