import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import { getStaffSession } from "@/lib/auth/staff-session";

const ALLOWED_ROLES = ["owner", "admin", "manager", "kitchen"];

/**
 * GET /api/admin/menu/categories
 * Get all menu categories
 */
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
    const { data, error } = await supabaseAdmin
      .from("menu_categories")
      .select("id, name, sort_order, is_active")
      .eq("is_active", true)
      .order("sort_order");

    if (error) throw error;

    return NextResponse.json({ categories: data || [] });
  } catch (error: any) {
    console.error("Get menu categories error:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 },
    );
  }
}
