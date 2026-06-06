"use client";

/**
 * Reports Page — page.tsx
 * Path: app/(staff)/inventory/reports/page.tsx
 *
 * Components:
 *  - ReportsHeader              → 3 stat cards: Total Inventory Value, Turnover Rate, Lead Time
 *  - ReportsTabs                → 5 tab pills — content area swaps based on active tab
 *  - InventoryValuationChart    → bar chart + top performing categories dark card
 *  - StockMovementChart         → line chart inflow vs outflow
 *  - LowStockReportView         → full table of low stock items
 *  - POHistoryView              → table of all PO history
 *  - ConsumptionTrendsChart     → bar chart + 3 summary cards
 *  - CriticalLowStock           → bottom right panel, Generate Batch PO
 *  - ExportReportBar            → dark footer bar with export button
 *
 * Install required (if not already):
 *   npm install recharts
 *
 * To connect real data:
 *  - Replace mock imports with your API hooks / server fetches
 *  - Each TODO comment in child components marks the exact API call
 */

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
import { ReportTab } from "@/components/inventorypage/reportsdata";
import {
  mockTotalInventoryValue,
  mockInventoryChange,
  mockStockTurnoverRate,
  mockTurnoverNote,
  mockAvgLeadTime,
  mockLeadTimeAlert,
} from "@/components/inventorypage/reportsdata";

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<ReportTab>("Inventory Valuation");

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <ReportsHeader
        totalValue={mockTotalInventoryValue}
        valueChange={mockInventoryChange}
        turnoverRate={mockStockTurnoverRate}
        turnoverNote={mockTurnoverNote}
        avgLeadTime={mockAvgLeadTime}
        leadTimeAlert={mockLeadTimeAlert}
      />

      {/* Tabs */}
      <ReportsTabs activeTab={activeTab} onChange={setActiveTab} />

      {/* Tab content — swaps based on active tab */}
      {activeTab === "Inventory Valuation" && <InventoryValuationChart />}
      {activeTab === "Stock Movement" && <StockMovementChart />}
      {activeTab === "Low Stock Report" && <LowStockReportView />}
      {activeTab === "PO History" && <POHistoryView />}
      {activeTab === "Consumption Trends" && <ConsumptionTrendsChart />}

      {/* Bottom row — always visible regardless of tab */}
      {(activeTab === "Inventory Valuation" || activeTab === "Stock Movement") && (
        <div className="flex gap-4 mt-0 items-stretch">
          {/* Stock Inflow vs Outflow mini is already in StockMovement — 
              for Inventory Valuation tab show the inline chart instead */}
          {activeTab === "Inventory Valuation" && (
            <div className="flex-1">
              <StockMovementChart />
            </div>
          )}
          <CriticalLowStock />
        </div>
      )}

      {/* For other tabs just show Critical Low Stock */}
      {(activeTab === "Low Stock Report" || activeTab === "PO History" || activeTab === "Consumption Trends") && (
        <div className="mt-0">
          <CriticalLowStock />
        </div>
      )}

      {/* Export bar */}
      <ExportReportBar activeTab={activeTab} />
    </div>
  );
}