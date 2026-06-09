import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import { getStaffSession } from "@/lib/auth/staff-session";

const ALLOWED_ROLES = ["owner", "admin", "manager", "reception"];
const ALLOWED_STATUSES = ["clean", "dirty", "out_of_order"];

/**
 * POST /api/reception/rooms/[id]/housekeeping
 * Body: { status: "clean" | "dirty" | "out_of_order" }
 *
 * Flips a room's housekeeping_status. Reception/admin use this to mark a dirty
 * room clean (back to available) after a checkout, or to flag it for service.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getStaffSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.status !== "active" || !ALLOWED_ROLES.includes(session.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id: roomId } = await params;
  const body = await request.json().catch(() => ({}));
  const status = String((body as { status?: string }).status ?? "");

  if (!ALLOWED_STATUSES.includes(status)) {
    return NextResponse.json(
      { error: "status must be one of clean | dirty | out_of_order" },
      { status: 400 },
    );
  }

  const { data: room, error } = await supabaseAdmin
    .from("rooms")
    .update({ housekeeping_status: status })
    .eq("id", roomId)
    .select("id,unit_code,housekeeping_status")
    .maybeSingle();

  if (error) {
    console.error("[housekeeping] update error:", error);
    return NextResponse.json(
      { error: "Could not update room" },
      { status: 500 },
    );
  }
  if (!room) {
    return NextResponse.json({ error: "Room not found" }, { status: 404 });
  }

  await supabaseAdmin.from("audit_log").insert({
    actor_id: session.auth_user_id,
    actor_role: session.role,
    action: "room.housekeeping",
    target_type: "room",
    target_id: roomId,
    payload: { status },
    ip: request.headers.get("x-forwarded-for") || "unknown",
  });

  return NextResponse.json({ room });
}
