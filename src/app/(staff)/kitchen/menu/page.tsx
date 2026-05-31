"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Star, Plus, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { MenuItem } from "@/lib/data/menu";

interface MenuCategory {
  id: string;
  name: string;
  sort_order: number;
}

function ToggleSwitch({
  enabled,
  onChange,
}: {
  enabled: boolean;
  onChange: () => void;
}) {
  return (
    <button
      onClick={onChange}
      className={cn(
        "relative w-11 h-6 rounded-full transition-colors duration-200 flex items-center flex-shrink-0",
        enabled ? "bg-[#BA722E]" : "bg-gray-300",
      )}
    >
      <span
        className={cn(
          "absolute w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-200",
          enabled ? "left-[26px]" : "left-[4px]",
        )}
      />
    </button>
  );
}

export default function MenuManagementPage() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newItem, setNewItem] = useState({
    name: "",
    description: "",
    price: "",
    category_id: "",
    image_url: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/kitchen/menu").then((r) => r.json()),
      fetch("/api/admin/menu/categories").then((r) => r.json()),
    ])
      .then(([menuData, catData]) => {
        setItems(menuData.items || []);
        setCategories(catData.categories || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleToggle = async (id: string, current: boolean) => {
    // Optimistic update
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, is_available: !current } : item,
      ),
    );
    const res = await fetch(`/api/admin/menu/items/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_available: !current }),
    });
    if (!res.ok) {
      // Revert on failure
      setItems((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, is_available: current } : item,
        ),
      );
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const res = await fetch("/api/kitchen/menu", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: newItem.name,
        description: newItem.description || null,
        price: parseFloat(newItem.price) || 0,
        category_id: newItem.category_id || null,
        image_url: newItem.image_url || null,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      setItems((prev) => [...prev, data.item]);
      setIsAddOpen(false);
      setNewItem({
        name: "",
        description: "",
        price: "",
        category_id: "",
        image_url: "",
      });
    }
    setSubmitting(false);
  };

  const mostRequested = items.find((i) => i.is_special) ?? items[0];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#BA722E]" />
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div>
          <h1 className="manrope-bold text-4xl text-[#00152A]">
            Menu Management
          </h1>
          <p className="text-gray-500 text-sm mt-1 max-w-md">
            Manage availability and add new items to the Palace dining menu.
          </p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="h-11 px-6 bg-[#00152A] hover:bg-[#0A2038] text-white font-bold shadow-md flex items-center gap-2">
              <Plus className="w-4 h-4" /> Add New Item
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md p-8 rounded-2xl">
            <DialogTitle className="manrope-bold text-2xl text-[#00152A] mb-6">
              Add Menu Item
            </DialogTitle>
            <form onSubmit={handleAddItem} className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                  Name *
                </Label>
                <Input
                  required
                  value={newItem.name}
                  onChange={(e) =>
                    setNewItem({ ...newItem, name: e.target.value })
                  }
                  placeholder="e.g. Wagyu Ribeye"
                  className="h-11"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                  Category
                </Label>
                <Select
                  value={newItem.category_id}
                  onValueChange={(value) =>
                    setNewItem({ ...newItem, category_id: value })
                  }
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                  Description
                </Label>
                <Input
                  value={newItem.description}
                  onChange={(e) =>
                    setNewItem({ ...newItem, description: e.target.value })
                  }
                  placeholder="Short description"
                  className="h-11"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                  Price (XAF) *
                </Label>
                <Input
                  required
                  type="number"
                  min="0"
                  value={newItem.price}
                  onChange={(e) =>
                    setNewItem({ ...newItem, price: e.target.value })
                  }
                  placeholder="0"
                  className="h-11"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                  Image URL
                </Label>
                <Input
                  value={newItem.image_url}
                  onChange={(e) =>
                    setNewItem({ ...newItem, image_url: e.target.value })
                  }
                  placeholder="/images/dish.png"
                  className="h-11"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsAddOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="bg-[#00152A] text-white"
                >
                  {submitting ? "Adding…" : "Add Item"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
        {/* Menu List */}
        <div className="xl:col-span-2 space-y-4">
          {items.length === 0 ? (
            <div className="bg-white rounded-xl border border-dashed border-gray-200 p-16 text-center text-gray-400 italic">
              No menu items yet. Add your first item above.
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className={cn(
                  "bg-white rounded-xl shadow-sm flex gap-4 p-5 items-start transition-all duration-300 border-l-4",
                  item.is_available
                    ? "border-l-[#00152A]"
                    : "border-l-[#94A3B8] opacity-70",
                )}
              >
                <div className="flex-1 space-y-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      {item.category_name && (
                        <p className="text-[10px] font-bold text-[#BA722E] uppercase tracking-widest mb-0.5">
                          {item.category_name}
                        </p>
                      )}
                      <h3 className="manrope-bold text-xl text-[#00152A]">
                        {item.name}
                      </h3>
                      {item.description && (
                        <p className="text-sm text-gray-500 mt-1 leading-relaxed">
                          {item.description}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <ToggleSwitch
                        enabled={item.is_available}
                        onChange={() =>
                          handleToggle(item.id, item.is_available)
                        }
                      />
                      <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400">
                        {item.is_available ? "Available" : "Unavailable"}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 pt-2">
                    <span className="manrope-bold text-lg text-[#00152A]">
                      {item.currency} {item.price.toLocaleString()}
                    </span>
                    {item.is_special && (
                      <span className="bg-[#BA722E]/10 text-[#BA722E] text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full">
                        Special
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Most Requested */}
        <div className="xl:col-span-1">
          {mostRequested && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 text-center space-y-4 sticky top-0">
              <Star className="w-8 h-8 text-[#BA722E] fill-[#BA722E] mx-auto" />
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Featured Item
              </p>
              <h2 className="manrope-bold text-2xl text-[#00152A] leading-tight">
                {mostRequested.name}
              </h2>
              <p className="text-sm text-gray-500">
                {mostRequested.description}
              </p>
              <p className="manrope-bold text-xl text-[#BA722E]">
                {mostRequested.currency} {mostRequested.price.toLocaleString()}
              </p>
              <div className="pt-2">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                  {items.filter((i) => i.is_available).length} / {items.length}{" "}
                  items available
                </p>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#BA722E] rounded-full"
                    style={{
                      width: `${items.length > 0 ? (items.filter((i) => i.is_available).length / items.length) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
