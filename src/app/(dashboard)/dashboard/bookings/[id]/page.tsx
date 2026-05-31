"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ChevronLeft,
  Copy,
  Info,
  RefreshCcw,
  Ban,
  CheckCircle2,
  AlertCircle,
  Download,
  Printer,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import { format } from "date-fns";
import type { Booking } from "@/types/database";

export default function BookingDetailsPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("bookings")
        .select("*, room_types(*)")
        .eq("id", id)
        .single();
      setBooking(data as Booking | null);
      setLoading(false);
    }
    load();
  }, [id]);

  function copyRef() {
    if (booking?.booking_ref) {
      navigator.clipboard.writeText(booking.booking_ref);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  async function handleConfirmCancel() {
    if (!booking) return;
    setIsCancelling(true);
    const res = await fetch(`/api/bookings/${booking.id}/cancel`, {
      method: "POST",
    });
    const data = await res.json();
    setIsCancelling(false);
    setIsCancelModalOpen(false);
    if (data.success) {
      alert("Booking cancelled. A confirmation email has been sent.");
      router.refresh();
      // Reload booking
      const { data: updated } = await supabase
        .from("bookings")
        .select("*, room_types(*)")
        .eq("id", id)
        .single();
      setBooking(updated as Booking | null);
    } else {
      alert(data.error || "Failed to cancel booking.");
    }
  }

  if (loading) {
    return (
      <div className="space-y-8 max-w-6xl animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-48" />
        <div className="h-[450px] bg-gray-200 rounded-md" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="text-center py-20">
        <h2 className="manrope-bold text-2xl text-jagamn-primary mb-4">
          Booking not found
        </h2>
        <Link href="/dashboard/bookings">
          <Button>Back to Bookings</Button>
        </Link>
      </div>
    );
  }

  const rt = booking.room_types as any;
  const roomName = rt?.name || booking.room_slug;
  const roomImage = rt?.main_image || "/images/palace-deluxe.png";
  const nights = booking.nights;
  const roomTotal = booking.room_price_per_night * nights;
  const taxAmount = booking.tax_amount ?? Math.round(roomTotal * 0.1);

  return (
    <div className="space-y-8 max-w-6xl pb-20">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/bookings">
          <button className="flex items-center gap-1.5 text-sm text-jagamn-secondary hover:text-jagamn-primary transition-colors">
            <ChevronLeft className="w-4 h-4" />
            Back to Bookings
          </button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-8">
          {/* Hero Card */}
          <div className="relative h-[400px] rounded-md overflow-hidden shadow-sm group">
            <Image
              src={roomImage}
              alt={roomName}
              fill
              sizes="(max-width: 1024px) 100vw, 66vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-10 left-10 right-10 space-y-4">
              <Badge className="bg-white/20 backdrop-blur-md text-white border-0 text-[10px] font-bold uppercase tracking-widest px-3 py-1">
                {booking.status}
              </Badge>
              <h2 className="manrope-bold text-4xl text-white">{roomName}</h2>
            </div>
          </div>

          {/* Times Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-md border-l-4 border-l-jagamn-primary p-8 shadow-sm border-r border-t border-b border-gray-100">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">
                Check-in
              </p>
              <h3 className="manrope-bold text-3xl text-jagamn-primary mb-1">
                {format(new Date(booking.check_in), "MMM d, yyyy")}
              </h3>
              <p className="text-xs text-gray-400 font-medium">From 3:00 PM</p>
            </div>
            <div className="bg-white rounded-md border-l-4 border-l-jagamn-secondary/25 p-8 shadow-sm border border-gray-100">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">
                Check-out
              </p>
              <h3 className="manrope-bold text-3xl text-jagamn-primary mb-1">
                {format(new Date(booking.check_out), "MMM d, yyyy")}
              </h3>
              <p className="text-xs text-gray-400 font-medium">By 12:00 PM</p>
            </div>
          </div>

          {/* Reference Card */}
          <div className="bg-white rounded-md p-8 shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                Reservation Reference
              </p>
              <h3 className="manrope-bold text-xl text-jagamn-primary font-mono">
                {booking.booking_ref}
              </h3>
            </div>
            <button
              onClick={copyRef}
              className="w-10 h-10 rounded-full hover:bg-gray-50 flex items-center justify-center text-jagamn-primary transition-colors"
              title="Copy reference"
            >
              {copied ? (
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              ) : (
                <Copy className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* Download Receipt */}
          <div className="flex gap-4">
            <Button
              variant="outline"
              className="flex items-center gap-2 border-jagamn-primary text-jagamn-primary"
              onClick={() => window.print()}
            >
              <Printer className="w-4 h-4" />
              Print Receipt
            </Button>
            <Button
              variant="outline"
              className="flex items-center gap-2 border-gray-200 text-gray-600"
              onClick={() => window.print()}
            >
              <Download className="w-4 h-4" />
              Download PDF
            </Button>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-8">
          {/* Stay Summary */}
          <div className="bg-white rounded-md p-10 shadow-sm border border-gray-100 space-y-10">
            <h3 className="manrope-bold text-xl text-jagamn-primary">
              Stay Summary
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">
                  {nights} Night{nights !== 1 ? "s" : ""} × $
                  {booking.room_price_per_night}
                </span>
                <span className="font-bold text-jagamn-primary">
                  ${roomTotal.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Taxes (10%)</span>
                <span className="font-bold text-jagamn-primary">
                  ${taxAmount}
                </span>
              </div>
            </div>
            <div className="pt-6 border-t border-gray-50 flex justify-between items-end">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Total
              </span>
              <span className="manrope-bold text-3xl text-jagamn-primary">
                ${booking.total_amount.toLocaleString()}
              </span>
            </div>
            <div className="bg-jagamn-neutral rounded-md p-4 flex items-center gap-3">
              <CheckCircle2 className="w-4 h-4 text-jagamn-secondary" />
              <span className="text-[10px] font-bold text-jagamn-secondary uppercase tracking-widest">
                {booking.payment_status === "paid"
                  ? "Payment Completed"
                  : booking.payment_status}
              </span>
            </div>
          </div>

          {/* Cancellation Policy */}
          <div className="bg-white rounded-md p-10 shadow-sm border border-gray-100 border-l-4 border-l-red-100">
            <div className="flex items-center gap-2 mb-8">
              <Info className="w-5 h-5 text-gray-400" />
              <h3 className="manrope-bold text-xl text-jagamn-primary">
                Cancellation Policy
              </h3>
            </div>
            <div className="space-y-6">
              {[
                {
                  label: "> 48 Hours Prior",
                  value: "Full Refund",
                  color: "bg-jagamn-primary",
                },
                {
                  label: "24 - 48 Hours Prior",
                  value: "50% Refund",
                  color: "bg-jagamn-tertiary",
                },
                {
                  label: "< 24 Hours Prior",
                  value: "No Refund",
                  color: "bg-red-200",
                },
              ].map((policy, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between text-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className={cn("w-1 h-5 rounded-full", policy.color)} />
                    <span className="text-gray-500">{policy.label}</span>
                  </div>
                  <span
                    className={cn(
                      "font-bold",
                      idx === 2 ? "text-red-500" : "text-[#412000]",
                    )}
                  >
                    {policy.value}
                  </span>
                </div>
              ))}
            </div>

            {booking.status !== "cancelled" && (
              <div className="pt-10 space-y-4">
                <Button
                  variant="outline"
                  onClick={() => setIsCancelModalOpen(true)}
                  className="w-full h-14 border-red-100 text-red-500 hover:bg-red-50 hover:text-red-600 font-bold rounded-md flex items-center justify-center gap-2"
                >
                  <Ban className="w-4 h-4" />
                  Cancel Reservation
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Cancellation Modal */}
      <Dialog open={isCancelModalOpen} onOpenChange={setIsCancelModalOpen}>
        <DialogContent className="max-w-lg p-0 overflow-hidden border-0 rounded-xl shadow-2xl">
          <div className="bg-jagamn-primary p-6 text-white">
            <DialogHeader>
              <DialogTitle className="manrope-bold text-2xl text-white">
                Cancel Reservation
              </DialogTitle>
              <DialogDescription className="text-gray-400 text-xs mt-1">
                Reference: {booking.booking_ref} • {roomName}
              </DialogDescription>
            </DialogHeader>
          </div>
          <div className="p-8 space-y-8 bg-white">
            <div className="bg-[#FFF5F5] border-l-4 border-red-500 p-5 flex gap-4">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <div className="space-y-1">
                <h4 className="manrope-bold text-xs text-red-600">
                  Cancellation Policy
                </h4>
                <p className="text-[11px] text-gray-500 leading-relaxed">
                  {rt?.cancellation_policy ||
                    "Cancellations may be subject to fees depending on timing."}
                </p>
              </div>
            </div>
            <div className="flex gap-4 pt-2">
              <Button
                variant="outline"
                onClick={() => setIsCancelModalOpen(false)}
                className="flex-1 h-12 border-gray-100 text-jagamn-primary font-bold hover:bg-gray-50"
              >
                Keep Booking
              </Button>
              <Button
                className="flex-1 h-12 bg-red-600 hover:bg-red-700 text-white font-bold border-0"
                onClick={handleConfirmCancel}
                disabled={isCancelling}
              >
                {isCancelling ? "Cancelling..." : "Confirm Cancellation"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
