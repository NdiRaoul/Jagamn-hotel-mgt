import { NextRequest, NextResponse } from "next/server";
import { getStaffSession } from "@/lib/auth/staff-session";
import { supabaseAdmin } from "@/lib/supabase-server";
import { createDeduction } from "@/lib/data/deductions";

export async function POST(request: NextRequest) {
  const session = await getStaffSession();

  if (!session || !["owner", "admin", "manager"].includes(session.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { staff_id, type, amount_minor, reason } = body;

    if (!staff_id || !type || !amount_minor) {
      return NextResponse.json(
        { error: "Missing required fields" },
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

    const deduction = await createDeduction(
      staff_id,
      type,
      amount_minor,
      reason,
      session.id,
    );

    if (!deduction) {
      return NextResponse.json(
        { error: "Failed to create deduction" },
        { status: 500 },
      );
    }

    return NextResponse.json(deduction);
  } catch (error) {
    console.error("[POST /api/hr/deductions] error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
