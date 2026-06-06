"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { InventoryPageHeader } from "@/components/inventorypage/InventoryPageHeader";
import { InventoryTable } from "@/components/inventorypage/InventoryTable";
import { PredictiveStockAnalysis } from "@/components/inventorypage/PredictiveStockAnalysis";
import { ManualAuditCard } from "@/components/inventorypage/ManualAuditCard";
import type {
  InventoryItem,
  PredictiveItem,
} from "@/components/inventorypage/inventorydata";
import type { StoreInventoryItem, StoreKpis } from "@/lib/data/storekeeper";

const PLACEHOLDER =
  "https://images.unsplash.com/photo-1584736286279-5d85e4a8c45c?w=60&h=60&fit=crop";

function relative(ts: string | null): string {
  if (!ts) return "Never";
  const diff = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return days === 1 ? "Yesterday" : `${days} days ago`;
}

function toInventoryItem(i: StoreInventoryItem): InventoryItem {
  return {
    id: i.id,
    name: i.name,
    category: i.category ?? "Uncategorised",
    unitLabel: i.unit,
    currentStock: i.on_hand,
    maxStock: i.max_stock,
    status: i.status,
    lastSync: relative(i.last_counted_at),
    image: i.image_url ?? PLACEHOLDER,
  };
}

export default function InventoryClient({
  inventory,
  kpis,
}: {
  inventory: StoreInventoryItem[];
  kpis: StoreKpis;
}) {
  const router = useRouter();
  const [items, setItems] = useState<InventoryItem[]>(
    inventory.map(toInventoryItem),
  );

  const predictiveItems: PredictiveItem[] = inventory
    .filter((i) => i.status !== "OPTIMAL")
    .slice(0, 3)
    .map((i) => ({
      id: i.id,
      name: i.name,
      status: i.status === "BELOW THRESHOLD" ? "HIGH RISK OF DEPLETION" : "MONITOR",
    }));

  const optimalPct =
    inventory.length > 0
      ? Math.round(
          (inventory.filter((i) => i.status === "OPTIMAL").length /
            inventory.length) *
            100,
        )
      : 0;

  async function handleUpdateStock(id: string, newStock: number) {
    await fetch(`/api/storekeeper/inventory/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ on_hand: newStock }),
    });
    router.refresh();
  }

  return (
    <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
      <InventoryPageHeader
        criticalAlerts={kpis.criticalAlerts}
        activeSKUs={kpis.activeSkus}
      />

      <InventoryTable
        items={items}
        onItemsChange={setItems}
        onUpdateStock={handleUpdateStock}
      />

      <div className="flex flex-col lg:flex-row gap-4 mt-6 lg:items-stretch">
        <PredictiveStockAnalysis items={predictiveItems} occupancyPct={optimalPct} />
        <ManualAuditCard />
      </div>
    </div>
  );
}
