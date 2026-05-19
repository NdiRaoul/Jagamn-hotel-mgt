import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";

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
                cookieStore.set(name, value, options)
              );
            } catch {
              // ignore in Server Component context
            }
          },
        },
      }
    );

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      // After Google OAuth, upsert guest_profile if it doesn't exist
      const user = data.user;
      const fullName =
        user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        null;

      await supabase.from("guest_profiles").upsert(
        {
          id: user.id,
          full_name: fullName,
          email: user.email,
        },
        { onConflict: "id", ignoreDuplicates: true }
      );
    }
  }

  return NextResponse.redirect(new URL("/dashboard", requestUrl.origin));
}
