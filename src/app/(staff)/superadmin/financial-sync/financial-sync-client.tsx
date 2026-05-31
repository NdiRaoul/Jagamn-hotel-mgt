"use client";

import React from "react";
import {
  RefreshCcw,
  TrendingUp,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface PaymentTimelineEntry {
  payment_id: string;
  booking_ref: string;
  provider: string;
  amount_minor: number;
  currency: string;
  processor_ref: string | null;
  ledger_status: string;
  derived_status: string;
  guest_name: string | null;
  guest_email: string | null;
  room_slug: string | null;
  event_type: string;
  source: string | null;
  event_at: string;
}

interface RevenueMonthPoint {
  month: string;
  revenue_minor: number;
}

interface SyncStats {
  statusCounts: Record<string, number>;
  lastSync: string;
}

export default function FinancialSyncClient({
  timeline,
  revenueMonthly,
  syncStats,
}: {
  timeline: PaymentTimelineEntry[];
  revenueMonthly: RevenueMonthPoint[];
  syncStats: SyncStats;
}) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
      case "processor_succeeded":
        return (
          <Badge className="bg-green-100 text-green-700 text-[9px] font-bold">
            <CheckCircle className="w-3 h-3 mr-1" />
            {status}
          </Badge>
        );
      case "pending":
      case "authorization_pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-700 text-[9px] font-bold">
            <Clock className="w-3 h-3 mr-1" />
            {status}
          </Badge>
        );
      case "failed":
      case "processor_failed":
        return (
          <Badge className="bg-red-100 text-red-700 text-[9px] font-bold">
            <XCircle className="w-3 h-3 mr-1" />
            {status}
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-100 text-gray-700 text-[9px] font-bold">
            {status}
          </Badge>
        );
    }
  };

  const chartData = revenueMonthly.map((point) => ({
    month: new Date(point.month).toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    }),
    revenue: point.revenue_minor / 100,
  }));

  const timeSinceSync = () => {
    const now = new Date();
    const sync = new Date(syncStats.lastSync);
    const diffMs = now.getTime() - sync.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  return (
    <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="manrope-bold text-4xl text-jagamn-primary">
            Financial Sync
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Real-time payment processing and revenue reconciliation
          </p>
        </div>
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-sm font-bold text-green-700">
            Last sync: {timeSinceSync()}
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {Object.entries(syncStats.statusCounts).map(([status, count]) => (
          <div
            key={status}
            className="bg-white rounded-xl border border-gray-100 shadow-sm p-6"
          >
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
              {status}
            </p>
            <p className="manrope-bold text-4xl text-jagamn-primary">{count}</p>
          </div>
        ))}
      </div>

      {/* Revenue Chart */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8">
        <div className="flex items-center justify-between mb-8">
          <h3 className="manrope-bold text-xl text-jagamn-primary">
            Monthly Revenue Trend
          </h3>
          <TrendingUp className="w-5 h-5 text-green-500" />
        </div>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 11, fill: "#64748b" }}
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#64748b" }}
                axisLine={false}
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: "12px",
                  border: "none",
                  boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)",
                }}
                formatter={(value: number) => [
                  `$${value.toLocaleString()}`,
                  "Revenue",
                ]}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#00152A"
                strokeWidth={3}
                dot={{ fill: "#BA722E", r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Payment Timeline */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h3 className="manrope-bold text-xl text-jagamn-primary flex items-center gap-2">
            <RefreshCcw className="w-5 h-5" />
            Payment Timeline
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  Timestamp
                </th>
                <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  Booking
                </th>
                <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  Guest
                </th>
                <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  Provider
                </th>
                <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  Amount
                </th>
                <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  Event
                </th>
                <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {timeline.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center">
                    <RefreshCcw className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-500 font-medium">
                      No payment events yet
                    </p>
                  </td>
                </tr>
              ) : (
                timeline.map((entry, idx) => (
                  <tr
                    key={`${entry.payment_id}-${idx}`}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(entry.event_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-mono font-medium text-jagamn-primary">
                        {entry.booking_ref}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {entry.guest_name || "—"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {entry.guest_email}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge className="bg-gray-100 text-gray-700 text-[9px] font-bold uppercase">
                        {entry.provider}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-jagamn-primary">
                        {entry.currency}{" "}
                        {(entry.amount_minor / 100).toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs text-gray-600">
                        {entry.event_type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(entry.derived_status)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
