"use client";

import { ShoppingCart, PackageOpen } from "lucide-react";

interface PurchaseOrdersHeaderProps {
  openOrders: number;
  pendingReceipt: number;
}

export function PurchaseOrdersHeader({ openOrders, pendingReceipt }: PurchaseOrdersHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
      <div>
        <p className="text-xs font-semibold tracking-widest text-gray-400 uppercase mb-1">
          Procurement
        </p>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Purchase Orders</h1>
      </div>

      <div className="flex gap-3 flex-shrink-0">
        <div className="flex items-center gap-3 border border-amber-300 bg-amber-50 rounded-lg px-5 py-3">
          <div className="w-8 h-8 rounded-md bg-amber-400 flex items-center justify-center shrink-0">
            <ShoppingCart className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-amber-600">
              Open Orders
            </p>
            <p className="text-xl font-bold text-gray-900">{openOrders}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 border border-gray-200 bg-white rounded-lg px-5 py-3">
          <div className="w-8 h-8 rounded-md bg-gray-800 flex items-center justify-center shrink-0">
            <PackageOpen className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
              Pending Receipt
            </p>
            <p className="text-xl font-bold text-gray-900">{pendingReceipt}</p>
          </div>
        </div>
      </div>
    </div>
  );
}