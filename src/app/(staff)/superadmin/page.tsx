import {
  getDashboardKpis,
  getRevenueSummary,
  getOccupancyDaily,
  getPayrollMonthly,
  getHrLeaveSummary,
} from "@/lib/data/admin";
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

  const [
    dashboardKpis,
    adminRevenueSummary,
    occupancyDaily,
    payrollMonthly,
    leaveSummary,
    procurementKpis,
    latestSync,
  ] = await Promise.all([
    getDashboardKpis(),
    getRevenueSummary(),
    getOccupancyDaily(),
    getPayrollMonthly(),
    getHrLeaveSummary(),
    getProcurementKpis(),
    getLatestSyncTime(),
  ]);

  // Transform admin revenue summary to match component expectations
  const revenueSummary = {
    total_revenue_minor: Math.round((adminRevenueSummary.revenue || 0) * 100),
    growth_percentage: 0, // TODO: Calculate growth from historical data
  };

  // Transform DashboardKpi[] to match the expected KPIs interface
  const kpis = {
    occupancy_rate: 0, // Will need to calculate from actual data
    total_bookings: 0,
    confirmed_bookings: 0,
    active_staff: 0,
    total_staff: 0,
  };

  // Calculate occupancy rate and bookings from dashboard KPIs
  const occupiedRooms =
    dashboardKpis.find((k) => k.label === "Occupied Rooms")?.value || 0;
  const availableRooms =
    dashboardKpis.find((k) => k.label === "Available Rooms")?.value || 0;
  const totalRooms = occupiedRooms + availableRooms;

  if (totalRooms > 0) {
    kpis.occupancy_rate = (occupiedRooms / totalRooms) * 100;
  }

  // Get booking and staff counts
  const [bookingsRes, staffRes] = await Promise.all([
    supabaseAdmin
      .from("bookings")
      .select("id, status", { count: "exact", head: true })
      .neq("status", "cancelled"),
    supabaseAdmin
      .from("staff")
      .select("id, status", { count: "exact", head: true }),
  ]);

  kpis.total_bookings = bookingsRes.count || 0;

  const confirmedCount = await supabaseAdmin
    .from("bookings")
    .select("id", { count: "exact", head: true })
    .eq("status", "confirmed");
  kpis.confirmed_bookings = confirmedCount.count || 0;

  const activeStaffCount = await supabaseAdmin
    .from("staff")
    .select("id", { count: "exact", head: true })
    .eq("status", "active");

  kpis.active_staff = activeStaffCount.count || 0;
  kpis.total_staff = staffRes.count || 0;

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
