"use client";

import Image from "next/image";
import {
  Calendar,
  Key,
  UtensilsCrossed,
  Download,
  Plus,
  X,
  ChevronRight,
  BedDouble,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import Link from "next/link";

const SUMMARY_STATS = [
  {
    label: "Current Stay",
    value: "Room 402",
    subtext: "Checkout: Oct 24, 2023",
    primary: true,
  },
  {
    label: "Upcoming",
    value: "02",
    subtext: "Next: Nov 12, 2023",
    border: true,
  },
  {
    label: "Past History",
    value: "14",
    subtext: "Lifetime Guest Member",
    border: true,
  },
];

const UPCOMING_BOOKINGS = [
  {
    title: "Royal Garden View King",
    status: "Confirmed",
    statusColor: "bg-[#FFF3E0] text-[#E65100]",
    date: "Nov 12 — Nov 15, 2023",
    ref: "JP-9921003",
    image: "/images/palace-deluxe.png",
    details: [
      { icon: BedDouble, text: "1 King Bed" },
      { icon: Users, text: "1 Guest" },
    ],
    border: "border-l-jagamn-tertiary",
  },
  {
    title: "Palace Penthouse Suite",
    status: "Waitlisted",
    statusColor: "bg-[#E8EAF6] text-[#3F51B5]",
    date: "Dec 22 — Dec 28, 2023",
    ref: "JP-1120054",
    image: "/images/royal-grand-suite.png",
    details: [
      { icon: BedDouble, text: "2 Bedrooms" },
      { icon: Users, text: "4 Guests" },
    ],
    border: "border-l-jagamn-primary",
  },
];

const PAST_BOOKINGS = [
  {
    date: "Aug 04, 2023",
    room: "Superior Queen Room",
    ref: "JP-554122",
    status: "Completed",
  },
  {
    date: "May 12, 2023",
    room: "Regency Suite",
    ref: "JP-321189",
    status: "Completed",
  },
  {
    date: "Jan 15, 2023",
    room: "Executive Studio",
    ref: "JP-109923",
    status: "Completed",
  },
];

export default function MyBookingsPage() {
  return (
    <div className="space-y-12 max-w-6xl relative pb-20">
      {/* ── Summary Stats ─────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {SUMMARY_STATS.map((stat, idx) => (
          <div
            key={idx}
            className={cn(
              "rounded-md p-8 shadow-sm border border-gray-100 relative overflow-hidden",
              stat.primary
                ? "bg-jagamn-primary text-white shadow-lg shadow-jagamn-primary/20"
                : "bg-white",
              stat.border && "border-l-4 border-l-jagamn-primary",
            )}
          >
            <p
              className={cn(
                "text-[10px] font-bold uppercase tracking-widest mb-2",
                stat.primary ? "text-gray-500" : "text-gray-400",
              )}
            >
              {stat.label}
            </p>
            <h2
              className={cn(
                "manrope-bold text-4xl mb-1",
                stat.primary ? "text-white" : "text-jagamn-primary",
              )}
            >
              {stat.value}
            </h2>
            <p
              className={cn(
                "text-xs font-medium",
                stat.primary ? "text-gray-500" : "text-gray-400",
              )}
            >
              {stat.subtext}
            </p>
            {stat.primary && (
              <div className="absolute right-[-20px] bottom-[-20px] opacity-10">
                <div className="w-32 h-32 border-[15px] border-white rounded-full" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ── Active Reservation ────────────────────── */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="manrope-bold text-xl text-jagamn-primary">
            Active Reservation
          </h2>
          <Badge className="bg-[#E8F5E9] text-[#2E7D32] border-0 text-[9px] font-bold uppercase tracking-wider px-3 py-1 flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-[#2E7D32]" />
            Checked-In
          </Badge>
        </div>

        <div className="bg-white rounded-md border-l-4 border-l-jagamn-primary shadow-sm overflow-hidden flex flex-col lg:flex-row gap-5 border-r border-t border-b border-gray-100 p-8">
          <div className="lg:w-1/4 relative h-[250px] lg:h-[250px] rounded overflow-hidden shrink-0">
            <Image
              src="/images/Royal Palace Suite.png"
              alt="Regency Panoramic Suite"
              fill
              className="object-cover"
            />
          </div>
          <div className="flex-1 space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
              <div className="space-y-1">
                <h3 className="manrope-bold text-2xl text-jagamn-primary">
                  Regency Panoramic Suite
                </h3>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                  Ref: JP-8842109
                </p>
              </div>
              <div className="text-right">
                <p className="manrope-bold text-xl text-jagamn-tertiary">
                  $1,240.00
                </p>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                  Paid in Full
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-6 border-t border-[#ECEEF0]">
              {[
                { label: "Check-in", value: "Oct 20, 2023" },
                { label: "Check-out", value: "Oct 24, 2023" },
                { label: "Room No.", value: "402" },
                { label: "Guests", value: "2 Adults" },
              ].map((info, idx) => (
                <div key={idx} className="space-y-1">
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                    {info.label}
                  </p>
                  <p className="text-sm font-bold text-jagamn-primary">
                    {info.value}
                  </p>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-4 pt-4">
              <Button className="bg-jagamn-primary hover:bg-jagamn-primary/90 text-white h-12 px-6 rounded-md flex items-center gap-2">
                <Key className="w-4 h-4" />
                Digital Key
              </Button>
              <Link href="/dashboard/dining">
                <Button
                  variant="secondary"
                  className="bg-jagamn-neutral hover:bg-gray-200 text-jagamn-primary h-12 px-6 rounded-md flex items-center gap-2 border-0"
                >
                  <UtensilsCrossed className="w-4 h-4" />
                  In-Room Dining
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── Upcoming Stays ────────────────────────── */}
      <div className="space-y-6">
        <h2 className="manrope-bold text-xl text-jagamn-primary">
          Upcoming Stays
        </h2>

        <div className="space-y-4">
          {UPCOMING_BOOKINGS.map((booking, idx) => (
            <div
              key={idx}
              className={cn(
                "bg-white rounded-md border-l-4 shadow-sm p-6 flex flex-col md:flex-row items-center justify-between gap-6 border-r border-t border-b border-gray-100",
                booking.border,
              )}
            >
              <div className="flex items-center gap-6 w-full md:w-auto">
                <div className="w-24 h-16 relative rounded overflow-hidden shrink-0">
                  <Image
                    src={booking.image}
                    alt={booking.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-bold text-jagamn-primary">
                      {booking.title}
                    </h4>
                    <Badge
                      className={cn(
                        "border-0 text-[8px] font-bold uppercase tracking-wider h-5",
                        booking.statusColor,
                      )}
                    >
                      {booking.status}
                    </Badge>
                  </div>
                  <p className="text-[10px] text-gray-400 font-medium">
                    {booking.date} • Ref: {booking.ref}
                  </p>
                  <div className="flex items-center gap-4 mt-2">
                    {booking.details.map((detail, dIdx) => (
                      <div
                        key={dIdx}
                        className="flex items-center gap-1.5 text-[9px] font-bold text-gray-400 uppercase"
                      >
                        <detail.icon className="w-3 h-3" /> {detail.text}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                <div className="flex gap-2">
                  <button className="w-9 h-9 rounded-full hover:bg-gray-50 flex items-center justify-center text-gray-400">
                    <X className="w-4 h-4" />
                  </button>
                  <button className="w-9 h-9 rounded-full hover:bg-gray-50 flex items-center justify-center text-gray-400">
                    <Calendar className="w-4 h-4" />
                  </button>
                </div>
                <Link href={`/dashboard/bookings/${booking.ref}`}>
                  <Button
                    variant="ghost"
                    className="text-[10px] font-bold text-jagamn-tertiary uppercase tracking-widest gap-1 p-0 hover:bg-transparent"
                  >
                    View Details <ChevronRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Past Experiences ──────────────────────── */}
      <div className="space-y-6">
        <h2 className="manrope-bold text-xl text-jagamn-primary">
          Past Experiences
        </h2>

        <div className="bg-white rounded-md shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-jagamn-neutral border-b border-gray-100">
                <th className="px-8 py-4 text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                  Date
                </th>
                <th className="px-8 py-4 text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                  Room Type
                </th>
                <th className="px-8 py-4 text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                  Reference
                </th>
                <th className="px-8 py-4 text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                  Status
                </th>
                <th className="px-8 py-4 text-[9px] font-bold text-gray-400 uppercase tracking-widest text-right">
                  Invoice
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {PAST_BOOKINGS.map((booking, i) => (
                <tr key={i} className="hover:bg-gray-50 transition-colors">
                  <td className="px-8 py-5 text-sm font-bold text-jagamn-primary">
                    {booking.date}
                  </td>
                  <td className="px-8 py-5 text-sm text-gray-500">
                    {booking.room}
                  </td>
                  <td className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    {booking.ref}
                  </td>
                  <td className="px-8 py-5">
                    <Badge className="bg-gray-100 text-gray-500 border-0 text-[8px] font-bold uppercase tracking-wider px-2 py-0.5">
                      {booking.status}
                    </Badge>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button className="text-gray-400 hover:text-jagamn-primary transition-colors">
                      <Download className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Floating Action Button ────────────────── */}
      <button className="fixed bottom-10 right-10 w-16 h-16 bg-jagamn-tertiary text-white rounded-xl shadow-2xl shadow-jagamn-tertiary/40 flex items-center justify-center hover:bg-jagamn-tertiary/90 hover:scale-110 transition-all z-50">
        <Plus className="w-8 h-8" />
      </button>
    </div>
  );
}
