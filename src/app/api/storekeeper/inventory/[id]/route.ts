import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import { getStaffSession } from "@/lib/auth/staff-session";

const ROLES = ["owner", "admin", "manager", "storekeeper"];

/**
 * PATCH /api/storekeeper/inventory/[id]
 * Body: { on_hand: number, reorder_level?: number, max_stock?: number }
 * Updates an inventory item's stock counts and stamps last_counted_at.
 * Powers the Update Stock and Manual Audit modals.
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const session = await getStaffSession();
  if (!session || session.status !== "active" || !ROLES.includes(session.role))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  const { on_hand, reorder_level, max_stock } = body as Record<string, unknown>;

  if (typeof on_hand !== "number" || on_hand < 0)
    return NextResponse.json({ error: "on_hand is required" }, { status: 400 });

  const now = new Date().toISOString();
  const patch: Record<string, unknown> = {
    on_hand: Math.round(on_hand),
    last_counted_at: now,
    updated_at: now,
  };
  if (typeof reorder_level === "number")
    patch.reorder_level = Math.round(reorder_level);
  if (typeof max_stock === "number") patch.max_stock = Math.round(max_stock);

  const { data: item, error } = await supabaseAdmin
    .from("inventory_items")
    .update(patch)
    .eq("id", id)
    .select("id,name,on_hand,reorder_level,max_stock,last_counted_at")
    .maybeSingle();

  if (error || !item)
    return NextResponse.json({ error: "Update failed" }, { status: 500 });

  await supabaseAdmin.from("audit_log").insert({
    actor_id: session.auth_user_id,
    actor_role: session.role,
    action: "storekeeper.inventory.update",
    target_type: "inventory_item",
    target_id: id,
    payload: { on_hand: patch.on_hand, reorder_level, max_stock },
    ip: req.headers.get("x-forwarded-for") || "unknown",
  });

  return NextResponse.json({ item });
}
