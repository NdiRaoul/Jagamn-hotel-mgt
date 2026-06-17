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
  X,
  Search,
  BedDouble,
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
import type { RoomBoardRoom } from "@/lib/data/reception";
import type { RoomAvailabilitySummary } from "@/types/database";
import { formatMoney } from "@/lib/currency";
import {
  ReassignRoomModal,
  type ReassignTarget,
} from "@/components/reception/reassign-room-modal";

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
  // legacy UI states kept for QuickUpdatePanel
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

interface Props {
  rooms: RoomBoardRoom[];
  summary: RoomAvailabilitySummary[];
  error: string | null;
}

export default function RoomsClient({ rooms, summary, error }: Props) {
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [reassignTarget, setReassignTarget] = useState<ReassignTarget | null>(
    null,
  );
  const [floorFilter, setFloorFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  // local overrides for status (pending a proper room-status API)
  const [statusOverrides, setStatusOverrides] = useState<
    Record<string, string>
  >({});

  useEffect(() => {
    const handleGlobalSearch = (e: CustomEvent<string>) => {
      setSearchQuery(e.detail || "");
    };
    window.addEventListener(
      "jagamn-global-search",
      handleGlobalSearch as EventListener,
    );
    return () =>
      window.removeEventListener(
        "jagamn-global-search",
        handleGlobalSearch as EventListener,
      );
  }, []);

  const stats = useMemo(() => {
    const totalRooms = summary.reduce((s, r) => s + r.total_rooms, 0) || rooms.length;
    const occupied = summary.reduce((s, r) => s + r.booked_today, 0);
    const needsCleaning = rooms.filter(
      (r) => (statusOverrides[r.id] ?? r.status) === "dirty",
    ).length;
    return {
      occupancy: totalRooms > 0 ? Math.round((occupied / totalRooms) * 100) : 0,
      needsCleaning,
    };
  }, [rooms, summary, statusOverrides]);

  const filteredRooms = useMemo(() => {
    return rooms.filter((r) => {
      const q = searchQuery.toLowerCase();
      const effectiveStatus = statusOverrides[r.id] ?? r.status;
      const matchesSearch =
        !searchQuery ||
        r.unitCode.toLowerCase().includes(q) ||
        r.roomTypeName.toLowerCase().includes(q) ||
        (r.guestName || "").toLowerCase().includes(q) ||
        effectiveStatus.toLowerCase().includes(q);

      const matchesFloor =
        floorFilter === "all" ||
        (r.floor !== null && String(r.floor) === floorFilter);

      return matchesSearch && matchesFloor;
    });
  }, [rooms, floorFilter, searchQuery, statusOverrides]);

  const selectedRoom = rooms.find((r) => r.id === selectedRoomId);

  const handleStatusUpdate = async (roomId: string, newStatus: string) => {
    setStatusOverrides((prev) => ({ ...prev, [roomId]: newStatus }));
    setSelectedRoomId(null);

    // Persist housekeeping changes. "available" clears the dirty flag (clean);
    // "occupied" is booking-driven, so it isn't a housekeeping write.
    const housekeepingStatus =
      newStatus === "available"
        ? "clean"
        : newStatus === "dirty" || newStatus === "out_of_order"
          ? newStatus
          : null;
    if (housekeepingStatus) {
      await fetch(`/api/reception/rooms/${roomId}/housekeeping`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: housekeepingStatus }),
      }).catch(() => {});
    }
  };

  const floors = useMemo(() => {
    const unique = new Set(
      rooms.map((r) => r.floor).filter((f): f is number => f !== null),
    );
    return Array.from(unique).sort((a, b) => a - b);
  }, [rooms]);

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      {/* ── Header Section ─────────────────────────── */}
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-10">
        <div className="max-w-xl space-y-4">
          <h1 className="manrope-bold text-4xl md:text-5xl text-[#0D2137] tracking-tight">
            Room Status Board
          </h1>
          <p className="text-slate-400 font-medium leading-relaxed">
            Real-time oversight of all Palace rooms. Tap any room card to manage
            logistics.
          </p>

          {error && (
            <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-red-600 text-sm font-medium">
              {error}
            </div>
          )}

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
                {floors.map((f) => (
                  <SelectItem key={f} value={String(f)} className="manrope-bold">
                    Floor {f}
                  </SelectItem>
                ))}
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
        {(["available", "occupied", "reserved", "dirty", "out_of_order"] as const).map(
          (key) => {
            const config = STATUS_CONFIG[key];
            return (
              <div key={key} className="flex items-center gap-2.5">
                <div className={cn("w-3 h-3 rounded-full shadow-sm", config.color)} />
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  {config.text}
                </span>
              </div>
            );
          },
        )}
      </div>

      {/* ── Room Grid ──────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {filteredRooms.map((room) => {
          const effectiveStatus = (statusOverrides[room.id] ??
            room.status) as keyof typeof STATUS_CONFIG;
          const config =
            STATUS_CONFIG[effectiveStatus] ?? STATUS_CONFIG.available;
          const guestLabel =
            (effectiveStatus === "occupied" || effectiveStatus === "reserved"
              ? room.guestName || room.bookingRef
              : null) ||
            (effectiveStatus === "available"
              ? "Ready for Check-in"
              : effectiveStatus === "dirty"
                ? "Cleaning Required"
                : effectiveStatus === "out_of_order"
                  ? "Out of Order"
                  : room.guestName || "—");

          return (
            <div
              key={room.id}
              onClick={() => setSelectedRoomId(room.id)}
              className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all cursor-pointer group relative overflow-hidden"
            >
              <div className="flex items-start justify-between mb-6">
                <h4 className="manrope-bold text-3xl text-[#0D2137]">
                  {room.unitCode}
                </h4>
                <button className="text-gray-300 hover:text-[#0D2137] transition-colors">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-1 mb-8">
                <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest leading-none mb-1">
                  {room.roomTypeName}
                </p>
                <p
                  className={cn(
                    "manrope-bold text-sm leading-tight transition-colors",
                    effectiveStatus === "out_of_order"
                      ? "text-red-500"
                      : "text-[#0D2137]",
                  )}
                >
                  {guestLabel}
                </p>
                {room.balanceDue > 0 ? (
                  <p className="text-[11px] font-bold text-[#E65100] flex items-center gap-1 pt-1">
                    Balance: {formatMoney(room.balanceDue)}
                  </p>
                ) : room.refundDue > 0 ? (
                  <p className="text-[11px] font-bold text-emerald-600 flex items-center gap-1 pt-1">
                    Refund: {formatMoney(room.refundDue)}
                  </p>
                ) : null}
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
                {room.balanceDue > 0 ? (
                  <span className="text-[8px] font-black uppercase tracking-widest text-[#E65100] bg-[#FFF3E0] px-2 py-1 rounded-md">
                    Owing
                  </span>
                ) : room.refundDue > 0 ? (
                  <span className="text-[8px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                    Refund
                  </span>
                ) : (
                  <div
                    className={cn("w-2.5 h-2.5 rounded-full", config.color)}
                  />
                )}
              </div>
            </div>
          );
        })}
        {filteredRooms.length === 0 && (
          <div className="col-span-1 sm:col-span-2 lg:col-span-4 xl:col-span-5 py-20 text-center text-slate-400 manrope-bold italic border border-dashed border-gray-200 rounded-3xl">
            {rooms.length === 0
              ? "No rooms in the database yet."
              : "No rooms match your search query."}
          </div>
        )}
      </div>

      {/* ── Quick Update Panel ─────────────────────── */}
      {selectedRoom && (
        <QuickUpdatePanel
          room={{
            id: selectedRoom.id,
            unitCode: selectedRoom.unitCode,
            status: (statusOverrides[selectedRoom.id] ??
              selectedRoom.status) as keyof typeof STATUS_CONFIG,
          }}
          onClose={() => setSelectedRoomId(null)}
          onSave={handleStatusUpdate}
          onReassign={
            selectedRoom.bookingId
              ? () => {
                  setReassignTarget({
                    bookingId: selectedRoom.bookingId!,
                    unitCode: selectedRoom.unitCode,
                    guestName: selectedRoom.guestName,
                    roomSlug: selectedRoom.roomSlug,
                    roomTypeName: selectedRoom.roomTypeName,
                    balanceDue: selectedRoom.balanceDue,
                  });
                  setSelectedRoomId(null);
                }
              : undefined
          }
        />
      )}

      <ReassignRoomModal
        target={reassignTarget}
        onClose={() => setReassignTarget(null)}
      />
    </div>
  );
}

