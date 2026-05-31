import { getDashboardKpis, getRevenueSummary, getOccupancyDaily, getPayrollMonthly, getHrLeaveSummary } from "@/lib/data/admin";
import { getProcurementKpis } from "@/lib/data/procurement";
import { supabaseAdmin } from "@/lib/supabase-server";
import SuperadminOverviewClient from "./superadmin-overview-client";
import { requireOwner } from "@/lib/auth/guard";

export const dynamic = "force-dynamic";

async function getLatestSyncTime() {
  const [paymentsRes, purchaseOrdersRes, bookingsRes] = await Promise.all([
    supabaseAdmin
      .from("payments")
      .select("created_at")
      .order("created_at", { ascending: false })
      .limit(1),
    supabaseAdmin
      .from("purchase_orders")
      .select("updated_at")
      .order("updated_at", { ascending: false })
      .limit(1),
    supabaseAdmin
      .from("bookings")
      .select("updated_at")
      .order("updated_at", { ascending: false })
      .limit(1),
  ]);

  const candidates = [
    paymentsRes.data?.[0]?.created_at,
    purchaseOrdersRes.data?.[0]?.updated_at,
    bookingsRes.data?.[0]?.updated_at,
  ].filter(Boolean) as string[];

  if (!candidates.length) {
    return new Date().toISOString();
  }

  return new Date(
    Math.max(...candidates.map((value) => new Date(value).getTime())),
  ).toISOString();
}

export default async function SuperadminPage() {
  await requireOwner();

  const [kpis, revenueSummary, occupancyDaily, payrollMonthly, leaveSummary, procurementKpis, latestSync] =
    await Promise.all([
      getDashboardKpis(),
      getRevenueSummary(),
      getOccupancyDaily(),
      getPayrollMonthly(),
      getHrLeaveSummary(),
      getProcurementKpis(),
      getLatestSyncTime(),
    ]);

  return (
    <SuperadminOverviewClient
      kpis={kpis}
      revenueSummary={revenueSummary}
      occupancyDaily={occupancyDaily}
      payrollMonthly={payrollMonthly}
      leaveSummary={leaveSummary}
      procurementKpis={procurementKpis}
      latestSync={latestSync}
    />
  );
}
