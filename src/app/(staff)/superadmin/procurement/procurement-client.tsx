"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Package,
  Truck,
  ShoppingCart,
  ShieldCheck,
  Search,
  Download,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowRight,
  Building2,
  Calendar,
  X,
} from "lucide-react";
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

interface ProcurementClientProps {
  kpis: any;
  orders: any[];
  suppliers: any[];
}

export default function ProcurementClient({
  kpis,
  orders,
  suppliers,
}: ProcurementClientProps) {
  const [activeTab, setActiveTab] = useState("orders");
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("all");
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

  const filteredOrders = useMemo(() => {
    return (orders || []).filter((po: any) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        (po.item_description &&
          po.item_description.toLowerCase().includes(q)) ||
        (po.supplier_name && po.supplier_name.toLowerCase().includes(q)) ||
        (po.id && po.id.toLowerCase().includes(q)) ||
        (po.status && po.status.toLowerCase().includes(q)) ||
        (po.total_amount && po.total_amount.toString().includes(q));

      const matchesPriority =
        priorityFilter === "all" || po.priority === priorityFilter;

      const orderDate = po.created_at ? new Date(po.created_at).getTime() : 0;
      const from = dateFilter.from
        ? new Date(dateFilter.from).getTime()
        : -Infinity;
      const to = dateFilter.to ? new Date(dateFilter.to).getTime() : Infinity;
      const matchesDate =
        orderDate >= from && (dateFilter.to ? orderDate <= to : true);

      return matchesSearch && matchesPriority && matchesDate;
    });
  }, [orders, searchQuery, priorityFilter, dateFilter]);

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-20 animate-in fade-in duration-700">
      <div className="mx-auto pt-8 md:pt-12 space-y-10 md:space-y-12 px-4 md:px-0">
        {/* ── Page Header ────────────────────────────── */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div className="space-y-2 text-center lg:text-left">
            <p className="text-[10px] font-black text-[#E8924A] uppercase tracking-[0.4em]">
              Supply Chain Management
            </p>
            <h1 className="manrope-bold text-3xl md:text-5xl text-[#0D2137] tracking-tight">
              Procurement Overview
            </h1>
            <p className="text-slate-400 font-medium max-w-2xl text-sm md:text-base">
              Streamlined acquisition protocols and logistical tracking for
              Palace operations.
            </p>
          </div>
        </div>

        {/* ── Quick Stats Row ────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          <ProcStatCard
            label="Pending Orders"
            value={kpis?.pending_orders || 0}
            subtext="Waiting for approval"
            icon={<Clock className="w-5 h-5" />}
          />
          <ProcStatCard
            label="In Transit"
            value={kpis?.in_transit || 0}
            subtext="En route to Palace"
            icon={<Truck className="w-5 h-5" />}
          />
          <ProcStatCard
            label="Low Stock Alerts"
            value={kpis?.low_stock_alerts || 0}
            subtext="Immediate restock needed"
            icon={<AlertCircle className="w-5 h-5 text-red-500" />}
            isAlert={true}
          />
          <ProcStatCard
            label="Monthly Spend"
            value={`$${kpis?.monthly_spend ? (kpis.monthly_spend / 1000).toFixed(0) : "0"}k`}
            subtext="Across all departments"
            icon={<ShoppingCart className="w-5 h-5" />}
          />
        </div>

        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8 space-y-8">
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 px-2">
              <div className="flex bg-white/50 p-1 rounded-xl border border-gray-100">
                <button
                  onClick={() => setActiveTab("orders")}
                  className={cn(
                    "px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                    activeTab === "orders"
                      ? "bg-[#0D2137] text-white"
                      : "text-gray-400 hover:text-[#0D2137]",
                  )}
                >
                  Active Orders
                </button>
                <button
                  onClick={() => setActiveTab("history")}
                  className={cn(
                    "px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                    activeTab === "history"
                      ? "bg-[#0D2137] text-white"
                      : "text-gray-400 hover:text-[#0D2137]",
                  )}
                >
                  Archive
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-4 w-full xl:w-auto justify-start xl:justify-end">
                <Select
                  value={priorityFilter}
                  onValueChange={setPriorityFilter}
                >
                  <SelectTrigger className="h-12 w-full sm:w-[160px] bg-white border-gray-100 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm">
                    <SelectValue placeholder="All Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priority</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
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

                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search orders..."
                    className="h-12 bg-white border-gray-100 rounded-xl pl-12 text-[10px] font-black uppercase tracking-widest shadow-sm focus-visible:ring-jagamn-tertiary/20"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {filteredOrders.map((po: any) => (
                <div
                  key={po.id}
                  className="bg-white p-6 rounded-[1.5rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all group flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden"
                >
                  <div className="flex items-center gap-6">
                    <div
                      className={cn(
                        "w-14 h-14 rounded-2xl flex items-center justify-center border-2",
                        po.status === "delivered"
                          ? "bg-green-50 border-green-100 text-green-600"
                          : po.status === "in_transit"
                            ? "bg-blue-50 border-blue-100 text-blue-600"
                            : "bg-amber-50 border-amber-100 text-amber-600",
                      )}
                    >
                      {po.status === "delivered" ? (
                        <CheckCircle2 className="w-6 h-6" />
                      ) : po.status === "in_transit" ? (
                        <Truck className="w-6 h-6" />
                      ) : (
                        <Clock className="w-6 h-6" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h4 className="manrope-bold text-base text-[#0D2137]">
                          {po.item_description || "N/A"}
                        </h4>
                        <Badge
                          className={cn(
                            "text-[8px] font-black uppercase tracking-widest border-0",
                            po.priority === "urgent"
                              ? "bg-red-50 text-red-500"
                              : po.priority === "high"
                                ? "bg-amber-50 text-amber-600"
                                : "bg-gray-50 text-gray-400",
                          )}
                        >
                          {po.priority || "medium"}
                        </Badge>
                      </div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        {po.id} • {po.supplier_name || "N/A"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-10 w-full sm:w-auto justify-between sm:justify-end">
                    <div className="text-right">
                      <p className="manrope-bold text-lg text-[#0D2137]">
                        ${(po.total_amount || 0).toLocaleString()}
                      </p>
                      <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                        {po.created_at
                          ? new Date(po.created_at).toLocaleDateString()
                          : "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              {filteredOrders.length === 0 && (
                <div className="bg-white p-20 rounded-[2rem] border border-dashed border-gray-200 text-center text-slate-400 manrope-bold italic">
                  No logistical records found matching your parameters.
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-4 space-y-10">
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 space-y-8">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h3 className="manrope-bold text-lg text-[#0D2137]">
                    Vetted Suppliers
                  </h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Preferred Vendors
                  </p>
                </div>
              </div>
              <div className="space-y-6">
                {(suppliers || []).slice(0, 5).map((sup: any, i: number) => (
                  <div
                    key={i}
                    className="flex items-center justify-between group cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-[#F8FAFC] flex items-center justify-center text-slate-400 group-hover:bg-[#0D2137] group-hover:text-white transition-all">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <div>
                        <h5 className="manrope-bold text-sm text-[#0D2137]">
                          {sup.name || "N/A"}
                        </h5>
                        <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                          {sup.category || "General"}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-[10px] font-black text-[#E8924A]">
                        {sup.rating || "N/A"} ★
                      </span>
                      <span className="text-[9px] font-bold text-slate-300 uppercase">
                        {sup.active_orders || 0} Active
                      </span>
                    </div>
                  </div>
                ))}
                {(!suppliers || suppliers.length === 0) && (
                  <p className="text-center text-slate-400 text-sm italic py-4">
                    No suppliers found
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProcStatCard({ label, value, subtext, icon, isAlert }: any) {
  return (
    <div
      className={cn(
        "bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all group",
        isAlert
          ? "border-l-4 border-l-red-500"
          : "border-l-4 border-l-[#0D2137]",
      )}
    >
      <div className="flex items-center justify-between mb-8">
        <div className="p-3 bg-[#F1F5F9] rounded-2xl group-hover:bg-[#0D2137] group-hover:text-white transition-colors">
          {icon}
        </div>
      </div>
      <p className="text-[10px] font-black text-[#43474D] uppercase tracking-widest">
        {label}
      </p>
      <h3 className="manrope-bold text-2xl md:text-3xl text-[#0D2137] tracking-tight">
        {value}
      </h3>
      <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest pt-1">
        {subtext}
      </p>
    </div>
  );
}
