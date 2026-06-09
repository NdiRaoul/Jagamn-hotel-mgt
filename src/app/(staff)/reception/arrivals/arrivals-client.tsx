"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  Filter,
  MoreHorizontal,
  AlertCircle,
  Inbox,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import Link from "next/link";
import type { ArrivalRecord } from "@/lib/data/reception";

const STATUS_COLORS: Record<string, string> = {
  confirmed: "bg-blue-50 text-blue-600",
  checked_in: "bg-green-50 text-green-600",
  pending: "bg-orange-50 text-orange-600",
  cancelled: "bg-gray-50 text-gray-400",
  completed: "bg-green-50 text-green-600",
};

export default function ArrivalsClient({
  arrivals,
  date,
  error,
}: {
  arrivals: ArrivalRecord[];
  date: string;
  error: string | null;
}) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return arrivals.filter((a) => {
      const matchesSearch =
        !q ||
        a.guestName.toLowerCase().includes(q) ||
        a.bookingRef.toLowerCase().includes(q) ||
        a.roomType.toLowerCase().includes(q);
      const matchesStatus = statusFilter === "all" || a.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [arrivals, search, statusFilter]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h1 className="manrope-bold text-4xl text-[#00152A]">
            Daily Arrivals
          </h1>
          <p className="text-gray-500 text-sm">
            {arrivals.length} expected arrival{arrivals.length !== 1 ? "s" : ""}{" "}
            for {date}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search guest, ref, room..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-11 pl-10 bg-white border-gray-200 w-64"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-11 px-3 bg-white border border-gray-200 rounded-md text-sm text-gray-600 focus:outline-none focus:ring-1 focus:ring-[#BA722E]"
          >
            <option value="all">All Status</option>
            <option value="confirmed">Confirmed</option>
            <option value="checked_in">Checked In</option>
            <option value="pending">Pending</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg border-l-4 border-l-[#BA722E] shadow-sm overflow-hidden border-t border-b border-r border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  Guest Detail
                </th>
                <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  Booking Ref
                </th>
                <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  Room Category
                </th>
                <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  Check-In / Status
                </th>
                <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  Payment
                </th>
                <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-3 text-gray-400">
                      <Inbox className="w-10 h-10" />
                      <p className="font-medium">
                        {search || statusFilter !== "all"
                          ? "No arrivals match your filters"
                          : "No arrivals scheduled for today"}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((arrival) => (
                  <tr
                    key={arrival.id}
                    className={cn(
                      "transition-colors group",
                      arrival.actionHref
                        ? "cursor-pointer hover:bg-gray-50/80"
                        : "hover:bg-gray-50/30",
                    )}
                    onClick={() =>
                      arrival.actionHref &&
                      (window.location.href = arrival.actionHref)
                    }
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-[#00152A]/5 flex items-center justify-center text-[#00152A] font-bold text-xs">
                          {arrival.guestName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-[#00152A] group-hover:text-[#BA722E] transition-colors">
                            {arrival.guestName}
                          </p>
                          {arrival.guestPhone && (
                            <a
                              href={`tel:${arrival.guestPhone}`}
                              onClick={(e) => e.stopPropagation()}
                              className="text-[11px] text-gray-400 hover:text-[#BA722E]"
                            >
                              {arrival.guestPhone}
                            </a>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-xs text-gray-500 font-medium font-mono">
                      {arrival.bookingRef}
                    </td>
                    <td className="px-8 py-6 text-xs text-gray-500 font-medium">
                      {arrival.roomType}
                      {arrival.roomUnit && (
                        <span className="block text-[11px] text-gray-400 font-mono">
                          Unit {arrival.roomUnit}
                        </span>
                      )}
                    </td>
                    <td className="px-8 py-6">
                      <div className="space-y-2">
                        <p className="text-xs font-bold text-[#00152A]">
                          {arrival.checkIn}
                        </p>
                        <Badge
                          className={cn(
                            "border-0 text-[8px] font-bold uppercase tracking-widest px-2 py-0.5",
                            STATUS_COLORS[arrival.status] ??
                              "bg-gray-50 text-gray-400",
                          )}
                        >
                          {arrival.status.replace("_", " ")}
                        </Badge>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <Badge
                        className={cn(
                          "border-0 text-[8px] font-bold uppercase tracking-widest px-2 py-0.5",
                          arrival.paymentStatus === "paid"
                            ? "bg-green-50 text-green-600"
                            : "bg-orange-50 text-orange-600",
                        )}
                      >
                        {arrival.paymentStatus}
                      </Badge>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        {arrival.actionHref &&
                        arrival.status !== "checked_in" &&
                        arrival.status !== "checked_out" &&
                        arrival.status !== "completed" ? (
                          <Link href={arrival.actionHref}>
                            <Button
                              className="h-9 px-4 bg-[#00152A] hover:bg-[#0A2038] text-white text-[10px] font-bold uppercase tracking-widest"
                              onClick={(e) => e.stopPropagation()}
                            >
                              Check In
                            </Button>
                          </Link>
                        ) : (
                          <Button
                            variant="outline"
                            className="h-9 px-4 border-gray-200 text-gray-400 text-[10px] font-bold uppercase tracking-widest"
                            disabled
                            onClick={(e) => e.stopPropagation()}
                          >
                            {arrival.status === "checked_in"
                              ? "Checked In"
                              : "View"}
                          </Button>
                        )}
                        <button className="text-gray-300 hover:text-gray-500 p-2">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
