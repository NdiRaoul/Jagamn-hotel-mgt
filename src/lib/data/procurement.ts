import { supabaseAdmin } from "@/lib/supabase-server";

export interface PurchaseOrder {
  id: string;
  po_number: string;
  supplier_id: string | null;
  supplier_name: string | null;
  description: string;
  total_minor: number;
  currency: string;
  status: string;
  priority: string;
  department: string | null;
  ordered_at: string | null;
  delivered_at: string | null;
  created_at: string;
  notes: string | null;
}

export interface Supplier {
  id: string;
  name: string;
  category: string | null;
  contact: string | null;
  email: string | null;
  phone: string | null;
  rating: number;
  is_active: boolean;
}

export interface ProcurementBudget {
  id: string;
  department: string;
  year: number;
  month: number | null;
  budget_minor: number;
}

export interface ProcurementKpis {
  pendingApproval: number;
  inTransit: number;
  deliveredThisMonth: number;
  totalSpendMinor: number;
}

export async function getPurchaseOrders(filters?: {
  status?: string;
  query?: string;
  from?: string;
  to?: string;
}): Promise<PurchaseOrder[]> {
  let query = supabaseAdmin
    .from("purchase_orders")
    .select(
      "id,po_number,supplier_id,description,total_minor,currency,status,priority,department,ordered_at,delivered_at,created_at,notes,suppliers(name)",
    )
    .order("created_at", { ascending: false });

  if (filters?.status && filters.status !== "all") {
    query = query.eq("status", filters.status);
  }
  if (filters?.query) {
    const q = filters.query.trim();
    query = query.or(`description.ilike.%${q}%,po_number.ilike.%${q}%`);
  }
  if (filters?.from) query = query.gte("created_at", filters.from);
  if (filters?.to) query = query.lte("created_at", filters.to + "T23:59:59");

  const { data, error } = await query.limit(200);
  if (error) throw error;

  return (data || []).map((row: any) => ({
    id: row.id,
    po_number: row.po_number,
    supplier_id: row.supplier_id,
    supplier_name: row.suppliers?.name ?? null,
    description: row.description,
    total_minor: row.total_minor,
    currency: row.currency,
    status: row.status,
    priority: row.priority,
    department: row.department,
    ordered_at: row.ordered_at,
    delivered_at: row.delivered_at,
    created_at: row.created_at,
    notes: row.notes,
  }));
}

export async function getSuppliers(): Promise<Supplier[]> {
  const { data, error } = await supabaseAdmin
    .from("suppliers")
    .select("id,name,category,contact,email,phone,rating,is_active")
    .eq("is_active", true)
    .order("name");
  if (error) throw error;
  return (data || []) as Supplier[];
}

export async function getBudgets(): Promise<ProcurementBudget[]> {
  const year = new Date().getFullYear();
  const { data, error } = await supabaseAdmin
    .from("procurement_budgets")
    .select("id,department,year,month,budget_minor")
    .eq("year", year)
    .order("department");
  if (error) throw error;
  return (data || []) as ProcurementBudget[];
}

export async function getProcurementKpis(): Promise<ProcurementKpis> {
  const now = new Date();
  const monthStart = new Date(
    now.getFullYear(),
    now.getMonth(),
    1,
  ).toISOString();

  const [pendingRes, inTransitRes, deliveredRes, spendRes] = await Promise.all([
    supabaseAdmin
      .from("purchase_orders")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending_approval"),
    supabaseAdmin
      .from("purchase_orders")
      .select("id", { count: "exact", head: true })
      .eq("status", "in_transit"),
    supabaseAdmin
      .from("purchase_orders")
      .select("id", { count: "exact", head: true })
      .eq("status", "delivered")
      .gte("delivered_at", monthStart),
    supabaseAdmin
      .from("purchase_orders")
      .select("total_minor")
      .neq("status", "cancelled"),
  ]);

  const totalSpend = (spendRes.data || []).reduce(
    (sum: number, row: { total_minor: number }) => sum + (row.total_minor || 0),
    0,
  );

  return {
    pendingApproval: pendingRes.count ?? 0,
    inTransit: inTransitRes.count ?? 0,
    deliveredThisMonth: deliveredRes.count ?? 0,
    totalSpendMinor: totalSpend,
  };
}
