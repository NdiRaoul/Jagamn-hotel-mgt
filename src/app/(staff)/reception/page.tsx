"use client";

import React from "react";
import {
  ArrowRight,
  ArrowLeft,
  BedDouble,
  Key,
  Clock,
  CreditCard,
  Smartphone,
  Banknote,
  MoreHorizontal,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const STATS = [
  {
    label: "Total Check-ins",
    value: "12",
    icon: ArrowRight,
    color: "text-[#BA722E]",
    bg: "bg-[#BA722E]/10",
  },
  {
    label: "Total Check-outs",
    value: "8",
    icon: ArrowLeft,
    color: "text-[#BA722E]",
    bg: "bg-[#BA722E]/10",
  },
  {
    label: "Occupied Rooms",
    value: "45",
    icon: BedDouble,
    color: "text-[#00152A]",
    bg: "bg-gray-100",
  },
  {
    label: "Available Rooms",
    value: "5",
    icon: Key,
    color: "text-[#00152A]",
    bg: "bg-gray-100",
  },
];

import { ARRIVALS_DATA, DEPARTURES_DATA } from "@/lib/mock-data";

const ENHANCED_ARRIVALS = ARRIVALS_DATA.map(arrival => ({
  ...arrival,
  href: arrival.status === "Ready for Check-In" ? `/reception/check-in/${arrival.id}` : null,
  etaColor: arrival.status === "Room Not Ready" ? "text-orange-500" : undefined
}));

const ENHANCED_DEPARTURES = DEPARTURES_DATA.map(dep => ({
  ...dep,
  href: dep.status !== "Checked Out" ? `/reception/departures/check-out/${dep.id}` : null,
  statusColor: dep.status === "Checked Out" ? "bg-[#00152A] text-white" : "bg-gray-100 text-gray-500",
}));

const ROOM_BOARD = [
  { num: "101", status: "occupied", alert: true },
  { num: "102", status: "occupied" },
  { num: "103", status: "occupied" },
  { num: "104", status: "available" },
  { num: "105", status: "cleaning" },
  { num: "201", status: "occupied" },
  { num: "202", status: "available" },
  { num: "203", status: "occupied" },
  { num: "204", status: "occupied" },
  { num: "205", status: "cleaning" },
];

const TRANSACTIONS = [
  {
    desc: "Room 512 Final Bill",
    time: "10 mins ago • Credit Card",
    amount: "$1,245.00",
    icon: CreditCard,
  },
  {
    desc: "Room 304 Room Service",
    time: "45 mins ago • Room Charge",
    amount: "$85.50",
    icon: Smartphone,
  },
  {
    desc: "Deposit - REF-892A",
    time: "2 hours ago • Bank Transfer",
    amount: "+$500.00",
    icon: Banknote,
    amountColor: "text-orange-600",
  },
];

export default function ReceptionOverviewPage() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* ── Stats Row ─────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {STATS.map((stat, idx) => (
          <div
            key={idx}
            className="bg-white rounded-lg border-l-4 border-l-[#00152A]  p-8 shadow-sm border flex items-start justify-between group hover:border-[#BA722E]/50 transition-all"
          >
            <div className="space-y-4">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                {stat.label}
              </p>
              <h3 className="manrope-bold text-5xl text-[#00152A]">
                {stat.value}
              </h3>
            </div>
            <div
              className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center transition-colors",
                stat.bg,
              )}
            >
              <stat.icon className={cn("w-5 h-5", stat.color)} />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* ── Arrivals Section ─────────────────────── */}
        <div className="lg:col-span-2 bg-white rounded-lg border-l-4 border-l-[#00152A] shadow-sm overflow-hidden">
          <div className="p-8 flex items-center justify-between border-b border-gray-50">
            <h3 className="manrope-bold text-lg text-[#00152A]">Arrivals</h3>
            <Button
              variant="link"
              className="text-[#BA722E] font-bold text-xs p-0 h-auto"
            >
              View All
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    Guest Name
                  </th>
                  <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    Booking Ref
                  </th>
                  <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    Room Type
                  </th>
                  <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    ETA
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {ENHANCED_ARRIVALS.map((arrival, idx) => (
                  <tr
                    key={idx}
                    className={cn(
                      "transition-colors group",
                      arrival.href ? "cursor-pointer hover:bg-gray-50" : "hover:bg-gray-50/50"
                    )}
                    onClick={() => arrival.href && (window.location.href = arrival.href)}
                  >
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-[#00152A] group-hover:text-[#BA722E] transition-colors">
                          {arrival.guest}
                        </span>
                        {arrival.href && <ArrowRight className="w-3 h-3 text-[#BA722E] opacity-0 group-hover:opacity-100 transition-all" />}
                      </div>
                    </td>
                    <td className="px-8 py-5 text-xs text-gray-500 font-medium">
                      {arrival.reservation}
                    </td>
                    <td className="px-8 py-5 text-xs text-gray-500 font-medium">
                      {arrival.room}
                    </td>
                    <td
                      className={cn(
                        "px-8 py-5 text-xs font-bold",
                        arrival.etaColor || "text-[#00152A]",
                      )}
                    >
                      {arrival.eta}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Departures Section ───────────────────── */}
        <div className="bg-white rounded-lg border-l-4 border-l-[#00152A]  shadow-sm">
          <div className="p-8 border-b border-gray-50">
            <h3 className="manrope-bold text-lg text-[#00152A]">Departures</h3>
          </div>
          <div className="p-8 space-y-6">
            {ENHANCED_DEPARTURES.map((dep, idx) => (
              <div
                key={idx}
                className={cn(
                  "flex items-center justify-between group p-3 -mx-3 rounded-lg transition-colors",
                  dep.href ? "cursor-pointer hover:bg-gray-50" : "hover:bg-gray-50/50"
                )}
                onClick={() => dep.href && (window.location.href = dep.href)}
              >
                <div className="flex items-center gap-3">
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-[#00152A] group-hover:text-[#BA722E] transition-colors flex items-center gap-2">
                      {dep.guest}
                      {dep.href && <ArrowRight className="w-3 h-3 text-[#BA722E] opacity-0 group-hover:opacity-100 transition-all" />}
                    </h4>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                      ROOM {dep.room}
                    </p>
                  </div>
                </div>
                <Badge
                  className={cn(
                    "border-0 text-[8px] font-bold uppercase tracking-widest px-3 py-1",
                    dep.statusColor,
                  )}
                >
                  {dep.status}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* ── Room Board Section ───────────────────── */}
        <div className="bg-white rounded-lg border-l-4 border-l-[#00152A] shadow-sm p-8 space-y-8 h-full">
          <div className="flex items-center justify-between">
            <h3 className="manrope-bold text-lg text-[#00152A]">
              Room Board Overview
            </h3>
          </div>

          <div className="grid grid-cols-5 gap-3">
            {ROOM_BOARD.map((room, idx) => (
              <div
                key={idx}
                className={cn(
                  "aspect-square rounded flex items-center justify-center text-xs font-bold relative transition-all cursor-pointer hover:scale-105",
                  room.status === "occupied"
                    ? "bg-[#00152A] text-white"
                    : room.status === "available"
                      ? "bg-gray-100 text-[#00152A]"
                      : "bg-gray-100 border-2 border-dashed border-gray-200 text-gray-400",
                )}
              >
                {room.num}
                {room.alert && (
                  <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-orange-500 rounded-full" />
                )}
              </div>
            ))}
          </div>

          <div className="flex items-center gap-6 pt-4 border-t border-gray-50">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-[#00152A]" />
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Occupied
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-gray-100" />
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Available
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded border-2 border-dashed border-gray-200" />
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Cleaning
              </span>
            </div>
          </div>
        </div>

        {/* ── Recent Transactions Section ──────────── */}
        <div className="lg:col-span-2 bg-white rounded-lg border-l-4 border-l-[#00152A] shadow-sm">
          <div className="p-8 flex items-center justify-between border-b border-gray-50">
            <h3 className="manrope-bold text-lg text-[#00152A]">
              Recent Transactions
            </h3>
            <Button
              variant="link"
              className="text-[#BA722E] font-bold text-xs p-0 h-auto"
            >
              All Transactions
            </Button>
          </div>
          <div className="p-8 space-y-8">
            {TRANSACTIONS.map((tx, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between group"
              >
                <div className="flex items-center gap-6">
                  <div className="w-12 h-12 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">
                    <tx.icon className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-[#00152A] group-hover:text-[#BA722E] transition-colors">
                      {tx.desc}
                    </h4>
                    <p className="text-[10px] text-gray-400 font-medium">
                      {tx.time}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <p
                    className={cn(
                      "manrope-bold text-base",
                      tx.amountColor || "text-[#00152A]",
                    )}
                  >
                    {tx.amount}
                  </p>
                  <button className="text-gray-300 hover:text-gray-500">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
