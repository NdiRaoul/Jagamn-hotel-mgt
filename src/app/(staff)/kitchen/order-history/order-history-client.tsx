"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import type { OrderHistoryEntry } from "@/lib/data/kitchen";
import { formatMoney } from "@/lib/currency";
import { Button } from "@/components/ui/button";
import {
  History,
  Filter,
  X,
  PackageCheck,
  Receipt,
  CalendarDays,
  Download,
  FileText,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { jsPDF } from "jspdf";

export default function OrderHistoryClient({
  orders,
  roomTypes,
  filters,
}: {
  orders: OrderHistoryEntry[];
  roomTypes: string[];
  filters: { from: string; to: string; roomType: string };
}) {
  const router = useRouter();
  const [from, setFrom] = useState(filters.from);
  const [to, setTo] = useState(filters.to);
  const [roomType, setRoomType] = useState(filters.roomType || "all");

  const hasActiveFilters =
    Boolean(filters.from) ||
    Boolean(filters.to) ||
    (filters.roomType && filters.roomType !== "all");

  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;
  const pageCount = Math.max(1, Math.ceil(orders.length / rowsPerPage));
  const currentPageNumber = Math.min(currentPage, pageCount);

  const paginatedOrders = useMemo(() => {
    const start = (currentPageNumber - 1) * rowsPerPage;
    return orders.slice(start, start + rowsPerPage);
  }, [currentPageNumber, orders]);

  const applyFilters = () => {
    const params = new URLSearchParams();
    // Date inputs are day-only; widen `to` to the end of that day so the
    // whole day's deliveries are included.
    if (from) params.set("from", new Date(from).toISOString());
    if (to) {
      const end = new Date(to);
      end.setHours(23, 59, 59, 999);
      params.set("to", end.toISOString());
    }
    if (roomType && roomType !== "all") params.set("roomType", roomType);
    router.push(`/kitchen/order-history?${params.toString()}`);
  };

  const clearFilters = () => {
    setFrom("");
    setTo("");
    setRoomType("all");
    router.push("/kitchen/order-history");
  };

  const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const totalItems = orders.reduce((sum, o) => sum + o.itemCount, 0);

  const csvRows = orders.map((order) => [
    order.displayId,
    order.guestName,
    order.guestRoom ?? "",
    order.roomType ?? "",
    order.items.map((i) => `${i.quantity}x ${i.name}`).join("; "),
    formatMoney(order.totalAmount),
    new Date(order.deliveredAt).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }),
  ]);

  const escapeCsv = (value: string | number) =>
    `"${String(value).replace(/"/g, '""')}"`;

  const toCsv = () => {
    const headers = [
      "Order",
      "Guest",
      "Room",
      "Room Type",
      "Items",
      "Total",
      "Delivered",
    ];
    return [headers, ...csvRows]
      .map((row) => row.map(escapeCsv).join(","))
      .join("\n");
  };

  const downloadFile = (
    filename: string,
    content: string | Blob,
    type: string,
  ) => {
    const blob =
      content instanceof Blob ? content : new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportCsv = () => {
    downloadFile(
      `kitchen-order-history-${new Date().toISOString().split("T")[0]}.csv`,
      toCsv(),
      "text/csv;charset=utf-8;",
    );
  };

  const exportPdf = () => {
    const doc = new jsPDF({ orientation: "landscape" });
    doc.setFontSize(16);
    doc.text("Jagamn Palace — Kitchen Order History", 14, 18);
    doc.setFontSize(11);
    doc.text(`Exported ${new Date().toLocaleString()}`, 14, 26);

    const headers = [
      "Order",
      "Guest",
      "Room",
      "Room Type",
      "Items",
      "Total",
      "Delivered",
    ];

    let y = 36;
    const colWidths = [30, 30, 20, 25, 70, 25, 35];
    const colX = colWidths.reduce<number[]>((acc, width, index) => {
      if (index === 0) return [14];
      return [...acc, acc[index - 1] + colWidths[index - 1]];
    }, []);

    doc.setFont("helvetica", "bold");
    headers.forEach((header, index) => {
      doc.text(header, colX[index], y);
    });

    doc.setFont("helvetica", "normal");
    y += 7;

    csvRows.forEach((row) => {
      if (y > 190) {
        doc.addPage();
        y = 20;
      }
      row.forEach((cell, index) => {
        const text = String(cell).slice(0, Math.floor(colWidths[index] / 3));
        doc.text(text, colX[index], y);
      });
      y += 7;
    });

    downloadFile(
      `kitchen-order-history-${new Date().toISOString().split("T")[0]}.pdf`,
      doc.output("blob"),
      "application/pdf",
    );
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
      {/* ── Header ─────────────────────────── */}
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl bg-[#00152A] flex items-center justify-center">
          <History className="w-5 h-5 text-[#BA722E]" />
        </div>
        <div>
          <h1 className="manrope-bold text-4xl text-[#00152A]">
            Order History
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Delivered dining orders, filterable by date and room type
          </p>
        </div>
      </div>

      {/* ── Summary Stats ──────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-[#E6F4EA] flex items-center justify-center">
            <PackageCheck className="w-5 h-5 text-[#1B7F34]" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Delivered
            </p>
            <p className="manrope-bold text-2xl text-[#00152A]">
              {orders.length}
            </p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-[#FFF4E8] flex items-center justify-center">
            <Receipt className="w-5 h-5 text-[#BA722E]" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Total Revenue
            </p>
            <p className="manrope-bold text-2xl text-[#00152A]">
              {formatMoney(totalRevenue)}
            </p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
            <CalendarDays className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Items Served
            </p>
            <p className="manrope-bold text-2xl text-[#00152A]">{totalItems}</p>
          </div>
        </div>
      </div>

      {/* ── Filters ────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Filter Orders
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              onClick={exportCsv}
              className="h-10 rounded-lg font-bold text-sm px-4"
            >
              <FileText className="w-4 h-4" /> Export CSV
            </Button>
            <Button
              onClick={exportPdf}
              className="h-10 rounded-lg font-bold text-sm px-4"
            >
              <Download className="w-4 h-4" /> Export PDF
            </Button>
          </div>
        </div>
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-500">From</label>
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#00152A] focus:border-transparent"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-500">To</label>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#00152A] focus:border-transparent"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-500">
              Room Type
            </label>
            <select
              value={roomType}
              onChange={(e) => setRoomType(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#00152A] focus:border-transparent bg-white min-w-[160px]"
            >
              <option value="all">All Room Types</option>
              {roomTypes.map((rt) => (
                <option key={rt} value={rt}>
                  {rt}
                </option>
              ))}
            </select>
          </div>
          <Button
            onClick={applyFilters}
            className="bg-[#00152A] hover:bg-[#0A2038] text-white h-10 rounded-lg font-bold text-sm px-6"
          >
            Apply
          </Button>
          {hasActiveFilters && (
            <Button
              onClick={clearFilters}
              variant="outline"
              className="h-10 rounded-lg font-bold text-sm px-4 flex items-center gap-1.5"
            >
              <X className="w-3.5 h-3.5" />
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* ── Orders Table ───────────────────── */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-300">
            <History className="w-10 h-10" />
            <p className="text-sm font-medium text-gray-400">
              No delivered orders match these filters.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest px-5 py-3">
                      Order
                    </th>
                    <th className="text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest px-5 py-3">
                      Guest
                    </th>
                    <th className="text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest px-5 py-3">
                      Room
                    </th>
                    <th className="text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest px-5 py-3">
                      Room Type
                    </th>
                    <th className="text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest px-5 py-3">
                      Items
                    </th>
                    <th className="text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest px-5 py-3">
                      Total
                    </th>
                    <th className="text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest px-5 py-3">
                      Delivered
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="px-5 py-4 font-bold text-[#00152A] whitespace-nowrap">
                        {order.displayId}
                      </td>
                      <td className="px-5 py-4 text-[#00152A]">
                        {order.guestName}
                      </td>
                      <td className="px-5 py-4 text-gray-500 whitespace-nowrap">
                        {order.guestRoom ? `Room ${order.guestRoom}` : "—"}
                      </td>
                      <td className="px-5 py-4 text-gray-500 whitespace-nowrap">
                        {order.roomType || "—"}
                      </td>
                      <td className="px-5 py-4 text-gray-500 max-w-[280px]">
                        <span className="line-clamp-1">
                          {order.items
                            .map((i) => `${i.quantity}x ${i.name}`)
                            .join(", ")}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right font-bold text-[#00152A] whitespace-nowrap">
                        {formatMoney(order.totalAmount)}
                      </td>
                      <td className="px-5 py-4 text-gray-500 whitespace-nowrap">
                        {new Date(order.deliveredAt).toLocaleString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-gray-500">
                Showing {paginatedOrders.length} of {orders.length} delivered
                orders
              </p>
              <div className="inline-flex rounded-lg border border-gray-200 overflow-hidden">
                <button
                  type="button"
                  disabled={currentPageNumber === 1}
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  className="px-3 py-2 text-sm font-semibold text-[#00152A] disabled:text-gray-400 disabled:bg-gray-100"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="px-3 py-2 text-sm text-gray-600 bg-gray-50">
                  Page {currentPageNumber} of {pageCount}
                </span>
                <button
                  type="button"
                  disabled={currentPageNumber === pageCount}
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, pageCount))
                  }
                  className="px-3 py-2 text-sm font-semibold text-[#00152A] disabled:text-gray-400 disabled:bg-gray-100"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
