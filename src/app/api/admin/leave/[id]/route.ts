import { NextRequest, NextResponse } from "next/server";
import {
  createSupabaseRouteHandlerClient,
  supabaseAdmin,
} from "@/lib/supabase-server";
import { notify } from "@/lib/data/notifications";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const supabase = await createSupabaseRouteHandlerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin/manager/owner
    const { data: staff } = await supabase
      .from("staff")
      .select("id,role")
      .eq("auth_user_id", user.id)
      .single();

    if (!staff || !["owner", "admin", "manager"].includes(staff.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { status, manager_notes } = body;

    if (!status) {
      return NextResponse.json(
        { error: "Status is required" },
        { status: 400 },
      );
    }

    // Use the RPC function to handle leave decision
    const { error } = await supabase.rpc("decide_leave", {
      p_id: id,
      p_status: status,
      p_notes: manager_notes || null,
      p_actor: staff.id,
    });

    if (error) throw error;

    // Notify the affected staff member of the decision (display-only).
    const { data: leaveReq } = await supabaseAdmin
      .from("leave_requests")
      .select("staff_id")
      .eq("id", id)
      .single();
    if (leaveReq?.staff_id) {
      await notify({
        staffId: leaveReq.staff_id,
        type: "hr",
        title: `Leave request ${status}`,
        body: manager_notes ? `Note: ${manager_notes}` : undefined,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update leave request error:", error);
    return NextResponse.json(
      { error: "Failed to update leave request" },
      { status: 500 },
    );
  }
}
