import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import { getStaffSession } from "@/lib/auth/staff-session";

const ROLES = ["owner", "admin", "manager", "storekeeper"];

/**
 * PATCH /api/storekeeper/inventory-requests/[id]
 * Body: { action: 'approve' | 'fulfill' | 'reject', notes?: string }
 * - approve  → status=approved (+ approved_by/at)
 * - fulfill  → status=fulfilled (+ fulfilled_by/at); decrements on_hand if item linked
 * - reject   → status=rejected
 * Notifies the kitchen of the outcome and writes an audit_log entry.
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const session = await getStaffSession();
  if (!session || session.status !== "active" || !ROLES.includes(session.role))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { action, notes } = await req.json().catch(() => ({}));
  if (!["approve", "fulfill", "reject"].includes(action))
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });

  const { data: reqRow, error: getErr } = await supabaseAdmin
    .from("inventory_requests")
    .select("*")
    .eq("id", id)
    .single();
  if (getErr || !reqRow)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  const now = new Date().toISOString();
  let patch: Record<string, unknown> = {
    notes: notes ?? reqRow.notes,
    updated_at: now,
  };

  if (action === "approve")
    patch = { ...patch, status: "approved", approved_by: session.id, approved_at: now };
  if (action === "reject") patch = { ...patch, status: "rejected" };
  if (action === "fulfill") {
    patch = { ...patch, status: "fulfilled", fulfilled_by: session.id, fulfilled_at: now };
    if (reqRow.item_id) {
      const { data: item } = await supabaseAdmin
        .from("inventory_items")
        .select("on_hand")
        .eq("id", reqRow.item_id)
        .single();
      if (item) {
        await supabaseAdmin
          .from("inventory_items")
          .update({
            on_hand: Math.max(0, item.on_hand - reqRow.quantity),
            updated_at: now,
          })
          .eq("id", reqRow.item_id);
      }
    }
  }

  const { data: updated, error: updErr } = await supabaseAdmin
    .from("inventory_requests")
    .update(patch)
    .eq("id", id)
    .select()
    .single();
  if (updErr)
    return NextResponse.json({ error: "Update failed" }, { status: 500 });

  await supabaseAdmin.rpc("notify_role", {
    p_role: "kitchen",
    p_type: "system",
    p_title: `Stock request ${action}d`,
    p_body: `${reqRow.quantity}x ${reqRow.item_name} — ${action}d by ${session.full_name}`,
  });

  await supabaseAdmin.from("audit_log").insert({
    actor_id: session.auth_user_id,
    actor_role: session.role,
    action: `storekeeper.request.${action}`,
    target_type: "inventory_request",
    target_id: id,
    payload: { action, notes },
    ip: req.headers.get("x-forwarded-for") || "unknown",
  });

  return NextResponse.json({ request: updated });
}
