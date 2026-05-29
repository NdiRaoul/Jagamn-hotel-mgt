"use client";

import React from "react";
import Image from "next/image";
import { INVENTORY_TASKS, VERIFICATION_LOG } from "@/lib/kitchen-mock-data";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  CheckCircle2,
  AlertTriangle,
  Timer,
  RefreshCw,
  Cloud,
  ChevronRight,
  UtensilsCrossed,
  Bell,
} from "lucide-react";

// ── Stock Confirmed Card ────────────────────────────────────────────────────
function ConfirmedCard({ task }: { task: (typeof INVENTORY_TASKS)[0] }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 border-l-4 border-l-[#1B7F34] shadow-sm p-6 space-y-5">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
          Order {task.orderId}
        </span>
        <Badge className="bg-[#E6F4EA] text-[#1B7F34] border-0 text-[9px] font-bold flex items-center gap-1 px-2 py-0.5">
          <CheckCircle2 className="w-3 h-3" />
          Stock Confirmed
        </Badge>
      </div>
      <h3 className="manrope-bold text-2xl text-[#00152A]">{task.dish}</h3>
      <div className="space-y-2">
        {task.items?.map((item, i) => (
          <div key={i} className="flex justify-between text-sm">
            <span className="text-gray-600">{item.name}</span>
            <span className="font-bold text-[#00152A]">{item.amount}</span>
          </div>
        ))}
      </div>
      <Button className="w-full bg-[#00152A] hover:bg-[#0A2038] text-white font-bold h-12 rounded-xl flex items-center gap-2 shadow-md">
        <UtensilsCrossed className="w-4 h-4" />
        Begin Preparation
      </Button>
    </div>
  );
}

// ── Stock Insufficient Card ─────────────────────────────────────────────────
function InsufficientCard({ task, onStockUnavailable }: { task: (typeof INVENTORY_TASKS)[0]; onStockUnavailable?: (orderId: string, note?: string) => void; }) {
  return (
    <div className="bg-white rounded-xl border shadow-sm p-6 space-y-5" style={{ borderLeftColor: "#EA580C", borderLeftWidth: 4, borderColor: "#fde8d8" }}>
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
          Order {task.orderId}
        </span>
        <Badge className="border-0 text-[9px] font-bold flex items-center gap-1 px-2 py-0.5" style={{ backgroundColor: "#FEE9E7", color: "#B91C1C" }}>
          <AlertTriangle className="w-3 h-3" />
          Stock Insufficient
        </Badge>
      </div>
      <h3 className="manrope-bold text-2xl text-[#00152A]">{task.dish}</h3>
      <div className="space-y-2">
        {task.items?.map((item, i) => (
          <div key={i} className="flex justify-between text-sm">
            <span className="text-gray-600">{item.name}</span>
            <span
              className={cn(
                "font-bold",
                item.available ? "text-[#1B7F34]" : "text-red-500"
              )}
            >
              {item.available ? "Available" : "Out of Stock"}
            </span>
          </div>
        ))}
      </div>
      {task.storeKeeperNote && (
        <div className="rounded-lg p-4" style={{ backgroundColor: "#FEF2F0" }}>
          <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: "#EA580C" }}>
            Store Keeper Note:
          </p>
          <p className="text-sm font-medium italic" style={{ color: "#EA580C" }}>{task.storeKeeperNote}</p>
        </div>
      )}
      <div className="grid grid-cols-2 gap-3">
        <Button
          variant="outline"
          className="border-gray-200 text-[#00152A] font-bold h-10 rounded-lg text-sm hover:bg-gray-50"
        >
          Change Menu
        </Button>
        <Button
          onClick={() => onStockUnavailable?.(task.orderId, task.storeKeeperNote)}
          className="text-white font-bold h-10 rounded-lg text-sm"
          style={{ backgroundColor: "#EA580C" }}
        >
          Notify Guest
        </Button>
      </div>
    </div>
  );
}

// ── Awaiting Card ───────────────────────────────────────────────────────────
function AwaitingCard() {
  return (
    <div className="bg-white rounded-xl border-2 border-dashed border-gray-200 shadow-sm p-6 flex flex-col items-center justify-center text-center gap-3 min-h-[200px]">
      <Timer className="w-8 h-8 text-gray-300" />
      <h3 className="font-bold text-[#00152A]">Awaiting Store Feedback</h3>
      <p className="text-sm text-gray-400">
        3 orders are currently being cross-referenced by the store keeper.
      </p>
    </div>
  );
}

// ── System Alert Card ───────────────────────────────────────────────────────
function SystemAlertCard({ task }: { task: (typeof INVENTORY_TASKS)[0] }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 space-y-4" style={{ borderWidth: 1, borderColor: "#fde8d8", borderLeftColor: "#EA580C", borderLeftWidth: 4 }}>
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5" style={{ color: "#EA580C" }}>
          <AlertTriangle className="w-3.5 h-3.5" />
          System Alert
        </span>
      </div>
      <h3 className="manrope-bold text-xl text-[#00152A]">{task.dish}</h3>
      <p className="text-sm text-gray-500 leading-relaxed">{task.alertMessage}</p>
      <Button
        variant="outline"
        className="w-full font-bold h-10 rounded-lg text-sm border-2"
        style={{ borderColor: "#EA580C", color: "#EA580C" }}
      >
        Request Emergency Restock
      </Button>
    </div>
  );
}

