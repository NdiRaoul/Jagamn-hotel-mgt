import { supabaseAdmin } from "@/lib/supabase-server";
import { requireOwner } from "@/lib/auth/guard";
import SettingsClient from "./settings-client";

export const dynamic = "force-dynamic";

async function getSystemInfo() {
  // Get database stats
  const [
    { count: staffCount },
    { count: bookingsCount },
    { count: paymentsCount },
    { count: roomsCount },
  ] = await Promise.all([
    supabaseAdmin.from("staff").select("*", { count: "exact", head: true }),
    supabaseAdmin.from("bookings").select("*", { count: "exact", head: true }),
    supabaseAdmin.from("payments").select("*", { count: "exact", head: true }),
    supabaseAdmin.from("rooms").select("*", { count: "exact", head: true }),
  ]);

  // Get latest activity
  const { data: latestBooking } = await supabaseAdmin
    .from("bookings")
    .select("created_at")
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  return {
    database: {
      staff: staffCount || 0,
      bookings: bookingsCount || 0,
      payments: paymentsCount || 0,
      rooms: roomsCount || 0,
    },
    lastActivity: latestBooking?.created_at || new Date().toISOString(),
    version: "2.0.0",
    environment: process.env.NODE_ENV || "production",
  };
}

export default async function SettingsPage() {
  await requireOwner();
  const systemInfo = await getSystemInfo();
  return <SettingsClient systemInfo={systemInfo} />;
}
