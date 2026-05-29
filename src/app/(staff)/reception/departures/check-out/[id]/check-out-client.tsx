"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FileText,
  Printer,
  Mail,
  AlertCircle,
  ChevronRight,
  Flag,
  Info,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Booking {
  id: string;
  booking_ref: string;
  guest_name: string;
  guest_email: string;
  room_slug: string;
  rooms: { unit_code: string } | null;
  check_in: string;
  check_out: string;
  nights: number;
  total_amount: number;
  room_price_per_night: number;
  resort_fee: number;
  tax_amount: number | null;
  payment_status: string;
  status: string;
}

export default function CheckOutClient({ booking }: { booking: Booking }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const roomCharge = booking.room_price_per_night * booking.nights;
  const tax = booking.tax_amount ?? Math.round(roomCharge * 0.085);
  const totalDue = booking.total_amount / 100; // amounts stored in minor units
  const roomLabel =
    booking.rooms?.unit_code ?? booking.room_slug.replace(/-/g, " ");

  const handleConfirmCheckout = async () => {
    setError(null);
    setConfirming(true);
    try {
      const res = await fetch(
        `/api/reception/departures/check-out/${booking.id}`,
        { method: "POST" },
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Check-out failed");
        return;
      }
      router.push("/reception/departures");
      router.refresh();
    } catch {
      setError("Network error — please try again.");
    } finally {
      setConfirming(false);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* ── Breadcrumbs & Status ─────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            <Link href="/reception" className="hover:text-[#00152A]">
              Front Desk
            </Link>
            <ChevronRight className="w-3 h-3" />
            <Link
              href="/reception/departures"
              className="hover:text-[#00152A]"
            >
              Departures
            </Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-[#BA722E]">
              Guest Check-Out &amp; Billing
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Badge className="bg-gray-100 text-gray-400 border-0 text-[8px] font-bold uppercase tracking-widest px-2 py-0.5">
              Room {roomLabel}
            </Badge>
            <Badge
              className={cn(
                "border-0 text-[8px] font-bold uppercase tracking-widest px-2 py-0.5",
                booking.status === "completed"
                  ? "bg-green-50 text-green-600"
                  : "bg-red-50 text-red-500",
              )}
            >
              {booking.status === "completed" ? "Checked Out" : "Departing Today"}
            </Badge>
          </div>
          <h1 className="manrope-bold text-5xl text-[#00152A] tracking-tight">
            {booking.guest_name}
          </h1>
          <p className="text-gray-500 text-sm font-medium">
            Folio #{booking.booking_ref} · Stay: {booking.check_in} —{" "}
            {booking.check_out} ({booking.nights} night
            {booking.nights !== 1 ? "s" : ""})
          </p>
        </div>

        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => window.print()}
            className="h-11 px-6 bg-gray-50 border-gray-100 text-[#00152A] font-bold flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            Print Invoice
          </Button>
          <Button
            variant="outline"
            onClick={() =>
              window.location.href = `mailto:${booking.guest_email}?subject=Folio ${booking.booking_ref}`
            }
            className="h-11 px-6 bg-gray-50 border-gray-100 text-[#00152A] font-bold flex items-center gap-2"
          >
            <Mail className="w-4 h-4" />
            Email Folio
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 rounded-lg p-4 text-red-600 text-sm font-medium">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10 items-start">
        <div className="xl:col-span-2 space-y-8">
          {/* ── Final Bill Summary ───────────────────── */}
          <div className="bg-white rounded-lg border-l-4 border-l-[#00152A] shadow-sm p-10 space-y-12">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-[#BA722E]" />
              <h2 className="manrope-bold text-2xl text-[#00152A]">
                Final Bill Summary
              </h2>
            </div>

            {/* Room Charges */}
            <div className="space-y-6">
              <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Room Charges
              </h3>
              <div className="flex items-start justify-between group">
                <div className="space-y-1">
                  <p className="text-sm font-bold text-[#00152A]">
                    {booking.room_slug.replace(/-/g, " ")} ({booking.nights} Night
                    {booking.nights !== 1 ? "s" : ""})
                  </p>
                  <p className="text-xs text-gray-500">
                    {booking.check_in} — {booking.check_out} @{" "}
                    ${(booking.room_price_per_night / 100).toFixed(2)}/night
                  </p>
                </div>
                <p className="manrope-bold text-lg text-[#00152A]">
                  ${(roomCharge / 100).toFixed(2)}
                </p>
              </div>
            </div>

            {/* Fees & Taxes */}
            <div className="space-y-6 pt-8 border-t border-gray-50">
              <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Fees &amp; Taxes
              </h3>
              <div className="space-y-4">
                <div className="flex items-start justify-between px-2">
                  <p className="text-sm font-bold text-[#00152A]">
                    Resort Fee
                  </p>
                  <p className="manrope-bold text-lg text-[#00152A]">
                    ${(booking.resort_fee / 100).toFixed(2)}
                  </p>
                </div>
                <div className="flex items-start justify-between px-2">
                  <p className="text-sm font-bold text-[#00152A]">Tax</p>
                  <p className="manrope-bold text-lg text-[#00152A]">
                    ${(tax / 100).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Settlement Sidebar ───────────────────── */}
        <div className="space-y-8 xl:sticky xl:top-10">
          <div className="bg-[#00152A] rounded-lg p-10 text-white space-y-10 shadow-2xl relative overflow-hidden">
            <div className="absolute right-[-20px] top-[-20px] opacity-10">
              <FileText className="w-40 h-40" />
            </div>

            <div className="space-y-1 relative">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Total Balance
              </p>
              <p className="text-[#BA722E] tracking-tight">
                <span className="text-5xl manrope-bold">
                  ${Math.floor(totalDue)}
                </span>
                <span className="text-xl font-bold">
                  .{String(Math.round((totalDue % 1) * 100)).padStart(2, "0")}
                </span>
                <span className="ml-2 text-[10px] font-bold uppercase tracking-widest text-gray-500">
                  USD
                </span>
              </p>
            </div>

            <div className="space-y-4 pt-6 border-t border-white/10 relative">
              <div className="flex justify-between items-center text-sm font-medium">
                <span className="text-gray-400">Payment Status</span>
                <span
                  className={cn(
                    "text-xs font-black uppercase",
                    booking.payment_status === "paid"
                      ? "text-green-400"
                      : "text-amber-400",
                  )}
                >
                  {booking.payment_status}
                </span>
              </div>
            </div>
          </div>

          {/* Confirm check-out */}
          {booking.status !== "completed" && (
            <div className="bg-white rounded-lg p-8 border border-gray-100 shadow-sm space-y-6">
              <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Confirm Check-Out
              </h3>
              <Button
                onClick={handleConfirmCheckout}
                disabled={confirming}
                className="w-full h-12 bg-[#BA722E] hover:bg-[#A36328] text-white font-bold rounded-md shadow flex items-center justify-center gap-2"
              >
                {confirming && (
                  <Loader2 className="w-4 h-4 animate-spin" />
                )}
                {confirming ? "Processing…" : "Confirm Check-Out"}
              </Button>
            </div>
          )}

          {/* Notes */}
          <div className="bg-[#F8F9FA] rounded-lg p-8 border border-gray-100 space-y-4">
            <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              <Info className="w-3.5 h-3.5" />
              Disputes Pending?
            </div>
            <p className="text-xs text-gray-500 leading-relaxed italic">
              If items are flagged, balance cannot be settled until resolved by
              management.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
