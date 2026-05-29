import { supabaseAdmin } from "@/lib/supabase-server";
import type { Booking, Room, RoomType, Payment } from "@/types/database";

export interface ArrivalRecord {
  id: string;
  bookingRef: string;
  guestName: string;
  roomType: string;
  checkIn: string;
  status: "confirmed" | "completed" | "pending" | "cancelled";
  paymentStatus: string;
  actionHref: string | null;
}

export interface DepartureRecord {
  id: string;
  bookingRef: string;
  guestName: string;
  roomSlug: string;
  checkOut: string;
  status: "confirmed" | "completed" | "pending" | "cancelled";
  paymentStatus: string;
  balanceDue: number;
  actionHref: string | null;
}

export interface RoomBoardRoom {
  id: string;
  unitCode: string;
  floor: number | null;
  roomTypeName: string;
  status: "occupied" | "available" | "dirty" | "out_of_order";
  guestName: string | null;
  bookingRef: string | null;
}

export interface TransactionRecord {
  id: string;
  bookingRef: string | null;
  description: string;
  amount: number;
  currency: string;
  paymentMethod: string | null;
  provider: string | null;
  status: string;
  createdAt: string;
}

function toDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function normalizeRoomTypeName(roomType: RoomType | null | undefined) {
  return roomType?.name || "Standard Room";
}

export async function getArrivals(
  date: string = toDateKey(new Date()),
): Promise<ArrivalRecord[]> {
  const { data, error } = await supabaseAdmin
    .from("bookings")
    .select(
      "id,booking_ref,guest_name,room_type_id,room_types(name),check_in,status,payment_status",
    )
    .eq("check_in", date)
    .neq("status", "cancelled")
    .order("check_in", { ascending: true });

  if (error) {
    throw error;
  }

  return (data || []).map((booking: Booking & { room_types?: RoomType }) => ({
    id: booking.id,
    bookingRef: booking.booking_ref,
    guestName: booking.guest_name,
    roomType: normalizeRoomTypeName(booking.room_types),
    checkIn: booking.check_in,
    status: booking.status as ArrivalRecord["status"],
    paymentStatus: booking.payment_status || "pending",
    actionHref:
      booking.status !== "cancelled"
        ? `/reception/check-in/${booking.id}`
        : null,
  }));
}

export async function getDepartures(
  date: string = toDateKey(new Date()),
): Promise<DepartureRecord[]> {
  const { data, error } = await supabaseAdmin
    .from("bookings")
    .select(
      "id,booking_ref,guest_name,room_slug,check_out,total_amount,payment_status,status",
    )
    .eq("check_out", date)
    .neq("status", "cancelled")
    .order("check_out", { ascending: true });

  if (error) {
    throw error;
  }

  return (data || []).map((booking: Booking) => {
    const amountPaid = 0;
    return {
      id: booking.id,
      bookingRef: booking.booking_ref,
      guestName: booking.guest_name,
      roomSlug: booking.room_slug,
      checkOut: booking.check_out,
      status: booking.status as DepartureRecord["status"],
      paymentStatus: booking.payment_status || "pending",
      balanceDue: Math.max(0, booking.total_amount - amountPaid),
      actionHref:
        booking.status !== "completed"
          ? `/reception/departures/check-out/${booking.id}`
          : null,
    };
  });
}

export async function getRoomBoard(): Promise<RoomBoardRoom[]> {
  const today = new Date();
  const todayKey = toDateKey(today);

  const [{ data: rooms }, { data: roomTypes }, { data: activeBookings }] =
    await Promise.all([
      supabaseAdmin
        .from("rooms")
        .select("id,unit_code,floor,is_active,room_type_id"),
      supabaseAdmin.from("room_types").select("id,name"),
      supabaseAdmin
        .from("bookings")
        .select(
          "id,room_id,room_slug,guest_name,check_in,check_out,status,booking_ref",
        )
        .neq("status", "cancelled")
        .or(
          `and(check_in.lte.${todayKey},check_out.gt.${todayKey}),and(check_out.eq.${todayKey},status.eq.completed)`,
        ),
    ]);

  if (!rooms) throw new Error("Failed to load rooms");
  if (!roomTypes) throw new Error("Failed to load room types");

  const roomTypeMap = new Map(
    roomTypes.map((rt: RoomType) => [rt.id, rt.name]),
  );
  const bookingMap = new Map<string, Booking & { booking_ref: string }>();
  (activeBookings || []).forEach((booking: Booking) => {
    if (booking.room_id) {
      bookingMap.set(booking.room_id, booking);
    }
  });

  return (rooms || []).map((room: Room) => {
    const booking = bookingMap.get(room.id);
    const isActive = room.is_active;
    let status: RoomBoardRoom["status"] = "available";
    let guestName: string | null = null;
    let bookingRef: string | null = null;

    if (!isActive) {
      status = "out_of_order";
    } else if (booking) {
      bookingRef = booking.booking_ref;
      guestName = booking.guest_name;
      if (booking.status === "completed" && booking.check_out === todayKey) {
        status = "dirty";
      } else {
        status = "occupied";
      }
    }

    return {
      id: room.id,
      unitCode: room.unit_code,
      floor: room.floor,
      roomTypeName: roomTypeMap.get(room.room_type_id) || "Standard Room",
      status,
      guestName,
      bookingRef,
    };
  });
}

