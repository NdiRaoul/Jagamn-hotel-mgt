import { NextRequest, NextResponse } from "next/server";
import { getStaffSession } from "@/lib/auth/staff-session";
import { updateAlertStatus, assignAlert } from "@/lib/data/alerts";

export async function POST(request: NextRequest) {
  const session = await getStaffSession();

  if (!session || !["owner", "admin", "manager"].includes(session.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { alert_id, resolution_notes, assigned_to } = body;

    if (!alert_id) {
      return NextResponse.json({ error: "Missing alert_id" }, { status: 400 });
    }

    // Assign if specified
    if (assigned_to) {
      await assignAlert(alert_id, assigned_to);
    }

    // Resolve the alert
    const success = await updateAlertStatus(
      alert_id,
      "resolved",
      session.id,
      resolution_notes,
    );

    if (!success) {
      return NextResponse.json(
        { error: "Failed to resolve alert" },
        { status: 500 },
      );
    }

    // Fetch updated alert
    const { supabaseAdmin } = await import("@/lib/supabase-server");
    const { data } = await supabaseAdmin
      .from("system_alerts")
      .select("*")
      .eq("id", alert_id)
      .single();

    return NextResponse.json(data);
  } catch (error) {
    console.error("[POST /api/alerts/resolve] error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
