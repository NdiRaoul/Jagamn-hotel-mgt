"use client";

import React from "react";
import {
  ArrowRight,
  Search,
  Filter,
  MoreHorizontal,
  ChevronRight,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import { ARRIVALS_DATA } from "@/lib/mock-data";
import Link from "next/link";

const ENHANCED_ARRIVALS = ARRIVALS_DATA.map((arrival) => ({
  ...arrival,
  href:
    arrival.status === "Ready for Check-In"
      ? `/reception/check-in/${arrival.id}`
      : null,
  statusColor:
    arrival.status === "Ready for Check-In"
      ? "bg-blue-50 text-blue-600"
      : arrival.status === "Room Not Ready"
        ? "bg-orange-50 text-orange-600"
        : "bg-green-50 text-green-600",
}));

export default function ArrivalsPage() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h1 className="manrope-bold text-4xl text-[#00152A]">
            Daily Arrivals
          </h1>
          <p className="text-gray-500 text-sm">
            Managing guest entries and check-in procedures for today.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Filter arrivals..."
              className="h-11 pl-10 bg-white border-gray-200 w-64"
            />
          </div>
          <Button
            variant="outline"
            className="h-11 px-4 border-gray-200 text-gray-500 flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            Filter
          </Button>
        </div>
      </div>

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
                  ETA / Status
                </th>
                <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {ENHANCED_ARRIVALS.map((arrival, idx) => (
                <tr
                  key={idx}
                  className={cn(
                    "transition-colors group",
                    arrival.href
                      ? "cursor-pointer hover:bg-gray-50/80"
                      : "hover:bg-gray-50/30",
                  )}
                  onClick={() =>
                    arrival.href && (window.location.href = arrival.href)
                  }
                >
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-[#00152A]/5 flex items-center justify-center text-[#00152A] font-bold text-xs">
                        {arrival.guest.charAt(0)}
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-sm font-bold text-[#00152A] group-hover:text-[#BA722E] transition-colors">
                          {arrival.guest}
                        </p>
                        <p className="text-[10px] text-gray-400 uppercase tracking-widest">
                          {arrival.tier}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-xs text-gray-500 font-medium">
                    {arrival.reservation}
                  </td>
                  <td className="px-8 py-6 text-xs text-gray-500 font-medium">
                    {arrival.room}
                  </td>
                  <td className="px-8 py-6">
                    <div className="space-y-2">
                      <p className="text-xs font-bold text-[#00152A]">
                        {arrival.eta}
                      </p>
                      <Badge
                        className={cn(
                          "border-0 text-[8px] font-bold uppercase tracking-widest px-2 py-0.5",
                          arrival.statusColor,
                        )}
                      >
                        {arrival.status}
                      </Badge>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      {arrival.status === "Ready for Check-In" ||
                      arrival.status === "Room Not Ready" ? (
                        <Link href={arrival.href || "#"}>
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
                          className="h-9 px-4 border-gray-200 text-[#00152A] text-[10px] font-bold uppercase tracking-widest"
                          onClick={(e) => e.stopPropagation()}
                        >
                          View Folio
                        </Button>
                      )}
                      <button className="text-gray-300 hover:text-gray-500 p-2">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
