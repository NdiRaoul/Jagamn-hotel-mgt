import { supabaseAdmin } from "@/lib/supabase-server";

export interface AuditLogEntry {
  id: number;
  actor_id: string | null;
  actor_role: string | null;
  action: string;
  target_type: string | null;
  target_id: string | null;
  payload: any;
  ip: string | null;
  created_at: string;
}

export async function getAuditLogs(limit = 300): Promise<AuditLogEntry[]> {
  const { data, error } = await supabaseAdmin
    .from("audit_log")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("[getAuditLogs]", error.message);
    return [];
  }
  return (data || []) as AuditLogEntry[];
}

/** An action is a login/auth event (shown on the "Logins" tab). */
export function isAuthEvent(action: string): boolean {
  return action.startsWith("auth.");
}
