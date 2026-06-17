import { supabaseAdmin } from "@/lib/supabase-server";
import type { Booking, Room, RoomType, Payment } from "@/types/database";
import { getCache, setCache } from "@/lib/cache";

// Default page size for the heavy front-desk lists. Kept generous so the
// in-memory search/filter in the clients still covers a full working set,
// while bounding the query as history grows (see getActiveReservations /
// getTransactions). "Load more" fetches subsequent pages on demand.
export const RECEPTION_PAGE_SIZE = 50;

export interface ArrivalRecord {
  id: string;
  bookingRef: string;
  guestName: string;
  guestPhone: string | null;
  roomType: string;
  roomUnit: string | null;
  checkIn: string;
  status:
    | "confirmed"
    | "checked_in"
    | "checked_out"
    | "completed"
    | "pending"
    | "cancelled";
  paymentStatus: string;
  actionHref: string | null;
}

export interface DepartureRecord {
  id: string;
  bookingRef: string;
  guestName: string;
  guestPhone: string | null;
  roomSlug: string;
  checkOut: string;
  status: "confirmed" | "checked_out" | "completed" | "pending" | "cancelled";
  paymentStatus: string;
  balanceDue: number;
  actionHref: string | null;
}

export interface RoomBoardRoom {
  id: string;
  unitCode: string;
  floor: number | null;
  roomTypeName: string;
  status: "occupied" | "reserved" | "available" | "dirty" | "out_of_order";
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
  toDate: string = date,
): Promise<ArrivalRecord[]> {
  const { data, error } = await supabaseAdmin
    .from("bookings")
    .select(
      "id,booking_ref,guest_name,guest_phone,room_type_id,room_types(name),rooms(unit_code),check_in,status,payment_status",
    )
    .gte("check_in", date)
    .lte("check_in", toDate)
    .neq("status", "cancelled")
    .order("check_in", { ascending: true });

  if (error) {
    throw error;
  }

  return (
    (data || []) as unknown as (Booking & {
      room_types?: RoomType;
      rooms?: { unit_code: string } | { unit_code: string }[] | null;
    })[]
  ).map((booking) => {
    const room = Array.isArray(booking.rooms) ? booking.rooms[0] : booking.rooms;
    return {
      id: booking.id,
      bookingRef: booking.booking_ref,
      guestName: booking.guest_name,
      guestPhone: booking.guest_phone ?? null,
      roomType: normalizeRoomTypeName(booking.room_types),
      roomUnit: room?.unit_code ?? null,
      checkIn: booking.check_in,
      status: booking.status as ArrivalRecord["status"],
      paymentStatus: booking.payment_status || "pending",
      actionHref:
        booking.status !== "cancelled"
          ? `/reception/check-in/${booking.id}`
          : null,
    };
  });
}

export async function getDepartures(
  date: string = toDateKey(new Date()),
  toDate: string = date,
): Promise<DepartureRecord[]> {
  // Fetch the bookings WITHOUT embedding the folio-balance view. Embedding it
  // makes the whole query throw ("Failed to load departures") whenever
  // PostgREST can't resolve the relationship (view missing or no detected FK).
  const { data, error } = await supabaseAdmin
    .from("bookings")
    .select(
      "id,booking_ref,guest_name,guest_phone,room_slug,check_out,total_amount,payment_status,status",
    )
    .gte("check_out", date)
    .lte("check_out", toDate)
    .neq("status", "cancelled")
    .order("check_out", { ascending: true });

  if (error) {
    throw error;
  }

  type DepartureBooking = {
    id: string;
    booking_ref: string;
    guest_name: string;
    guest_phone: string | null;
    room_slug: string;
    check_out: string;
    total_amount: number;
    payment_status: string;
    status: string;
  };

  const bookings = (data || []) as DepartureBooking[];

  // Fetch folio balances separately and merge in JS. A missing view / failed
  // read degrades to a 0 balance instead of breaking the whole page.
  const folioByBooking = new Map<
    string,
    { paid_minor: number; balance_minor: number }
  >();
  if (bookings.length > 0) {
    const { data: folios } = await supabaseAdmin
      .from("booking_folio_balance")
      .select("booking_id, paid_minor, balance_minor")
      .in(
        "booking_id",
        bookings.map((b) => b.id),
      );
    for (const f of folios ?? []) {
      folioByBooking.set(f.booking_id, {
        paid_minor: f.paid_minor ?? 0,
        balance_minor: f.balance_minor ?? 0,
      });
    }
  }

  return bookings.map((booking) => {
    // `*_minor` columns store francs × 100; divide back to whole XAF for the UI.
    const folio = folioByBooking.get(booking.id);
    const balanceDue = folio ? folio.balance_minor / 100 : 0;
    return {
      id: booking.id,
      bookingRef: booking.booking_ref,
      guestName: booking.guest_name,
      guestPhone: booking.guest_phone ?? null,
      roomSlug: booking.room_slug,
      checkOut: booking.check_out,
      status: booking.status as DepartureRecord["status"],
      paymentStatus: booking.payment_status || "pending",
      balanceDue,
      actionHref:
        booking.status !== "checked_out" && booking.status !== "completed"
          ? `/reception/departures/check-out/${booking.id}`
          : null,
    };
  });
}

