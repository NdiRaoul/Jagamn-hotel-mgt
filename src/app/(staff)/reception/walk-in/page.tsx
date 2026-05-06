"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  User,
  Mail,
  Phone,
  Globe,
  Calendar,
  Users,
  CreditCard,
  Banknote,
  Check,
  ArrowRight,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import Link from "next/link";

const ROOM_TYPES = [
  {
    id: "deluxe",
    title: "Deluxe King",
    desc: "High Floor, City View",
    price: 280,
    available: 5,
  },
  {
    id: "executive",
    title: "Executive Suite",
    desc: "Lounge Access, Balcony",
    price: 450,
    available: 2,
  },
];

export default function WalkInBookingPage() {
  const [selectedRoom, setSelectedRoom] = useState("deluxe");
  const [paymentMethod, setPaymentMethod] = useState("card");

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-2">
        <h1 className="manrope-bold text-4xl text-[#00152A]">
          Walk-In Booking
        </h1>
        <p className="text-gray-500 text-sm">
          Create a new reservation for an arriving guest.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
        <div className="xl:col-span-2 space-y-8">
          {/* ── 1. Guest Details ────────────────────────── */}
          <div className="bg-white rounded-lg border-l-4 border-l-[#00152A] shadow-sm p-10 space-y-10 relative">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-[#00152A] text-white flex items-center justify-center font-bold">
                1
              </div>
              <h2 className="manrope-bold text-2xl text-[#00152A]">
                Guest Details
              </h2>
            </div>

            <div className="absolute right-10 top-10 opacity-5">
              <User className="w-24 h-24" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  Full Name
                </Label>
                <Input
                  placeholder="Enter guest name"
                  className="h-12 bg-[#E6E8EA] border-[#6B7280] rounded-md focus-visible:ring-1 focus-visible:ring-[#BA722E] text-[#00152A] font-medium"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  Email Address
                </Label>
                <Input
                  placeholder="guest@example.com"
                  className="h-12 bg-[#E6E8EA] border-[#6B7280] rounded-md focus-visible:ring-1 focus-visible:ring-[#BA722E] text-[#00152A] font-medium"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  Phone Number
                </Label>
                <Input
                  placeholder="+1 (555) 000-0000"
                  className="h-12 bg-[#E6E8EA] border-[#6B7280] rounded-md focus-visible:ring-1 focus-visible:ring-[#BA722E] text-[#00152A] font-medium"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    Country
                  </Label>
                  <Select defaultValue="US">
                    <SelectTrigger className="h-12 bg-[#E6E8EA] border-[#6B7280] rounded-md focus:ring-1 focus:ring-[#BA722E] text-[#00152A] font-medium px-4">
                      <SelectValue placeholder="Select Country" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="US">United States</SelectItem>
                      <SelectItem value="UK">United Kingdom</SelectItem>
                      <SelectItem value="FR">France</SelectItem>
                      <SelectItem value="NG">Nigeria</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    ID Number
                  </Label>
                  <Input
                    placeholder="Passport / DL"
                    className="h-12 bg-[#E6E8EA] border-[#6B7280] rounded-md focus-visible:ring-1 focus-visible:ring-[#BA722E] text-[#00152A] font-medium placeholder:text-gray-400"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ── 2. Stay Details ─────────────────────────── */}
          <div className="bg-white rounded-lg border-l-4 border-l-[#00152A] shadow-sm p-10 space-y-10">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-[#00152A] text-white flex items-center justify-center font-bold">
                2
              </div>
              <h2 className="manrope-bold text-2xl text-[#00152A]">
                Stay Details
              </h2>
            </div>

            <div className="bg-gray-50/50 p-8 rounded-lg space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    Check-In
                  </Label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#00152A] z-10" />
                    <Input
                      type="date"
                      defaultValue="2023-10-24"
                      className="h-12 bg-[#E6E8EA] border-[#6B7280] rounded-md focus-visible:ring-1 focus-visible:ring-[#BA722E] text-[#00152A] font-medium pl-12"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    Check-Out
                  </Label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#00152A] z-10" />
                    <Input
                      type="date"
                      defaultValue="2023-10-27"
                      className="h-12 bg-[#E6E8EA] border-[#6B7280] rounded-md focus-visible:ring-1 focus-visible:ring-[#BA722E] text-[#00152A] font-medium pl-12"
                    />
                  </div>
                </div>
              </div>

              {/* Guests Field */}
              <div className="space-y-2">
                <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  Guests
                </Label>
                <Select defaultValue="2">
                  <SelectTrigger className="w-full h-12 bg-[#E6E8EA] border-[#6B7280] rounded-md focus:ring-1 focus:ring-[#BA722E] text-[#00152A] font-medium px-4">
                    <SelectValue placeholder="Number of Guests" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 Adult</SelectItem>
                    <SelectItem value="2">2 Adults</SelectItem>
                    <SelectItem value="3">3 Adults</SelectItem>
                    <SelectItem value="4">4 Adults</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Available Room Types
              </Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {ROOM_TYPES.map((room) => (
                  <div
                    key={room.id}
                    onClick={() => setSelectedRoom(room.id)}
                    className={cn(
                      "p-6 rounded-md border-2 transition-all cursor-pointer relative",
                      selectedRoom === room.id
                        ? "border-[#00152A] bg-[#00152A]/5"
                        : "border-gray-100 bg-white hover:border-gray-300",
                    )}
                  >
                    {selectedRoom === room.id && (
                      <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-[#00152A] text-white flex items-center justify-center">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                    )}
                    <h4 className="manrope-bold text-lg text-[#00152A]">
                      {room.title}
                    </h4>
                    <p className="text-xs text-gray-500 mb-6">{room.desc}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-[#BA722E] bg-[#BA722E]/10 px-2 py-1 rounded uppercase tracking-widest">
                        {room.available} Available
                      </span>
                      <p className="text-[#00152A]">
                        <span className="manrope-bold text-xl">
                          ${room.price}
                        </span>
                        <span className="text-xs text-gray-400"> /night</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── 3. Payment Sidebar ──────────────────────── */}
        <div className="bg-white rounded-lg border-l-4 border-l-[#00152A] shadow-sm p-10 space-y-10 xl:sticky xl:top-10">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-[#00152A] text-white flex items-center justify-center font-bold">
              3
            </div>
            <h2 className="manrope-bold text-2xl text-[#00152A]">Payment</h2>
          </div>

          <div className="space-y-6">
            <div className="flex justify-between items-center py-2">
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-600">
                  Deluxe King (3 nights)
                </p>
              </div>
              <p className="manrope-bold text-lg text-[#00152A]">$840.00</p>
            </div>
            <div className="flex justify-between items-center py-2 border-t border-gray-50">
              <p className="text-sm font-medium text-gray-600">
                City Tax (10%)
              </p>
              <p className="manrope-bold text-lg text-[#00152A]">$84.00</p>
            </div>
            <div className="flex justify-between items-center py-2 border-t border-gray-50 pb-6">
              <p className="text-sm font-medium text-gray-600">Resort Fee</p>
              <p className="manrope-bold text-lg text-[#00152A]">$45.00</p>
            </div>

            <div className="pt-6 border-t border-gray-200 flex justify-between items-end">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                Total Due
              </p>
              <p className="manrope-bold text-4xl text-[#00152A]">$969.00</p>
            </div>
          </div>

          <div className="space-y-4 pt-4">
            <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Payment Method
            </Label>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setPaymentMethod("card")}
                className={cn(
                  "h-12 rounded-md flex items-center justify-center gap-2 font-bold transition-all border-2",
                  paymentMethod === "card"
                    ? "bg-[#00152A] border-[#00152A] text-white"
                    : "border-gray-100 text-gray-400 hover:border-gray-300",
                )}
              >
                <CreditCard className="w-4 h-4" />
                Card
              </button>
              <button
                onClick={() => setPaymentMethod("cash")}
                className={cn(
                  "h-12 rounded-md flex items-center justify-center gap-2 font-bold transition-all border-2",
                  paymentMethod === "cash"
                    ? "bg-[#00152A] border-[#00152A] text-white"
                    : "border-gray-100 text-gray-400 hover:border-gray-300",
                )}
              >
                <Banknote className="w-4 h-4" />
                Cash
              </button>
            </div>
          </div>

          <Link href="/reception/check-in/success" className="block w-full">
            <Button className="w-full h-14 bg-[#BA722E] hover:bg-[#A36328] text-white font-bold rounded-md shadow-xl shadow-[#BA722E]/20 flex items-center justify-center gap-3 group transition-all">
              Complete Check-In
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
