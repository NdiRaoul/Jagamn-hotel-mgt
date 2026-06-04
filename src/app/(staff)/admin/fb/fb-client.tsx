"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Plus,
  Search,
  Trash2,
  EyeOff,
  Eye,
  Utensils,
  AlertTriangle,
  Upload,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import type { FBSummaryItem } from "@/lib/data/admin";

// Local menu state — seeded from DB items (empty until food_and_beverage_items table is created)
interface LocalMenuItem extends FBSummaryItem {
  description?: string;
  image?: string;
}

const CATEGORIES = [
  "All Items",
  "Breakfast",
  "Main Course",
  "Wine & Spirits",
  "Desserts",
  "Room Service Only",
];

interface Props {
  summary: { items: FBSummaryItem[]; totalItems: number; outOfStock: number };
  error: string | null;
}

export default function FBClient({ summary, error }: Props) {
  const [items, setItems] = useState<LocalMenuItem[]>(summary.items);
  const [activeCategory, setActiveCategory] = useState("All Items");
  const [searchQuery, setSearchQuery] = useState("");

  // Sync if server-pushed new items
  useEffect(() => {
    setItems(summary.items);
  }, [summary.items]);

  useEffect(() => {
    const handler = (e: CustomEvent<string>) => setSearchQuery(e.detail || "");
    window.addEventListener("jagamn-global-search", handler as EventListener);
    return () =>
      window.removeEventListener(
        "jagamn-global-search",
        handler as EventListener,
      );
  }, []);

  const toggleStatus = (id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              status:
                item.status === "available" ? "out_of_stock" : "available",
            }
          : item,
      ),
    );
  };

  const deleteItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const filteredItems = useMemo(
    () =>
      items.filter((item) => {
        const q = searchQuery.toLowerCase();
        const matchSearch =
          !searchQuery ||
          item.name.toLowerCase().includes(q) ||
          item.id.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q) ||
          item.status.toLowerCase().includes(q);
        const matchCat =
          activeCategory === "All Items" || item.category === activeCategory;
        return matchSearch && matchCat;
      }),
    [items, searchQuery, activeCategory],
  );

  const liveCount = items.filter((i) => i.status === "available").length;
  const outOfStockCount = items.filter(
    (i) => i.status === "out_of_stock",
  ).length;

  return (
    <div className="space-y-12 pb-20 animate-in fade-in duration-700">
      {/* ── Header ───────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div className="space-y-2">
          <p className="text-[10px] font-black text-[#E8924A] uppercase tracking-[0.4em]">
            F&B Operations
          </p>
          <h1 className="manrope-bold text-4xl md:text-6xl text-[#0D2137] tracking-tight">
            Menu Management
          </h1>
          <p className="text-slate-400 font-medium max-w-2xl text-sm md:text-base leading-relaxed">
            Curate seasonal specialties and manage real-time availability.
          </p>
          {error && <p className="text-red-500 text-sm font-medium">{error}</p>}
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="h-16 px-10 bg-[#E8924A] hover:bg-[#E8924A]/90 text-white manrope-bold rounded-2xl flex items-center gap-3 shadow-xl shadow-orange-500/20 transition-all hover:scale-[1.02]">
              <Plus className="w-5 h-5" /> Add Menu Item
            </Button>
          </DialogTrigger>
          <AddMenuModal onAdd={(item) => setItems((prev) => [...prev, item])} />
        </Dialog>
      </div>

      {/* ── Quick Stats ──────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          {
            title: "Live Items",
            value: String(liveCount),
            change: items.length > 0 ? null : "Add items from the DB",
            accent: "border-l-green-500",
          },
          {
            title: "Out of Stock",
            value: String(outOfStockCount),
            change: null,
            accent: "border-l-[#E8924A]",
          },
          {
            title: "Total Items",
            value: String(items.length),
            change: null,
            accent: "border-l-[#0D2137]",
          },
        ].map((card) => (
          <div
            key={card.title}
            className={cn(
              "bg-white p-8 rounded-2xl border border-gray-100 shadow-sm border-l-4",
              card.accent,
            )}
          >
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">
              {card.title}
            </p>
            <h3 className="manrope-bold text-4xl text-[#0D2137] tracking-tight">
              {card.value}
            </h3>
            {card.change && (
              <p className="text-[10px] font-black text-slate-400 mt-2 uppercase tracking-widest">
                {card.change}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* ── Toolbar ──────────────────────────────────── */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 pb-6 border-b border-gray-100">
        <div className="flex items-center gap-12 overflow-x-auto no-scrollbar w-full xl:w-auto">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "relative pb-2 text-sm font-bold transition-all whitespace-nowrap",
                activeCategory === cat
                  ? "text-[#E8924A]"
                  : "text-slate-400 hover:text-[#0D2137]",
              )}
            >
              {cat}
              {activeCategory === cat && (
                <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#E8924A] rounded-full animate-in slide-in-from-left-full duration-300" />
              )}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search catalog..."
            className="h-12 bg-white border-gray-100 rounded-xl pl-12 text-[10px] font-black uppercase tracking-widest shadow-sm"
          />
        </div>
      </div>

      {/* ── Menu Grid ────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="group bg-white rounded-[2.5rem] overflow-hidden border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-500 flex flex-col sm:flex-row h-full relative"
          >
            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#E8924A] transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500 z-30" />
            <div className="relative w-full sm:w-[240px] aspect-square sm:aspect-auto overflow-hidden shrink-0 bg-gray-100 flex items-center justify-center">
              {item.image ? (
                <img
                  src={item.image}
                  alt={item.name}
                  className={cn(
                    "w-full h-full object-cover transition-transform duration-700 group-hover:scale-110",
                    item.status === "out_of_stock" && "grayscale opacity-50",
                  )}
                />
              ) : (
                <div className="flex items-center justify-center text-gray-300 w-full h-full">
                  <Utensils className="w-12 h-12" />
                </div>
              )}
              {item.status === "out_of_stock" && (
                <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center p-6">
                  <span className="manrope-bold text-[10px] text-white bg-[#0D2137] px-6 py-3 rounded-xl uppercase tracking-[0.2em]">
                    Out of Stock
                  </span>
                </div>
              )}
            </div>

            <div className="flex-1 p-8 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Badge
                    variant="outline"
                    className="text-[9px] font-black uppercase tracking-widest border-gray-200 text-slate-400 rounded-lg px-3 py-1"
                  >
                    {item.category}
                  </Badge>
                  <span className="manrope-bold text-2xl text-[#0D2137]">
                    ${item.price.toFixed(2)}
                  </span>
                </div>
                <div>
                  <h4 className="manrope-bold text-2xl md:text-3xl text-[#0D2137] leading-tight mb-2">
                    {item.name}
                  </h4>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    ID: {item.id}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 mt-8">
                <Button
                  onClick={() => toggleStatus(item.id)}
                  variant="outline"
                  className={cn(
                    "flex-1 h-14 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3 border-gray-100",
                    item.status === "available"
                      ? "text-slate-400 hover:bg-gray-50 hover:text-[#0D2137]"
                      : "bg-[#4B5E71] text-white border-0 hover:bg-[#3A4A5A] shadow-lg",
                  )}
                >
                  {item.status === "available" ? (
                    <>
                      <EyeOff className="w-4 h-4" /> Mark Unavailable
                    </>
                  ) : (
                    <>
                      <Eye className="w-4 h-4" /> Restore Item
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => deleteItem(item.id)}
                  variant="outline"
                  className="w-14 h-14 rounded-2xl border-gray-100 text-red-400 hover:bg-red-50 hover:border-red-100 hover:text-red-500 p-0 shrink-0"
                >
                  <Trash2 className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        ))}

        {filteredItems.length === 0 && (
          <div className="col-span-1 md:col-span-2 text-center py-20 text-slate-400 manrope-bold italic">
            {items.length === 0
              ? "No menu items yet — add your first item above, or connect the food_and_beverage_items table."
              : "No catalog items found matching your current search parameters."}
          </div>
        )}
      </div>

      {/* ── Smart Inventory Alert ────────────────────── */}
      <div className="bg-[#0D2137] rounded-[2.5rem] p-10 md:p-14 text-white relative overflow-hidden group">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-12">
          <div className="max-w-xl space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20">
                <AlertTriangle className="w-8 h-8 text-[#E8924A]" />
              </div>
              <h3 className="manrope-bold text-3xl md:text-4xl tracking-tight">
                Smart Inventory Integration
              </h3>
            </div>
            <p className="text-[#94A3B8] text-lg font-medium leading-relaxed">
              Connect the{" "}
              <span className="text-[#E8924A] font-bold">
                food_and_beverage_items
              </span>{" "}
              table to manage live menu availability and inventory alerts.
            </p>
          </div>
          <div className="w-full md:w-64 aspect-square rounded-3xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center gap-4 group-hover:border-[#E8924A]/40 transition-all duration-700">
            <div className="w-20 h-20 rounded-full bg-[#E8924A]/10 flex items-center justify-center animate-pulse">
              <AlertTriangle className="w-10 h-10 text-[#E8924A]" />
            </div>
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest text-center px-8">
              Pending DB Table
            </p>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#E8924A]/5 rounded-full -mr-32 -mt-32 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full -ml-32 -mb-32 blur-3xl" />
      </div>
    </div>
  );
}

