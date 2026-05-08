"use client";

import React, { useState } from "react";
import { MENU_ITEMS, type MenuItem } from "@/lib/kitchen-mock-data";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Star, Download, Plus, Edit3 } from "lucide-react";
import Image from "next/image";

// ── Toggle Switch ──────────────────────────────────────────────────────────
function ToggleSwitch({ enabled, onChange }: { enabled: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className={cn(
        "relative w-11 h-6 rounded-full transition-colors duration-200 flex items-center flex-shrink-0",
        enabled ? "bg-[#BA722E]" : "bg-gray-300"
      )}
    >
      <span
        className={cn(
          "absolute w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-200",
          enabled ? "left-[26px]" : "left-[4px]"
        )}
      />
    </button>
  );
}

// ── Large Card ─────────────────────────────────────────────────────────────
function LargeMenuCard({
  item,
  onToggle,
}: {
  item: MenuItem;
  onToggle: (id: string) => void;
}) {
  const isAvailable = item.available;

  return (
    <div
      className={cn(
        "bg-white rounded-xl shadow-sm overflow-hidden flex transition-all duration-300 border-y border-r",
        isAvailable
          ? "border-l-4 border-l-jagamn-primary border-gray-100"
          : "border-l-4 border-l-[#94A3B8] border-gray-100"
      )}
    >
      {/* Image */}
      <div className="relative w-44 flex-shrink-0 self-stretch min-h-[180px]">
        <Image
          src={item.image}
          alt={item.name}
          fill
          className={cn(
            "object-cover transition-all duration-300",
            !isAvailable && "grayscale opacity-60"
          )}
        />
        {/* Out of Stock overlay — shown when unavailable */}
        {!isAvailable && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="bg-red-500 text-white text-[10px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full shadow-md">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div
        className={cn(
          "flex-1 p-6 flex flex-col justify-between transition-opacity duration-300",
          !isAvailable && "opacity-60"
        )}
      >
        <div className="space-y-3">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-bold text-[#BA722E] uppercase tracking-widest mb-1">
                {item.category}
              </p>
              <h3 className="manrope-bold text-2xl text-[#00152A]">{item.name}</h3>
            </div>
            <div className="flex flex-col items-end gap-1">
              <ToggleSwitch enabled={isAvailable} onChange={() => onToggle(item.id)} />
              <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400">
                {isAvailable ? "Available" : "Unavailable"}
              </span>
            </div>
          </div>
          <p className="text-sm text-gray-500 leading-relaxed">{item.description}</p>
        </div>

        {/* Ingredient Tags */}
        {item.ingredients.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {item.ingredients.map((ing, i) => (
              <span
                key={i}
                className="bg-gray-100 text-gray-500 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full"
              >
                {ing.label} (INVENTORY: {ing.amount})
              </span>
            ))}
            {item.id === "wagyu-ribeye" && (
              <span className="bg-gray-100 text-gray-500 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">
                +3 MORE
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Small Card ─────────────────────────────────────────────────────────────
function SmallMenuCard({
  item,
  onToggle,
}: {
  item: MenuItem;
  onToggle: (id: string) => void;
}) {
  const isAvailable = item.available;

  return (
    <div
      className={cn(
        "bg-white rounded-xl shadow-sm overflow-hidden flex gap-4 p-4 items-start border-y border-r transition-all duration-300",
        item.inventoryOk
          ? "border-l-4 border-l-jagamn-primary border-gray-100"
          : "border-l-4 border-l-[#EA580C] border-gray-100",
        !isAvailable && "opacity-60"
      )}
    >
      {/* Image */}
      <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
        <Image
          src={item.image}
          alt={item.name}
          fill
          className={cn(
            "object-cover transition-all duration-300",
            !isAvailable && "grayscale"
          )}
        />
      </div>

      <div className="flex-1 space-y-2 min-w-0">
        <h3 className="font-bold text-[#00152A]">{item.name}</h3>
        <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{item.description}</p>
        <div className="flex items-center justify-between pt-1">
          <div>
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
              INVENTORY CHECK
            </p>
            <p
              className={cn(
                "text-xs font-bold",
                item.inventoryOk ? "text-[#00152A]" : "text-[#EA580C]"
              )}
            >
              {item.inventoryStatus}
            </p>
          </div>
          <ToggleSwitch enabled={isAvailable} onChange={() => onToggle(item.id)} />
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function MenuManagementPage() {
  const [items, setItems] = useState<MenuItem[]>(MENU_ITEMS);

  const handleToggle = (id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              available: !item.available,
              // When toggling off, set outOfStock; when toggling on, clear it
              outOfStock: item.available ? true : false,
            }
          : item
      )
    );
  };

  const largeItems = items.filter((i) => i.size === "large");
  const smallItems = items.filter((i) => i.size === "small");
  const mostRequested = items[0];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8 relative">
      {/* ── Header ────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div>
          <h1 className="manrope-bold text-4xl text-[#00152A]">Menu Management</h1>
          <p className="text-gray-500 text-sm mt-1 max-w-md">
            Curating the season's finest ingredients for the Palace's signature dining experience.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="h-11 px-6 border-gray-200 text-[#00152A] font-bold hover:bg-gray-50 flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export Menu
          </Button>
          <Button className="h-11 px-6 bg-[#00152A] hover:bg-[#0A2038] text-white font-bold shadow-md flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add New Item
          </Button>
        </div>
      </div>

      {/* ── Main Grid ─────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
        {/* Left: Menu List */}
        <div className="xl:col-span-2 space-y-6">
          {largeItems.map((item) => (
            <LargeMenuCard key={item.id} item={item} onToggle={handleToggle} />
          ))}
          {smallItems.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {smallItems.map((item) => (
                <SmallMenuCard key={item.id} item={item} onToggle={handleToggle} />
              ))}
            </div>
          )}
        </div>

        {/* Right: Most Requested */}
        <div className="xl:col-span-1">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 text-center space-y-4 sticky top-0">
            <Star className="w-8 h-8 text-jagamn-tertiary fill-jagamn-tertiary mx-auto" />
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Most Requested
            </p>
            <h2 className="manrope-bold text-3xl text-jagamn-primary leading-tight">
              {mostRequested.name}
            </h2>
            {/* 85% satisfaction progress bar */}
            <div className="space-y-2 pt-1">
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-jagamn-tertiary rounded-full"
                  style={{ width: "85%" }}
                />
              </div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                85% Guest Satisfaction Score
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Floating Action Button ─────────────── */}
      <button className="fixed bottom-8 right-8 w-14 h-14 bg-[#00152A] hover:bg-[#0A2038] text-white rounded-2xl shadow-xl flex items-center justify-center transition-all hover:scale-105 active:scale-95 z-50">
        <Edit3 className="w-5 h-5" />
      </button>
    </div>
  );
}
