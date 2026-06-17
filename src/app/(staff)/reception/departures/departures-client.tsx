"use client";

import React, { useState, useMemo } from "react";
import { Search, AlertCircle, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { formatMoney } from "@/lib/currency";
import type { DepartureRecord } from "@/lib/data/reception";

export default function DeparturesClient({
  departures,
  date,
  error,
}: {
  departures: DepartureRecord[];
  date: string;
  error: string | null;
}) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return departures.filter(
      (d) =>
        !q ||
        d.guestName.toLowerCase().includes(q) ||
        d.bookingRef.toLowerCase().includes(q) ||
        d.roomSlug.toLowerCase().includes(q),
    );
  }, [departures, search]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h1 className="manrope-bold text-4xl text-[#00152A]">
            Daily Departures
          </h1>
          <p className="text-gray-500 text-sm">
            {departures.length} departure{departures.length !== 1 ? "s" : ""}{" "}
            for {date}
          </p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Filter departures..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-11 pl-10 bg-white border-gray-200 w-64"
          />
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Table — desktop/tablet */}
      <div className="hidden md:block bg-white rounded-lg border-l-4 border-l-red-500 shadow-sm overflow-hidden border-t border-b border-r border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse md:min-w-[700px]">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  Guest &amp; Room
                </th>
                <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  Booking Ref
                </th>
                <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  Outstanding Balance
                </th>
                <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  Status
                </th>
                <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-3 text-gray-400">
                      <Inbox className="w-10 h-10" />
                      <p className="font-medium">
                        {search
                          ? "No departures match your search"
                          : "No departures scheduled for today"}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((dep) => (
                  <tr
                    key={dep.id}
                    className={cn(
                      "transition-colors group",
                      dep.actionHref
                        ? "cursor-pointer hover:bg-gray-50/80"
                        : "hover:bg-gray-50/30",
                    )}
                    onClick={() =>
                      dep.actionHref && (window.location.href = dep.actionHref)
                    }
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-600 font-bold text-xs flex-shrink-0">
                          {dep.guestName.charAt(0).toUpperCase()}
                        </div>
                        <div className="space-y-0.5">
                          <p className="text-sm font-bold text-[#00152A] group-hover:text-[#BA722E] transition-colors">
                            {dep.guestName}
                          </p>
                          <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">
                            {dep.roomSlug}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-xs text-gray-500 font-medium font-mono">
                      {dep.bookingRef}
                    </td>
                    <td className="px-8 py-6">
                      <p
                        className={cn(
                          "text-sm font-bold",
                          dep.balanceDue > 0 ? "text-red-500" : "text-gray-400",
                        )}
                      >
                        {dep.balanceDue > 0
                          ? formatMoney(Math.round(dep.balanceDue))
                          : "Settled"}
                      </p>
                    </td>
                    <td className="px-8 py-6">
                      <Badge
                        className={cn(
                          "border-0 text-[8px] font-bold uppercase tracking-widest px-2 py-0.5",
                          dep.status === "checked_out" ||
                          dep.status === "completed"
                            ? "bg-gray-50 text-gray-400"
                            : dep.status === "confirmed"
                              ? "bg-orange-50 text-orange-600"
                              : "bg-blue-50 text-blue-600",
                        )}
                      >
                        {dep.status.replace("_", " ")}
                      </Badge>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        {dep.actionHref ? (
                          <Link href={dep.actionHref}>
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
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cards — mobile */}
      <div className="md:hidden space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-lg border-l-4 border-l-red-500 border border-gray-100 shadow-sm p-12 flex flex-col items-center gap-3 text-gray-400">
            <Inbox className="w-10 h-10" />
            <p className="font-medium text-sm">
              {search
                ? "No departures match your search"
                : "No departures scheduled for today"}
            </p>
          </div>
        ) : (
          filtered.map((dep) => (
            <div
              key={dep.id}
              className={cn(
                "bg-white rounded-lg border-l-4 border-l-red-500 shadow-sm border border-gray-100 p-4 space-y-3",
                dep.actionHref ? "cursor-pointer" : "",
              )}
              onClick={() =>
                dep.actionHref && (window.location.href = dep.actionHref)
              }
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-600 font-bold text-xs flex-shrink-0">
                    {dep.guestName.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-[#00152A] truncate">
                      {dep.guestName}
                    </p>
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">
                      {dep.roomSlug}
                    </p>
                  </div>
                </div>
                <Badge
                  className={cn(
                    "border-0 text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 shrink-0",
                    dep.status === "checked_out" || dep.status === "completed"
                      ? "bg-gray-50 text-gray-400"
                      : dep.status === "confirmed"
                        ? "bg-orange-50 text-orange-600"
                        : "bg-blue-50 text-blue-600",
                  )}
                >
                  {dep.status.replace("_", " ")}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <p className="text-[9px] text-gray-400 uppercase tracking-wide font-bold mb-1">
                    Booking Ref
                  </p>
                  <span className="font-mono text-gray-500">
                    {dep.bookingRef}
                  </span>
                </div>
                <div>
                  <p className="text-[9px] text-gray-400 uppercase tracking-wide font-bold mb-1">
                    Balance
                  </p>
                  <span
                    className={cn(
                      "font-bold text-sm",
                      dep.balanceDue > 0 ? "text-red-500" : "text-gray-400",
                    )}
                  >
                    {dep.balanceDue > 0
                      ? formatMoney(Math.round(dep.balanceDue))
                      : "Settled"}
                  </span>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                {dep.actionHref ? (
                  <Link href={dep.actionHref}>
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
                  >
                    Settled
                  </Button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
