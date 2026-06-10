import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";

// POST /api/bookings/link — link a booking to a newly created user.
//
// Ownership is enforced by matching the target account's email to the
// booking's guest_email. This prevents an attacker who knows a booking UUID
// from attaching someone else's booking to their account (IDOR), while still
// working during the create-account-at-checkout flow where the new user may
// not yet have an active cookie session (email-confirmation pending).
export async function POST(request: NextRequest) {
  try {
    const { bookingId, userId } = await request.json();
    if (!bookingId || !userId) {
      return NextResponse.json(
        { error: "bookingId and userId required" },
        { status: 400 },
      );
    }

    // Resolve the target auth account and the booking.
    const [{ data: target }, { data: booking }] = await Promise.all([
      supabaseAdmin.auth.admin.getUserById(userId),
      supabaseAdmin
        .from("bookings")
        .select("id, guest_email, user_id")
        .eq("id", bookingId)
        .maybeSingle(),
    ]);

    if (!target?.user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    if (!booking) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 },
      );
    }

    // Already linked → idempotent no-op (never re-assign to a different owner).
    if (booking.user_id) {
      return NextResponse.json({ ok: true });
    }

    // An account may only claim a booking made under its own email.
    const bookingEmail = (booking.guest_email || "").trim().toLowerCase();
    const accountEmail = (target.user.email || "").trim().toLowerCase();
    if (!bookingEmail || bookingEmail !== accountEmail) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { error } = await supabaseAdmin
      .from("bookings")
      .update({ user_id: userId })
      .eq("id", bookingId)
      .is("user_id", null); // guard against a concurrent link

    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
