/**
 * GET /api/health — liveness check + opportunistic reconcile drain.
 *
 * The reconcile queue drain (Fix 2) is called fire-and-forget here so that
 * missed payment webhooks are caught during normal traffic without any
 * scheduler. The drain never blocks the health response.
 */
import { NextResponse } from "next/server";
import { drainReconcileQueue } from "@/lib/redis/reconcile";

export const dynamic = "force-dynamic";

export async function GET() {
  // Fire-and-forget — never let the drain affect the health response latency
  drainReconcileQueue(5).catch(() => {});

  return NextResponse.json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
}
