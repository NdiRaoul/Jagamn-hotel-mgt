import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import { getStaffSession } from "@/lib/auth/staff-session";

export async function POST(req: NextRequest) {
  try {
    const session = await getStaffSession();
    if (
      !session ||
      !["owner", "admin", "manager", "kitchen"].includes(session.role)
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { dining_order_id, item_id, item_name, quantity, notes } = body;

    if (!item_name || !quantity) {
      return NextResponse.json(
        { error: "item_name and quantity are required" },
        { status: 400 },
      );
    }

    // Insert inventory request
    const { data: request, error } = await supabaseAdmin
      .from("inventory_requests")
      .insert({
        dining_order_id: dining_order_id || null,
        item_id: item_id || null,
        item_name,
        quantity,
        requested_by: session.id,
        status: "requested",
        notes: notes || null,
      })
      .select()
      .single();

    if (error) throw error;

    // Get room info for notification
    let roomInfo = "Kitchen";
    if (dining_order_id) {
      const { data: order } = await supabaseAdmin
        .from("dining_orders")
        .select("bookings(rooms(unit_code))")
        .eq("id", dining_order_id)
        .single();

      const bookingsRel = order?.bookings;
      const booking = Array.isArray(bookingsRel) ? bookingsRel[0] : bookingsRel;
      const roomsRel = booking?.rooms;
      const room = Array.isArray(roomsRel) ? roomsRel[0] : roomsRel;
      if (room?.unit_code) {
        roomInfo = `Room ${room.unit_code}`;
      }
    }

    // Notify storekeeper role
    await supabaseAdmin.rpc("notify_role", {
      p_role: "storekeeper",
      p_type: "system",
      p_title: `Stock request — ${roomInfo}`,
      p_body: `${quantity}x ${item_name}${notes ? ` (${notes})` : ""}`,
    });

    return NextResponse.json({ request }, { status: 201 });
  } catch (error) {
    console.error("Inventory request error:", error);
    return NextResponse.json(
      { error: "Failed to create inventory request" },
      { status: 500 },
    );
  }
}
