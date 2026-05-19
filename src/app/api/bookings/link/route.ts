import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";

// POST /api/bookings/link — link a booking to a newly created user
export async function POST(request: NextRequest) {
  try {
    const { bookingId, userId } = await request.json();
    if (!bookingId || !userId) {
      return NextResponse.json({ error: "bookingId and userId required" }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from("bookings")
      .update({ user_id: userId })
      .eq("id", bookingId)
      .is("user_id", null); // only update if not already linked

    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
