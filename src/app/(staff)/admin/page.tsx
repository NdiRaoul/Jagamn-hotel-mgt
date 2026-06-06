import {
  getDashboardKpis,
  getRevenueSummary,
  getStaffRoster,
  getProcurementAlerts,
  type DashboardKpi,
} from "@/lib/data/admin";
import { getProcurementKpis, type ProcurementKpis } from "@/lib/data/procurement";
import AdminOverviewClient from "./admin-overview-client";
import type { Staff } from "@/types/database";

export const dynamic = "force-dynamic";

export default async function OperationsDashboard() {
  let kpis: DashboardKpi[] = [];
  let revenue = { revenue: 0, settledPayments: 0, pendingPayments: 0 };
  let roster: Staff[] = [];
  let alerts: { item: string; priority: string; status: string }[] = [];
  let procurementKpis: ProcurementKpis = {
    pendingApproval: 0,
    inTransit: 0,
    deliveredThisMonth: 0,
    totalSpendMinor: 0,
  };

  try {
    [kpis, revenue, roster, alerts, procurementKpis] = await Promise.all([
      getDashboardKpis(),
      getRevenueSummary(),
      getStaffRoster(),
      getProcurementAlerts(),
      getProcurementKpis(),
    ]);
  } catch {
    // render empty state on DB error
  }

  return (
    <AdminOverviewClient
      kpis={kpis}
      revenue={revenue}
      roster={roster}
      alerts={alerts}
      procurementKpis={procurementKpis}
    />
  );
}
