"use client";

import { useState } from "react";
import { X, PackagePlus } from "lucide-react";
import { InventoryItem } from "./inventorydata";
import Image from "next/image";

interface UpdateStockModalProps {
  item: InventoryItem;
  onClose: () => void;
  onUpdate: (id: string, newStock: number) => void;
}

export function UpdateStockModal({ item, onClose, onUpdate }: UpdateStockModalProps) {
  const [value, setValue] = useState<string>(String(item.currentStock));
  const [saving, setSaving] = useState(false);

  function handleSave() {
    const parsed = parseInt(value);
    if (isNaN(parsed) || parsed < 0) return;
    setSaving(true);
    // TODO: replace with → PATCH /inventory/:id { currentStock: parsed }
    setTimeout(() => {
      onUpdate(item.id, parsed);
      onClose();
    }, 900);
  }

  const parsed = parseInt(value);
  const isValid = !isNaN(parsed) && parsed >= 0;
  const fillPct = isValid ? Math.min(100, Math.round((parsed / item.maxStock) * 100)) : 0;
  const barColor =
    fillPct >= 70 ? "bg-gray-800" : fillPct >= 35 ? "bg-amber-400" : "bg-red-500";

  return (
    <div
      className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <PackagePlus className="w-5 h-5 text-gray-800" />
            <h3 className="font-bold text-gray-900 text-base">Update Stock</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Item info */}
        <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-3 mb-5">
          <Image
            src={item.image}
            alt={item.name}
            width={56}
            height={56}
            className="w-12 h-12 rounded-md object-cover bg-gray-200"
          />
          <div>
            <p className="font-semibold text-gray-900 text-sm">{item.name}</p>
            <p className="text-xs text-gray-400">{item.unitLabel} &bull; {item.category}</p>
          </div>
        </div>

        {/* Input */}
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
          New Stock Quantity
        </label>
        <input
          type="number"
          min={0}
          max={item.maxStock}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-800 mb-1"
        />
        <p className="text-xs text-gray-400 mb-4">Max capacity: {item.maxStock} {item.unitLabel}</p>

        {/* Live preview bar */}
        <div className="mb-5">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>Stock level preview</span>
            <span>{isValid ? parsed : "—"} / {item.maxStock}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${barColor}`}
              style={{ width: `${fillPct}%` }}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 border border-gray-300 text-gray-700 rounded-md py-2.5 text-sm font-semibold hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!isValid || saving}
            className={`flex-1 rounded-md py-2.5 text-sm font-bold transition-all ${
              !isValid
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : saving
                ? "bg-green-600 text-white cursor-default"
                : "bg-gray-900 text-white hover:bg-gray-700 active:scale-95"
            }`}
          >
            {saving ? "Saving…" : "Update Stock"}
          </button>
        </div>
      </div>
    </div>
  );
}