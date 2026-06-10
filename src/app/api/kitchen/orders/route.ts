import { NextResponse } from "next/server";
import { getKitchenOrders } from "@/lib/data/kitchen";
import { getStaffSession } from "@/lib/auth/staff-session";

export const dynamic = "force-dynamic";

const ALLOWED_ROLES = ["kitchen", "manager", "admin", "owner"];

export async function GET() {
  const session = await getStaffSession();
  if (
    !session ||
    session.status !== "active" ||
    !ALLOWED_ROLES.includes(session.role)
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const orders = await getKitchenOrders();
    return NextResponse.json({ orders });
  } catch (error) {
    console.error("Failed to fetch kitchen orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 },
    );
  }
}
