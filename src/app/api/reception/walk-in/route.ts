import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import { getStaffSession } from "@/lib/auth/staff-session";

const ALLOWED_ROLES = ["owner", "admin", "manager", "reception"];

async function requireAuthorized(request: NextRequest) {
  const session = await getStaffSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.status !== "active" || !ALLOWED_ROLES.includes(session.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return session;
}

function toDateKey(date: string | Date) {
  const value = typeof date === "string" ? new Date(date) : date;
  return value.toISOString().slice(0, 10);
}

export async function POST(request: NextRequest) {
  const session = await requireAuthorized(request);
  if (session instanceof NextResponse) {
    return session;
  }

  const body = await request.json().catch(() => ({}));
  const {
    guest_name,
    guest_email,
    guest_phone,
    guest_country,
    guest_id_type,
    guest_id_number,
    room_slug,
    check_in,
    check_out,
    guests,
    payment_method,
    clientIdempotencyKey,
    amount,
    currency,
    phone,
    medium,
  } = body as Record<string, unknown>;

  if (!guest_name || !guest_email || !room_slug || !check_in || !check_out) {
    return NextResponse.json(
      { error: "Missing required walk-in reservation fields" },
      { status: 400 },
    );
  }

  const checkInDate = new Date(String(check_in));
  const checkOutDate = new Date(String(check_out));
  if (checkOutDate <= checkInDate) {
    return NextResponse.json(
      { error: "Check-out must be after check-in" },
      { status: 400 },
    );
  }

  if (!guest_email || typeof guest_email !== "string") {
    return NextResponse.json({ error: "Invalid guest email" }, { status: 400 });
  }

  const nights = Math.max(
    1,
    Math.round((checkOutDate.getTime() - checkInDate.getTime()) / 86400000),
  );

  const { data: roomType, error: roomTypeError } = await supabaseAdmin
    .from("room_types")
    .select("id,price_per_night")
    .eq("slug", room_slug)
    .maybeSingle();

  if (roomTypeError || !roomType) {
    return NextResponse.json({ error: "Room type not found" }, { status: 404 });
  }

  const roomPricePerNight = roomType.price_per_night;
  const taxAmount = Math.round(roomPricePerNight * nights * 0.1);
  // Stored on the booking in WHOLE XAF — must match online bookings so the
  // guest pages and balance math read the same units. The client `amount`
  // (minor units, for the payment provider) is NOT used as the stored total.
  const roomTotalWhole = roomPricePerNight * nights + taxAmount;
  // Amount handed to the card / mobile-money provider (minor units expected).
  const providerAmount =
    amount && typeof amount === "number" ? amount : roomTotalWhole;

  const { data: activeBookings } = await supabaseAdmin
    .from("bookings")
    .select("room_id")
    .neq("room_id", null)
    .neq("status", "cancelled")
    .lt("check_in", toDateKey(checkOutDate))
    .gt("check_out", toDateKey(checkInDate));

  const occupiedRoomIds = (activeBookings || [])
    .map((row) => row.room_id as string | null)
    .filter(Boolean);

  const roomQuery = supabaseAdmin
    .from("rooms")
    .select("id")
    .eq("room_type_id", roomType.id)
    .eq("is_active", true)
    .limit(1);

  if (occupiedRoomIds.length > 0) {
    roomQuery.not("id", "in", `(${occupiedRoomIds.join(",")})`);
  }

  const { data: availableRoom, error: roomError } =
    await roomQuery.maybeSingle();
  if (roomError) {
    console.error("[walk-in] room lookup error:", roomError);
  }

  if (!availableRoom) {
    return NextResponse.json(
      { error: "No rooms available for the selected dates" },
      { status: 409 },
    );
  }

  const assignedRoomId = availableRoom.id;

  const { data: booking, error: bookingError } = await supabaseAdmin
    .from("bookings")
    .insert({
      guest_name: String(guest_name),
      guest_email: String(guest_email),
      guest_phone: typeof guest_phone === "string" ? guest_phone : null,
      guest_country: typeof guest_country === "string" ? guest_country : null,
      guest_id_type: typeof guest_id_type === "string" ? guest_id_type : null,
      guest_id_number:
        typeof guest_id_number === "string" ? guest_id_number : null,
      room_type_id: roomType.id,
      room_id: assignedRoomId,
      room_slug: String(room_slug),
      check_in: toDateKey(String(check_in)),
      check_out: toDateKey(String(check_out)),
      nights,
      guests: typeof guests === "number" ? guests : 1,
      room_price_per_night: roomPricePerNight,
      tax_amount: taxAmount,
      total_amount: roomTotalWhole,
      payment_method:
        typeof payment_method === "string" ? payment_method : null,
      payment_status: "pending",
      status: "confirmed",
    })
    .select("id,booking_ref")
    .maybeSingle();

  if (bookingError || !booking) {
    console.error("[walk-in] booking insert error:", bookingError);
    return NextResponse.json(
      { error: "Could not create booking" },
      { status: 500 },
    );
  }

  // ── Upsert users row (find-or-create by email) so walk-in guests appear on
  // the admin / super-admin Users page, then link the booking. Mirrors the
  // guest branch of POST /api/bookings.
  const guestEmail = String(guest_email);
  let appUserId: string | null = null;
  const { data: existingGuest } = await supabaseAdmin
    .from("users")
    .select("id")
    .eq("email", guestEmail)
    .maybeSingle();

  if (existingGuest) {
    appUserId = existingGuest.id;
    await supabaseAdmin
      .from("users")
      .update({
        full_name: String(guest_name),
        phone: typeof guest_phone === "string" ? guest_phone : null,
        country: typeof guest_country === "string" ? guest_country : null,
        id_type: typeof guest_id_type === "string" ? guest_id_type : null,
        id_number: typeof guest_id_number === "string" ? guest_id_number : null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existingGuest.id);
  } else {
    const { data: newGuest } = await supabaseAdmin
      .from("users")
      .insert({
        auth_user_id: null,
        full_name: String(guest_name),
        email: guestEmail,
        phone: typeof guest_phone === "string" ? guest_phone : null,
        country: typeof guest_country === "string" ? guest_country : null,
        id_type: typeof guest_id_type === "string" ? guest_id_type : null,
        id_number: typeof guest_id_number === "string" ? guest_id_number : null,
        role: "guest",
        loyalty_tier: "standard",
      })
      .select("id")
      .single();
    appUserId = newGuest?.id ?? null;
  }

  if (appUserId) {
    await supabaseAdmin
      .from("bookings")
      .update({ app_user_id: appUserId })
      .eq("id", booking.id);
  }

  // ── Cash / pay-at-desk: post the room onto the folio so any unpaid portion
  // becomes a tracked balance the front desk can settle (now or at checkout).
  // The receptionist records what the guest actually hands over via the cash
  // dialog (→ /api/reception/cash-payment), which draws this charge down.
  // Card / mobile-money walk-ins are prepaid online and keep the
  // payment_status-driven model instead (no room folio charge).
  if (payment_method === "cash") {
    await supabaseAdmin.from("folio_entries").insert({
      booking_id: booking.id,
      booking_ref: booking.booking_ref,
      category: "room",
      description: "Room Charge",
      amount_minor: Math.round(roomTotalWhole * 100),
      entry_type: "charge",
    });
  }

  const responsePayload: Record<string, unknown> = {
    bookingId: booking.id,
    bookingRef: booking.booking_ref,
  };

  if (
    payment_method === "card" &&
    clientIdempotencyKey &&
    typeof clientIdempotencyKey === "string"
  ) {
    const paymentResponse = await fetch(
      new URL("/api/payments/stripe", request.url).toString(),
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingRef: booking.booking_ref,
          totalAmount: providerAmount,
          currency: "xaf",
          clientIdempotencyKey,
        }),
      },
    );
    const paymentData = await paymentResponse.json();
    responsePayload.payment = paymentData;
  } else if (
    payment_method === "mobile_money" &&
    clientIdempotencyKey &&
    typeof clientIdempotencyKey === "string" &&
    typeof phone === "string" &&
    typeof medium === "string"
  ) {
    const paymentResponse = await fetch(
      new URL("/api/payments/fapshi", request.url).toString(),
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: providerAmount,
          phone,
          medium,
          bookingRef: booking.booking_ref,
          email: guest_email,
          name: guest_name,
          clientIdempotencyKey,
        }),
      },
    );
    const paymentData = await paymentResponse.json();
    responsePayload.payment = paymentData;
  }

  await supabaseAdmin.from("audit_log").insert({
    actor_id: session.auth_user_id,
    actor_role: session.role,
    action: "booking.walk_in",
    target_type: "booking",
    target_id: booking.id,
    payload: {
      roomSlug: room_slug,
      assignedRoomId,
      totalAmount: roomTotalWhole,
      paymentMethod: payment_method,
    },
    ip: request.headers.get("x-forwarded-for") || "unknown",
  });

  return NextResponse.json(responsePayload);
}