function QuickUpdatePanel({
  room,
  onClose,
  onSave,
  onReassign,
}: {
  room: { id: string; unitCode: string; status: keyof typeof STATUS_CONFIG };
  onClose: () => void;
  onSave: (id: string, status: string) => void;
  onReassign?: () => void;
}) {
  const [pendingStatus, setPendingStatus] =
    useState<keyof typeof STATUS_CONFIG>(room.status);

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
                Quick Update: Room {room.unitCode}
              </h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                Currently:{" "}
                <span className="text-[#E8924A]">
                  {STATUS_CONFIG[room.status]?.text ?? room.status}
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
              value={pendingStatus}
              onValueChange={(v) =>
                setPendingStatus(v as keyof typeof STATUS_CONFIG)
              }
            >
              <SelectTrigger className="h-14 bg-gray-50 border-gray-100 rounded-xl px-5 manrope-bold text-sm text-[#0D2137]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-gray-100 shadow-2xl p-2 z-[110]">
                {(
                  [
                    "available",
                    "occupied",
                    "dirty",
                    "out_of_order",
                  ] as const
                ).map((key) => (
                  <SelectItem
                    key={key}
                    value={key}
                    className="manrope-bold py-3 rounded-xl focus:bg-gray-50"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "w-2 h-2 rounded-full",
                          STATUS_CONFIG[key].color,
                        )}
                      />
                      {STATUS_CONFIG[key].text}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {onReassign && (
            <Button
              variant="outline"
              onClick={onReassign}
              className="w-full h-12 border-[#0D2137]/15 rounded-xl manrope-bold text-[#0D2137] hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
            >
              <BedDouble className="w-4 h-4" />
              Reassign / Upgrade Room
            </Button>
          )}
          <div className="flex gap-4">
            <Button
              onClick={() => onSave(room.id, pendingStatus)}
              className="flex-1 h-14 bg-[#0D2137] hover:bg-[#0D2137]/90 text-white manrope-bold rounded-xl shadow-xl transition-all"
            >
              Save Changes
            </Button>
            <Button
              variant="outline"
              onClick={onClose}
              className="h-14 px-6 border-gray-100 rounded-xl manrope-bold text-[#0D2137] hover:bg-gray-50 transition-all"
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
