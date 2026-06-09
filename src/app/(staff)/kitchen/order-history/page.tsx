import { getOrderHistory, getRoomTypeNames } from "@/lib/data/kitchen";
import OrderHistoryClient from "./order-history-client";

export const dynamic = "force-dynamic";

export default async function OrderHistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string; roomType?: string }>;
}) {
  const { from, to, roomType } = await searchParams;

  const [orders, roomTypes] = await Promise.all([
    getOrderHistory({ from, to, roomType }),
    getRoomTypeNames(),
  ]);

  return (
    <OrderHistoryClient
      orders={orders}
      roomTypes={roomTypes}
      filters={{ from: from ?? "", to: to ?? "", roomType: roomType ?? "all" }}
    />
  );
}
