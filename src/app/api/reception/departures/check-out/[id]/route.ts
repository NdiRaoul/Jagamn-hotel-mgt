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
  if (session instanceof NextResponse) {
    return session;
  }

  const p = await params;
  const bookingId = p.id;
  const { data: booking, error: bookingError } = await supabaseAdmin
    .from("bookings")
    .select("id,total_amount,payment_status,status")
    .eq("id", bookingId)
    .maybeSingle();

  if (bookingError) {
    console.error("[checkout] booking lookup error:", bookingError);
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
      { error: "Cannot check out a cancelled booking" },
      { status: 400 },
    );
  }

  if (booking.status === "completed") {
    return NextResponse.json(
      { error: "Booking is already checked out" },
      { status: 400 },
    );
  }

  const { data: payments, error: paymentsError } = await supabaseAdmin
    .from("payments")
    .select("amount,status")
    .eq("booking_id", bookingId);

  if (paymentsError) {
    console.error("[checkout] payment lookup error:", paymentsError);
  }

  const totalPaid = (payments || [])
    .filter((payment) => payment.status === "paid")
    .reduce((sum, payment) => sum + Number(payment.amount), 0);

  const paymentStatus =
    totalPaid >= booking.total_amount
      ? "paid"
      : booking.payment_status || "pending";
  const balanceDue = Math.max(0, booking.total_amount - totalPaid);

  const { data: updatedBooking, error: updateError } = await supabaseAdmin
    .from("bookings")
    .update({
      status: "completed",
      payment_status: paymentStatus,
    })
    .eq("id", bookingId)
    .select("id,status,payment_status")
    .maybeSingle();

  if (updateError) {
    console.error("[checkout] update error:", updateError);
    return NextResponse.json(
      { error: "Could not complete checkout" },
      { status: 500 },
    );
  }

  await supabaseAdmin.from("audit_log").insert({
    actor_id: session.auth_user_id,
    actor_role: session.role,
    action: "booking.check_out",
    target_type: "booking",
    target_id: bookingId,
    payload: { totalPaid, paymentStatus, balanceDue },
    ip: request.headers.get("x-forwarded-for") || "unknown",
  });

  return NextResponse.json({ booking: updatedBooking, balanceDue });
}
