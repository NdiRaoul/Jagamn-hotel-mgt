import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import { checkEmailLimiter } from "@/lib/redis/rate-limit";

// GET /api/auth/check-email?email=xxx
// Returns the role of an existing user row, or null if not found.
// Used to decide whether to block signup (member) or allow it (guest or new).
export async function GET(request: NextRequest) {
  // Rate-limit by IP to prevent email enumeration scraping.
  // A small artificial delay is also added so timing attacks are harder.
  const ip = request.headers.get("x-forwarded-for") ?? "unknown";
  const rl = await checkEmailLimiter.limit(ip);
  if (!rl.success) {
    return NextResponse.json({ role: null }, { status: 429 });
  }

  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email");

  if (!email) {
    return NextResponse.json({ role: null }, { status: 400 });
  }

  // Small fixed delay to make timing-based enumeration harder
  await new Promise((r) => setTimeout(r, 100));

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
