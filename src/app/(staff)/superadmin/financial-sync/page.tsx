import { supabaseAdmin } from "@/lib/supabase-server";
import { getRevenueMonthly } from "@/lib/data/admin";
import { requireOwner } from "@/lib/auth/guard";
import FinancialSyncClient from "./financial-sync-client";

export const dynamic = "force-dynamic";

interface PaymentTimelineEntry {
  payment_id: string;
  booking_ref: string;
  provider: string;
  amount_minor: number;
  currency: string;
  processor_ref: string | null;
  ledger_status: string;
  derived_status: string;
  guest_name: string | null;
  guest_email: string | null;
  room_slug: string | null;
  event_type: string;
  source: string | null;
  event_at: string;
}

async function getPaymentTimeline(limit = 50): Promise<PaymentTimelineEntry[]> {
  const { data, error } = await supabaseAdmin
    .from("payment_timeline")
    .select("*")
    .order("event_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Failed to fetch payment timeline:", error);
    return [];
  }

  return data || [];
}

async function getSyncStats() {
  // Get counts of payments by status
  const { data: payments } = await supabaseAdmin
    .from("payment_ledger")
    .select("status");

  const statusCounts = (payments || []).reduce(
    (acc, p) => {
      acc[p.status] = (acc[p.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  // Get latest sync time
  const { data: latestPayment } = await supabaseAdmin
    .from("payment_ledger")
    .select("updated_at")
    .order("updated_at", { ascending: false })
    .limit(1)
    .single();

  return {
    statusCounts,
    lastSync: latestPayment?.updated_at || new Date().toISOString(),
  };
}

export default async function FinancialSyncPage() {
  await requireOwner();

  const [timeline, revenueMonthly, syncStats] = await Promise.all([
    getPaymentTimeline(),
    getRevenueMonthly(),
    getSyncStats(),
  ]);

  return (
    <FinancialSyncClient
      timeline={timeline}
      revenueMonthly={revenueMonthly}
      syncStats={syncStats}
    />
  );
}
