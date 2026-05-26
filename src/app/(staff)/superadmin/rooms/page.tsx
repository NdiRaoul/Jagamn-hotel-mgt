"use client";

import React, { useState, useEffect, useMemo } from "react";
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
  Home,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// --- Mock Data with Amenities & Floors ---
const ROOMS_DATA = [
  { id: "101", type: "Deluxe Suite", guest: "Mr. Julian Thorne", status: "occupied", lastUpdated: "10 mins ago", amenities: ["WiFi", "Mini Bar", "AC", "Sea View"], floor: "1" },
  { id: "102", type: "Executive King", guest: "Ready for Check-in", status: "available", lastUpdated: "2 hours ago", amenities: ["WiFi", "Mini Bar", "Work Desk"], floor: "1" },
  { id: "103", type: "Standard Twin", guest: "Cleaning in Progress", status: "cleaning", lastUpdated: "Just now", amenities: ["WiFi", "Twin Beds"], floor: "1" },
  { id: "104", type: "Garden View", guest: "Arriving 18:00", status: "reserved", lastUpdated: "1 hour ago", amenities: ["WiFi", "Balcony", "AC"], floor: "1" },
  { id: "105", type: "Royal Suite", guest: "AC Repair Required", status: "maintenance", lastUpdated: "4 hours ago", amenities: ["WiFi", "Jacuzzi", "AC"], floor: "1" },
  { id: "201", type: "Sky Loft", guest: "Lady Genevieve", status: "occupied", lastUpdated: "30 mins ago", amenities: ["WiFi", "Mini Bar", "AC", "Skyline View"], floor: "2" },
  { id: "202", type: "Executive King", guest: "Ready for Check-in", status: "available", lastUpdated: "5 hours ago", amenities: ["WiFi", "Mini Bar", "Work Desk"], floor: "2" },
  { id: "203", type: "Deluxe Twin", guest: "Departure at 11:00", status: "cleaning", lastUpdated: "15 mins ago", amenities: ["WiFi", "Mini Bar", "AC"], floor: "2" },
];

const STATUS_CONFIG = {
  available: { color: "bg-green-500", text: "Available", light: "bg-green-50", textColor: "text-green-600", icon: CheckCircle2 },
  occupied: { color: "bg-[#0D2137]", text: "Occupied", light: "bg-slate-50", textColor: "text-slate-600", icon: BedDouble },
  reserved: { color: "bg-[#E8924A]", text: "Reserved", light: "bg-orange-50", textColor: "text-orange-600", icon: Clock },
  maintenance: { color: "bg-[#718096]", text: "Maintenance", light: "bg-gray-50", textColor: "text-gray-600", icon: Hammer },
  cleaning: { color: "bg-[#ECC94B]", text: "Cleaning", light: "bg-yellow-50", textColor: "text-yellow-600", icon: Sparkles },
};

const ROOM_TYPES = [
  "Deluxe Suite",
  "Executive King",
  "Standard Twin",
  "Garden View",
  "Royal Suite",
  "Sky Loft",
  "Deluxe Twin"
];

