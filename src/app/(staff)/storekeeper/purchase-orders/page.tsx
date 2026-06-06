import { getStorePurchaseOrders, getStoreKpis } from "@/lib/data/storekeeper";
import { getSuppliers } from "@/lib/data/procurement";
import PurchaseOrdersClient from "./purchase-orders-client";

export const dynamic = "force-dynamic";

export default async function PurchaseOrdersPage() {
  const [orders, kpis, suppliers] = await Promise.all([
    getStorePurchaseOrders(),
    getStoreKpis(),
    getSuppliers(),
  ]);
  return (
    <PurchaseOrdersClient
      orders={orders}
      kpis={kpis}
      suppliers={suppliers.map((s) => ({ id: s.id, name: s.name }))}
    />
  );
}
