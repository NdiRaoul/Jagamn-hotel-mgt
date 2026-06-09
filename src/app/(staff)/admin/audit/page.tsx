import { getAuditLogs } from "@/lib/data/audit";
import AuditClient from "@/components/audit/audit-client";

export const dynamic = "force-dynamic";

export default async function AdminAuditPage() {
  const logs = await getAuditLogs();
  return <AuditClient logs={logs} />;
}
