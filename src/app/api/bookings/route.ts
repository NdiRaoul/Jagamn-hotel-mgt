import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { bookingLimiter } from "@/lib/redis/rate-limit";
import { getCache, setCache } from "@/lib/cache";
import {
  acquireLock,
  roomHoldKey,
  registerBookingSession,
} from "@/lib/redis/locks";

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
      guests,
      total_amount,
      special_requests,
      payment_method,
      // Account creation fields (optional)
      create_account,
      password,
    } = body;

    // Rate limiting — distributed (Upstash), shared across all instances.
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    const { success: withinLimit } = await bookingLimiter.limit(
      `booking:${ip}`,
    );
    if (!withinLimit) {
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
    if (!total_amount || total_amount <= 0)
      return NextResponse.json(
        { error: "Invalid total amount" },
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

    // Get room type — use cache to avoid repeated DB lookups
    let roomType = getCache<{ id: string; price_per_night: number }>(
      `room_type:${room_slug}`,
    );
    if (!roomType) {
      const { data } = await supabaseAdmin
        .from("room_types")
        .select("id, name, price_per_night")
        .eq("slug", room_slug)
        .single();
      if (data) {
        roomType = data;
        setCache(`room_type:${room_slug}`, data, 5 * 60 * 1000);
      }
    }

    // Pricing depends on the room type — refuse rather than trust client prices.
    if (!roomType) {
      return NextResponse.json(
        { error: "Room type not found" },
        { status: 404 },
      );
    }

    // ── Server-authoritative pricing ─────────────────────────────────────────
    // Never trust client-sent prices. Recompute from the room type's nightly
    // rate × nights and the same 10% tax shown on the booking page.
    const msPerDay = 1000 * 60 * 60 * 24;
    const nightsCount = Math.max(
      1,
      Math.round(
        (checkOutDate.getTime() - checkInDate.getTime()) / msPerDay,
      ),
    );
    const pricePerNight = roomType.price_per_night;
    const roomTotal = pricePerNight * nightsCount;
    const taxServer = Math.round(roomTotal * 0.1);
    const totalServer = roomTotal + taxServer;

    // ── Find + hold an available physical room unit ──────────────────────────
    // Lock-walk the candidates: the first room we can take a Redis hold on is
    // assigned, so two concurrent bookings can't grab the same unit (the NX
    // lock lets only one win, the other moves to the next candidate). If no
    // hold can be taken (all contended OR Redis down) we fail-open to the first
    // candidate and let the overlap guard decide — matches the lock philosophy
    // documented in lib/redis/locks.ts.
    let assignedRoomId: string | null = null;
    let roomHoldToken: string | null = null;
    {
      const { data: activeBookings } = await supabaseAdmin
        .from("bookings")
        .select("room_id")
        .eq("room_slug", room_slug)
        .not("status", "in", "(cancelled,expired)")
        .lte("check_in", check_out)
        .gte("check_out", check_in);

      const bookedRoomIds = (activeBookings || [])
        .map((b: { room_id: string | null }) => b.room_id)
        .filter(Boolean);

      const query = supabaseAdmin
        .from("rooms")
        .select("id")
        .eq("room_type_id", roomType.id)
        .eq("is_active", true)
        .limit(5);

      if (bookedRoomIds.length > 0) {
        query.not("id", "in", `(${bookedRoomIds.join(",")})`);
      }

      const { data: candidateRooms } = await query;

      for (const candidate of candidateRooms ?? []) {
        const token = await acquireLock(
          roomHoldKey(candidate.id, check_in, check_out),
        );
        if (token) {
          assignedRoomId = candidate.id;
          roomHoldToken = token;
          break;
        }
      }

      if (!assignedRoomId && (candidateRooms?.length ?? 0) > 0) {
        assignedRoomId = candidateRooms![0].id;
      }
    }

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

    // ── Insert booking ───────────────────────────────────────────────────────
    const { data: booking, error } = await supabaseAdmin
      .from("bookings")
      .insert({
        user_id: userId,
        guest_email,
        guest_name,
        guest_phone: guest_phone || null,
        guest_country: guest_country || null,
        guest_id_type: guest_id_type || null,
        guest_id_number: guest_id_number || null,
        room_type_id: roomType?.id || null,
        room_id: assignedRoomId,
        room_slug,
        check_in,
        check_out,
        nights: nightsCount,
        guests: guests || 1,
        room_price_per_night: pricePerNight,
        tax_amount: taxServer,
        total_amount: totalServer,
        payment_method: payment_method || null,
        payment_status: "pending",
        // Insert as "pending" — confirmBookingFromPayment() flips it to
        // "confirmed" once payment settles. This lets expireBooking() /
        // expire_stale_bookings reap abandoned holds (they only touch pending).
        status: "pending",
        special_requests: special_requests || null,
      })
      .select("id, booking_ref")
      .single();

    if (error) {
      console.error("[POST /api/bookings] insert error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Register the payment-window session so the room hold is released if the
    // guest cancels, and expires with the booking otherwise (TTL-based).
    await registerBookingSession(booking.id, roomHoldToken);

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
        .eq("id", booking.id);
    }

    // ── Receipt email ─────────────────────────────────────────────────────────
    // The "Booking Confirmed" receipt is sent ONLY after payment succeeds —
    // via confirmBookingFromPayment() → sendConfirmationEmail() (Stripe webhook,
    // Fapshi webhook / status poll). It is idempotent (guarded by
    // receipt_sent_at), so sending here at creation time would both fire before
    // payment completes and cause a duplicate email. Intentionally not sent here.

    return NextResponse.json({
      bookingRef: booking.booking_ref,
      bookingId: booking.id,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[POST /api/bookings] error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// GET /api/bookings — fetch bookings for the authenticated user only.
//
// Lookup is always scoped to the caller's session. An unauthenticated
// `?email=` lookup previously returned every booking for any address (IDOR);
// that path has been removed. Guests without an account should retrieve a
// booking via its reference, not by email enumeration.
export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: userRow } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("auth_user_id", user.id)
      .maybeSingle();

    if (!userRow) {
      return NextResponse.json({ bookings: [] });
    }

    const { data, error } = await supabaseAdmin
      .from("bookings")
      .select("*, room_types(*)")
      .eq("app_user_id", userRow.id)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json({ bookings: data || [] });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[GET /api/bookings] error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
