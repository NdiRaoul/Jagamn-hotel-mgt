import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import { getStaffSession } from "@/lib/auth/staff-session";

const ALLOWED_ROLES = ["owner", "admin", "manager", "storekeeper"];

const STATUS_FLOW: Record<string, string[]> = {
  pending_approval: ["approved", "cancelled"],
  approved: ["ordered", "cancelled"],
  ordered: ["in_transit", "cancelled"],
  in_transit: ["delivered", "cancelled"],
  delivered: [],
  cancelled: [],
};

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getStaffSession();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (
    session.status !== "active" ||
    !ALLOWED_ROLES.includes(session.role)
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const { status, notes } = body as Record<string, unknown>;

  if (!status)
    return NextResponse.json({ error: "status is required" }, { status: 400 });

  // Validate status transition
  const { data: current } = await supabaseAdmin
    .from("purchase_orders")
    .select("status")
    .eq("id", id)
    .maybeSingle();

  if (!current)
    return NextResponse.json({ error: "Order not found" }, { status: 404 });

  const allowed = STATUS_FLOW[current.status] ?? [];
  if (!allowed.includes(String(status))) {
    return NextResponse.json(
      { error: `Cannot transition from ${current.status} to ${status}` },
      { status: 400 },
    );
  }

  const updatePayload: Record<string, unknown> = {
    status: String(status),
    updated_at: new Date().toISOString(),
  };
  if (notes) updatePayload.notes = String(notes);
  if (status === "ordered") updatePayload.ordered_at = new Date().toISOString();
  if (status === "delivered")
    updatePayload.delivered_at = new Date().toISOString();

  const { data: order, error } = await supabaseAdmin
    .from("purchase_orders")
    .update(updatePayload)
    .eq("id", id)
    .select("id,po_number,status")
    .maybeSingle();

  if (error) {
    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 },
    );
  }

  await supabaseAdmin.from("audit_log").insert({
    actor_id: session.auth_user_id,
    actor_role: session.role,
    action: "procurement.order.status",
    target_type: "purchase_order",
    target_id: id,
    payload: { from: current.status, to: status },
    ip: request.headers.get("x-forwarded-for") || "unknown",
  });

  return NextResponse.json({ order });
}
