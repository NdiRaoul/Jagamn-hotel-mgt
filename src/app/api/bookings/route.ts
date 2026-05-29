import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { rateLimit } from "@/lib/rate-limit";
import { getCache, setCache } from "@/lib/cache";

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
      room_price_per_night,
      tax_amount,
      total_amount,
      special_requests,
      payment_method,
      // Account creation fields (optional)
      create_account,
      password,
    } = body;

    // Rate limiting
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    if (!rateLimit(`booking:${ip}`, 5, 60_000)) {
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

    // Get room type id — use cache to avoid repeated DB lookups
    let roomType = getCache<{ id: string }>(`room_type:${room_slug}`);
    if (!roomType) {
      const { data } = await supabaseAdmin
        .from("room_types")
        .select("id, name")
        .eq("slug", room_slug)
        .single();
      if (data) {
        roomType = data;
        setCache(`room_type:${room_slug}`, data, 5 * 60 * 1000);
      }
    }

    // Find an available physical room unit
    let assignedRoomId: string | null = null;
    if (roomType) {
      const { data: activeBookings } = await supabaseAdmin
        .from("bookings")
        .select("room_id")
        .eq("room_slug", room_slug)
        .neq("status", "cancelled")
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
        .limit(1);

      if (bookedRoomIds.length > 0) {
        query.not("id", "in", `(${bookedRoomIds.join(",")})`);
      }

      const { data: availableRoom } = await query.single();
      if (availableRoom) {
        assignedRoomId = availableRoom.id;
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
        nights: nights || 1,
        guests: guests || 1,
        room_price_per_night,
        tax_amount: tax_amount || null,
        total_amount,
        payment_method: payment_method || null,
        payment_status: "pending",
        status: "confirmed",
        special_requests: special_requests || null,
      })
      .select("id, booking_ref")
      .single();

    if (error) {
      console.error("[POST /api/bookings] insert error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
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
        .eq("id", booking.id);
    }

    // ── Send receipt email ───────────────────────────────────────────────────
    try {
      const { resend } = await import("@/lib/resend");
      const { buildReceiptEmailHtml } =
        await import("@/lib/emails/booking-receipt");

      const cachedRoom = getCache<{ id: string; name: string }>(
        `room_type:${room_slug}`,
      );
      const roomName = cachedRoom?.name || room_slug;

      await resend.emails.send({
        from: "Jagamn Palace <reservations@jagamnpalace.com>",
        to: [guest_email],
        subject: `Booking Confirmed — ${booking.booking_ref} | Jagamn Palace`,
        html: buildReceiptEmailHtml({
          bookingRef: booking.booking_ref,
          guestName: guest_name,
          roomName,
          checkIn: check_in,
          checkOut: check_out,
          nights: nights || 1,
          guests: guests || 1,
          pricePerNight: room_price_per_night,
          taxAmount: tax_amount || 0,
          totalAmount: total_amount,
          paymentMethod: payment_method || "Online Payment",
        }),
      });
    } catch (emailErr) {
      console.error("[bookings] receipt email failed:", emailErr);
    }

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
