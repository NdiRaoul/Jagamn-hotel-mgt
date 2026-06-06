"use client";

import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { InventoryItem, ItemCategory } from "./inventorydata";
import { UpdateStockModal } from "./UpdateStockModal";
import Image from "next/image";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const statusStyles: Record<string, { dot: string; label: string }> = {
  OPTIMAL:           { dot: "bg-green-500",  label: "text-green-600" },
  "BELOW THRESHOLD": { dot: "bg-amber-500",  label: "text-amber-600" },
  "REORDER PENDING": { dot: "bg-orange-500", label: "text-orange-600" },
};

const categoryStyles: Record<string, string> = {
  Textiles:    "bg-blue-50 text-blue-700 border border-blue-200",
  Consumables: "bg-purple-50 text-purple-700 border border-purple-200",
  Maintenance: "bg-gray-100 text-gray-600 border border-gray-200",
};

type SortOption = "Stock Level (Low to High)" | "Stock Level (High to Low)" | "Name (A-Z)";
type TabOption = "All Items" | ItemCategory;
const TABS: TabOption[] = ["All Items", "Consumables", "Maintenance", "Textiles"];
const SORT_OPTIONS: SortOption[] = [
  "Stock Level (Low to High)",
  "Stock Level (High to Low)",
  "Name (A-Z)",
];
const PAGE_SIZE = 4;

// ─── Stock bar ────────────────────────────────────────────────────────────────
function StockBar({ current, max }: { current: number; max: number }) {
  const pct = Math.min(100, Math.round((current / max) * 100));
  const color = pct >= 70 ? "bg-gray-800" : pct >= 35 ? "bg-amber-400" : "bg-red-500";
  return (
    <div className="flex items-center gap-2 w-full">
      <div className="flex-1 bg-gray-200 rounded-full h-1.5">
        <div className={`h-1.5 rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className={`text-sm font-bold whitespace-nowrap ${pct < 35 ? "text-red-500" : pct < 70 ? "text-amber-500" : "text-gray-900"}`}>
        {current} / {max}
      </span>
    </div>
  );
}

// ─── Table ────────────────────────────────────────────────────────────────────
interface InventoryTableProps {
  items: InventoryItem[];
  onItemsChange: (items: InventoryItem[]) => void;
  onUpdateStock?: (id: string, newStock: number) => void;
}

export function InventoryTable({ items, onItemsChange, onUpdateStock }: InventoryTableProps) {
  const [activeTab, setActiveTab] = useState<TabOption>("All Items");
  const [sortBy, setSortBy] = useState<SortOption>("Stock Level (Low to High)");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  // Filter
  const filtered = useMemo(() => {
    return activeTab === "All Items"
      ? items
      : items.filter((i) => i.category === activeTab);
  }, [items, activeTab]);

  // Sort
  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      if (sortBy === "Stock Level (Low to High)")
        return a.currentStock / a.maxStock - b.currentStock / b.maxStock;
      if (sortBy === "Stock Level (High to Low)")
        return b.currentStock / b.maxStock - a.currentStock / a.maxStock;
      return a.name.localeCompare(b.name);
    });
  }, [filtered, sortBy]);

  // Paginate
  const totalPages = Math.ceil(sorted.length / PAGE_SIZE);
  const paginated = sorted.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  function handleTabChange(tab: TabOption) {
    setActiveTab(tab);
    setCurrentPage(1);
  }

  function handleUpdate(id: string, newStock: number) {
    onUpdateStock?.(id, newStock);
    onItemsChange(
      items.map((item) => (item.id === id ? { ...item, currentStock: newStock } : item))
    );
  }

  return (
    <>
      {/* Modal */}
      {selectedItem && (
        <UpdateStockModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onUpdate={handleUpdate}
        />
      )}

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        {/* Tabs + Sort */}
        <div className="flex items-center justify-between px-5 pt-4 pb-0">
          <div className="flex gap-1">
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

          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span className="font-medium">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="text-sm font-semibold text-gray-700 bg-transparent border-none focus:outline-none cursor-pointer"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt}>{opt}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
        <table className="w-full mt-3 min-w-[640px]">
          <thead>
            <tr className="bg-gray-900 text-white text-xs uppercase tracking-widest">
              <th className="text-left px-5 py-3 font-semibold w-[32%]">Item Description</th>
              <th className="text-left px-4 py-3 font-semibold w-[14%]">Category</th>
              <th className="text-left px-4 py-3 font-semibold w-[14%]">Units</th>
              <th className="text-left px-4 py-3 font-semibold w-[20%]">Stock Level</th>
              <th className="text-left px-4 py-3 font-semibold w-[10%]">Last Sync</th>
              <th className="text-left px-4 py-3 font-semibold w-[10%]">Action</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((item, idx) => {
              const st = statusStyles[item.status];
              return (
                <tr
                  key={item.id}
                  className={`border-b border-gray-100 last:border-0 ${idx % 2 === 0 ? "bg-white" : "bg-gray-50/50"}`}
                >
                  {/* Item Description */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <Image
                        src={item.image}
                        alt={item.name}
                        width={56}
                        height={56}
                        className="w-10 h-10 rounded-md object-cover bg-gray-100 shrink-0"
                      />
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{item.name}</p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${st.dot}`} />
                          <span className={`text-[10px] font-bold uppercase tracking-wide ${st.label}`}>
                            {item.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="px-4 py-4">
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide ${categoryStyles[item.category]}`}>
                      {item.category}
                    </span>
                  </td>

                  {/* Units */}
                  <td className="px-4 py-4 text-sm text-gray-600">{item.unitLabel}</td>

                  {/* Stock Level */}
                  <td className="px-4 py-4">
                    <StockBar current={item.currentStock} max={item.maxStock} />
                  </td>

                  {/* Last Sync */}
                  <td className="px-4 py-4 text-xs text-gray-400">{item.lastSync}</td>

                  {/* Action */}
                  <td className="px-4 py-4">
                    <button
                      onClick={() => setSelectedItem(item)}
                      className="bg-gray-900 text-white text-xs font-bold px-4 py-2 rounded-md hover:bg-gray-700 active:scale-95 transition-all whitespace-nowrap"
                    >
                      Update Stock
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100">
          <p className="text-xs text-gray-400">
            Showing {Math.min((currentPage - 1) * PAGE_SIZE + 1, sorted.length)} to{" "}
            {Math.min(currentPage * PAGE_SIZE, sorted.length)} of {sorted.length} entries
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="w-8 h-8 flex items-center justify-center rounded border border-gray-200 text-gray-400 hover:border-gray-400 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-8 h-8 rounded border text-sm font-semibold transition-colors ${
                  page === currentPage
                    ? "bg-gray-900 text-white border-gray-900"
                    : "border-gray-200 text-gray-600 hover:border-gray-400"
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="w-8 h-8 flex items-center justify-center rounded border border-gray-200 text-gray-400 hover:border-gray-400 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}