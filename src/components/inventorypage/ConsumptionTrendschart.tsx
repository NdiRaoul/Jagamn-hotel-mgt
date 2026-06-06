"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { consumptionTrendsData, consumptionSummary } from "./reportsdata";
import { TrendingDown } from "lucide-react";

export function ConsumptionTrendsChart() {
  return (
    <div className="mb-6 space-y-4">
      {/* Chart */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="font-bold text-gray-900 text-base">
              Consumption vs. Purchase Trend
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Monthly comparison over the last 5 months
            </p>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={260}>
          <BarChart
            data={consumptionTrendsData}
            margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 11, fill: "#9CA3AF" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#9CA3AF" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip
              formatter={(value, name) => [
                `$${Number(value).toLocaleString()}`,
                name === "purchased" ? "Purchased" : "Consumed",
              ]}
              contentStyle={{
                borderRadius: "8px",
                border: "1px solid #E5E7EB",
                fontSize: "12px",
              }}
            />
            <Legend
              formatter={(value: string) =>
                value === "purchased" ? "Purchased" : "Consumed"
              }
              wrapperStyle={{ fontSize: "11px", paddingTop: "12px" }}
            />
            <Bar dataKey="purchased" fill="#111827" radius={[4, 4, 0, 0]} />
            <Bar dataKey="consumed" fill="#F59E0B" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">
            Purchased This Month
          </p>
          <p className="text-2xl font-bold text-gray-900">
            {consumptionSummary.purchased}
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">
            Consumed This Month
          </p>
          <p className="text-2xl font-bold text-gray-900">
            {consumptionSummary.consumed}
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex items-center gap-3">
          <TrendingDown className="w-8 h-8 text-green-500 shrink-0" />
          <p className="text-xs text-gray-500 leading-relaxed">
            {consumptionSummary.note}
          </p>
        </div>
      </div>
    </div>
  );
}
