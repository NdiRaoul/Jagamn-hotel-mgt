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

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const sessionOrError = await requireAuthorized(request);
  if (sessionOrError instanceof NextResponse) {
    return sessionOrError;
  }
  const session = sessionOrError;

  const p = await params;
  const bookingId = p.id;
  const body = await request.json().catch(() => ({}));
  const { roomId } = body as { roomId?: string };

  const { data: booking, error: bookingError } = await supabaseAdmin
    .from("bookings")
    .select("id,room_type_id,room_id,room_slug,check_in,check_out,status")
    .eq("id", bookingId)
    .maybeSingle();

  if (bookingError) {
    console.error("[check-in] booking lookup error:", bookingError);
    return NextResponse.json(
      { error: "Booking lookup failed" },
      { status: 500 },
    );
  }

  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  if (booking.status === "cancelled") {
    return NextResponse.json(
      { error: "Cannot check in a cancelled booking" },
      { status: 400 },
    );
  }

  if (booking.status === "checked_out" || booking.status === "completed") {
    return NextResponse.json(
      { error: "Booking is already checked out" },
      { status: 400 },
    );
  }

  // Helper: is `roomId` free for this booking's stay? (no other active booking
  // on that room overlapping [check_in, check_out)).
  async function roomHasConflict(roomId: string): Promise<boolean> {
    const { data: clashes } = await supabaseAdmin
      .from("bookings")
      .select("id")
      .eq("room_id", roomId)
      .neq("id", bookingId)
      .not("status", "in", "(cancelled,expired,checked_out,completed)")
      .lt("check_in", booking!.check_out)
      .gt("check_out", booking!.check_in);
    return (clashes || []).length > 0;
  }

  let assignedRoomId = booking.room_id || null;

  // A specific physical room chosen at the desk takes priority — validate it
  // exists, is active, and isn't double-booked for these dates.
  if (roomId) {
    const { data: chosen, error: chosenErr } = await supabaseAdmin
      .from("rooms")
      .select("id,is_active")
      .eq("id", roomId)
      .maybeSingle();
    if (chosenErr || !chosen) {
      return NextResponse.json(
        { error: "Selected room not found" },
        { status: 404 },
      );
    }
    if (!chosen.is_active) {
      return NextResponse.json(
        { error: "Selected room is out of order" },
        { status: 409 },
      );
    }
    if (await roomHasConflict(roomId)) {
      return NextResponse.json(
        {
          error:
            "Selected room is already booked for these dates. Choose another room.",
        },
        { status: 409 },
      );
    }
    assignedRoomId = roomId;
  }

  if (!assignedRoomId) {
    if (!booking.room_type_id) {
      return NextResponse.json(
        { error: "Booking has no room type assigned" },
        { status: 400 },
      );
    }

    // Rooms occupied by an active booking that overlaps this stay.
    const { data: occupied } = await supabaseAdmin
      .from("bookings")
      .select("room_id")
      .not("room_id", "is", null)
      .not("status", "in", "(cancelled,expired,checked_out,completed)")
      .lt("check_in", booking.check_out)
      .gt("check_out", booking.check_in);

    const occupiedRoomIds = (occupied || [])
      .map((row) => row.room_id as string | null)
      .filter(Boolean);

    const query = supabaseAdmin
      .from("rooms")
      .select("id")
      .eq("room_type_id", booking.room_type_id)
      .eq("is_active", true)
      .limit(1);

    if (occupiedRoomIds.length > 0) {
      query.not("id", "in", `(${occupiedRoomIds.join(",")})`);
    }

    const { data: availableRoom, error: roomError } = await query.maybeSingle();
    if (roomError) {
      console.error("[check-in] room search error:", roomError);
      return NextResponse.json(
        { error: "Room lookup failed" },
        { status: 500 },
      );
    }

    if (!availableRoom) {
      return NextResponse.json(
        { error: "No available room found for this booking" },
        { status: 409 },
      );
    }

    assignedRoomId = availableRoom.id;
  }

  // Persist the room and flip the booking to checked-in. The room board derives
  // occupancy from bookings that carry a room_id and span today, so this is what
  // makes the guest appear on the assigned room immediately.
  const { data: updatedBooking, error: updateError } = await supabaseAdmin
    .from("bookings")
    .update({ room_id: assignedRoomId, status: "checked_in" })
    .eq("id", bookingId)
    .select("id,room_id,room_slug,status,check_in,check_out")
    .maybeSingle();

  if (updateError) {
    console.error("[check-in] update error:", updateError);
    return NextResponse.json(
      { error: "Could not assign room" },
      { status: 500 },
    );
  }

  // The room is now occupied, so it shouldn't read as "dirty" on the board.
  await supabaseAdmin
    .from("rooms")
    .update({ housekeeping_status: "clean" })
    .eq("id", assignedRoomId);

  await supabaseAdmin.from("audit_log").insert({
    actor_id: session.auth_user_id,
    actor_role: session.role,
    action: "booking.check_in",
    target_type: "booking",
    target_id: bookingId,
    payload: { assignedRoomId, roomSlug: booking.room_slug },
    ip: request.headers.get("x-forwarded-for") || "unknown",
  });

  return NextResponse.json({ booking: updatedBooking });
}
