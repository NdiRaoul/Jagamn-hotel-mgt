import { NextRequest, NextResponse } from "next/server";
import { getStaffSession } from "@/lib/auth/staff-session";
import { getStaffPayslips } from "@/lib/data/self-service";

// GET /api/account/payslips — return own payroll items with run info
export async function GET(_request: NextRequest) {
  const session = await getStaffSession();
  if (!session || session.status !== "active") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const payslips = await getStaffPayslips(session.id);
    return NextResponse.json({ payslips, staff: { id: session.id, full_name: session.full_name, email: session.email } });
  } catch (error: any) {
    console.error("[GET /api/account/payslips] error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
