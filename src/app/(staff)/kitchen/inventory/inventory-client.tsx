"use client";

import React, { useState } from "react";
import type { InventoryRequest, InventoryItem } from "@/lib/data/kitchen";
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
  Package,
} from "lucide-react";

export default function InventoryClient({
  requests: initialRequests,
  inventory,
}: {
  requests: InventoryRequest[];
  inventory: InventoryItem[];
}) {
  const [requests, setRequests] = useState(initialRequests);

  const lowStockItems = inventory.filter(
    (item) => item.on_hand <= item.reorder_level,
  );

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
      {/* ── Header ────────────────────────────── */}
      <div className="flex items-center justify-between">
        <h1 className="manrope-bold text-4xl text-[#00152A]">
          Live Inventory Verification
        </h1>
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
              {requests.length} Active Tasks
            </Badge>
          </div>

          {requests.length === 0 ? (
            <div className="bg-white rounded-xl border border-dashed border-gray-200 shadow-sm p-16 flex flex-col items-center justify-center text-center gap-3">
              <Package className="w-12 h-12 text-gray-300" />
              <h3 className="font-bold text-[#00152A]">No Pending Requests</h3>
              <p className="text-sm text-gray-400">
                All inventory requests have been processed.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {requests.map((req) => (
                <RequestCard key={req.id} request={req} />
              ))}
            </div>
          )}
        </div>

        {/* Right: Sidebar */}
        <div className="xl:col-span-1 space-y-5">
          {/* Low Stock Alert */}
          <div className="bg-[#00152A] rounded-xl p-6 text-white space-y-4">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Low Stock Alerts
            </p>
            <div>
              <span className="manrope-bold text-6xl">
                {lowStockItems.length}
              </span>
            </div>
            <p className="text-xs text-gray-400 uppercase tracking-widest font-bold">
              Items Below Reorder Level
            </p>
            {lowStockItems.length > 0 && (
              <>
                <div className="w-full h-0.5 bg-white/10" />
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {lowStockItems.slice(0, 5).map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-gray-300">{item.name}</span>
                      <span className="text-red-400 font-bold">
                        {item.on_hand} {item.unit}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-5">
            <div className="flex items-center gap-2">
              <Timer className="w-4 h-4 text-[#BA722E]" />
              <h3 className="font-bold text-[#00152A] text-sm">
                Recent Activity
              </h3>
            </div>
            <div className="space-y-4">
              {requests.slice(0, 5).map((req) => (
                <div key={req.id} className="flex items-start gap-3">
                  <span
                    className={cn(
                      "w-2 h-2 rounded-full mt-1.5 flex-shrink-0",
                      req.status === "confirmed"
                        ? "bg-[#1B7F34]"
                        : req.status === "insufficient"
                          ? "bg-red-500"
                          : "bg-[#BA722E]",
                    )}
                  />
                  <div>
                    <p className="text-sm font-bold text-[#00152A]">
                      {req.dish}
                    </p>
                    <p className="text-xs text-gray-500">
                      {req.status === "confirmed"
                        ? "Stock confirmed"
                        : req.status === "insufficient"
                          ? "Stock unavailable"
                          : "Awaiting confirmation"}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      {new Date(req.created_at).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Sync Banner ── */}
          <div className="bg-jagamn-primary rounded-xl px-5 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Cloud className="w-4 h-4 text-[#1B7F34]" />
              <span className="text-[11px] font-bold text-white uppercase tracking-widest">
                Inventory Sync Active
              </span>
            </div>
            <button className="flex items-center gap-1.5 text-[#BA722E] text-xs font-bold hover:text-[#D4893E] transition-colors">
              <Bell className="w-3.5 h-3.5" />
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Request Card Component ───────────────────────────────────────────────────
function RequestCard({ request }: { request: InventoryRequest }) {
  if (request.status === "confirmed") {
    return (
      <div className="bg-white rounded-xl border border-gray-100 border-l-4 border-l-[#1B7F34] shadow-sm p-6 space-y-5">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            Request {request.orderId}
          </span>
          <Badge className="bg-[#E6F4EA] text-[#1B7F34] border-0 text-[9px] font-bold flex items-center gap-1 px-2 py-0.5">
            <CheckCircle2 className="w-3 h-3" />
            Stock Confirmed
          </Badge>
        </div>
        <h3 className="manrope-bold text-2xl text-[#00152A]">{request.dish}</h3>
        <div className="space-y-2">
          {request.items?.map((item, i) => (
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

  if (request.status === "insufficient") {
    return (
      <div
        className="bg-white rounded-xl border shadow-sm p-6 space-y-5"
        style={{
          borderLeftColor: "#EA580C",
          borderLeftWidth: 4,
          borderColor: "#fde8d8",
        }}
      >
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            Request {request.orderId}
          </span>
          <Badge
            className="border-0 text-[9px] font-bold flex items-center gap-1 px-2 py-0.5"
            style={{ backgroundColor: "#FEE9E7", color: "#B91C1C" }}
          >
            <AlertTriangle className="w-3 h-3" />
            Stock Insufficient
          </Badge>
        </div>
        <h3 className="manrope-bold text-2xl text-[#00152A]">{request.dish}</h3>
        <div className="space-y-2">
          {request.items?.map((item, i) => (
            <div key={i} className="flex justify-between text-sm">
              <span className="text-gray-600">{item.name}</span>
              <span
                className={cn(
                  "font-bold",
                  item.available ? "text-[#1B7F34]" : "text-red-500",
                )}
              >
                {item.available ? "Available" : "Out of Stock"}
              </span>
            </div>
          ))}
        </div>
        {request.storeKeeperNote && (
          <div
            className="rounded-lg p-4"
            style={{ backgroundColor: "#FEF2F0" }}
          >
            <p
              className="text-[10px] font-bold uppercase tracking-widest mb-1"
              style={{ color: "#EA580C" }}
            >
              Store Keeper Note:
            </p>
            <p
              className="text-sm font-medium italic"
              style={{ color: "#EA580C" }}
            >
              {request.storeKeeperNote}
            </p>
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
            className="text-white font-bold h-10 rounded-lg text-sm"
            style={{ backgroundColor: "#EA580C" }}
          >
            Notify Guest
          </Button>
        </div>
      </div>
    );
  }

  // Awaiting
  return (
    <div className="bg-white rounded-xl border-2 border-dashed border-gray-200 shadow-sm p-6 flex flex-col items-center justify-center text-center gap-3 min-h-[200px]">
      <Timer className="w-8 h-8 text-gray-300" />
      <h3 className="font-bold text-[#00152A]">{request.dish}</h3>
      <p className="text-sm text-gray-400">
        Awaiting store keeper confirmation
      </p>
      <p className="text-xs text-gray-400">
        Requested by {request.requested_by_name}
      </p>
    </div>
  );
}
