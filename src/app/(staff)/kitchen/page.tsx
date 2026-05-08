"use client";

import React, { useState } from "react";
import {
  KITCHEN_ORDERS,
  EFFICIENCY_DATA,
  type KitchenOrder,
} from "@/lib/kitchen-mock-data";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertTriangle,
  Zap,
  CheckCircle2,
  Users,
  Clock,
  UtensilsCrossed,
  Timer,
  X,
  User,
  Package,
} from "lucide-react";
import { BarChart, Bar, ResponsiveContainer, Tooltip, Cell } from "recharts";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import Image from "next/image";

// ── Kanban column config ────────────────────────────────────────────────────
const COLUMNS = [
  { id: "new", label: "NEW ORDERS" },
  { id: "pending_stock", label: "PENDING STOCK" },
  { id: "in_preparation", label: "IN PREPARATION" },
  { id: "ready", label: "READY FOR DELIVERY" },
] as const;

// ── Order Card ───────────────────────────────────────────────────────────────
function OrderCard({
  order,
  onClick,
}: {
  order: KitchenOrder;
  onClick: (order: KitchenOrder) => void;
}) {
  if (order.status === "new") {
    return (
      <div
        onClick={() => onClick(order)}
        className="bg-white rounded-xl border border-gray-100 border-l-4 border-l-[#00152A] shadow-sm p-5 space-y-4 cursor-pointer hover:shadow-md transition-all"
      >
        <div className="flex justify-between items-start">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            ID: {order.displayId}
          </span>
          <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
            {order.timeAgo}
          </span>
        </div>
        <div>
          <h3 className="font-bold text-[#00152A] text-lg leading-tight">
            {order.dish}
          </h3>
          <p className="text-sm text-gray-500 mt-1">{order.modifiers}</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <Users className="w-3.5 h-3.5" />
          <span>
            {order.location && `${order.location} • `}Server: {order.server}
          </span>
        </div>
        <Button
          className="w-full h-10 rounded-lg shadow-sm font-bold"
          style={{ backgroundColor: "#BA722E", color: "#412000" }}
        >
          Acknowledge
        </Button>
      </div>
    );
  }

  if (order.status === "pending_stock") {
    return (
      <div
        onClick={() => onClick(order)}
        className="bg-white rounded-xl border border-red-200 border-l-4 border-l-red-400 shadow-sm p-5 space-y-4 cursor-pointer hover:shadow-md transition-all"
      >
        <div className="flex justify-between items-center">
          <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" />
            ACTION REQUIRED
          </span>
        </div>
        <div>
          <h3 className="font-bold text-[#00152A] text-lg">{order.dish}</h3>
          <p className="text-sm text-gray-500 mt-1">{order.modifiers}</p>
        </div>
        {order.currentStock !== undefined && (
          <div className="space-y-2">
            <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
              <span className="text-red-400">CURRENT STOCK</span>
              <span className="text-[#00152A]">
                {order.currentStock} {order.stockUnit}
              </span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-red-400 rounded-full"
                style={{ width: `${(order.currentStock / 10) * 100}%` }}
              />
            </div>
          </div>
        )}
        <Button className="w-full bg-[#00152A] hover:bg-[#0A2038] text-white font-bold h-10 rounded-lg">
          Submit Stock Request
        </Button>
      </div>
    );
  }

  if (order.status === "in_preparation") {
    return (
      <div
        onClick={() => onClick(order)}
        className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4 cursor-pointer hover:shadow-md transition-all"
      >
        <div className="flex justify-between items-start">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            ID: {order.displayId}
          </span>
          {order.stockConfirmed && (
            <Badge className="bg-[#E6F4EA] text-[#1B7F34] border-0 text-[9px] font-bold uppercase tracking-widest flex items-center gap-1 px-2 py-0.5">
              <CheckCircle2 className="w-3 h-3" />
              Stock Confirmed
            </Badge>
          )}
        </div>
        <div>
          <h3 className="font-bold text-[#00152A] text-lg">{order.dish}</h3>
          <p className="text-sm text-gray-500 mt-1">{order.modifiers}</p>
        </div>
        {order.prepProgress !== undefined && (
          <div className="space-y-2">
            <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-gray-400">
              <span>PREP PROGRESS</span>
              <span className="text-[#00152A]">{order.prepProgress}%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#00152A] rounded-full transition-all duration-500"
                style={{ width: `${order.prepProgress}%` }}
              />
            </div>
          </div>
        )}
        <Button
          variant="outline"
          className="w-full border-gray-200 text-[#00152A] font-bold h-10 rounded-lg hover:bg-gray-50"
        >
          Mark as Ready
        </Button>
      </div>
    );
  }

  return null;
}

