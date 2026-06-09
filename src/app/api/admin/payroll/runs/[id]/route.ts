import { NextRequest, NextResponse } from "next/server";
import { getStaffSession } from "@/lib/auth/staff-session";
import { supabaseAdmin } from "@/lib/supabase-server";
import { notify } from "@/lib/data/notifications";

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

// PATCH /api/admin/payroll/runs/[id] - Approve or close a run
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAuthorized();
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const { action } = body;

    if (!action || !["approve", "close"].includes(action)) {
      return NextResponse.json(
        { error: "action must be 'approve' or 'close'" },
        { status: 400 },
      );
    }

    // Get current run
    const { data: run, error: runError } = await supabaseAdmin
      .from("payroll_runs")
      .select("*")
      .eq("id", id)
      .single();

    if (runError || !run) {
      return NextResponse.json(
        { error: "Payroll run not found" },
        { status: 404 },
      );
    }

    // Validate state transitions
    if (action === "approve" && run.status !== "draft") {
      return NextResponse.json(
        { error: "Only draft runs can be approved" },
        { status: 400 },
      );
    }

    if (action === "close" && run.status !== "approved") {
      return NextResponse.json(
        { error: "Only approved runs can be closed" },
        { status: 400 },
      );
    }

    // Update run
    const updates: any = {
      status: action === "approve" ? "approved" : "closed",
      updated_at: new Date().toISOString(),
    };

    if (action === "approve") {
      updates.approved_by = auth.session.id;
      updates.approved_at = new Date().toISOString();
    }

    const { data: updated, error: updateError } = await supabaseAdmin
      .from("payroll_runs")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (updateError) throw updateError;

    // On approval, notify each staff member that their payslip is available.
    if (action === "approve") {
      const { data: items } = await supabaseAdmin
        .from("payroll_items")
        .select("staff_id, net_minor")
        .eq("run_id", id);
      for (const it of items ?? []) {
        await notify({
          staffId: it.staff_id,
          type: "payroll",
          title: "Payslip available",
          body: `Your payslip for ${run.period_label} has been approved and is available in your account.`,
        });
      }
    }

    // Audit log
    await supabaseAdmin.from("audit_log").insert({
      actor_id: auth.session.auth_user_id,
      actor_role: auth.session.role,
      action: `payroll.run_${action}d`,
      target_type: "payroll_run",
      target_id: id,
      payload: { period_label: run.period_label, action },
      ip: request.headers.get("x-forwarded-for") || "unknown",
    });

    return NextResponse.json({ run: updated });
  } catch (error: any) {
    console.error(
      `[PATCH /api/admin/payroll/runs/${(await params).id}] error:`,
      error,
    );
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
