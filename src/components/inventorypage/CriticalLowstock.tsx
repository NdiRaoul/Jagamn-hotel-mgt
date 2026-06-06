"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { lowStockItems as mockLowStockItems, LowStockReportItem } from "./reportsdata";
import Image from "next/image";

export function CriticalLowStock({
  items: lowStockItems = mockLowStockItems,
}: { items?: LowStockReportItem[] } = {}) {
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);

  const displayItems = lowStockItems.slice(0, 3);

  function handleGenerateBatchPO() {
    setGenerating(true);
    // TODO: POST /purchase-orders/batch-generate { itemIds: criticalItems.map(i => i.id) }
    setTimeout(() => {
      setGenerating(false);
      setGenerated(true);
      setTimeout(() => setGenerated(false), 3000);
    }, 1200);
  }

  return (
    <div className="flex-1 bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-gray-900 text-base">Critical Low Stock</h2>
        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-red-50 text-red-600 border border-red-200">
          {lowStockItems.length} Alerts
        </span>
      </div>

      <div className="space-y-3 mb-4">
        {displayItems.map((item) => (
          <div key={item.id} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
            <Image
              src={item.image}
              alt={item.name}
              width={56}
              height={56}
              className="w-9 h-9 rounded-md object-cover bg-gray-100 shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{item.name}</p>
              <p className="text-[10px] text-gray-400">{item.lastTime}</p>
            </div>
            <div className="text-right shrink-0">
              <p className={`text-sm font-bold ${item.level === "CRITICAL" ? "text-red-500" : "text-amber-500"}`}>
                {item.currentUnits} Units
              </p>
              <p className="text-[10px] text-gray-400">Min: {item.minUnits}</p>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={handleGenerateBatchPO}
        disabled={generating || generated}
        className={`w-full py-2.5 rounded-md text-sm font-bold transition-all flex items-center justify-center gap-2 ${
          generated
            ? "bg-green-600 text-white"
            : generating
            ? "bg-gray-400 text-white cursor-default"
            : "border border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white active:scale-95"
        }`}
      >
        {generated ? (
          <><CheckCircle2 className="w-4 h-4" /> Batch PO Created!</>
        ) : generating ? (
          "Generating…"
        ) : (
          "Generate Batch PO"
        )}
      </button>
    </div>
  );
}