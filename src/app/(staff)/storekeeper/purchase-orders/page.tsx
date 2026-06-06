"use client";

/**
 * Purchase Orders Page — page.tsx
 * Path: app/(staff)/inventory/purchase-orders/page.tsx
 *
 * Components:
 *  - PurchaseOrdersHeader      → title, Open Orders + Pending Receipt stat cards
 *  - PurchaseOrdersTable       → tabs, table, status badges, action menu, pagination
 *  - NewPurchaseOrderDrawer    → slide-in drawer to create a new PO
 *  - ReceiveGoodsDrawer        → slide-in drawer to receive goods against an APPROVED PO
 *  - RecentActivity            → timeline of recent PO events
 *  - QuickActionsCard          → dark card with New PO + Import from Template buttons
 *
 * To connect real data:
 *  - Replace mock imports with your API hooks / server fetches
 *  - Each TODO comment in the drawer components marks the exact API call
 */

import { useState } from "react";
import { PurchaseOrdersHeader } from "@/components/inventorypage/PurchaseOrdersHeader";
import { PurchaseOrdersTable } from "@/components/inventorypage/PurchaseOrdersTable";
import { NewPurchaseOrderDrawer } from "@/components/inventorypage/NewPurchaseOrderDrawer";
import { ReceiveGoodsDrawer } from "@/components/inventorypage/ReceiveGoodsDrawer";
import { RecentActivity } from "@/components/inventorypage/RecentActivity";
import { QuickActionsCard } from "@/components/inventorypage/QuickActionsCard";
import {
  mockPurchaseOrders,
  mockActivity,
  mockOpenOrders,
  mockPendingReceipt,
  PurchaseOrder,
} from "@/components/inventorypage/purchaseData";

export default function PurchaseOrdersPage() {
  const [orders, setOrders] = useState<PurchaseOrder[]>(mockPurchaseOrders);
  const [showNewPO, setShowNewPO] = useState(false);
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);
  const [drawerMode, setDrawerMode] = useState<"receive" | "edit" | null>(null);

  function handleReceiveGoods(po: PurchaseOrder) {
    setSelectedPO(po);
    setDrawerMode("receive");
  }

  function handleEdit(po: PurchaseOrder) {
    setSelectedPO(po);
    setDrawerMode("edit");
  }

  function handleConfirmReceipt(poId: string) {
    // TODO: backend will update status — for now update locally
    setOrders((prev) =>
      prev.map((o) => o.id === poId ? { ...o, status: "RECEIVED" as const } : o)
    );
  }

  function handleSaveDraft() {
    const newOrder: PurchaseOrder = {
      id: String(orders.length + 1),
      poNumber: `#${8900 + orders.length}`,
      supplier: "Grand Estates Linens Ltd.",
      items: 2,
      totalValue: "$4,080.00",
      totalValueRaw: 4080,
      status: "DRAFT",
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    };
    setOrders((prev) => [newOrder, ...prev]);
  }

  function handleSubmitPO() {
    const newOrder: PurchaseOrder = {
      id: String(orders.length + 1),
      poNumber: `#${8900 + orders.length}`,
      supplier: "Grand Estates Linens Ltd.",
      items: 2,
      totalValue: "$4,080.00",
      totalValueRaw: 4080,
      status: "SUBMITTED",
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    };
    setOrders((prev) => [newOrder, ...prev]);
  }

  function handleImportTemplate() {
    // TODO: open template picker modal
    console.log("Import from template");
  }

  function closeDrawer() {
    setSelectedPO(null);
    setDrawerMode(null);
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <PurchaseOrdersHeader
        openOrders={mockOpenOrders}
        pendingReceipt={mockPendingReceipt}
      />

      {/* Table */}
      <PurchaseOrdersTable
        orders={orders}
        onReceiveGoods={handleReceiveGoods}
        onEdit={handleEdit}
      />

      {/* Bottom row */}
      <div className="flex gap-4 mt-6 items-stretch">
        <RecentActivity items={mockActivity} onViewAll={() => console.log("View all activity")} />
        <QuickActionsCard
          onNewPO={() => setShowNewPO(true)}
          onImportTemplate={handleImportTemplate}
        />
      </div>

      {/* New PO Drawer */}
      {showNewPO && (
        <NewPurchaseOrderDrawer
          onClose={() => setShowNewPO(false)}
          onSaveDraft={handleSaveDraft}
          onSubmit={handleSubmitPO}
        />
      )}

      {/* Receive Goods Drawer */}
      {selectedPO && drawerMode === "receive" && (
        <ReceiveGoodsDrawer
          po={selectedPO}
          onClose={closeDrawer}
          onConfirm={handleConfirmReceipt}
        />
      )}
    </div>
  );
}