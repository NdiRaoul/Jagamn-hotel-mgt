"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Search, Utensils } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const CATEGORIES = [
  "All Items",
  "Breakfast",
  "Main Course",
  "Wine & Spirits",
  "Desserts",
  "Room Service Only",
];

const StatCard = ({ title, value, change, accentColor, changeColor }: any) => (
  <div
    className={cn(
      "bg-white p-8 rounded-2xl border border-gray-100 shadow-sm border-l-4",
      accentColor,
    )}
  >
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">
      {title}
    </p>
    <div className="flex items-baseline gap-2">
      <h3 className="manrope-bold text-4xl text-[#0D2137] tracking-tight">
        {value}
      </h3>
    </div>
    {change && (
      <p
        className={cn(
          "text-xs font-semibold mt-2",
          changeColor || "text-slate-400",
        )}
      >
        {change}
      </p>
    )}
  </div>
);

interface FBClientProps {
  menu: any[];
}

export default function FBClient({ menu }: FBClientProps) {
  const [activeCategory, setActiveCategory] = useState("All Items");
  const [searchQuery, setSearchQuery] = useState("");

  // Global Search Integration
  useEffect(() => {
    const handleGlobalSearch = (e: any) => {
      setSearchQuery(e.detail || "");
    };
    window.addEventListener("jagamn-global-search", handleGlobalSearch);
    return () =>
      window.removeEventListener("jagamn-global-search", handleGlobalSearch);
  }, []);

  const filteredItems = useMemo(() => {
    return (menu || []).filter((item: any) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        (item.name && item.name.toLowerCase().includes(q)) ||
        (item.id && item.id.toLowerCase().includes(q)) ||
        (item.category_name && item.category_name.toLowerCase().includes(q)) ||
        (item.description && item.description.toLowerCase().includes(q));

      const matchesCategory =
        activeCategory === "All Items" || item.category_name === activeCategory;

      return matchesSearch && matchesCategory;
    });
  }, [menu, searchQuery, activeCategory]);

  const availableCount = (menu || []).filter(
    (item: any) => item.is_available,
  ).length;
  const unavailableCount = (menu || []).length - availableCount;

  return (
    <div className="space-y-12 pb-20 animate-in fade-in duration-700">
      {/* ── Header ───────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div className="space-y-2">
          <p className="text-[10px] font-black text-[#E8924A] uppercase tracking-[0.4em]">
            F&B Operations
          </p>
          <h1 className="manrope-bold text-4xl md:text-6xl text-[#0D2137] tracking-tight">
            Menu Overview
          </h1>
          <p className="text-slate-400 font-medium max-w-2xl text-sm md:text-base leading-relaxed">
            Culinary offerings of the Palace. View seasonal specialties and
            availability.
          </p>
        </div>
      </div>

      {/* ── Quick Stats ──────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <StatCard
          title="Total Items"
          value={(menu || []).length.toString()}
          change={`${availableCount} available`}
          accentColor="border-l-[#0D2137]"
          changeColor="text-emerald-600"
        />
        <StatCard
          title="Available"
          value={availableCount.toString()}
          change="Ready to serve"
          accentColor="border-l-[#E8924A]"
          changeColor="text-slate-400"
        />
        <StatCard
          title="Out of Stock"
          value={unavailableCount.toString()}
          change="Temporarily unavailable"
          accentColor="border-l-[#5F738C]"
          changeColor="text-slate-400"
        />
      </div>

      {/* ── Toolbar: Categories & Search ─────────────── */}
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
        {filteredItems.map((item: any) => (
          <div
            key={item.id}
            className="group bg-white rounded-[2.5rem] overflow-hidden border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-500 flex flex-col sm:flex-row h-full relative"
          >
            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#E8924A] transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500 z-30" />
            <div className="relative w-full sm:w-[240px] aspect-square sm:aspect-auto overflow-hidden shrink-0 bg-gray-100">
              {item.image_url ? (
                <img
                  src={item.image_url}
                  alt={item.name}
                  className={cn(
                    "w-full h-full object-cover transition-transform duration-700 group-hover:scale-110",
                    !item.is_available && "grayscale opacity-50",
                  )}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300">
                  <Utensils className="w-12 h-12" />
                </div>
              )}
              {!item.is_available && (
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
                    {item.category_name || "Uncategorized"}
                  </Badge>
                  <span className="manrope-bold text-2xl text-[#0D2137]">
                    ${(item.price || 0).toFixed(2)}
                  </span>
                </div>
                <div>
                  <h4 className="manrope-bold text-2xl md:text-3xl text-[#0D2137] leading-tight mb-2">
                    {item.name || "N/A"}
                  </h4>
                  <p className="text-sm text-slate-400 font-medium leading-relaxed line-clamp-2">
                    {item.description || "No description available"}
                  </p>
                </div>
              </div>
              <div className="mt-6">
                <Badge
                  className={cn(
                    "text-[9px] font-black uppercase tracking-widest border-0",
                    item.is_available
                      ? "bg-green-50 text-green-600"
                      : "bg-gray-50 text-gray-600",
                  )}
                >
                  {item.is_available ? "Available" : "Out of Stock"}
                </Badge>
              </div>
            </div>
          </div>
        ))}
        {filteredItems.length === 0 && (
          <div className="col-span-1 md:col-span-2 text-center py-20 text-slate-400 manrope-bold italic">
            No catalog items found matching your current search parameters.
          </div>
        )}
      </div>
    </div>
  );
}
