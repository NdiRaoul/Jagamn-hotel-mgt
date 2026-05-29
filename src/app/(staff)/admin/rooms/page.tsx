"use client";

import React, { useState } from "react";
import {
  Plus,
  Filter,
  MoreVertical,
  CheckCircle2,
  Clock,
  AlertCircle,
  Hammer,
  Sparkles,
  ChevronDown,
  X,
  Search,
  BedDouble,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// --- Mock Data ---
const ROOMS_DATA = [
  {
    id: "101",
    type: "Deluxe Suite",
    guest: "Mr. Julian Thorne",
    status: "occupied",
    lastUpdated: "10 mins ago",
  },
  {
    id: "102",
    type: "Executive King",
    guest: "Ready for Check-in",
    status: "available",
    lastUpdated: "2 hours ago",
  },
  {
    id: "103",
    type: "Standard Twin",
    guest: "Cleaning in Progress",
    status: "cleaning",
    lastUpdated: "Just now",
  },
  {
    id: "104",
    type: "Garden View",
    guest: "Arriving 18:00",
    status: "reserved",
    lastUpdated: "1 hour ago",
  },
  {
    id: "105",
    type: "Royal Suite",
    guest: "AC Repair Required",
    status: "maintenance",
    lastUpdated: "4 hours ago",
  },
  {
    id: "201",
    type: "Sky Loft",
    guest: "Lady Genevieve",
    status: "occupied",
    lastUpdated: "30 mins ago",
  },
  {
    id: "202",
    type: "Executive King",
    guest: "Ready for Check-in",
    status: "available",
    lastUpdated: "5 hours ago",
  },
  {
    id: "203",
    type: "Deluxe Twin",
    guest: "Departure at 11:00",
    status: "cleaning",
    lastUpdated: "15 mins ago",
  },
];

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
};

