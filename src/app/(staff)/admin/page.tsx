import {
  getDashboardKpis,
  getRevenueSummary,
  getStaffRoster,
  type DashboardKpi,
} from "@/lib/data/admin";
import AdminOverviewClient from "./admin-overview-client";
import type { Staff } from "@/types/database";

export const dynamic = "force-dynamic";

export default async function OperationsDashboard() {
  let kpis: DashboardKpi[] = [];
  let revenue = { revenue: 0, settledPayments: 0, pendingPayments: 0 };
  let roster: Staff[] = [];

  try {
    [kpis, revenue, roster] = await Promise.all([
      getDashboardKpis(),
      getRevenueSummary(),
      getStaffRoster(),
    ]);
  } catch {
    // render empty state on DB error
  }

  return <AdminOverviewClient kpis={kpis} revenue={revenue} roster={roster} />;
}
