"use client";

import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { StockAlert } from "./data";

const levelStyles: Record<string, { label: string; bar: string }> = {
  "CRITICAL LEVEL": { label: "text-red-600", bar: "bg-red-500" },
  "LOW INVENTORY": { label: "text-amber-600", bar: "bg-amber-400" },
};

interface AlertRowProps {
  alert: StockAlert;
  selected: boolean;
  onToggle: (id: string) => void;
}

function AlertRow({ alert, selected, onToggle }: AlertRowProps) {
  const style = levelStyles[alert.level];
  const fillPct = Math.min(100, Math.round((alert.currentUnits / alert.minUnits) * 100));

  return (
    <div
      className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0 cursor-pointer group"
      onClick={() => onToggle(alert.id)}
    >
      <div className={`mt-0.5 w-4 h-4 rounded border shrink-0 flex items-center justify-center transition-colors ${
        selected ? "bg-gray-900 border-gray-900" : "border-gray-300 group-hover:border-gray-500"
      }`}>
        {selected && (
          <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 12 12">
            <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className={`text-[10px] font-bold uppercase tracking-widest mb-0.5 ${style.label}`}>
          {alert.level}
        </p>
        <p className="text-sm font-semibold text-gray-900 leading-tight mb-1.5">
          {alert.name}
        </p>
        <div className="w-full bg-gray-200 rounded-full h-1.5 mb-1">
          <div className={`h-1.5 rounded-full ${style.bar}`} style={{ width: `${fillPct}%` }} />
        </div>
        <p className="text-[10px] text-gray-400">
          Currently: {alert.currentUnits} units | Min: {alert.minUnits}
        </p>
      </div>
    </div>
  );
}

interface LowStockAlertsProps {
  alerts: StockAlert[];
}

export function LowStockAlerts({ alerts: initialAlerts }: LowStockAlertsProps) {
  const [alerts, setAlerts] = useState<StockAlert[]>(initialAlerts);
  const [restocking, setRestocking] = useState(false);

  const selectedIds = alerts.filter((a) => a.selected).map((a) => a.id);

  function handleToggle(id: string) {
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, selected: !a.selected } : a)));
  }

  function handleBatchRestock() {
    if (selectedIds.length === 0) return;
    setRestocking(true);
    // TODO: replace with → POST /purchase-orders/batch { itemIds: selectedIds }
    setTimeout(() => {
      setAlerts((prev) => prev.map((a) => ({ ...a, selected: false })));
      setRestocking(false);
    }, 1200);
  }

  return (
    <div className="w-full lg:w-72 lg:shrink-0">
      <div className="flex items-center gap-2 mb-3">
        <AlertTriangle className="w-4 h-4 text-amber-500" />
        <h2 className="font-bold text-gray-900">Low Stock Alerts</h2>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
        {alerts.map((alert) => (
          <AlertRow key={alert.id} alert={alert} selected={alert.selected} onToggle={handleToggle} />
        ))}

        <button
          onClick={handleBatchRestock}
          disabled={selectedIds.length === 0 || restocking}
          className={`mt-4 w-full border rounded-md py-2.5 text-sm font-semibold transition-all ${
            selectedIds.length === 0
              ? "border-gray-200 text-gray-300 cursor-not-allowed"
              : restocking
              ? "border-green-500 text-green-600 cursor-default"
              : "border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white active:scale-95"
          }`}
        >
          {restocking
            ? "Creating POs…"
            : selectedIds.length > 0
            ? `Batch Restock (${selectedIds.length} selected)`
            : "Batch Restock Selected"}
        </button>
      </div>
    </div>
  );
}