import {
  getStoreKpis,
  getInventoryRequests,
  getStorePurchaseOrders,
  getStoreInventory,
  getStoreReports,
} from "@/lib/data/storekeeper";
import StorekeeperDashboardClient from "./dashboard-client";

export const dynamic = "force-dynamic";

export default async function StorekeeperDashboardPage() {
  const [kpis, requests, orders, inventory, reports] = await Promise.all([
    getStoreKpis(),
    getInventoryRequests(["requested"]),
    getStorePurchaseOrders(),
    getStoreInventory(),
    getStoreReports(),
  ]);

  return (
    <StorekeeperDashboardClient
      kpis={kpis}
      requests={requests}
      orders={orders}
      inventory={inventory}
      totalValuationXaf={reports.totalValuationXaf}
    />
  );
}
