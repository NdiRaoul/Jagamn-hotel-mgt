"use client";

/**
 * Inventory Page — page.tsx
 * Path: app/(staff)/inventory/page.tsx
 *
 * Components:
 *  - InventoryPageHeader      → title, Critical Alerts, Active SKUs
 *  - InventoryTable           → tabs, sort, table rows, pagination, Update Stock modal
 *  - PredictiveStockAnalysis  → next-week occupancy forecast
 *  - ManualAuditCard          → dark quick-action card with audit modal
 *
 * To connect real data:
 *  - Replace mock imports with your API hooks/fetches
 *  - Each TODO comment marks the exact API call to wire in
 */

import { useState } from "react";
import { InventoryPageHeader } from "@/components/inventorypage/InventoryPageHeader";
import { InventoryTable } from "@/components/inventorypage/InventoryTable";
import { PredictiveStockAnalysis } from "@/components/inventorypage/PredictiveStockAnalysis";
import { ManualAuditCard } from "@/components/inventorypage/ManualAuditCard";
import {
  mockInventoryItems,
  mockPredictiveItems,
  mockCriticalAlerts,
  mockActiveSKUs,
  InventoryItem,
} from "@/components/inventorypage/inventorydata";

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>(mockInventoryItems);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <InventoryPageHeader
        criticalAlerts={mockCriticalAlerts}
        activeSKUs={mockActiveSKUs}
      />

      {/* Inventory Table */}
      <InventoryTable items={items} onItemsChange={setItems} />

      {/* Bottom row */}
      <div className="flex gap-4 mt-6 items-stretch">
        <PredictiveStockAnalysis
          items={mockPredictiveItems}
          occupancyPct={94}
        />
        <ManualAuditCard />
      </div>
    </div>
  );
}