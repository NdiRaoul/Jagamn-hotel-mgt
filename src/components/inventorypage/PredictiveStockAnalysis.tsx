"use client";

import { TrendingUp } from "lucide-react";
import { PredictiveItem } from "./inventorydata";

const statusStyles: Record<string, { pill: string; label: string }> = {
  "HIGH RISK OF DEPLETION": {
    pill: "bg-amber-100 text-amber-700 border border-amber-300",
    label: "HIGH RISK OF DEPLETION",
  },
  STABLE: {
    pill: "bg-blue-50 text-blue-600 border border-blue-200",
    label: "STABLE",
  },
  MONITOR: {
    pill: "bg-gray-100 text-gray-600 border border-gray-200",
    label: "MONITOR",
  },
};

interface PredictiveStockAnalysisProps {
  items: PredictiveItem[];
  occupancyPct: number;
}

export function PredictiveStockAnalysis({ items, occupancyPct }: PredictiveStockAnalysisProps) {
  return (
    <div className="flex-1 bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <div className="flex items-start justify-between mb-1">
        <div>
          <h2 className="font-bold text-gray-900 text-base">Predictive Stock Analysis</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Based on next week&apos;s occupancy ({occupancyPct}%)
          </p>
        </div>
        <TrendingUp className="w-5 h-5 text-amber-500 shrink-0" />
      </div>

      <div className="mt-5 flex flex-col gap-3">
        {items.map((item) => {
          const style = statusStyles[item.status];
          return (
            <div
              key={item.id}
              className="flex items-center justify-between py-2.5 border-b border-gray-100 last:border-0"
            >
              <span className="text-sm font-medium text-gray-700">{item.name}</span>
              <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wide ${style.pill}`}>
                {style.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}