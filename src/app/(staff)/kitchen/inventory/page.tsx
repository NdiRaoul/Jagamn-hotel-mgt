import { getInventoryRequests, getKitchenInventory } from "@/lib/data/kitchen";
import InventoryClient from "./inventory-client";

export const dynamic = "force-dynamic";

export default async function InventoryRequestsPage() {
  const [requests, inventory] = await Promise.all([
    getInventoryRequests(),
    getKitchenInventory(),
  ]);

  return <InventoryClient requests={requests} inventory={inventory} />;
}
