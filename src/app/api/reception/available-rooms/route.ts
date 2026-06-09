import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import { getStaffSession } from "@/lib/auth/staff-session";

const ALLOWED_ROLES = ["owner", "admin", "manager", "reception"];

// GET /api/reception/available-rooms?roomTypeId=&checkIn=&checkOut=&exclude=
// Returns physical rooms of a type that are active and free for the date range
// (used for room reassignment when a stay extension collides).
export async function GET(request: NextRequest) {
  const session = await getStaffSession();
  if (!session || session.status !== "active") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!ALLOWED_ROLES.includes(session.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const roomTypeId = searchParams.get("roomTypeId");
  const checkIn = searchParams.get("checkIn");
  const checkOut = searchParams.get("checkOut");
  const exclude = searchParams.get("exclude");

  if (!roomTypeId || !checkIn || !checkOut) {
    return NextResponse.json(
      { error: "roomTypeId, checkIn and checkOut are required" },
      { status: 400 },
    );
  }

  // Rooms occupied by an active booking overlapping the requested range.
  let occQuery = supabaseAdmin
    .from("bookings")
    .select("room_id")
    .not("room_id", "is", null)
    .not("status", "in", "(cancelled,expired,checked_out,completed)")
    .lt("check_in", checkOut)
    .gt("check_out", checkIn);
  if (exclude) occQuery = occQuery.neq("id", exclude);

  const { data: occupied } = await occQuery;
  const occupiedIds = (occupied || [])
    .map((r) => r.room_id as string | null)
    .filter(Boolean) as string[];

  let q = supabaseAdmin
    .from("rooms")
    .select("id,unit_code,floor")
    .eq("room_type_id", roomTypeId)
    .eq("is_active", true);
  if (occupiedIds.length > 0) {
    q = q.not("id", "in", `(${occupiedIds.join(",")})`);
  }

  const { data: rooms, error } = await q.order("unit_code");
  if (error) {
    console.error("[available-rooms] error:", error);
    return NextResponse.json({ error: "Lookup failed" }, { status: 500 });
  }

  return NextResponse.json({ rooms: rooms || [] });
}
