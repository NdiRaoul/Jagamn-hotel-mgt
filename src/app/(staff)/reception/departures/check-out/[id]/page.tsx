import { supabaseAdmin } from "@/lib/supabase-server";
import { notFound } from "next/navigation";
import CheckOutClient from "./check-out-client";

export const dynamic = "force-dynamic";

export default async function CheckOutBillingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { data: raw, error } = await supabaseAdmin
    .from("bookings")
    .select(
      "id,booking_ref,guest_name,guest_email,room_slug,rooms(unit_code),check_in,check_out,nights,total_amount,room_price_per_night,tax_amount,payment_status,status",
    )
    .eq("id", id)
    .maybeSingle();

  if (error || !raw) {
    notFound();
  }

  // Supabase returns joined FK relations as arrays; normalise to single object
  const booking = {
    ...raw,
    rooms: Array.isArray(raw.rooms) ? (raw.rooms[0] ?? null) : raw.rooms,
  } as Parameters<typeof CheckOutClient>[0]["booking"];

  return <CheckOutClient booking={booking} />;
}
