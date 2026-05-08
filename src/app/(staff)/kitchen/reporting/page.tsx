"use client";

import React from "react";
import {
  Calendar,
  Download,
  TrendingUp,
  TrendingDown,
  MoreHorizontal,
  ChevronDown,
  Database,
  Utensils,
  Wine,
  Plus,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  UNAVAILABILITY_LOG,
  HOURLY_VOLUME,
  KITCHEN_HARDWARE,
} from "@/lib/reporting-mock-data";

// ── Stat Card Component ──────────────────────────────────────────────────────
function StatCard({
  title,
  value,
  trend,
  trendType,
  subtitle,
  progress,
  segments,
}: {
  title: string;
  value: string;
  trend?: string;
  trendType?: "up" | "down" | "stable";
  subtitle: string;
  progress?: number;
  segments?: boolean;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 space-y-6 relative overflow-hidden group">
      <div className="space-y-1">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
          {title}
        </p>
        <div className="flex items-end gap-3">
          <h2 className="manrope-bold text-6xl text-jagamn-primary">{value}</h2>
          {trend && (
            <div
              className={cn(
                "flex items-center gap-1 text-xs font-bold mb-2",
                trendType === "up"
                  ? "text-green-500"
                  : trendType === "down"
                    ? "text-orange-500"
                    : "text-blue-500",
              )}
            >
              {trendType === "up" ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              {trend}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {segments ? (
          <div className="flex gap-1.5 h-2">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={cn(
                  "flex-1 rounded-full transition-colors",
                  i <= 3 ? "bg-jagamn-tertiary/40" : "bg-jagamn-tertiary",
                )}
              />
            ))}
          </div>
        ) : progress ? (
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-jagamn-primary rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
        ) : (
          <div className="flex gap-2">
            {["WF", "BS", "TR"].map((tag) => (
              <span
                key={tag}
                className="bg-gray-100 text-gray-400 text-[9px] font-bold px-2 py-1 rounded"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
        <p className="text-xs text-gray-400 font-medium">{subtitle}</p>
      </div>

      {/* Decorative Icon */}
      <Database className="absolute -bottom-4 -right-4 w-24 h-24 text-gray-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function ReportingPage() {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8 pb-12">
      {/* ── Page Header ─────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="manrope-bold text-4xl text-jagamn-primary">
            Performance Insights
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Daily operational summary for Regency Suite Kitchen.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="h-11 rounded-xl bg-white border-gray-100 shadow-sm gap-2 text-jagamn-primary font-bold"
          >
            <Calendar className="w-4 h-4" />
            June 14, 2024
          </Button>
          <Button className="h-11 rounded-xl bg-jagamn-primary hover:bg-[#0A2038] text-white shadow-sm gap-2 font-bold px-6">
            <Download className="w-4 h-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* ── Top Insights Row ────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Today's Orders"
          value="42"
          trend="12%"
          trendType="up"
          subtitle="65% of daily capacity reached"
          progress={65}
        />
        <StatCard
          title="Avg. Prep Time"
          value="18m"
          trend="4m"
          trendType="down"
          subtitle="Efficiency optimized since last week"
          segments
        />
        <StatCard
          title="Unavailability Freq."
          value="Low"
          trend="STABLE"
          trendType="stable"
          subtitle="3 incidents today"
        />
      </div>

      {/* ── Charts & Status Row ──────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="xl:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          <div className="flex items-center justify-between mb-10">
            <h3 className="manrope-bold text-xl text-jagamn-primary">
              Order Volume by Time of Day
            </h3>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                <div className="w-2.5 h-2.5 rounded-full bg-jagamn-primary" />{" "}
                Dine-in
              </div>
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                <div className="w-2.5 h-2.5 rounded-full bg-[#FFB77A]" /> Room
                Service
              </div>
            </div>
          </div>

          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={HOURLY_VOLUME} barGap={8}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#F1F5F9"
                />
                <XAxis
                  dataKey="time"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fontWeight: 700, fill: "#94A3B8" }}
                  dy={10}
                />
                <YAxis hide />
                <Tooltip
                  cursor={{ fill: "#F8FAFC" }}
                  contentStyle={{
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)",
                  }}
                />
                <Bar
                  dataKey="dineIn"
                  fill="#00152A"
                  radius={[4, 4, 0, 0]}
                  barSize={40}
                />
                <Bar
                  dataKey="roomService"
                  fill="#EA580C"
                  radius={[4, 4, 0, 0]}
                  barSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Live Hardware Status */}
        <div className="bg-[#00152A] rounded-2xl p-8 flex flex-col shadow-xl">
          <h3 className="manrope-bold text-xl text-white mb-8">
            Live Kitchen Status
          </h3>
          <div className="space-y-8 flex-1">
            {KITCHEN_HARDWARE.map((hw) => (
              <div key={hw.id} className="flex gap-4">
                <div
                  className={cn(
                    "w-3 h-3 rounded-full mt-1.5 shrink-0",
                    hw.color,
                  )}
                />
                <div>
                  <h4 className="manrope-bold text-sm text-white">{hw.name}</h4>
                  <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">
                    {hw.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <Button className="w-full mt-8 bg-white/5 hover:bg-white/10 text-gray-400 border border-white/10 rounded-xl h-12 text-xs font-bold uppercase tracking-widest">
            View Hardware Logs
          </Button>
        </div>
      </div>

      {/* ── Unavailability Log Table ────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-gray-50 flex items-center justify-between">
          <h3 className="manrope-bold text-xl text-jagamn-primary">
            Unavailability Log
          </h3>
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              Filter by:
            </span>
            <Button
              variant="outline"
              className="h-9 rounded-lg text-xs font-bold border-gray-100 gap-2"
            >
              All Items
              <ChevronDown className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>

        <table className="w-full">
          <thead className="bg-gray-50/50">
            <tr>
              <th className="px-8 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Item / Ingredient
              </th>
              <th className="px-8 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Timestamp
              </th>
              <th className="px-8 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Reason
              </th>
              <th className="px-8 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Duration
              </th>
              <th className="px-8 py-4 text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {UNAVAILABILITY_LOG.map((row) => (
              <tr
                key={row.id}
                className="group hover:bg-gray-50/50 transition-colors"
              >
                <td className="px-8 py-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 group-hover:bg-white transition-colors">
                      {row.type === "food" ? (
                        <Utensils className="w-4 h-4" />
                      ) : (
                        <Wine className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <p className="manrope-bold text-sm text-jagamn-primary">
                        {row.item}
                      </p>
                      <p className="text-[10px] text-gray-400 font-bold tracking-widest">
                        {row.sku}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6 text-sm font-medium text-gray-500">
                  {row.timestamp}
                </td>
                <td className="px-8 py-6">
                  <span
                    className={cn(
                      "text-[9px] font-bold px-2.5 py-1 rounded-sm uppercase tracking-wider",
                      row.reason === "STOCK OUT"
                        ? "bg-red-50 text-red-600"
                        : row.reason === "PROCUREMENT DELAY"
                          ? "bg-orange-50 text-orange-600"
                          : "bg-gray-100 text-gray-600",
                    )}
                  >
                    {row.reason}
                  </span>
                </td>
                <td className="px-8 py-6 text-sm font-medium text-gray-500">
                  {row.duration}
                </td>
                <td className="px-8 py-6 text-right">
                  <button className="p-2 hover:bg-white rounded-lg transition-colors text-gray-300 hover:text-gray-600">
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Floating Action Button (Matches Design) */}
        <button className="fixed bottom-10 right-10 w-16 h-16 bg-[#EA580C] hover:bg-[#C17228] text-white rounded-2xl shadow-2xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 z-50">
          <Plus className="w-8 h-8" />
        </button>
      </div>
    </div>
  );
}
