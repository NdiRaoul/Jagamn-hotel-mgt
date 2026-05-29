"use client";

import React, { useState, useMemo } from "react";
import {
  Filter,
  MoreVertical,
  Calendar,
  User,
  CreditCard,
  XCircle,
  FileText,
  AlertCircle,
  Inbox,
  ArrowRight,
  Star,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { ActiveReservation } from "@/lib/data/reception";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function ReservationsClient({
  reservations,
  error,
}: {
  reservations: ActiveReservation[];
  error: string | null;
}) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState(reservations[0]?.id ?? null);
  const [search, setSearch] = useState("");
  const [cancelling, setCancelling] = useState(false);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return reservations.filter(
      (r) =>
        !q ||
        r.guestName.toLowerCase().includes(q) ||
        r.bookingRef.toLowerCase().includes(q) ||
        r.roomTypeName.toLowerCase().includes(q),
    );
  }, [reservations, search]);

  const selected =
    reservations.find((r) => r.id === selectedId) ?? filtered[0] ?? null;

  const handleCancel = async () => {
    if (!selected) return;
    if (
      !confirm(
        `Cancel booking ${selected.bookingRef}? A 15% cancellation fee applies.`,
      )
    )
      return;
    setCancelling(true);
    try {
      const res = await fetch(`/api/bookings/${selected.id}/cancel`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Cancel failed");
      toast.success(`Booking ${selected.bookingRef} cancelled`);
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Cancel failed");
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 flex flex-col h-[calc(100vh-140px)]">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 flex-shrink-0">
        <div className="space-y-1">
          <h1 className="manrope-bold text-4xl text-[#00152A]">
            Active Reservations
          </h1>
          <p className="text-gray-500 text-sm">
            {reservations.length} guest{reservations.length !== 1 ? "s" : ""}{" "}
            currently active
          </p>
        </div>
        <div className="relative w-64">
          <Input
            placeholder="Search guest, ref..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-11 bg-white border-gray-200"
          />
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 mb-6 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm flex-shrink-0">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 text-gray-400">
          <Inbox className="w-12 h-12" />
          <p className="font-medium">
            {search
              ? "No reservations match your search"
              : "No active reservations"}
          </p>
        </div>
      ) : (
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-8 min-h-0">
          {/* List */}
          <div className="lg:col-span-1 overflow-y-auto pr-2 space-y-4 pb-10">
            {filtered.map((res) => (
              <div
                key={res.id}
                onClick={() => setSelectedId(res.id)}
                className={cn(
                  "bg-white rounded-lg p-6 cursor-pointer border-l-4 transition-all relative shadow-sm",
                  selectedId === res.id
                    ? "border-l-[#00152A]"
                    : "border-l-transparent hover:border-gray-200",
                )}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex gap-3 items-center">
                    <div className="w-10 h-10 rounded-lg bg-[#E6E8EA] flex items-center justify-center text-[#00152A] font-bold text-sm flex-shrink-0">
                      {res.guestName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-[#00152A] font-bold text-sm">
                        {res.guestName}
                      </h3>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                        {res.bookingRef}
                      </p>
                    </div>
                  </div>
                  <Badge
                    className={cn(
                      "text-[#00152A] border-0 text-[10px] font-bold uppercase tracking-widest px-2 py-1",
                      selectedId === res.id ? "bg-[#DAE3F2]" : "bg-[#E6E8EA]",
                    )}
                  >
                    {res.roomUnitCode ?? res.roomSlug}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-xs font-medium text-gray-500">
                  <span className="flex items-center gap-1">
                    <ArrowRight className="w-3 h-3" />
                    {res.checkIn}
                  </span>
                  <span className="flex items-center gap-1">
                    <ArrowRight className="w-3 h-3 rotate-180" />
                    {res.checkOut}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Detail */}
          {selected && (
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-10 overflow-y-auto">
              <div className="flex items-start justify-between mb-8">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <Badge className="bg-[#E6F0F9] text-[#004E8A] border-0 text-[10px] font-bold uppercase tracking-widest px-3 py-1">
                      {selected.status.replace("_", " ")}
                    </Badge>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      {selected.bookingRef}
                    </span>
                  </div>
                  <h2 className="manrope-bold text-4xl text-[#00152A]">
                    {selected.guestName}
                  </h2>
                  <p className="text-gray-500 font-medium">
                    {selected.roomTypeName} · {selected.nights} Night
                    {selected.nights !== 1 ? "s" : ""}
                  </p>
                </div>
                <button className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:text-[#00152A]">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>

              <div className="bg-gray-50 rounded-xl p-8 mb-10 grid grid-cols-2 gap-6">
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                    Check-in
                  </p>
                  <p className="font-bold text-[#00152A]">{selected.checkIn}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                    Check-out
                  </p>
                  <p className="font-bold text-[#00152A]">
                    {selected.checkOut}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                    Room
                  </p>
                  <p className="font-bold text-[#00152A]">
                    {selected.roomUnitCode ?? selected.roomSlug}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                    Guests
                  </p>
                  <p className="font-bold text-[#00152A]">{selected.guests}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-12">
                <div className="space-y-3">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    Contact
                  </p>
                  <p className="font-bold text-[#00152A]">
                    {selected.guestEmail}
                  </p>
                  {selected.guestPhone && (
                    <p className="text-sm text-gray-500">
                      {selected.guestPhone}
                    </p>
                  )}
                </div>
                <div className="space-y-3">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    Payment
                  </p>
                  <div className="flex items-center gap-2">
                    <div
                      className={cn(
                        "w-4 h-4 rounded-full flex items-center justify-center",
                        selected.paymentStatus === "paid"
                          ? "bg-green-500"
                          : "bg-orange-400",
                      )}
                    >
                      <span className="text-white text-[8px]">✓</span>
                    </div>
                    <p className="font-bold text-[#00152A] capitalize">
                      {selected.paymentStatus}
                    </p>
                  </div>
                  <p className="text-sm text-gray-500">
                    Total: ${(selected.totalAmount / 100).toFixed(2)}
                  </p>
                </div>
              </div>

              {selected.specialRequests && (
                <div className="mb-10 p-4 bg-amber-50 border border-amber-100 rounded-lg">
                  <p className="text-[10px] font-bold text-amber-700 uppercase tracking-widest mb-1">
                    Special Requests
                  </p>
                  <p className="text-sm text-amber-800">
                    {selected.specialRequests}
                  </p>
                </div>
              )}

              <div className="space-y-4">
                <h3 className="text-[10px] font-bold text-[#00152A] uppercase tracking-widest">
                  Actions
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <Button className="h-16 bg-[#00152A] hover:bg-[#0A2038] text-white font-medium rounded-lg flex flex-col items-center justify-center gap-1 shadow-md">
                    <Calendar className="w-4 h-4" />
                    <span className="text-xs">Modify Dates</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-16 bg-gray-50 border-gray-100 text-[#00152A] font-medium rounded-lg flex flex-col items-center justify-center gap-1"
                  >
                    <FileText className="w-4 h-4" />
                    <span className="text-xs">Add Note</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-16 bg-gray-50 border-gray-100 text-[#00152A] font-medium rounded-lg flex flex-col items-center justify-center gap-1"
                  >
                    <CreditCard className="w-4 h-4" />
                    <span className="text-xs">Payment History</span>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                    disabled={cancelling}
                    className="h-16 bg-white border-red-100 text-red-500 font-medium rounded-lg flex flex-col items-center justify-center gap-1 hover:bg-red-50 hover:border-red-200"
                  >
                    <XCircle className="w-4 h-4" />
                    <span className="text-xs">
                      {cancelling ? "Cancelling..." : "Cancel & Refund"}
                    </span>
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
