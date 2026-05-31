import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import { getStaffSession } from "@/lib/auth/staff-session";
import { getMenuForKitchen } from "@/lib/data/menu";

const ALLOWED_ROLES = ["owner", "admin", "manager", "kitchen"];

export async function GET(request: NextRequest) {
  const session = await getStaffSession();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (
    session.status !== "active" ||
    !ALLOWED_ROLES.includes(session.role)
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  try {
    const items = await getMenuForKitchen();
    return NextResponse.json({ items });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch menu" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  const session = await getStaffSession();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (
    session.status !== "active" ||
    !ALLOWED_ROLES.includes(session.role)
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const { name, category_id, description, price, is_special, image_url } =
    body as Record<string, unknown>;

  if (!name || typeof price !== "number") {
    return NextResponse.json(
      { error: "name and price are required" },
      { status: 400 },
    );
  }

  const { data, error } = await supabaseAdmin
    .from("menu_items")
    .insert({
      name: String(name),
      category_id: typeof category_id === "string" ? category_id : null,
      description: typeof description === "string" ? description : null,
      price: price,
      is_special: typeof is_special === "boolean" ? is_special : false,
      is_available: true,
      currency: "XAF",
      image_url: typeof image_url === "string" ? image_url : null,
    })
    .select(
      `
      id,
      category_id,
      name,
      description,
      price,
      currency,
      image_url,
      is_special,
      is_available,
      sort_order,
      menu_categories(name)
    `,
    )
    .maybeSingle();

  if (error)
    return NextResponse.json(
      { error: "Failed to create item" },
      { status: 500 },
    );

  const mapped = data
    ? {
        id: data.id,
        category_id: data.category_id,
        category_name:
          (data as { menu_categories?: { name: string }[] | null })
            .menu_categories?.[0]?.name ?? null,
        name: data.name,
        description: data.description,
        price: data.price,
        currency: data.currency,
        image_url: data.image_url,
        is_special: data.is_special,
        is_available: data.is_available,
        sort_order: data.sort_order,
      }
    : null;

  return NextResponse.json({ item: mapped });
}
