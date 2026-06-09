import { NextRequest, NextResponse } from "next/server";
import {
  createSupabaseRouteHandlerClient,
  supabaseAdmin,
} from "@/lib/supabase-server";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createSupabaseRouteHandlerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { items, notes, payment_method, room_type, room_unit } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "No items in order" }, { status: 400 });
    }

    // Resolve app_user_id from auth user
    const { data: appUser } = await supabaseAdmin
      .from("users")
      .select("id, email")
      .eq("auth_user_id", user.id)
      .single();

    if (!appUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Resolve booking_id from current checked_in booking
    const { data: activeBooking } = await supabaseAdmin
      .from("bookings")
      .select("id, booking_ref, room_id, rooms(unit_code)")
      .eq("app_user_id", appUser.id)
      .eq("status", "checked_in")
      .order("check_in", { ascending: false })
      .limit(1)
      .single();

    // Define item type
    type OrderItem = {
      id?: string;
      title?: string;
      name?: string;
      price?: number;
      quantity?: number;
    };

    // Calculate total (server-side, never trust client)
    const subtotal = (items as OrderItem[]).reduce(
      (sum: number, item: OrderItem) =>
        sum + (item.price || 0) * (item.quantity || 1),
      0,
    );
    const totalAmount = subtotal; // No service charge for now, can add if needed

    // Insert dining order
    const { data: order, error: orderError } = await supabaseAdmin
      .from("dining_orders")
      .insert({
        app_user_id: appUser.id,
        booking_id: activeBooking?.id || null,
        guest_email: appUser.email,
        status: "placed",
        total_amount: totalAmount,
        notes: notes || null,
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // Insert order items (snapshot name + price from menu_items)
    const orderItems = (items as OrderItem[]).map((item: OrderItem) => ({
      order_id: order.id,
      menu_item_id: item.id || null,
      item_name: item.title || item.name,
      unit_price: item.price || 0,
      quantity: item.quantity || 1,
    }));

    const { error: itemsError } = await supabaseAdmin
      .from("dining_order_items")
      .insert(orderItems);

    if (itemsError) throw itemsError;

    // If charge-to-room and has active booking, create folio entry
    if (activeBooking && payment_method === "charge_to_room") {
      const totalMinor = Math.round(totalAmount * 100);
      await supabaseAdmin.from("folio_entries").insert({
        booking_id: activeBooking.id,
        booking_ref: activeBooking.booking_ref,
        category: "dining",
        description: `Dining Order`,
        amount_minor: totalMinor,
        entry_type: "charge",
      });
    }

    // Fan-out notification to kitchen staff
    const roomsRel = activeBooking?.rooms;
    const room = Array.isArray(roomsRel) ? roomsRel[0] : roomsRel;
    const roomLabel = room_unit || room?.unit_code;
    const roomTitle = roomLabel ? `Room ${roomLabel}` : "Dining Hall";
    const titlePrefix = room_type
      ? `New ${room_type} order —`
      : "New room order —";
    const itemSummary = orderItems
      .map((i) => `${i.quantity}x ${i.item_name}`)
      .join(", ");

    await supabaseAdmin.rpc("notify_role", {
      p_role: "kitchen",
      p_type: "dining",
      p_title: `${titlePrefix} ${roomTitle}`,
      p_body: itemSummary,
    });

    return NextResponse.json({ order }, { status: 201 });
  } catch (error: unknown) {
    console.error("Dining order creation error:", error);
    return NextResponse.json(
      { error: "Failed to create dining order" },
      { status: 500 },
    );
  }
}
