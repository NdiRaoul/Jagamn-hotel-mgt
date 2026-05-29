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
  let query = supabaseAdmin
    .from("payments")
    .select("amount,status");

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
      "id,auth_user_id,full_name,email,role,status,avatar_url,must_reset_pw,staff_code,phone,department,position,salary,hire_date,created_at,updated_at",
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
  // TODO: Add a dedicated procurement table and rewire this into the procurement workflow.
  return [
    { item: "Mini-bar stock", priority: "high", status: "Reorder needed" },
    { item: "Laundry detergent", priority: "medium", status: "Low inventory" },
  ];
}

export async function getHousekeepingTasks(): Promise<
  { room: string; task: string; dueDate: string }[]
> {
  return [
    { room: "305", task: "Deep clean", dueDate: "Today" },
    { room: "204", task: "Refresh linens", dueDate: "Today" },
  ];
}

export interface PayrollRow {
  id: string;
  name: string;
  role: string;
  department: string | null;
  gross: number;
  net: number;
  avatarUrl: string | null;
}

// TODO: payroll tables are pending — returns staff salary data until staff_payroll table is created.
export async function getPayrollSummary(): Promise<{
  rows: PayrollRow[];
  staffCount: number;
}> {
  const staff = await getStaffRoster();
  const rows: PayrollRow[] = staff.map((s) => ({
    id: s.id,
    name: s.full_name,
    role: s.role,
    department: s.department,
    gross: s.salary ?? 0,
    net: s.salary ? Math.round(s.salary * 0.85) : 0,
    avatarUrl: s.avatar_url,
  }));
  return { rows, staffCount: staff.length };
}

export interface FBSummaryItem {
  id: string;
  name: string;
  category: string;
  price: number;
  status: "available" | "out_of_stock";
}

// TODO: food_and_beverage_items table is pending — returns empty until created.
export async function getFoodAndBeverageSummary(): Promise<{
  items: FBSummaryItem[];
  totalItems: number;
  outOfStock: number;
}> {
  return { items: [], totalItems: 0, outOfStock: 0 };
}
