"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  BedDouble,
  Calendar,
  Users,
  DollarSign,
  ShieldCheck,
  Key,
  MessageSquare,
  ChevronRight,
  Plus,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { getArrivalById } from "@/lib/mock-data";
import { notFound } from "next/navigation";

const SUITES = [
  { id: "401", wing: "EAST WING", view: "Park View", status: "Available" },
  { id: "405", wing: "EAST WING", view: "City View", status: "Available" },
  { id: "410", wing: "WEST WING", view: "Ocean View", status: "Available" },
  { id: "412", wing: "WEST WING", view: "Ocean View", status: "Available" },
];

export default function CheckInPage(props: { params: Promise<{ id: string }> }) {
  const params = React.use(props.params);
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);

  const guestData = getArrivalById(params.id);

  if (!guestData) {
    notFound();
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* ── Breadcrumbs & Actions ─────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            <span>Arrivals</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-[#BA722E]">Check-In</span>
          </div>
          <h1 className="manrope-bold text-5xl text-[#00152A] tracking-tight">
            {guestData.guest}
          </h1>
          <p className="text-gray-500 text-sm font-medium">
            Reservation #{guestData.reservation}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            className="h-12 px-8 bg-[#E6E8EA] border-gray-200 text-[#00152A] font-bold hover:bg-gray-50"
          >
            Edit Booking
          </Button>
          <Link href="/reception/check-in/success">
            <Button className="h-12 px-8 bg-[#BA722E] hover:bg-[#A36328] text-white font-bold shadow-lg shadow-[#BA722E]/20">
              Confirm Check-In
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
        <div className="xl:col-span-2 space-y-8">
          {/* ── Stay Details ──────────────────────────── */}
          <div className="bg-white rounded-lg border-l-4 border-l-[#00152A] shadow-sm p-10 space-y-10 relative">
            <div className="flex items-center justify-between">
              <h2 className="manrope-bold text-2xl text-[#00152A]">
                Stay Details
              </h2>
              <Badge className="bg-gray-100 text-gray-400 border-0 text-[10px] font-bold uppercase tracking-widest px-4 py-1.5 h-auto">
                Expected Arrival
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="flex gap-6">
                <div className="w-12 h-12 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">
                  <BedDouble className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    Room Category
                  </p>
                  <p className="text-lg font-bold text-[#00152A]">
                    {guestData.room}
                  </p>
                </div>
              </div>

              <div className="flex gap-6">
                <div className="w-12 h-12 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">
                  <Calendar className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    Dates
                  </p>
                  <p className="text-lg font-bold text-[#00152A]">
                    Oct 24 - Oct 28 (4 Nights)
                  </p>
                </div>
              </div>

              <div className="flex gap-6">
                <div className="w-12 h-12 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">
                  <Users className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    Guests
                  </p>
                  <p className="text-lg font-bold text-[#00152A]">2 Adults</p>
                </div>
              </div>

              <div className="flex gap-6">
                <div className="w-12 h-12 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">
                  <DollarSign className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    Total Amount
                  </p>
                  <p className="text-lg font-bold text-[#00152A]">$2,704.00</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* ── ID Verification ────────────────────────── */}
            <div className="bg-white rounded-lg border-l-4 border-l-[#00152A] shadow-sm p-10 space-y-8">
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-[#BA722E]" />
                <h2 className="manrope-bold text-xl text-[#00152A]">
                  ID Verification
                </h2>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    ID Type
                  </Label>
                  <Select defaultValue="passport">
                    <SelectTrigger className="h-12 bg-[#E6E8EA] border border-[#6B7280] text-[#00152A] font-medium">
                      <SelectValue placeholder="Select ID type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="passport">Passport</SelectItem>
                      <SelectItem value="license">Driver's License</SelectItem>
                      <SelectItem value="national">National ID</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    ID Number
                  </Label>
                  <Input
                    placeholder="Enter ID number"
                    className="h-12 bg-[#E6E8EA] border-[#6B7280] focus-visible:ring-1 focus-visible:ring-[#BA722E] text-[#00152A] font-medium placeholder:text-gray-400"
                  />
                </div>
              </div>
            </div>

            {/* ── Room Assignment ────────────────────────── */}
            <div className="bg-white rounded-lg border-l-4 border-l-[#00152A] shadow-sm p-10 space-y-8 flex flex-col">
              <div className="flex items-center gap-3">
                <Key className="w-5 h-5 text-[#BA722E]" />
                <h2 className="manrope-bold text-xl text-[#00152A]">
                  Room Assignment
                </h2>
              </div>

              <p className="text-xs text-gray-500 leading-relaxed">
                Select a {guestData.room} for this stay.
              </p>

              <div className="flex-1 flex flex-col justify-center gap-6">
                <div className="h-14 bg-[#E6E8EA] border border-[#6B7280] rounded-md flex items-center px-6 gap-4 text-gray-400">
                  <Key className="w-4 h-4 text-[#00152A]" />
                  <span className="text-sm font-medium text-[#00152A]">
                    {selectedRoom ? `Room ${selectedRoom}` : "Unassigned"}
                  </span>
                </div>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="w-full h-14 bg-[#00152A] hover:bg-[#0A2038] text-white font-bold rounded-md transition-all">
                      Assign Room
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="min-w-4xl p-0 overflow-hidden border-0 bg-white">
                    <DialogHeader className="p-8 border-b border-gray-100">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <DialogTitle className="manrope-bold text-3xl text-[#00152A]">
                            Assign Room
                          </DialogTitle>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <BedDouble className="w-4 h-4" />
                            Room Type:{" "}
                            <span className="font-bold text-[#00152A]">
                              {guestData.room}
                            </span>
                          </div>
                        </div>
                      </div>
                    </DialogHeader>

                    <div className="p-8 space-y-8">
                      <div className="flex items-center justify-between">
                        <h3 className="manrope-bold text-xl text-[#00152A]">
                          Available Suites
                        </h3>
                        <div className="flex items-center gap-6">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-[#00152A]" />
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                              Selected
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-white border border-gray-200" />
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                              Available
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-2 gap-6">
                        {SUITES.map((suite) => (
                          <div
                            key={suite.id}
                            onClick={() => setSelectedRoom(suite.id)}
                            className={cn(
                              "group p-6 rounded-lg border-2 transition-all cursor-pointer relative overflow-hidden",
                              selectedRoom === suite.id
                                ? "bg-[#00152A] border-[#00152A] text-white shadow-xl shadow-[#00152A]/20"
                                : "bg-white border-gray-100 hover:border-[#BA722E]/30",
                            )}
                          >
                            <div className="flex justify-between items-start mb-4">
                              <div className="space-y-1">
                                <h4
                                  className={cn(
                                    "manrope-bold text-4xl",
                                    selectedRoom === suite.id
                                      ? "text-white"
                                      : "text-[#00152A]",
                                  )}
                                >
                                  {suite.id}
                                </h4>
                                <p
                                  className={cn(
                                    "text-[10px] font-bold uppercase tracking-widest",
                                    selectedRoom === suite.id
                                      ? "text-gray-400"
                                      : "text-gray-400",
                                  )}
                                >
                                  {suite.wing}
                                </p>
                              </div>
                              <Badge
                                className={cn(
                                  "border-0 text-[8px] font-bold uppercase tracking-widest px-2 py-0.5",
                                  selectedRoom === suite.id
                                    ? "bg-[#BA722E] text-white"
                                    : "bg-green-50 text-green-600",
                                )}
                              >
                                {selectedRoom === suite.id ? (
                                  <span className="flex items-center gap-1">
                                    <Plus className="w-2.5 h-2.5 rotate-45" />{" "}
                                    Selected
                                  </span>
                                ) : (
                                  suite.status
                                )}
                              </Badge>
                            </div>

                            <div className="flex items-center gap-2 pt-4 border-t border-white/10">
                              <Plus
                                className={cn(
                                  "w-3.5 h-3.5",
                                  selectedRoom === suite.id
                                    ? "text-[#BA722E]"
                                    : "text-gray-300",
                                )}
                              />
                              <span
                                className={cn(
                                  "text-[10px] font-bold uppercase tracking-widest",
                                  selectedRoom === suite.id
                                    ? "text-gray-300"
                                    : "text-gray-400",
                                )}
                              >
                                {suite.view}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <DialogFooter className="p-8 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between sm:justify-between">
                      <p className="text-xs text-gray-500">
                        Assigning{" "}
                        <span className="font-bold text-[#00152A]">
                          Room {selectedRoom || "..."}
                        </span>{" "}
                        to {guestData.guest}
                      </p>
                      <div className="flex items-center gap-4">
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            className="text-sm font-bold text-[#00152A]"
                          >
                            Cancel
                          </Button>
                        </DialogTrigger>
                        <DialogTrigger asChild>
                          <Button className="h-12 px-8 bg-[#FFB366] hover:bg-[#FFA347] text-white font-bold rounded-md flex items-center gap-2">
                            Confirm Room Assignment
                            <ArrowLeft className="w-4 h-4 rotate-180" />
                          </Button>
                        </DialogTrigger>
                      </div>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>
        </div>

        {/* ── Payment Sidebar ────────────────────────── */}
        <div className="space-y-8 xl:sticky xl:top-10">
          <div className="bg-[#00152A] rounded-lg p-10 text-white space-y-10 shadow-2xl relative overflow-hidden">
            <div className="absolute right-[-20px] top-[-20px] opacity-10">
              <DollarSign className="w-40 h-40" />
            </div>

            <div className="space-y-1 relative">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Payment Status
              </p>
              <h3 className="manrope-bold text-3xl">Balance Due</h3>
              <p className="text-[#BA722E] tracking-tight">
                <span className="text-5xl manrope-bold">$500</span>
                <span className="text-xl font-bold">.00</span>
              </p>
            </div>

            <div className="space-y-4 pt-6 border-t border-white/10 relative">
              <div className="flex justify-between items-center text-sm font-medium">
                <span className="text-gray-400">Total Stay</span>
                <span>$2,704.00</span>
              </div>
              <div className="flex justify-between items-center text-sm font-medium">
                <span className="text-gray-400">Deposit Paid</span>
                <span>-$2,204.00</span>
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-white/5">
                <span className="text-xs font-bold uppercase tracking-widest text-gray-500">
                  Remaining
                </span>
                <span className="text-lg font-bold text-[#BA722E]">
                  $500.00
                </span>
              </div>
            </div>

            <Button className="w-full h-14 bg-[#BA722E] hover:bg-[#A36328] text-white font-bold rounded-md shadow-xl shadow-black/20 relative z-10">
              Collect Payment
            </Button>
          </div>

          <div className="bg-[#F8F9FA] rounded-lg p-8 border border-gray-100 space-y-4">
            <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              <MessageSquare className="w-3.5 h-3.5" />
              Guest Notes
            </div>
            <p className="text-xs text-gray-500 leading-relaxed italic border-l-2 border-gray-200 pl-4">
              "Celebrating 10th anniversary. Feather-free pillows requested."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
