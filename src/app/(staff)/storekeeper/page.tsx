"use client";

import { StockActivityHeader } from "@/components/inventorypage/StockActivityHeader";
import { PendingKitchenConfirmations } from "@/components/inventorypage/PendingKitchenConfirmations";
import { LowStockAlerts } from "@/components/inventorypage/LowStockAlerts";
import { PurchaseOrdersSummary } from "@/components/inventorypage/PurchaseOrdersSummary";
import {
  mockStockIn,
  mockStockOut,
  mockStockInChange,
  mockStockOutNote,
  mockKitchenRequests,
  mockStockAlerts,
  mockPurchaseOrders,
} from "@/components/inventorypage/data";

export default function InventoryDashboardPage() {
  function handleViewAllRequests() {
    // TODO: router.push("/inventory/kitchen-requests")
  }

  function handleViewOrder(id: string) {
    // TODO: router.push(`/inventory/purchase-orders/${id}`)
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <StockActivityHeader
        stockIn={mockStockIn}
        stockOut={mockStockOut}
        stockInChange={mockStockInChange}
        stockOutNote={mockStockOutNote}
      />

      <div className="flex gap-6 items-start">
        <PendingKitchenConfirmations
          requests={mockKitchenRequests}
          onViewAll={handleViewAllRequests}
        />
        <LowStockAlerts alerts={mockStockAlerts} />
      </div>

      <PurchaseOrdersSummary
        orders={mockPurchaseOrders}
        onViewOrder={handleViewOrder}
      />
    </div>
  );
}