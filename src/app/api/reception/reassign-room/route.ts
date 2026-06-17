import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import { getStaffSession } from "@/lib/auth/staff-session";
import { clearCache } from "@/lib/cache";

// Reception + management may move a guest to another room — same type, an
// upgrade, or a downgrade. Changing the room type re-rates the stay (rate ×
// nights + 10% tax) and, for desk/walk-in bookings, updates the room charge on
// the folio so the balance reflects the new rate.
const ALLOWED_ROLES = ["owner", "admin", "manager", "reception"];

function toDateKey(value: string) {
  return new Date(value).toISOString().slice(0, 10);
}

export async function POST(request: NextRequest) {
  const session = await getStaffSession();
  if (!session || session.status !== "active") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!ALLOWED_ROLES.includes(session.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const { booking_id, room_slug, target_room_id } = body as Record<
    string,
    unknown
  >;

  if (!booking_id || !room_slug) {
    return NextResponse.json(
      { error: "booking_id and room_slug are required" },
      { status: 400 },
    );
  }

  // 1. Load the booking and make sure it is reassignable.
  const { data: booking, error: bookingErr } = await supabaseAdmin
    .from("bookings")
    .select(
      "id, booking_ref, room_id, room_slug, room_type_id, check_in, check_out, nights, room_price_per_night, tax_amount, total_amount, status",
    )
    .eq("id", booking_id)
    .maybeSingle();

  if (bookingErr || !booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }
  if (
    ["cancelled", "expired", "checked_out", "completed"].includes(
      booking.status,
    )
  ) {
    return NextResponse.json(
      { error: `Cannot reassign a ${booking.status} booking` },
      { status: 400 },
    );
  }

  // 2. Resolve the target room type.
  const { data: newType, error: typeErr } = await supabaseAdmin
    .from("room_types")
    .select("id, slug, name, price_per_night")
    .eq("slug", String(room_slug))
    .maybeSingle();

  if (typeErr || !newType) {
    return NextResponse.json({ error: "Room type not found" }, { status: 404 });
  }

  // 3. Rooms taken by another active booking over this stay's dates.
  const { data: occupied } = await supabaseAdmin
    .from("bookings")
    .select("room_id")
    .not("room_id", "is", null)
    .not("status", "in", "(cancelled,expired,checked_out,completed)")
    .lt("check_in", toDateKey(booking.check_out))
    .gt("check_out", toDateKey(booking.check_in))
    .neq("id", booking.id);
  const occupiedIds = new Set(
    (occupied || []).map((r) => r.room_id as string).filter(Boolean),
  );

  // 4. Choose the destination unit: an explicit one (validated) or the first
  // free active room of the target type.
  let targetRoomId: string | null = null;
  let targetUnitCode: string | null = null;

  if (target_room_id && typeof target_room_id === "string") {
    const { data: room } = await supabaseAdmin
      .from("rooms")
      .select("id, unit_code, room_type_id, is_active")
      .eq("id", target_room_id)
      .maybeSingle();
    if (!room || !room.is_active || room.room_type_id !== newType.id) {
      return NextResponse.json(
        { error: "Selected room is not a valid unit of that type" },
        { status: 409 },
      );
    }
    if (occupiedIds.has(room.id)) {
      return NextResponse.json(
        { error: "That room is occupied for these dates" },
        { status: 409 },
      );
    }
    targetRoomId = room.id;
    targetUnitCode = room.unit_code;
  } else {
    const { data: candidates } = await supabaseAdmin
      .from("rooms")
      .select("id, unit_code")
      .eq("room_type_id", newType.id)
      .eq("is_active", true)
      .order("unit_code");
    const free = (candidates || []).find((r) => !occupiedIds.has(r.id));
    if (!free) {
      return NextResponse.json(
        { error: "No rooms of that type are available for these dates" },
        { status: 409 },
      );
    }
    targetRoomId = free.id;
    targetUnitCode = free.unit_code;
  }

  if (targetRoomId === booking.room_id) {
    return NextResponse.json(
      { error: "Guest is already in this room" },
      { status: 400 },
    );
  }

  // 5. Re-rate when the room type changes; otherwise keep the existing pricing.
  const typeChanged = newType.id !== booking.room_type_id;
  const nights = booking.nights ?? 1;
  const oldTotal = booking.total_amount ?? 0;
  const newPrice = typeChanged
    ? newType.price_per_night
    : (booking.room_price_per_night ?? newType.price_per_night);
  const newTax = typeChanged
    ? Math.round(newPrice * nights * 0.1)
    : (booking.tax_amount ?? 0);
  const newTotal = typeChanged ? newPrice * nights + newTax : oldTotal;

  const update: Record<string, unknown> = {
    room_id: targetRoomId,
    room_type_id: newType.id,
    room_slug: newType.slug,
  };
  if (typeChanged) {
    update.room_price_per_night = newPrice;
    update.tax_amount = newTax;
    update.total_amount = newTotal;
  }

  const { error: updErr } = await supabaseAdmin
    .from("bookings")
    .update(update)
    .eq("id", booking.id);
  if (updErr) {
    console.error("[reassign-room] update error:", updErr);
    return NextResponse.json(
      { error: "Could not reassign room" },
      { status: 500 },
    );
  }

  // 6. Keep the folio room charge (walk-in / desk bookings) in step with the
  // new rate so the outstanding balance stays correct.
  if (typeChanged) {
    await supabaseAdmin
      .from("folio_entries")
      .update({ amount_minor: Math.round(newTotal * 100) })
      .eq("booking_id", booking.id)
      .eq("category", "room")
      .eq("entry_type", "charge");
  }

  // 7. Old room needs cleaning if the guest was physically in it.
  if (booking.room_id && booking.status === "checked_in") {
    await supabaseAdmin
      .from("rooms")
      .update({ housekeeping_status: "dirty" })
      .eq("id", booking.room_id);
  }

  clearCache("room_board");

  await supabaseAdmin.from("audit_log").insert({
    actor_id: session.auth_user_id,
    actor_role: session.role,
    action: "reception.reassign_room",
    target_type: "booking",
    target_id: booking.id,
    payload: {
      fromRoomId: booking.room_id,
      toRoomId: targetRoomId,
      toUnit: targetUnitCode,
      fromType: booking.room_slug,
      toType: newType.slug,
      oldTotal,
      newTotal,
    },
    ip: request.headers.get("x-forwarded-for") || "unknown",
  });

  const delta = newTotal - oldTotal;
  return NextResponse.json({
    success: true,
    unitCode: targetUnitCode,
    roomType: newType.name,
    typeChanged,
    oldTotal,
    newTotal,
    delta,
    direction: delta > 0 ? "upgrade" : delta < 0 ? "downgrade" : "same",
  });
}
