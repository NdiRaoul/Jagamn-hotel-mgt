"use client";

import Image from "next/image";
import { lowStockItems, LowStockReportItem } from "./reportsdata";

const levelStyles: Record<string, { badge: string; dot: string }> = {
  CRITICAL: { badge: "bg-red-50 text-red-600 border border-red-200", dot: "bg-red-500" },
  LOW: { badge: "bg-amber-50 text-amber-600 border border-amber-200", dot: "bg-amber-400" },
};

const categoryColors: Record<string, string> = {
  "Bar/Wine": "bg-purple-50 text-purple-700 border border-purple-200",
  Amenities: "bg-blue-50 text-blue-700 border border-blue-200",
  Housekeeping: "bg-gray-100 text-gray-600 border border-gray-200",
  Linens: "bg-indigo-50 text-indigo-700 border border-indigo-200",
  Kitchen: "bg-green-50 text-green-700 border border-green-200",
};

export function LowStockReportView() {
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden mb-6">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h2 className="font-bold text-gray-900 text-base">Low Stock Report</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Items at or below minimum threshold
          </p>
        </div>
        <span className="text-xs font-bold px-3 py-1 rounded-full bg-red-50 text-red-600 border border-red-200">
          {lowStockItems.length} Alerts
        </span>
      </div>

      <table className="w-full">
        <thead>
          <tr className="bg-gray-900 text-white text-xs uppercase tracking-widest">
            <th className="text-left px-5 py-3 font-semibold w-[35%]">Item</th>
            <th className="text-left px-4 py-3 font-semibold w-[15%]">Category</th>
            <th className="text-left px-4 py-3 font-semibold w-[20%]">Stock Level</th>
            <th className="text-left px-4 py-3 font-semibold w-[15%]">Status</th>
            <th className="text-left px-4 py-3 font-semibold w-[15%]">Last Restocked</th>
          </tr>
        </thead>
        <tbody>
          {lowStockItems.map((item: LowStockReportItem, idx: number) => {
            const pct = Math.min(100, Math.round((item.currentUnits / item.minUnits) * 100));
            const style = levelStyles[item.level];
            return (
              <tr
                key={item.id}
                className={`border-b border-gray-100 last:border-0 ${idx % 2 === 0 ? "bg-white" : "bg-gray-50/40"}`}
              >
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <Image src={item.image} alt={item.name} width={56} height={56} className="w-9 h-9 rounded-md object-cover bg-gray-100 shrink-0" />
                    <p className="text-sm font-semibold text-gray-900">{item.name}</p>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${categoryColors[item.category] ?? "bg-gray-100 text-gray-600"}`}>
                    {item.category}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full ${item.level === "CRITICAL" ? "bg-red-500" : "bg-amber-400"}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className={`text-xs font-bold whitespace-nowrap ${item.level === "CRITICAL" ? "text-red-500" : "text-amber-500"}`}>
                      {item.currentUnits} / {item.minUnits}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${style.badge}`}>
                    {item.level}
                  </span>
                </td>
                <td className="px-4 py-4 text-xs text-gray-400">{item.lastTime}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}