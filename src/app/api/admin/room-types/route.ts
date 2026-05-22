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
    .select("slug, name, price_per_night, resort_fee")
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

export async function PATCH(request: NextRequest) {
  const guard = await requireAdmin(request);
  if (guard) return guard;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { slug, resort_fee } = body as {
    slug?: string;
    resort_fee?: unknown;
  };

  if (!slug || typeof slug !== "string") {
    return NextResponse.json({ error: "slug is required" }, { status: 400 });
  }

  if (
    resort_fee == null ||
    typeof resort_fee !== "number" ||
    !isFinite(resort_fee)
  ) {
    return NextResponse.json(
      { error: "resort_fee must be a finite number" },
      { status: 400 },
    );
  }

  const rounded = Math.round(resort_fee);
  if (rounded < 0 || rounded > 100000) {
    return NextResponse.json(
      { error: "resort_fee must be between 0 and 100000" },
      { status: 400 },
    );
  }

  // Verify the room type exists
  const { data: existing } = await supabaseAdmin
    .from("room_types")
    .select("slug")
    .eq("slug", slug)
    .maybeSingle();

  if (!existing) {
    return NextResponse.json({ error: "Room type not found" }, { status: 404 });
  }

  const { data, error } = await supabaseAdmin
    .from("room_types")
    .update({ resort_fee: rounded })
    .eq("slug", slug)
    .select("slug, name, price_per_night, resort_fee")
    .single();

  if (error) {
    console.error("[admin/room-types] update failed:", error);
    return NextResponse.json(
      { error: "Could not update room type" },
      { status: 500 },
    );
  }

  await invalidate(`roomtype:slug:${slug}`);

  return NextResponse.json({ roomType: data });
}

// Keep PUT as an alias for PATCH for backward compatibility
export { PATCH as PUT };
