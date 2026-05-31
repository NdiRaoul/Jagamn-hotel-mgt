import { NextRequest, NextResponse } from "next/server";
import {
  createSupabaseServerClient,
  supabaseAdmin,
} from "@/lib/supabase-server";
import { invalidate } from "@/lib/redis/cache";

const ADMIN_ROLES = ["manager", "admin"];

async function requireAdmin(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile, error: profileError } = await supabaseAdmin
    .from("users")
    .select("role")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (profileError || !profile || !ADMIN_ROLES.includes(profile.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return null;
}

export async function GET(request: NextRequest) {
  const guard = await requireAdmin(request);
  if (guard) return guard;

  const { data, error } = await supabaseAdmin
    .from("room_types")
    .select("slug, name, price_per_night")
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("[admin/room-types] fetch failed:", error);
    return NextResponse.json(
      { error: "Could not load room types" },
      { status: 500 },
    );
  }

  return NextResponse.json({ roomTypes: data || [] });
}

// PATCH endpoint removed - resort_fee concept has been eliminated
// Room types are now managed through the admin UI for price_per_night only
