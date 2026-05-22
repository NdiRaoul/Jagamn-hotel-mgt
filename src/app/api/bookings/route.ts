import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { getCached, invalidate } from "@/lib/redis/cache";
import { bookingLimiter } from "@/lib/redis/rate-limit";
import {
  acquireLock,
  registerBookingSession,
  roomHoldKey,
  PAYMENT_WINDOW_SECONDS,
} from "@/lib/redis/locks";
import { enqueueReconcile } from "@/lib/redis/reconcile";

// POST /api/bookings — create a booking
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      guest_name,
      guest_email,
      guest_phone,
      guest_country,
      guest_id_type,
      guest_id_number,
      room_slug,
      check_in,
      check_out,
      nights,
      guests,
      special_requests,
      payment_method,
      // Account creation fields (optional)
      create_account,
      password,
    } = body;

    // Rate limiting (Upstash sliding-window; falls back to allow on Redis error)
    const ip = request.headers.get("x-forwarded-for") ?? "unknown";
    const rl = await bookingLimiter.limit(ip);
    if (!rl.success) {
      return NextResponse.json(
        { error: "Too many requests. Please wait a moment." },
        { status: 429 },
      );
    }

    // Validate required fields
    if (!guest_name || !guest_email || !room_slug || !check_in || !check_out) {
      return NextResponse.json(
        { error: "Missing required booking fields" },
        { status: 400 },
      );
    }

    // Sanity checks
    const checkInDate = new Date(check_in);
    const checkOutDate = new Date(check_out);
    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);

    if (checkInDate < todayDate)
      return NextResponse.json(
        { error: "Check-in cannot be in the past" },
        { status: 400 },
      );
    if (checkOutDate <= checkInDate)
      return NextResponse.json(
        { error: "Check-out must be after check-in" },
        { status: 400 },
      );
    if (!guests || guests < 1 || guests > 10)
      return NextResponse.json(
        { error: "Invalid guest count" },
        { status: 400 },
      );

    const nightsCount = Math.round(
      (checkOutDate.getTime() - checkInDate.getTime()) / 86400000,
    );
    if (nightsCount < 1)
      return NextResponse.json(
        { error: "Booking must be at least one night." },
        { status: 400 },
      );

    // Idempotency — prevent duplicate bookings from double-clicks
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    const { data: existingBooking } = await supabaseAdmin
      .from("bookings")
      .select("id, booking_ref")
      .eq("guest_email", guest_email)
      .eq("room_slug", room_slug)
      .eq("check_in", check_in)
      .eq("check_out", check_out)
      .neq("status", "cancelled")
      .gte("created_at", tenMinutesAgo)
      .maybeSingle();

    if (existingBooking) {
      return NextResponse.json({
        bookingRef: existingBooking.booking_ref,
        bookingId: existingBooking.id,
        duplicate: true,
      });
    }

    // Get room type id and pricing — use layered cache to avoid repeated DB lookups
    const roomType = await getCached<{
      id: string;
      name: string;
      price_per_night: number;
      resort_fee: number | null;
    }>(`roomtype:slug:${room_slug}`, 300, async () => {
      const { data } = await supabaseAdmin
        .from("room_types")
        .select("id, name, price_per_night, resort_fee")
        .eq("slug", room_slug)
        .single();
      return data ?? null;
    });

    if (!roomType) {
      return NextResponse.json(
        { error: "Selected room type is invalid." },
        { status: 400 },
      );
    }

    const roomPricePerNight = roomType.price_per_night;
    const resortFeeValue = roomType.resort_fee ?? 150;
    const taxAmountValue = Math.round(roomPricePerNight * nightsCount * 0.12);
    const totalAmountValue =
      roomPricePerNight * nightsCount + resortFeeValue + taxAmountValue;

    // ── Resolve user ID ──────────────────────────────────────────────────────
    let userId: string | null = null;

    try {
      const supabase = await createSupabaseServerClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) userId = user.id;
    } catch {
      // Not authenticated — continue
    }

    // If not already logged in and wants to create an account, sign them up now
    if (!userId && create_account && password && guest_email) {
      const { data: signUpData, error: signUpError } =
        await supabaseAdmin.auth.admin.createUser({
          email: guest_email,
          password,
          user_metadata: { full_name: guest_name },
          email_confirm: true,
        });

      if (!signUpError && signUpData.user) {
        userId = signUpData.user.id;
      }
    }

    // ── Atomic room assignment + booking insert via RPC ──────────────────────
    // The assign_room_and_book() Postgres function picks a free room unit with
    // FOR UPDATE SKIP LOCKED and inserts the booking in ONE transaction.
    // The no_overlap exclusion constraint is the final backstop.
    //
    // Before calling the RPC, we attempt a Redis distributed lock on the
    // room type + dates. This is an OPTIMISATION — it stops a second user
    // from even starting the RPC while the first is in the payment window,
    // giving a better UX error ("room is being held") vs a DB 409.
    // If Redis is down, we skip the lock and let the DB constraint decide.
    let roomHoldToken: string | null = null;
    if (roomType?.id) {
      const holdKey = roomHoldKey(roomType.id, check_in, check_out);
      roomHoldToken = await acquireLock(holdKey, PAYMENT_WINDOW_SECONDS);
      // null means Redis is down (skip) or lock is held (another user is paying)
      if (roomHoldToken === null) {
        // Check if Redis is actually up — if so, the room is genuinely held
        const { redisAvailable } = await import("@/lib/redis/client");
        if (redisAvailable) {
          return NextResponse.json(
            {
              error:
                "This room is currently being held by another guest. Please try again in a few minutes.",
            },
            { status: 409 },
          );
        }
        // Redis down — proceed without lock, DB constraint is the backstop
      }
    }

    const { data: rpcRows, error: rpcError } = await supabaseAdmin.rpc(
      "assign_room_and_book",
      {
        p_room_slug: room_slug,
        p_room_type_id: roomType.id,
        p_check_in: check_in,
        p_check_out: check_out,
        p_guest_email: guest_email,
        p_guest_name: guest_name,
        p_guest_phone: guest_phone ?? null,
        p_guest_country: guest_country ?? null,
        p_guest_id_type: guest_id_type ?? null,
        p_guest_id_number: guest_id_number ?? null,
        p_nights: nightsCount,
        p_guests: guests ?? 1,
        p_room_price: roomPricePerNight,
        p_resort_fee: resortFeeValue,
        p_tax_amount: taxAmountValue,
        p_total_amount: totalAmountValue,
        p_payment_method: payment_method ?? null,
        p_special_requests: special_requests ?? null,
        p_user_id: userId ?? null,
        p_app_user_id: null, // filled in below after upsert
      },
    );

    if (rpcError) {
      // SQLSTATE 23P01 = exclusion_violation (no_overlap constraint)
      // The RPC also returns an error when no unit is available.
      const code = (rpcError as { code?: string }).code;
      const msg = rpcError.message ?? "";
      if (
        code === "23P01" ||
        msg.includes("no unit available") ||
        msg.includes("exclusion")
      ) {
        return NextResponse.json(
          {
            error: "This room is no longer available for the selected dates.",
          },
          { status: 409 },
        );
      }
      console.error("[POST /api/bookings] RPC error:", rpcError);
      return NextResponse.json(
        { error: "Could not create booking. Please try again." },
        { status: 500 },
      );
    }

    const booking = rpcRows?.[0];
    if (!booking) {
      return NextResponse.json(
        { error: "This room is no longer available for the selected dates." },
        { status: 409 },
      );
    }

    // ── Upsert users row ─────────────────────────────────────────────────────
    let appUserId: string | null = null;

    if (userId) {
      // Authenticated user — find or create their users row
      const { data: existingUser } = await supabaseAdmin
        .from("users")
        .select("id")
        .eq("auth_user_id", userId)
        .maybeSingle();

      if (existingUser) {
        appUserId = existingUser.id;
        await supabaseAdmin
          .from("users")
          .update({
            full_name: guest_name,
            phone: guest_phone || null,
            country: guest_country || null,
            id_type: guest_id_type || null,
            id_number: guest_id_number || null,
            nationality: body.nationality || null,
            special_requests: special_requests || null,
            role: "member",
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingUser.id);
      } else {
        const { data: newUser } = await supabaseAdmin
          .from("users")
          .insert({
            auth_user_id: userId,
            full_name: guest_name,
            email: guest_email,
            phone: guest_phone || null,
            country: guest_country || null,
            id_type: guest_id_type || null,
            id_number: guest_id_number || null,
            nationality: body.nationality || null,
            special_requests: special_requests || null,
            role: "member",
            loyalty_tier: "standard",
          })
          .select("id")
          .single();
        appUserId = newUser?.id || null;
      }
    } else {
      // Guest checkout — find or create by email
      const { data: existingGuest } = await supabaseAdmin
        .from("users")
        .select("id")
        .eq("email", guest_email)
        .maybeSingle();

      if (existingGuest) {
        appUserId = existingGuest.id;
        await supabaseAdmin
          .from("users")
          .update({
            full_name: guest_name,
            phone: guest_phone || null,
            country: guest_country || null,
            id_type: guest_id_type || null,
            id_number: guest_id_number || null,
            nationality: body.nationality || null,
            special_requests: special_requests || null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingGuest.id);
      } else {
        const { data: newGuest } = await supabaseAdmin
          .from("users")
          .insert({
            auth_user_id: null,
            full_name: guest_name,
            email: guest_email,
            phone: guest_phone || null,
            country: guest_country || null,
            id_type: guest_id_type || null,
            id_number: guest_id_number || null,
            nationality: body.nationality || null,
            special_requests: special_requests || null,
            role: "guest",
            loyalty_tier: "standard",
          })
          .select("id")
          .single();
        appUserId = newGuest?.id || null;
      }
    }

    // Link the booking to this users row
    if (appUserId) {
      await supabaseAdmin
        .from("bookings")
        .update({ app_user_id: appUserId })
        .eq("id", booking.booking_id);
    }

    // ── Register booking session in Redis (replaces cron-based expiry) ───────
    // The session key auto-expires after PAYMENT_WINDOW_SECONDS.
    // When it expires, the room hold (lock:room:*) also expires, freeing the
    // room for other guests — no cron scan needed.
    await registerBookingSession(
      booking.booking_id,
      roomHoldToken,
      PAYMENT_WINDOW_SECONDS,
    );

    // Invalidate availability cache so the room shows as held immediately
    await invalidate(`availability:slug:${room_slug}`);

    // ── Enqueue for opportunistic reconciliation (Fix 2) ─────────────────────
    // If the payment provider webhook is missed AND the guest closes the
    // browser, drainReconcileQueue() (called from /api/health and /api/rooms)
    // will poll the live status and self-heal the booking.
    // payment_method tells us which provider to poll; transactionId is stored
    // after payment initiation — we enqueue with a placeholder and the payment
    // routes update it. For now we enqueue without transactionId; the Fapshi
    // status poll (Fix 1) covers the case where the guest is still on the page.
    // The queue entry is updated with the real transactionId by the payment
    // initiation routes (see /api/payments/fapshi POST and /api/payments/stripe POST).

    // ── Send "reservation received" email (NOT a confirmation) ──────────────
    // The real "Booking Confirmed" email is sent only after payment succeeds,
    // from the Stripe / Fapshi webhook via sendConfirmationEmail().
    try {
      const { resend } = await import("@/lib/resend");

      const roomName = roomType?.name || room_slug;

      await resend.emails.send({
        from: "Jagamn Palace <reservations@jagamnpalace.com>",
        to: [guest_email],
        subject: `Reservation Received — ${booking.booking_ref} | Jagamn Palace`,
        html: `<!DOCTYPE html>
<html><head><meta charset="utf-8"/></head>
<body style="font-family:Georgia,serif;background:#FAFAFA;margin:0;padding:40px;">
  <div style="max-width:600px;margin:0 auto;background:white;border-radius:8px;overflow:hidden;">
    <div style="background:#00152A;padding:40px;text-align:center;">
      <h1 style="color:#FFB77A;margin:0;">Jagamn Palace</h1>
      <p style="color:#9ca3af;font-size:11px;letter-spacing:4px;text-transform:uppercase;">Reservation Received</p>
    </div>
    <div style="padding:40px;">
      <p>Dear ${guest_name},</p>
      <p>We have received your reservation request for <strong>${roomName}</strong>.</p>
      <div style="background:#FFF8F0;border:1px solid #FFB77A;border-radius:8px;padding:24px;margin:24px 0;">
        <p style="font-size:11px;text-transform:uppercase;letter-spacing:3px;color:#9ca3af;margin:0 0 8px;">Reference</p>
        <p style="font-size:28px;font-weight:bold;color:#00152A;font-family:monospace;margin:0;">${booking.booking_ref}</p>
      </div>
      <p style="color:#6b7280;font-size:14px;">
        <strong>This is not a confirmation.</strong> Your booking will be confirmed once payment is processed.
        You will receive a separate confirmation email with your receipt.
      </p>
      <p style="color:#6b7280;font-size:14px;">Check-in: <strong>${check_in}</strong> &nbsp;→&nbsp; Check-out: <strong>${check_out}</strong></p>
    </div>
    <div style="background:#F4F6F8;padding:24px;text-align:center;">
      <p style="color:#9ca3af;font-size:11px;letter-spacing:2px;text-transform:uppercase;margin:0;">Jagamn Palace · Excellence Since 1892</p>
    </div>
  </div>
</body></html>`,
      });
    } catch (emailErr) {
      console.error("[bookings] reservation-received email failed:", emailErr);
    }

    return NextResponse.json({
      bookingRef: booking.booking_ref,
      bookingId: booking.booking_id,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[POST /api/bookings] error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// GET /api/bookings — fetch bookings for authenticated user or by email
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email");

  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data: userRow } = await supabaseAdmin
        .from("users")
        .select("id")
        .eq("auth_user_id", user.id)
        .maybeSingle();

      if (userRow) {
        const { data, error } = await supabaseAdmin
          .from("bookings")
          .select("*, room_types(*)")
          .eq("app_user_id", userRow.id)
          .order("created_at", { ascending: false });

        if (error) throw error;
        return NextResponse.json({ bookings: data || [] });
      }
    }

    if (email) {
      const { data, error } = await supabaseAdmin
        .from("bookings")
        .select("*, room_types(*)")
        .eq("guest_email", email)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return NextResponse.json({ bookings: data || [] });
    }

    return NextResponse.json({ bookings: [] });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[GET /api/bookings] error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
