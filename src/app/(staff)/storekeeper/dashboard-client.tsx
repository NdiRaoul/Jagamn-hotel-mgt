"use client";

import { useRouter } from "next/navigation";
import { StockActivityHeader } from "@/components/inventorypage/StockActivityHeader";
import { PendingKitchenConfirmations } from "@/components/inventorypage/PendingKitchenConfirmations";
import { LowStockAlerts } from "@/components/inventorypage/LowStockAlerts";
import { PurchaseOrdersSummary } from "@/components/inventorypage/PurchaseOrdersSummary";
import type { KitchenRequest, StockAlert, PurchaseOrder } from "@/components/inventorypage/data";
import { formatMoney } from "@/lib/currency";
import type {
  StoreKpis,
  StoreInventoryRequest,
  StorePurchaseOrder,
  StoreInventoryItem,
} from "@/lib/data/storekeeper";

const PLACEHOLDER =
  "https://images.unsplash.com/photo-1498579150354-977475b7ea0b?w=80&h=80&fit=crop";

function toKitchenRequest(r: StoreInventoryRequest): KitchenRequest {
  return {
    id: r.id,
    orderNumber: r.id.slice(0, 4).toUpperCase(),
    title: r.item_name,
    requestedBy: r.requested_by_name ?? "Kitchen",
    itemCount: r.quantity,
    priority: r.notes ? "Priority High" : "Regular Inventory",
    status: r.status === "approved" ? "IN QUEUE" : "NEEDS APPROVAL",
    station: "MAIN KITCHEN",
    image: PLACEHOLDER,
  };
}

const PO_COLUMN: Record<string, PurchaseOrder["column"] | undefined> = {
  pending_approval: "SUBMITTED",
  approved: "APPROVED",
  ordered: "APPROVED",
  in_transit: "APPROVED",
};

function toSummaryOrder(o: StorePurchaseOrder): PurchaseOrder | null {
  const column = PO_COLUMN[o.status];
  if (!column) return null;
  return {
    id: o.po_number,
    name: o.description,
    amount: formatMoney(o.total_xaf),
    column,
  };
}

export default function StorekeeperDashboardClient({
  kpis,
  requests,
  orders,
  inventory,
}: {
  kpis: StoreKpis;
  requests: StoreInventoryRequest[];
  orders: StorePurchaseOrder[];
  inventory: StoreInventoryItem[];
}) {
  const router = useRouter();

  const kitchenRequests = requests.map(toKitchenRequest);

  const alerts: StockAlert[] = inventory
    .filter((i) => i.status === "BELOW THRESHOLD")
    .slice(0, 6)
    .map((i) => ({
      id: i.id,
      level: i.on_hand === 0 ? "CRITICAL LEVEL" : "LOW INVENTORY",
      name: i.name,
      currentUnits: i.on_hand,
      minUnits: i.reorder_level,
      selected: false,
    }));

  const summaryOrders = orders
    .map(toSummaryOrder)
    .filter((o): o is PurchaseOrder => o !== null);

  async function handleApprove(id: string) {
    await fetch(`/api/storekeeper/inventory-requests/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "approve" }),
    });
    router.refresh();
  }

  async function handleReject(id: string) {
    await fetch(`/api/storekeeper/inventory-requests/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "reject" }),
    });
    router.refresh();
  }

  return (
    <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
      <StockActivityHeader
        stockIn={kpis.stockInToday}
        stockOut={kpis.stockOutToday}
        stockInChange={`${kpis.pendingReceipt} awaiting receipt`}
        stockOutNote={`${kpis.criticalAlerts} critical alerts`}
      />

      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 lg:items-start">
        <PendingKitchenConfirmations
          requests={kitchenRequests}
          onViewAll={() => router.push("/storekeeper/inventory")}
          onConfirm={handleApprove}
          onReject={handleReject}
        />
        <LowStockAlerts alerts={alerts} />
      </div>

      <PurchaseOrdersSummary
        orders={summaryOrders}
        onViewOrder={() => router.push("/storekeeper/purchase-orders")}
      />
    </div>
  );
}
