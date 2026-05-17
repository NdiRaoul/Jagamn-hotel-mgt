import { NextRequest, NextResponse } from "next/server";
import {
  supabaseAdmin,
  createSupabaseServerClient,
} from "@/lib/supabase-server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { fullName, email } = await request.json();

    // If a guest row with this email exists, upgrade it to member
    const { data: existing } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (existing) {
      await supabaseAdmin
        .from("users")
        .update({
          auth_user_id: user.id,
          full_name: fullName || null,
          role: "member",
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id);
    } else {
      await supabaseAdmin.from("users").insert({
        auth_user_id: user.id,
        full_name: fullName,
        email,
        role: "member",
        loyalty_tier: "standard",
      });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
