import "server-only";
import { supabaseAdmin } from "@/lib/supabase-server";

/**
 * Resolve the `users` (application) row for an authenticated Supabase auth user.
 *
 * Looks up by `auth_user_id` first, then falls back to matching by email. The
 * email fallback covers guests who booked *before* creating an account — their
 * users row was created with `auth_user_id = null`, keyed by email. When matched
 * by email, we back-fill `auth_user_id` (and promote to `member`) so the link is
 * permanent and the slow path only runs once.
 *
 * Returns null only when no row exists for either key.
 */
export async function resolveAppUser(
  authUserId: string,
  email?: string | null,
): Promise<{ id: string; email: string | null } | null> {
  const { data: byAuth } = await supabaseAdmin
    .from("users")
    .select("id, email")
    .eq("auth_user_id", authUserId)
    .maybeSingle();

  if (byAuth) return byAuth;

  if (email) {
    const { data: byEmail } = await supabaseAdmin
      .from("users")
      .select("id, email, auth_user_id")
      .eq("email", email)
      .maybeSingle();

    if (byEmail) {
      if (!byEmail.auth_user_id) {
        await supabaseAdmin
          .from("users")
          .update({ auth_user_id: authUserId, role: "member" })
          .eq("id", byEmail.id);
      }
      return { id: byEmail.id, email: byEmail.email };
    }
  }

  return null;
}
