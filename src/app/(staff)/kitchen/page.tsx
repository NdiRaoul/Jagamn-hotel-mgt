import { getKitchenOrders, getKitchenStats } from "@/lib/data/kitchen";
import KitchenOrdersClient from "./kitchen-orders-client";

export const dynamic = "force-dynamic";

export default async function KitchenOrdersPage() {
  const [orders, stats] = await Promise.all([
    getKitchenOrders(),
    getKitchenStats(),
  ]);

  return <KitchenOrdersClient orders={orders} stats={stats} />;
}
