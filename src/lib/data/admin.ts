import { supabaseAdmin } from "@/lib/supabase-server";
import type { RoomAvailabilitySummary, Staff } from "@/types/database";

export interface DashboardKpi {
  label: string;
  value: number;
  trend?: string;
}

export async function getDashboardKpis(): Promise<DashboardKpi[]> {
  const today = new Date().toISOString().slice(0, 10);

  const [arrivalsRes, departuresRes, { data: occupancy }] = await Promise.all([
    supabaseAdmin
      .from("bookings")
      .select("id", { count: "exact", head: true })
      .eq("check_in", today)
      .neq("status", "cancelled"),
    supabaseAdmin
      .from("bookings")
      .select("id", { count: "exact", head: true })
      .eq("check_out", today)
      .neq("status", "cancelled"),
    supabaseAdmin
      .from("room_availability_summary")
      .select("total_rooms,booked_today,available_today"),
  ]);

  return [
    {
      label: "Today's Arrivals",
      value: arrivalsRes.count ?? 0,
    },
    {
      label: "Today's Departures",
      value: departuresRes.count ?? 0,
    },
    {
      label: "Occupied Rooms",
      value:
        occupancy?.reduce(
          (sum: number, row: { booked_today: number }) =>
            sum + (row.booked_today || 0),
          0,
        ) ?? 0,
    },
    {
      label: "Available Rooms",
      value:
        occupancy?.reduce(
          (sum: number, row: { available_today: number }) =>
            sum + (row.available_today || 0),
          0,
        ) ?? 0,
    },
  ];
}

export async function getRoomAvailabilitySummary(): Promise<
  RoomAvailabilitySummary[]
> {
  const { data, error } = await supabaseAdmin
    .from("room_availability_summary")
    .select("room_type_id,slug,name,total_rooms,booked_today,available_today")
    .order("name", { ascending: true });

  if (error) {
    throw error;
  }

  return data as RoomAvailabilitySummary[];
}

export async function getRevenueSummary(
  from?: string,
  to?: string,
): Promise<{
  revenue: number;
  settledPayments: number;
  pendingPayments: number;
}> {
  let query = supabaseAdmin.from("payments").select("amount,status");

  if (from) query = query.gte("created_at", from);
  if (to) query = query.lte("created_at", to);

  const { data, error } = await query;
  if (error) throw error;

  const rows = (data || []) as { amount: number; status: string }[];

  const revenue = rows
    .filter((p) => p.status === "paid")
    .reduce((sum, p) => sum + p.amount, 0);

  const settledPayments = rows.filter((p) => p.status === "paid").length;
  const pendingPayments = rows.filter((p) => p.status !== "paid").length;

  return { revenue: revenue / 100, settledPayments, pendingPayments };
}

export async function getStaffRoster(): Promise<Staff[]> {
  const { data, error } = await supabaseAdmin
    .from("staff")
    .select(
      "id,auth_user_id,full_name,email,role,status,avatar_url,must_reset_pw,staff_code,phone,department,position,salary,hire_date,is_owner,created_at,updated_at",
    )
    .order("created_at", { ascending: true });

  if (error) {
    throw error;
  }

  return data as Staff[];
}

export async function getProcurementAlerts(): Promise<
  { item: string; priority: string; status: string }[]
> {
  // Use the inventory_low_stock view for efficient low-stock alerts
  const { data, error } = await supabaseAdmin
    .from("inventory_low_stock")
    .select("name,on_hand,reorder_level")
    .limit(10);

  if (error) return [];

  const alerts = (data || []).map(
    (item: { name: string; on_hand: number; reorder_level: number }) => ({
      item: item.name,
      priority: item.on_hand === 0 ? "high" : "medium",
      status: item.on_hand === 0 ? "Out of stock" : "Low inventory",
    }),
  );

  return alerts;
}

export interface PayrollRow {
  id: string;
  name: string;
  email: string | null;
  role: string;
  department: string | null;
  gross: number;
  deductions: number;
  net: number;
  avatarUrl: string | null;
}

// TODO: payroll tables are pending — returns staff salary data until staff_payroll table is created.
export async function getPayrollSummary(): Promise<{
  rows: PayrollRow[];
  staffCount: number;
  total_gross: number; // whole XAF — forecast across all active staff
  total_deductions: number;
  total_net: number;
}> {
  const staff = await getStaffRoster();

  // Itemised deductions per staff (for an accurate forecast).
  const { data: deductions } = await supabaseAdmin
    .from("staff_deductions")
    .select("staff_id, amount_minor");
  const deductionByStaff = new Map<string, number>();
  for (const d of deductions ?? []) {
    const francs = Math.round((d.amount_minor ?? 0) / 100);
    deductionByStaff.set(
      d.staff_id,
      (deductionByStaff.get(d.staff_id) ?? 0) + francs,
    );
  }

  const rows: PayrollRow[] = staff.map((s) => {
    const gross = s.salary ?? 0;
    const ded = deductionByStaff.get(s.id) ?? 0;
    return {
      id: s.id,
      name: s.full_name,
      email: s.email,
      role: s.role,
      department: s.department,
      gross,
      deductions: ded,
      net: Math.max(0, gross - ded),
      avatarUrl: s.avatar_url,
    };
  });

  const total_gross = rows.reduce((sum, r) => sum + r.gross, 0);
  const total_deductions = rows.reduce((sum, r) => sum + (r.deductions ?? 0), 0);
  const total_net = rows.reduce((sum, r) => sum + r.net, 0);

  return {
    rows,
    staffCount: staff.length,
    total_gross,
    total_deductions,
    total_net,
  };
}

