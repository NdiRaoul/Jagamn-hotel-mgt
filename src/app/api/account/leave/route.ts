import { NextRequest, NextResponse } from "next/server";
import { getStaffSession } from "@/lib/auth/staff-session";
import { supabaseAdmin } from "@/lib/supabase-server";
import {
  getLeaveRequests,
  getLeaveBalances,
  createLeaveRequest,
  cancelLeaveRequest,
} from "@/lib/data/self-service";

// GET /api/account/leave - Get own leave requests + balances + leave types
export async function GET(request: NextRequest) {
  const session = await getStaffSession();
  if (!session || session.status !== "active") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [requests, balances, leaveTypesRes] = await Promise.all([
      getLeaveRequests(session.id),
      getLeaveBalances(session.id),
      supabaseAdmin
        .from("leave_types")
        .select("id,name,code,color")
        .eq("is_active", true)
        .order("name"),
    ]);

    return NextResponse.json({
      requests,
      balances,
      leaveTypes: leaveTypesRes.data || [],
    });
  } catch (error: any) {
    console.error("[GET /api/account/leave] error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/account/leave - Create leave request
export async function POST(request: NextRequest) {
  const session = await getStaffSession();
  if (!session || session.status !== "active") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { leave_type_id, start_date, end_date, reason, supporting_doc } =
      body;

    if (!leave_type_id || !start_date || !end_date) {
      return NextResponse.json(
        { error: "leave_type_id, start_date, and end_date are required" },
        { status: 400 },
      );
    }

    const leaveRequest = await createLeaveRequest(
      session.id,
      leave_type_id,
      start_date,
      end_date,
      reason || null,
      supporting_doc || null,
    );

    // Audit log
    await supabaseAdmin.from("audit_log").insert({
      actor_id: session.auth_user_id,
      actor_role: session.role,
      action: "leave.request_created",
      target_type: "leave_request",
      target_id: leaveRequest.id,
      payload: { start_date, end_date, days: leaveRequest.days },
      ip: request.headers.get("x-forwarded-for") || "unknown",
    });

    return NextResponse.json({ request: leaveRequest }, { status: 201 });
  } catch (error: any) {
    console.error("[POST /api/account/leave] error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/account/leave - Cancel own pending leave request
export async function DELETE(request: NextRequest) {
  const session = await getStaffSession();
  if (!session || session.status !== "active") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const requestId = searchParams.get("id");

    if (!requestId) {
      return NextResponse.json(
        { error: "id query parameter is required" },
        { status: 400 },
      );
    }

    await cancelLeaveRequest(session.id, requestId);

    // Audit log
    await supabaseAdmin.from("audit_log").insert({
      actor_id: session.auth_user_id,
      actor_role: session.role,
      action: "leave.request_cancelled",
      target_type: "leave_request",
      target_id: requestId,
      payload: {},
      ip: request.headers.get("x-forwarded-for") || "unknown",
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[DELETE /api/account/leave] error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
