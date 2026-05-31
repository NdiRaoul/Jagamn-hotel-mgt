import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import { getStaffSession } from "@/lib/auth/staff-session";
import { getStaff, createStaff } from "@/lib/data/staff";

const ADMIN_ROLES = ["owner", "admin"];

async function requireAdmin(request: NextRequest) {
  const session = await getStaffSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (
    session.status !== "active" ||
    !ADMIN_ROLES.includes(session.role)
  ) {
    return NextResponse.json(
      { error: "Forbidden — admin only" },
      { status: 403 },
    );
  }
  return session;
}

// GET /api/staff — list staff with optional filters
export async function GET(request: NextRequest) {
  const session = await requireAdmin(request);
  if (session instanceof NextResponse) return session;

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") ?? undefined;
  const role = searchParams.get("role") ?? undefined;
  const status = searchParams.get("status") ?? undefined;
  const department = searchParams.get("department") ?? undefined;
  const hireFrom = searchParams.get("hireFrom") ?? undefined;
  const hireTo = searchParams.get("hireTo") ?? undefined;
  const sort =
    (searchParams.get("sort") as "name" | "hire_date" | "created_at") ??
    undefined;

  try {
    const staff = await getStaff({
      query,
      role,
      status,
      department,
      hireFrom,
      hireTo,
      sort,
    });
    return NextResponse.json({ staff });
  } catch (err) {
    console.error("[GET /api/staff]", err);
    return NextResponse.json(
      { error: "Failed to fetch staff" },
      { status: 500 },
    );
  }
}

// POST /api/staff — create a new staff member
export async function POST(request: NextRequest) {
  const session = await requireAdmin(request);
  if (session instanceof NextResponse) return session;

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
    password: providedPassword,
    avatar_url,
  } = body as Record<string, unknown>;

  if (!full_name || !email || !role) {
    return NextResponse.json(
      { error: "full_name, email, and role are required" },
      { status: 400 },
    );
  }

  // Generate a temp password if none provided
  const tempPassword =
    typeof providedPassword === "string" && providedPassword.length >= 8
      ? providedPassword
      : null;
  const generatedPassword = tempPassword ?? generateStrongPassword();
  const mustResetPw = !tempPassword;

  // Generate staff code
  const staffCode = await generateStaffCode();

  // Create auth user
  const { data: authData, error: authError } =
    await supabaseAdmin.auth.admin.createUser({
      email: String(email),
      password: generatedPassword,
      email_confirm: true,
      user_metadata: {
        full_name: String(full_name),
        portal: "staff",
      },
    });

  if (authError || !authData.user) {
    console.error("[POST /api/staff] auth create error:", authError);
    return NextResponse.json(
      { error: authError?.message ?? "Failed to create auth user" },
      { status: 400 },
    );
  }

  // Create staff row
  let staffRow;
  try {
    staffRow = await createStaff({
      auth_user_id: authData.user.id,
      full_name: String(full_name),
      email: String(email),
      phone: typeof phone === "string" ? phone : null,
      department: typeof department === "string" ? department : null,
      position: typeof position === "string" ? position : null,
      role: String(role),
      salary: typeof salary === "number" ? salary : 0,
      hire_date: typeof hire_date === "string" ? hire_date : null,
      status: "active",
      avatar_url: typeof avatar_url === "string" ? avatar_url : null,
      must_reset_pw: mustResetPw,
      staff_code: staffCode,
    });
  } catch (err) {
    // Roll back auth user if staff row creation fails
    await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
    console.error("[POST /api/staff] staff row error:", err);
    return NextResponse.json(
      { error: "Failed to create staff record" },
      { status: 500 },
    );
  }

  // Audit log
  await supabaseAdmin.from("audit_log").insert({
    actor_id: session.auth_user_id,
    actor_role: session.role,
    action: "staff.create",
    target_type: "staff",
    target_id: staffRow.id,
    payload: { email, role, department },
    ip: request.headers.get("x-forwarded-for") || "unknown",
  });

  return NextResponse.json({
    staff: staffRow,
    ...(mustResetPw ? { tempPassword: generatedPassword } : {}),
  });
}

function generateStrongPassword(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%";
  let pw = "";
  for (let i = 0; i < 16; i++) {
    pw += chars[Math.floor(Math.random() * chars.length)];
  }
  return pw;
}

async function generateStaffCode(): Promise<string> {
  for (let i = 0; i < 100; i++) {
    const code =
      "JP-" + String(Math.floor(Math.random() * 100000)).padStart(5, "0");
    const { data } = await supabaseAdmin
      .from("staff")
      .select("id")
      .eq("staff_code", code)
      .maybeSingle();
    if (!data) return code;
  }
  throw new Error("Could not generate unique staff code");
}
