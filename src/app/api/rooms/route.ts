import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import { ROOMS } from "@/lib/data/rooms";
import { drainReconcileQueue } from "@/lib/redis/reconcile";

export async function GET(request: NextRequest) {
  // Opportunistically drain the reconcile queue on organic traffic so missed
  // webhooks / abandoned tabs still settle. Fire-and-forget — never blocks.
  drainReconcileQueue().catch(() => {});

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
    // Fetch room types with amenities and unavailable dates
    const { data: roomTypes, error } = await supabaseAdmin
      .from("room_types")
      .select("*, room_amenities(*), room_type_unavailable_dates(*)")
      .order("sort_order");

    if (error) throw error;

    // Fetch availability summary
    const { data: availability } = await supabaseAdmin
      .from("room_availability_summary")
      .select("*");

    const availMap: Record<string, number> = {};
    if (availability) {
      for (const row of availability) {
        availMap[row.slug] = row.available_today;
      }
    }

    // If date params provided, check conflicts
    let conflictSlugs: Set<string> = new Set();
    if (checkIn && checkOut) {
      const { data: conflicts } = await supabaseAdmin
        .from("room_type_unavailable_dates")
        .select("room_type_id, room_types(slug)")
        .lte("from_date", checkOut)
        .gte("to_date", checkIn);

      if (conflicts) {
        for (const c of conflicts) {
          const slug = (c.room_types as any)?.slug;
          if (slug) conflictSlugs.add(slug);
        }
      }
    }

    const rooms = (roomTypes || []).map((rt: any) => ({
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
