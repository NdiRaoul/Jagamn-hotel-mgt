import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import { ROOMS } from "@/lib/data/rooms";

type Props = { params: Promise<{ slug: string }> };

export async function GET(request: NextRequest, { params }: Props) {
  const { slug } = await params;
  const { searchParams } = new URL(request.url);
  const checkIn = searchParams.get("checkIn");
  const checkOut = searchParams.get("checkOut");

  if (!checkIn || !checkOut) {
    return NextResponse.json(
      { error: "checkIn and checkOut are required" },
      { status: 400 }
    );
  }

  try {
    // Get room type
    const { data: roomType, error: rtError } = await supabaseAdmin
      .from("room_types")
      .select("id, slug, name")
      .eq("slug", slug)
      .single();

    if (rtError || !roomType) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    // Check unavailable dates for this room type
    const { data: conflicts } = await supabaseAdmin
      .from("room_type_unavailable_dates")
      .select("*")
      .eq("room_type_id", roomType.id)
      .lte("from_date", checkOut)
      .gte("to_date", checkIn);

    const available = !conflicts || conflicts.length === 0;

    // Fetch alternate rooms if unavailable
    let alternateRooms: any[] = [];
    if (!available && conflicts && conflicts.length > 0) {
      const altSlugs: string[] = conflicts[0].alternate_room_slugs || [];
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
      conflicts: conflicts || [],
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
      (r) => ci <= new Date(r.to) && co >= new Date(r.from)
    );
    return NextResponse.json({
      available: !conflict,
      conflicts: conflict ? [conflict] : [],
      alternateRooms: [],
      alternateDates: conflict?.alternateDates || [],
    });
  }
}
