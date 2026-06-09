"use client";

import React from "react";
import {
  ArrowRight,
  ArrowLeft,
  BedDouble,
  Key,
  CreditCard,
  Smartphone,
  Banknote,
  MoreHorizontal,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import type {
  ArrivalRecord,
  DepartureRecord,
  RoomBoardRoom,
  TransactionRecord,
} from "@/lib/data/reception";
import type { DashboardKpi } from "@/lib/data/admin";

const STAT_ICONS = [ArrowRight, ArrowLeft, BedDouble, Key];
const STAT_COLORS = [
  { color: "text-[#BA722E]", bg: "bg-[#BA722E]/10" },
  { color: "text-[#BA722E]", bg: "bg-[#BA722E]/10" },
  { color: "text-[#00152A]", bg: "bg-gray-100" },
  { color: "text-[#00152A]", bg: "bg-gray-100" },
];

const PROVIDER_ICONS: Record<string, typeof CreditCard> = {
  stripe: CreditCard,
  fapshi: Smartphone,
};

export default function ReceptionOverviewClient({
  arrivals,
  departures,
  rooms,
  transactions,
  kpis,
}: {
  arrivals: ArrivalRecord[];
  departures: DepartureRecord[];
  rooms: RoomBoardRoom[];
  transactions: TransactionRecord[];
  kpis: DashboardKpi[];
}) {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {kpis.slice(0, 4).map((kpi, idx) => {
          const Icon = STAT_ICONS[idx] ?? BedDouble;
          const { color, bg } = STAT_COLORS[idx] ?? STAT_COLORS[0];
          return (
            <div
              key={kpi.label}
              className="bg-white rounded-lg border-l-4 border-l-[#00152A] p-8 shadow-sm border flex items-start justify-between hover:border-[#BA722E]/50 transition-all"
            >
              <div className="space-y-4">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  {kpi.label}
                </p>
                <h3 className="manrope-bold text-5xl text-[#00152A]">
                  {kpi.value}
                </h3>
              </div>
              <div
                className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center",
                  bg,
                )}
              >
                <Icon className={cn("w-5 h-5", color)} />
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Arrivals */}
        <div className="lg:col-span-2 bg-white rounded-lg border-l-4 border-l-[#00152A] shadow-sm overflow-hidden">
          <div className="p-8 flex items-center justify-between border-b border-gray-50">
            <h3 className="manrope-bold text-lg text-[#00152A]">
              Today's Arrivals
            </h3>
            <Link href="/reception/arrivals">
              <Button
                variant="link"
                className="text-[#BA722E] font-bold text-xs p-0 h-auto"
              >
                View All
              </Button>
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    Guest
                  </th>
                  <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    Ref
                  </th>
                  <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    Room Type
                  </th>
                  <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {arrivals.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-8 py-10 text-center text-gray-400 text-sm"
                    >
                      No arrivals today
                    </td>
                  </tr>
                ) : (
                  arrivals.slice(0, 6).map((a) => (
                    <tr
                      key={a.id}
                      className={cn(
                        "transition-colors group",
                        a.actionHref
                          ? "cursor-pointer hover:bg-gray-50"
                          : "hover:bg-gray-50/50",
                      )}
                      onClick={() =>
                        a.actionHref && (window.location.href = a.actionHref)
                      }
                    >
                      <td className="px-8 py-5">
                        <span className="text-sm font-bold text-[#00152A] group-hover:text-[#BA722E] transition-colors">
                          {a.guestName}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-xs text-gray-500 font-mono">
                        {a.bookingRef}
                      </td>
                      <td className="px-8 py-5 text-xs text-gray-500">
                        {a.roomType}
                      </td>
                      <td className="px-8 py-5">
                        <Badge
                          className={cn(
                            "border-0 text-[8px] font-bold uppercase tracking-widest px-2 py-0.5",
                            a.status === "checked_in"
                              ? "bg-green-50 text-green-600"
                              : "bg-blue-50 text-blue-600",
                          )}
                        >
                          {a.status.replace("_", " ")}
                        </Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Departures */}
        <div className="bg-white rounded-lg border-l-4 border-l-[#00152A] shadow-sm">
          <div className="p-8 border-b border-gray-50 flex items-center justify-between">
            <h3 className="manrope-bold text-lg text-[#00152A]">Departures</h3>
            <Link href="/reception/departures">
              <Button
                variant="link"
                className="text-[#BA722E] font-bold text-xs p-0 h-auto"
              >
                View All
              </Button>
            </Link>
          </div>
          <div className="p-8 space-y-5">
            {departures.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">
                No departures today
              </p>
            ) : (
              departures.slice(0, 5).map((dep) => (
                <div
                  key={dep.id}
                  className={cn(
                    "flex items-center justify-between group p-3 -mx-3 rounded-lg transition-colors",
                    dep.actionHref
                      ? "cursor-pointer hover:bg-gray-50"
                      : "hover:bg-gray-50/50",
                  )}
                  onClick={() =>
                    dep.actionHref && (window.location.href = dep.actionHref)
                  }
                >
                  <div>
                    <h4 className="text-sm font-bold text-[#00152A] group-hover:text-[#BA722E] transition-colors">
                      {dep.guestName}
                    </h4>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                      {dep.roomSlug}
                    </p>
                  </div>
                  <Badge
                    className={cn(
                      "border-0 text-[8px] font-bold uppercase tracking-widest px-3 py-1",
                      dep.status === "checked_out" ||
                      dep.status === "completed"
                        ? "bg-[#00152A] text-white"
                        : "bg-gray-100 text-gray-500",
                    )}
                  >
                    {dep.status.replace("_", " ")}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Room Board */}
        <div className="bg-white rounded-lg border-l-4 border-l-[#00152A] shadow-sm p-8 space-y-8">
          <div className="flex items-center justify-between">
            <h3 className="manrope-bold text-lg text-[#00152A]">Room Board</h3>
            <Link href="/reception/room-board">
              <Button
                variant="link"
                className="text-[#BA722E] font-bold text-xs p-0 h-auto"
              >
                Full Board
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-5 gap-2">
            {rooms.slice(0, 20).map((room) => (
              <div
                key={room.id}
                title={
                  room.guestName
                    ? `${room.unitCode} — ${room.guestName}`
                    : room.unitCode
                }
                className={cn(
                  "aspect-square rounded flex items-center justify-center text-[9px] font-bold transition-all cursor-pointer hover:scale-105",
                  room.status === "occupied"
                    ? "bg-[#00152A] text-white"
                    : room.status === "dirty"
                      ? "bg-orange-100 text-orange-600"
                      : room.status === "out_of_order"
                        ? "bg-red-100 text-red-500"
                        : "bg-gray-100 text-[#00152A]",
                )}
              >
                {room.unitCode.slice(-3)}
              </div>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-gray-50">
            {[
              { color: "bg-[#00152A]", label: "Occupied" },
              { color: "bg-gray-100", label: "Available" },
              { color: "bg-orange-100", label: "Dirty" },
              { color: "bg-red-100", label: "OOO" },
            ].map(({ color, label }) => (
              <div key={label} className="flex items-center gap-1.5">
                <div className={cn("w-3 h-3 rounded", color)} />
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="lg:col-span-2 bg-white rounded-lg border-l-4 border-l-[#00152A] shadow-sm">
          <div className="p-8 flex items-center justify-between border-b border-gray-50">
            <h3 className="manrope-bold text-lg text-[#00152A]">
              Recent Transactions
            </h3>
            <Link href="/reception/transactions">
              <Button
                variant="link"
                className="text-[#BA722E] font-bold text-xs p-0 h-auto"
              >
                All Transactions
              </Button>
            </Link>
          </div>
          <div className="p-8 space-y-6">
            {transactions.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">
                No recent transactions
              </p>
            ) : (
              transactions.map((tx) => {
                const Icon = PROVIDER_ICONS[tx.provider ?? ""] ?? Banknote;
                return (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-5">
                      <div className="w-12 h-12 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="space-y-0.5">
                        <h4 className="text-sm font-bold text-[#00152A] group-hover:text-[#BA722E] transition-colors">
                          {tx.description}
                        </h4>
                        <p className="text-[10px] text-gray-400 font-medium capitalize">
                          {tx.provider ?? "—"} ·{" "}
                          {new Date(tx.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <p className="manrope-bold text-base text-[#00152A]">
                        {tx.currency} {tx.amount.toFixed(2)}
                      </p>
                      <button className="text-gray-300 hover:text-gray-500">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
