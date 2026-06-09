import { supabaseAdmin } from "@/lib/supabase-server";

export type StockStatus = "OPTIMAL" | "REORDER PENDING" | "BELOW THRESHOLD";

export interface StoreInventoryItem {
  id: string;
  name: string;
  category: string | null;
  unit: string;
  on_hand: number;
  reorder_level: number;
  max_stock: number;
  status: StockStatus; // derived
  image_url: string | null;
  last_counted_at: string | null;
}

export interface StoreInventoryRequest {
  id: string;
  item_id: string | null;
  item_name: string;
  quantity: number;
  unit: string | null; // joined from inventory_items
  status: "requested" | "approved" | "fulfilled" | "rejected";
  notes: string | null;
  requested_by_name: string | null;
  created_at: string;
}

export interface StorePurchaseOrder {
  id: string;
  po_number: string;
  supplier_name: string | null;
  description: string;
  item_count: number;
  total_xaf: number; // whole francs (total_minor / 100)
  status: string; // pending_approval|approved|ordered|in_transit|delivered|cancelled
  priority: string;
  created_at: string;
}

export interface StoreKpis {
  activeSkus: number;
  criticalAlerts: number; // inventory_low_stock count
  openOrders: number; // not delivered/cancelled
  pendingReceipt: number; // in_transit
  stockInToday: number;
  stockOutToday: number;
}

function deriveStatus(on_hand: number, reorder: number, max: number): StockStatus {
  if (on_hand <= reorder) return "BELOW THRESHOLD";
  if (on_hand <= reorder * 2 || on_hand <= max * 0.4) return "REORDER PENDING";
  return "OPTIMAL";
}

export async function getStoreInventory(): Promise<StoreInventoryItem[]> {
  const { data, error } = await supabaseAdmin
    .from("inventory_items")
    .select(
      "id,name,category,unit,on_hand,reorder_level,max_stock,image_url,last_counted_at",
    )
    .eq("is_active", true)
    .order("name");
  if (error) throw error;
  return (data || []).map((r: any) => {
    const max = r.max_stock ?? Math.max(r.reorder_level * 4, r.on_hand);
    return {
      id: r.id,
      name: r.name,
      category: r.category,
      unit: r.unit,
      on_hand: r.on_hand,
      reorder_level: r.reorder_level,
      max_stock: max,
      status: deriveStatus(r.on_hand, r.reorder_level, max),
      image_url: r.image_url ?? null,
      last_counted_at: r.last_counted_at ?? null,
    };
  });
}

export type PredictiveStatus =
  | "HIGH RISK OF DEPLETION"
  | "STABLE"
  | "MONITOR";

export interface PredictiveStockItem {
  id: string;
  name: string;
  status: PredictiveStatus;
}

/**
 * Real predictive stock analysis (replaces the old mock list).
 *
 * Depletion risk is derived from live on-hand vs reorder/max thresholds, then
 * amplified by outstanding (requested/approved) inventory requests that will
 * draw the item down further, and by next-week occupancy pressure. Items are
 * returned worst-risk-first so the dashboard panel highlights what to reorder.
 */
export async function getPredictiveStock(limit = 6): Promise<{
  items: PredictiveStockItem[];
  occupancyPct: number;
}> {
  const [{ data: inv }, { data: openRequests }, occupancyPct] =
    await Promise.all([
      supabaseAdmin
        .from("inventory_items")
        .select("id,name,on_hand,reorder_level,max_stock")
        .eq("is_active", true),
      supabaseAdmin
        .from("inventory_requests")
        .select("item_id,quantity")
        .in("status", ["requested", "approved"]),
      getOccupancyPct(),
    ]);

  // Sum outstanding demand per item.
  const demandByItem = new Map<string, number>();
  for (const r of openRequests ?? []) {
    if (!r.item_id) continue;
    demandByItem.set(
      r.item_id,
      (demandByItem.get(r.item_id) ?? 0) + (r.quantity ?? 0),
    );
  }

  // Occupancy raises projected consumption (more guests → faster depletion).
  const occupancyFactor = 1 + occupancyPct / 100;

  const scored = (inv ?? []).map((r: any) => {
    const reorder = r.reorder_level ?? 0;
    const max = r.max_stock ?? Math.max(reorder * 4, r.on_hand);
    const projectedOut = (demandByItem.get(r.id) ?? 0) * occupancyFactor;
    const projectedOnHand = r.on_hand - projectedOut;

    let status: PredictiveStatus = "STABLE";
    if (projectedOnHand <= reorder) {
      status = "HIGH RISK OF DEPLETION";
    } else if (projectedOnHand <= reorder * 2 || projectedOnHand <= max * 0.4) {
      status = "MONITOR";
    }

    // Lower headroom ratio = higher risk (used only for sorting).
    const headroom = max > 0 ? projectedOnHand / max : 0;
    return { id: r.id, name: r.name, status, headroom };
  });

  const rank: Record<PredictiveStatus, number> = {
    "HIGH RISK OF DEPLETION": 0,
    MONITOR: 1,
    STABLE: 2,
  };
  scored.sort(
    (a, b) => rank[a.status] - rank[b.status] || a.headroom - b.headroom,
  );

  return {
    items: scored
      .slice(0, limit)
      .map(({ id, name, status }) => ({ id, name, status })),
    occupancyPct,
  };
}

