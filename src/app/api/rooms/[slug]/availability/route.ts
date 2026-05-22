import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import { ROOMS } from "@/lib/data/rooms";
import { getCached } from "@/lib/redis/cache";

type Props = { params: Promise<{ slug: string }> };

type RoomAvailabilityCacheEntry = {
  roomTypeId: string;
  unavailableDates: Array<{
    from_date: string;
    to_date: string;
    alternate_room_slugs?: string[];
    alternate_dates?: Array<{ from: string; to: string }>;
  }>;
};

async function loadRoomAvailability(
  slug: string,
): Promise<RoomAvailabilityCacheEntry | null> {
  return getCached<RoomAvailabilityCacheEntry>(
    `availability:slug:${slug}`,
    60,
    async () => {
      const { data: roomType } = await supabaseAdmin
        .from("room_types")
        .select("id, room_type_unavailable_dates(*)")
        .eq("slug", slug)
        .single();

      if (!roomType) {
        return null;
      }

      return {
        roomTypeId: roomType.id,
        unavailableDates: roomType.room_type_unavailable_dates || [],
      };
    },
  );
}

function rangeOverlaps(
  checkIn: string,
  checkOut: string,
  range: { from_date: string; to_date: string },
) {
  return range.from_date <= checkOut && range.to_date >= checkIn;
}

export async function GET(request: NextRequest, { params }: Props) {
  const { slug } = await params;
  const { searchParams } = new URL(request.url);
  const checkIn = searchParams.get("checkIn");
  const checkOut = searchParams.get("checkOut");

  if (!checkIn || !checkOut) {
    // Return all unavailable date ranges for this room (for calendar display)
    try {
      const availability = await loadRoomAvailability(slug);
      return NextResponse.json({
        unavailable: availability?.unavailableDates || [],
        available: true,
      });
    } catch {
      return NextResponse.json({ unavailable: [], available: true });
    }
  }

  try {
    const availability = await loadRoomAvailability(slug);

    if (!availability) {
      return NextResponse.json({
        available: true,
        conflicts: [],
        alternateRooms: [],
        alternateDates: [],
      });
    }

    const conflicts = availability.unavailableDates.filter((range) =>
      rangeOverlaps(checkIn, checkOut, range),
    );
    const available = conflicts.length === 0;

    let alternateRooms: unknown[] = [];
    if (!available && conflicts.length > 0) {
      const altSlugs = conflicts[0].alternate_room_slugs || [];
      if (altSlugs.length > 0) {
        const { data: alts } = await supabaseAdmin
          .from("room_types")
          .select("*")
          .in("slug", altSlugs);
        alternateRooms = alts || [];
      }
    }

    return NextResponse.json({
      available,
      conflicts,
      alternateRooms,
      alternateDates: conflicts?.[0]?.alternate_dates || [],
    });
  } catch (err) {
    console.error("[GET /api/rooms/[slug]/availability] error:", err);
    // Fallback to static data
    const room = ROOMS.find((r) => r.slug === slug);
    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }
    const ci = new Date(checkIn);
    const co = new Date(checkOut);
    const conflict = room.unavailableDates.find(
      (r) => ci <= new Date(r.to) && co >= new Date(r.from),
    );
    return NextResponse.json({
      available: !conflict,
      conflicts: conflict ? [conflict] : [],
      alternateRooms: [],
      alternateDates: conflict?.alternateDates || [],
    });
  }
}
