"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
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

// --- Mock Data ---

const REVENUE_TREND = [
  { name: "Mon", revenue: 45000 },
  { name: "Tue", revenue: 52000 },
  { name: "Wed", revenue: 48000 },
  { name: "Thu", revenue: 61000 },
  { name: "Fri", revenue: 85000 },
  { name: "Sat", revenue: 98000 },
  { name: "Sun", revenue: 76000 },
];

const DEPARTMENT_REVENUE = [
  { name: "Rooms & Suites", value: 450000, color: "#334155" }, 
  { name: "Food & Beverage", value: 280000, color: "#E8924A" },
  { name: "Spa & Wellness", value: 120000, color: "#1D61FF" },
  { name: "Events & Banquets", value: 190000, color: "#64748B" },
];

const RECENT_TRANSACTIONS = [
  {
    id: "TX-9901",
    client: "Julian St. James",
    type: "Room Booking",
    amount: 12450.00,
    status: "Completed",
    date: "2026-05-15",
    time: "10:45 AM",
  },
  {
    id: "TX-9902",
    client: "Elena Rodriguez",
    type: "Event Deposit",
    amount: 8500.00,
    status: "Pending",
    date: "2026-05-15",
    time: "09:12 AM",
  },
  {
    id: "TX-9903",
    client: "Corporate Gala - Oracle",
    type: "Banqueting",
    amount: 42000.00,
    status: "Completed",
    date: "2026-05-14",
    time: "04:30 PM",
  },
  {
    id: "TX-9904",
    client: "Sterling Suites",
    type: "VIP Services",
    amount: 3200.00,
    status: "Completed",
    date: "2026-05-14",
    time: "02:15 PM",
  },
];

