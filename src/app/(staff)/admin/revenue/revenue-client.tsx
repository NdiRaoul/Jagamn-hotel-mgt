"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  TrendingUp,
  Banknote,
  Users,
  Building,
  ArrowRight,
  Download,
  Calendar,
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
} from "recharts";
import { cn } from "@/lib/utils";
import { formatMoney } from "@/lib/currency";
import { formatTxnId } from "@/lib/txn";
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
import type { TransactionRecord2 } from "@/lib/data/reception";
import type { RevenuePoint, RoomTypeRevenue } from "@/lib/data/admin";
import { useRouter } from "next/navigation";
import { RefundModal, type RefundTarget } from "@/components/payments/RefundModal";

// Fallback sparkline when no data yet
const EMPTY_SPARKLINE: { day: string; revenue: number }[] = [
  { day: "—", revenue: 0 },
];

interface Props {
  revenue: {
    revenue: number;
    settledPayments: number;
    pendingPayments: number;
  };
  transactions: TransactionRecord2[];
  revenueDaily: RevenuePoint[];
  revenueByRoomType: RoomTypeRevenue[];
  error: string | null;
}

export default function RevenueClient({
  revenue,
  transactions,
  revenueDaily,
  revenueByRoomType,
  error,
}: Props) {
  const router = useRouter();
  const [timeframe, setTimeframe] = useState("weekly");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [refundTarget, setRefundTarget] = useState<RefundTarget | null>(null);
  const [dateFilter, setDateFilter] = useState<{ from: string; to: string }>({
    from: "",
    to: "",
  });

  useEffect(() => {
    const handleGlobalSearch = (e: CustomEvent<string>) => {
      setSearchQuery(e.detail || "");
    };
    window.addEventListener(
      "jagamn-global-search",
      handleGlobalSearch as EventListener,
    );
    return () =>
      window.removeEventListener(
        "jagamn-global-search",
        handleGlobalSearch as EventListener,
      );
  }, []);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        (tx.bookingRef || "").toLowerCase().includes(q) ||
        (tx.guestName || "").toLowerCase().includes(q) ||
        (tx.guestEmail || "").toLowerCase().includes(q) ||
        tx.derivedStatus.toLowerCase().includes(q);

      const matchesStatus =
        statusFilter === "all" || tx.derivedStatus === statusFilter;

      const txDate = new Date(tx.eventAt).getTime();
      const from = dateFilter.from
        ? new Date(dateFilter.from).getTime()
        : -Infinity;
      const to = dateFilter.to ? new Date(dateFilter.to).getTime() : Infinity;
      const matchesDate =
        txDate >= from && (dateFilter.to ? txDate <= to : true);

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [transactions, searchQuery, statusFilter, dateFilter]);

  const handleExport = () => {
    const headers = [
      "Payment ID",
      "Booking Ref",
      "Guest",
      "Provider",
      "Amount",
      "Status",
      "Date",
    ];
    const rows = filteredTransactions.map((tx) => [
      tx.paymentId,
      tx.bookingRef || "",
      tx.guestName || "",
      tx.provider || "",
      (tx.amountMinor / 100).toFixed(2),
      tx.derivedStatus,
      tx.eventAt,
    ]);
    const csvContent = [
      headers.join(","),
      ...rows.map((r) => r.join(",")),
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.setAttribute("href", URL.createObjectURL(blob));
    link.setAttribute(
      "download",
      `Revenue_Report_${new Date().toLocaleDateString()}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ADR & RevPAR are illustrative until a rooms+bookings join helper exists
  const totalRevenue = revenue.revenue;

  // Transform room type revenue data for the pie chart
  const COLORS = ["#E8924A", "#0D2137", "#64748B", "#94A3B8", "#CBD5E1"];
  const departmentRevenue = revenueByRoomType.map((item, index) => ({
    name: item.room_type,
    value: item.revenue,
    color: COLORS[index % COLORS.length],
  }));

  // Fallback data if no revenue by room type
  const EMPTY_DEPARTMENT_REVENUE = [
    { name: "No Data", value: 1, color: "#E5E7EB" },
  ];

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

        {error && (
          <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-red-600 text-sm font-medium">
            {error}
          </div>
        )}

        {/* ── KPI Grid ──────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          <KPICard
            label="Total Revenue"
            value={formatMoney(totalRevenue)}
            change={`${revenue.settledPayments} settled`}
            isPositive={true}
            icon={<Banknote className="w-5 h-5" />}
          />
          <KPICard
            label="Settled Payments"
            value={String(revenue.settledPayments)}
            change=""
            isPositive={true}
            icon={<Building className="w-5 h-5" />}
          />
          <KPICard
            label="Pending Payments"
            value={String(revenue.pendingPayments)}
            change=""
            isPositive={revenue.pendingPayments === 0}
            icon={<Target className="w-5 h-5" />}
          />
          <KPICard
            label="Transaction Records"
            value={String(transactions.length)}
            change=""
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
                  Illustrative — connect a daily aggregation view to update
                </p>
              </div>
            </div>
            <div style={{ height: 400 }} className="w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={
                    revenueDaily.length > 0 ? revenueDaily : EMPTY_SPARKLINE
                  }
                >
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
                    dataKey="day"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#94A3B8", fontSize: 10, fontWeight: 700 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#94A3B8", fontSize: 10, fontWeight: 700 }}
                    tickFormatter={(v) => formatMoney(v)}
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
            <div style={{ height: 250 }} className="w-full relative z-10">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={
                      departmentRevenue.length > 0
                        ? departmentRevenue
                        : EMPTY_DEPARTMENT_REVENUE
                    }
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={8}
                    dataKey="value"
                    fill="#E8924A"
                  />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-4 relative z-10">
              {(departmentRevenue.length > 0
                ? departmentRevenue
                : EMPTY_DEPARTMENT_REVENUE
              ).map((dept, i) => (
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
                    {formatMoney(dept.value)}
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
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-12 w-full sm:w-[180px] bg-white border-gray-100 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>

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

          <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden overflow-x-auto">
            <table className="w-full" style={{ minWidth: 900 }}>
              <thead className="bg-[#F8FAFC]">
                <tr>
                  <th className="px-10 py-6 text-left text-[10px] font-black text-[#43474D] uppercase tracking-widest">
                    Payment ID
                  </th>
                  <th className="px-10 py-6 text-left text-[10px] font-black text-[#43474D] uppercase tracking-widest">
                    Guest / Booking
                  </th>
                  <th className="px-10 py-6 text-left text-[10px] font-black text-[#43474D] uppercase tracking-widest">
                    Provider
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
                  <th className="px-10 py-6 text-right text-[10px] font-black text-[#43474D] uppercase tracking-widest">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredTransactions.map((tx) => (
                  <tr
                    key={`${tx.paymentId}-${tx.eventAt}`}
                    className="group hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-10 py-6">
                      <span className="manrope-bold text-xs text-[#0D2137]">
                        {formatTxnId(tx.paymentId)}
                      </span>
                    </td>
                    <td className="px-10 py-6">
                      <p className="manrope-bold text-sm text-[#0D2137]">
                        {tx.guestName || "—"}
                      </p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">
                        {tx.bookingRef || ""}
                      </p>
                    </td>
                    <td className="px-10 py-6">
                      <Badge
                        variant="outline"
                        className="text-[9px] font-black uppercase tracking-widest border-gray-200 text-slate-400"
                      >
                        {tx.provider || tx.eventType}
                      </Badge>
                    </td>
                    <td className="px-10 py-6 text-right">
                      <span className="manrope-bold text-base text-[#0D2137]">
                        {formatMoney(Math.round(tx.amountMinor / 100))}
                      </span>
                    </td>
                    <td className="px-10 py-6 text-center">
                      <div
                        className={cn(
                          "inline-flex items-center gap-2 px-3 py-1.5 rounded-full",
                          tx.derivedStatus === "paid"
                            ? "bg-green-50 text-green-600"
                            : tx.derivedStatus === "failed"
                              ? "bg-red-50 text-red-600"
                              : "bg-amber-50 text-amber-600",
                        )}
                      >
                        <div
                          className={cn(
                            "w-1.5 h-1.5 rounded-full",
                            tx.derivedStatus === "paid"
                              ? "bg-green-500"
                              : tx.derivedStatus === "failed"
                                ? "bg-red-500"
                                : "bg-amber-500",
                          )}
                        />
                        <span className="text-[9px] font-black uppercase tracking-widest">
                          {tx.derivedStatus}
                        </span>
                      </div>
                    </td>
                    <td className="px-10 py-6 text-right">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">
                        {new Date(tx.eventAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-10 py-6 text-right">
                      {tx.derivedStatus === "paid" && (
                        <button
                          onClick={() =>
                            setRefundTarget({
                              paymentId: tx.paymentId,
                              bookingRef: tx.bookingRef,
                              amountXaf: Math.round(tx.amountMinor / 100),
                            })
                          }
                          className="text-[10px] font-black uppercase tracking-widest text-jagamn-tertiary hover:underline"
                        >
                          Refund
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {filteredTransactions.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-10 py-20 text-center text-slate-400 manrope-bold italic"
                    >
                      No fiscal records found matching your current parameters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {refundTarget && (
        <RefundModal
          target={refundTarget}
          onClose={() => setRefundTarget(null)}
          onRefunded={() => router.refresh()}
        />
      )}
    </div>
  );
}

function KPICard({
  label,
  value,
  change,
  isPositive,
  icon,
}: {
  label: string;
  value: string;
  change: string;
  isPositive: boolean;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all group border-l-4 border-l-[#0D2137]">
      <div className="flex items-center justify-between mb-8">
        <div className="p-3 bg-[#F1F5F9] rounded-2xl group-hover:bg-[#0D2137] group-hover:text-white transition-colors">
          {icon}
        </div>
        {change && (
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
        )}
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
