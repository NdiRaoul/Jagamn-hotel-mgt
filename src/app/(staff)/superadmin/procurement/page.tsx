import { getPurchaseOrders, getProcurementKpis, getSuppliers } from "@/lib/data/procurement";
import { requireOwner } from "@/lib/auth/guard";
import ProcurementClient from "./procurement-client";

export const dynamic = "force-dynamic";

export default async function ProcurementPage() {
  await requireOwner();
  const [kpis, orders, suppliers] = await Promise.all([
    getProcurementKpis(),
    getPurchaseOrders(),
    getSuppliers(),
  ]);
  return <ProcurementClient kpis={kpis} orders={orders} suppliers={suppliers} />;
}
