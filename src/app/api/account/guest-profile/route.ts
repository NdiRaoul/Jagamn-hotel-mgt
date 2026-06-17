import { NextRequest, NextResponse } from "next/server";
import { createSupabaseRouteHandlerClient, supabaseAdmin } from "@/lib/supabase-server";
import { resolveAppUser } from "@/lib/auth/app-user";

// PATCH /api/account/guest-profile — update the signed-in guest's own profile.
//
// Why a server route instead of a browser update(): a client-side
// `update().eq("auth_user_id", id)` silently matches ZERO rows (no error) when
// the users row was created during a guest checkout with auth_user_id = null,
// producing a false "saved" toast while nothing is persisted (Guest-008). Here
// we resolve the row via resolveAppUser (auth_user_id OR email, self-linking),
// update by primary key with the service role, and only report success when the
// write actually returns the persisted row.
export async function PATCH(request: NextRequest) {
  const supabase = await createSupabaseRouteHandlerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { full_name, phone, country, id_type, id_number, nationality } = body;

    const appUser = await resolveAppUser(user.id, user.email);
    if (!appUser) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (full_name !== undefined) updates.full_name = full_name;
    if (phone !== undefined) updates.phone = phone || null;
    if (country !== undefined) updates.country = country || null;
    if (id_type !== undefined) updates.id_type = id_type || null;
    if (id_number !== undefined) updates.id_number = id_number || null;
    if (nationality !== undefined) updates.nationality = nationality || null;

    const { data: profile, error } = await supabaseAdmin
      .from("users")
      .update(updates)
      .eq("id", appUser.id)
      .select("full_name, phone, country, id_type, id_number, nationality, avatar_url")
      .single();

    if (error || !profile) {
      console.error("[PATCH /api/account/guest-profile] update error:", error);
      return NextResponse.json(
        { error: "Could not save profile. Please try again." },
        { status: 500 },
      );
    }

    return NextResponse.json({ profile });
  } catch (error: unknown) {
    console.error("[PATCH /api/account/guest-profile] error:", error);
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
