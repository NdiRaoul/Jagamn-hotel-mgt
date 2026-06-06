"use client";

import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PurchaseOrder, POStatus, TabFilter } from "./purchaseData";
import { POActionMenu } from "./POActionMenu";

const TABS: TabFilter[] = ["All Orders", "Drafts", "Submitted", "Approved", "Received", "Reconciled"];
const PAGE_SIZE = 5;

const TAB_TO_STATUS: Record<TabFilter, POStatus | null> = {
  "All Orders": null,
  "Drafts": "DRAFT",
  "Submitted": "SUBMITTED",
  "Approved": "APPROVED",
  "Received": "RECEIVED",
  "Reconciled": "RECONCILED",
};

const statusBadge: Record<POStatus, string> = {
  DRAFT:       "bg-gray-100 text-gray-600 border border-gray-200",
  SUBMITTED:   "bg-amber-50 text-amber-700 border border-amber-200",
  APPROVED:    "bg-blue-50 text-blue-700 border border-blue-200",
  RECEIVED:    "bg-green-50 text-green-700 border border-green-200",
  RECONCILED:  "bg-gray-800 text-gray-100",
};

interface PurchaseOrdersTableProps {
  orders: PurchaseOrder[];
  onReceiveGoods: (po: PurchaseOrder) => void;
  onEdit: (po: PurchaseOrder) => void;
}

export function PurchaseOrdersTable({ orders, onReceiveGoods, onEdit }: PurchaseOrdersTableProps) {
  const [activeTab, setActiveTab] = useState<TabFilter>("All Orders");
  const [currentPage, setCurrentPage] = useState(1);

  const filtered = useMemo(() => {
    const statusFilter = TAB_TO_STATUS[activeTab];
    return statusFilter ? orders.filter((o) => o.status === statusFilter) : orders;
  }, [orders, activeTab]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  function handleTabChange(tab: TabFilter) {
    setActiveTab(tab);
    setCurrentPage(1);
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      {/* Tabs */}
      <div className="flex items-center gap-1 px-5 pt-4 pb-0 flex-wrap">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => handleTabChange(tab)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
              activeTab === tab
                ? "bg-gray-900 text-white"
                : "text-gray-500 hover:text-gray-800 hover:bg-gray-100"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Table */}
      <table className="w-full mt-3">
        <thead>
          <tr className="bg-gray-900 text-white text-xs uppercase tracking-widest">
            <th className="text-left px-5 py-3 font-semibold w-[12%]">PO Number</th>
            <th className="text-left px-4 py-3 font-semibold w-[24%]">Supplier</th>
            <th className="text-left px-4 py-3 font-semibold w-[8%]">Items</th>
            <th className="text-left px-4 py-3 font-semibold w-[14%]">Total Value</th>
            <th className="text-left px-4 py-3 font-semibold w-[14%]">Status</th>
            <th className="text-left px-4 py-3 font-semibold w-[14%]">Date</th>
            <th className="text-left px-4 py-3 font-semibold w-[14%]">Action</th>
          </tr>
        </thead>
        <tbody>
          {paginated.length === 0 ? (
            <tr>
              <td colSpan={7} className="text-center py-12 text-sm text-gray-400">
                No orders in this category
              </td>
            </tr>
          ) : (
            paginated.map((order, idx) => (
              <tr
                key={order.id}
                className={`border-b border-gray-100 last:border-0 ${idx % 2 === 0 ? "bg-white" : "bg-gray-50/40"}`}
              >
                <td className="px-5 py-4 text-sm font-bold text-gray-900">{order.poNumber}</td>
                <td className="px-4 py-4 text-sm text-gray-700">{order.supplier}</td>
                <td className="px-4 py-4 text-sm text-gray-500">{String(order.items).padStart(2, "0")}</td>
                <td className="px-4 py-4 text-sm font-semibold text-gray-900">{order.totalValue}</td>
                <td className="px-4 py-4">
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide ${statusBadge[order.status]}`}>
                    {order.status}
                  </span>
                </td>
                <td className="px-4 py-4 text-xs text-gray-400">{order.date}</td>
                <td className="px-4 py-4">
                  {order.status === "APPROVED" ? (
                    <button
                      onClick={() => onReceiveGoods(order)}
                      className="bg-gray-900 text-white text-xs font-bold px-3 py-1.5 rounded-md hover:bg-gray-700 active:scale-95 transition-all whitespace-nowrap"
                    >
                      Receive Goods
                    </button>
                  ) : (
                    <POActionMenu
                      status={order.status}
                      onView={() => console.log("View", order.poNumber)}
                      onEdit={() => onEdit(order)}
                      onReceiveGoods={() => onReceiveGoods(order)}
                      onViewGRN={() => console.log("View GRN", order.poNumber)}
                      onDelete={() => console.log("Delete", order.poNumber)}
                    />
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100">
        <p className="text-xs text-gray-400">
          Showing {filtered.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1} to{" "}
          {Math.min(currentPage * PAGE_SIZE, filtered.length)} of {filtered.length} entries
        </p>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="w-8 h-8 flex items-center justify-center rounded border border-gray-200 text-gray-400 hover:border-gray-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          {Array.from({ length: Math.max(1, totalPages) }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`w-8 h-8 rounded border text-sm font-semibold transition-colors ${
                page === currentPage ? "bg-gray-900 text-white border-gray-900" : "border-gray-200 text-gray-600 hover:border-gray-400"
              }`}
            >
              {page}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages || totalPages === 0}
            className="w-8 h-8 flex items-center justify-center rounded border border-gray-200 text-gray-400 hover:border-gray-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}