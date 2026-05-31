import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import { getStaffSession } from "@/lib/auth/staff-session";

const ALLOWED_ROLES = ["owner", "admin", "manager", "reception"];

async function requireAuthorized(request: NextRequest) {
  const session = await getStaffSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (
    session.status !== "active" ||
    !ALLOWED_ROLES.includes(session.role)
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return session;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await requireAuthorized(request);
  if (!(session instanceof Object) || "status" in session === false) {
    return session as NextResponse;
  }

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

  if (booking.status === "completed") {
    return NextResponse.json(
      { error: "Booking is already completed" },
      { status: 400 },
    );
  }

  let assignedRoomId = booking.room_id || null;

  if (!assignedRoomId) {
    if (!booking.room_type_id) {
      return NextResponse.json(
        { error: "Booking has no room type assigned" },
        { status: 400 },
      );
    }

    const { data: occupied } = await supabaseAdmin
      .from("bookings")
      .select("room_id")
      .neq("room_id", null)
      .neq("status", "cancelled")
      .eq("status", "confirmed");

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

  const { data: updatedBooking, error: updateError } = await supabaseAdmin
    .from("bookings")
    .update({ room_id: assignedRoomId })
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
