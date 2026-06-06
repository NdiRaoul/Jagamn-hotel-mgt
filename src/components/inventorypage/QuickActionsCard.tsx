"use client";

import { FileInput } from "lucide-react";

interface QuickActionsCardProps {
  onNewPO: () => void;
  onImportTemplate: () => void;
}

export function QuickActionsCard({ onNewPO, onImportTemplate }: QuickActionsCardProps) {
  return (
    <div className="w-72 shrink-0 bg-gray-900 rounded-xl p-6 shadow-sm flex flex-col justify-between">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">
          Quick Action
        </p>
        <h2 className="text-xl font-bold text-white mb-3">Create Purchase Order</h2>
        <p className="text-sm text-gray-400 leading-relaxed">
          Create a new procurement request from authorised vendors or duplicate from previous orders.
        </p>
      </div>

      <div className="mt-6 space-y-3">
        <button
          onClick={onNewPO}
          className="w-full bg-amber-500 hover:bg-amber-400 active:scale-95 text-white font-bold py-3 rounded-lg text-sm transition-all"
        >
          + New Purchase Order
        </button>
        <button
          onClick={onImportTemplate}
          className="w-full border border-gray-600 text-gray-300 hover:border-gray-400 hover:text-white font-semibold py-2.5 rounded-lg text-sm transition-all flex items-center justify-center gap-2"
        >
          <FileInput className="w-3.5 h-3.5" />
          Import from Template
        </button>
      </div>
    </div>
  );
}