"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase-client";
import type { KitchenOrder, KitchenStats } from "@/lib/data/kitchen";
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
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import Image from "next/image";

// ── Kanban column config ────────────────────────────────────────────────────
const COLUMNS = [
  { id: "new", label: "NEW ORDERS" },
  { id: "pending_stock", label: "PENDING STOCK" },
  { id: "in_preparation", label: "IN PREPARATION" },
  { id: "ready", label: "READY FOR DELIVERY" },
] as const;

// Mock efficiency data for the chart
const EFFICIENCY_DATA = [
  { hour: "8am", orders: 6 },
  { hour: "9am", orders: 9 },
  { hour: "10am", orders: 7 },
  { hour: "11am", orders: 12 },
  { hour: "12pm", orders: 15 },
  { hour: "1pm", orders: 18 },
];

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
          {order.modifiers && (
            <p className="text-sm text-gray-500 mt-1">{order.modifiers}</p>
          )}
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
          {order.modifiers && (
            <p className="text-sm text-gray-500 mt-1">{order.modifiers}</p>
          )}
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
        {order.stockAlert && (
          <p className="text-xs font-semibold text-red-500">
            Stock unavailable: {order.stockAlert}
          </p>
        )}
        <Button
          disabled
          className="w-full bg-gray-100 text-gray-400 hover:bg-gray-100 font-bold h-10 rounded-lg cursor-not-allowed"
        >
          Awaiting Store Keeper Response
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
          {order.modifiers && (
            <p className="text-sm text-gray-500 mt-1">{order.modifiers}</p>
          )}
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

