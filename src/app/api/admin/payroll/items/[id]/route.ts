import { NextRequest, NextResponse } from "next/server";
import { getStaffSession } from "@/lib/auth/staff-session";
import { supabaseAdmin } from "@/lib/supabase-server";

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

// PATCH /api/admin/payroll/items/[id] - Edit a payroll item
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
    const { gross_minor, deductions_minor, notes } = body;

    if (
      gross_minor === undefined ||
      deductions_minor === undefined ||
      gross_minor < 0 ||
      deductions_minor < 0
    ) {
      return NextResponse.json(
        {
          error:
            "gross_minor and deductions_minor are required and must be >= 0",
        },
        { status: 400 },
      );
    }

    // Get current item
    const { data: item, error: itemError } = await supabaseAdmin
      .from("payroll_items")
      .select("*, run:run_id(id, status, gross_total_minor, net_total_minor)")
      .eq("id", id)
      .single();

    if (itemError || !item) {
      return NextResponse.json(
        { error: "Payroll item not found" },
        { status: 404 },
      );
    }

    // Calculate new net
    const net_minor = gross_minor - deductions_minor;

    // Calculate delta for run totals
    const grossDelta = gross_minor - item.gross_minor;
    const netDelta = net_minor - item.net_minor;

    // Update item
    const { data: updated, error: updateError } = await supabaseAdmin
      .from("payroll_items")
      .update({
        gross_minor,
        deductions_minor,
        net_minor,
        notes: notes || item.notes,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (updateError) throw updateError;

    // Update run totals
    const run = item.run as any;
    await supabaseAdmin
      .from("payroll_runs")
      .update({
        gross_total_minor: run.gross_total_minor + grossDelta,
        net_total_minor: run.net_total_minor + netDelta,
        updated_at: new Date().toISOString(),
      })
      .eq("id", run.id);

    // Audit log
    await supabaseAdmin.from("audit_log").insert({
      actor_id: auth.session.auth_user_id,
      actor_role: auth.session.role,
      action: "payroll.item_edited",
      target_type: "payroll_item",
      target_id: id,
      payload: { gross_minor, deductions_minor, net_minor, notes },
      ip: request.headers.get("x-forwarded-for") || "unknown",
    });

    return NextResponse.json({ item: updated });
  } catch (error: any) {
    console.error(
      `[PATCH /api/admin/payroll/items/${(await params).id}] error:`,
      error,
    );
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