function AddMenuModal({ onAdd }: { onAdd: (item: LocalMenuItem) => void }) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Main Course");
  const [price, setPrice] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSave = () => {
    if (!name || !price) return;
    onAdd({
      id: `LOCAL-${Date.now()}`,
      name,
      category,
      price: parseFloat(price),
      status: "available",
      image: previewUrl ?? undefined,
    });
    setName("");
    setPrice("");
    setCategory("Main Course");
    setPreviewUrl(null);
  };

  return (
    <DialogContent className="w-[95vw] sm:max-w-[700px] p-0 border-0 overflow-hidden bg-white rounded-3xl flex flex-col max-h-[90vh]">
      <div className="p-8 md:p-12 space-y-10 flex-1 overflow-y-auto custom-scrollbar">
        <div className="space-y-1">
          <p className="text-[10px] font-black text-[#E8924A] uppercase tracking-[0.3em]">
            Culinary Administration
          </p>
          <DialogTitle className="manrope-bold text-4xl text-[#0D2137] tracking-tight">
            Add New Menu Item
          </DialogTitle>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-4 space-y-8">
            <div className="space-y-4">
              <label className="text-[10px] font-black text-[#43474D] uppercase tracking-widest">
                Item Photo
              </label>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/*"
              />
              <div
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  "aspect-square rounded-[2rem] border-2 border-dashed flex flex-col items-center justify-center gap-4 text-center p-8 group transition-all cursor-pointer relative overflow-hidden",
                  previewUrl
                    ? "border-solid border-gray-100"
                    : "border-gray-200 bg-[#F1F5F9] hover:border-[#E8924A]",
                )}
              >
                {previewUrl ? (
                  <>
                    <img
                      src={previewUrl}
                      className="absolute inset-0 w-full h-full object-cover"
                      alt="Preview"
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setPreviewUrl(null);
                        if (fileInputRef.current)
                          fileInputRef.current.value = "";
                      }}
                      className="absolute top-4 right-4 bg-white/90 hover:bg-white p-2 rounded-xl shadow-lg z-20 text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <>
                    <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-all duration-500">
                      <Upload className="w-6 h-6 text-slate-400 group-hover:text-[#E8924A]" />
                    </div>
                    <p className="manrope-bold text-sm text-[#0D2137]">
                      Click to upload
                    </p>
                  </>
                )}
              </div>
            </div>
            <div className="space-y-4">
              <label className="text-[10px] font-black text-[#43474D] uppercase tracking-widest">
                Price (FCFA)
              </label>
              <div className="relative">
                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl manrope-bold text-slate-400">
                  $
                </span>
                <Input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0.00"
                  className="h-20 bg-[#F1F5F9] border-0 rounded-2xl pl-12 text-3xl manrope-bold text-[#0D2137]"
                />
              </div>
            </div>
          </div>
          <div className="lg:col-span-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <label className="text-[10px] font-black text-[#43474D] uppercase tracking-widest">
                  Item Name
                </label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Wagyu Beef Tartare"
                  className="h-16 bg-[#F1F5F9] border-0 rounded-2xl px-6 text-sm manrope-bold text-[#0D2137]"
                />
              </div>
              <div className="space-y-4">
                <label className="text-[10px] font-black text-[#43474D] uppercase tracking-widest">
                  Category
                </label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="h-16 bg-[#F1F5F9] border-0 rounded-2xl px-6 text-sm manrope-bold text-[#0D2137]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.filter((c) => c !== "All Items").map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="p-8 md:p-12 border-t border-gray-100 bg-[#F8FAFC] flex flex-col sm:flex-row items-center justify-end gap-6">
        <Button
          onClick={handleSave}
          disabled={!name || !price}
          className="h-16 px-12 bg-[#E8924A] text-white manrope-bold rounded-2xl shadow-xl hover:scale-[1.02] disabled:opacity-50"
        >
          SAVE TO MENU
        </Button>
      </div>
    </DialogContent>
  );
}