export default function RevenuePage() {
  const [timeframe, setTimeframe] = useState("weekly");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState<{from: string, to: string}>({from: "", to: ""});

  // Global Search Integration
  useEffect(() => {
    const handleGlobalSearch = (e: any) => {
      setSearchQuery(e.detail || "");
    };
    window.addEventListener('jagamn-global-search', handleGlobalSearch);
    return () => window.removeEventListener('jagamn-global-search', handleGlobalSearch);
  }, []);

  const handleExport = () => {
    const headers = ["ID", "Client", "Category", "Amount", "Status", "Date"];
    const rows = filteredTransactions.map(tx => [
      tx.id, tx.client, tx.type, tx.amount.toString(), tx.status, tx.date
    ]);
    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Revenue_Report_${new Date().toLocaleDateString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredTransactions = useMemo(() => {
    return RECENT_TRANSACTIONS.filter(tx => {
      // Search All Relevant Columns
      const q = searchQuery.toLowerCase();
      const matchesSearch = !searchQuery || 
        tx.client.toLowerCase().includes(q) ||
        tx.id.toLowerCase().includes(q) ||
        tx.type.toLowerCase().includes(q) ||
        tx.status.toLowerCase().includes(q) ||
        tx.amount.toString().includes(q);

      // Status Filter
      const matchesStatus = statusFilter === "all" || tx.status === statusFilter;

      // Date Filter
      const txDate = new Date(tx.date).getTime();
      const from = dateFilter.from ? new Date(dateFilter.from).getTime() : -Infinity;
      const to = dateFilter.to ? new Date(dateFilter.to).getTime() : Infinity;
      const matchesDate = txDate >= from && (dateFilter.to ? txDate <= to : true);

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [searchQuery, statusFilter, dateFilter]);

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-20 animate-in fade-in duration-700">
      <div className="max-w-7xl mx-auto pt-8 md:pt-12 space-y-10 md:space-y-12 px-4 md:px-0">
        
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
              Comprehensive fiscal analysis and performance metrics across all Palace departments.
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
                    timeframe === t ? "bg-[#0D2137] text-white shadow-lg" : "text-gray-400 hover:text-[#0D2137]"
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
            <Button onClick={handleExport} variant="outline" className="h-12 px-6 rounded-xl border-gray-100 bg-white text-[#0D2137] manrope-bold text-xs flex items-center gap-2 shadow-sm transition-all hover:scale-105 active:scale-95">
              <Download className="w-4 h-4" /> Export Report
            </Button>
          </div>
        </div>

        {/* ── KPI Grid ──────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          <KPICard label="Total Revenue" value="$1,040,000" change="+12.5%" isPositive={true} icon={<DollarSign className="w-5 h-5" />} />
          <KPICard label="Avg. Daily Rate (ADR)" value="$425.00" change="+3.2%" isPositive={true} icon={<Building className="w-5 h-5" />} />
          <KPICard label="RevPAR" value="$310.50" change="-1.8%" isPositive={false} icon={<Target className="w-5 h-5" />} />
          <KPICard label="Avg. Occupancy" value="84.2%" change="+5.4%" isPositive={true} icon={<Users className="w-5 h-5" />} />
        </div>

        {/* ── Charts Section ─────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8 bg-white p-6 md:p-10 rounded-3xl border border-gray-100 shadow-sm space-y-8">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="manrope-bold text-xl text-[#0D2137]">Revenue Inflow Trend</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Global Inflow Performance</p>
              </div>
            </div>
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={REVENUE_TREND}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0D2137" stopOpacity={0.1}/><stop offset="95%" stopColor="#0D2137" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 10, fontWeight: 700}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 10, fontWeight: 700}} tickFormatter={(v) => `$${v/1000}k`} />
                  <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }} />
                  <Area type="monotone" dataKey="revenue" stroke="#0D2137" strokeWidth={4} fillOpacity={1} fill="url(#colorRev)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="lg:col-span-4 bg-[#0D2137] p-6 md:p-10 rounded-3xl text-white shadow-2xl space-y-10 relative overflow-hidden flex flex-col">
            <h3 className="manrope-bold text-xl relative z-10">Departmental Split</h3>
            <div className="h-[250px] w-full relative z-10">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={DEPARTMENT_REVENUE} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={8} dataKey="value">
                    {DEPARTMENT_REVENUE.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-4 relative z-10">
              {DEPARTMENT_REVENUE.map((dept, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: dept.color }} />
                    <span className="text-xs font-bold text-white/60">{dept.name}</span>
                  </div>
                  <span className="manrope-bold text-xs">${(dept.value/1000).toFixed(0)}k</span>
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
              <h3 className="manrope-bold text-2xl text-[#0D2137]">Transaction Intelligence</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Unified Ledger Access</p>
            </div>
            
            <div className="flex flex-wrap items-center gap-4 w-full xl:w-auto justify-start xl:justify-end">
              {/* Multi-parameter Status Filter */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-12 w-full sm:w-[180px] bg-white border-gray-100 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                </SelectContent>
              </Select>

              {/* Enhanced Date Filter */}
              <div className="flex items-center gap-2 bg-white border border-gray-100 rounded-xl p-1 px-3 shadow-sm h-12 w-full sm:w-auto">
                <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
                <input type="date" value={dateFilter.from} onChange={(e) => setDateFilter({...dateFilter, from: e.target.value})} className="bg-transparent text-[10px] font-bold text-[#0D2137] outline-none w-[110px]" />
                <ArrowRight className="w-3 h-3 text-gray-300 shrink-0" />
                <input type="date" value={dateFilter.to} onChange={(e) => setDateFilter({...dateFilter, to: e.target.value})} className="bg-transparent text-[10px] font-bold text-[#0D2137] outline-none w-[110px]" />
                {(dateFilter.from || dateFilter.to) && <button onClick={() => setDateFilter({from: "", to: ""})} className="shrink-0"><X className="w-3 h-3 text-gray-300 hover:text-red-500" /></button>}
              </div>

              {/* Local Search Input */}
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search ledger..." className="h-12 bg-white border-gray-100 rounded-xl pl-12 text-[10px] font-black uppercase tracking-widest shadow-sm" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead className="bg-[#F8FAFC]">
                <tr>
                  <th className="px-10 py-6 text-left text-[10px] font-black text-[#43474D] uppercase tracking-widest">Transaction ID</th>
                  <th className="px-10 py-6 text-left text-[10px] font-black text-[#43474D] uppercase tracking-widest">Client/Account</th>
                  <th className="px-10 py-6 text-left text-[10px] font-black text-[#43474D] uppercase tracking-widest">Category</th>
                  <th className="px-10 py-6 text-right text-[10px] font-black text-[#43474D] uppercase tracking-widest">Amount</th>
                  <th className="px-10 py-6 text-center text-[10px] font-black text-[#43474D] uppercase tracking-widest">Status</th>
                  <th className="px-10 py-6 text-right text-[10px] font-black text-[#43474D] uppercase tracking-widest">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="group hover:bg-gray-50 transition-colors">
                    <td className="px-10 py-6"><span className="manrope-bold text-xs text-[#0D2137]">{tx.id}</span></td>
                    <td className="px-10 py-6"><p className="manrope-bold text-sm text-[#0D2137]">{tx.client}</p></td>
                    <td className="px-10 py-6"><Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest border-gray-200 text-slate-400">{tx.type}</Badge></td>
                    <td className="px-10 py-6 text-right"><span className="manrope-bold text-base text-[#0D2137]">${tx.amount.toLocaleString()}</span></td>
                    <td className="px-10 py-6 text-center">
                      <div className={cn("inline-flex items-center gap-2 px-3 py-1.5 rounded-full", tx.status === "Completed" ? "bg-green-50 text-green-600" : "bg-amber-50 text-amber-600")}>
                        <div className={cn("w-1.5 h-1.5 rounded-full", tx.status === "Completed" ? "bg-green-500" : "bg-amber-500")} />
                        <span className="text-[9px] font-black uppercase tracking-widest">{tx.status}</span>
                      </div>
                    </td>
                    <td className="px-10 py-6 text-right">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">{tx.date}</span>
                    </td>
                  </tr>
                ))}
                {filteredTransactions.length === 0 && (
                  <tr><td colSpan={6} className="px-10 py-20 text-center text-slate-400 manrope-bold italic">No fiscal records found matching your current parameters.</td></tr>
                )}
              </tbody>
            </table>
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
        <div className="p-3 bg-[#F1F5F9] rounded-2xl group-hover:bg-[#0D2137] group-hover:text-white transition-colors">{icon}</div>
        <div className={cn("flex items-center gap-1 px-2 py-1 rounded-lg", isPositive ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600")}>
          {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          <span className="text-[10px] font-black">{change}</span>
        </div>
      </div>
      <p className="text-[10px] font-black text-[#43474D] uppercase tracking-widest">{label}</p>
      <h3 className="manrope-bold text-2xl md:text-3xl text-[#0D2137] tracking-tight">{value}</h3>
    </div>
  );
}
