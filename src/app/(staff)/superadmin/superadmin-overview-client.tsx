"use client";

import React, { useEffect } from "react";
import {
  Banknote,
  TrendingUp,
  BedDouble,
  Utensils,
  AlertCircle,
  RefreshCcw,
  ShieldAlert,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  ShoppingCart,
  Package,
  Truck,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { formatMoney } from "@/lib/currency";
import { PredictiveStockAnalysis } from "@/components/inventorypage/PredictiveStockAnalysis";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { cn } from "@/lib/utils";

// ── Components ──────────────────────────────────────

interface MetricCardProps {
  title: string;
  value: string | number;
  pillText: string;
  pillType: "positive" | "negative";
  subtext: string;
  icon: React.ComponentType<{ className?: string }>;
}

const MetricCard = ({
  title,
  value,
  pillText,
  pillType,
  subtext,
  icon: Icon,
}: MetricCardProps) => {
  const isPositive = pillType === "positive";
  const isNegative = pillType === "negative";

  return (
    <div className="bg-white p-6 md:p-8 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] border-l-4 border-l-[#0D2137] border-y border-r border-gray-100 flex flex-col justify-between">
      <div className="flex items-start justify-between mb-4">
        <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-[#0D2137]">
          <Icon className="w-4 h-4" />
        </div>
        <div
          className={cn(
            "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
            isPositive ? "bg-[#F4A261]/10 text-[#D9772A]" : "",
            isNegative ? "bg-red-50 text-red-600" : "",
          )}
        >
          {pillText}
        </div>
      </div>
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
          {title}
        </p>
        <h3 className="manrope-bold text-3xl text-[#0D2137] mb-2">{value}</h3>
        <p className="text-xs text-slate-500 font-medium">{subtext}</p>
      </div>
    </div>
  );
};

interface KPIs {
  occupancy_rate?: number;
  total_bookings?: number;
  confirmed_bookings?: number;
  active_staff?: number;
  total_staff?: number;
}

interface RevenueSummary {
  total_revenue?: number;
  growth_percentage?: number;
}

interface RevenueMonthPoint {
  month: string;
  revenue: number;
}

interface SuperadminOverviewClientProps {
  kpis: KPIs;
  revenueSummary: RevenueSummary;
  revenueMonthly: RevenueMonthPoint[];
  occupancyDaily: unknown[];
  payrollMonthly: unknown[];
  leaveSummary: unknown;
  procurementKpis: {
    pendingApproval: number;
    inTransit: number;
    deliveredThisMonth: number;
    totalSpendMinor: number;
  };
  procurementAlerts?: { item: string; priority: string; status: string }[];
  predictive?: {
    items: { id: string; name: string; status: string }[];
    occupancyPct: number;
  };
  latestSync: string;
}

export default function SuperadminOverviewClient({
  kpis,
  revenueSummary,
  revenueMonthly,
  procurementKpis,
  procurementAlerts = [],
  latestSync,
  predictive = { items: [], occupancyPct: 0 },
}: SuperadminOverviewClientProps) {
  const router = useRouter();

  // Auto-refresh every 60 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      router.refresh();
    }, 60000);

    return () => clearInterval(interval);
  }, [router]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "XAF",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? "s" : ""} ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24)
      return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  };

  // Calculate metrics
  const totalRevenue = revenueSummary?.total_revenue || 0;
  const avgOccupancy = kpis?.occupancy_rate || 0;
  const totalBookings = kpis?.total_bookings || 0;
  const confirmedBookings = kpis?.confirmed_bookings || 0;

  // Format month labels (e.g., "2024-01" -> "Jan")
  const chartData = revenueMonthly.map((item) => {
    const date = new Date(item.month + "-01");
    const monthName = date.toLocaleDateString("en-US", { month: "short" });
    return {
      month: monthName,
      revenue: item.revenue,
    };
  });

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-700">
      {/* ── Page Header ───────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2">
        <div>
          <h1 className="manrope-bold text-3xl text-jagamn-primary">
            Executive Overview
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Real-time consolidated metrics and critical actions.
          </p>
        </div>
        <div className="text-right">
          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
            Last Sync
          </p>
          <p className="text-sm manrope-bold text-jagamn-primary">
            {formatTimeAgo(latestSync)}
          </p>
        </div>
      </div>

      {/* ── Metrics Row ───────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          icon={Banknote}
          title="Total Revenue"
          value={formatCurrency(totalRevenue)}
          pillText={
            revenueSummary?.growth_percentage !== undefined
              ? `${revenueSummary.growth_percentage > 0 ? "+" : ""}${revenueSummary.growth_percentage.toFixed(1)}%`
              : "N/A"
          }
          pillType={
            (revenueSummary?.growth_percentage ?? 0) > 0
              ? "positive"
              : "negative"
          }
          subtext="Current period performance"
        />
        <MetricCard
          icon={TrendingUp}
          title="Confirmed Bookings"
          value={confirmedBookings.toString()}
          pillText={`${totalBookings} total`}
          pillType="positive"
          subtext={`${((confirmedBookings / Math.max(totalBookings, 1)) * 100).toFixed(1)}% confirmation rate`}
        />
        <MetricCard
          icon={BedDouble}
          title="Avg. Occupancy"
          value={`${avgOccupancy.toFixed(1)}%`}
          pillText={avgOccupancy >= 75 ? "Strong" : "Moderate"}
          pillType={avgOccupancy >= 75 ? "positive" : "negative"}
          subtext="Current occupancy rate"
        />
        <MetricCard
          icon={Utensils}
          title="Active Staff"
          value={kpis?.active_staff || 0}
          pillText={`${kpis?.total_staff || 0} total`}
          pillType="positive"
          subtext="Staff members on duty"
        />
      </div>

      {/* ── Procurement & Low-Stock ───────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Procurement KPIs */}
        <div className="bg-white p-6 rounded-3xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-gray-100">
          <div className="flex items-center gap-2 mb-5">
            <ShoppingCart className="w-5 h-5 text-jagamn-primary" />
            <h2 className="manrope-bold text-lg text-[#0D2137]">Procurement</h2>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-slate-500">
                <Package className="w-4 h-4" /> Pending approval
              </span>
              <span className="manrope-bold text-[#0D2137]">
                {procurementKpis?.pendingApproval ?? 0}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-slate-500">
                <Truck className="w-4 h-4" /> In transit
              </span>
              <span className="manrope-bold text-[#0D2137]">
                {procurementKpis?.inTransit ?? 0}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">Delivered this month</span>
              <span className="manrope-bold text-[#0D2137]">
                {procurementKpis?.deliveredThisMonth ?? 0}
              </span>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">
              Total spend
            </p>
            <p className="manrope-bold text-2xl text-[#0D2137]">
              {formatMoney(Math.round((procurementKpis?.totalSpendMinor ?? 0) / 100))}
            </p>
          </div>
        </div>

        {/* Low-stock alerts */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-gray-100">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-jagamn-tertiary" />
              <h2 className="manrope-bold text-lg text-[#0D2137]">
                Low-Stock Alerts
              </h2>
            </div>
            <a
              href="/superadmin/procurement"
              className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-[#0D2137]"
            >
              View all
            </a>
          </div>
          {procurementAlerts.length === 0 ? (
            <p className="text-sm text-slate-400 py-6 text-center">
              No low-stock alerts — inventory healthy.
            </p>
          ) : (
            <ul className="divide-y divide-gray-50">
              {procurementAlerts.slice(0, 6).map((a, i) => (
                <li key={i} className="flex items-center justify-between py-3">
                  <span className="text-sm font-medium text-[#0D2137]">
                    {a.item}
                  </span>
                  <span
                    className={cn(
                      "text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full",
                      a.priority === "high"
                        ? "bg-red-50 text-red-600"
                        : "bg-amber-50 text-amber-600",
                    )}
                  >
                    {a.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* ── Main Layout (Charts & Critical Actions) ───── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Content (Charts & Status) */}
        <div className="lg:col-span-8 space-y-8">
          {/* Chart Container */}
          <div className="bg-white p-8 rounded-3xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-gray-100">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="manrope-bold text-xl text-[#0D2137]">
                  Financial Performance
                </h2>
                <p className="text-sm text-slate-500 font-medium">
                  12-month revenue trend analysis
                </p>
              </div>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#0D2137]"></div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">
                    Revenue
                  </span>
                </div>
              </div>
            </div>

            {/* Real Revenue Chart */}
            <div className="relative w-full h-64 md:h-80 lg:h-[320px]">
              {chartData.length > 0 ? (
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                  minWidth={0}
                  minHeight={200}
                >
                  <AreaChart
                    data={chartData}
                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient
                        id="colorRevenue"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#0D2137"
                          stopOpacity={0.15}
                        />
                        <stop
                          offset="95%"
                          stopColor="#0D2137"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#e2e8f0"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="month"
                      tick={{ fontSize: 10, fill: "#94a3b8" }}
                      tickLine={false}
                      axisLine={{ stroke: "#e2e8f0" }}
                    />
                    <YAxis
                      tick={{ fontSize: 10, fill: "#94a3b8" }}
                      tickLine={false}
                      axisLine={{ stroke: "#e2e8f0" }}
                      tickFormatter={(value) => formatCurrency(value)}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "white",
                        border: "1px solid #e2e8f0",
                        borderRadius: "12px",
                        padding: "12px",
                        boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
                      }}
                      labelStyle={{
                        fontSize: "10px",
                        fontWeight: "800",
                        textTransform: "uppercase",
                        letterSpacing: "0.1em",
                        color: "#94a3b8",
                        marginBottom: "8px",
                      }}
                      formatter={(value: unknown) => {
                        const numValue = typeof value === "number" ? value : 0;
                        return [formatCurrency(numValue), "Revenue"];
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#0D2137"
                      strokeWidth={3}
                      fill="url(#colorRevenue)"
                      strokeLinecap="round"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-slate-400 text-sm">
                  No revenue data available
                </div>
              )}
            </div>
          </div>

          {/* ── Predictive Stock Analysis (below the financial chart) ── */}
          {predictive.items.length > 0 && (
            <div className="flex">
              <PredictiveStockAnalysis
                items={predictive.items}
                occupancyPct={predictive.occupancyPct}
              />
            </div>
          )}

          {/* Bottom Cards Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Image Card */}
            <div className="relative rounded-3xl overflow-hidden h-64 group shadow-lg">
              <Image
                src="/images/lobby.png"
                alt="Heritage Suite"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover transition-transform duration-700 group-hover:scale-110"
                onError={(e) => {
                  e.currentTarget.src =
                    "https://images.unsplash.com/photo-1542314831-c6a4d14d8c85?q=80&w=2070&auto=format&fit=crop";
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0D2137]/90 via-[#0D2137]/40 to-transparent"></div>
              <div className="absolute inset-x-0 bottom-0 p-8">
                <h3 className="manrope-bold text-xl text-white mb-2">
                  Heritage Suite Performance
                </h3>
                <p className="text-white/80 text-sm font-medium">
                  Review occupancy and guest satisfaction for premium wings.
                </p>
              </div>
            </div>

            {/* System Status Card */}
            <div className="bg-[#F8FAFC] rounded-3xl p-8 border border-gray-100 flex flex-col justify-between">
              <div>
                <h3 className="manrope-bold text-xl text-[#0D2137] mb-2">
                  System Status
                </h3>
                <p className="text-slate-500 text-sm font-medium leading-relaxed mb-6">
                  All primary hospitality modules are currently operational with
                  nominal latency.
                </p>
              </div>
              <div className="flex items-end justify-between">
                <div className="flex gap-6">
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">
                      Core API
                    </p>
                    <p className="manrope-bold text-lg text-[#F4A261]">
                      99.98%
                    </p>
                  </div>
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">
                      Gateway
                    </p>
                    <p className="manrope-bold text-lg text-[#F4A261]">12ms</p>
                  </div>
                </div>
                {/* Shield Icon styling to match design */}
                <div className="relative w-16 h-20 bg-transparent flex items-center justify-center">
                  <div className="absolute inset-0 border-[3px] border-[#F4A261] border-t-0 rounded-b-xl opacity-60"></div>
                  <ShieldCheck
                    className="w-8 h-8 text-[#0D2137] relative -top-2"
                    strokeWidth={1.5}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Content (Critical Actions Sidebar) */}
        <div className="lg:col-span-4">
          <div className="bg-[#F8FAFC] rounded-3xl p-6 md:p-8 h-full border border-gray-100 flex flex-col">
            <div className="flex items-center justify-between mb-8">
              <h2 className="manrope-bold text-lg text-[#0D2137]">
                Critical Actions
              </h2>
              <div className="bg-red-600 text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">
                3 Active
              </div>
            </div>

            <div className="space-y-4 flex-1">
              {/* Alert 1 */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-l-red-500 hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex gap-4">
                  <div className="shrink-0 mt-0.5">
                    <AlertCircle className="w-5 h-5 text-red-500" />
                  </div>
                  <div>
                    <h4 className="manrope-bold text-sm text-[#0D2137] mb-2">
                      Escalated Guest Complaint
                    </h4>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed mb-4">
                      Suite 402: Service delay & structural HVAC issue reported
                      twice.
                    </p>
                    <button className="text-[10px] font-black uppercase tracking-widest text-red-600 hover:text-red-700 flex items-center gap-1">
                      Assign Manager <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Alert 2 */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-l-[#A57850] hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex gap-4">
                  <div className="shrink-0 mt-0.5">
                    <RefreshCcw className="w-5 h-5 text-[#A57850]" />
                  </div>
                  <div>
                    <h4 className="manrope-bold text-sm text-[#0D2137] mb-2">
                      Financial Sync Failed
                    </h4>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed mb-4">
                      A revenue reconciliation job needs review for batch #8291.
                    </p>
                    <button className="text-[10px] font-black uppercase tracking-widest text-[#A57850] hover:text-[#8a6341] flex items-center gap-1">
                      Retry Sync <RefreshCcw className="w-3 h-3 ml-1" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Alert 3 */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-l-[#0D2137] hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex gap-4">
                  <div className="shrink-0 mt-0.5">
                    <ShieldAlert className="w-5 h-5 text-[#0D2137]" />
                  </div>
                  <div>
                    <h4 className="manrope-bold text-sm text-[#0D2137] mb-2">
                      System Audit Alert
                    </h4>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed mb-4">
                      Unusual login detected from remote IP (Frankfurt, DE).
                      Administrative lock recommended.
                    </p>
                    <button className="text-[10px] font-black uppercase tracking-widest text-[#0D2137] hover:text-slate-700 flex items-center gap-1">
                      View Logs <ExternalLink className="w-3 h-3 ml-1" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-8 mt-4 border-t border-gray-200">
              <button className="w-full text-center text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-[#0D2137] transition-colors">
                View All System Alerts
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
