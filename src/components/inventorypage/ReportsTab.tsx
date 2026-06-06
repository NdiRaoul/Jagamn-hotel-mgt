"use client";

import { ReportTab } from "./reportsdata";

const TABS: ReportTab[] = [
  "Inventory Valuation",
  "Stock Movement",
  "Low Stock Report",
  "PO History",
  "Consumption Trends",
];

interface ReportsTabsProps {
  activeTab: ReportTab;
  onChange: (tab: ReportTab) => void;
}

export function ReportsTabs({ activeTab, onChange }: ReportsTabsProps) {
  return (
    <div className="flex gap-1 border-b border-gray-200 mb-6">
      {TABS.map((tab) => (
        <button
          key={tab}
          onClick={() => onChange(tab)}
          className={`px-4 py-2.5 text-sm font-semibold transition-colors relative whitespace-nowrap ${
            activeTab === tab
              ? "text-amber-600"
              : "text-gray-400 hover:text-gray-700"
          }`}
        >
          {tab}
          {activeTab === tab && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500 rounded-t-full" />
          )}
        </button>
      ))}
    </div>
  );
}