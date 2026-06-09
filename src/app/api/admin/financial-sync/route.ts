import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import { getStaffSession } from "@/lib/auth/staff-session";
import { drainReconcileQueue } from "@/lib/redis/reconcile";

// POST /api/admin/financial-sync — owner-only.
//
// Refreshes the financial aggregates the Financial Sync page reads: drains the
// reconcile queue (payment_ledger ↔ bookings), expires stale pending bookings,
// and sweeps old webhook rows. Idempotent / no-op-safe — running it repeatedly
// has no adverse effect. Returns the new latestSync timestamp.
export async function POST(_request: NextRequest) {
  const session = await getStaffSession();
  if (!session || session.status !== "active") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.role !== "owner") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    // Reconcile any queued payment ↔ booking mismatches.
    await drainReconcileQueue(50);

    // Settle stale pending bookings and sweep old webhook events (idempotent).
    await Promise.all([
      supabaseAdmin.rpc("expire_stale_bookings"),
      supabaseAdmin.rpc("sweep_old_webhook_events"),
    ]);

    // The page derives "last sync" from the newest payment_ledger.updated_at.
    const { data: latest } = await supabaseAdmin
      .from("payment_ledger")
      .select("updated_at")
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const latestSync = latest?.updated_at || new Date().toISOString();

    return NextResponse.json({ success: true, latestSync });
  } catch (error: unknown) {
    console.error("[POST /api/admin/financial-sync] error:", error);
    const message =
      error instanceof Error ? error.message : "Sync failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
