import { NextRequest, NextResponse } from "next/server";
import {
  supabaseAdmin,
  createSupabaseServerClient,
} from "@/lib/supabase-server";

// POST /api/bookings/link — link a booking to the currently authenticated user.
// Requires a valid session; userId is derived from the session, never from the body.
export async function POST(request: NextRequest) {
  try {
    // Require authentication — derive userId from the session, not the request body
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { bookingId } = await request.json();
    if (!bookingId) {
      return NextResponse.json(
        { error: "bookingId is required" },
        { status: 400 },
      );
    }

    // Link the booking to the authenticated user's auth.users id
    const { error } = await supabaseAdmin
      .from("bookings")
      .update({ user_id: user.id })
      .eq("id", bookingId)
      .is("user_id", null); // only update if not already linked

    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    console.error("[bookings/link] error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
