import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import { getStaffSession } from "@/lib/auth/staff-session";
import { clearCache } from "@/lib/cache";
import { notify } from "@/lib/data/notifications";
import { resend, EMAIL_FROM } from "@/lib/resend";
import { formatMoney } from "@/lib/currency";

// Reception + management may move a guest to another room — same type, an
// upgrade, or a downgrade. Changing the room type re-rates the stay (rate ×
// nights + 10% tax) and, for desk/walk-in bookings, updates the room charge on
// the folio so the balance reflects the new rate.
const ALLOWED_ROLES = ["owner", "admin", "manager", "reception"];

function toDateKey(value: string) {
  return new Date(value).toISOString().slice(0, 10);
}

export async function POST(request: NextRequest) {
  const session = await getStaffSession();
  if (!session || session.status !== "active") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!ALLOWED_ROLES.includes(session.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const { booking_id, room_slug, target_room_id } = body as Record<
    string,
    unknown
  >;

  if (!booking_id || !room_slug) {
    return NextResponse.json(
      { error: "booking_id and room_slug are required" },
      { status: 400 },
    );
  }

  // 1. Load the booking and make sure it is reassignable.
  const { data: booking, error: bookingErr } = await supabaseAdmin
    .from("bookings")
    .select(
      "id, booking_ref, room_id, room_slug, room_type_id, check_in, check_out, nights, room_price_per_night, tax_amount, total_amount, status, payment_status, guest_name, guest_email, app_user_id",
    )
    .eq("id", booking_id)
    .maybeSingle();

  if (bookingErr || !booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }
  if (
    ["cancelled", "expired", "checked_out", "completed"].includes(
      booking.status,
    )
  ) {
    return NextResponse.json(
      { error: `Cannot reassign a ${booking.status} booking` },
      { status: 400 },
    );
  }

  // 2. Resolve the target room type.
  const { data: newType, error: typeErr } = await supabaseAdmin
    .from("room_types")
    .select("id, slug, name, price_per_night")
    .eq("slug", String(room_slug))
    .maybeSingle();

  if (typeErr || !newType) {
    return NextResponse.json({ error: "Room type not found" }, { status: 404 });
  }

  // 3. Rooms taken by another active booking over this stay's dates.
  const { data: occupied } = await supabaseAdmin
    .from("bookings")
    .select("room_id")
    .not("room_id", "is", null)
    .not("status", "in", "(cancelled,expired,checked_out,completed)")
    .lt("check_in", toDateKey(booking.check_out))
    .gt("check_out", toDateKey(booking.check_in))
    .neq("id", booking.id);
  const occupiedIds = new Set(
    (occupied || []).map((r) => r.room_id as string).filter(Boolean),
  );

  // 4. Choose the destination unit: an explicit one (validated) or the first
  // free active room of the target type.
  let targetRoomId: string | null = null;
  let targetUnitCode: string | null = null;

  if (target_room_id && typeof target_room_id === "string") {
    const { data: room } = await supabaseAdmin
      .from("rooms")
      .select("id, unit_code, room_type_id, is_active")
      .eq("id", target_room_id)
      .maybeSingle();
    if (!room || !room.is_active || room.room_type_id !== newType.id) {
      return NextResponse.json(
        { error: "Selected room is not a valid unit of that type" },
        { status: 409 },
      );
    }
    if (occupiedIds.has(room.id)) {
      return NextResponse.json(
        { error: "That room is occupied for these dates" },
        { status: 409 },
      );
    }
    targetRoomId = room.id;
    targetUnitCode = room.unit_code;
  } else {
    const { data: candidates } = await supabaseAdmin
      .from("rooms")
      .select("id, unit_code")
      .eq("room_type_id", newType.id)
      .eq("is_active", true)
      .order("unit_code");
    const free = (candidates || []).find((r) => !occupiedIds.has(r.id));
    if (!free) {
      return NextResponse.json(
        { error: "No rooms of that type are available for these dates" },
        { status: 409 },
      );
    }
    targetRoomId = free.id;
    targetUnitCode = free.unit_code;
  }

  if (targetRoomId === booking.room_id) {
    return NextResponse.json(
      { error: "Guest is already in this room" },
      { status: 400 },
    );
  }

  // 5. Re-rate when the room type changes; otherwise keep the existing pricing.
  const typeChanged = newType.id !== booking.room_type_id;
  const nights = booking.nights ?? 1;
  const oldTotal = booking.total_amount ?? 0;
  const newPrice = typeChanged
    ? newType.price_per_night
    : (booking.room_price_per_night ?? newType.price_per_night);
  const newTax = typeChanged
    ? Math.round(newPrice * nights * 0.1)
    : (booking.tax_amount ?? 0);
  const newTotal = typeChanged ? newPrice * nights + newTax : oldTotal;

  const update: Record<string, unknown> = {
    room_id: targetRoomId,
    room_type_id: newType.id,
    room_slug: newType.slug,
  };

  // When the room type changes, the money already paid for the old room is
  // carried onto the new room. We move the whole stay onto the folio ledger so
  // the carried amount nets against the new room charge — leaving either a
  // BALANCE (new room costs more) or a REFUND credit (new room costs less).
  let newBalance = 0;
  let newRefund = 0;
  let newPaymentStatus: string | null = booking.payment_status; // overwritten when typeChanged

  if (typeChanged) {
    // 5a. Capture what the guest has already paid toward the room.
    const [{ data: folioBal }, { data: existingRoomCharges }] =
      await Promise.all([
        supabaseAdmin
          .from("booking_folio_balance")
          .select("paid_minor")
          .eq("booking_id", booking.id)
          .maybeSingle(),
        supabaseAdmin
          .from("folio_entries")
          .select("id")
          .eq("booking_id", booking.id)
          .eq("category", "room")
          .eq("entry_type", "charge"),
      ]);

    const hadRoomCharge = (existingRoomCharges?.length ?? 0) > 0;
    // Walk-in / desk bookings already track payments on the folio. Online
    // prepaid bookings have none, so the full old room total is the carried
    // amount; a pending online booking has paid nothing.
    const amountPaidMinor = hadRoomCharge
      ? (folioBal?.paid_minor ?? 0)
      : booking.payment_status === "paid"
        ? Math.round(oldTotal * 100)
        : 0;
    const newTotalMinor = Math.round(newTotal * 100);

    update.room_price_per_night = newPrice;
    update.tax_amount = newTax;
    update.total_amount = newTotal;

    const netMinor = newTotalMinor - amountPaidMinor;
    newPaymentStatus =
      netMinor <= 0 ? "paid" : amountPaidMinor > 0 ? "partial" : "pending";
    update.payment_status = newPaymentStatus;
    newBalance = Math.max(netMinor, 0) / 100;
    newRefund = Math.max(-netMinor, 0) / 100;

    // 5b. Re-rate / post the room charge so the folio reflects the new room.
    if (hadRoomCharge) {
      await supabaseAdmin
        .from("folio_entries")
        .update({
          amount_minor: newTotalMinor,
          description: "Room Charge (reassigned)",
        })
        .eq("booking_id", booking.id)
        .eq("category", "room")
        .eq("entry_type", "charge");
    } else {
      await supabaseAdmin.from("folio_entries").insert({
        booking_id: booking.id,
        booking_ref: booking.booking_ref,
        category: "room",
        description: "Room Charge (reassigned)",
        amount_minor: newTotalMinor,
        entry_type: "charge",
      });
      // Carry the previous prepayment onto the folio as a payment so it offsets
      // the new room charge.
      if (amountPaidMinor > 0) {
        await supabaseAdmin.from("folio_entries").insert({
          booking_id: booking.id,
          booking_ref: booking.booking_ref,
          category: "payment",
          description: "Carried-over payment from previous room",
          amount_minor: amountPaidMinor,
          entry_type: "payment",
        });
      }
    }
  }

  const { error: updErr } = await supabaseAdmin
    .from("bookings")
    .update(update)
    .eq("id", booking.id);
  if (updErr) {
    console.error("[reassign-room] update error:", updErr);
    return NextResponse.json(
      { error: "Could not reassign room" },
      { status: 500 },
    );
  }

  // 7. Old room needs cleaning if the guest was physically in it.
  if (booking.room_id && booking.status === "checked_in") {
    await supabaseAdmin
      .from("rooms")
      .update({ housekeeping_status: "dirty" })
      .eq("id", booking.room_id);
  }

  clearCache("room_board");

  await supabaseAdmin.from("audit_log").insert({
    actor_id: session.auth_user_id,
    actor_role: session.role,
    action: "reception.reassign_room",
    target_type: "booking",
    target_id: booking.id,
    payload: {
      fromRoomId: booking.room_id,
      toRoomId: targetRoomId,
      toUnit: targetUnitCode,
      fromType: booking.room_slug,
      toType: newType.slug,
      oldTotal,
      newTotal,
      balanceDue: newBalance,
      refundDue: newRefund,
      paymentStatus: newPaymentStatus,
    },
    ip: request.headers.get("x-forwarded-for") || "unknown",
  });

  // ── Notify the guest of the room change ─────────────────────────────────
  // An email always goes out (covers guests with no account). Guests WITH an
  // account also get an in-app notification on the dashboard bell. All of this
  // is best-effort: a failure here must not fail the reassignment.
  const moneyLine =
    newBalance > 0
      ? `A balance of ${formatMoney(newBalance)} is now due on your room.`
      : newRefund > 0
        ? `A refund of ${formatMoney(newRefund)} is due to you — please collect it at the front desk.`
        : "There is no change to your balance.";
  const changeSummary = `${newType.name} (Room ${targetUnitCode})`;

  // In-app notification — only for guests with a real account (auth_user_id).
  if (booking.app_user_id) {
    try {
      const { data: appUser } = await supabaseAdmin
        .from("users")
        .select("auth_user_id")
        .eq("id", booking.app_user_id)
        .maybeSingle();
      if (appUser?.auth_user_id) {
        await notify({
          appUserId: booking.app_user_id,
          type: "booking",
          title: "Your room has been changed",
          body: `Booking ${booking.booking_ref} has been moved to ${changeSummary}. ${moneyLine}`,
        });
      }
    } catch (e) {
      console.error("[reassign-room] in-app notify failed (non-fatal):", e);
    }
  }

  // Email — always, to the address on the booking.
  if (booking.guest_email && process.env.RESEND_API_KEY) {
    try {
      await resend.emails.send({
        from: EMAIL_FROM,
        to: [booking.guest_email],
        subject: `Your Room Has Changed — ${booking.booking_ref} | Jagamn Palace`,
        html: `<div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;padding:40px;color:#00152A;">
          <h1 style="color:#00152A;">Room Reassignment</h1>
          <p>Dear ${booking.guest_name || "Guest"},</p>
          <p>Your reservation <strong>${booking.booking_ref}</strong> has been moved to a new room:</p>
          <p style="font-size:18px;margin:16px 0;"><strong>${changeSummary}</strong></p>
          <p>${moneyLine}</p>
          <p style="color:#6B7280;font-size:13px;margin-top:24px;">If you have any questions, please speak with our front desk.</p>
          <p style="color:#6B7280;font-size:13px;">— Jagamn Palace Hotel</p>
        </div>`,
      });
    } catch (e) {
      console.error("[reassign-room] email send failed (non-fatal):", e);
    }
  }

  const delta = newTotal - oldTotal;
  return NextResponse.json({
    success: true,
    unitCode: targetUnitCode,
    roomType: newType.name,
    typeChanged,
    oldTotal,
    newTotal,
    delta,
    direction: delta > 0 ? "upgrade" : delta < 0 ? "downgrade" : "same",
    balanceDue: newBalance,
    refundDue: newRefund,
  });
}
