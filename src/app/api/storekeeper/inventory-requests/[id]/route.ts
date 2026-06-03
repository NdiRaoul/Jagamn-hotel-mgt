import { NextRequest, NextResponse } from "next/server";
import { getStaffSession } from "@/lib/auth/staff-session";

/**
 * PATCH /api/storekeeper/inventory-requests/[id]
 *
 * STUB ENDPOINT - Intentionally left open for future implementation
 *
 * This endpoint is a placeholder for the storekeeper fulfillment workflow.
 * When the storekeeper portal is built, this will:
 * - Accept { action: 'approve' | 'fulfill' | 'reject', notes }
 * - Update inventory_requests.status
 * - Decrement inventory_items.on_hand on fulfillment
 * - Notify kitchen role via notify_role()
 *
 * For now, it returns a permissive stub response.
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const session = await getStaffSession();

    // Permissive role check - allow storekeeper, manager, admin, owner
    if (
      !session ||
      !["storekeeper", "manager", "admin", "owner"].includes(session.role)
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { action, notes } = body;

    // TODO(storekeeper): Implement actual fulfillment logic
    // - Validate action ('approve' | 'fulfill' | 'reject')
    // - Update inventory_requests.status
    // - If action === 'fulfill':
    //   - Decrement inventory_items.on_hand
    //   - Set fulfilled_at, fulfilled_by
    // - Notify kitchen role
    // - Return updated request

    return NextResponse.json({
      ok: true,
      todo: true,
      message:
        "Storekeeper fulfillment endpoint is a stub. Full implementation pending.",
      received: { id, action, notes },
    });
  } catch (error) {
    console.error("Storekeeper fulfillment error:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 },
    );
  }
}