export default function RoomsPage() {
  const [rooms, setRooms] = useState(ROOMS_DATA);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [floorFilter, setFloorFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Dialog States
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<any>(null);

  // Global Search Integration
  useEffect(() => {
    const handleGlobalSearch = (e: any) => {
      setSearchQuery(e.detail || "");
    };
    window.addEventListener('jagamn-global-search', handleGlobalSearch);
    return () => window.removeEventListener('jagamn-global-search', handleGlobalSearch);
  }, []);

  const stats = useMemo(() => {
    const total = rooms.length;
    const occupied = rooms.filter(r => r.status === 'occupied').length;
    const cleaning = rooms.filter(r => r.status === 'cleaning').length;
    return { occupancy: total ? Math.round((occupied / total) * 100) : 0, needsCleaning: cleaning };
  }, [rooms]);

  const filteredRooms = useMemo(() => {
    return rooms.filter(r => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = !searchQuery || 
        r.id.toLowerCase().includes(q) ||
        r.type.toLowerCase().includes(q) ||
        r.guest.toLowerCase().includes(q) ||
        r.status.toLowerCase().includes(q);
        
      const matchesFloor = floorFilter === "all" || r.id.startsWith(floorFilter);

      return matchesSearch && matchesFloor;
    });
  }, [rooms, floorFilter, searchQuery]);

  const selectedRoom = rooms.find(r => r.id === selectedRoomId);

  const handleStatusUpdate = (roomId: string, newStatus: string) => {
    setRooms(prev => prev.map(room => room.id === roomId ? { ...room, status: newStatus, lastUpdated: "Just now" } : room));
    setSelectedRoomId(null);
  };

  const handleAddRoomSubmit = (newRoom: any) => {
    setRooms(prev => [...prev, newRoom]);
    setIsAddOpen(false);
  };

  const handleEditRoomSubmit = (updatedRoom: any) => {
    setRooms(prev => prev.map(r => r.id === updatedRoom.id ? updatedRoom : r));
    setIsEditOpen(false);
    setSelectedRoomId(null);
  };

  const handleOpenDetails = () => {
    setEditingRoom(selectedRoom);
    setIsEditOpen(true);
    setSelectedRoomId(null);
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      {/* ── Header Section ─────────────────────────── */}
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-10">
        <div className="max-w-xl space-y-4">
          <h1 className="manrope-bold text-4xl md:text-5xl text-[#0D2137] tracking-tight">Room Status Board</h1>
          <p className="text-slate-400 font-medium leading-relaxed">
            Real-time oversight of the West Wing and Presidential Suites. Tap any room card to manage logistics.
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Button onClick={() => setIsAddOpen(true)} className="h-12 px-6 bg-[#E8924A] text-white manrope-bold rounded-xl flex items-center gap-2 shadow-lg hover:scale-[1.02] transition-all hover:bg-[#E8924A]/90">
              <Plus className="w-5 h-5" /> Add Room
            </Button>
            
            <Select value={floorFilter} onValueChange={setFloorFilter}>
              <SelectTrigger className="h-12 w-[160px] border-gray-200 rounded-xl manrope-bold text-slate-500 bg-white shadow-sm">
                <div className="flex items-center gap-2"><Filter className="w-4 h-4" /><SelectValue placeholder="Filter Floor" /></div>
              </SelectTrigger>
              <SelectContent className="rounded-xl border-gray-100 shadow-xl">
                <SelectItem value="all" className="manrope-bold">All Floors</SelectItem>
                <SelectItem value="1" className="manrope-bold">First Floor</SelectItem>
                <SelectItem value="2" className="manrope-bold">Second Floor</SelectItem>
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
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Total Occupancy</p>
            <div className="space-y-4">
              <h3 className="manrope-bold text-5xl text-[#0D2137]">{stats.occupancy}%</h3>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-[#E8924A] rounded-full transition-all duration-1000" style={{ width: `${stats.occupancy}%` }} /></div>
            </div>
          </div>
          <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm border-l-4 border-l-[#E8924A]">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Needs Cleaning</p>
            <div className="space-y-2">
              <h3 className="manrope-bold text-5xl text-[#0D2137]">{stats.needsCleaning}</h3>
              <p className="text-xs text-[#E8924A] font-black uppercase tracking-widest flex items-center gap-2"><AlertCircle className="w-4 h-4" /> High Priority</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Status Legend ──────────────────────────── */}
      <div className="flex flex-wrap items-center gap-x-8 gap-y-4 bg-white/50 backdrop-blur-sm p-4 rounded-xl border border-gray-100 w-fit">
        {Object.entries(STATUS_CONFIG).map(([key, config]) => (
          <div key={key} className="flex items-center gap-2.5">
            <div className={cn("w-3 h-3 rounded-full shadow-sm", config.color)} />
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{config.text}</span>
          </div>
        ))}
      </div>

      {/* ── Room Grid ──────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {filteredRooms.map((room) => {
          const config = STATUS_CONFIG[room.status as keyof typeof STATUS_CONFIG];
          return (
            <div key={room.id} onClick={() => setSelectedRoomId(room.id)} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all cursor-pointer group relative overflow-hidden">
              <div className="flex items-start justify-between mb-6">
                <h4 className="manrope-bold text-3xl text-[#0D2137]">{room.id}</h4>
                <button className="text-gray-300 hover:text-[#0D2137] transition-colors" onClick={(e) => { e.stopPropagation(); setSelectedRoomId(room.id); }}><MoreVertical className="w-5 h-5" /></button>
              </div>
              <div className="space-y-1 mb-8">
                <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest leading-none mb-1">{room.type}</p>
                <p className={cn("manrope-bold text-sm leading-tight transition-colors", room.status === "maintenance" ? "text-red-500" : "text-[#0D2137]")}>{room.guest}</p>
              </div>
              <div className="flex items-center justify-between">
                <Badge className={cn("border-0 text-[8px] font-black px-2.5 py-1 rounded-md tracking-widest uppercase", config.light, config.textColor)}>{config.text}</Badge>
                <div className={cn("w-2.5 h-2.5 rounded-full", config.color)} />
              </div>
            </div>
          );
        })}
        {filteredRooms.length === 0 && (
           <div className="col-span-1 sm:col-span-2 lg:col-span-4 xl:col-span-5 py-20 text-center text-slate-400 manrope-bold italic border border-dashed border-gray-200 rounded-3xl">No rooms match your search query.</div>
        )}
      </div>

      {/* ── Quick Update Panel ─────────────────────── */}
      {selectedRoom && (
        <QuickUpdatePanel 
          room={selectedRoom} 
          onClose={() => setSelectedRoomId(null)} 
          onSave={handleStatusUpdate} 
          onOpenDetails={handleOpenDetails}
        />
      )}

      {/* ── Dialog Components ──────────────────────── */}
      <AddRoomDialog 
        open={isAddOpen} 
        onOpenChange={setIsAddOpen} 
        onSubmit={handleAddRoomSubmit} 
      />

      {editingRoom && (
        <EditRoomDialog 
          open={isEditOpen} 
          onOpenChange={setIsEditOpen} 
          room={editingRoom} 
          onSubmit={handleEditRoomSubmit}
          onDelete={(id: string) => {
            setRooms(prev => prev.filter(r => r.id !== id));
            setIsEditOpen(false);
            setSelectedRoomId(null);
          }}
        />
      )}
    </div>
  );
}

function QuickUpdatePanel({ room, onClose, onSave, onOpenDetails }: any) {
  const [pendingStatus, setPendingStatus] = useState(room.status);
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center md:items-end md:justify-end p-6 md:p-10 pointer-events-none">
      <div className="absolute inset-0 bg-[#0D2137]/10 backdrop-blur-sm md:bg-transparent md:backdrop-blur-none pointer-events-auto" onClick={onClose} />
      <div className="bg-white w-full max-w-sm rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.2)] p-8 relative z-10 animate-in slide-in-from-bottom-8 md:slide-in-from-right-8 duration-500 pointer-events-auto border border-gray-100">
        <div className="flex items-start justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#0D2137] rounded-xl flex items-center justify-center text-white shadow-lg shadow-[#0D2137]/20"><BedDouble className="w-6 h-6" /></div>
            <div><h3 className="manrope-bold text-xl text-[#0D2137]">Quick Update: Room {room.id}</h3><p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Currently: <span className="text-[#E8924A]">{room.status}</span></p></div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:text-red-500 transition-all"><X className="w-5 h-5" /></button>
        </div>
        <div className="space-y-8">
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Change Status To</label>
            <Select defaultValue={pendingStatus} onValueChange={setPendingStatus}>
              <SelectTrigger className="h-14 bg-gray-50 border-gray-100 rounded-xl px-5 manrope-bold text-sm text-[#0D2137]"><SelectValue /></SelectTrigger>
              <SelectContent className="rounded-2xl border-gray-100 shadow-2xl p-2 z-[110]">
                {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                  <SelectItem key={key} value={key} className="manrope-bold py-3 rounded-xl focus:bg-gray-50"><div className="flex items-center gap-3"><div className={cn("w-2 h-2 rounded-full", config.color)} />{config.text}</div></SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-4">
            <Button onClick={() => onSave(room.id, pendingStatus)} className="flex-1 h-14 bg-[#0D2137] hover:bg-[#0D2137]/90 text-white manrope-bold rounded-xl shadow-xl transition-all">Save Changes</Button>
            <Button onClick={onOpenDetails} variant="outline" className="h-14 px-6 border-gray-100 rounded-xl manrope-bold text-[#0D2137] hover:bg-gray-50 transition-all">Details</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── ADD ROOM DIALOG ────────────────────────────────
function AddRoomDialog({ open, onOpenChange, onSubmit }: any) {
  const [id, setId] = useState("");
  const [type, setType] = useState("Deluxe Suite");
  const [floor, setFloor] = useState("1");
  const [guest, setGuest] = useState("Ready for Check-in");
  const [status, setStatus] = useState("available");
  const [amenities, setAmenities] = useState<string[]>(["WiFi"]);
  const [amenityInput, setAmenityInput] = useState("");

  const handleAddAmenity = (e: React.FormEvent) => {
    e.preventDefault();
    if (amenityInput.trim() && !amenities.includes(amenityInput.trim())) {
      setAmenities([...amenities, amenityInput.trim()]);
      setAmenityInput("");
    }
  };

  const handleRemoveAmenity = (item: string) => {
    setAmenities(prev => prev.filter(a => a !== item));
  };

  const handleFormSubmit = () => {
    if (!id.trim()) {
      alert("Please provide a Room ID.");
      return;
    }
    onSubmit({
      id: id.trim(),
      type,
      guest: guest.trim() || "Ready for Check-in",
      status,
      lastUpdated: "Just now",
      amenities,
      floor
    });
    // Reset state
    setId("");
    setType("Deluxe Suite");
    setFloor("1");
    setGuest("Ready for Check-in");
    setStatus("available");
    setAmenities(["WiFi"]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[640px] p-0 border-0 bg-white rounded-3xl overflow-hidden flex flex-col">
        <div className="bg-[#0D2137] p-8 md:p-10 text-white relative">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2">Room Administration</p>
          <DialogTitle className="manrope-bold text-4xl text-white tracking-tight">Add New Hotel Room</DialogTitle>
          <div className="absolute top-8 right-8 opacity-10"><BedDouble className="w-16 h-16" /></div>
        </div>
        
        <div className="p-8 md:p-10 space-y-6 flex-1 overflow-y-auto max-h-[60vh] custom-scrollbar">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[9px] font-black text-[#43474D] uppercase tracking-widest">Room ID / Number</label>
              <Input 
                value={id}
                onChange={e => setId(e.target.value)}
                placeholder="e.g. 106"
                className="h-12 bg-slate-50 border-0 rounded-xl px-4 text-xs font-semibold text-[#0D2137]"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-[9px] font-black text-[#43474D] uppercase tracking-widest">Floor Assignment</label>
              <Select value={floor} onValueChange={setFloor}>
                <SelectTrigger className="h-12 bg-slate-50 border-0 rounded-xl px-4 text-xs font-semibold text-[#0D2137]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="1">First Floor (Wing A)</SelectItem>
                  <SelectItem value="2">Second Floor (Wing B)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[9px] font-black text-[#43474D] uppercase tracking-widest">Room Type</label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger className="h-12 bg-slate-50 border-0 rounded-xl px-4 text-xs font-semibold text-[#0D2137]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {ROOM_TYPES.map(t => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-[9px] font-black text-[#43474D] uppercase tracking-widest">Initial Status</label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="h-12 bg-slate-50 border-0 rounded-xl px-4 text-xs font-semibold text-[#0D2137]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                    <SelectItem key={key} value={key}>{config.text}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[9px] font-black text-[#43474D] uppercase tracking-widest">Guest / Occupancy Message</label>
            <Input 
              value={guest}
              onChange={e => setGuest(e.target.value)}
              placeholder="e.g. Ready for Check-in"
              className="h-12 bg-slate-50 border-0 rounded-xl px-4 text-xs font-semibold text-[#0D2137]"
            />
          </div>

          <div className="space-y-4">
            <label className="text-[9px] font-black text-[#43474D] uppercase tracking-widest">Add Amenities & Features</label>
            <div className="flex gap-3">
              <Input 
                value={amenityInput}
                onChange={e => setAmenityInput(e.target.value)}
                placeholder="e.g. WiFi, Sea View, Balcony"
                className="h-12 bg-slate-50 border-0 rounded-xl px-4 text-xs font-semibold text-[#0D2137]"
                onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); handleAddAmenity(e); } }}
              />
              <Button onClick={handleAddAmenity} className="h-12 bg-[#E8924A] hover:bg-[#D4813B] text-white manrope-bold px-6 rounded-xl flex items-center gap-1 shrink-0 uppercase tracking-widest text-[10px]">
                + Add
              </Button>
            </div>
            
            <div className="flex flex-wrap gap-2 pt-2">
              {amenities.map(a => (
                <Badge key={a} variant="secondary" className="bg-sky-50 text-sky-600 border-0 font-black text-[9px] uppercase tracking-widest px-3 py-1.5 rounded-xl flex items-center gap-2">
                  {a}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleRemoveAmenity(a);
                    }}
                    className="w-4 h-4 flex items-center justify-center rounded-full hover:bg-sky-100 text-sky-600/60 hover:text-sky-600 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
              {amenities.length === 0 && <span className="text-[10px] text-slate-400 italic">No amenities added yet.</span>}
            </div>
          </div>
        </div>

        <div className="p-8 bg-slate-50 border-t border-gray-100 flex items-center justify-end gap-4 shrink-0">
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600">Cancel</Button>
          <Button onClick={handleFormSubmit} className="h-12 px-8 bg-[#0D2137] hover:bg-[#0D2137]/90 text-white manrope-bold rounded-xl shadow-lg">Save & Add Room</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── EDIT & DETAILS ROOM DIALOG ─────────────────────
function EditRoomDialog({ open, onOpenChange, room, onSubmit, onDelete }: any) {
  const [type, setType] = useState(room.type);
  const [floor, setFloor] = useState(room.floor || "1");
  const [guest, setGuest] = useState(room.guest);
  const [status, setStatus] = useState(room.status);
  const [amenities, setAmenities] = useState<string[]>(room.amenities || []);
  const [amenityInput, setAmenityInput] = useState("");

  useEffect(() => {
    setType(room.type);
    setFloor(room.floor || "1");
    setGuest(room.guest);
    setStatus(room.status);
    setAmenities(room.amenities || []);
  }, [room]);

  const handleAddAmenity = (e: React.FormEvent) => {
    e.preventDefault();
    if (amenityInput.trim() && !amenities.includes(amenityInput.trim())) {
      setAmenities([...amenities, amenityInput.trim()]);
      setAmenityInput("");
    }
  };

  const handleRemoveAmenity = (item: string) => {
    setAmenities(prev => prev.filter(a => a !== item));
  };

  const handleFormSubmit = () => {
    onSubmit({
      ...room,
      type,
      guest: guest.trim() || "Ready for Check-in",
      status,
      lastUpdated: "Just now",
      amenities,
      floor
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[640px] p-0 border-0 bg-white rounded-3xl overflow-hidden flex flex-col">
        <div className="bg-[#0D2137] p-8 md:p-10 text-white relative">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2">Room Administration</p>
          <DialogTitle className="manrope-bold text-4xl text-white tracking-tight">Edit Room Details: {room.id}</DialogTitle>
          <div className="absolute top-8 right-8 opacity-10"><BedDouble className="w-16 h-16" /></div>
        </div>
        
        <div className="p-8 md:p-10 space-y-6 flex-1 overflow-y-auto max-h-[60vh] custom-scrollbar">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[9px] font-black text-[#43474D] uppercase tracking-widest">Room ID (Read-only)</label>
              <Input 
                value={room.id}
                disabled
                className="h-12 bg-slate-100 border-0 rounded-xl px-4 text-xs font-semibold text-slate-500 cursor-not-allowed"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-[9px] font-black text-[#43474D] uppercase tracking-widest">Floor Assignment</label>
              <Select value={floor} onValueChange={setFloor}>
                <SelectTrigger className="h-12 bg-slate-50 border-0 rounded-xl px-4 text-xs font-semibold text-[#0D2137]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="1">First Floor (Wing A)</SelectItem>
                  <SelectItem value="2">Second Floor (Wing B)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[9px] font-black text-[#43474D] uppercase tracking-widest">Room Type</label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger className="h-12 bg-slate-50 border-0 rounded-xl px-4 text-xs font-semibold text-[#0D2137]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {ROOM_TYPES.map(t => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-[9px] font-black text-[#43474D] uppercase tracking-widest">Current Status</label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="h-12 bg-slate-50 border-0 rounded-xl px-4 text-xs font-semibold text-[#0D2137]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                    <SelectItem key={key} value={key}>{config.text}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[9px] font-black text-[#43474D] uppercase tracking-widest">Guest / Occupancy Message</label>
            <Input 
              value={guest}
              onChange={e => setGuest(e.target.value)}
              placeholder="e.g. Ready for Check-in"
              className="h-12 bg-slate-50 border-0 rounded-xl px-4 text-xs font-semibold text-[#0D2137]"
            />
          </div>

          <div className="space-y-4">
            <label className="text-[9px] font-black text-[#43474D] uppercase tracking-widest">Edit Amenities & Features</label>
            <div className="flex gap-3">
              <Input 
                value={amenityInput}
                onChange={e => setAmenityInput(e.target.value)}
                placeholder="e.g. WiFi, Sea View, Balcony"
                className="h-12 bg-slate-50 border-0 rounded-xl px-4 text-xs font-semibold text-[#0D2137]"
                onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); handleAddAmenity(e); } }}
              />
              <Button onClick={handleAddAmenity} className="h-12 bg-[#E8924A] hover:bg-[#D4813B] text-white manrope-bold px-6 rounded-xl flex items-center gap-1 shrink-0 uppercase tracking-widest text-[10px]">
                + Add
              </Button>
            </div>
            
            <div className="flex flex-wrap gap-2 pt-2">
              {amenities.map(a => (
                <Badge key={a} variant="secondary" className="bg-sky-50 text-sky-600 border-0 font-black text-[9px] uppercase tracking-widest px-3 py-1.5 rounded-xl flex items-center gap-2">
                  {a}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleRemoveAmenity(a);
                    }}
                    className="w-4 h-4 flex items-center justify-center rounded-full hover:bg-sky-100 text-sky-600/60 hover:text-sky-600 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
              {amenities.length === 0 && <span className="text-[10px] text-slate-400 italic">No amenities added yet.</span>}
            </div>
          </div>
        </div>

        <div className="p-8 bg-slate-50 border-t border-gray-100 flex items-center justify-between shrink-0">
          <Button variant="outline" onClick={() => onDelete(room.id)} className="h-12 px-6 border-red-100 text-red-500 hover:bg-red-50 hover:text-red-600 manrope-bold rounded-xl flex items-center gap-1 shrink-0 uppercase tracking-widest text-[10px]">
            Delete Room
          </Button>
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => onOpenChange(false)} className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600">Cancel</Button>
            <Button onClick={handleFormSubmit} className="h-12 px-8 bg-[#0D2137] hover:bg-[#0D2137]/90 text-white manrope-bold rounded-xl shadow-lg">Save Changes</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
