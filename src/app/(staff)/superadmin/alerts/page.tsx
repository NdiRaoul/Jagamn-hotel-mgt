import { requireOwner } from "@/lib/auth/guard";
import { getSystemAlerts, getAlertStats } from "@/lib/data/alerts";
import { getStaff } from "@/lib/data/staff";
import AlertsClient from "./alerts-client";

export const dynamic = "force-dynamic";

export default async function AlertsPage() {
  await requireOwner();

  const [alerts, stats, staff] = await Promise.all([
    getSystemAlerts(),
    getAlertStats(),
    getStaff(),
  ]);

  return <AlertsClient alerts={alerts} stats={stats} staff={staff} />;
}
