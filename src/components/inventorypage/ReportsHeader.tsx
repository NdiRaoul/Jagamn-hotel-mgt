"use client";

import { TrendingUp, RefreshCw, AlertTriangle } from "lucide-react";

interface ReportsHeaderProps {
  totalValue: string;
  valueChange: string;
  turnoverRate: string;
  turnoverNote: string;
  avgLeadTime: string;
  leadTimeAlert: string;
}

export function ReportsHeader({
  totalValue,
  valueChange,
  turnoverRate,
  turnoverNote,
  avgLeadTime,
  leadTimeAlert,
}: ReportsHeaderProps) {
  return (
    <div className="flex items-end justify-between mb-6">
      <div>
        <p className="text-xs font-semibold tracking-widest text-gray-400 uppercase mb-1">
          Analytics
        </p>
        <h1 className="text-3xl font-bold text-gray-900">Reports & Insights</h1>
      </div>

      <div className="flex gap-3">
        {/* Total Inventory Value */}
        <div className="bg-white border border-gray-200 rounded-lg px-5 py-3 shadow-sm min-w-45">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">
            Total Inventory Value
          </p>
          <p className="text-xl font-bold text-gray-900">{totalValue}</p>
          <p className="text-[10px] text-green-600 font-semibold mt-0.5 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> {valueChange}
          </p>
        </div>

        {/* Stock Turnover Rate */}
        <div className="bg-white border border-gray-200 rounded-lg px-5 py-3 shadow-sm min-w-37.5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">
            Stock Turnover Rate
          </p>
          <p className="text-xl font-bold text-gray-900">
            {turnoverRate} <span className="text-sm font-normal text-gray-400">/ Year</span>
          </p>
          <p className="text-[10px] text-green-600 font-semibold mt-0.5 flex items-center gap-1">
            <RefreshCw className="w-3 h-3" /> {turnoverNote}
          </p>
        </div>

        {/* Average Lead Time */}
        <div className="bg-white border border-gray-200 rounded-lg px-5 py-3 shadow-sm min-w-37.5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">
            Average Lead Time
          </p>
          <p className="text-xl font-bold text-gray-900">
            {avgLeadTime} <span className="text-sm font-normal text-gray-400">Days</span>
          </p>
          <p className="text-[10px] text-amber-600 font-semibold mt-0.5 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" /> {leadTimeAlert}
          </p>
        </div>
      </div>
    </div>
  );
}