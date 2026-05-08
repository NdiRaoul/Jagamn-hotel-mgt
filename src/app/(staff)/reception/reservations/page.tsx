"use client";

import React, { useState } from "react";
import { ACTIVE_RESERVATIONS_DATA } from "@/lib/mock-data";
import { 
  Filter, 
  MoreVertical, 
  Calendar, 
  User, 
  CreditCard,
  XCircle,
  FileText,
  PartyPopper
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function ActiveReservationsPage() {
  const [selectedId, setSelectedId] = useState(ACTIVE_RESERVATIONS_DATA[0].id);
  const selectedReservation = ACTIVE_RESERVATIONS_DATA.find((r) => r.id === selectedId) || ACTIVE_RESERVATIONS_DATA[0];

  const progressPercentage = (selectedReservation.currentDay / selectedReservation.nights) * 100;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 flex flex-col h-[calc(100vh-140px)]">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 flex-shrink-0">
        <div className="space-y-1">
          <h1 className="manrope-bold text-4xl text-[#00152A]">Active Reservations</h1>
          <p className="text-gray-500 text-sm">42 Guests Currently Checked In</p>
        </div>
        <Button variant="outline" className="h-11 px-4 bg-gray-50 border-gray-100 text-gray-500 font-bold flex items-center gap-2">
          <Filter className="w-4 h-4" />
          Filter
        </Button>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-8 min-h-0">
        <div className="lg:col-span-1 overflow-y-auto pr-2 space-y-4 pb-10">
          {ACTIVE_RESERVATIONS_DATA.map((res) => (
            <div
              key={res.id}
              onClick={() => setSelectedId(res.id)}
              className={cn(
                "bg-white rounded-lg p-6 cursor-pointer border-l-4 transition-all relative shadow-sm",
                selectedId === res.id 
                  ? "border-l-[#00152A]" 
                  : "border-l-transparent hover:border-gray-200"
              )}
            >
              <div className="flex justify-between items-start mb-6">
                <div className="flex gap-4 items-center">
                  <div className="w-12 h-12 rounded-lg bg-[#E6E8EA] flex items-center justify-center text-[#00152A] font-bold text-sm flex-shrink-0">
                    {res.initials}
                  </div>
                  <div className="space-y-0.5">
                    <h3 className="text-[#00152A] font-bold text-base">{res.guest}</h3>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                      CONFIRM: #{res.confirmation}
                    </p>
                  </div>
                </div>
                <Badge 
                  className={cn(
                    "text-[#00152A] border-0 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 whitespace-nowrap flex items-center gap-1.5 transition-colors",
                    selectedId === res.id ? "bg-[#DAE3F2] hover:bg-[#DAE3F2]" : "bg-[#E6E8EA] hover:bg-[#E6E8EA]"
                  )}
                >
                  <span className={cn(
                    "w-1.5 h-1.5 rounded-full",
                    selectedId === res.id ? "bg-[#004E8A]" : "bg-gray-400"
                  )}></span> ROOM {res.room}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-xs font-medium text-gray-500">
                  <div className="flex items-center gap-1.5">
                    <ArrowRightIcon className="w-3.5 h-3.5 text-gray-400" />
                    {res.checkIn}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <ArrowLeftIcon className="w-3.5 h-3.5 text-gray-400" />
                    {res.checkOut}
                  </div>
                </div>
                {res.badge && (
                  <div className="flex items-center gap-1.5 text-[10px] font-medium text-gray-500 uppercase tracking-widest">
                    {res.badge === "VIP Status" ? (
                      <StarIcon className="w-3.5 h-3.5 text-[#F59E0B] fill-[#F59E0B]" />
                    ) : (
                      <PartyPopper className="w-3.5 h-3.5 text-blue-500" />
                    )}
                    {res.badge}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* ── Right Column: Detail View ──────────────────── */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-10 overflow-y-auto">
          <div className="flex items-start justify-between mb-8">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Badge className="bg-[#E6F0F9] text-[#004E8A] border-0 text-[10px] font-bold uppercase tracking-widest px-3 py-1">
                  CHECKED IN
                </Badge>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  #{selectedReservation.confirmation}
                </span>
              </div>
              <h2 className="manrope-bold text-4xl text-[#00152A]">
                {selectedReservation.guest}
              </h2>
              <p className="text-gray-500 font-medium">
                {selectedReservation.roomType} • {selectedReservation.nights} Nights
              </p>
            </div>
            <button className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:text-[#00152A] transition-colors">
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>

          <div className="bg-gray-50 rounded-xl p-8 mb-10 space-y-6">
            <div className="flex justify-between items-center text-sm font-bold text-[#00152A]">
              <div>
                <p className="text-gray-500 font-medium mb-1">Check-in: {selectedReservation.checkInTime}</p>
              </div>
              <div className="text-right">
                <p className="text-gray-500 font-medium mb-1">Check-out: {selectedReservation.checkOutTime}</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#00152A] rounded-full transition-all duration-500" 
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-[#00152A] uppercase tracking-widest">
                  Day {selectedReservation.currentDay} of {selectedReservation.nights}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-12">
            <div className="space-y-3">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Primary Contact
              </p>
              <div>
                <p className="font-bold text-[#00152A] mb-1">{selectedReservation.phone}</p>
                <p className="text-sm text-gray-500">{selectedReservation.email}</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Payment Status
              </p>
              <div className="flex items-start gap-2">
                <div className="w-4 h-4 rounded-full bg-[#00152A] text-white flex items-center justify-center mt-0.5">
                  <CheckIcon className="w-2.5 h-2.5" />
                </div>
                <div>
                  <p className="font-bold text-[#00152A] mb-1">{selectedReservation.payment}</p>
                  <p className="text-sm text-gray-500">Incidental hold: {selectedReservation.incidentalHold}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-[10px] font-bold text-[#00152A] uppercase tracking-widest">
              Reservation Actions
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <Button className="h-16 bg-[#00152A] hover:bg-[#0A2038] text-white font-medium rounded-lg flex flex-col items-center justify-center gap-1 shadow-md shadow-[#00152A]/10">
                <Calendar className="w-4 h-4" />
                <span className="text-xs">Modify Dates/Room</span>
              </Button>
              <Button variant="outline" className="h-16 bg-gray-50 border-gray-100 text-[#00152A] font-medium rounded-lg flex flex-col items-center justify-center gap-1 hover:bg-gray-100 transition-colors">
                <FileText className="w-4 h-4" />
                <span className="text-xs">Add Staff Note</span>
              </Button>
              <Button variant="outline" className="h-16 bg-gray-50 border-gray-100 text-[#00152A] font-medium rounded-lg flex flex-col items-center justify-center gap-1 hover:bg-gray-100 transition-colors">
                <CreditCard className="w-4 h-4" />
                <span className="text-xs">View Payment History</span>
              </Button>
              <Button variant="outline" className="h-16 bg-white border-red-100 text-red-500 font-medium rounded-lg flex flex-col items-center justify-center gap-1 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors">
                <XCircle className="w-4 h-4" />
                <span className="text-xs">Cancel & Refund</span>
              </Button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

// Minimal icon definitions for the arrows/stars used in the list
function ArrowRightIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
  );
}
function ArrowLeftIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
  );
}
function StarIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
  );
}
function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" {...props}><polyline points="20 6 9 17 4 12"/></svg>
  );
}
