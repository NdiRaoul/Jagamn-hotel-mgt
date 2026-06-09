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

type SupabaseDiningOrderRow = {
  id: string;
  app_user_id: string | null;
  booking_id: string | null;
  guest_email: string | null;
  total_amount: number;
  status: string;
  notes: string | null;
  created_at: string;
  bookings?: {
    room_id?: string | null;
    rooms?: { unit_code?: string } | Array<{ unit_code?: string }> | null;
  } | null;
  dining_order_items?: DiningOrderItem[] | null;
};

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

  const rows = (data || []) as SupabaseDiningOrderRow[];

  return rows.map((order) => {
    const roomsRel = order.bookings?.rooms;
    const room = Array.isArray(roomsRel) ? roomsRel[0] : roomsRel;

    return {
      id: order.id,
      app_user_id: order.app_user_id,
      booking_id: order.booking_id,
      guest_email: order.guest_email,
      room_number: room?.unit_code || null,
      total_amount: order.total_amount,
      status: order.status,
      notes: order.notes,
      created_at: order.created_at,
      items: order.dining_order_items || [],
    };
  });
}

export async function getGuestBookingRoomInfo(appUserId: string): Promise<{
  roomId?: string;
  roomUnit?: string;
  roomType?: string;
} | null> {
  const { data, error } = await supabaseAdmin
    .from("bookings")
    .select(`room_id, rooms ( unit_code ), room_types ( name )`)
    .eq("app_user_id", appUserId)
    .eq("status", "checked_in")
    .order("check_in", { ascending: false })
    .limit(1)
    .single();

  if (error || !data) return null;

  const roomsRel = data.rooms;
  const room = Array.isArray(roomsRel) ? roomsRel[0] : roomsRel;
  const roomTypeRel = data.room_types;
  const roomType = Array.isArray(roomTypeRel) ? roomTypeRel[0] : roomTypeRel;

  return {
    roomId: data.room_id || undefined,
    roomUnit: room?.unit_code || undefined,
    roomType: roomType?.name || undefined,
  };
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
