import { getProcurementAlerts } from "@/lib/data/admin";
import ProcurementClient from "./procurement-client";

export const dynamic = "force-dynamic";

export default async function ProcurementPage() {
  let alerts: Awaited<ReturnType<typeof getProcurementAlerts>> = [];
  let error: string | null = null;

  try {
    alerts = await getProcurementAlerts();
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load procurement data";
  }

  return <ProcurementClient alerts={alerts} error={error} />;
}
