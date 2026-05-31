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
  const totalAmount =
    amount && typeof amount === "number"
      ? amount
      : roomPricePerNight * nights + taxAmount;

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
      check_in: toDateKey(check_in),
      check_out: toDateKey(check_out),
      nights,
      guests: typeof guests === "number" ? guests : 1,
      room_price_per_night: roomPricePerNight,
      tax_amount: taxAmount,
      total_amount: totalAmount,
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
          totalAmount,
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
          amount: totalAmount,
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
      totalAmount,
      paymentMethod: payment_method,
    },
    ip: request.headers.get("x-forwarded-for") || "unknown",
  });

  return NextResponse.json(responsePayload);
}
