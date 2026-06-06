"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Package,
  Truck,
  ShoppingCart,
  Plus,
  Search,
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
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import type {
  PurchaseOrder,
  Supplier,
  ProcurementBudget,
  ProcurementKpis,
} from "@/lib/data/procurement";

interface Props {
  orders: PurchaseOrder[];
  suppliers: Supplier[];
  budgets: ProcurementBudget[];
  kpis: ProcurementKpis;
  error: string | null;
}

function BudgetProgress({
  label,
  current,
  total,
  color,
}: {
  label: string;
  current: number;
  total: number;
  color: string;
}) {
  const pct = total > 0 ? Math.min(100, (current / total) * 100) : 0;
  return (
    <div className="space-y-2">
      <div className="flex items-end justify-between">
        <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">
          {label}
        </span>
        <span className="text-[11px] manrope-bold">
          ${(current / 100000).toFixed(0)}k / ${(total / 100000).toFixed(0)}k
        </span>
      </div>
      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

const STATUS_NEXT: Record<string, string | null> = {
  pending_approval: "approved",
  approved: "ordered",
  ordered: "in_transit",
  in_transit: "delivered",
  delivered: null,
  cancelled: null,
};

const STATUS_LABELS: Record<string, string> = {
  pending_approval: "Pending Approval",
  approved: "Approved",
  ordered: "Ordered",
  in_transit: "In Transit",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export default function ProcurementClient({
  orders: initialOrders,
  suppliers,
  budgets,
  kpis,
  error,
}: Props) {
  const [orders, setOrders] = useState<PurchaseOrder[]>(initialOrders);
  const [activeTab, setActiveTab] = useState("orders");
  const [isPOModalOpen, setIsPOModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState<{ from: string; to: string }>({
    from: "",
    to: "",
  });
  const [submitting, setSubmitting] = useState(false);

  // New PO form state
  const [newPO, setNewPO] = useState({
    description: "",
    supplier_id: "",
    total_minor: "",
    priority: "medium",
    department: "",
    notes: "",
  });

  useEffect(() => {
    const handler = (e: CustomEvent<string>) => setSearchQuery(e.detail || "");
    window.addEventListener("jagamn-global-search", handler as EventListener);
    return () =>
      window.removeEventListener(
        "jagamn-global-search",
        handler as EventListener,
      );
  }, []);

  const filteredOrders = useMemo(
    () =>
      orders.filter((po) => {
        const q = searchQuery.toLowerCase();
        const matchSearch =
          !searchQuery ||
          po.description.toLowerCase().includes(q) ||
          (po.supplier_name || "").toLowerCase().includes(q) ||
          po.po_number.toLowerCase().includes(q) ||
          po.status.toLowerCase().includes(q);
        const matchPriority =
          priorityFilter === "all" || po.priority === priorityFilter;
        const d = new Date(po.created_at).getTime();
        const from = dateFilter.from
          ? new Date(dateFilter.from).getTime()
          : -Infinity;
        const to = dateFilter.to ? new Date(dateFilter.to).getTime() : Infinity;
        return matchSearch && matchPriority && d >= from && d <= to;
      }),
    [orders, searchQuery, priorityFilter, dateFilter],
  );

  const activeOrders = filteredOrders.filter(
    (o) => o.status !== "delivered" && o.status !== "cancelled",
  );
  const archivedOrders = filteredOrders.filter(
    (o) => o.status === "delivered" || o.status === "cancelled",
  );

  const handleAdvanceStatus = async (orderId: string, nextStatus: string) => {
    const res = await fetch(`/api/admin/procurement/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus }),
    });
    if (res.ok) {
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: nextStatus } : o)),
      );
    }
  };

  const handleCreatePO = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const res = await fetch("/api/admin/procurement/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        description: newPO.description,
        supplier_id: newPO.supplier_id || null,
        total_minor: newPO.total_minor
          ? Math.round(parseFloat(newPO.total_minor) * 100)
          : 0,
        priority: newPO.priority,
        department: newPO.department || null,
        notes: newPO.notes || null,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      // Reload orders
      const ordersRes = await fetch("/api/admin/procurement/orders");
      if (ordersRes.ok) {
        const ordersData = await ordersRes.json();
        setOrders(ordersData.orders || []);
      }
      setIsPOModalOpen(false);
      setNewPO({
        description: "",
        supplier_id: "",
        total_minor: "",
        priority: "medium",
        department: "",
        notes: "",
      });
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-20 animate-in fade-in duration-700">
      <div className="mx-auto pt-8 md:pt-12 space-y-10 md:space-y-12 px-4 md:px-0">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div className="space-y-2 text-center lg:text-left">
            <p className="text-[10px] font-black text-[#E8924A] uppercase tracking-[0.4em]">
              Supply Chain Management
            </p>
            <h1 className="manrope-bold text-3xl md:text-5xl text-[#0D2137] tracking-tight">
              Procurement Command
            </h1>
            {error && (
              <p className="text-red-500 text-sm font-medium">{error}</p>
            )}
          </div>
          <Dialog open={isPOModalOpen} onOpenChange={setIsPOModalOpen}>
            <DialogTrigger asChild>
              <Button className="h-14 px-8 bg-[#0D2137] hover:bg-[#0D2137]/90 text-white manrope-bold rounded-2xl shadow-xl flex items-center gap-3 transition-all hover:scale-[1.02]">
                <Plus className="w-5 h-5" /> Create Purchase Order
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[95vw] sm:max-w-[700px] p-0 border-0 overflow-hidden bg-white rounded-3xl max-h-[90vh] overflow-y-auto">
              <form onSubmit={handleCreatePO} className="p-8 md:p-12 space-y-8">
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-[#E8924A] uppercase tracking-[0.3em]">
                    Logistic Orchestration
                  </p>
                  <DialogTitle className="manrope-bold text-3xl text-[#0D2137]">
                    New Purchase Order
                  </DialogTitle>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2 md:col-span-2">
                    <Label className="text-[10px] font-black text-[#43474D] uppercase tracking-widest">
                      Item Description *
                    </Label>
                    <Input
                      required
                      value={newPO.description}
                      onChange={(e) =>
                        setNewPO({ ...newPO, description: e.target.value })
                      }
                      placeholder="e.g. Premium Silk Linens"
                      className="h-12 bg-[#F1F5F9] border-0 rounded-xl px-5 font-medium"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black text-[#43474D] uppercase tracking-widest">
                      Preferred Supplier
                    </Label>
                    <Select
                      value={newPO.supplier_id}
                      onValueChange={(v) =>
                        setNewPO({ ...newPO, supplier_id: v })
                      }
                    >
                      <SelectTrigger className="h-12 bg-[#F1F5F9] border-0 rounded-xl px-5 font-medium">
                        <SelectValue placeholder="Select Supplier" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-gray-100 shadow-2xl">
                        {suppliers.map((s) => (
                          <SelectItem key={s.id} value={s.id}>
                            {s.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black text-[#43474D] uppercase tracking-widest">
                      Total Amount (FCFA)
                    </Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={newPO.total_minor}
                      onChange={(e) =>
                        setNewPO({ ...newPO, total_minor: e.target.value })
                      }
                      placeholder="0.00"
                      className="h-12 bg-[#F1F5F9] border-0 rounded-xl px-5 font-medium"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black text-[#43474D] uppercase tracking-widest">
                      Priority
                    </Label>
                    <Select
                      value={newPO.priority}
                      onValueChange={(v) => setNewPO({ ...newPO, priority: v })}
                    >
                      <SelectTrigger className="h-12 bg-[#F1F5F9] border-0 rounded-xl px-5 font-medium">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black text-[#43474D] uppercase tracking-widest">
                      Department
                    </Label>
                    <Input
                      value={newPO.department}
                      onChange={(e) =>
                        setNewPO({ ...newPO, department: e.target.value })
                      }
                      placeholder="e.g. Kitchen"
                      className="h-12 bg-[#F1F5F9] border-0 rounded-xl px-5 font-medium"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-end gap-6 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsPOModalOpen(false)}
                    className="text-[11px] font-black text-slate-400 uppercase tracking-widest hover:text-red-500 transition-all"
                  >
                    Discard Draft
                  </button>
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="h-14 px-10 bg-[#0D2137] text-white manrope-bold rounded-xl shadow-xl hover:scale-[1.02] transition-all"
                  >
                    {submitting ? "Creating…" : "Authorize Requisition"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {[
            {
              label: "Pending Approval",
              value: String(kpis.pendingApproval),
              icon: <Clock className="w-5 h-5" />,
              alert: kpis.pendingApproval > 0,
            },
            {
              label: "In Transit",
              value: String(kpis.inTransit),
              icon: <Truck className="w-5 h-5" />,
              alert: false,
            },
            {
              label: "Delivered This Month",
              value: String(kpis.deliveredThisMonth),
              icon: <CheckCircle2 className="w-5 h-5" />,
              alert: false,
            },
            {
              label: "Total Spend",
              value: `$${(kpis.totalSpendMinor / 100).toLocaleString("en-US", { maximumFractionDigits: 0 })}`,
              icon: <ShoppingCart className="w-5 h-5" />,
              alert: false,
            },
          ].map((card) => (
            <div
              key={card.label}
              className={cn(
                "bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all group border-l-4",
                card.alert ? "border-l-red-500" : "border-l-[#0D2137]",
              )}
            >
              <div className="flex items-center justify-between mb-8">
                <div className="p-3 bg-[#F1F5F9] rounded-2xl group-hover:bg-[#0D2137] group-hover:text-white transition-colors">
                  {card.icon}
                </div>
              </div>
              <p className="text-[10px] font-black text-[#43474D] uppercase tracking-widest">
                {card.label}
              </p>
              <h3 className="manrope-bold text-2xl md:text-3xl text-[#0D2137] tracking-tight">
                {card.value}
              </h3>
            </div>
          ))}
        </div>

        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8 space-y-8">
            {/* Tab + Filters */}
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
              <div className="flex flex-wrap items-center gap-4 w-full xl:w-auto">
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
                    <SelectItem value="low">Low</SelectItem>
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
                    className="bg-transparent text-[10px] font-bold text-[#0D2137] outline-none w-28"
                  />
                  <ArrowRight className="w-3 h-3 text-gray-300 shrink-0" />
                  <input
                    type="date"
                    value={dateFilter.to}
                    onChange={(e) =>
                      setDateFilter({ ...dateFilter, to: e.target.value })
                    }
                    className="bg-transparent text-[10px] font-bold text-[#0D2137] outline-none w-28"
                  />
                  {(dateFilter.from || dateFilter.to) && (
                    <button onClick={() => setDateFilter({ from: "", to: "" })}>
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
                    className="h-12 bg-white border-gray-100 rounded-xl pl-12 text-[10px] font-black uppercase tracking-widest shadow-sm"
                  />
                </div>
              </div>
            </div>

            {/* Orders list */}
            <div className="space-y-4">
              {(activeTab === "orders" ? activeOrders : archivedOrders).map(
                (po) => {
                  const nextStatus = STATUS_NEXT[po.status];
                  return (
                    <div
                      key={po.id}
                      className="bg-white p-6 rounded-[1.5rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden"
                    >
                      <div className="flex items-center gap-6">
                        <div
                          className={cn(
                            "w-14 h-14 rounded-2xl flex items-center justify-center border-2",
                            po.status === "delivered"
                              ? "bg-green-50 border-green-100 text-green-600"
                              : po.status === "in_transit"
                                ? "bg-blue-50 border-blue-100 text-blue-600"
                                : po.status === "cancelled"
                                  ? "bg-gray-50 border-gray-100 text-gray-400"
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
                              {po.description}
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
                              {po.priority}
                            </Badge>
                          </div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            {po.po_number} · {po.supplier_name ?? "No supplier"}{" "}
                            · {STATUS_LABELS[po.status] ?? po.status}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
                        <div className="text-right">
                          <p className="manrope-bold text-lg text-[#0D2137]">
                            ${(po.total_minor / 100).toLocaleString("en-US")}
                          </p>
                          <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                            {new Date(po.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        {nextStatus && (
                          <button
                            onClick={() =>
                              handleAdvanceStatus(po.id, nextStatus)
                            }
                            className="h-10 px-4 rounded-xl bg-[#0D2137] text-white text-[10px] font-black uppercase tracking-widest hover:bg-[#0D2137]/80 transition-all"
                          >
                            → {STATUS_LABELS[nextStatus]}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                },
              )}
              {(activeTab === "orders" ? activeOrders : archivedOrders)
                .length === 0 && (
                <div className="bg-white p-20 rounded-[2rem] border border-dashed border-gray-200 text-center text-slate-400 manrope-bold italic">
                  No logistical records found matching your parameters.
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-4 space-y-10">
            {/* Suppliers */}
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
                {suppliers.slice(0, 5).map((sup) => (
                  <div
                    key={sup.id}
                    className="flex items-center justify-between group cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-[#F8FAFC] flex items-center justify-center text-slate-400 group-hover:bg-[#0D2137] group-hover:text-white transition-all">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <div>
                        <h5 className="manrope-bold text-sm text-[#0D2137]">
                          {sup.name}
                        </h5>
                        <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                          {sup.category}
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-black text-[#E8924A]">
                      {sup.rating > 0 ? `${sup.rating} ★` : "—"}
                    </span>
                  </div>
                ))}
                {suppliers.length === 0 && (
                  <p className="text-sm text-slate-400 italic">
                    No suppliers yet.
                  </p>
                )}
              </div>
            </div>

            {/* Budget bars */}
            <div className="bg-[#0D2137] rounded-3xl p-8 text-white shadow-2xl space-y-8 relative overflow-hidden">
              <h3 className="manrope-bold text-lg">Supply Budget</h3>
              <div className="space-y-6 relative z-10">
                {budgets.length > 0 ? (
                  budgets.map((b) => (
                    <BudgetProgress
                      key={b.id}
                      label={b.department}
                      current={
                        kpis.totalSpendMinor / Math.max(budgets.length, 1)
                      }
                      total={b.budget_minor}
                      color="#E8924A"
                    />
                  ))
                ) : (
                  <>
                    <BudgetProgress
                      label="Food & Beverage"
                      current={0}
                      total={12000000}
                      color="#E8924A"
                    />
                    <BudgetProgress
                      label="Housekeeping"
                      current={0}
                      total={5000000}
                      color="#1D61FF"
                    />
                  </>
                )}
              </div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