/** Rough hotel occupancy %: active rooms with a booking spanning today. */
async function getOccupancyPct(): Promise<number> {
  const todayKey = new Date().toISOString().slice(0, 10);
  const [{ count: totalRooms }, { data: occupied }] = await Promise.all([
    supabaseAdmin
      .from("rooms")
      .select("id", { count: "exact", head: true })
      .eq("is_active", true),
    supabaseAdmin
      .from("bookings")
      .select("room_id")
      .not("status", "in", "(cancelled,expired,checked_out,completed,pending)")
      .lte("check_in", todayKey)
      .gt("check_out", todayKey),
  ]);

  const occupiedCount = new Set(
    (occupied ?? []).map((b: any) => b.room_id).filter(Boolean),
  ).size;
  if (!totalRooms || totalRooms === 0) return 0;
  return Math.round((occupiedCount / totalRooms) * 100);
}

export async function getInventoryRequests(
  statuses: string[] = ["requested", "approved"],
): Promise<StoreInventoryRequest[]> {
  const { data, error } = await supabaseAdmin
    .from("inventory_requests")
    .select(
      `id,item_id,item_name,quantity,status,notes,created_at,
       staff:requested_by(full_name),
       inventory_items:item_id(unit)`,
    )
    .in("status", statuses)
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) throw error;
  return (data || []).map((r: any) => ({
    id: r.id,
    item_id: r.item_id,
    item_name: r.item_name,
    quantity: r.quantity,
    unit: r.inventory_items?.unit ?? null,
    status: r.status,
    notes: r.notes,
    requested_by_name: r.staff?.full_name ?? "Kitchen",
    created_at: r.created_at,
  }));
}

export async function getStorePurchaseOrders(filters?: {
  status?: string;
}): Promise<StorePurchaseOrder[]> {
  let q = supabaseAdmin
    .from("purchase_orders")
    .select(
      `id,po_number,description,total_minor,status,priority,created_at,
       suppliers(name), purchase_order_items(count)`,
    )
    .order("created_at", { ascending: false })
    .limit(200);
  if (filters?.status && filters.status !== "all") q = q.eq("status", filters.status);
  const { data, error } = await q;
  if (error) throw error;
  return (data || []).map((r: any) => ({
    id: r.id,
    po_number: r.po_number,
    supplier_name: r.suppliers?.name ?? null,
    description: r.description,
    item_count: r.purchase_order_items?.[0]?.count ?? 0,
    total_xaf: Math.round((r.total_minor ?? 0) / 100), // divide here
    status: r.status,
    priority: r.priority,
    created_at: r.created_at,
  }));
}

export async function getStoreKpis(): Promise<StoreKpis> {
  const [skus, crit, open, transit, today] = await Promise.all([
    supabaseAdmin
      .from("inventory_items")
      .select("id", { count: "exact", head: true })
      .eq("is_active", true),
    supabaseAdmin
      .from("inventory_low_stock")
      .select("id", { count: "exact", head: true }),
    supabaseAdmin
      .from("purchase_orders")
      .select("id", { count: "exact", head: true })
      .not("status", "in", "(delivered,cancelled)"),
    supabaseAdmin
      .from("purchase_orders")
      .select("id", { count: "exact", head: true })
      .eq("status", "in_transit"),
    supabaseAdmin.from("storekeeper_stock_today").select("*").single(),
  ]);
  return {
    activeSkus: skus.count ?? 0,
    criticalAlerts: crit.count ?? 0,
    openOrders: open.count ?? 0,
    pendingReceipt: transit.count ?? 0,
    stockInToday: today.data?.stock_in_today ?? 0,
    stockOutToday: today.data?.stock_out_today ?? 0,
  };
}

// ── Reports ────────────────────────────────────────────────────────────────

