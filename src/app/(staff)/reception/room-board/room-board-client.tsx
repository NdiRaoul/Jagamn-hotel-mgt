"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  BedDouble,
  Key,
  RefreshCw,
  Wrench,
  Info,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatMoney } from "@/lib/currency";
import type { RoomBoardRoom } from "@/lib/data/reception";
import {
  ReassignRoomModal,
  type ReassignTarget,
} from "@/components/reception/reassign-room-modal";

const STATUS_CONFIG = {
  occupied: {
    border: "border-t-[#00152A]",
    icon: BedDouble,
    iconBg: "bg-[#00152A]/5 text-[#00152A]",
    badge: "bg-gray-50 text-gray-500",
    label: "Occupied",
  },
  reserved: {
    border: "border-t-[#E8924A]",
    icon: Key,
    iconBg: "bg-[#E8924A]/5 text-[#E8924A]",
    badge: "bg-orange-50 text-orange-600",
    label: "Reserved",
  },
  available: {
    border: "border-t-[#BA722E]",
    icon: Key,
    iconBg: "bg-[#BA722E]/5 text-[#BA722E]",
    badge: "bg-green-50 text-green-600",
    label: "Available",
  },
  dirty: {
    border: "border-t-orange-400",
    icon: RefreshCw,
    iconBg: "bg-orange-50 text-orange-400",
    badge: "bg-orange-50 text-orange-600",
    label: "Needs Cleaning",
  },
  out_of_order: {
    border: "border-t-red-500",
    icon: Wrench,
    iconBg: "bg-red-50 text-red-500",
    badge: "bg-red-50 text-red-600",
    label: "Out of Order",
  },
};

