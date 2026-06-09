import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import { getStaffSession } from "@/lib/auth/staff-session";

const ROLES = ["owner", "admin", "manager", "storekeeper"];

/**
 * POST /api/storekeeper/inventory
 * Body: { name, category?, unit?, on_hand?, reorder_level?, max_stock?, image_url? }
 * Creates a new inventory item and writes an audit entry.
 */
export async function POST(req: NextRequest) {
  const session = await getStaffSession();
  if (!session || session.status !== "active" || !ROLES.includes(session.role))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  const {
    name,
    category,
    unit,
    on_hand,
    reorder_level,
    max_stock,
    image_url,
  } = body as Record<string, unknown>;

  if (!name || typeof name !== "string" || !name.trim())
    return NextResponse.json({ error: "name is required" }, { status: 400 });

  const onHand = typeof on_hand === "number" ? Math.max(0, Math.round(on_hand)) : 0;
  const reorder =
    typeof reorder_level === "number" ? Math.max(0, Math.round(reorder_level)) : 5;
  const max =
    typeof max_stock === "number"
      ? Math.max(0, Math.round(max_stock))
      : Math.max(reorder * 4, onHand);

  const now = new Date().toISOString();
  const { data: item, error } = await supabaseAdmin
    .from("inventory_items")
    .insert({
      name: name.trim(),
      category: typeof category === "string" && category ? category : null,
      unit: typeof unit === "string" && unit ? unit : "unit",
      on_hand: onHand,
      reorder_level: reorder,
      max_stock: max,
      image_url: typeof image_url === "string" && image_url ? image_url : null,
      is_active: true,
      last_counted_at: now,
    })
    .select("id,name")
    .single();

  if (error || !item) {
    console.error("[POST /api/storekeeper/inventory]", error);
    return NextResponse.json(
      { error: error?.message || "Failed to create item" },
      { status: 500 },
    );
  }

  await supabaseAdmin.from("audit_log").insert({
    actor_id: session.auth_user_id,
    actor_role: session.role,
    action: "storekeeper.inventory.create",
    target_type: "inventory_item",
    target_id: item.id,
    payload: { name: item.name, on_hand: onHand },
    ip: req.headers.get("x-forwarded-for") || "unknown",
  });

  // Let admins/owner know a new SKU was added.
  await supabaseAdmin.rpc("notify_role", {
    p_role: "admin",
    p_type: "system",
    p_title: "New inventory item",
    p_body: `${item.name} was added to inventory by ${session.full_name}`,
  });

  return NextResponse.json({ item });
}