export interface StoreReports {
  valuationByCategory: Array<{ category: string; value_xaf: number; skus: number }>;
  totalValuationXaf: number;
  stockMovement: Array<{ day: string; inflow: number; outflow: number }>;
  lowStock: Array<{
    id: string;
    name: string;
    category: string | null;
    on_hand: number;
    reorder_level: number;
    unit: string;
    image_url: string | null;
  }>;
  poHistory: StorePurchaseOrder[];
  consumption: Array<{ item_name: string; total_qty: number }>;
}

export async function getStoreReports(): Promise<StoreReports> {
  const [inventory, poItemsRes, lowStockRes, poHistory, fulfilledRes, deliveredRes] =
    await Promise.all([
      getStoreInventory(),
      supabaseAdmin
        .from("purchase_order_items")
        .select("description,unit_price_minor"),
      supabaseAdmin
        .from("inventory_low_stock")
        .select("id,name,category,on_hand,reorder_level,unit,image_url"),
      getStorePurchaseOrders(),
      supabaseAdmin
        .from("inventory_requests")
        .select("item_name,quantity,fulfilled_at,status")
        .eq("status", "fulfilled")
        .order("fulfilled_at", { ascending: false })
        .limit(500),
      supabaseAdmin
        .from("purchase_orders")
        .select("delivered_at,status")
        .eq("status", "delivered")
        .order("delivered_at", { ascending: false })
        .limit(500),
    ]);

  // Best-effort unit-cost map from PO line items (description → latest price in francs)
  const priceMap = new Map<string, number>();
  for (const it of (poItemsRes.data as any[]) || []) {
    const key = (it.description || "").toLowerCase();
    if (key && !priceMap.has(key)) {
      priceMap.set(key, Math.round((it.unit_price_minor ?? 0) / 100));
    }
  }
  const lookupPrice = (name: string): number => {
    const n = name.toLowerCase();
    for (const [k, v] of priceMap) {
      if (k.includes(n) || n.includes(k)) return v;
    }
    return 0;
  };

  const catMap = new Map<string, { value_xaf: number; skus: number }>();
  let totalValuationXaf = 0;
  for (const item of inventory) {
    const cat = item.category ?? "Uncategorised";
    const value = item.on_hand * lookupPrice(item.name);
    totalValuationXaf += value;
    const entry = catMap.get(cat) ?? { value_xaf: 0, skus: 0 };
    entry.value_xaf += value;
    entry.skus += 1;
    catMap.set(cat, entry);
  }
  const valuationByCategory = Array.from(catMap.entries())
    .map(([category, v]) => ({ category, value_xaf: v.value_xaf, skus: v.skus }))
    .sort((a, b) => b.value_xaf - a.value_xaf);

  // Stock movement: last 7 days, outflow = fulfilled requests qty, inflow = delivered POs count
  const days: string[] = [];
  const dayKey = (d: Date) => d.toISOString().split("T")[0];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(dayKey(d));
  }
  const outflowMap = new Map<string, number>();
  for (const r of (fulfilledRes.data as any[]) || []) {
    if (!r.fulfilled_at) continue;
    const k = dayKey(new Date(r.fulfilled_at));
    outflowMap.set(k, (outflowMap.get(k) ?? 0) + (r.quantity ?? 0));
  }
  const inflowMap = new Map<string, number>();
  for (const r of (deliveredRes.data as any[]) || []) {
    if (!r.delivered_at) continue;
    const k = dayKey(new Date(r.delivered_at));
    inflowMap.set(k, (inflowMap.get(k) ?? 0) + 1);
  }
  const stockMovement = days.map((day) => ({
    day,
    inflow: inflowMap.get(day) ?? 0,
    outflow: outflowMap.get(day) ?? 0,
  }));

  // Consumption: aggregate fulfilled request quantities by item
  const consMap = new Map<string, number>();
  for (const r of (fulfilledRes.data as any[]) || []) {
    consMap.set(r.item_name, (consMap.get(r.item_name) ?? 0) + (r.quantity ?? 0));
  }
  const consumption = Array.from(consMap.entries())
    .map(([item_name, total_qty]) => ({ item_name, total_qty }))
    .sort((a, b) => b.total_qty - a.total_qty)
    .slice(0, 10);

  return {
    valuationByCategory,
    totalValuationXaf,
    stockMovement,
    lowStock: ((lowStockRes.data as any[]) || []).map((r) => ({
      id: r.id,
      name: r.name,
      category: r.category,
      on_hand: r.on_hand,
      reorder_level: r.reorder_level,
      unit: r.unit,
      image_url: r.image_url ?? null,
    })),
    poHistory,
    consumption,
  };
}
