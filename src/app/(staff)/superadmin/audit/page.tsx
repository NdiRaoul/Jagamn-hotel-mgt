import { getAuditLogs } from "@/lib/data/audit";
import { requireOwner } from "@/lib/auth/guard";
import AuditClient from "@/components/audit/audit-client";

export const dynamic = "force-dynamic";

export default async function AuditPage() {
  await requireOwner();
  const logs = await getAuditLogs();
  return <AuditClient logs={logs} />;
}
