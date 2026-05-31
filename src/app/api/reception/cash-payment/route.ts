import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import { getStaffSession } from "@/lib/auth/staff-session";

export async function POST(request: NextRequest) {
  const session = await getStaffSession();
  if (!session || session.status !== "active") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { booking_id, amount_minor, description } = await request.json();

    if (!booking_id || !amount_minor) {
      return NextResponse.json(
        { error: "booking_id and amount_minor are required" },
        { status: 400 }
      );
    }

    // 1. Get booking
    const { data: booking, error: bookingError } = await supabaseAdmin
      .from("bookings")
      .select("id, booking_ref, status, total_amount, guest_email")
      .eq("id", booking_id)
      .single();

    if (bookingError || !booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // 2. Insert into payment_ledger
    const paymentId = crypto.randomUUID();
    const { error: ledgerError } = await supabaseAdmin.from("payment_ledger").insert({
      id: paymentId,
      booking_ref: booking.booking_ref,
      provider: "cash",
      amount_minor: amount_minor,
      currency: "XAF",
      status: "succeeded",
      client_idempotency_key: crypto.randomUUID(),
    });

    if (ledgerError) throw ledgerError;

    // 3. Insert into folio_entries
    const { error: folioError } = await supabaseAdmin.from("folio_entries").insert({
      booking_id: booking.id,
      entry_type: "payment",
      category: "cash",
      description: description || "Cash Payment",
      amount_minor: amount_minor,
      reference_id: paymentId,
      created_by: session.auth_user_id,
    });

    if (folioError) throw folioError;

    // 4. Update booking payment status (simplistic logic)
    // Note: in a real system we'd compare total balance from `booking_folio_balance`
    const { data: folioBalance } = await supabaseAdmin
      .from("booking_folio_balance")
      .select("balance_minor")
      .eq("booking_id", booking.id)
      .single();

    if (folioBalance && folioBalance.balance_minor <= 0) {
      await supabaseAdmin
        .from("bookings")
        .update({ payment_status: "paid" })
        .eq("id", booking.id);
    } else if (booking.payment_status === "pending") {
      await supabaseAdmin
        .from("bookings")
        .update({ payment_status: "partial" })
        .eq("id", booking.id);
    }

    // 5. Audit Log
    await supabaseAdmin.from("audit_log").insert({
      actor_id: session.auth_user_id,
      actor_role: session.role,
      action: "reception.cash_payment",
      target_type: "booking",
      target_id: booking.id,
      payload: { amount_minor, paymentId },
      ip: request.headers.get("x-forwarded-for") || "unknown",
    });

    return NextResponse.json({ success: true, paymentId });
  } catch (error: any) {
    console.error("[POST /api/reception/cash-payment]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