export async function getRoomBoard(): Promise<RoomBoardRoom[]> {
  // The room board is read-heavy and polled by the front desk, yet it scans
  // all rooms + today's active bookings on every call. A short TTL absorbs
  // repeat reads without making occupancy meaningfully stale (check-in /
  // checkout are not second-to-second events, and the page can be refreshed).
  const CACHE_KEY = "room_board";
  const cached = getCache<RoomBoardRoom[]>(CACHE_KEY);
  if (cached) return cached;

  const today = new Date();
  const todayKey = toDateKey(today);

  const [{ data: rooms }, { data: roomTypes }, { data: activeBookings }] =
    await Promise.all([
      supabaseAdmin
        .from("rooms")
        .select("id,unit_code,floor,is_active,room_type_id,housekeeping_status"),
      supabaseAdmin.from("room_types").select("id,name"),
      // Rooms with a live assignment: any non-departed booking whose stay has
      // not yet ended (check_out in the future). This covers bookings checked
      // in today (→ occupied) AND ones assigned for today or an upcoming date
      // (→ reserved) — both should surface on the board rather than reading as
      // freely available.
      supabaseAdmin
        .from("bookings")
        .select(
          "id,room_id,room_slug,guest_name,check_in,check_out,status,booking_ref",
        )
        .not("status", "in", "(cancelled,expired,checked_out,completed)")
        .gt("check_out", todayKey),
    ]);

  if (!rooms) throw new Error("Failed to load rooms");
  if (!roomTypes) throw new Error("Failed to load room types");

  const roomTypeMap = new Map(
    (roomTypes as unknown as RoomType[]).map((rt) => [rt.id, rt.name]),
  );
  // A room reads as physically "occupied" only once the guest is checked in.
  // Bookings get a room_id pre-assigned at creation, so a not-yet-arrived
  // pending/confirmed booking must NOT read as occupied — otherwise the same
  // guest shows as both a "pending arrival" and as occupying the board, the
  // contradictory dual-state in Recep-001. Instead, an assigned-but-not-yet-
  // arrived booking marks its room "reserved" so it still surfaces on the
  // board (rather than appearing freely available). Check-in flips status to
  // "checked_in" atomically, which promotes the room to "occupied".
  //
  // A single room may carry several live bookings (e.g. a current stay plus a
  // future assignment). Pick the most relevant one: a checked-in booking always
  // wins (the room is physically occupied right now); otherwise the
  // soonest-arriving assignment represents the room's next commitment.
  const bookingMap = new Map<
    string,
    Booking & { booking_ref: string; status?: string }
  >();
  (
    (activeBookings || []) as unknown as (Booking & { status?: string })[]
  ).forEach((booking) => {
    if (!booking.room_id) return;
    const existing = bookingMap.get(booking.room_id);
    if (!existing) {
      bookingMap.set(booking.room_id, booking);
      return;
    }
    // A checked-in booking is the definitive occupant — keep it.
    if (existing.status === "checked_in") return;
    if (booking.status === "checked_in") {
      bookingMap.set(booking.room_id, booking);
      return;
    }
    // Neither is checked in: keep the earlier check-in (the nearer commitment).
    if ((booking.check_in ?? "") < (existing.check_in ?? "")) {
      bookingMap.set(booking.room_id, booking);
    }
  });

  const board = (
    (rooms || []) as unknown as (Room & { housekeeping_status?: string })[]
  ).map((room) => {
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
      // Checked in → occupied; assigned but not yet arrived → reserved.
      status = booking.status === "checked_in" ? "occupied" : "reserved";
    } else if (room.housekeeping_status === "dirty") {
      // Vacated but not yet cleaned (set on checkout, cleared by housekeeping).
      status = "dirty";
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

  setCache(CACHE_KEY, board, 15_000);
  return board;
}

export async function searchFrontDesk(query: string): Promise<ArrivalRecord[]> {
  const q = query.trim();
  if (!q) return [];

  const { data, error } = await supabaseAdmin
    .from("bookings")
    .select(
      "id,booking_ref,guest_name,guest_phone,room_type_id,room_types(name),rooms(unit_code),check_in,status,payment_status",
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

  return (
    (data || []) as unknown as (Booking & {
      room_types?: RoomType;
      rooms?: { unit_code: string } | { unit_code: string }[] | null;
    })[]
  ).map((booking) => {
    const room = Array.isArray(booking.rooms) ? booking.rooms[0] : booking.rooms;
    return {
      id: booking.id,
      bookingRef: booking.booking_ref,
      guestName: booking.guest_name,
      guestPhone: booking.guest_phone ?? null,
      roomType: normalizeRoomTypeName(booking.room_types),
      roomUnit: room?.unit_code ?? null,
      checkIn: booking.check_in,
      status: booking.status as ArrivalRecord["status"],
      paymentStatus: booking.payment_status || "pending",
      actionHref:
        booking.status !== "cancelled"
          ? `/reception/check-in/${booking.id}`
          : null,
    };
  });
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

  return (
    (data || []) as unknown as (Payment & {
      bookings?: { guest_name: string; room_slug: string };
    })[]
  ).map((payment) => ({
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
  }));
}

export interface ActiveReservation {
  id: string;
  bookingRef: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string | null;
  roomSlug: string;
  roomTypeName: string;
  roomTypeId: string | null;
  roomId: string | null;
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
  limit?: number;
  offset?: number;
}): Promise<ActiveReservation[]> {
  // Bounded, paginated read so the query stays cheap as booking history grows.
  const limit = filters?.limit ?? RECEPTION_PAGE_SIZE;
  const offset = filters?.offset ?? 0;

  let query = supabaseAdmin
    .from("bookings")
    .select(
      "id,booking_ref,guest_name,guest_email,guest_phone,room_slug,room_type_id,room_id,room_types(name),rooms(unit_code),check_in,check_out,nights,guests,total_amount,payment_status,status,special_requests",
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

  const { data, error } = await query.range(offset, offset + limit - 1);
  if (error) throw error;

  type ActiveReservationData = {
    id: string;
    booking_ref: string;
    guest_name: string;
    guest_email: string;
    guest_phone: string | null;
    room_slug: string;
    room_type_id: string | null;
    room_id: string | null;
    room_types: Array<{ name: string }> | { name: string } | null;
    rooms: Array<{ unit_code: string }> | { unit_code: string } | null;
    check_in: string;
    check_out: string;
    nights: number;
    guests: number;
    total_amount: number;
    payment_status: string;
    status: string;
    special_requests: string | null;
  };

  return (data || []).map((b: ActiveReservationData) => {
    const roomType = Array.isArray(b.room_types)
      ? b.room_types[0]
      : b.room_types;
    const room = Array.isArray(b.rooms) ? b.rooms[0] : b.rooms;

    return {
      id: b.id,
      bookingRef: b.booking_ref,
      guestName: b.guest_name,
      guestEmail: b.guest_email,
      guestPhone: b.guest_phone,
      roomSlug: b.room_slug,
      roomTypeName: roomType?.name ?? b.room_slug,
      roomTypeId: b.room_type_id,
      roomId: b.room_id,
      roomUnitCode: room?.unit_code ?? null,
      checkIn: b.check_in,
      checkOut: b.check_out,
      nights: b.nights,
      guests: b.guests,
      totalAmount: b.total_amount,
      paymentStatus: b.payment_status,
      status: b.status,
      specialRequests: b.special_requests,
    };
  });
}

export async function getTransactions(filters?: {
  query?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
  offset?: number;
}): Promise<TransactionRecord2[]> {
  // Bounded, paginated read so the timeline query stays cheap as the payment
  // event history grows.
  const limit = filters?.limit ?? RECEPTION_PAGE_SIZE;
  const offset = filters?.offset ?? 0;

  let query = supabaseAdmin
    .from("payment_timeline")
    .select(
      "payment_id,booking_ref,guest_name,guest_email,provider,amount_minor,currency,derived_status,event_type,event_at",
    )
    .order("event_at", { ascending: false });

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

  const { data, error } = await query.range(offset, offset + limit - 1);
  if (error) throw error;

  type TransactionTimelineRow = {
    payment_id: string;
    booking_ref: string | null;
    guest_name: string | null;
    guest_email: string | null;
    provider: string | null;
    amount_minor: number;
    currency: string;
    derived_status: string;
    event_type: string;
    event_at: string;
  };

  return (data || []).map((row: TransactionTimelineRow) => ({
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
