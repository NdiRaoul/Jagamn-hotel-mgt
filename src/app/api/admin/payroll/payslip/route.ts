import { NextRequest, NextResponse } from "next/server";
import { getStaffSession } from "@/lib/auth/staff-session";
import { supabaseAdmin } from "@/lib/supabase-server";
import { notify } from "@/lib/data/notifications";
import { resend } from "@/lib/resend";
import { buildPayslipEmailHtml } from "@/lib/emails/payslip";

// Only the owner and admins may issue a payslip to a staff member.
const ALLOWED_ROLES = ["owner", "admin"];

function defaultPeriodLabel(): string {
  const now = new Date();
  return `${now.toLocaleString("default", { month: "long" })} ${now.getFullYear()}`;
}

// POST /api/admin/payroll/payslip
// Body: { staffId: string, periodLabel?: string }
//
// Builds (or reuses) a payslip for one staff member from their salary and
// itemised deductions, persists it as a payroll_run + payroll_item so it shows
// under My Account → Payslips, then notifies the staff in-app and by email.
export async function POST(request: NextRequest) {
  const session = await getStaffSession();
  if (!session || session.status !== "active") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!ALLOWED_ROLES.includes(session.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const staffId: string | undefined = body?.staffId;
    if (!staffId || typeof staffId !== "string") {
      return NextResponse.json(
        { error: "staffId is required" },
        { status: 400 },
      );
    }

    const periodLabel =
      typeof body?.periodLabel === "string" && body.periodLabel.trim()
        ? body.periodLabel.trim()
        : defaultPeriodLabel();

    // Load the target staff member.
    const { data: staff, error: staffErr } = await supabaseAdmin
      .from("staff")
      .select("id, full_name, email, role, department, salary")
      .eq("id", staffId)
      .single();

    if (staffErr || !staff) {
      return NextResponse.json({ error: "Staff not found" }, { status: 404 });
    }

    // Itemised deductions (reason + amount) for this staff member.
    const { data: deductions } = await supabaseAdmin
      .from("staff_deductions")
      .select("type, reason, amount_minor, applied_date")
      .eq("staff_id", staffId);

    const deductionLines = (deductions ?? []).map((d) => ({
      type: d.type,
      reason: d.reason,
      amount_minor: d.amount_minor ?? 0,
    }));

    const grossMinor = Math.round((staff.salary ?? 0) * 100);
    const deductionsMinor = deductionLines.reduce(
      (sum, d) => sum + (d.amount_minor ?? 0),
      0,
    );
    const netMinor = Math.max(0, grossMinor - deductionsMinor);

    // Resolve the pay period so getStaffPayslips' window picks up every
    // deduction line we just summed (it filters deductions by run period).
    const now = new Date();
    let periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
    let periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    for (const d of deductions ?? []) {
      if (!d.applied_date) continue;
      const t = new Date(d.applied_date);
      if (t < periodStart) periodStart = t;
      if (t > periodEnd) periodEnd = t;
    }
    const periodStartStr = periodStart.toISOString().split("T")[0];
    const periodEndStr = periodEnd.toISOString().split("T")[0];

    // Find-or-create the payroll run for this period.
    const { data: existingRun } = await supabaseAdmin
      .from("payroll_runs")
      .select("id, status")
      .eq("period_label", periodLabel)
      .maybeSingle();

    let runId: string;
    if (existingRun) {
      runId = existingRun.id;
    } else {
      const { data: newRun, error: runErr } = await supabaseAdmin
        .from("payroll_runs")
        .insert({
          period_label: periodLabel,
          period_start: periodStartStr,
          period_end: periodEndStr,
          status: "approved",
          generated_by: session.id,
          approved_by: session.id,
          approved_at: new Date().toISOString(),
        })
        .select("id")
        .single();
      if (runErr || !newRun) throw runErr ?? new Error("Run create failed");
      runId = newRun.id;
    }

    // Upsert the payroll item so the payslip persists and shows in the account.
    const { data: item, error: itemErr } = await supabaseAdmin
      .from("payroll_items")
      .upsert(
        {
          run_id: runId,
          staff_id: staffId,
          gross_minor: grossMinor,
          deductions_minor: deductionsMinor,
          net_minor: netMinor,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "run_id,staff_id" },
      )
      .select("id")
      .single();

    if (itemErr || !item) throw itemErr ?? new Error("Item upsert failed");

    // In-app notification to the staff member.
    await notify({
      staffId,
      type: "payslip_sent",
      title: "Payslip available",
      body: `Your payslip for ${periodLabel} has been sent. View it under My Account → Payslips.`,
    });

    // Email the payslip (best-effort; never block the response on email).
    let emailSent = false;
    if (staff.email) {
      try {
        const { error: sendError } = await resend.emails.send({
          from: "Jagamn Palace <payroll@jagamnpalace.com>",
          to: [staff.email],
          subject: `Your Payslip — ${periodLabel} | Jagamn Palace`,
          html: buildPayslipEmailHtml({
            staffName: staff.full_name,
            periodLabel,
            grossMinor,
            deductionsMinor,
            netMinor,
            deductionLines,
          }),
        });
        emailSent = !sendError;
        if (sendError) {
          console.error("[payslip] Resend error:", sendError);
        }
      } catch (e) {
        console.error("[payslip] email send failed:", e);
      }
    }

    await supabaseAdmin.from("audit_log").insert({
      actor_id: session.auth_user_id,
      actor_role: session.role,
      action: "payroll.payslip_sent",
      target_type: "payroll_item",
      target_id: item.id,
      payload: {
        staff_id: staffId,
        period_label: periodLabel,
        net_minor: netMinor,
      },
      ip: request.headers.get("x-forwarded-for") || "unknown",
    });

    return NextResponse.json({
      success: true,
      payslipId: item.id,
      emailSent,
    });
  } catch (error: unknown) {
    console.error("[POST /api/admin/payroll/payslip] error:", error);
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
