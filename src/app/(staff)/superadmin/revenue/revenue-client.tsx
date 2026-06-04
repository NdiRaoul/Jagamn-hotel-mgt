"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  TrendingUp,
  TrendingDown,
  Banknote,
  Users,
  Building,
  ArrowRight,
  Download,
  Calendar,
  Filter,
  MoreHorizontal,
  ChevronRight,
  CreditCard,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Search,
  X,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface RevenueClientProps {
  revenue: any;
  transactions: any[];
  revenueDaily: any[];
  revenueByRoomType: any[];
}

export default function RevenueClient({
  revenue,
  transactions,
  revenueDaily,
  revenueByRoomType,
}: RevenueClientProps) {
  const [timeframe, setTimeframe] = useState("weekly");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState<{ from: string; to: string }>({
    from: "",
    to: "",
  });

  // Global Search Integration
  useEffect(() => {
    const handleGlobalSearch = (e: any) => {
      setSearchQuery(e.detail || "");
    };
    window.addEventListener("jagamn-global-search", handleGlobalSearch);
    return () =>
      window.removeEventListener("jagamn-global-search", handleGlobalSearch);
  }, []);

  const handleExport = () => {
    const headers = ["ID", "Guest", "Method", "Amount", "Status", "Date"];
    const rows = filteredTransactions.map((tx: any) => [
      tx.id || "",
      tx.guest_name || "",
      tx.payment_method || "",
      tx.amount?.toString() || "0",
      tx.status || "",
      tx.created_at || "",
    ]);
    const csvContent = [
      headers.join(","),
      ...rows.map((r) => r.join(",")),
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `Revenue_Report_${new Date().toLocaleDateString()}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter transactions based on search, status, and date
  const filteredTransactions = transactions.filter((tx: any) => {
    // Search All Relevant Columns
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      (tx.guest_name && tx.guest_name.toLowerCase().includes(q)) ||
      (tx.id && tx.id.toLowerCase().includes(q)) ||
      (tx.payment_method && tx.payment_method.toLowerCase().includes(q)) ||
      (tx.status && tx.status.toLowerCase().includes(q)) ||
      (tx.amount && tx.amount.toString().includes(q));

    // Status Filter
    const matchesStatus = statusFilter === "all" || tx.status === statusFilter;

    // Date Filter
    const txDate = tx.created_at ? new Date(tx.created_at).getTime() : 0;
    const from = dateFilter.from
      ? new Date(dateFilter.from).getTime()
      : -Infinity;
    const to = dateFilter.to ? new Date(dateFilter.to).getTime() : Infinity;
    const matchesDate = txDate >= from && (dateFilter.to ? txDate <= to : true);

    return matchesSearch && matchesStatus && matchesDate;
  });

  // Prepare department revenue data from revenueByRoomType
  const colors = ["#334155", "#E8924A", "#1D61FF", "#64748B", "#10B981"];
  const departmentRevenue = (revenueByRoomType || []).map(
    (item: any, idx: number) => ({
      name: item.room_type || "Unknown",
      value: item.revenue || 0,
      color: colors[idx % colors.length],
    }),
  );

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-20 animate-in fade-in duration-700">
      <div className=" mx-auto pt-8 md:pt-12 space-y-10 md:space-y-12 px-4 md:px-0">
        {/* ── Page Header ────────────────────────────── */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div className="space-y-2 text-center lg:text-left">
            <p className="text-[10px] font-black text-[#0D2137]/40 uppercase tracking-[0.4em]">
              Financial Intelligence
            </p>
            <h1 className="manrope-bold text-3xl md:text-5xl text-[#0D2137] tracking-tight">
              Revenue Command Center
            </h1>
            <p className="text-slate-400 font-medium max-w-2xl text-sm md:text-base">
              Comprehensive fiscal analysis and performance metrics across all
              Palace departments.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="flex bg-white p-1 rounded-xl border border-gray-100 shadow-sm">
              {["weekly", "monthly", "yearly"].map((t) => (
                <button
                  key={t}
                  onClick={() => setTimeframe(t)}
                  className={cn(
                    "px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                    timeframe === t
                      ? "bg-[#0D2137] text-white shadow-lg"
                      : "text-gray-400 hover:text-[#0D2137]",
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
            <Button
              onClick={handleExport}
              variant="outline"
              className="h-12 px-6 rounded-xl border-gray-100 bg-white text-[#0D2137] manrope-bold text-xs flex items-center gap-2 shadow-sm transition-all hover:scale-105 active:scale-95"
            >
              <Download className="w-4 h-4" /> Export Report
            </Button>
          </div>
        </div>

        {/* ── KPI Grid ──────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          <KPICard
            label="Total Revenue"
            value={`$${revenue?.total_revenue ? (revenue.total_revenue / 1000).toFixed(1) : "0"}k`}
            change={
              revenue?.growth_rate
                ? `${revenue.growth_rate > 0 ? "+" : ""}${revenue.growth_rate.toFixed(1)}%`
                : "N/A"
            }
            isPositive={revenue?.growth_rate ? revenue.growth_rate > 0 : true}
            icon={<Banknote className="w-5 h-5" />}
          />
          <KPICard
            label="Avg. Daily Rate (ADR)"
            value={`$${revenue?.adr ? revenue.adr.toFixed(2) : "0.00"}`}
            change="+3.2%"
            isPositive={true}
            icon={<Building className="w-5 h-5" />}
          />
          <KPICard
            label="RevPAR"
            value={`$${revenue?.revpar ? revenue.revpar.toFixed(2) : "0.00"}`}
            change="-1.8%"
            isPositive={false}
            icon={<Target className="w-5 h-5" />}
          />
          <KPICard
            label="Avg. Occupancy"
            value={`${revenue?.occupancy_rate ? revenue.occupancy_rate.toFixed(1) : "0"}%`}
            change="+5.4%"
            isPositive={true}
            icon={<Users className="w-5 h-5" />}
          />
        </div>

        {/* ── Charts Section ─────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8 bg-white p-6 md:p-10 rounded-3xl border border-gray-100 shadow-sm space-y-8">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="manrope-bold text-xl text-[#0D2137]">
                  Revenue Inflow Trend
                </h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Global Inflow Performance
                </p>
              </div>
            </div>
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueDaily || []}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0D2137" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#0D2137" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#F1F5F9"
                  />
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#94A3B8", fontSize: 10, fontWeight: 700 }}
                    dy={10}
                    tickFormatter={(val) => {
                      const d = new Date(val);
                      return d.toLocaleDateString("en-US", {
                        weekday: "short",
                      });
                    }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#94A3B8", fontSize: 10, fontWeight: 700 }}
                    tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "16px",
                      border: "none",
                      boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#0D2137"
                    strokeWidth={4}
                    fillOpacity={1}
                    fill="url(#colorRev)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="lg:col-span-4 bg-[#0D2137] p-6 md:p-10 rounded-3xl text-white shadow-2xl space-y-10 relative overflow-hidden flex flex-col">
            <h3 className="manrope-bold text-xl relative z-10">
              Departmental Split
            </h3>
            <div className="h-[250px] w-full relative z-10">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={departmentRevenue}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {departmentRevenue.map((entry: any, index: number) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                        strokeWidth={0}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-4 relative z-10">
              {departmentRevenue.map((dept: any, i: number) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: dept.color }}
                    />
                    <span className="text-xs font-bold text-white/60">
                      {dept.name}
                    </span>
                  </div>
                  <span className="manrope-bold text-xs">
                    ${(dept.value / 1000).toFixed(0)}k
                  </span>
                </div>
              ))}
            </div>
            <div className="absolute bottom-[-10%] right-[-10%] w-64 h-64 bg-white/5 rounded-full blur-3xl" />
          </div>
        </div>

        {/* ── Transaction Intelligence ────────────────── */}
        <div className="space-y-8">
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 px-2">
            <div className="space-y-1">
              <h3 className="manrope-bold text-2xl text-[#0D2137]">
                Transaction Intelligence
              </h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Unified Ledger Access
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4 w-full xl:w-auto justify-start xl:justify-end">
              {/* Multi-parameter Status Filter */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-12 w-full sm:w-[180px] bg-white border-gray-100 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>

              {/* Enhanced Date Filter */}
              <div className="flex items-center gap-2 bg-white border border-gray-100 rounded-xl p-1 px-3 shadow-sm h-12 w-full sm:w-auto">
                <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
                <input
                  type="date"
                  value={dateFilter.from}
                  onChange={(e) =>
                    setDateFilter({ ...dateFilter, from: e.target.value })
                  }
                  className="bg-transparent text-[10px] font-bold text-[#0D2137] outline-none w-[110px]"
                />
                <ArrowRight className="w-3 h-3 text-gray-300 shrink-0" />
                <input
                  type="date"
                  value={dateFilter.to}
                  onChange={(e) =>
                    setDateFilter({ ...dateFilter, to: e.target.value })
                  }
                  className="bg-transparent text-[10px] font-bold text-[#0D2137] outline-none w-[110px]"
                />
                {(dateFilter.from || dateFilter.to) && (
                  <button
                    onClick={() => setDateFilter({ from: "", to: "" })}
                    className="shrink-0"
                  >
                    <X className="w-3 h-3 text-gray-300 hover:text-red-500" />
                  </button>
                )}
              </div>

              {/* Local Search Input */}
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search ledger..."
                  className="h-12 bg-white border-gray-100 rounded-xl pl-12 text-[10px] font-black uppercase tracking-widest shadow-sm"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full md:min-w-[900px]">
                <thead className="bg-[#F8FAFC]">
                  <tr>
                    <th className="px-10 py-6 text-left text-[10px] font-black text-[#43474D] uppercase tracking-widest">
                      Transaction ID
                    </th>
                    <th className="px-10 py-6 text-left text-[10px] font-black text-[#43474D] uppercase tracking-widest">
                      Guest
                    </th>
                    <th className="px-10 py-6 text-left text-[10px] font-black text-[#43474D] uppercase tracking-widest">
                      Method
                    </th>
                    <th className="px-10 py-6 text-right text-[10px] font-black text-[#43474D] uppercase tracking-widest">
                      Amount
                    </th>
                    <th className="px-10 py-6 text-center text-[10px] font-black text-[#43474D] uppercase tracking-widest">
                      Status
                    </th>
                    <th className="px-10 py-6 text-right text-[10px] font-black text-[#43474D] uppercase tracking-widest">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredTransactions.map((tx: any) => (
                    <tr
                      key={tx.id}
                      className="group hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-10 py-6">
                        <span className="manrope-bold text-xs text-[#0D2137]">
                          {tx.id}
                        </span>
                      </td>
                      <td className="px-10 py-6">
                        <p className="manrope-bold text-sm text-[#0D2137]">
                          {tx.guest_name || "N/A"}
                        </p>
                      </td>
                      <td className="px-10 py-6">
                        <Badge
                          variant="outline"
                          className="text-[9px] font-black uppercase tracking-widest border-gray-200 text-slate-400"
                        >
                          {tx.payment_method || "N/A"}
                        </Badge>
                      </td>
                      <td className="px-10 py-6 text-right">
                        <span className="manrope-bold text-base text-[#0D2137]">
                          ${tx.amount?.toLocaleString() || "0"}
                        </span>
                      </td>
                      <td className="px-10 py-6 text-center">
                        <div
                          className={cn(
                            "inline-flex items-center gap-2 px-3 py-1.5 rounded-full",
                            tx.status === "completed"
                              ? "bg-green-50 text-green-600"
                              : tx.status === "pending"
                                ? "bg-amber-50 text-amber-600"
                                : "bg-red-50 text-red-600",
                          )}
                        >
                          <div
                            className={cn(
                              "w-1.5 h-1.5 rounded-full",
                              tx.status === "completed"
                                ? "bg-green-500"
                                : tx.status === "pending"
                                  ? "bg-amber-500"
                                  : "bg-red-500",
                            )}
                          />
                          <span className="text-[9px] font-black uppercase tracking-widest">
                            {tx.status || "Unknown"}
                          </span>
                        </div>
                      </td>
                      <td className="px-10 py-6 text-right">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">
                          {tx.created_at
                            ? new Date(tx.created_at).toLocaleDateString()
                            : "N/A"}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {filteredTransactions.length === 0 && (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-10 py-20 text-center text-slate-400 manrope-bold italic"
                      >
                        No fiscal records found matching your current
                        parameters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function KPICard({ label, value, change, isPositive, icon }: any) {
  return (
    <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all group border-l-4 border-l-[#0D2137]">
      <div className="flex items-center justify-between mb-8">
        <div className="p-3 bg-[#F1F5F9] rounded-2xl group-hover:bg-[#0D2137] group-hover:text-white transition-colors">
          {icon}
        </div>
        <div
          className={cn(
            "flex items-center gap-1 px-2 py-1 rounded-lg",
            isPositive
              ? "bg-green-50 text-green-600"
              : "bg-red-50 text-red-600",
          )}
        >
          {isPositive ? (
            <ArrowUpRight className="w-3 h-3" />
          ) : (
            <ArrowDownRight className="w-3 h-3" />
          )}
          <span className="text-[10px] font-black">{change}</span>
        </div>
      </div>
      <p className="text-[10px] font-black text-[#43474D] uppercase tracking-widest">
        {label}
      </p>
      <h3 className="manrope-bold text-2xl md:text-3xl text-[#0D2137] tracking-tight">
        {value}
      </h3>
    </div>
  );
}
