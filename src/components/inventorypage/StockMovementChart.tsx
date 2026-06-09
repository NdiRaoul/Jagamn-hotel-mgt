"use client";

import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { stockMovementData } from "./reportsdata";

const DATE_RANGES = ["Last 7 Days", "Last 30 Days", "Last 90 Days"];

interface MovementDatum {
  period: string;
  inflow: number;
  outflow: number;
}

export function StockMovementChart({
  data = stockMovementData,
}: { data?: MovementDatum[] } = {}) {
  const [dateRange, setDateRange] = useState("Last 7 Days");

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm mb-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="font-bold text-gray-900 text-base">
            Stock Inflow vs. Outflow
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Movement of stock in and out of the store over time
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

      <ResponsiveContainer width="100%" height={280}>
        <LineChart
          data={data}
          margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
          <XAxis
            dataKey="period"
            tick={{ fontSize: 11, fill: "#9CA3AF" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "#9CA3AF" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v: number) => `${v}`}
          />
          <Tooltip
            formatter={(value, name) => [
              `${Number(value).toLocaleString()}`,
              name === "inflow" ? "Stock Inflow" : "Stock Outflow",
            ]}
            contentStyle={{
              borderRadius: "8px",
              border: "1px solid #E5E7EB",
              fontSize: "12px",
            }}
          />
          <Legend
            formatter={(value: string) =>
              value === "inflow" ? "Stock Inflow" : "Stock Outflow"
            }
            wrapperStyle={{ fontSize: "11px", paddingTop: "12px" }}
          />
          <Line
            type="monotone"
            dataKey="inflow"
            stroke="#111827"
            strokeWidth={2.5}
            dot={{ fill: "#111827", r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="outflow"
            stroke="#d9822b"
            strokeWidth={2.5}
            dot={{ fill: "#d9822b", r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