// ── Main Component ────────────────────────────────────────────────────────────
export default function KitchenOrdersClient({
  orders: initialOrders,
  stats,
}: {
  orders: KitchenOrder[];
  stats: KitchenStats;
}) {
  const [orders, setOrders] = useState<KitchenOrder[]>(initialOrders);
  const [showAlert, setShowAlert] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<KitchenOrder | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Realtime subscription for dining_orders and notifications
  useEffect(() => {
    const supabase = createClient();

    // Subscribe to dining_orders changes
    const ordersChannel = supabase
      .channel("kitchen-orders")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "dining_orders",
          filter: "status=in.(placed,preparing,ready)",
        },
        async () => {
          // Refetch orders when any change occurs
          const res = await fetch("/api/kitchen/orders");
          if (res.ok) {
            const data = await res.json();
            setOrders(data.orders);
            setShowAlert(true);
          }
        },
      )
      .subscribe();

    // Subscribe to notifications for kitchen role
    const notificationsChannel = supabase
      .channel("kitchen-notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: "role=eq.kitchen",
        },
        async () => {
          // Refetch orders when new notification arrives
          const res = await fetch("/api/kitchen/orders");
          if (res.ok) {
            const data = await res.json();
            setOrders(data.orders);
            setShowAlert(true);
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(ordersChannel);
      supabase.removeChannel(notificationsChannel);
    };
  }, []);

  const handleOrderClick = (order: KitchenOrder) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleAcknowledgeOrder = async (orderId: string) => {
    try {
      const res = await fetch(`/api/kitchen/orders/${orderId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "preparing" }),
      });

      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) =>
            o.id === orderId ? { ...o, status: "in_preparation" as const } : o,
          ),
        );
        setSelectedOrder((prev) =>
          prev && prev.id === orderId
            ? { ...prev, status: "in_preparation" as const }
            : prev,
        );
      }
    } catch (error) {
      console.error("Failed to acknowledge order:", error);
    }
  };

  const handleMarkReady = async (orderId: string) => {
    try {
      const res = await fetch(`/api/kitchen/orders/${orderId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "ready" }),
      });

      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) =>
            o.id === orderId ? { ...o, status: "ready" as const } : o,
          ),
        );
        setSelectedOrder((prev) =>
          prev && prev.id === orderId
            ? { ...prev, status: "ready" as const }
            : prev,
        );
        setIsModalOpen(false);
      }
    } catch (error) {
      console.error("Failed to mark order ready:", error);
    }
  };

  const getColumnOrders = (status: string) =>
    orders.filter((o) => o.status === status);

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
        {showAlert && orders.length > 0 && (
          <div className="flex items-center gap-3 bg-[#FFF4E8] border border-[#BA722E]/30 rounded-xl px-5 py-3 shadow-sm animate-in slide-in-from-right-4 duration-300">
            <div className="w-7 h-7 rounded-md bg-[#BA722E] flex items-center justify-center flex-shrink-0">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-[9px] font-bold text-[#BA722E] uppercase tracking-widest">
                New Order Alert
              </p>
              <p className="text-sm font-bold text-[#00152A]">
                Order {orders[0]?.displayId} Received
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
          const colOrders = getColumnOrders(col.id);
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
                      colOrders.length > 0
                        ? "bg-[#00152A] text-white"
                        : "bg-gray-100 text-gray-400",
                    )}
                  >
                    {colOrders.length}
                  </span>
                </div>
                <button className="text-gray-300 hover:text-gray-500 text-lg leading-none pb-1">
                  ···
                </button>
              </div>

              {/* Cards */}
              <div className="space-y-4 min-h-[200px]">
                {colOrders.length > 0 ? (
                  colOrders.map((order) => (
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
            <span className="manrope-bold text-6xl text-white leading-none">
              {stats.avgPrepTime}
            </span>
            <span className="text-gray-400 text-sm font-medium mb-2">min</span>
          </div>
          <Timer
            className="absolute bottom-4 right-4 w-16 h-16 text-white/10"
            strokeWidth={1}
          />
        </div>

        {/* Critical Stock Alerts */}
        <div
          className="bg-white rounded-xl border-y border-r border-gray-100 border-l-4 shadow-sm p-6"
          style={{ borderLeftColor: "#FFB77A" }}
        >
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">
            Critical Stock Alerts
          </p>
          <div className="flex items-end gap-4">
            <span className="manrope-bold text-6xl text-[#00152A] leading-none">
              {stats.lowStockAlerts.toString().padStart(2, "0")}
            </span>
            {stats.lowStockAlerts > 0 && (
              <span
                className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-sm mb-1.5"
                style={{ color: "#EA580C", backgroundColor: "#FFF4E8" }}
              >
                Action Required
              </span>
            )}
          </div>
        </div>

        {/* Daily Efficiency */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
              Daily Efficiency
            </p>
            <h3 className="manrope-bold text-xl text-[#00152A]">
              {stats.efficiencyMessage}
            </h3>
            <p className="text-xs text-gray-400 mt-1">
              {stats.todayOrderVolume} orders processed today
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
        onAcknowledgeOrder={handleAcknowledgeOrder}
        onMarkReady={handleMarkReady}
      />
    </div>
  );
}

// ── Order Detail Modal ────────────────────────────────────────────────────────
function OrderDetailModal({
  order,
  isOpen,
  onClose,
  onAcknowledgeOrder,
  onMarkReady,
}: {
  order: KitchenOrder | null;
  isOpen: boolean;
  onClose: () => void;
  onAcknowledgeOrder: (orderId: string) => void;
  onMarkReady: (orderId: string) => void;
}) {
  const [showStockRequest, setShowStockRequest] = useState(false);
  const [stockItemName, setStockItemName] = useState("");
  const [stockQuantity, setStockQuantity] = useState("");
  const [stockNotes, setStockNotes] = useState("");
  const [isSubmittingStock, setIsSubmittingStock] = useState(false);

  if (!order) return null;

  const handleRequestStock = async () => {
    if (!stockItemName || !stockQuantity) return;

    setIsSubmittingStock(true);
    try {
      const res = await fetch("/api/kitchen/inventory-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dining_order_id: order.id,
          item_name: stockItemName,
          quantity: parseInt(stockQuantity),
          notes: stockNotes,
        }),
      });

      if (res.ok) {
        setShowStockRequest(false);
        setStockItemName("");
        setStockQuantity("");
        setStockNotes("");
        // Show success feedback
        alert("Stock request sent to storekeeper");
      }
    } catch (error) {
      console.error("Failed to request stock:", error);
      alert("Failed to request stock");
    } finally {
      setIsSubmittingStock(false);
    }
  };

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
            <div className="space-y-6 flex-1 overflow-y-auto pr-2 custom-scrollbar">
              <div className="flex items-center gap-3">
                <span className="bg-[#FFF4E8] text-[#EA580C] text-[10px] font-bold px-3 py-1 rounded-full tracking-widest uppercase">
                  {order.status === "new" ? "New" : "In Progress"}
                </span>
                <span className="text-gray-400 text-sm font-medium">
                  {order.timeAgo}
                </span>
              </div>

              <DialogTitle className="manrope-bold text-5xl text-[#00152A]">
                #{order.displayId}
              </DialogTitle>
              <DialogDescription className="sr-only">
                Detailed view for order #{order.displayId}
              </DialogDescription>

              {/* Guest Card */}
              {order.guestName && (
                <div className="flex items-center gap-4 py-6 border-y border-gray-50">
                  <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center overflow-hidden">
                    <User className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">
                      Guest Detail
                    </p>
                    <h3 className="manrope-bold text-xl text-[#00152A]">
                      {order.guestName}
                    </h3>
                    {order.guestRoom && (
                      <p className="text-xs text-gray-500">
                        Room {order.guestRoom}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Items List */}
              <div className="space-y-6 pt-4">
                {order.items && order.items.length > 0 ? (
                  order.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-start justify-between group"
                    >
                      <div className="flex gap-4">
                        <span className="manrope-bold text-xl text-gray-200">
                          {(idx + 1).toString().padStart(2, "0")}
                        </span>
                        <div>
                          <h4 className="manrope-bold text-xl text-[#00152A]">
                            {item.name}
                          </h4>
                        </div>
                      </div>
                      <span className="manrope-bold text-lg text-[#00152A]">
                        {item.quantity}x
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-gray-500">{order.dish}</div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3 mt-8">
              {order.status === "in_preparation" ? (
                <>
                  <Button
                    onClick={() => onMarkReady(order.id)}
                    className="w-full bg-[#1B7F34] hover:bg-[#156329] text-white h-14 rounded-xl font-bold text-base shadow-lg flex items-center justify-center gap-3 transition-all active:scale-[0.98]"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    Mark as Ready for Service
                  </Button>
                  <Button
                    onClick={() => setShowStockRequest(!showStockRequest)}
                    variant="outline"
                    className="w-full h-12 rounded-xl font-bold text-sm"
                  >
                    <Package className="w-4 h-4 mr-2" />
                    Request Stock
                  </Button>

                  {/* Stock Request Form */}
                  {showStockRequest && (
                    <div className="bg-gray-50 rounded-xl p-6 space-y-4 animate-in slide-in-from-top-2 duration-300">
                      <h4 className="font-bold text-sm text-[#00152A]">
                        Request Stock Item
                      </h4>
                      <div className="space-y-3">
                        <div>
                          <label className="text-xs text-gray-500 font-medium">
                            Item Name
                          </label>
                          <input
                            type="text"
                            value={stockItemName}
                            onChange={(e) => setStockItemName(e.target.value)}
                            placeholder="e.g., Saffron, Wagyu Beef"
                            className="w-full mt-1 px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#00152A] focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-500 font-medium">
                            Quantity
                          </label>
                          <input
                            type="number"
                            value={stockQuantity}
                            onChange={(e) => setStockQuantity(e.target.value)}
                            placeholder="e.g., 5"
                            className="w-full mt-1 px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#00152A] focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-500 font-medium">
                            Notes (optional)
                          </label>
                          <textarea
                            value={stockNotes}
                            onChange={(e) => setStockNotes(e.target.value)}
                            placeholder="Additional details..."
                            rows={2}
                            className="w-full mt-1 px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#00152A] focus:border-transparent resize-none"
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={handleRequestStock}
                            disabled={
                              !stockItemName ||
                              !stockQuantity ||
                              isSubmittingStock
                            }
                            className="flex-1 bg-[#00152A] hover:bg-[#0A2038] text-white h-10 rounded-lg font-bold text-sm"
                          >
                            {isSubmittingStock ? "Sending..." : "Send Request"}
                          </Button>
                          <Button
                            onClick={() => setShowStockRequest(false)}
                            variant="outline"
                            className="px-6 h-10 rounded-lg font-bold text-sm"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 italic">
                        Note: Order can proceed to ready/delivered without
                        waiting for stock fulfillment.
                      </p>
                    </div>
                  )}
                </>
              ) : order.status === "new" ? (
                <Button
                  onClick={() => onAcknowledgeOrder(order.id)}
                  className="w-full bg-[#00152A] hover:bg-[#0A2038] text-white h-14 rounded-xl font-bold text-base shadow-lg flex items-center justify-center gap-3 transition-all active:scale-[0.98]"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  Acknowledge Order
                </Button>
              ) : (
                <Button
                  onClick={onClose}
                  variant="ghost"
                  className="w-full text-gray-400 hover:text-gray-600 h-10 rounded-lg text-xs font-bold uppercase tracking-widest"
                >
                  Close
                </Button>
              )}
            </div>
          </div>

          {/* Right Side: Image */}
          <div className="w-[380px] relative hidden md:block">
            <Image
              src="/images/food1.png"
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
                {order.modifiers ||
                  "Please ensure all preferences are strictly followed for this order."}
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
