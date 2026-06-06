"use client";

import { AlertTriangle, LayoutList } from "lucide-react";

interface InventoryPageHeaderProps {
  criticalAlerts: number;
  activeSKUs: number;
}

export function InventoryPageHeader({ criticalAlerts, activeSKUs }: InventoryPageHeaderProps) {
  return (
    <div className="flex items-end justify-between mb-6">
      {/* Left */}
      <div>
        <p className="text-xs font-semibold tracking-widest text-gray-400 uppercase mb-1">
          Inventory Repository
        </p>
        <h1 className="text-3xl font-bold text-gray-900">Current Holdings</h1>
      </div>

      {/* Right: stat cards */}
      <div className="flex gap-3">
        {/* Critical Alerts */}
        <div className="flex items-center gap-3 border border-amber-300 bg-amber-50 rounded-lg px-5 py-3">
          <div className="w-8 h-8 rounded-md bg-amber-400 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-amber-600">
              Critical Alerts
            </p>
            <p className="text-xl font-bold text-gray-900">
              {criticalAlerts} Items
            </p>
          </div>
        </div>

        {/* Active SKUs */}
        <div className="flex items-center gap-3 border border-gray-200 bg-white rounded-lg px-5 py-3">
          <div className="w-8 h-8 rounded-md bg-gray-800 flex items-center justify-center shrink-0">
            <LayoutList className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
              Active SKU&apos;s
            </p>
            <p className="text-xl font-bold text-gray-900">
              {activeSKUs.toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}