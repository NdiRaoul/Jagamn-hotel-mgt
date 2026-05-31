import { NextResponse } from "next/server";
import { getKitchenOrders } from "@/lib/data/kitchen";

export const dynamic = "force-dynamic";

export async function GET() {
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
