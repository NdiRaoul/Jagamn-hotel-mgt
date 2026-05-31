import { NextRequest, NextResponse } from "next/server";
import { getStaffSession } from "@/lib/auth/staff-session";
import { getPayrollItems } from "@/lib/data/payroll";

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

// GET /api/admin/payroll/runs/[id]/items - Get items for a run
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAuthorized();
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const { id } = await params;
    const items = await getPayrollItems(id);
    return NextResponse.json({ items });
  } catch (error: any) {
    console.error(
      `[GET /api/admin/payroll/runs/${(await params).id}/items] error:`,
      error,
    );
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
