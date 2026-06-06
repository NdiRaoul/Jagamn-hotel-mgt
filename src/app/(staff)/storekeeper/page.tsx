import {
  getStoreKpis,
  getInventoryRequests,
  getStorePurchaseOrders,
  getStoreInventory,
} from "@/lib/data/storekeeper";
import StorekeeperDashboardClient from "./dashboard-client";

export const dynamic = "force-dynamic";

export default async function StorekeeperDashboardPage() {
  const [kpis, requests, orders, inventory] = await Promise.all([
    getStoreKpis(),
    getInventoryRequests(["requested"]),
    getStorePurchaseOrders(),
    getStoreInventory(),
  ]);

  return (
    <StorekeeperDashboardClient
      kpis={kpis}
      requests={requests}
      orders={orders}
      inventory={inventory}
    />
  );
}
