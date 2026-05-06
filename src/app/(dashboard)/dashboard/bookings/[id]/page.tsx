"use client";

import { useState } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import {
  ChevronLeft,
  Copy,
  Calendar,
  Info,
  X,
  AlertCircle,
  RefreshCcw,
  Ban,
  CheckCircle,
  CheckCircle2,
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

// Dummy data mapping for demo purposes
const BOOKING_DATA: Record<string, any> = {
  "JP-8842109": {
    title: "Regency Panoramic Suite",
    image: "/images/Royal Palace Suite.png",
    ref: "JP-8842109",
    total: "$1,240.00",
  },
  "JP-9921003": {
    title: "Royal Garden View King",
    image: "/images/palace-deluxe.png",
    ref: "JP-9921003",
    total: "$1,800.00",
  },
  "JP-1120054": {
    title: "Palace Penthouse Suite",
    image: "/images/royal-grand-suite.png",
    ref: "JP-1120054",
    total: "$4,250.00",
  },
  "JP-8829-QX": {
    title: "Maharaja Signature Suite",
    image: "/images/maharaja-suite.png",
    ref: "JP-8829-QX",
    total: "$2,045.00",
  },
};

export default function BookingDetailsPage() {
  const params = useParams();
  const id = params.id as string;
  const booking = BOOKING_DATA[id] || BOOKING_DATA["JP-8829-QX"];

  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

  return (
    <div className="space-y-8 max-w-6xl pb-20">
      {/* ── Page Header ───────────────────────────── */}
      <div className="flex items-center justify-between">
        <h1 className="manrope-bold text-2xl text-jagamn-primary">
          Upcoming Stay Details
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ── Left Column: Main Details ─────────────── */}
        <div className="lg:col-span-2 space-y-8">
          {/* Hero Card */}
          <div className="relative h-[450px] rounded-md overflow-hidden shadow-sm group">
            <Image
              src={booking.image}
              alt={booking.title}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-10 left-10 right-10 space-y-4">
              <Badge className="bg-white/20 backdrop-blur-md text-white border-0 text-[10px] font-bold uppercase tracking-widest px-3 py-1">
                Confirmed
              </Badge>
              <h2 className="manrope-bold text-4xl text-white">
                {booking.title}
              </h2>
            </div>
          </div>

          {/* Times Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-md border-l-4 border-l-jagamn-primary p-8 shadow-sm border-r border-t border-b border-gray-100">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">
                Check-in
              </p>
              <h3 className="manrope-bold text-3xl text-jagamn-primary mb-1">
                Oct 12, 2024
              </h3>
              <p className="text-xs text-gray-400 font-medium">3:00 PM</p>
            </div>
            <div className="bg-white rounded-md border-l-4 border-l-jagamn-secondary/25 p-8 shadow-sm border border-gray-100">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">
                Check-out
              </p>
              <h3 className="manrope-bold text-3xl text-jagamn-primary mb-1">
                Oct 16, 2024
              </h3>
              <p className="text-xs text-gray-400 font-medium">11:00 AM</p>
            </div>
          </div>

          {/* Reference Card */}
          <div className="bg-white rounded-md p-8 shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                Reservation Reference
              </p>
              <h3 className="manrope-bold text-xl text-jagamn-primary">
                {booking.ref}
              </h3>
            </div>
            <button className="w-10 h-10 rounded-full hover:bg-gray-50 flex items-center justify-center text-jagamn-primary transition-colors">
              <Copy className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ── Right Column: Summary & Policy ─────────── */}
        <div className="space-y-8">
          {/* Stay Summary */}
          <div className="bg-white rounded-md p-10 shadow-sm border border-gray-100 space-y-10">
            <h3 className="manrope-bold text-xl text-jagamn-primary">
              Stay Summary
            </h3>

            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">4 Nights x $450</span>
                <span className="font-bold text-jagamn-primary">$1,800.00</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Taxes & Fees</span>
                <span className="font-bold text-jagamn-primary">$245.00</span>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-50 flex justify-between items-end">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Total
              </span>
              <span className="manrope-bold text-3xl text-jagamn-primary">
                {booking.total}
              </span>
            </div>

            <div className="bg-jagamn-neutral rounded-md p-4 flex items-center gap-3">
              <CheckCircle2 className="w-4 h-4 text-jagamn-secondary" />
              <span className="text-[10px] font-bold text-jagamn-secondary uppercase tracking-widest">
                Payment Completed
              </span>
            </div>
          </div>

          {/* Cancellation Policy */}
          <div className="bg-white rounded-md p-10 shadow-sm border border-gray-100 border-l-4 border-l-red-100 relative overflow-hidden">
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

            <div className="pt-10 space-y-4">
              <Button
                variant="secondary"
                className="w-full bg-gray-100 hover:bg-gray-200 text-jagamn-primary h-14 rounded-md flex items-center justify-center gap-2 border-0 font-bold"
              >
                <RefreshCcw className="w-4 h-4" />
                Modify Dates
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsCancelModalOpen(true)}
                className="w-full h-14 border-red-100 text-red-500 hover:bg-red-50 hover:text-red-600 font-bold rounded-md flex items-center justify-center gap-2"
              >
                <Ban className="w-4 h-4" />
                Cancel Reservation
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Cancellation Modal ─────────────────────── */}
      <Dialog open={isCancelModalOpen} onOpenChange={setIsCancelModalOpen}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden border-0 rounded-xl shadow-2xl">
          <div className="bg-jagamn-primary p-6 text-white">
            <DialogHeader>
              <DialogTitle className="manrope-bold text-2xl text-white">
                Cancel Reservation
              </DialogTitle>
              <DialogDescription className="text-gray-400 text-xs mt-1">
                Reference: {booking.ref} • {booking.title}
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="p-8 space-y-8 bg-white">
            <div className="bg-[#FFF5F5] border-l-4 border-red-500 p-5 flex gap-4">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <div className="space-y-1">
                <h4 className="manrope-bold text-xs text-red-600">
                  Cancellation Policy: Tier C
                </h4>
                <p className="text-[11px] text-gray-500 leading-relaxed">
                  Cancellations within 7 days of check-in are subject to a 25%
                  administrative fee. Remaining funds will be returned to your
                  original payment method.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">
                  Original Reservation Total
                </span>
                <span className="text-xs font-bold text-jagamn-primary">
                  {booking.total}
                </span>
              </div>
              <div className="flex justify-between items-center text-red-500">
                <span className="text-xs">Cancellation Fee (25%)</span>
                <span className="text-xs font-bold">-$250.00</span>
              </div>
              <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                <span className="manrope-bold text-lg text-jagamn-primary">
                  Estimated Refund
                </span>
                <span className="manrope-bold text-lg text-jagamn-primary">
                  $3,187.50
                </span>
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
              <Button className="flex-1 h-12 bg-red-600 hover:bg-red-700 text-white font-bold border-0">
                Confirm Cancellation
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
