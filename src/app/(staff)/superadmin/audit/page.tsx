import { supabaseAdmin } from "@/lib/supabase-server";
import { requireOwner } from "@/lib/auth/guard";
import AuditClient from "./audit-client";

export const dynamic = "force-dynamic";

interface AuditLogEntry {
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

async function getAuditLogs(limit = 100): Promise<AuditLogEntry[]> {
  const { data, error } = await supabaseAdmin
    .from("audit_log")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Failed to fetch audit logs:", error);
    return [];
  }

  return data || [];
}

export default async function AuditPage() {
  await requireOwner();
  const logs = await getAuditLogs();
  return <AuditClient logs={logs} />;
}
