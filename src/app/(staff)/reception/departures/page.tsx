"use client";

import React from "react";
import {
  ArrowUpCircle,
  Search,
  Filter,
  MoreHorizontal,
  CreditCard,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import { DEPARTURES_DATA } from "@/lib/mock-data";
import Link from "next/link";

const ENHANCED_DEPARTURES = DEPARTURES_DATA.map((dep) => ({
  ...dep,
  href:
    dep.status !== "Checked Out"
      ? `/reception/departures/check-out/${dep.id}`
      : null,
  statusColor:
    dep.status === "Checked Out"
      ? "bg-gray-50 text-gray-400"
      : dep.status === "Pending Checkout"
        ? "bg-orange-50 text-orange-600"
        : "bg-red-50 text-red-600",
  time:
    dep.status === "Checked Out" ? dep.departure : `Expected ${dep.departure}`,
}));

export default function DeparturesPage() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h1 className="manrope-bold text-4xl text-[#00152A]">
            Daily Departures
          </h1>
          <p className="text-gray-500 text-sm">
            Managing guest check-outs and final billing for today.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Filter departures..."
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

      <div className="bg-white rounded-lg border-l-4 border-l-red-500 shadow-sm overflow-hidden border-t border-b border-r border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  Guest & Room
                </th>
                <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  Booking Ref
                </th>
                <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  Outstanding Balance
                </th>
                <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  Status / Time
                </th>
                <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {ENHANCED_DEPARTURES.map((dep, idx) => (
                <tr
                  key={idx}
                  className={cn(
                    "transition-colors group",
                    dep.href
                      ? "cursor-pointer hover:bg-gray-50/80"
                      : "hover:bg-gray-50/30",
                  )}
                  onClick={() => dep.href && (window.location.href = dep.href)}
                >
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-600 font-bold text-xs">
                        {dep.room}
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-sm font-bold text-[#00152A] group-hover:text-[#BA722E] transition-colors">
                          {dep.guest}
                        </p>
                        <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">
                          Room {dep.room}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-xs text-gray-500 font-medium">
                    {dep.type}
                  </td>
                  <td className="px-8 py-6">
                    <p
                      className={cn(
                        "text-sm font-bold",
                        dep.balance !== "$0.00"
                          ? "text-red-500"
                          : "text-gray-400",
                      )}
                    >
                      {dep.balance}
                    </p>
                  </td>
                  <td className="px-8 py-6">
                    <div className="space-y-2">
                      <p className="text-xs font-bold text-[#00152A]">
                        {dep.time}
                      </p>
                      <Badge
                        className={cn(
                          "border-0 text-[8px] font-bold uppercase tracking-widest px-2 py-0.5",
                          dep.statusColor,
                        )}
                      >
                        {dep.status}
                      </Badge>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      {dep.status !== "Checked Out" ? (
                        <Link href={dep.href || "#"}>
                          <Button
                            className="h-9 px-4 bg-red-500 hover:bg-red-600 text-white text-[10px] font-bold uppercase tracking-widest shadow-md shadow-red-100"
                            onClick={(e) => e.stopPropagation()}
                          >
                            Check Out
                          </Button>
                        </Link>
                      ) : (
                        <Button
                          variant="outline"
                          className="h-9 px-4 border-gray-200 text-gray-400 text-[10px] font-bold uppercase tracking-widest"
                          disabled
                          onClick={(e) => e.stopPropagation()}
                        >
                          Settled
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
