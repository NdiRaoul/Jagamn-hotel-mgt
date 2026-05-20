import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { supabaseAdmin } from "@/lib/supabase-server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  if (code) {
    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options),
              );
            } catch {
              // ignore in Server Component context
            }
          },
        },
      },
    );

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      const user = data.user;
      const fullName =
        user.user_metadata?.full_name || user.user_metadata?.name || null;
      const avatarUrl = user.user_metadata?.avatar_url || null;

      // Check if a users row already exists for this auth user
      const { data: existing } = await supabaseAdmin
        .from("users")
        .select("id")
        .eq("auth_user_id", user.id)
        .maybeSingle();

      if (!existing) {
        // Check if a guest row with the same email exists — upgrade it
        const { data: guestRow } = await supabaseAdmin
          .from("users")
          .select("id")
          .eq("email", user.email!)
          .maybeSingle();

        if (guestRow) {
          // Upgrade existing guest row to member
          await supabaseAdmin
            .from("users")
            .update({
              auth_user_id: user.id,
              full_name: fullName || undefined,
              avatar_url: avatarUrl,
              role: "member",
              updated_at: new Date().toISOString(),
            })
            .eq("id", guestRow.id);
        } else {
          // Brand new user
          await supabaseAdmin.from("users").insert({
            auth_user_id: user.id,
            full_name: fullName,
            email: user.email!,
            avatar_url: avatarUrl,
            role: "member",
            loyalty_tier: "standard",
          });
        }
      }
    }
  }

  return NextResponse.redirect(new URL("/dashboard", requestUrl.origin));
}
