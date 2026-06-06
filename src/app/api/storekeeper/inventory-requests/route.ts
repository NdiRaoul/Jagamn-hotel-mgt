import { NextRequest, NextResponse } from "next/server";
import { getStaffSession } from "@/lib/auth/staff-session";
import { getInventoryRequests } from "@/lib/data/storekeeper";

const ROLES = ["owner", "admin", "manager", "storekeeper"];

/**
 * GET /api/storekeeper/inventory-requests?status=requested,approved
 * Lists inventory requests for the storekeeper queue.
 */
export async function GET(req: NextRequest) {
  const session = await getStaffSession();
  if (!session || session.status !== "active" || !ROLES.includes(session.role))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const statusParam = searchParams.get("status");
  const statuses = statusParam
    ? statusParam.split(",").map((s) => s.trim()).filter(Boolean)
    : ["requested", "approved"];

  try {
    const requests = await getInventoryRequests(statuses);
    return NextResponse.json({ requests });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch requests" },
      { status: 500 },
    );
  }
}
