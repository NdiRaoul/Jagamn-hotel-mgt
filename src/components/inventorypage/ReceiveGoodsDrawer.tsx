"use client";

import { useState } from "react";
import { X, PackageCheck, CheckCircle2 } from "lucide-react";
import Image from "next/image";

interface PO {
  id: string;
  poNumber: string;
  supplier: string;
}

interface ReceivableItem {
  id: string;
  name: string;
  image: string;
  orderedQty: number;
  receivedQty: number;
  notDelivered: boolean;
  isPerishable: boolean;
  batchNo: string;
  expiryDate: string;
}

const defaultItems: ReceivableItem[] = [
  {
    id: "1",
    name: "Heirloom Tomatoes",
    image: "https://images.unsplash.com/photo-1546470427-e26264be0b0d?w=60&h=60&fit=crop",
    orderedQty: 20,
    receivedQty: 20,
    notDelivered: false,
    isPerishable: true,
    batchNo: "",
    expiryDate: "",
  },
  {
    id: "2",
    name: "Organic Lemons",
    image: "https://images.unsplash.com/photo-1582087662770-c7ef40b8d751?w=60&h=60&fit=crop",
    orderedQty: 10,
    receivedQty: 10,
    notDelivered: false,
    isPerishable: true,
    batchNo: "",
    expiryDate: "",
  },
  {
    id: "3",
    name: "Mineral Water (bulk)",
    image: "https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=60&h=60&fit=crop",
    orderedQty: 50,
    receivedQty: 50,
    notDelivered: false,
    isPerishable: false,
    batchNo: "",
    expiryDate: "",
  },
];

interface ReceiveGoodsDrawerProps {
  po: PO;
  onClose: () => void;
  onConfirm: (poId: string) => void;
}

export function ReceiveGoodsDrawer({ po, onClose, onConfirm }: ReceiveGoodsDrawerProps) {
  const [items, setItems] = useState<ReceivableItem[]>(defaultItems);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  function updateItem(
    id: string,
    field: keyof ReceivableItem,
    value: string | number | boolean
  ) {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  }

  function handleConfirm() {
    setSaving(true);
    // TODO: POST /purchase-orders/:id/receive { items }
    setTimeout(() => {
      setSaving(false);
      setDone(true);
      setTimeout(() => {
        onConfirm(po.id);
        onClose();
      }, 1200);
    }, 1000);
  }

  const hasNotDelivered = items.some((item) => item.notDelivered);

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div className="flex-1 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Drawer */}
      <div className="w-full sm:max-w-md bg-white h-full flex flex-col shadow-2xl">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-start justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <PackageCheck className="w-4 h-4 text-gray-700" />
              <h2 className="font-bold text-gray-900 text-base">
                Receive Goods — {po.poNumber}
              </h2>
            </div>
            <p className="text-xs text-gray-400">{po.supplier}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 uppercase tracking-wide">
              Approved
            </span>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className={`border rounded-lg p-4 transition-all ${
                item.notDelivered
                  ? "border-gray-200 bg-gray-50 opacity-60"
                  : "border-gray-200 bg-white"
              }`}
            >
              <div className="flex items-center gap-3 mb-3">
                <Image
                  src={item.image}
                  alt={item.name}
                  width={56}
                  height={56}
                  className="w-10 h-10 rounded-md object-cover bg-gray-100 shrink-0"
                />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">{item.name}</p>
                  <p className="text-xs text-gray-400">Ordered: {item.orderedQty} units</p>
                </div>
                <label className="flex items-center gap-1.5 text-xs text-gray-500 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={item.notDelivered}
                    onChange={(e) =>
                      updateItem(item.id, "notDelivered", e.target.checked)
                    }
                    className="rounded border-gray-300"
                  />
                  Not Delivered
                </label>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wide text-gray-400 mb-1">
                    Qty Received
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={item.receivedQty}
                    disabled={item.notDelivered}
                    onChange={(e) =>
                      updateItem(item.id, "receivedQty", parseInt(e.target.value) || 0)
                    }
                    className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-800 disabled:bg-gray-100 disabled:text-gray-400"
                  />
                </div>

                {item.isPerishable && !item.notDelivered && (
                  <>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wide text-gray-400 mb-1">
                        Batch / Lot No.
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. BT-2024-001"
                        value={item.batchNo}
                        onChange={(e) =>
                          updateItem(item.id, "batchNo", e.target.value)
                        }
                        className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-800"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-[10px] font-bold uppercase tracking-wide text-gray-400 mb-1">
                        Expiry Date
                      </label>
                      <input
                        type="date"
                        value={item.expiryDate}
                        onChange={(e) =>
                          updateItem(item.id, "expiryDate", e.target.value)
                        }
                        className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-800"
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 shrink-0">
          {hasNotDelivered && (
            <p className="text-xs text-amber-600 mb-3 flex items-center gap-1.5">
              ⚠ Items marked Not Delivered will notify the Admin automatically.
            </p>
          )}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 border border-gray-300 text-gray-700 rounded-md py-2.5 text-sm font-semibold hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={saving || done}
              className={`flex-1 rounded-md py-2.5 text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                done
                  ? "bg-green-600 text-white"
                  : saving
                  ? "bg-gray-400 text-white cursor-default"
                  : "bg-gray-900 text-white hover:bg-gray-700 active:scale-95"
              }`}
            >
              {done ? (
                <>
                  <CheckCircle2 className="w-4 h-4" /> Confirmed!
                </>
              ) : saving ? (
                "Confirming…"
              ) : (
                "Confirm Receipt"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}