// ── Empty Column State ───────────────────────────────────────────────────────
function EmptyColumn() {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-300">
      <UtensilsCrossed className="w-10 h-10" />
      <p className="text-[10px] font-bold uppercase tracking-widest text-center leading-relaxed">
        No meals waiting
        <br />
        to be served
      </p>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function KitchenOrdersPage() {
  const [showAlert, setShowAlert] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<KitchenOrder | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOrderClick = (order: KitchenOrder) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const getColumnOrders = (status: string) =>
    KITCHEN_ORDERS.filter((o) => o.status === status);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
      {/* ── Page Header ─────────────────────── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="manrope-bold text-4xl text-[#00152A]">Orders</h1>
          <p className="text-gray-500 text-sm mt-1">
            Live overview of Jagamn Palace culinary operations
          </p>
        </div>

        {/* New Order Alert Toast */}
        {showAlert && (
          <div className="flex items-center gap-3 bg-[#FFF4E8] border border-[#BA722E]/30 rounded-xl px-5 py-3 shadow-sm animate-in slide-in-from-right-4 duration-300">
            <div className="w-7 h-7 rounded-md bg-[#BA722E] flex items-center justify-center flex-shrink-0">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-[9px] font-bold text-[#BA722E] uppercase tracking-widest">
                New Order Alert
              </p>
              <p className="text-sm font-bold text-[#00152A]">
                Order #JGM-4092 Received
              </p>
            </div>
            <button
              onClick={() => setShowAlert(false)}
              className="ml-2 text-gray-300 hover:text-gray-500 text-xs"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {/* ── Kanban Board ────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {COLUMNS.map((col) => {
          const orders = getColumnOrders(col.id);
          return (
            <div key={col.id} className="space-y-4">
              {/* Column Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    {col.label}
                  </span>
                  <span
                    className={cn(
                      "w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center",
                      orders.length > 0
                        ? "bg-[#00152A] text-white"
                        : "bg-gray-100 text-gray-400",
                    )}
                  >
                    {orders.length}
                  </span>
                </div>
                <button className="text-gray-300 hover:text-gray-500 text-lg leading-none pb-1">
                  ···
                </button>
              </div>

              {/* Cards */}
              <div className="space-y-4 min-h-[200px]">
                {orders.length > 0 ? (
                  orders.map((order, i) => (
                    <OrderCard
                      key={order.id}
                      order={order}
                      onClick={handleOrderClick}
                    />
                  ))
                ) : (
                  <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
                    <EmptyColumn />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Bottom Stats Row ─────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Avg Prep Time */}
        <div className="bg-[#00152A] rounded-xl p-6 relative overflow-hidden">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">
            Avg. Preparation Time
          </p>
          <div className="flex items-end gap-1">
            <span className="manrope-bold text-6xl text-white leading-none">18</span>
            <span className="text-gray-400 text-sm font-medium mb-2">a in</span>
          </div>
          {/* Decorative clock icon — bottom right */}
          <Timer
            className="absolute bottom-4 right-4 w-16 h-16 text-white/10"
            strokeWidth={1}
          />
        </div>

        {/* Critical Stock Alerts */}
        <div className="bg-white rounded-xl border-y border-r border-gray-100 border-l-4 shadow-sm p-6" style={{ borderLeftColor: "#FFB77A" }}>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">
            Critical Stock Alerts
          </p>
          <div className="flex items-end gap-4">
            <span className="manrope-bold text-6xl text-[#00152A] leading-none">03</span>
            <span
              className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-sm mb-1.5"
              style={{ color: "#EA580C", backgroundColor: "#FFF4E8" }}
            >
              Action Required
            </span>
          </div>
        </div>

        {/* Daily Efficiency */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
              Daily Efficiency
            </p>
            <h3 className="manrope-bold text-xl text-[#00152A]">
              High Operational Flow
            </h3>
            <p className="text-xs text-gray-400 mt-1">
              Kitchen performance is 12% above average for breakfast shift
            </p>
          </div>
          <div className="w-28 h-16 flex-shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={EFFICIENCY_DATA} barSize={7} barGap={2}>
                <Bar dataKey="orders" radius={[3, 3, 0, 0]} label={false}>
                  {EFFICIENCY_DATA.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={index % 2 === 0 ? "#00152A" : "#BA722E"}
                    />
                  ))}
                </Bar>
                <Tooltip
                  contentStyle={{
                    fontSize: 10,
                    border: "none",
                    borderRadius: 8,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  }}
                  cursor={{ fill: "transparent" }}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <OrderDetailModal
        order={selectedOrder}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}

// ── Order Detail Modal ────────────────────────────────────────────────────────
function OrderDetailModal({
  order,
  isOpen,
  onClose,
}: {
  order: KitchenOrder | null;
  isOpen: boolean;
  onClose: () => void;
}) {
  if (!order) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        showCloseButton={false}
        className="sm:max-w-[900px] w-[95vw] p-0 overflow-hidden border-0 bg-transparent shadow-none ring-0 focus:ring-0 focus-visible:ring-0"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-[60] p-2 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full transition-all text-white shadow-lg border border-white/10 group"
        >
          <X className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
        </button>
        <div className="flex h-full max-h-[600px] min-h-[500px] w-full">
          {/* Left Side: Order Info */}
          <div className="flex-1 bg-white p-10 flex flex-col relative">
            {/* Header */}
            <div className="space-y-6 flex-1 overflow-y-auto pr-2 custom-scrollbar">
              <div className="flex items-center gap-3">
                <span className="bg-[#FFF4E8] text-[#EA580C] text-[10px] font-bold px-3 py-1 rounded-full tracking-widest uppercase">
                  Urgent
                </span>
                <span className="text-gray-400 text-sm font-medium">
                  12:45 PM
                </span>
              </div>

              <DialogTitle className="manrope-bold text-5xl text-[#00152A]">
                #{order.displayId}
              </DialogTitle>
              <DialogDescription className="sr-only">
                Detailed view for order #{order.displayId} including guest information, dish details, and preparation notes.
              </DialogDescription>

              {/* Guest Card */}
              <div className="flex items-center gap-4 py-6 border-y border-gray-50">
                <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center overflow-hidden">
                  <User className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">
                    Guest Detail
                  </p>
                  <h3 className="manrope-bold text-xl text-[#00152A]">
                    Sterling
                  </h3>
                  <p className="text-xs text-gray-500">
                    Room 402 • <span className="text-blue-500 font-bold">Diamond Member</span>
                  </p>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-6 pt-4">
                <div className="flex items-start justify-between group">
                  <div className="flex gap-4">
                    <span className="manrope-bold text-xl text-gray-200">01</span>
                    <div>
                      <h4 className="manrope-bold text-xl text-[#00152A]">{order.dish}</h4>
                      <p className="text-sm text-[#BA722E] flex items-center gap-1.5 mt-1 font-medium">
                        <Clock className="w-3.5 h-3.5" />
                        Medium-Rare
                      </p>
                    </div>
                  </div>
                  <span className="manrope-bold text-lg text-[#00152A]">1x</span>
                </div>

                <div className="flex items-start justify-between group">
                  <div className="flex gap-4">
                    <span className="manrope-bold text-xl text-gray-200">02</span>
                    <div>
                      <h4 className="manrope-bold text-xl text-[#00152A]">Truffle Risotto</h4>
                      <p className="text-sm text-red-500 flex items-center gap-1.5 mt-1 font-medium">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        NO MUSHROOMS
                      </p>
                    </div>
                  </div>
                  <span className="manrope-bold text-lg text-[#00152A]">1x</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3 mt-8">
              {order.status === "in_preparation" ? (
                <>
                  <Button className="w-full bg-[#1B7F34] hover:bg-[#156329] text-white h-14 rounded-xl font-bold text-base shadow-lg flex items-center justify-center gap-3 transition-all active:scale-[0.98]">
                    <CheckCircle2 className="w-5 h-5" />
                    Mark as Ready for Service
                  </Button>
                  <Button variant="ghost" className="w-full text-gray-400 hover:text-red-500 hover:bg-red-50 h-10 rounded-lg text-xs font-bold uppercase tracking-widest">
                    Report Preparation Delay
                  </Button>
                </>
              ) : (
                <>
                  <Button className="w-full bg-[#EA580C] hover:bg-[#D4500A] text-white h-14 rounded-xl font-bold text-base shadow-lg flex items-center justify-center gap-3 transition-all active:scale-[0.98]">
                    <Package className="w-5 h-5" />
                    Submit Stock Request to Store Keeper
                  </Button>
                  <Button className="w-full bg-[#00152A] hover:bg-[#0A2038] text-white h-14 rounded-xl font-bold text-base shadow-lg flex items-center justify-center gap-3 transition-all active:scale-[0.98]">
                    <CheckCircle2 className="w-5 h-5" />
                    Acknowledge Order
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Right Side: Image & Notes */}
          <div className="w-[380px] relative hidden md:block">
            <Image
              src={
                order.dish.toLowerCase().includes("wagyu") ? "/images/food1.png" :
                order.dish.toLowerCase().includes("sole") ? "/images/food4.png" :
                order.dish.toLowerCase().includes("scallops") ? "/images/food2.png" :
                "/images/food3.png"
              }
              alt={order.dish}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/60" />
            
            {/* Preparation Note Card */}
            <div className="absolute bottom-8 left-8 right-8 bg-white/95 backdrop-blur-sm p-6 rounded-2xl shadow-2xl border border-white/20">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">
                Preparation Note
              </p>
              <p className="text-sm text-[#00152A] leading-relaxed italic font-medium">
                "The guest requested the {order.dish} with {order.modifiers.toLowerCase()}. Please ensure all preferences are strictly followed for this {order.id.startsWith("jgm-4") ? "VIP" : "Standard"} order."
              </p>
              <div className="mt-4 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#BA722E] animate-pulse" />
                <span className="text-[9px] font-bold text-[#BA722E] uppercase tracking-widest">
                  Kitchen Live View
                </span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
