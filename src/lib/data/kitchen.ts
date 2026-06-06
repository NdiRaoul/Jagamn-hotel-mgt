import { supabaseAdmin } from "@/lib/supabase-server";

export interface KitchenOrder {
  id: string;
  displayId: string;
  timeAgo: string;
  dish: string;
  modifiers: string;
  location: string;
  server: string;
  status: "new" | "pending_stock" | "in_preparation" | "ready";
  actionRequired?: boolean;
  stockAlert?: string;
  currentStock?: number;
  stockUnit?: string;
  prepProgress?: number;
  stockConfirmed?: boolean;
  guestName?: string;
  guestRoom?: string;
  items?: Array<{ name: string; quantity: number; unit_price: number }>;
  created_at: string;
  updated_at: string;
}

export interface KitchenStats {
  avgPrepTime: number; // in minutes
  lowStockAlerts: number;
  todayOrderVolume: number;
  efficiencyMessage: string;
}

export interface InventoryRequest {
  id: string;
  orderId: string;
  dish: string;
  status: "confirmed" | "insufficient" | "awaiting" | "system_alert";
  items?: Array<{ name: string; amount: string; available?: boolean }>;
  storeKeeperNote?: string;
  alertMessage?: string;
  requested_by_name?: string;
  created_at: string;
  updated_at: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: string | null;
  unit: string;
  on_hand: number;
  reorder_level: number;
  is_active: boolean;
}

export interface DiningReporting {
  dailyOrders: Array<{ day: string; order_count: number; revenue: number }>;
  topItems: Array<{
    item_name: string;
    total_ordered: number;
    total_revenue: number;
  }>;
  statusSummary: Array<{
    status: string;
    order_count: number;
    total_amount: number;
  }>;
  unavailableItems: Array<{
    id: string;
    name: string;
    category: string | null;
  }>;
  hourlyVolume: Array<{ hour: string; dineIn: number; roomService: number }>;
}

/**
 * Get active dining orders with guest/room info for the kitchen Orders board
 */
export async function getKitchenOrders(): Promise<KitchenOrder[]> {
  const { data, error } = await supabaseAdmin
    .from("dining_orders")
    .select(
      `
      id,
      status,
      notes,
      created_at,
      updated_at,
      app_user_id,
      booking_id,
      guest_email,
      dining_order_items (
        id,
        item_name,
        quantity,
        unit_price
      ),
      bookings (
        guest_name,
        rooms (
          unit_code
        )
      )
    `,
    )
    .in("status", ["placed", "preparing", "ready"])
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data || []).map((order: any) => {
    const items = order.dining_order_items || [];
    const dish =
      items.map((i: any) => `${i.quantity}x ${i.item_name}`).join(", ") ||
      "Order";
    const modifiers = order.notes || "";
    const booking = order.bookings;
    const guestName = booking?.guest_name || "Guest";
    const guestRoom = booking?.rooms?.unit_code || "";

    // Map DB status to kitchen board status
    let boardStatus: KitchenOrder["status"] = "new";
    if (order.status === "placed") boardStatus = "new";
    else if (order.status === "preparing") boardStatus = "in_preparation";
    else if (order.status === "ready") boardStatus = "ready";

    const now = new Date();
    const created = new Date(order.created_at);
    const diffMs = now.getTime() - created.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const timeAgo =
      diffMins < 1
        ? "Just now"
        : diffMins < 60
          ? `${diffMins}m ago`
          : `${Math.floor(diffMins / 60)}h ago`;

    return {
      id: order.id,
      displayId: `JGM-${order.id.slice(0, 4).toUpperCase()}`,
      timeAgo,
      dish,
      modifiers,
      location: guestRoom ? `Room ${guestRoom}` : "Dining Hall",
      server: "Kitchen",
      status: boardStatus,
      guestName,
      guestRoom: guestRoom || undefined,
      items: items.map((i: any) => ({
        name: i.item_name,
        quantity: i.quantity,
        unit_price: i.unit_price,
      })),
      created_at: order.created_at,
      updated_at: order.updated_at,
    };
  });
}

/**
 * Get kitchen statistics for the bottom cards
 */
export async function getKitchenStats(): Promise<KitchenStats> {
  // Avg prep time: time from placed → ready for today's completed orders
  const { data: completedToday } = await supabaseAdmin
    .from("dining_orders")
    .select("created_at, updated_at")
    .eq("status", "delivered")
    .gte("created_at", new Date(new Date().setHours(0, 0, 0, 0)).toISOString())
    .order("created_at", { ascending: false });

  let avgPrepTime = 18; // default
  if (completedToday && completedToday.length > 0) {
    const times = completedToday.map((o: any) => {
      const start = new Date(o.created_at).getTime();
      const end = new Date(o.updated_at).getTime();
      return (end - start) / 60000; // minutes
    });
    avgPrepTime = Math.round(times.reduce((a, b) => a + b, 0) / times.length);
  }

  // Low stock alerts from inventory_low_stock view
  const { data: lowStock } = await supabaseAdmin
    .from("inventory_low_stock")
    .select("id");
  const lowStockAlerts = lowStock?.length || 0;

  // Today's order volume from dining_daily view
  const today = new Date().toISOString().split("T")[0];
  const { data: dailyData } = await supabaseAdmin
    .from("dining_daily")
    .select("order_count")
    .eq("day", today)
    .single();
  const todayOrderVolume = dailyData?.order_count || 0;

  const efficiencyMessage =
    todayOrderVolume > 40
      ? "High Operational Flow"
      : todayOrderVolume > 20
        ? "Steady Operations"
        : "Low Activity";

  return {
    avgPrepTime,
    lowStockAlerts,
    todayOrderVolume,
    efficiencyMessage,
  };
}

