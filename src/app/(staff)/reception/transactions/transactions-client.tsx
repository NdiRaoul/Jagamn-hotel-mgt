"use client";

import React, { useState, useMemo } from "react";
import { formatMoney } from "@/lib/currency";
import { formatTxnId } from "@/lib/txn";
import {
  Search,
  AlertCircle,
  Inbox,
  CreditCard,
  Smartphone,
  ArrowRight,
  X,
  Calendar,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { TransactionRecord2 } from "@/lib/data/reception";

const STATUS_COLORS: Record<string, string> = {
  paid: "bg-green-50 text-green-600",
  pending: "bg-orange-50 text-orange-600",
  failed: "bg-red-50 text-red-600",
  refunded: "bg-blue-50 text-blue-600",
  partially_refunded: "bg-purple-50 text-purple-600",
};

const EVENT_LABELS: Record<string, string> = {
  intent_created: "Intent Created",
  processor_sent: "Sent to Processor",
  processor_succeeded: "Payment Succeeded",
  processor_failed: "Payment Failed",
  refund_requested: "Refund Requested",
  refund_succeeded: "Refund Succeeded",
  refund_failed: "Refund Failed",
};

export default function TransactionsClient({
  transactions,
  error,
}: {
  transactions: TransactionRecord2[];
  error: string | null;
}) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return transactions.filter((t) => {
      const matchesSearch =
        !q ||
        (t.bookingRef?.toLowerCase().includes(q) ?? false) ||
        (t.guestName?.toLowerCase().includes(q) ?? false) ||
        (t.guestEmail?.toLowerCase().includes(q) ?? false) ||
        t.paymentId.toLowerCase().includes(q);
      const matchesStatus =
        statusFilter === "all" || t.derivedStatus === statusFilter;
      const eventDate = t.eventAt.slice(0, 10);
      const matchesFrom = !dateFrom || eventDate >= dateFrom;
      const matchesTo = !dateTo || eventDate <= dateTo;
      return matchesSearch && matchesStatus && matchesFrom && matchesTo;
    });
  }, [transactions, search, statusFilter, dateFrom, dateTo]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h1 className="manrope-bold text-4xl text-[#00152A]">Transactions</h1>
          <p className="text-gray-500 text-sm">
            Payment event timeline — {transactions.length} events
          </p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 p-4 bg-white rounded-lg border border-gray-100 shadow-sm">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search guest, ref, payment ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 pl-10 bg-gray-50 border-gray-200"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-10 px-3 bg-gray-50 border border-gray-200 rounded-md text-sm text-gray-600 focus:outline-none focus:ring-1 focus:ring-[#BA722E]"
        >
          <option value="all">All Status</option>
          <option value="paid">Paid</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
          <option value="refunded">Refunded</option>
        </select>
        <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-md px-3 h-10">
          <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="bg-transparent text-[11px] font-medium text-[#00152A] outline-none w-[110px]"
          />
          <ArrowRight className="w-3 h-3 text-gray-300 shrink-0" />
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="bg-transparent text-[11px] font-medium text-[#00152A] outline-none w-[110px]"
          />
          {(dateFrom || dateTo) && (
            <button
              onClick={() => {
                setDateFrom("");
                setDateTo("");
              }}
            >
              <X className="w-3 h-3 text-gray-400 hover:text-red-500" />
            </button>
          )}
        </div>
      </div>

      {/* Table - Desktop/Tablet */}
      <div className="hidden md:block bg-white rounded-lg border-l-4 border-l-[#00152A] shadow-sm overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse md:min-w-[900px]">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  Booking / Guest
                </th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  Provider
                </th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  Amount
                </th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  Status
                </th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  Event
                </th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  Time
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-3 text-gray-400">
                      <Inbox className="w-10 h-10" />
                      <p className="font-medium">No transactions found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((tx, idx) => (
                  <tr
                    key={`${tx.paymentId}-${idx}`}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-6 py-5">
                      <div className="space-y-0.5">
                        <p className="text-sm font-bold text-[#00152A]">
                          {tx.guestName ?? "—"}
                        </p>
                        <p className="text-[10px] text-gray-400 font-mono">
                          {tx.bookingRef ?? formatTxnId(tx.paymentId)}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        {tx.provider === "stripe" ? (
                          <CreditCard className="w-4 h-4 text-blue-500" />
                        ) : (
                          <Smartphone className="w-4 h-4 text-green-500" />
                        )}
                        <span className="text-xs font-medium text-gray-600 capitalize">
                          {tx.provider ?? "—"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-sm font-bold text-[#00152A]">
                        {formatMoney(Math.round(tx.amountMinor / 100))}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <Badge
                        className={cn(
                          "border-0 text-[8px] font-bold uppercase tracking-widest px-2 py-0.5",
                          STATUS_COLORS[tx.derivedStatus] ??
                            "bg-gray-50 text-gray-400",
                        )}
                      >
                        {tx.derivedStatus}
                      </Badge>
                    </td>
                    <td className="px-6 py-5 text-xs text-gray-500">
                      {EVENT_LABELS[tx.eventType] ?? tx.eventType}
                    </td>
                    <td className="px-6 py-5 text-[10px] text-gray-400 font-medium">
                      {new Date(tx.eventAt).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cards - Mobile */}
      <div className="md:hidden space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-12 flex flex-col items-center gap-3 text-gray-400">
            <Inbox className="w-10 h-10" />
            <p className="font-medium">No transactions found</p>
          </div>
        ) : (
          filtered.map((tx, idx) => (
            <div
              key={`${tx.paymentId}-${idx}-card`}
              className="bg-white rounded-lg border-l-4 border-l-[#00152A] shadow-sm border border-gray-100 p-4 space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-[#00152A] truncate">
                    {tx.guestName ?? "—"}
                  </p>
                  <p className="text-[10px] text-gray-400 font-mono">
                    {tx.bookingRef ?? formatTxnId(tx.paymentId)}
                  </p>
                </div>
                <Badge
                  className={cn(
                    "border-0 text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 shrink-0",
                    STATUS_COLORS[tx.derivedStatus] ??
                      "bg-gray-50 text-gray-400",
                  )}
                >
                  {tx.derivedStatus}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <p className="text-[9px] text-gray-400 uppercase tracking-wide font-bold mb-1">
                    Provider
                  </p>
                  <div className="flex items-center gap-2">
                    {tx.provider === "stripe" ? (
                      <CreditCard className="w-4 h-4 text-blue-500" />
                    ) : (
                      <Smartphone className="w-4 h-4 text-green-500" />
                    )}
                    <span className="font-medium text-gray-600 capitalize">
                      {tx.provider ?? "—"}
                    </span>
                  </div>
                </div>

                <div>
                  <p className="text-[9px] text-gray-400 uppercase tracking-wide font-bold mb-1">
                    Amount
                  </p>
                  <span className="text-sm font-bold text-[#00152A]">
                    {formatMoney(Math.round(tx.amountMinor / 100))}
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                <span className="text-gray-500">
                  {EVENT_LABELS[tx.eventType] ?? tx.eventType}
                </span>
                <span className="text-[10px] text-gray-400 font-medium">
                  {new Date(tx.eventAt).toLocaleString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
