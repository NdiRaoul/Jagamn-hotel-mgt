"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PurchaseOrdersHeader } from "@/components/inventorypage/PurchaseOrdersHeader";
import { PurchaseOrdersTable } from "@/components/inventorypage/PurchaseOrdersTable";
import { NewPurchaseOrderDrawer } from "@/components/inventorypage/NewPurchaseOrderDrawer";
import { ReceiveGoodsDrawer } from "@/components/inventorypage/ReceiveGoodsDrawer";
import { RecentActivity } from "@/components/inventorypage/RecentActivity";
import { QuickActionsCard } from "@/components/inventorypage/QuickActionsCard";
import type { PurchaseOrder, POStatus, ActivityItem } from "@/components/inventorypage/purchaseData";
import { formatMoney } from "@/lib/currency";
import type { StorePurchaseOrder, StoreKpis } from "@/lib/data/storekeeper";

interface SupplierOpt {
  id: string;
  name: string;
}

const STATUS_MAP: Record<string, POStatus> = {
  pending_approval: "SUBMITTED",
  approved: "SUBMITTED",
  ordered: "SUBMITTED",
  in_transit: "APPROVED", // receivable
  delivered: "RECEIVED",
  cancelled: "RECONCILED",
};

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function toPO(o: StorePurchaseOrder): PurchaseOrder {
  return {
    id: o.id,
    poNumber: o.po_number,
    supplier: o.supplier_name ?? "—",
    items: o.item_count,
    totalValue: formatMoney(o.total_xaf),
    totalValueRaw: o.total_xaf,
    status: STATUS_MAP[o.status] ?? "SUBMITTED",
    date: fmtDate(o.created_at),
  };
}

export default function PurchaseOrdersClient({
  orders,
  kpis,
  suppliers,
}: {
  orders: StorePurchaseOrder[];
  kpis: StoreKpis;
  suppliers: SupplierOpt[];
}) {
  const router = useRouter();
  const poList = orders.map(toPO);

  const [showNewPO, setShowNewPO] = useState(false);
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);
  const [drawerMode, setDrawerMode] = useState<"receive" | "edit" | null>(null);

  const activity: ActivityItem[] = orders.slice(0, 4).map((o, i) => ({
    id: o.id,
    color: (["amber", "dark", "gray", "green"] as const)[i % 4],
    description: `PO ${o.po_number} — ${o.status.replace(/_/g, " ")}`,
    sub: `${o.supplier_name ?? "Supplier"} · ${formatMoney(o.total_xaf)}`,
    time: fmtDate(o.created_at),
  }));

  function handleReceiveGoods(po: PurchaseOrder) {
    setSelectedPO(po);
    setDrawerMode("receive");
  }

  function handleEdit(po: PurchaseOrder) {
    setSelectedPO(po);
    setDrawerMode("edit");
  }

  function closeDrawer() {
    setSelectedPO(null);
    setDrawerMode(null);
  }

  async function createOrder(
    data: { supplier: string; lineItems: { name: string; qty: number; estUnitPrice: number }[] },
    status: "draft" | "submit",
  ) {
    const match = suppliers.find((s) => s.name === data.supplier);
    const total_minor = data.lineItems.reduce(
      (s, li) => s + Math.round(li.qty * li.estUnitPrice * 100),
      0,
    );
    await fetch("/api/admin/procurement/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        description: `${data.supplier} — ${data.lineItems.length} item(s)`,
        supplier_id: match?.id ?? null,
        total_minor,
        notes: status === "draft" ? "Saved as draft" : null,
        items: data.lineItems.map((li) => ({
          description: li.name,
          quantity: li.qty,
          unit_price_minor: Math.round(li.estUnitPrice * 100),
        })),
      }),
    });
    router.refresh();
  }

  async function handleConfirmReceipt(poId: string) {
    await fetch(`/api/admin/procurement/orders/${poId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "delivered" }),
    });
    router.refresh();
  }

  return (
    <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
      <PurchaseOrdersHeader
        openOrders={kpis.openOrders}
        pendingReceipt={kpis.pendingReceipt}
      />

      <div className="overflow-x-auto">
        <PurchaseOrdersTable
          orders={poList}
          onReceiveGoods={handleReceiveGoods}
          onEdit={handleEdit}
        />
      </div>

      <div className="flex flex-col lg:flex-row gap-4 mt-6 lg:items-stretch">
        <RecentActivity items={activity} onViewAll={() => router.refresh()} />
        <QuickActionsCard
          onNewPO={() => setShowNewPO(true)}
          onImportTemplate={() => setShowNewPO(true)}
        />
      </div>

      {showNewPO && (
        <NewPurchaseOrderDrawer
          onClose={() => setShowNewPO(false)}
          onSaveDraft={(d) => createOrder(d, "draft")}
          onSubmit={(d) => createOrder(d, "submit")}
        />
      )}

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
