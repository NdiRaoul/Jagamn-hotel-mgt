import {
  getDashboardKpis,
  getRevenueMonthly,
  getOccupancyDaily,
  getPayrollMonthly,
  getHrLeaveSummary,
} from "@/lib/data/admin";
import { getProcurementKpis } from "@/lib/data/procurement";
import { supabaseAdmin } from "@/lib/supabase-server";
import SuperadminOverviewClient from "./superadmin-overview-client";
import { requireOwner } from "@/lib/auth/guard";

export const dynamic = "force-dynamic";

export default async function SuperadminPage() {
  await requireOwner();

  // Parallelize all queries - no waterfall
  const [
    dashboardKpis,
    revenueMonthly,
    occupancyDaily,
    payrollMonthly,
    leaveSummary,
    procurementKpis,
    bookingsRes,
    confirmedCount,
    staffRes,
    activeStaffCount,
    latestSyncData,
  ] = await Promise.all([
    getDashboardKpis(),
    getRevenueMonthly(),
    getOccupancyDaily(),
    getPayrollMonthly(),
    getHrLeaveSummary(),
    getProcurementKpis(),
    // Booking counts
    supabaseAdmin
      .from("bookings")
      .select("id, status", { count: "exact", head: true })
      .neq("status", "cancelled"),
    supabaseAdmin
      .from("bookings")
      .select("id", { count: "exact", head: true })
      .eq("status", "confirmed"),
    // Staff counts
    supabaseAdmin
      .from("staff")
      .select("id, status", { count: "exact", head: true }),
    supabaseAdmin
      .from("staff")
      .select("id", { count: "exact", head: true })
      .eq("status", "active"),
    // Latest sync timestamps
    Promise.all([
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
    ]),
  ]);

  // Calculate occupancy rate from dashboard KPIs
  const occupiedRooms =
    dashboardKpis.find((k) => k.label === "Occupied Rooms")?.value || 0;
  const availableRooms =
    dashboardKpis.find((k) => k.label === "Available Rooms")?.value || 0;
  const totalRooms = occupiedRooms + availableRooms;

  const kpis = {
    occupancy_rate: totalRooms > 0 ? (occupiedRooms / totalRooms) * 100 : 0,
    total_bookings: bookingsRes.count || 0,
    confirmed_bookings: confirmedCount.count || 0,
    active_staff: activeStaffCount.count || 0,
    total_staff: staffRes.count || 0,
  };

  // Calculate total revenue and growth from revenue_monthly (single source of truth)
  const totalRevenue = revenueMonthly.reduce(
    (sum, month) => sum + month.revenue,
    0,
  );

  // Calculate growth: compare last month to previous month
  let growthPercentage = 0;
  if (revenueMonthly.length >= 2) {
    const lastMonth = revenueMonthly[revenueMonthly.length - 1]?.revenue || 0;
    const previousMonth =
      revenueMonthly[revenueMonthly.length - 2]?.revenue || 0;
    if (previousMonth > 0) {
      growthPercentage = ((lastMonth - previousMonth) / previousMonth) * 100;
    }
  }

  const revenueSummary = {
    total_revenue: totalRevenue,
    growth_percentage: growthPercentage,
  };

  // Calculate latest sync time
  const [paymentsRes, purchaseOrdersRes, bookingsUpdateRes] = latestSyncData;
  const candidates = [
    paymentsRes.data?.[0]?.created_at,
    purchaseOrdersRes.data?.[0]?.updated_at,
    bookingsUpdateRes.data?.[0]?.updated_at,
  ].filter(Boolean) as string[];

  const latestSync = candidates.length
    ? new Date(
        Math.max(...candidates.map((value) => new Date(value).getTime())),
      ).toISOString()
    : new Date().toISOString();

  return (
    <SuperadminOverviewClient
      kpis={kpis}
      revenueSummary={revenueSummary}
      revenueMonthly={revenueMonthly}
      occupancyDaily={occupancyDaily}
      payrollMonthly={payrollMonthly}
      leaveSummary={leaveSummary}
      procurementKpis={procurementKpis}
      latestSync={latestSync}
    />
  );
}
