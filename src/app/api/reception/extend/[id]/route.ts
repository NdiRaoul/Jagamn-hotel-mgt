import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import { getStaffSession } from "@/lib/auth/staff-session";

const ALLOWED_ROLES = ["owner", "admin", "manager", "reception"];

function nightsBetween(checkIn: string, checkOut: string): number {
  const a = new Date(checkIn).getTime();
  const b = new Date(checkOut).getTime();
  return Math.max(0, Math.round((b - a) / (1000 * 60 * 60 * 24)));
}

// POST /api/reception/extend/[id]
// Body: { check_in?: string; check_out?: string; roomId?: string }
//
// Modifies a reservation's stay dates. Recomputes nights × rate, adds the delta
// to the booking total, and (if not already paid) posts the delta to the room
// folio as a charge. Validates the new dates don't collide with another booking
// on the same room; if they do, the caller must pass a different roomId.
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getStaffSession();
  if (!session || session.status !== "active") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!ALLOWED_ROLES.includes(session.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id: bookingId } = await params;
  const body = await request.json().catch(() => ({}));
  const { check_in, check_out, roomId } = body as {
    check_in?: string;
    check_out?: string;
    roomId?: string;
  };

  const { data: booking, error: bookingErr } = await supabaseAdmin
    .from("bookings")
    .select(
      "id,room_id,room_slug,room_type_id,check_in,check_out,nights,room_price_per_night,total_amount,payment_status,status",
    )
    .eq("id", bookingId)
    .maybeSingle();

  if (bookingErr || !booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  const newCheckIn = check_in || booking.check_in;
  const newCheckOut = check_out || booking.check_out;

  if (new Date(newCheckOut) <= new Date(newCheckIn)) {
    return NextResponse.json(
      { error: "Check-out must be after check-in." },
      { status: 400 },
    );
  }

  // Conflict check on the assigned (or newly chosen) room.
  const targetRoomId = roomId || booking.room_id;
  if (targetRoomId) {
    const { data: clashes } = await supabaseAdmin
      .from("bookings")
      .select("id")
      .eq("room_id", targetRoomId)
      .neq("id", bookingId)
      .not("status", "in", "(cancelled,expired,checked_out,completed)")
      .lt("check_in", newCheckOut)
      .gt("check_out", newCheckIn);

    if ((clashes || []).length > 0) {
      return NextResponse.json(
        {
          error:
            "Those dates collide with another reservation on this room. Reassign the room and try again.",
          code: "ROOM_CONFLICT",
        },
        { status: 409 },
      );
    }
  }

  const oldNights = booking.nights ?? nightsBetween(booking.check_in, booking.check_out);
  const newNights = nightsBetween(newCheckIn, newCheckOut);
  const rate = booking.room_price_per_night ?? 0; // whole XAF
  const deltaAmount = (newNights - oldNights) * rate; // whole XAF (may be negative)

  const update: Record<string, unknown> = {
    check_in: newCheckIn,
    check_out: newCheckOut,
    nights: newNights,
    total_amount: (booking.total_amount ?? 0) + deltaAmount,
  };
  if (roomId) update.room_id = roomId;

  const { data: updated, error: updateErr } = await supabaseAdmin
    .from("bookings")
    .update(update)
    .eq("id", bookingId)
    .select("id,check_in,check_out,nights,total_amount,room_id")
    .maybeSingle();

  if (updateErr) {
    console.error("[extend] update error:", updateErr);
    return NextResponse.json(
      { error: "Could not update reservation" },
      { status: 500 },
    );
  }

  // If extending (positive delta) and the booking isn't fully paid, post the
  // extra room charge to the folio so it shows up on the bill.
  let folioCharged = false;
  if (deltaAmount > 0 && booking.payment_status !== "paid") {
    const { error: folioErr } = await supabaseAdmin.from("folio_entries").insert({
      booking_id: bookingId,
      entry_type: "charge",
      category: "room",
      description: `Stay extension — ${newNights - oldNights} extra night(s)`,
      amount_minor: deltaAmount * 100,
      created_by: session.auth_user_id,
    });
    folioCharged = !folioErr;
    if (folioErr) console.error("[extend] folio charge error:", folioErr);
  }

  await supabaseAdmin.from("audit_log").insert({
    actor_id: session.auth_user_id,
    actor_role: session.role,
    action: "reception.extend_stay",
    target_type: "booking",
    target_id: bookingId,
    payload: {
      check_in: newCheckIn,
      check_out: newCheckOut,
      nights: newNights,
      deltaAmount,
      roomId: roomId ?? null,
    },
    ip: request.headers.get("x-forwarded-for") || "unknown",
  });

  return NextResponse.json({ booking: updated, deltaAmount, folioCharged });
}
