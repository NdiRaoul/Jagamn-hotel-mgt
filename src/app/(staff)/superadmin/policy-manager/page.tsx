"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  X,
  ChevronDown,
  Calendar,
  ShieldCheck,
  Banknote,
  Utensils,
  UserCheck,
  ShieldAlert,
  Send,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

const ICONS = [
  { id: "calendar", icon: Calendar },
  { id: "shield", icon: ShieldCheck },
  { id: "finance", icon: Banknote },
  { id: "fb", icon: Utensils },
  { id: "staff", icon: UserCheck },
  { id: "security", icon: ShieldAlert },
];

export default function PolicyManagerPage() {
  const [selectedIcon, setSelectedIcon] = useState("calendar");

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-12 animate-in fade-in duration-700">
      {/* ── Header ───────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <nav className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">
            <span>MANAGEMENT SUITE</span>
            <span>/</span>
            <span className="text-jagamn-primary">POLICY MANAGER</span>
          </nav>
          <h1 className="manrope-bold text-2xl text-jagamn-primary">
            Add New Policy
          </h1>
        </div>

        <Link
          href="/superadmin/system-settings"
          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-red-500 transition-colors"
        >
          <X className="w-4 h-4" />
          DISCARD
        </Link>
      </div>

      {/* ── Form Content ──────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
        {/* Left Column: Details */}
        <div className="lg:col-span-7 space-y-10">
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              POLICY NAME
            </label>
            <Input
              placeholder="e.g., Late Check-out Grace Period"
              className="h-14 bg-transparent border-0 border-b border-slate-200 rounded-none px-0 text-lg manrope-bold placeholder:text-slate-200 focus-visible:ring-0 focus-visible:border-jagamn-primary transition-all"
            />
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              POLICY CATEGORY
            </label>
            <div className="relative">
              <select className="w-full h-14 bg-slate-50 border border-slate-100 rounded-sm px-6 text-sm font-bold text-jagamn-primary appearance-none focus:outline-none focus:border-jagamn-primary transition-all">
                <option>Room Operations</option>
                <option>Finance & Taxation</option>
                <option>HR & Staffing</option>
                <option>Food & Beverage</option>
              </select>
              <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              DESCRIPTION & DETAILED RULES
            </label>
            <div className="relative">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-jagamn-primary" />
              <textarea
                placeholder="Define the specific terms, conditions, and enforcement protocols for this policy..."
                className="w-full h-64 bg-slate-50 border-0 rounded-sm p-8 text-sm font-medium leading-relaxed placeholder:text-slate-300 focus:outline-none focus:bg-slate-100/50 transition-all resize-none"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Configuration */}
        <div className="lg:col-span-5 space-y-8">
          {/* Icon Grid */}
          <div className="bg-white rounded-sm p-8 shadow-sm border border-gray-100">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-6">
              Icon Representation
            </label>
            <div className="grid grid-cols-3 gap-4">
              {ICONS.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSelectedIcon(item.id)}
                  className={cn(
                    "h-20 rounded-sm border flex items-center justify-center transition-all",
                    selectedIcon === item.id
                      ? "bg-jagamn-primary border-jagamn-primary text-white shadow-lg"
                      : "bg-slate-50 border-slate-100 text-slate-400 hover:bg-white hover:border-slate-200"
                  )}
                >
                  <item.icon className="w-6 h-6" />
                </button>
              ))}
            </div>
          </div>

          {/* Status Switch */}
          <div className="bg-white rounded-sm p-8 shadow-sm border border-gray-100 border-l-4 border-l-jagamn-tertiary">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm manrope-bold text-jagamn-primary mb-1">Policy Status</p>
                <p className="text-xs text-slate-400 font-medium">Set to Active on publish</p>
              </div>
              <Switch defaultChecked className="data-[state=checked]:bg-green-500" />
            </div>
          </div>

          {/* Action Button */}
          <div className="space-y-6">
            <Button className="w-full h-16 bg-jagamn-primary hover:bg-jagamn-primary/90 text-white rounded-sm manrope-bold text-sm uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl">
              Publish Policy
              <Send className="w-4 h-4" />
            </Button>
            <p className="text-[11px] text-slate-400 text-center leading-relaxed font-medium px-4">
              Publishing will immediately synchronize this policy across all departmental management portals within the Jagamn Palace ecosystem.
            </p>
          </div>
        </div>
      </div>

      {/* ── Decorative Footer ─────────────────────────── */}
      <div className="relative h-64 rounded-sm overflow-hidden opacity-20 grayscale">
        <img
          src="/images/classic-heritage.png"
          alt="Decor"
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.src = "https://images.unsplash.com/photo-1542314831-c6a4d14d8c85?q=80&w=2070&auto=format&fit=crop";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-white" />
      </div>
    </div>
  );
}