export interface FBSummaryItem {
  id: string;
  name: string;
  category: string;
  price: number;
  status: "available" | "out_of_stock";
}

// Sourced from the live menu_items table (the F&B menu).
export async function getFoodAndBeverageSummary(): Promise<{
  items: FBSummaryItem[];
  totalItems: number;
  outOfStock: number;
}> {
  const { data, error } = await supabaseAdmin
    .from("menu_items")
    .select("id,name,price,is_available,menu_categories(name)")
    .order("sort_order");
  if (error) throw error;

  const items: FBSummaryItem[] = (data || []).map((row: any) => ({
    id: row.id,
    name: row.name,
    category: row.menu_categories?.name ?? "Uncategorized",
    price: row.price ?? 0, // whole XAF
    status: row.is_available ? "available" : "out_of_stock",
  }));

  return {
    items,
    totalItems: items.length,
    outOfStock: items.filter((i) => i.status === "out_of_stock").length,
  };
}

export async function getHousekeepingTasks(): Promise<
  { room: string; task: string; dueDate: string }[]
> {
  // Return rooms with dirty housekeeping_status
  const { data } = await supabaseAdmin
    .from("rooms")
    .select("unit_code,housekeeping_status")
    .eq("housekeeping_status", "dirty")
    .limit(10);

  return (data || []).map(
    (r: { unit_code: string; housekeeping_status: string }) => ({
      room: r.unit_code,
      task: "Clean & refresh",
      dueDate: "Today",
    }),
  );
}

// Note: Removed duplicate getHousekeepingTasks function that was previously defined above

// ── Reporting views ──────────────────────────────────────────────────────────

export interface RevenuePoint {
  day: string;
  revenue: number; // XAF (whole francs)
}

export interface RevenueMonthPoint {
  month: string;
  revenue: number;
}

export interface RoomTypeRevenue {
  room_type: string;
  revenue: number;
}

export interface OccupancyPoint {
  day: string;
  occupancy_pct: number;
  occupied_rooms: number;
  total_rooms: number;
}

export async function getRevenueDaily(): Promise<RevenuePoint[]> {
  const { data, error } = await supabaseAdmin
    .from("revenue_daily")
    .select("day,revenue_minor")
    .order("day", { ascending: true })
    .limit(30);
  if (error) return [];
  return (data || []).map((row: { day: string; revenue_minor: number }) => ({
    day: row.day,
    revenue: row.revenue_minor / 100,
  }));
}

export async function getRevenueMonthly(): Promise<RevenueMonthPoint[]> {
  const { data, error } = await supabaseAdmin
    .from("revenue_monthly")
    .select("month,revenue_minor")
    .order("month", { ascending: true })
    .limit(12);
  if (error) return [];
  return (data || []).map((row: { month: string; revenue_minor: number }) => ({
    month: row.month,
    revenue: row.revenue_minor / 100,
  }));
}

export async function getRevenueByRoomType(): Promise<RoomTypeRevenue[]> {
  const { data, error } = await supabaseAdmin
    .from("revenue_by_room_type")
    .select("room_type,revenue_minor");
  if (error) return [];
  return (data || []).map(
    (row: { room_type: string; revenue_minor: number }) => ({
      room_type: row.room_type,
      revenue: row.revenue_minor / 100,
    }),
  );
}

export async function getOccupancyDaily(): Promise<OccupancyPoint[]> {
  const { data, error } = await supabaseAdmin
    .from("occupancy_daily")
    .select("day,occupancy_pct,occupied_rooms,total_rooms")
    .order("day", { ascending: true });
  if (error) return [];
  return (data || []).map(
    (row: {
      day: string;
      occupancy_pct: number;
      occupied_rooms: number;
      total_rooms: number;
    }) => ({
      day: row.day,
      occupancy_pct: Number(row.occupancy_pct) || 0,
      occupied_rooms: row.occupied_rooms,
      total_rooms: row.total_rooms,
    }),
  );
}

export interface HrLeaveSummary {
  leave_type: string;
  pending_count: number;
  approved_count: number;
  rejected_count: number;
  total_days_approved: number | null;
}

export async function getHrLeaveSummary(): Promise<HrLeaveSummary[]> {
  const { data, error } = await supabaseAdmin
    .from("hr_leave_summary")
    .select(
      "leave_type,pending_count,approved_count,rejected_count,total_days_approved",
    );
  if (error) return [];
  return (data || []) as HrLeaveSummary[];
}

export interface PayrollMonthSummary {
  period_label: string;
  period_start: string;
  status: string;
  gross_total_minor: number;
  net_total_minor: number;
  staff_count: number;
  paid_count: number;
}

export async function getPayrollMonthly(): Promise<PayrollMonthSummary[]> {
  const { data, error } = await supabaseAdmin
    .from("payroll_monthly")
    .select(
      "period_label,period_start,period_end,status,gross_total_minor,net_total_minor,staff_count,paid_count",
    )
    .order("period_start", { ascending: false })
    .limit(12);
  if (error) return [];
  return (data || []) as PayrollMonthSummary[];
}
