"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X, ImagePlus } from "lucide-react";
import { InventoryPageHeader } from "@/components/inventorypage/InventoryPageHeader";
import { InventoryTable } from "@/components/inventorypage/InventoryTable";
import { PredictiveStockAnalysis } from "@/components/inventorypage/PredictiveStockAnalysis";
import { ManualAuditCard } from "@/components/inventorypage/ManualAuditCard";
import type {
  InventoryItem,
  PredictiveItem,
} from "@/components/inventorypage/inventorydata";
import type { StoreInventoryItem, StoreKpis } from "@/lib/data/storekeeper";

const PLACEHOLDER =
  "https://images.unsplash.com/photo-1584736286279-5d85e4a8c45c?w=60&h=60&fit=crop";

function relative(ts: string | null): string {
  if (!ts) return "Never";
  const diff = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return days === 1 ? "Yesterday" : `${days} days ago`;
}

function toInventoryItem(i: StoreInventoryItem): InventoryItem {
  return {
    id: i.id,
    name: i.name,
    category: i.category ?? "Uncategorised",
    unitLabel: i.unit,
    currentStock: i.on_hand,
    maxStock: i.max_stock,
    status: i.status,
    lastSync: relative(i.last_counted_at),
    image: i.image_url ?? PLACEHOLDER,
  };
}

const EMPTY_FORM = {
  name: "",
  category: "",
  unit: "unit",
  on_hand: "0",
  reorder_level: "5",
  max_stock: "",
};

export default function InventoryClient({
  inventory,
  kpis,
}: {
  inventory: StoreInventoryItem[];
  kpis: StoreKpis;
}) {
  const router = useRouter();
  const [items, setItems] = useState<InventoryItem[]>(
    inventory.map(toInventoryItem),
  );

  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const predictiveItems: PredictiveItem[] = inventory
    .filter((i) => i.status !== "OPTIMAL")
    .slice(0, 3)
    .map((i) => ({
      id: i.id,
      name: i.name,
      status: i.status === "BELOW THRESHOLD" ? "HIGH RISK OF DEPLETION" : "MONITOR",
    }));

  const optimalPct =
    inventory.length > 0
      ? Math.round(
          (inventory.filter((i) => i.status === "OPTIMAL").length /
            inventory.length) *
            100,
        )
      : 0;

  async function handleUpdateStock(id: string, newStock: number) {
    await fetch(`/api/storekeeper/inventory/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ on_hand: newStock }),
    });
    router.refresh();
  }

  function onPickImage(file: File | null) {
    setImageFile(file);
    setImagePreview(file ? URL.createObjectURL(file) : null);
  }

  function resetForm() {
    setForm({ ...EMPTY_FORM });
    setImageFile(null);
    setImagePreview(null);
    setFormError(null);
  }

  async function handleCreate() {
    if (!form.name.trim()) {
      setFormError("Item name is required.");
      return;
    }
    setSaving(true);
    setFormError(null);
    try {
      let image_url: string | null = null;
      if (imageFile) {
        const fd = new FormData();
        fd.append("image", imageFile);
        const up = await fetch("/api/storekeeper/inventory/upload", {
          method: "POST",
          body: fd,
        });
        if (up.ok) {
          image_url = (await up.json()).image_url ?? null;
        }
      }
      const res = await fetch("/api/storekeeper/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          category: form.category.trim() || null,
          unit: form.unit.trim() || "unit",
          on_hand: Number(form.on_hand) || 0,
          reorder_level: Number(form.reorder_level) || 0,
          max_stock: form.max_stock ? Number(form.max_stock) : undefined,
          image_url,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setFormError(data.error || "Failed to add item.");
        return;
      }
      setShowAdd(false);
      resetForm();
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-4 sm:p-6 bg-jagamn-neutral min-h-screen">
      <div className="flex items-start justify-between gap-4 flex-wrap mb-2">
        <InventoryPageHeader
          criticalAlerts={kpis.criticalAlerts}
          activeSKUs={kpis.activeSkus}
        />
        <button
          onClick={() => setShowAdd(true)}
          className="h-11 px-5 rounded-lg bg-jagamn-primary text-white text-sm font-bold flex items-center gap-2 hover:bg-jagamn-primary/90 active:scale-95 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          Add Inventory
        </button>
      </div>

      <InventoryTable
        items={items}
        onItemsChange={setItems}
        onUpdateStock={handleUpdateStock}
      />

      <div className="flex flex-col lg:flex-row gap-4 mt-6 lg:items-stretch">
        <PredictiveStockAnalysis items={predictiveItems} occupancyPct={optimalPct} />
        <ManualAuditCard />
      </div>

      {/* ── Add Inventory Modal ───────────────────────── */}
      {showAdd && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
          onClick={() => !saving && setShowAdd(false)}
        >
          <div
            className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="manrope-bold text-lg text-jagamn-primary">
                Add Inventory Item
              </h3>
              <button
                onClick={() => !saving && setShowAdd(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Image upload */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">
                  Item Image
                </label>
                <label className="flex items-center gap-4 cursor-pointer">
                  <div className="w-16 h-16 rounded-lg bg-jagamn-neutral border border-gray-200 flex items-center justify-center overflow-hidden shrink-0">
                    {imagePreview ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={imagePreview}
                        alt="preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ImagePlus className="w-6 h-6 text-gray-400" />
                    )}
                  </div>
                  <span className="text-sm text-jagamn-secondary">
                    {imageFile ? imageFile.name : "Click to upload an image (optional)"}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => onPickImage(e.target.files?.[0] ?? null)}
                  />
                </label>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">
                  Name *
                </label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Egyptian Cotton Towels"
                  className="w-full border border-gray-200 rounded-md px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-jagamn-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">
                    Category
                  </label>
                  <input
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    placeholder="e.g. Textiles"
                    className="w-full border border-gray-200 rounded-md px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-jagamn-primary"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">
                    Unit
                  </label>
                  <input
                    value={form.unit}
                    onChange={(e) => setForm({ ...form, unit: e.target.value })}
                    placeholder="e.g. cases"
                    className="w-full border border-gray-200 rounded-md px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-jagamn-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">
                    On hand
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={form.on_hand}
                    onChange={(e) => setForm({ ...form, on_hand: e.target.value })}
                    className="w-full border border-gray-200 rounded-md px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-jagamn-primary"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">
                    Reorder at
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={form.reorder_level}
                    onChange={(e) =>
                      setForm({ ...form, reorder_level: e.target.value })
                    }
                    className="w-full border border-gray-200 rounded-md px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-jagamn-primary"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">
                    Max stock
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={form.max_stock}
                    onChange={(e) => setForm({ ...form, max_stock: e.target.value })}
                    placeholder="auto"
                    className="w-full border border-gray-200 rounded-md px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-jagamn-primary"
                  />
                </div>
              </div>

              {formError && (
                <p className="text-sm text-red-600">{formError}</p>
              )}
            </div>

            <div className="flex gap-3 pt-6">
              <button
                onClick={() => !saving && setShowAdd(false)}
                className="flex-1 border border-gray-300 text-jagamn-primary rounded-md py-2.5 text-sm font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={saving}
                className="flex-1 bg-jagamn-primary text-white rounded-md py-2.5 text-sm font-bold hover:bg-jagamn-primary/90 active:scale-95 transition-all disabled:opacity-60"
              >
                {saving ? "Saving…" : "Add Item"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
