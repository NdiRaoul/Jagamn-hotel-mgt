"use client";

import { useState } from "react";
import { ReportsHeader } from "@/components/inventorypage/ReportsHeader";
import { ReportsTabs } from "@/components/inventorypage/ReportsTab";
import { InventoryValuationChart } from "@/components/inventorypage/InventoryValuationChart";
import { StockMovementChart } from "@/components/inventorypage/StockMovementChart";
import { LowStockReportView } from "@/components/inventorypage/LowStockReportView";
import { POHistoryView } from "@/components/inventorypage/POHistoryView";
import { ConsumptionTrendsChart } from "@/components/inventorypage/ConsumptionTrendschart";
import { CriticalLowStock } from "@/components/inventorypage/CriticalLowstock";
import { ExportReportBar } from "@/components/inventorypage/ExportReportBar";
import type { ReportTab } from "@/components/inventorypage/reportsdata";
import type {
  LowStockReportItem,
  POHistoryItem,
} from "@/components/inventorypage/reportsdata";
import { formatMoney } from "@/lib/currency";
import type { StoreReports } from "@/lib/data/storekeeper";

const PLACEHOLDER =
  "https://images.unsplash.com/photo-1584736286279-5d85e4a8c45c?w=60&h=60&fit=crop";

const PO_STATUS: Record<string, POHistoryItem["status"]> = {
  pending_approval: "SUBMITTED",
  approved: "APPROVED",
  ordered: "APPROVED",
  in_transit: "APPROVED",
  delivered: "RECEIVED",
  cancelled: "RECONCILED",
};

export default function ReportsClient({ reports }: { reports: StoreReports }) {
  const [activeTab, setActiveTab] = useState<ReportTab>("Inventory Valuation");

  const valuationData = reports.valuationByCategory.map((v) => ({
    category: v.category,
    value: v.value_xaf,
  }));
  const topCategories = reports.valuationByCategory.slice(0, 3).map((v) => ({
    name: v.category,
    sub: `${v.skus} SKU(s)`,
    turnover: formatMoney(v.value_xaf),
  }));

  const movementData = reports.stockMovement.map((m) => ({
    period: new Date(m.day).toLocaleDateString("en-US", { weekday: "short" }),
    inflow: m.inflow,
    outflow: m.outflow,
  }));

  const lowStockItems: LowStockReportItem[] = reports.lowStock.map((l) => ({
    id: l.id,
    name: l.name,
    image: l.image_url ?? PLACEHOLDER,
    lastTime: "",
    currentUnits: l.on_hand,
    minUnits: l.reorder_level,
    category: l.category ?? "Uncategorised",
    level: l.on_hand === 0 ? "CRITICAL" : "LOW",
  }));

  const poHistory: POHistoryItem[] = reports.poHistory.map((o) => ({
    id: o.id,
    poNumber: o.po_number,
    supplier: o.supplier_name ?? "—",
    items: o.item_count,
    value: formatMoney(o.total_xaf),
    status: PO_STATUS[o.status] ?? "SUBMITTED",
    date: new Date(o.created_at).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
  }));

  const consumptionData = reports.stockMovement.map((m) => ({
    month: new Date(m.day).toLocaleDateString("en-US", { weekday: "short" }),
    purchased: m.inflow,
    consumed: m.outflow,
  }));
  const totalIn = reports.stockMovement.reduce((s, m) => s + m.inflow, 0);
  const totalOut = reports.stockMovement.reduce((s, m) => s + m.outflow, 0);
  const consumptionSummary = {
    purchased: `${totalIn} deliveries`,
    consumed: `${totalOut} units issued`,
    note:
      totalOut > totalIn
        ? "Outflow outpacing deliveries — review reorder levels."
        : "Stock movement healthy over the last 7 days.",
  };

  return (
    <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
      <ReportsHeader
        totalValue={formatMoney(reports.totalValuationXaf)}
        valueChange={`${reports.valuationByCategory.length} categories`}
        turnoverRate={String(totalOut)}
        turnoverNote="Units issued (7d)"
        avgLeadTime={String(reports.poHistory.length)}
        leadTimeAlert={`${reports.lowStock.length} low-stock items`}
      />

      <ReportsTabs activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === "Inventory Valuation" && (
        <InventoryValuationChart data={valuationData} topCategories={topCategories} />
      )}
      {activeTab === "Stock Movement" && <StockMovementChart data={movementData} />}
      {activeTab === "Low Stock Report" && (
        <LowStockReportView items={lowStockItems} />
      )}
      {activeTab === "PO History" && <POHistoryView items={poHistory} />}
      {activeTab === "Consumption Trends" && (
        <ConsumptionTrendsChart data={consumptionData} summary={consumptionSummary} />
      )}

      {(activeTab === "Inventory Valuation" || activeTab === "Stock Movement") && (
        <div className="flex flex-col lg:flex-row gap-4 lg:items-stretch">
          {activeTab === "Inventory Valuation" && (
            <div className="flex-1">
              <StockMovementChart data={movementData} />
            </div>
          )}
          <CriticalLowStock items={lowStockItems} />
        </div>
      )}

      {(activeTab === "Low Stock Report" ||
        activeTab === "PO History" ||
        activeTab === "Consumption Trends") && (
        <div className="mt-0">
          <CriticalLowStock items={lowStockItems} />
        </div>
      )}

      <ExportReportBar activeTab={activeTab} reports={reports} />
    </div>
  );
}
