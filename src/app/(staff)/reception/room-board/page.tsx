"use client";

import React, { useState } from "react";
import { 
  Grid3X3, 
  Search, 
  Filter, 
  BedDouble, 
  Key, 
  RefreshCw, 
  Wrench,
  ChevronRight,
  Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const FLOORS = ["All Floors", "Floor 1", "Floor 2", "Floor 3", "Floor 4", "Penthouse"];

const ROOMS = [
  { id: "101", type: "Standard King", status: "occupied", guest: "John Doe" },
  { id: "102", type: "Standard King", status: "occupied", guest: "Jane Smith" },
  { id: "103", type: "Standard King", status: "occupied", guest: "Robert Brown" },
  { id: "104", type: "Deluxe Queen", status: "available" },
  { id: "105", type: "Deluxe Queen", status: "cleaning" },
  { id: "201", type: "Superior Double", status: "occupied", guest: "Alice Johnson" },
  { id: "202", type: "Superior Double", status: "available" },
  { id: "203", type: "Superior Double", status: "occupied", guest: "Michael Clark" },
  { id: "204", type: "Executive Suite", status: "occupied", guest: "Eleanor Vance" },
  { id: "205", type: "Executive Suite", status: "maintenance" },
  { id: "301", type: "Maharaja Suite", status: "occupied", guest: "Alexander Sterling" },
  { id: "302", type: "Maharaja Suite", status: "available" },
  { id: "303", type: "Maharaja Suite", status: "cleaning" },
  { id: "304", type: "Maharaja Suite", status: "occupied", guest: "Marcus Brody" },
  { id: "305", type: "Maharaja Suite", status: "available" },
];

export default function RoomBoardPage() {
  const [activeFloor, setActiveFloor] = useState("All Floors");

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h1 className="manrope-bold text-4xl text-[#00152A]">Room Board</h1>
          <p className="text-gray-500 text-sm">Real-time status overview of all estate accommodations.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input placeholder="Search room #..." className="h-11 pl-10 bg-white border-gray-200 w-48" />
          </div>
          <Button variant="outline" className="h-11 px-4 border-gray-200 text-gray-500 flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filter
          </Button>
        </div>
      </div>

      {/* ── Floor Selection ────────────────────────── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {FLOORS.map((floor) => (
          <button
            key={floor}
            onClick={() => setActiveFloor(floor)}
            className={cn(
              "px-6 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap",
              activeFloor === floor
                ? "bg-[#00152A] text-white shadow-lg shadow-[#00152A]/10"
                : "bg-white text-gray-400 hover:text-[#00152A] border border-gray-100"
            )}
          >
            {floor}
          </button>
        ))}
      </div>

      {/* ── Status Legend ──────────────────────────── */}
      <div className="flex flex-wrap items-center gap-8 p-6 bg-white rounded-lg border border-gray-100 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded bg-[#00152A]" />
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Occupied (45)</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded bg-[#BA722E]" />
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Available (5)</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded bg-orange-400" />
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Cleaning (3)</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded bg-red-500" />
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Maintenance (1)</span>
        </div>
      </div>

      {/* ── Room Grid ──────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {ROOMS.map((room) => (
          <div 
            key={room.id}
            className={cn(
              "group bg-white rounded-lg border-t-4 p-6 shadow-sm hover:shadow-md transition-all cursor-pointer relative overflow-hidden",
              room.status === "occupied" ? "border-t-[#00152A]" : 
              room.status === "available" ? "border-t-[#BA722E]" :
              room.status === "cleaning" ? "border-t-orange-400" : "border-t-red-500"
            )}
          >
            <div className="flex justify-between items-start mb-6">
              <div className="space-y-1">
                <h3 className="manrope-bold text-2xl text-[#00152A]">{room.id}</h3>
                <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">{room.type}</p>
              </div>
              <div className={cn(
                "w-8 h-8 rounded flex items-center justify-center transition-colors",
                room.status === "occupied" ? "bg-[#00152A]/5 text-[#00152A]" : 
                room.status === "available" ? "bg-[#BA722E]/5 text-[#BA722E]" :
                room.status === "cleaning" ? "bg-orange-50 text-orange-400" : "bg-red-50 text-red-500"
              )}>
                {room.status === "occupied" ? <BedDouble className="w-4 h-4" /> : 
                 room.status === "available" ? <Key className="w-4 h-4" /> :
                 room.status === "cleaning" ? <RefreshCw className="w-4 h-4" /> : <Wrench className="w-4 h-4" />}
              </div>
            </div>

            {room.status === "occupied" ? (
              <div className="space-y-3 pt-4 border-t border-gray-50">
                <p className="text-xs font-bold text-[#00152A] line-clamp-1">{room.guest}</p>
                <Badge className="bg-gray-50 text-gray-400 border-0 text-[8px] font-bold uppercase tracking-widest px-2 py-0.5">
                  Checked In
                </Badge>
              </div>
            ) : (
              <div className="pt-4 border-t border-gray-50">
                <p className="text-[8px] font-bold text-gray-300 uppercase tracking-widest italic">
                  {room.status.toUpperCase()}
                </p>
              </div>
            )}

            <button className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-all text-gray-300 hover:text-[#BA722E]">
              <Info className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
