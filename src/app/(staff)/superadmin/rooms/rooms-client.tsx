"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  Hammer,
  Sparkles,
  Search,
  BedDouble,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const STATUS_CONFIG = {
  available: {
    color: "bg-green-500",
    text: "Available",
    light: "bg-green-50",
    textColor: "text-green-600",
    icon: CheckCircle2,
  },
  occupied: {
    color: "bg-[#0D2137]",
    text: "Occupied",
    light: "bg-slate-50",
    textColor: "text-slate-600",
    icon: BedDouble,
  },
  reserved: {
    color: "bg-[#E8924A]",
    text: "Reserved",
    light: "bg-orange-50",
    textColor: "text-orange-600",
    icon: Clock,
  },
  maintenance: {
    color: "bg-[#718096]",
    text: "Maintenance",
    light: "bg-gray-50",
    textColor: "text-gray-600",
    icon: Hammer,
  },
  cleaning: {
    color: "bg-[#ECC94B]",
    text: "Cleaning",
    light: "bg-yellow-50",
    textColor: "text-yellow-600",
    icon: Sparkles,
  },
  dirty: {
    color: "bg-[#ECC94B]",
    text: "Needs Cleaning",
    light: "bg-yellow-50",
    textColor: "text-yellow-600",
    icon: Sparkles,
  },
  out_of_order: {
    color: "bg-[#718096]",
    text: "Out of Order",
    light: "bg-gray-50",
    textColor: "text-gray-600",
    icon: Hammer,
  },
};

interface RoomsClientProps {
  rooms: any[];
}

export default function RoomsClient({ rooms: initialRooms }: RoomsClientProps) {
  const [floorFilter, setFloorFilter] = useState("all");
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

  const stats = useMemo(() => {
    const total = initialRooms.length;
    const occupied = initialRooms.filter(
      (r: any) => r.status === "occupied",
    ).length;
    const cleaning = initialRooms.filter(
      (r: any) => r.status === "dirty" || r.status === "cleaning",
    ).length;
    return {
      occupancy: total ? Math.round((occupied / total) * 100) : 0,
      needsCleaning: cleaning,
    };
  }, [initialRooms]);

  const filteredRooms = useMemo(() => {
    return initialRooms.filter((r: any) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        (r.unitCode && r.unitCode.toLowerCase().includes(q)) ||
        (r.roomTypeName && r.roomTypeName.toLowerCase().includes(q)) ||
        (r.guestName && r.guestName.toLowerCase().includes(q)) ||
        (r.bookingRef && r.bookingRef.toLowerCase().includes(q)) ||
        (r.status && r.status.toLowerCase().includes(q));

      const matchesFloor =
        floorFilter === "all" ||
        (r.floor && r.floor.toString() === floorFilter);

      return matchesSearch && matchesFloor;
    });
  }, [initialRooms, floorFilter, searchQuery]);

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      {/* ── Header Section ─────────────────────────── */}
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-10">
        <div className="max-w-xl space-y-4">
          <h1 className="manrope-bold text-4xl md:text-5xl text-[#0D2137] tracking-tight">
            Room Status Board
          </h1>
          <p className="text-slate-400 font-medium leading-relaxed">
            Real-time oversight of the West Wing and Presidential Suites.
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Select value={floorFilter} onValueChange={setFloorFilter}>
              <SelectTrigger className="h-12 w-[160px] border-gray-200 rounded-xl manrope-bold text-slate-500 bg-white shadow-sm">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  <SelectValue placeholder="Filter Floor" />
                </div>
              </SelectTrigger>
              <SelectContent className="rounded-xl border-gray-100 shadow-xl">
                <SelectItem value="all" className="manrope-bold">
                  All Floors
                </SelectItem>
                <SelectItem value="1" className="manrope-bold">
                  First Floor
                </SelectItem>
                <SelectItem value="2" className="manrope-bold">
                  Second Floor
                </SelectItem>
                <SelectItem value="3" className="manrope-bold">
                  Third Floor
                </SelectItem>
              </SelectContent>
            </Select>

            <div className="relative w-full sm:w-64">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search rooms..."
                className="h-12 bg-white border-gray-100 rounded-xl pl-12 text-[10px] font-black uppercase tracking-widest shadow-sm"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full lg:max-w-2xl">
          <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm border-l-4 border-l-[#0D2137]">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
              Total Occupancy
            </p>
            <div className="space-y-4">
              <h3 className="manrope-bold text-5xl text-[#0D2137]">
                {stats.occupancy}%
              </h3>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#E8924A] rounded-full transition-all duration-1000"
                  style={{ width: `${stats.occupancy}%` }}
                />
              </div>
            </div>
          </div>
          <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm border-l-4 border-l-[#E8924A]">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
              Needs Cleaning
            </p>
            <div className="space-y-2">
              <h3 className="manrope-bold text-5xl text-[#0D2137]">
                {stats.needsCleaning}
              </h3>
              <p className="text-xs text-[#E8924A] font-black uppercase tracking-widest flex items-center gap-2">
                <AlertCircle className="w-4 h-4" /> High Priority
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Status Legend ──────────────────────────── */}
      <div className="flex flex-wrap items-center gap-x-8 gap-y-4 bg-white/50 backdrop-blur-sm p-4 rounded-xl border border-gray-100 w-fit">
        {Object.entries(STATUS_CONFIG).map(([key, config]) => (
          <div key={key} className="flex items-center gap-2.5">
            <div
              className={cn("w-3 h-3 rounded-full shadow-sm", config.color)}
            />
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
              {config.text}
            </span>
          </div>
        ))}
      </div>

      {/* ── Room Grid ──────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {filteredRooms.map((room: any) => {
          const config =
            STATUS_CONFIG[room.status as keyof typeof STATUS_CONFIG] ||
            STATUS_CONFIG.available;
          return (
            <div
              key={room.id}
              className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden"
            >
              <div className="flex items-start justify-between mb-6">
                <h4 className="manrope-bold text-3xl text-[#0D2137]">
                  {room.unitCode || "N/A"}
                </h4>
              </div>
              <div className="space-y-1 mb-8">
                <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest leading-none mb-1">
                  {room.roomTypeName || "N/A"}
                </p>
                <p
                  className={cn(
                    "manrope-bold text-sm leading-tight transition-colors",
                    room.status === "out_of_order"
                      ? "text-red-500"
                      : "text-[#0D2137]",
                  )}
                >
                  {room.status === "occupied"
                    ? room.bookingRef || room.guestName || "Occupied"
                    : room.status === "dirty"
                      ? "Needs Cleaning"
                      : room.status === "out_of_order"
                        ? "Out of Order"
                        : "Available"}
                </p>
              </div>
              <div className="flex items-center justify-between">
                <Badge
                  className={cn(
                    "border-0 text-[8px] font-black px-2.5 py-1 rounded-md tracking-widest uppercase",
                    config.light,
                    config.textColor,
                  )}
                >
                  {config.text}
                </Badge>
                <div className={cn("w-2.5 h-2.5 rounded-full", config.color)} />
              </div>
            </div>
          );
        })}
        {filteredRooms.length === 0 && (
          <div className="col-span-1 sm:col-span-2 lg:col-span-4 xl:col-span-5 py-20 text-center text-slate-400 manrope-bold italic border border-dashed border-gray-200 rounded-3xl">
            No rooms match your search query.
          </div>
        )}
      </div>
    </div>
  );
}
