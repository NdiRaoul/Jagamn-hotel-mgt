import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import { getStaffSession } from "@/lib/auth/staff-session";
import { getPurchaseOrders } from "@/lib/data/procurement";

const ALLOWED_ROLES = ["owner", "admin", "manager", "storekeeper"];

async function requireRole(request: NextRequest) {
  const session = await getStaffSession();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (
    session.status !== "active" ||
    !ALLOWED_ROLES.includes(session.role)
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return session;
}

export async function GET(request: NextRequest) {
  const session = await requireRole(request);
  if (session instanceof NextResponse) return session;

  const { searchParams } = new URL(request.url);
  try {
    const orders = await getPurchaseOrders({
      status: searchParams.get("status") ?? undefined,
      query: searchParams.get("q") ?? undefined,
      from: searchParams.get("from") ?? undefined,
      to: searchParams.get("to") ?? undefined,
    });
    return NextResponse.json({ orders });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  const session = await requireRole(request);
  if (session instanceof NextResponse) return session;

  const body = await request.json().catch(() => ({}));
  const {
    description,
    supplier_id,
    total_minor,
    priority,
    department,
    notes,
    items,
  } = body as Record<string, unknown>;

  if (!description) {
    return NextResponse.json(
      { error: "description is required" },
      { status: 400 },
    );
  }

  const { data: order, error } = await supabaseAdmin
    .from("purchase_orders")
    .insert({
      description: String(description),
      supplier_id: typeof supplier_id === "string" ? supplier_id : null,
      total_minor: typeof total_minor === "number" ? total_minor : 0,
      priority: typeof priority === "string" ? priority : "medium",
      department: typeof department === "string" ? department : null,
      notes: typeof notes === "string" ? notes : null,
      status: "pending_approval",
      created_by: session.id,
    })
    .select("id,po_number")
    .maybeSingle();

  if (error || !order) {
    console.error("[POST /api/admin/procurement/orders]", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 },
    );
  }

  // Insert line items if provided
  if (Array.isArray(items) && items.length > 0) {
    const lineItems = items.map((item: any) => ({
      order_id: order.id,
      description: String(item.description || ""),
      quantity: Number(item.quantity) || 1,
      unit_price_minor: Number(item.unit_price_minor) || 0,
    }));
    await supabaseAdmin.from("purchase_order_items").insert(lineItems);
  }

  await supabaseAdmin.from("audit_log").insert({
    actor_id: session.auth_user_id,
    actor_role: session.role,
    action: "procurement.order.create",
    target_type: "purchase_order",
    target_id: order.id,
    payload: { description, total_minor, priority },
    ip: request.headers.get("x-forwarded-for") || "unknown",
  });

  return NextResponse.json({ order });
}
