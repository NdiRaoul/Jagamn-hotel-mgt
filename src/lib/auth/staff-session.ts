import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import type { Staff } from "@/types/database";

async function createServerClientForRequest(request?: NextRequest) {
  const cookieSource = request ? request.cookies : await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieSource.getAll();
        },
        setAll(_cookies) {
          // Middleware and server components do not need to persist cookie changes here.
          return;
        },
      },
    },
  );

  return supabase;
}

export type StaffSession = {
  staff: Staff;
  role: Staff["role"];
};

export async function getStaffSession(
  request?: NextRequest,
): Promise<StaffSession | null> {
  const supabase = await createServerClientForRequest(request);
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return null;
  }

  const { data: staff, error } = await supabaseAdmin
    .from("staff")
    .select(
      "id,auth_user_id,full_name,email,role,status,avatar_url,must_reset_pw,created_at,updated_at",
    )
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (error || !staff) {
    return null;
  }

  return {
    staff: staff as Staff,
    role: staff.role as Staff["role"],
  };
}
