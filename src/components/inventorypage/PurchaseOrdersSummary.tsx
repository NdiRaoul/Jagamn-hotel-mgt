"use client";

import { PurchaseOrder, POStatus } from "./data";

const badgeStyles: Record<string, string> = {
  "Pending Finance": "text-amber-600",
  "Vendor Review":   "text-amber-600",
  "Expected 2 PM":   "text-green-600",
  "In Transit":      "text-green-600",
};

const columnAccent: Record<POStatus, string> = {
  DRAFTS:    "border-t-gray-400",
  SUBMITTED: "border-t-amber-400",
  APPROVED:  "border-t-green-500",
};

const countColour: Record<POStatus, string> = {
  DRAFTS:    "text-gray-900",
  SUBMITTED: "text-amber-500",
  APPROVED:  "text-green-600",
};

interface ColumnProps {
  status: POStatus;
  count: number;
  orders: PurchaseOrder[];
  onOrderClick: (id: string) => void;
}

function POColumn({ status, count, orders, onOrderClick }: ColumnProps) {
  return (
    <div className={`flex-1 bg-white border border-gray-200 border-t-4 rounded-lg p-5 shadow-sm ${columnAccent[status]}`}>
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-bold tracking-widest text-gray-500 uppercase">{status}</p>
        <p className={`text-2xl font-bold ${countColour[status]}`}>
          {String(count).padStart(2, "0")}
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {orders.map((po) => (
          <button
            key={po.id}
            onClick={() => onOrderClick(po.id)}
            className="flex items-center justify-between w-full text-left hover:bg-gray-50 rounded px-1 py-0.5 transition-colors group"
          >
            <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">
              PO #{po.id} – {po.name}
            </span>
            {po.amount && (
              <span className="text-sm font-semibold text-gray-900">{po.amount}</span>
            )}
            {po.badge && (
              <span className={`text-xs font-semibold ${badgeStyles[po.badge] ?? "text-gray-500"}`}>
                {po.badge}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

const COLUMNS: POStatus[] = ["DRAFTS", "SUBMITTED", "APPROVED"];

interface PurchaseOrdersSummaryProps {
  orders: PurchaseOrder[];
  onViewOrder: (id: string) => void;
}

export function PurchaseOrdersSummary({ orders, onViewOrder }: PurchaseOrdersSummaryProps) {
  return (
    <div className="mt-8">
      <h2 className="font-bold text-gray-900 mb-4 text-base">Purchase Orders Summary</h2>
      <div className="flex flex-col lg:flex-row gap-4">
        {COLUMNS.map((col) => {
          const colOrders = orders.filter((o) => o.column === col);
          return (
            <POColumn
              key={col}
              status={col}
              count={colOrders.length}
              orders={colOrders}
              onOrderClick={onViewOrder}
            />
          );
        })}
      </div>
    </div>
  );
}