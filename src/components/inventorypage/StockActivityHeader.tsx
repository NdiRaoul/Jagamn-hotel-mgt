"use client";

import { ArrowDown, ArrowUp } from "lucide-react";

interface StockActivityHeaderProps {
  stockIn: number;
  stockOut: number;
  stockInChange: string;
  stockOutNote: string;
}

export function StockActivityHeader({
  stockIn,
  stockOut,
  stockInChange,
  stockOutNote,
}: StockActivityHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-8">
      <div>
        <p className="text-xs font-semibold tracking-widest text-amber-600 uppercase mb-1">
          Morning Briefing
        </p>
        <h1 className="text-3xl font-bold text-gray-900">
          Today&apos;s Stock Activity
        </h1>
      </div>

      <div className="flex gap-4">
        <div className="bg-white border border-gray-200 rounded-lg px-6 py-4 min-w-32.5 shadow-sm">
          <div className="flex items-center gap-1 text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
            <ArrowDown className="w-3 h-3 text-gray-700" />
            Stock-In
          </div>
          <p className="text-4xl font-bold text-gray-900 leading-none">{stockIn}</p>
          <p className="text-xs text-gray-400 mt-1">{stockInChange}</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg px-6 py-4 min-w-32.5 shadow-sm">
          <div className="flex items-center gap-1 text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
            <ArrowUp className="w-3 h-3 text-jagamn-tertiary" />
            Stock-Out
          </div>
          <p className="text-4xl font-bold text-gray-900 leading-none">{stockOut}</p>
          <p className="text-xs text-gray-400 mt-1">{stockOutNote}</p>
        </div>
      </div>
    </div>
  );
}