export default function RoomBoardClient({
  rooms,
  error,
}: {
  rooms: RoomBoardRoom[];
  error: string | null;
}) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [floorFilter, setFloorFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  // Reception-only: occupied rooms show the booking ID by default; toggle to
  // reveal guest names instead.
  const [showGuestNames, setShowGuestNames] = useState(false);
  const [cleaningRoomId, setCleaningRoomId] = useState<string | null>(null);
  const [reassignTarget, setReassignTarget] = useState<ReassignTarget | null>(
    null,
  );

  async function markClean(roomId: string) {
    setCleaningRoomId(roomId);
    try {
      await fetch(`/api/reception/rooms/${roomId}/housekeeping`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "clean" }),
      });
      router.refresh();
    } finally {
      setCleaningRoomId(null);
    }
  }

  const floors = useMemo(() => {
    const set = new Set(rooms.map((r) => r.floor).filter(Boolean));
    return ["all", ...Array.from(set).sort((a, b) => (a ?? 0) - (b ?? 0))];
  }, [rooms]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return rooms.filter((r) => {
      const matchesSearch =
        !q ||
        r.unitCode.toLowerCase().includes(q) ||
        (r.guestName?.toLowerCase().includes(q) ?? false) ||
        r.roomTypeName.toLowerCase().includes(q);
      const matchesFloor =
        floorFilter === "all" || String(r.floor) === floorFilter;
      const matchesStatus = statusFilter === "all" || r.status === statusFilter;
      return matchesSearch && matchesFloor && matchesStatus;
    });
  }, [rooms, search, floorFilter, statusFilter]);

  const counts = useMemo(
    () => ({
      occupied: rooms.filter((r) => r.status === "occupied").length,
      reserved: rooms.filter((r) => r.status === "reserved").length,
      available: rooms.filter((r) => r.status === "available").length,
      dirty: rooms.filter((r) => r.status === "dirty").length,
      out_of_order: rooms.filter((r) => r.status === "out_of_order").length,
    }),
    [rooms],
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h1 className="manrope-bold text-4xl text-[#00152A]">Room Board</h1>
          <p className="text-gray-500 text-sm">
            Real-time status of all {rooms.length} rooms
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search room, guest..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-11 pl-10 bg-white border-gray-200 w-48"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-11 px-3 bg-white border border-gray-200 rounded-md text-sm text-gray-600 focus:outline-none focus:ring-1 focus:ring-[#BA722E]"
          >
            <option value="all">All Status</option>
            <option value="occupied">Occupied</option>
            <option value="reserved">Reserved</option>
            <option value="available">Available</option>
            <option value="dirty">Needs Cleaning</option>
            <option value="out_of_order">Out of Order</option>
          </select>
          <Button
            variant="outline"
            onClick={() => setShowGuestNames((v) => !v)}
            className="h-11 px-4 border-gray-200 text-[10px] font-bold uppercase tracking-widest text-gray-600"
          >
            {showGuestNames ? "Show Booking IDs" : "Show Guest Names"}
          </Button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Floor tabs */}
      {floors.length > 2 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {floors.map((floor) => (
            <button
              key={String(floor)}
              onClick={() => setFloorFilter(String(floor))}
              className={cn(
                "px-5 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap",
                floorFilter === String(floor)
                  ? "bg-[#00152A] text-white shadow-lg"
                  : "bg-white text-gray-400 hover:text-[#00152A] border border-gray-100",
              )}
            >
              {floor === "all" ? "All Floors" : `Floor ${floor}`}
            </button>
          ))}
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-8 p-5 bg-white rounded-lg border border-gray-100 shadow-sm">
        {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
          <div key={key} className="flex items-center gap-2">
            <div
              className={cn(
                "w-3 h-3 rounded",
                key === "occupied"
                  ? "bg-[#00152A]"
                  : key === "reserved"
                    ? "bg-[#E8924A]"
                    : key === "available"
                      ? "bg-[#BA722E]"
                      : key === "dirty"
                        ? "bg-orange-400"
                        : "bg-red-500",
              )}
            />
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              {cfg.label} ({counts[key as keyof typeof counts]})
            </span>
          </div>
        ))}
      </div>

      {/* Room grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
        {filtered.map((room) => {
          const cfg = STATUS_CONFIG[room.status] ?? STATUS_CONFIG.available;
          const Icon = cfg.icon;
          return (
            <div
              key={room.id}
              className={cn(
                "group bg-white rounded-lg border-t-4 p-5 shadow-sm hover:shadow-md transition-all cursor-pointer relative overflow-hidden",
                cfg.border,
              )}
            >
              <div className="flex justify-between items-start mb-5">
                <div className="space-y-0.5">
                  <h3 className="manrope-bold text-2xl text-[#00152A]">
                    {room.unitCode}
                  </h3>
                  <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">
                    {room.roomTypeName}
                  </p>
                </div>
                <div
                  className={cn(
                    "w-8 h-8 rounded flex items-center justify-center",
                    cfg.iconBg,
                  )}
                >
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              <div className="pt-3 border-t border-gray-50">
                {room.status === "occupied" || room.status === "reserved" ? (
                  <div className="space-y-2">
                    {/* Default: booking ID. Toggle reveals the guest name. */}
                    <p className="text-sm font-bold text-[#00152A] line-clamp-1 font-mono">
                      {showGuestNames
                        ? room.guestName || room.bookingRef || cfg.label
                        : room.bookingRef || room.guestName || cfg.label}
                    </p>
                    {(showGuestNames ? room.bookingRef : room.guestName) && (
                      <p
                        className={cn(
                          "text-[15px] text-gray-400 line-clamp-1",
                          !showGuestNames && "font-mono",
                        )}
                      >
                        {showGuestNames ? room.bookingRef : room.guestName}
                      </p>
                    )}
                    {room.balanceDue > 0 ? (
                      <span className="inline-block text-[10px] font-bold uppercase tracking-widest text-[#E65100] bg-[#FFF3E0] px-2 py-0.5 rounded">
                        Balance {formatMoney(room.balanceDue)}
                      </span>
                    ) : room.refundDue > 0 ? (
                      <span className="inline-block text-[10px] font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                        Refund {formatMoney(room.refundDue)}
                      </span>
                    ) : null}
                    {room.bookingId && (
                      <Button
                        variant="outline"
                        onClick={() =>
                          setReassignTarget({
                            bookingId: room.bookingId!,
                            unitCode: room.unitCode,
                            guestName: room.guestName,
                            roomSlug: room.roomSlug,
                            roomTypeName: room.roomTypeName,
                            balanceDue: room.balanceDue,
                          })
                        }
                        className="h-8 w-full mt-1 border-[#00152A]/15 text-[#00152A] text-[9px] font-bold uppercase tracking-widest gap-1.5"
                      >
                        <BedDouble className="w-3 h-3" />
                        Reassign Room
                      </Button>
                    )}
                  </div>
                ) : room.status === "dirty" ? (
                  <Button
                    onClick={() => markClean(room.id)}
                    disabled={cleaningRoomId === room.id}
                    className="h-8 w-full bg-[#BA722E] hover:bg-[#A35F24] text-white text-[9px] font-bold uppercase tracking-widest gap-1.5"
                  >
                    <Sparkles className="w-3 h-3" />
                    {cleaningRoomId === room.id ? "Marking..." : "Mark Clean"}
                  </Button>
                ) : (
                  <Badge
                    className={cn(
                      "border-0 text-[8px] font-bold uppercase tracking-widest px-2 py-0.5",
                      cfg.badge,
                    )}
                  >
                    {cfg.label}
                  </Badge>
                )}
              </div>

              <button className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-all text-gray-300 hover:text-[#BA722E]">
                <Info className="w-4 h-4" />
              </button>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="col-span-full py-20 text-center text-gray-400 italic border border-dashed border-gray-200 rounded-lg">
            No rooms match your filters.
          </div>
        )}
      </div>

      <ReassignRoomModal
        target={reassignTarget}
        onClose={() => setReassignTarget(null)}
      />
    </div>
  );
}
