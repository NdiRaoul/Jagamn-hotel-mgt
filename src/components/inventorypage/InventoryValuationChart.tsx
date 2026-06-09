"use client";

import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Zap } from "lucide-react";
import { formatMoney } from "@/lib/currency";
import {
  inventoryValuationData,
  topCategories as mockTopCategories,
  predictiveInsight as mockInsight,
} from "./reportsdata";

const DATE_RANGES = ["Last 30 Days", "Last 90 Days", "This Year"];

interface ValuationDatum {
  category: string;
  value: number;
}
interface TopCategory {
  name: string;
  sub: string;
  turnover: string;
}

interface InventoryValuationChartProps {
  data?: ValuationDatum[];
  topCategories?: TopCategory[];
  insight?: string;
}

export function InventoryValuationChart({
  data = inventoryValuationData,
  topCategories = mockTopCategories,
  insight = mockInsight,
}: InventoryValuationChartProps = {}) {
  const [dateRange, setDateRange] = useState("Last 30 Days");

  return (
    <div className="flex gap-4 mb-6">
      {/* Left: Bar chart */}
      <div className="flex-1 bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="font-bold text-gray-900 text-base">
              Asset Value Distribution
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Breakdown of inventory investment by category
            </p>
          </div>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="text-xs font-semibold text-gray-600 border border-gray-200 rounded-md px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-gray-800 bg-white"
          >
            {DATE_RANGES.map((r) => (
              <option key={r}>{r}</option>
            ))}
          </select>
        </div>

        <ResponsiveContainer width="100%" height={220}>
          <BarChart
            data={data}
            margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
            <XAxis
              dataKey="category"
              tick={{ fontSize: 11, fill: "#9CA3AF" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#9CA3AF" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip
              formatter={(value) => [formatMoney(Number(value)), "Value"]}
              contentStyle={{
                borderRadius: "8px",
                border: "1px solid #E5E7EB",
                fontSize: "12px",
              }}
            />
            <Bar dataKey="value" fill="#111827" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Right: Top performing categories dark card */}
      <div className="w-64 shrink-0 bg-gray-900 rounded-xl p-5 flex flex-col">
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">
          Top Performing
        </p>
        <h3 className="font-bold text-white text-base mb-0.5">Categories</h3>
        <p className="text-[10px] text-gray-500 mb-4">
          Sorted by stock velocity and ROI
        </p>

        <div className="space-y-4 flex-1">
          {topCategories.map((cat, idx) => (
            <div key={idx} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-white leading-tight">
                    {cat.name}
                  </p>
                  <p className="text-[10px] text-gray-500">{cat.sub}</p>
                </div>
              </div>
              <span className="text-xs font-bold text-jagamn-tertiary whitespace-nowrap">
                {cat.turnover} Turnover
              </span>
            </div>
          ))}
        </div>

        {/* Predictive insight */}
        <div className="mt-4 pt-4 border-t border-gray-700">
          <div className="flex items-center gap-1.5 mb-2">
            <Zap className="w-3 h-3 text-jagamn-tertiary" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-jagamn-tertiary">
              Predictive Insight
            </span>
          </div>
          <p className="text-[11px] text-gray-400 leading-relaxed">
            {insight}
          </p>
        </div>
      </div>
    </div>
  );
}
