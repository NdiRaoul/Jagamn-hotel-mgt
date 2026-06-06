import { getStoreInventory, getStoreKpis } from "@/lib/data/storekeeper";
import InventoryClient from "./inventory-client";

export const dynamic = "force-dynamic";

export default async function InventoryPage() {
  const [inventory, kpis] = await Promise.all([
    getStoreInventory(),
    getStoreKpis(),
  ]);
  return <InventoryClient inventory={inventory} kpis={kpis} />;
}
