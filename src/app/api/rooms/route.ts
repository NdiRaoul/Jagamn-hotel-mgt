import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import { ROOMS } from "@/lib/data/rooms";
import { drainReconcileQueue } from "@/lib/redis/reconcile";
import { getCached } from "@/lib/redis/cache";

type RoomCatalogueEntry = {
  id: string;
  slug: string;
  [key: string]: unknown;
};

type RoomAvailabilityEntry = {
  unavailableDates: Array<{ from_date: string; to_date: string }>;
};

function rangeOverlaps(
  checkIn: string,
  checkOut: string,
  range: { from_date: string; to_date: string },
) {
  return range.from_date <= checkOut && range.to_date >= checkIn;
}

async function loadRoomAvailabilityBySlug(
  slug: string,
  roomTypeId: string,
): Promise<RoomAvailabilityEntry> {
  return (
    (await getCached<RoomAvailabilityEntry>(
      `availability:slug:${slug}`,
      60,
      async () => {
        const { data, error } = await supabaseAdmin
          .from("room_type_unavailable_dates")
          .select("from_date, to_date")
          .eq("room_type_id", roomTypeId);

        if (error) throw error;
        return { unavailableDates: data || [] };
      },
    )) ?? { unavailableDates: [] }
  );
}

export async function GET(request: NextRequest) {
  // Opportunistic reconcile drain (Fix 2) — fire-and-forget.
  // Amortises missed-webhook recovery across organic room-list traffic.
  drainReconcileQueue(3).catch(() => {});
  const { searchParams } = new URL(request.url);
  const checkIn = searchParams.get("checkIn");
  const checkOut = searchParams.get("checkOut");

  // Fallback if Supabase is not configured
  const isConfigured =
    !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !!process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!isConfigured) {
    return NextResponse.json({ rooms: ROOMS, source: "static" });
  }

  try {
    const roomTypes = await getCached<RoomCatalogueEntry[]>(
      `roomcatalogue:all`,
      300,
      async () => {
        const { data, error } = await supabaseAdmin
          .from("room_types")
          .select("*, room_amenities(*)")
          .order("sort_order");
        if (error) throw error;
        return data || [];
      },
    );

    const availabilitySummary = await getCached<any[]>(
      `availability:summary`,
      60,
      async () => {
        const { data, error } = await supabaseAdmin
          .from("room_availability_summary")
          .select("*");
        if (error) throw error;
        return data || [];
      },
    );

    const availMap: Record<string, number> = {};
    if (availabilitySummary) {
      for (const row of availabilitySummary) {
        availMap[row.slug] = row.available_today;
      }
    }

    let conflictSlugs = new Set<string>();
    if (checkIn && checkOut) {
      await Promise.all(
        (roomTypes || []).map(async (rt) => {
          const availability = await loadRoomAvailabilityBySlug(rt.slug, rt.id);
          if (
            availability.unavailableDates.some((range) =>
              rangeOverlaps(checkIn, checkOut, range),
            )
          ) {
            conflictSlugs.add(rt.slug);
          }
        }),
      );
    }

    const rooms = (roomTypes || []).map((rt) => ({
      ...rt,
      available_count: availMap[rt.slug] ?? 0,
      available: checkIn && checkOut ? !conflictSlugs.has(rt.slug) : true,
    }));

    return NextResponse.json({ rooms, source: "supabase" });
  } catch (err) {
    console.error("[GET /api/rooms] error:", err);
    // Fallback to static data
    return NextResponse.json({ rooms: ROOMS, source: "static" });
  }
}
