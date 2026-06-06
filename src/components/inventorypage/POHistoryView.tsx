"use client";

import { poHistoryItems as mockPoHistoryItems, POHistoryItem } from "./reportsdata";

const statusBadge: Record<string, string> = {
  DRAFT:      "bg-gray-100 text-gray-600 border border-gray-200",
  SUBMITTED:  "bg-amber-50 text-amber-700 border border-amber-200",
  APPROVED:   "bg-blue-50 text-blue-700 border border-blue-200",
  RECEIVED:   "bg-green-50 text-green-700 border border-green-200",
  RECONCILED: "bg-gray-800 text-gray-100",
};

export function POHistoryView({
  items: poHistoryItems = mockPoHistoryItems,
}: { items?: POHistoryItem[] } = {}) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden mb-6">
      <div className="px-5 py-4 border-b border-gray-100">
        <h2 className="font-bold text-gray-900 text-base">Purchase Order History</h2>
        <p className="text-xs text-gray-400 mt-0.5">Complete log of all purchase orders</p>
      </div>

      <table className="w-full">
        <thead>
          <tr className="bg-gray-900 text-white text-xs uppercase tracking-widest">
            <th className="text-left px-5 py-3 font-semibold">PO Number</th>
            <th className="text-left px-4 py-3 font-semibold">Supplier</th>
            <th className="text-left px-4 py-3 font-semibold">Items</th>
            <th className="text-left px-4 py-3 font-semibold">Total Value</th>
            <th className="text-left px-4 py-3 font-semibold">Status</th>
            <th className="text-left px-4 py-3 font-semibold">Date</th>
          </tr>
        </thead>
        <tbody>
          {poHistoryItems.map((po: POHistoryItem, idx: number) => (
            <tr key={po.id} className={`border-b border-gray-100 last:border-0 ${idx % 2 === 0 ? "bg-white" : "bg-gray-50/40"}`}>
              <td className="px-5 py-4 text-sm font-bold text-gray-900">{po.poNumber}</td>
              <td className="px-4 py-4 text-sm text-gray-700">{po.supplier}</td>
              <td className="px-4 py-4 text-sm text-gray-500">{po.items}</td>
              <td className="px-4 py-4 text-sm font-semibold text-gray-900">{po.value}</td>
              <td className="px-4 py-4">
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide ${statusBadge[po.status]}`}>
                  {po.status}
                </span>
              </td>
              <td className="px-4 py-4 text-xs text-gray-400">{po.date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}