export default function RoomsPage() {
  const [rooms, setRooms] = useState(ROOMS_DATA);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [floorFilter, setFloorFilter] = useState("all");

  // --- Dynamic Calculations ---
  const stats = React.useMemo(() => {
    const total = rooms.length;
    const occupied = rooms.filter(r => r.status === 'occupied').length;
    const cleaning = rooms.filter(r => r.status === 'cleaning').length;
    
    return {
      occupancy: Math.round((occupied / total) * 100),
      needsCleaning: cleaning
    };
  }, [rooms]);

  // --- Filtering Logic ---
  const filteredRooms = React.useMemo(() => {
    if (floorFilter === "all") return rooms;
    return rooms.filter(r => r.id.startsWith(floorFilter));
  }, [rooms, floorFilter]);

  const selectedRoom = rooms.find(r => r.id === selectedRoomId);

  const handleStatusUpdate = (roomId: string, newStatus: string) => {
    setRooms(prev => prev.map(room => 
      room.id === roomId ? { ...room, status: newStatus } : room
    ));
    setSelectedRoomId(null);
  };

  const handleBulkUpdate = () => {
    // In a real app, this might open a multi-select mode or a dialog
    alert("Bulk Update mode enabled. Select rooms to update.");
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      {/* ── Header Section ─────────────────────────── */}
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-10">
        <div className="max-w-xl space-y-4">
          <h1 className="manrope-bold text-4xl md:text-5xl text-[#0D2137] tracking-tight">
            Room Status Board
          </h1>
          <p className="text-slate-400 font-medium leading-relaxed">
            Real-time oversight of the West Wing and Presidential Suites. Tap
            any room card to manage logistics.
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Button 
              onClick={handleBulkUpdate}
              className="h-12 px-6 bg-[#0D2137] text-white manrope-bold rounded-xl flex items-center gap-2 shadow-lg hover:scale-[1.02] transition-all"
            >
              <Plus className="w-5 h-5" /> Bulk Update
            </Button>
            
            <Select value={floorFilter} onValueChange={setFloorFilter}>
              <SelectTrigger className="h-12 w-[180px] border-gray-200 rounded-xl manrope-bold text-slate-500 bg-white shadow-sm focus:ring-jagamn-tertiary/20">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  <SelectValue placeholder="Filter Floor" />
                </div>
              </SelectTrigger>
              <SelectContent className="rounded-xl border-gray-100 shadow-xl">
                <SelectItem value="all" className="manrope-bold">All Floors</SelectItem>
                <SelectItem value="1" className="manrope-bold">First Floor</SelectItem>
                <SelectItem value="2" className="manrope-bold">Second Floor</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full lg:max-w-2xl">
          {/* Occupancy Card */}
          <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm border-l-4 border-l-[#0D2137]">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
              Total Occupancy
            </p>
            <div className="space-y-4">
              <h3 className="manrope-bold text-5xl text-[#0D2137]">{stats.occupancy}%</h3>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#E8924A] rounded-full transition-all duration-1000" 
                  style={{ width: `${stats.occupancy}%` }}
                />
              </div>
            </div>
          </div>

          {/* Cleaning Card */}
          <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm border-l-4 border-l-[#E8924A]">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
              Needs Cleaning
            </p>
            <div className="space-y-2">
              <h3 className="manrope-bold text-5xl text-[#0D2137]">{stats.needsCleaning}</h3>
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
        {filteredRooms.map((room) => {
          const config =
            STATUS_CONFIG[room.status as keyof typeof STATUS_CONFIG];
          return (
            <div
              key={room.id}
              onClick={() => setSelectedRoomId(room.id)}
              className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all cursor-pointer group relative overflow-hidden"
            >
              <div className="flex items-start justify-between mb-6">
                <h4 className="manrope-bold text-3xl text-[#0D2137]">
                  {room.id}
                </h4>
                <button className="text-gray-300 hover:text-[#0D2137] transition-colors">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-1 mb-8">
                <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest leading-none mb-1">
                  {room.type}
                </p>
                <p
                  className={cn(
                    "manrope-bold text-sm leading-tight transition-colors",
                    room.status === "maintenance"
                      ? "text-red-500"
                      : "text-[#0D2137]",
                  )}
                >
                  {room.guest}
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
      </div>

      {/* ── Quick Update Panel ─────────────────────── */}
      {selectedRoom && (
        <QuickUpdatePanel 
          room={selectedRoom} 
          onClose={() => setSelectedRoomId(null)} 
          onSave={handleStatusUpdate}
        />
      )}
    </div>
  );
}

// --- Sub-Components ---

function QuickUpdatePanel({ room, onClose, onSave }: { room: any, onClose: () => void, onSave: (id: string, status: string) => void }) {
  const [pendingStatus, setPendingStatus] = useState(room.status);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center md:items-end md:justify-end p-6 md:p-10 pointer-events-none">
      <div
        className="absolute inset-0 bg-[#0D2137]/10 backdrop-blur-sm md:bg-transparent md:backdrop-blur-none pointer-events-auto"
        onClick={onClose}
      />
      <div className="bg-white w-full max-w-sm rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.2)] p-8 relative z-10 animate-in slide-in-from-bottom-8 md:slide-in-from-right-8 duration-500 pointer-events-auto border border-gray-100">
        <div className="flex items-start justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#0D2137] rounded-xl flex items-center justify-center text-white shadow-lg shadow-[#0D2137]/20">
              <BedDouble className="w-6 h-6" />
            </div>
            <div>
              <h3 className="manrope-bold text-xl text-[#0D2137]">
                Quick Update: Room {room.id}
              </h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                Currently:{" "}
                <span className="text-[#E8924A]">
                  {room.status}
                </span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:text-red-500 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-8">
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
              Change Status To
            </label>
            <Select
              defaultValue={pendingStatus}
              onValueChange={setPendingStatus}
            >
              <SelectTrigger className="h-14 bg-gray-50 border-gray-100 rounded-xl px-5 manrope-bold text-sm text-[#0D2137] focus:ring-jagamn-tertiary/20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-gray-100 shadow-2xl p-2 z-[110]">
                {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                  <SelectItem
                    key={key}
                    value={key}
                    className="manrope-bold py-3 rounded-xl focus:bg-gray-50"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn("w-2 h-2 rounded-full", config.color)}
                      />
                      {config.text}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-4">
            <Button
              onClick={() => onSave(room.id, pendingStatus)}
              className="flex-1 h-14 bg-[#0D2137] hover:bg-[#0D2137]/90 text-white manrope-bold rounded-xl shadow-xl shadow-[#0D2137]/20 transition-all hover:scale-[1.02]"
            >
              Save Changes
            </Button>
            <Button
              variant="outline"
              className="h-14 px-6 border-gray-100 rounded-xl manrope-bold text-[#0D2137] hover:bg-gray-50 transition-all"
            >
              Details
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
