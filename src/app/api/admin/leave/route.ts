import { NextRequest, NextResponse } from "next/server";
import { createSupabaseRouteHandlerClient } from "@/lib/supabase-server";
import { getLeaveRequests } from "@/lib/data/hr";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || undefined;
    const staffId = searchParams.get("staff_id") || undefined;

    const requests = await getLeaveRequests({ status, staffId });
    return NextResponse.json({ requests });
  } catch (error) {
    console.error("Get leave requests error:", error);
    return NextResponse.json(
      { error: "Failed to fetch leave requests" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = createSupabaseRouteHandlerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: staff } = await supabase
      .from("staff")
      .select("id")
      .eq("auth_user_id", user.id)
      .single();

    if (!staff) {
      return NextResponse.json({ error: "Staff not found" }, { status: 404 });
    }

    const body = await req.json();
    const { leave_type_id, start_date, end_date, days, reason } = body;

    if (!leave_type_id || !start_date || !end_date || !days) {
      return NextResponse.json(
        { error: "Leave type, dates, and days are required" },
        { status: 400 },
      );
    }

    const { data: request, error } = await supabase
      .from("leave_requests")
      .insert({
        staff_id: staff.id,
        leave_type_id,
        start_date,
        end_date,
        days,
        reason: reason || null,
        status: "pending",
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ request }, { status: 201 });
  } catch (error) {
    console.error("Create leave request error:", error);
    return NextResponse.json(
      { error: "Failed to create leave request" },
      { status: 500 },
    );
  }
}