export async function searchFrontDesk(query: string): Promise<ArrivalRecord[]> {
  const q = query.trim();
  if (!q) return [];

  const { data, error } = await supabaseAdmin
    .from("bookings")
    .select(
      "id,booking_ref,guest_name,room_type_id,room_types(name),check_in,status,payment_status",
    )
    .or(
      `booking_ref.ilike.%${q}%,guest_name.ilike.%${q}%,guest_email.ilike.%${q}%,guest_phone.ilike.%${q}%`,
    )
    .neq("status", "cancelled")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    throw error;
  }

  return (data || []).map((booking: Booking & { room_types?: RoomType }) => ({
    id: booking.id,
    bookingRef: booking.booking_ref,
    guestName: booking.guest_name,
    roomType: normalizeRoomTypeName(booking.room_types),
    checkIn: booking.check_in,
    status: booking.status as ArrivalRecord["status"],
    paymentStatus: booking.payment_status || "pending",
    actionHref:
      booking.status !== "cancelled"
        ? `/reception/check-in/${booking.id}`
        : null,
  }));
}

export async function getRecentTransactions(): Promise<TransactionRecord[]> {
  const { data, error } = await supabaseAdmin
    .from("payments")
    .select(
      "id,booking_ref,amount,currency,payment_method,provider,status,created_at,bookings(guest_name,room_slug)",
    )
    .order("created_at", { ascending: false })
    .limit(6);

  if (error) {
    throw error;
  }

  return (data || []).map(
    (
      payment: Payment & {
        bookings?: { guest_name: string; room_slug: string };
      },
    ) => ({
      id: payment.id,
      bookingRef: payment.booking_ref,
      description: payment.bookings
        ? `${payment.bookings.guest_name} • ${payment.bookings.room_slug}`
        : `Payment ${payment.booking_ref || payment.id}`,
      amount: payment.amount / 100,
      currency: payment.currency,
      paymentMethod: payment.payment_method,
      provider: payment.provider,
      status: payment.status,
      createdAt: payment.created_at,
    }),
  );
}

export interface ActiveReservation {
  id: string;
  bookingRef: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string | null;
  roomSlug: string;
  roomTypeName: string;
  roomUnitCode: string | null;
  checkIn: string;
  checkOut: string;
  nights: number;
  guests: number;
  totalAmount: number;
  paymentStatus: string;
  status: string;
  specialRequests: string | null;
}

export interface TransactionRecord2 {
  paymentId: string;
  bookingRef: string | null;
  guestName: string | null;
  guestEmail: string | null;
  provider: string | null;
  amountMinor: number;
  currency: string;
  derivedStatus: string;
  eventType: string;
  eventAt: string;
}

export async function getActiveReservations(filters?: {
  query?: string;
  status?: string;
}): Promise<ActiveReservation[]> {
  let query = supabaseAdmin
    .from("bookings")
    .select(
      "id,booking_ref,guest_name,guest_email,guest_phone,room_slug,room_types(name),rooms(unit_code),check_in,check_out,nights,guests,total_amount,payment_status,status,special_requests",
    )
    .in("status", ["confirmed", "checked_in"])
    .order("check_in", { ascending: true });

  if (filters?.query) {
    const q = filters.query.trim();
    query = query.or(
      `booking_ref.ilike.%${q}%,guest_name.ilike.%${q}%,guest_email.ilike.%${q}%`,
    );
  }

  if (filters?.status && filters.status !== "all") {
    query = query.eq("status", filters.status);
  }

  const { data, error } = await query.limit(100);
  if (error) throw error;

  return (data || []).map((b: any) => ({
    id: b.id,
    bookingRef: b.booking_ref,
    guestName: b.guest_name,
    guestEmail: b.guest_email,
    guestPhone: b.guest_phone,
    roomSlug: b.room_slug,
    roomTypeName: b.room_types?.name ?? b.room_slug,
    roomUnitCode: b.rooms?.unit_code ?? null,
    checkIn: b.check_in,
    checkOut: b.check_out,
    nights: b.nights,
    guests: b.guests,
    totalAmount: b.total_amount,
    paymentStatus: b.payment_status,
    status: b.status,
    specialRequests: b.special_requests,
  }));
}

export async function getTransactions(filters?: {
  query?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
}): Promise<TransactionRecord2[]> {
  let query = supabaseAdmin
    .from("payment_timeline")
    .select(
      "payment_id,booking_ref,guest_name,guest_email,provider,amount_minor,currency,derived_status,event_type,event_at",
    )
    .order("event_at", { ascending: false })
    .limit(200);

  if (filters?.query) {
    const q = filters.query.trim();
    query = query.or(
      `booking_ref.ilike.%${q}%,guest_name.ilike.%${q}%,guest_email.ilike.%${q}%`,
    );
  }

  if (filters?.status && filters.status !== "all") {
    query = query.eq("derived_status", filters.status);
  }

  if (filters?.dateFrom) query = query.gte("event_at", filters.dateFrom);
  if (filters?.dateTo)
    query = query.lte("event_at", filters.dateTo + "T23:59:59");

  const { data, error } = await query;
  if (error) throw error;

  return (data || []).map((row: any) => ({
    paymentId: row.payment_id,
    bookingRef: row.booking_ref,
    guestName: row.guest_name,
    guestEmail: row.guest_email,
    provider: row.provider,
    amountMinor: row.amount_minor,
    currency: row.currency,
    derivedStatus: row.derived_status,
    eventType: row.event_type,
    eventAt: row.event_at,
  }));
}
