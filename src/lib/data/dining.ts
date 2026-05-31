import { supabaseAdmin } from "@/lib/supabase-server";

export interface DiningOrder {
  id: string;
  app_user_id: string | null;
  booking_id: string | null;
  guest_email: string | null;
  room_number: string | null;
  total_amount: number;
  status: string;
  notes: string | null;
  created_at: string;
  items: DiningOrderItem[];
}

export interface DiningOrderItem {
  id: string;
  order_id: string;
  menu_item_id: string | null;
  item_name: string;
  quantity: number;
  unit_price: number;
}

export async function getDiningOrdersForGuest(
  appUserId: string,
): Promise<DiningOrder[]> {
  const { data, error } = await supabaseAdmin
    .from("dining_orders")
    .select(
      `
      id,
      app_user_id,
      booking_id,
      guest_email,
      total_amount,
      status,
      notes,
      created_at,
      bookings (
        room_id,
        rooms (
          unit_code
        )
      ),
      dining_order_items (
        id,
        order_id,
        menu_item_id,
        item_name,
        quantity,
        unit_price
      )
    `,
    )
    .eq("app_user_id", appUserId)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) throw error;

  return (data || []).map((order: any) => ({
    id: order.id,
    app_user_id: order.app_user_id,
    booking_id: order.booking_id,
    guest_email: order.guest_email,
    room_number: order.bookings?.rooms?.unit_code || null,
    total_amount: order.total_amount,
    status: order.status,
    notes: order.notes,
    created_at: order.created_at,
    items: order.dining_order_items || [],
  }));
}

export async function getGuestFolioBalance(bookingId: string): Promise<{
  booking_total_minor: number;
  charges_minor: number;
  paid_minor: number;
  balance_minor: number;
} | null> {
  const { data, error } = await supabaseAdmin
    .from("booking_folio_balance")
    .select("booking_total_minor,charges_minor,paid_minor,balance_minor")
    .eq("booking_id", bookingId)
    .single();

  if (error) return null;
  return data;
}
