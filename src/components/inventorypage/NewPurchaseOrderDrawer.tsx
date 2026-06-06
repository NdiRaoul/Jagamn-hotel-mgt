"use client";

import { useState } from "react";
import { X, Plus, Trash2, CheckCircle2 } from "lucide-react";
import { SUPPLIERS, AVAILABLE_ITEMS } from "./purchaseData";

interface LineItem {
  id: string;
  name: string;
  category: string;
  unitLabel: string;
  qty: number;
  estUnitPrice: number;
}

interface AvailableItem {
  name: string;
  category: string;
  unitLabel: string;
}

function generateId() {
  return Math.random().toString(36).slice(2, 8);
}

const defaultLineItems: LineItem[] = [
  { id: "1", name: "Egyptian Cotton Sheets", category: "Textiles", unitLabel: "Units", qty: 24, estUnitPrice: 85 },
  { id: "2", name: "Silk Pillowcase Set", category: "Textiles", unitLabel: "Units", qty: 48, estUnitPrice: 42.5 },
];

interface NewPurchaseOrderDrawerProps {
  onClose: () => void;
  onSaveDraft: (data: { supplier: string; lineItems: LineItem[] }) => void;
  onSubmit: (data: { supplier: string; lineItems: LineItem[] }) => void;
}

export function NewPurchaseOrderDrawer({ onClose, onSaveDraft, onSubmit }: NewPurchaseOrderDrawerProps) {
  const [supplier, setSupplier] = useState("Grand Estates Linens Ltd.");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [notes, setNotes] = useState("");
  const [lineItems, setLineItems] = useState<LineItem[]>(defaultLineItems);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const draftOrderNo = "PO-2024-089";

  const estimatedTotal = lineItems.reduce(
    (sum: number, item: LineItem) => sum + item.qty * item.estUnitPrice,
    0
  );

  function updateLineItem(id: string, field: keyof LineItem, value: string | number) {
    setLineItems((prev: LineItem[]) =>
      prev.map((li: LineItem) => (li.id === id ? { ...li, [field]: value } : li))
    );
  }

  function addLineItem() {
    const template: AvailableItem = AVAILABLE_ITEMS[lineItems.length % AVAILABLE_ITEMS.length];
    setLineItems((prev: LineItem[]) => [
      ...prev,
      {
        id: generateId(),
        name: template.name,
        category: template.category,
        unitLabel: template.unitLabel,
        qty: 1,
        estUnitPrice: 0,
      },
    ]);
  }

  function removeLineItem(id: string) {
    setLineItems((prev: LineItem[]) => prev.filter((li: LineItem) => li.id !== id));
  }

  function handleSubmit() {
    setSubmitting(true);
    // TODO: POST /purchase-orders { supplier, deliveryDate, notes, lineItems, status: "SUBMITTED" }
    setTimeout(() => {
      setSubmitting(false);
      setDone(true);
      setTimeout(() => {
        onSubmit({ supplier, lineItems });
        onClose();
      }, 1200);
    }, 1000);
  }

  function handleSaveDraft() {
    // TODO: POST /purchase-orders { supplier, deliveryDate, notes, lineItems, status: "DRAFT" }
    onSaveDraft({ supplier, lineItems });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div className="flex-1 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Drawer */}
      <div className="w-130 bg-white h-full flex flex-col shadow-2xl">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold text-gray-900 text-base">New Purchase Order</h2>
              <p className="text-xs text-gray-400 mt-0.5">DRAFTING ORDER #{draftOrderNo}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* Supplier + Delivery Date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">
                Supplier
              </label>
              <select
                value={supplier}
                onChange={(e) => setSupplier(e.target.value)}
                className="w-full border border-gray-200 rounded-md px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-800 bg-white"
              >
                {SUPPLIERS.map((s: string) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">
                Expected Delivery Date
              </label>
              <input
                type="date"
                value={deliveryDate}
                onChange={(e) => setDeliveryDate(e.target.value)}
                className="w-full border border-gray-200 rounded-md px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-800"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">
              Notes / Reference
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add specific delivery instructions or budget codes..."
              rows={3}
              className="w-full border border-gray-200 rounded-md px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-800 resize-none placeholder:text-gray-300"
            />
          </div>

          {/* Line Items */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">
              Line Items
            </p>

            {/* Table header */}
            <div className="grid grid-cols-12 gap-2 text-[10px] font-bold uppercase tracking-wide text-gray-400 border-b border-gray-100 pb-2 mb-2">
              <span className="col-span-4">Item</span>
              <span className="col-span-2 text-center">Qty</span>
              <span className="col-span-3 text-center">Est. Unit</span>
              <span className="col-span-2 text-right">Subtotal</span>
              <span className="col-span-1" />
            </div>

            <div className="space-y-2">
              {lineItems.map((li: LineItem) => (
                <div
                  key={li.id}
                  className="grid grid-cols-12 gap-2 items-center py-1.5 border-b border-gray-50"
                >
                  {/* Item name + meta */}
                  <div className="col-span-4">
                    <select
                      value={li.name}
                      onChange={(e) => {
                        const found = AVAILABLE_ITEMS.find(
                          (i: AvailableItem) => i.name === e.target.value
                        );
                        if (found) updateLineItem(li.id, "name", found.name);
                      }}
                      className="w-full text-xs font-semibold text-gray-900 bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-gray-300 rounded"
                    >
                      {AVAILABLE_ITEMS.map((i: AvailableItem) => (
                        <option key={i.name} value={i.name}>
                          {i.name}
                        </option>
                      ))}
                    </select>
                    <p className="text-[10px] text-gray-400 ml-0.5">
                      {li.category} · {li.unitLabel}
                    </p>
                  </div>

                  {/* Qty */}
                  <div className="col-span-2">
                    <input
                      type="number"
                      min={1}
                      value={li.qty}
                      onChange={(e) =>
                        updateLineItem(li.id, "qty", parseInt(e.target.value) || 0)
                      }
                      className="w-full border border-gray-200 rounded px-2 py-1 text-xs text-center font-semibold text-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-800"
                    />
                  </div>

                  {/* Est Unit Price */}
                  <div className="col-span-3">
                    <div className="relative">
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                        $
                      </span>
                      <input
                        type="number"
                        min={0}
                        step={0.01}
                        value={li.estUnitPrice}
                        onChange={(e) =>
                          updateLineItem(
                            li.id,
                            "estUnitPrice",
                            parseFloat(e.target.value) || 0
                          )
                        }
                        className="w-full border border-gray-200 rounded pl-5 pr-2 py-1 text-xs text-center font-semibold text-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-800"
                      />
                    </div>
                  </div>

                  {/* Subtotal */}
                  <div className="col-span-2 text-right text-xs font-bold text-gray-900">
                    ${(li.qty * li.estUnitPrice).toFixed(2)}
                  </div>

                  {/* Remove */}
                  <div className="col-span-1 flex justify-end">
                    <button
                      onClick={() => removeLineItem(li.id)}
                      className="text-gray-300 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Item */}
            <button
              onClick={addLineItem}
              className="flex items-center gap-1.5 text-xs font-semibold text-amber-600 hover:text-amber-700 transition-colors mt-3"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Item
            </button>
          </div>

          {/* Estimated Total */}
          <div className="flex justify-end pt-2 border-t border-gray-100">
            <div className="text-right">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-0.5">
                Estimated Total
              </p>
              <p className="text-xl font-bold text-gray-900">
                ${estimatedTotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex gap-3 shrink-0">
          <button
            onClick={handleSaveDraft}
            className="flex-1 border border-gray-300 text-gray-700 rounded-md py-2.5 text-sm font-semibold hover:bg-gray-50 transition-colors"
          >
            Save as Draft
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting || done || !supplier}
            className={`flex-1 rounded-md py-2.5 text-sm font-bold transition-all flex items-center justify-center gap-2 ${
              done
                ? "bg-green-600 text-white"
                : submitting
                ? "bg-gray-400 text-white cursor-default"
                : "bg-amber-500 hover:bg-amber-400 text-white active:scale-95"
            }`}
          >
            {done ? (
              <>
                <CheckCircle2 className="w-4 h-4" /> Submitted!
              </>
            ) : submitting ? (
              "Submitting…"
            ) : (
              "Submit for Approval →"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}