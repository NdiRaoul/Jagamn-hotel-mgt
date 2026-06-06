import {
  getPurchaseOrders,
  getSuppliers,
  getProcurementKpis,
} from "@/lib/data/procurement";
import ProcurementClient from "./procurement-client";

export const dynamic = "force-dynamic";

export default async function ProcurementPage() {
  let orders: Awaited<ReturnType<typeof getPurchaseOrders>> = [];
  let suppliers: Awaited<ReturnType<typeof getSuppliers>> = [];
  let kpis: Awaited<ReturnType<typeof getProcurementKpis>> = {
    pendingApproval: 0,
    inTransit: 0,
    deliveredThisMonth: 0,
    totalSpendMinor: 0,
  };
  let error: string | null = null;

  try {
    [orders, suppliers, kpis] = await Promise.all([
      getPurchaseOrders(),
      getSuppliers(),
      getProcurementKpis(),
    ]);
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load procurement data";
  }

  return (
    <ProcurementClient
      orders={orders}
      suppliers={suppliers}
      kpis={kpis}
      error={error}
    />
  );
}
