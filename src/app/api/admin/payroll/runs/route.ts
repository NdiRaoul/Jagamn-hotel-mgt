import { NextRequest, NextResponse } from "next/server";
import { getStaffSession } from "@/lib/auth/staff-session";
import { supabaseAdmin } from "@/lib/supabase-server";
import { getPayrollRuns, createPayrollRun } from "@/lib/data/payroll";

const ALLOWED_ROLES = ["owner", "admin", "manager"];

async function requireAuthorized() {
  const session = await getStaffSession();
  if (!session || session.status !== "active") {
    return { error: "Unauthorized", status: 401 };
  }
  if (!ALLOWED_ROLES.includes(session.role)) {
    return { error: "Forbidden", status: 403 };
  }
  return { session };
}

// GET /api/admin/payroll/runs - List payroll runs
export async function GET(request: NextRequest) {
  const auth = await requireAuthorized();
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "12");

    const runs = await getPayrollRuns(limit);
    return NextResponse.json({ runs });
  } catch (error: any) {
    console.error("[GET /api/admin/payroll/runs] error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/admin/payroll/runs - Create new payroll run
export async function POST(request: NextRequest) {
  const auth = await requireAuthorized();
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const body = await request.json();
    const { period_label, period_start, period_end } = body;

    if (!period_label || !period_start || !period_end) {
      return NextResponse.json(
        { error: "period_label, period_start, and period_end are required" },
        { status: 400 },
      );
    }

    const run = await createPayrollRun(
      period_label,
      period_start,
      period_end,
      auth.session.id,
    );

    // Audit log
    await supabaseAdmin.from("audit_log").insert({
      actor_id: auth.session.auth_user_id,
      actor_role: auth.session.role,
      action: "payroll.run_created",
      target_type: "payroll_run",
      target_id: run.id,
      payload: { period_label, period_start, period_end },
      ip: request.headers.get("x-forwarded-for") || "unknown",
    });

    return NextResponse.json({ run }, { status: 201 });
  } catch (error: any) {
    console.error("[POST /api/admin/payroll/runs] error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
