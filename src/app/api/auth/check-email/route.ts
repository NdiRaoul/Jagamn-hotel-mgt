import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";

// GET /api/auth/check-email?email=xxx
// Returns the role of an existing user row, or null if not found.
// Used to decide whether to block signup (member) or allow it (guest or new).
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email");

  if (!email) {
    return NextResponse.json({ role: null }, { status: 400 });
  }

  try {
    const { data } = await supabaseAdmin
      .from("users")
      .select("role")
      .eq("email", email.toLowerCase().trim())
      .maybeSingle();

    return NextResponse.json({ role: data?.role ?? null });
  } catch {
    // On error, don't block signup
    return NextResponse.json({ role: null });
  }
}
