import "server-only";
import { supabaseAdmin, createSupabaseServerClient } from "@/lib/supabase-server";
import { getStaffSession } from "@/lib/auth/staff-session";

export interface NotificationRow {
  id: string;
  type: string;
  title: string;
  body: string | null;
  is_read: boolean;
  created_at: string;
  app_user_id: string | null;
  staff_id: string | null;
  role: string | null;
}

export type NotificationAudience =
  | { kind: "guest"; userId: string }
  | { kind: "staff"; staffId: string; role: string };

const SELECT_COLS =
  "id, type, title, body, is_read, created_at, app_user_id, staff_id, role";

/**
 * Apply the caller's ownership scope to a query builder. Guests see their own
 * rows; staff see rows addressed to them individually OR fanned out to their
 * role. Audience ids come from the server session — never client input.
 */
// Supabase's builder generics make a strongly-typed helper unwieldy; inputs are
// always our own query builders, so a loose type keeps this readable.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function scope(query: any, audience: NotificationAudience): any {
  if (audience.kind === "guest") {
    return query.eq("app_user_id", audience.userId);
  }
  return query.or(`staff_id.eq.${audience.staffId},role.eq.${audience.role}`);
}

export async function getNotifications(
  audience: NotificationAudience,
  opts: { unreadOnly?: boolean; limit?: number } = {},
): Promise<NotificationRow[]> {
  const { unreadOnly = false, limit = 20 } = opts;
  let query = supabaseAdmin
    .from("notifications")
    .select(SELECT_COLS)
    .order("created_at", { ascending: false })
    .limit(limit);
  query = scope(query, audience);
  if (unreadOnly) query = query.eq("is_read", false);

  const { data, error } = await query;
  if (error) {
    console.error("[getNotifications] error:", error);
    return [];
  }
  return (data ?? []) as NotificationRow[];
}

export async function getUnreadCount(
  audience: NotificationAudience,
): Promise<number> {
  let query = supabaseAdmin
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("is_read", false);
  query = scope(query, audience);

  const { count, error } = await query;
  if (error) {
    console.error("[getUnreadCount] error:", error);
    return 0;
  }
  return count ?? 0;
}

export async function markRead(
  id: string,
  audience: NotificationAudience,
): Promise<void> {
  let query = supabaseAdmin
    .from("notifications")
    .update({ is_read: true })
    .eq("id", id);
  query = scope(query, audience); // caller can only mark their own
  const { error } = await query;
  if (error) console.error("[markRead] error:", error);
}

export async function markAllRead(
  audience: NotificationAudience,
): Promise<void> {
  let query = supabaseAdmin
    .from("notifications")
    .update({ is_read: true })
    .eq("is_read", false);
  query = scope(query, audience);
  const { error } = await query;
  if (error) console.error("[markAllRead] error:", error);
}

export interface NotifyInput {
  appUserId?: string;
  staffId?: string;
  role?: string;
  type: string;
  title: string;
  body?: string;
}

/**
 * Single producer entry point for all notifications. Role-only payloads fan
 * out through the `notify_role` RPC (one shared row per role); otherwise a
 * single row is inserted. Notifications are display-only, so failures are
 * logged and swallowed — they must never break the originating flow.
 */
export async function notify(input: NotifyInput): Promise<void> {
  try {
    const roleFanOut = input.role && !input.staffId && !input.appUserId;
    if (roleFanOut) {
      const { error } = await supabaseAdmin.rpc("notify_role", {
        p_role: input.role,
        p_type: input.type,
        p_title: input.title,
        p_body: input.body ?? null,
      });
      if (error) throw error;
      return;
    }

    const { error } = await supabaseAdmin.from("notifications").insert({
      app_user_id: input.appUserId ?? null,
      staff_id: input.staffId ?? null,
      role: input.role ?? null,
      type: input.type,
      title: input.title,
      body: input.body ?? null,
    });
    if (error) throw error;
  } catch (e) {
    console.error("[notify] failed (non-fatal):", e);
  }
}

/**
 * Resolve the calling principal (staff session first, then guest auth user)
 * into a notification audience. Returns null when the caller is anonymous.
 */
export async function resolveNotificationAudience(): Promise<NotificationAudience | null> {
  const staff = await getStaffSession();
  if (staff) {
    return { kind: "staff", staffId: staff.id, role: staff.role };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: appUser } = await supabaseAdmin
    .from("users")
    .select("id")
    .eq("auth_user_id", user.id)
    .single();
  if (!appUser) return null;

  return { kind: "guest", userId: appUser.id };
}
