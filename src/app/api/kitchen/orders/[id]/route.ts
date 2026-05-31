import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import { createSupabaseServerClient } from "@/lib/supabase";

/**
 * POST /api/kitchen/orders/[id]
 * Update order status (acknowledge → preparing → ready)
 * Roles: owner, admin, manager, kitchen
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check staff role
    const { data: staff } = await supabaseAdmin
      .from("staff")
      .select("role")
      .eq("auth_user_id", user.id)
      .eq("status", "active")
      .single();

    if (
      !staff ||
      !["owner", "admin", "manager", "kitchen"].includes(staff.role)
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { status } = await req.json();
    const orderId = params.id;

    // Validate status transition
    const validStatuses = ["placed", "preparing", "ready", "delivered"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    // Update order status
    const { data: order, error: updateError } = await supabaseAdmin
      .from("dining_orders")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", orderId)
      .select("id, status, app_user_id, booking_id")
      .single();

    if (updateError) throw updateError;

    // If status is "ready", create a notification for the guest
    if (status === "ready" && order.app_user_id) {
      await supabaseAdmin.from("notifications").insert({
        app_user_id: order.app_user_id,
        type: "dining",
        title: "Your order is ready",
        body: "Your dining order is ready for pickup or delivery.",
        is_read: false,
      });
    }

    return NextResponse.json({ success: true, order });
  } catch (error: any) {
    console.error("Kitchen order update error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update order" },
      { status: 500 },
    );
  }
}
