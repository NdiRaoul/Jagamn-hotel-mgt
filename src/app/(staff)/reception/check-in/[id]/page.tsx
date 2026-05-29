import React from "react";
import { supabaseAdmin } from "@/lib/supabase-server";
import { notFound } from "next/navigation";
import CheckInClient from "./check-in-client";

export const dynamic = "force-dynamic";

export default async function CheckInPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { data: booking, error } = await supabaseAdmin
    .from("bookings")
    .select(
      "id,booking_ref,guest_name,guest_email,guest_phone,guest_country,guest_id_type,guest_id_number,room_slug,room_type_id,room_id,check_in,check_out,nights,guests,total_amount,payment_status,status,special_requests,room_types(id,name,slug)",
    )
    .eq("id", id)
    .maybeSingle();

  if (error || !booking) notFound();

  // Fetch available rooms for this room type
  const { data: occupiedRows } = await supabaseAdmin
    .from("bookings")
    .select("room_id")
    .neq("room_id", null)
    .in("status", ["confirmed", "checked_in"]);

  const occupiedIds = (occupiedRows ?? [])
    .map((r: any) => r.room_id as string)
    .filter(Boolean);

  let availableRooms: {
    id: string;
    unit_code: string;
    floor: number | null;
  }[] = [];
  if (booking.room_type_id) {
    let q = supabaseAdmin
      .from("rooms")
      .select("id,unit_code,floor")
      .eq("room_type_id", booking.room_type_id)
      .eq("is_active", true);
    if (occupiedIds.length > 0) {
      q = q.not("id", "in", `(${occupiedIds.join(",")})`);
    }
    const { data } = await q.order("unit_code");
    availableRooms = data ?? [];
  }

  return (
    <CheckInClient booking={booking as any} availableRooms={availableRooms} />
  );
}
