import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

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
      resort_fee,
      tax_amount,
      total_amount,
      special_requests,
      payment_method,
      // Account creation fields (optional)
      create_account,
      password,
    } = body;

    // Validate required fields
    if (!guest_name || !guest_email || !room_slug || !check_in || !check_out) {
      return NextResponse.json(
        { error: "Missing required booking fields" },
        { status: 400 },
      );
    }

    // Get room type id
    const { data: roomType } = await supabaseAdmin
      .from("room_types")
      .select("id")
      .eq("slug", room_slug)
      .single();

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
    // Priority: already logged in > create_account signup > guest checkout
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
          email_confirm: true, // auto-confirm so they can log in immediately
        });

      if (!signUpError && signUpData.user) {
        userId = signUpData.user.id;
      }
      // If signup fails (e.g. email already exists) we still complete the booking
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
        resort_fee: resort_fee || 150,
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

    // ── Upsert guest profile ─────────────────────────────────────────────────
    // Always save guest details — with role 'member' if they have an auth
    // account, or 'guest' for anonymous checkout.
    const profileId = userId ?? crypto.randomUUID();
    const role: "member" | "guest" = userId ? "member" : "guest";

    await supabaseAdmin.from("guest_profiles").upsert(
      {
        id: profileId,
        full_name: guest_name,
        email: guest_email,
        phone: guest_phone || null,
        country: guest_country || null,
        id_type: guest_id_type || null,
        id_number: guest_id_number || null,
        special_requests: special_requests || null,
        role,
        loyalty_tier: "standard",
      },
      { onConflict: "id" },
    );

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
    // Check if user is authenticated
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data, error } = await supabaseAdmin
        .from("bookings")
        .select("*, room_types(*)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return NextResponse.json({ bookings: data || [] });
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
