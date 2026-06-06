import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import { getStaffSession } from "@/lib/auth/staff-session";

const ALLOWED_ROLES = ["owner", "admin", "manager", "storekeeper"];
// Approving or declining a purchase order is reserved for admins (and the owner).
const APPROVAL_ROLES = ["owner", "admin"];

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

  // Only admins/owner may approve or decline a pending purchase order.
  if (
    current.status === "pending_approval" &&
    (status === "approved" || status === "cancelled") &&
    !APPROVAL_ROLES.includes(session.role)
  ) {
    return NextResponse.json(
      { error: "Only an admin can approve or decline purchase orders" },
      { status: 403 },
    );
  }

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

  // Receive goods: on delivery, increment on_hand for matched inventory items.
  if (status === "delivered") {
    const { data: lineItems } = await supabaseAdmin
      .from("purchase_order_items")
      .select("description,quantity")
      .eq("order_id", id);

    for (const li of lineItems ?? []) {
      const { data: match } = await supabaseAdmin
        .from("inventory_items")
        .select("id,on_hand")
        .ilike("name", `%${li.description}%`)
        .limit(1)
        .maybeSingle();
      if (match) {
        await supabaseAdmin
          .from("inventory_items")
          .update({
            on_hand: match.on_hand + (li.quantity ?? 0),
            updated_at: new Date().toISOString(),
          })
          .eq("id", match.id);
      }
    }
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
