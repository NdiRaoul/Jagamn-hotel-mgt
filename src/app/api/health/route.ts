import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

/**
 * Health endpoint for load balancers / autoscalers.
 *
 * - Default (liveness): lightweight — confirms the process is up.
 * - `?check=db` (readiness): pings the database and returns 503 if it is
 *   unreachable, so the orchestrator can drain the instance from rotation.
 */
export async function GET(request: NextRequest) {
  const deep = new URL(request.url).searchParams.get("check") === "db";
  const timestamp = new Date().toISOString();

  if (!deep) {
    return NextResponse.json({ status: "ok", timestamp });
  }

  try {
    const { error } = await supabaseAdmin
      .from("staff")
      .select("id", { head: true, count: "exact" })
      .limit(1);
    if (error) throw error;
    return NextResponse.json({ status: "ok", database: "ok", timestamp });
  } catch (e) {
    return NextResponse.json(
      {
        status: "degraded",
        database: "unreachable",
        error: e instanceof Error ? e.message : "unknown",
        timestamp,
      },
      { status: 503 },
    );
  }
}