// ── Log Dot ─────────────────────────────────────────────────────────────────
const DOT_COLORS: Record<string, string> = {
  green: "bg-[#1B7F34]",
  red: "bg-red-500",
  orange: "bg-[#BA722E]",
};

// ── Page ──────────────────────────────────────────────────────────────────────
export default function InventoryRequestsPage() {
  const handleConfirmStock = (orderId: string) => {
    window.dispatchEvent(
      new CustomEvent("storeKeeperResponse", {
        detail: {
          orderId,
          stockConfirmed: true,
        },
      })
    );
  };

  const handleStockUnavailable = (orderId: string, note?: string) => {
    window.dispatchEvent(
      new CustomEvent("storeKeeperResponse", {
        detail: {
          orderId,
          stockConfirmed: false,
          stockAlert: note,
        },
      })
    );
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
      {/* ── Header ────────────────────────────── */}
      <div className="flex items-center justify-between">
        <h1 className="manrope-bold text-4xl text-[#00152A]">Live Inventory Verification</h1>
        <div className="flex items-center gap-2 text-sm font-bold text-[#1B7F34]">
          <span className="w-2 h-2 rounded-full bg-[#1B7F34] animate-pulse" />
          Store Keeper Online
        </div>
      </div>

      {/* ── Main Grid ─────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
        {/* Left: Verification Cards */}
        <div className="xl:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-[#00152A] flex items-center gap-3">
              <span className="w-7 h-7 rounded-md bg-[#FFF4E8] flex items-center justify-center">
                <RefreshCw className="w-4 h-4 text-[#BA722E]" />
              </span>
              Pending Stock Confirmation
            </h2>
            <Badge className="bg-gray-100 text-gray-500 border-0 text-[10px] font-bold uppercase tracking-widest px-3 py-1.5">
              12 Active Tasks
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {INVENTORY_TASKS.map((task) => {
              if (task.status === "confirmed") return <ConfirmedCard key={task.id} task={task} onConfirmStock={handleConfirmStock} />;
              if (task.status === "insufficient") return <InsufficientCard key={task.id} task={task} onStockUnavailable={handleStockUnavailable} />;
              if (task.status === "awaiting") return <AwaitingCard key={task.id} />;
              if (task.status === "system_alert") return <SystemAlertCard key={task.id} task={task} />;
              return null;
            })}
          </div>
        </div>

        {/* Right: Sidebar */}
        <div className="xl:col-span-1 space-y-5">
          {/* Kitchen Efficiency Card */}
          <div className="bg-[#00152A] rounded-xl p-6 text-white space-y-4">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Kitchen Efficiency
            </p>
            <div>
              <span className="manrope-bold text-6xl">94</span>
              <span className="text-4xl text-gray-400 font-light">%</span>
            </div>
            <p className="text-xs text-gray-400 uppercase tracking-widest font-bold">
              Inventory Accuracy
            </p>
            <div className="w-full h-0.5 bg-white/10" />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="manrope-bold text-3xl">142</p>
                <p className="text-[9px] text-gray-400 uppercase tracking-widest font-bold">Confirmed</p>
              </div>
              <div>
                <p className="manrope-bold text-3xl text-red-400">3</p>
                <p className="text-[9px] text-gray-400 uppercase tracking-widest font-bold">Missing</p>
              </div>
            </div>
          </div>

          {/* Verification Log */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-5">
            <div className="flex items-center gap-2">
              <Timer className="w-4 h-4 text-[#BA722E]" />
              <h3 className="font-bold text-[#00152A] text-sm">Recent Verification Log</h3>
            </div>
            <div className="space-y-4">
              {VERIFICATION_LOG.map((entry) => (
                <div key={entry.id} className="flex items-start gap-3">
                  <span
                    className={cn(
                      "w-2 h-2 rounded-full mt-1.5 flex-shrink-0",
                      DOT_COLORS[entry.color]
                    )}
                  />
                  <div>
                    <p className="text-sm font-bold text-[#00152A]">{entry.name}</p>
                    <p className="text-xs text-gray-500">{entry.action}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{entry.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full text-center text-[10px] font-bold text-[#00152A] uppercase tracking-widest hover:text-[#BA722E] transition-colors">
              View Full History
            </button>
          </div>

          {/* SOP Card */}
          <div className="rounded-xl overflow-hidden relative min-h-[140px]">
            <Image
              src="/images/palace-detail.png"
              alt="Palace kitchen"
              fill
              className="object-cover"
            />
            {/* Dark overlay */}
            <div className="absolute inset-0 bg-[#00152A]/70" />
            <div className="relative z-10 p-6 space-y-1">
              <h3 className="font-bold text-white text-lg leading-tight">
                Excellence in every ingredient.
              </h3>
              <p className="text-[10px] font-bold text-[#BA722E] uppercase tracking-widest">
                Palace Standard Operating Procedure
              </p>
            </div>
          </div>

          {/* ── Sync Banner (inside sidebar) ── */}
          <div className="bg-jagamn-primary rounded-xl px-5 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Cloud className="w-4 h-4 text-[#1B7F34]" />
              <span className="text-[11px] font-bold text-white uppercase tracking-widest">
                Inventory Sync Active
              </span>
            </div>
            <button className="flex items-center gap-1.5 text-[#BA722E] text-xs font-bold hover:text-[#D4893E] transition-colors">
              <Bell className="w-3.5 h-3.5" />
              <span>3 Notifications</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
