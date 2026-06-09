import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import { getStaffSession } from "@/lib/auth/staff-session";

export async function GET(req: NextRequest) {
  try {
    const session = await getStaffSession();
    if (!session || !["owner", "admin", "manager"].includes(session.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const staffId = searchParams.get("staff_id");
    const category = searchParams.get("category");

    let query = supabaseAdmin
      .from("staff_deductions")
      .select(
        `
        id,
        staff_id,
        category,
        reason_type,
        amount_minor,
        reason,
        applied_on,
        created_at,
        staff:staff_id (
          full_name,
          email
        ),
        created_by_staff:created_by (
          full_name
        )
      `,
      )
      .order("created_at", { ascending: false });

    if (staffId) {
      query = query.eq("staff_id", staffId);
    }

    if (category) {
      query = query.eq("category", category);
    }

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json({ deductions: data || [] });
  } catch (error) {
    console.error("Get deductions error:", error);
    return NextResponse.json(
      { error: "Failed to fetch deductions" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getStaffSession();
    if (!session || !["owner", "admin", "manager"].includes(session.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const {
      staff_id,
      category,
      reason_type,
      amount_minor,
      reason,
      applied_on,
    } = body;

    if (!staff_id || !category || !amount_minor) {
      return NextResponse.json(
        { error: "staff_id, category, and amount_minor are required" },
        { status: 400 },
      );
    }

    // The owner may only apply deductions to admin/manager staff.
    if (session.role === "owner") {
      const { data: target } = await supabaseAdmin
        .from("staff")
        .select("role")
        .eq("id", staff_id)
        .single();
      if (!target || !["admin", "manager"].includes(target.role)) {
        return NextResponse.json(
          {
            error:
              "Owner may only apply deductions to admin or manager staff.",
          },
          { status: 403 },
        );
      }
    }

    // Insert deduction
    const { data: deduction, error: insertError } = await supabaseAdmin
      .from("staff_deductions")
      .insert({
        staff_id,
        category,
        reason_type: reason_type || null,
        amount_minor: Math.round(amount_minor),
        reason: reason || null,
        applied_on: applied_on || new Date().toISOString().split("T")[0],
        created_by: session.id,
      })
      .select()
      .single();

    if (insertError) throw insertError;

    // If there's an open (draft) payroll run, recompute deductions for this staff
    const { data: openRun } = await supabaseAdmin
      .from("payroll_runs")
      .select("id")
      .eq("status", "draft")
      .gte("period_end", applied_on || new Date().toISOString().split("T")[0])
      .single();

    if (openRun) {
      // Get staff's payroll item in this run
      const { data: payrollItem } = await supabaseAdmin
        .from("payroll_items")
        .select("id, gross_minor")
        .eq("run_id", openRun.id)
        .eq("staff_id", staff_id)
        .single();

      if (payrollItem) {
        // Recompute deductions for this staff in this run
        const { data: allDeductions } = await supabaseAdmin
          .from("staff_deductions")
          .select("amount_minor")
          .eq("staff_id", staff_id)
          .gte("applied_on", new Date().toISOString().split("T")[0]);

        const totalDeductions = (allDeductions || []).reduce(
          (sum, d) => sum + d.amount_minor,
          0,
        );

        const netMinor = payrollItem.gross_minor - totalDeductions;

        await supabaseAdmin
          .from("payroll_items")
          .update({
            deductions_minor: totalDeductions,
            net_minor: netMinor,
          })
          .eq("id", payrollItem.id);

        // Update run totals
        const { data: allItems } = await supabaseAdmin
          .from("payroll_items")
          .select("gross_minor, net_minor")
          .eq("run_id", openRun.id);

        if (allItems) {
          const grossTotal = allItems.reduce(
            (sum, i) => sum + i.gross_minor,
            0,
          );
          const netTotal = allItems.reduce((sum, i) => sum + i.net_minor, 0);

          await supabaseAdmin
            .from("payroll_runs")
            .update({
              gross_total_minor: grossTotal,
              net_total_minor: netTotal,
            })
            .eq("id", openRun.id);
        }
      }
    }

    return NextResponse.json({ deduction }, { status: 201 });
  } catch (error) {
    console.error("Create deduction error:", error);
    return NextResponse.json(
      { error: "Failed to create deduction" },
      { status: 500 },
    );
  }
}
