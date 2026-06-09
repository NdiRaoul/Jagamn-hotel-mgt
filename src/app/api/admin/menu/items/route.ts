import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import { getStaffSession } from "@/lib/auth/staff-session";
import { notify } from "@/lib/data/notifications";

const ALLOWED_ROLES = ["owner", "admin", "manager"];

/**
 * POST /api/admin/menu/items
 * Create a menu item (admin / super-admin F&B). Price is whole XAF.
 * `category` is a category name; it is resolved to (or created in)
 * menu_categories so the UI can keep working with friendly names.
 */
export async function POST(request: NextRequest) {
  const session = await getStaffSession();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.status !== "active" || !ALLOWED_ROLES.includes(session.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const {
    name,
    category,
    description,
    price,
    image_url,
    is_special,
    is_available,
    sort_order,
  } = body as Record<string, unknown>;

  if (!name || typeof name !== "string") {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }
  const priceNum =
    typeof price === "number" ? price : Number.parseFloat(String(price));
  if (!Number.isFinite(priceNum) || priceNum < 0) {
    return NextResponse.json(
      { error: "price must be a non-negative number (whole XAF)" },
      { status: 400 },
    );
  }

  // Resolve the category name → category_id (create the category if new).
  let categoryId: string | null = null;
  if (typeof category === "string" && category.trim()) {
    const categoryName = category.trim();
    const { data: existing } = await supabaseAdmin
      .from("menu_categories")
      .select("id")
      .ilike("name", categoryName)
      .maybeSingle();

    if (existing) {
      categoryId = existing.id;
    } else {
      const { data: created } = await supabaseAdmin
        .from("menu_categories")
        .insert({ name: categoryName })
        .select("id")
        .maybeSingle();
      categoryId = created?.id ?? null;
    }
  }

  const { data, error } = await supabaseAdmin
    .from("menu_items")
    .insert({
      category_id: categoryId,
      name: name.trim(),
      description: typeof description === "string" ? description : null,
      price: Math.round(priceNum),
      currency: "XAF",
      image_url: typeof image_url === "string" ? image_url : null,
      is_special: typeof is_special === "boolean" ? is_special : false,
      is_available: typeof is_available === "boolean" ? is_available : true,
      sort_order: typeof sort_order === "number" ? sort_order : 0,
    })
    .select(
      "id,category_id,name,description,price,currency,image_url,is_special,is_available,sort_order,menu_categories(name)",
    )
    .maybeSingle();

  if (error) {
    console.error("[POST /api/admin/menu/items] insert error:", error);
    return NextResponse.json(
      { error: "Failed to create menu item" },
      { status: 500 },
    );
  }

  await supabaseAdmin.from("audit_log").insert({
    actor_id: session.auth_user_id,
    actor_role: session.role,
    action: "menu.item_created",
    target_type: "menu_item",
    target_id: data?.id ?? null,
    payload: { name: name, price: Math.round(priceNum), category },
    ip: request.headers.get("x-forwarded-for") || "unknown",
  });

  // Let the kitchen know a new dish is on the menu.
  await notify({
    role: "kitchen",
    type: "system",
    title: "New menu item added",
    body: `${name.trim()} was added to the menu.`,
  });

  return NextResponse.json({ success: true, item: data });
}
