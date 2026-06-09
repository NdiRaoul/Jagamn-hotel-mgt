import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import { getStaffSession } from "@/lib/auth/staff-session";

function deviceFromUA(ua: string): string {
  const s = ua.toLowerCase();
  if (/ipad|tablet/.test(s)) return "Tablet";
  if (/mobi|iphone|android/.test(s)) return "Mobile";
  if (s) return "Desktop";
  return "Unknown";
}

/**
 * POST /api/staff/login-event
 * Records an `auth.login` audit entry with the device type and best-effort
 * location, so the audit "Logins" tab can show who signed in, from where, and on what.
 */
export async function POST(req: NextRequest) {
  const session = await getStaffSession();
  if (!session || session.status !== "active") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const ua = req.headers.get("user-agent") || "";
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";
  const city = req.headers.get("x-vercel-ip-city");
  const country =
    req.headers.get("x-vercel-ip-country") ||
    req.headers.get("x-vercel-ip-country-region");
  const location =
    city || country
      ? [city, country].filter(Boolean).join(", ")
      : ip !== "unknown"
        ? ip
        : "Unknown";

  await supabaseAdmin.from("audit_log").insert({
    actor_id: session.auth_user_id,
    actor_role: session.role,
    action: "auth.login",
    target_type: "staff",
    target_id: session.id,
    payload: {
      device: deviceFromUA(ua),
      location,
      userAgent: ua.slice(0, 200),
      email: session.email,
      name: session.full_name,
    },
    ip,
  });

  return NextResponse.json({ ok: true });
}