/**
 * Get inventory requests for the kitchen inventory page
 */
export async function getInventoryRequests(): Promise<InventoryRequest[]> {
  const { data, error } = await supabaseAdmin
    .from("inventory_requests")
    .select(
      `
      id,
      item_name,
      quantity,
      status,
      notes,
      created_at,
      updated_at,
      staff:requested_by (
        full_name
      ),
      inventory_items:item_id (
        unit
      )
    `,
    )
    .in("status", ["requested", "approved", "fulfilled", "rejected"])
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) throw error;

  return (data || []).map((req: any) => {
    // Map storekeeper status → kitchen UI state
    let mappedStatus: InventoryRequest["status"] = "awaiting";
    let alertMessage: string | undefined;
    if (req.status === "fulfilled") mappedStatus = "confirmed";
    else if (req.status === "approved") mappedStatus = "awaiting";
    else if (req.status === "rejected") {
      mappedStatus = "system_alert";
      alertMessage = `Request for ${req.item_name} was rejected by the storekeeper.`;
    } else mappedStatus = "awaiting";

    const unit = req.inventory_items?.unit ?? "units";

    return {
      id: req.id,
      orderId: `#JP-${req.id.slice(0, 4).toUpperCase()}`,
      dish: req.item_name,
      status: mappedStatus,
      items: [
        {
          name: req.item_name,
          amount: `${req.quantity} ${unit}`,
        },
      ],
      storeKeeperNote: req.notes || undefined,
      alertMessage,
      requested_by_name: req.staff?.full_name || "Kitchen",
      created_at: req.created_at,
      updated_at: req.updated_at,
    };
  });
}

/**
 * Get kitchen inventory items
 */
export async function getKitchenInventory(): Promise<InventoryItem[]> {
  const { data, error } = await supabaseAdmin
    .from("inventory_items")
    .select("id, name, category, unit, on_hand, reorder_level, is_active")
    .eq("is_active", true)
    .order("name");

  if (error) throw error;
  return data || [];
}

/**
 * Get dining reporting data
 */
export async function getDiningReporting(): Promise<DiningReporting> {
  // Daily orders (last 30 days)
  const { data: daily } = await supabaseAdmin
    .from("dining_daily")
    .select("day, order_count, revenue")
    .gte(
      "day",
      new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
    )
    .order("day", { ascending: true });

  // Top items
  const { data: topItems } = await supabaseAdmin
    .from("dining_top_items")
    .select("item_name, total_ordered, total_revenue")
    .limit(10);

  // Status summary
  const { data: statusSummary } = await supabaseAdmin
    .from("dining_order_status_summary")
    .select("status, order_count, total_amount");

  // Unavailable menu items
  const { data: unavailable } = await supabaseAdmin
    .from("menu_items")
    .select("id, name, category:menu_categories(name)")
    .eq("is_available", false);

  // Hourly volume (today's orders grouped by hour)
  const todayStart = new Date(new Date().setHours(0, 0, 0, 0)).toISOString();
  const { data: ordersToday } = await supabaseAdmin
    .from("dining_orders")
    .select("created_at, booking_id")
    .gte("created_at", todayStart)
    .neq("status", "cancelled");

  // Group by hour
  const hourlyMap = new Map<number, { dineIn: number; roomService: number }>();
  for (let h = 0; h < 24; h++) {
    hourlyMap.set(h, { dineIn: 0, roomService: 0 });
  }
  (ordersToday || []).forEach((o: any) => {
    const hour = new Date(o.created_at).getHours();
    const entry = hourlyMap.get(hour)!;
    if (o.booking_id) entry.roomService++;
    else entry.dineIn++;
  });

  const hourlyVolume = Array.from(hourlyMap.entries())
    .filter(([h]) => h >= 6 && h <= 22) // 6am-10pm
    .map(([h, counts]) => ({
      hour: `${h.toString().padStart(2, "0")}:00`,
      dineIn: counts.dineIn,
      roomService: counts.roomService,
    }));

  return {
    dailyOrders: daily || [],
    topItems: topItems || [],
    statusSummary: statusSummary || [],
    unavailableItems: (unavailable || []).map((item: any) => ({
      id: item.id,
      name: item.name,
      category: item.category?.name || null,
    })),
    hourlyVolume,
  };
}
