import { NextRequest, NextResponse } from "next/server";
import { createSupabaseRouteHandlerClient } from "@/lib/supabase-server";
import { resolveAppUser } from "@/lib/auth/app-user";
import { getGuestFolios } from "@/lib/data/folio";

const EMPTY = {
  bookings: [],
  totalCharges: 0,
  totalPaid: 0,
  totalBalanceDue: 0,
  totalRefundDue: 0,
  hasOutstanding: false,
  hasRefund: false,
};

// Guest-facing consolidated balance (room + extras − payments). The folio
// tables are staff-only under RLS, so guests must read their balance through
// this route, which resolves the app user and aggregates server-side.
export async function GET(req: NextRequest) {
  const supabase = await createSupabaseRouteHandlerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const appUser = await resolveAppUser(user.id, user.email);
  if (!appUser) return NextResponse.json(EMPTY);

  const bookingId = req.nextUrl.searchParams.get("booking_id") || undefined;

  try {
    const summary = await getGuestFolios(appUser.id, {
      bookingId,
      includeEntries: !!bookingId,
    });
    return NextResponse.json(summary);
  } catch (error) {
    console.error("[GET /api/bookings/folio]", error);
    return NextResponse.json(EMPTY);
  }
}
