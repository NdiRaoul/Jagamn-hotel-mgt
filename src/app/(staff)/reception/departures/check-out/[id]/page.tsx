"use client";

import React from "react";
import Link from "next/link";
import { 
  FileText, 
  Printer, 
  Mail, 
  CreditCard, 
  AlertCircle, 
  MessageSquare,
  ChevronRight,
  Flag,
  Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import { getDepartureById } from "@/lib/mock-data";
import { notFound } from "next/navigation";

export default function CheckOutBillingPage(props: { params: Promise<{ id: string }> }) {
  const params = React.use(props.params);
  const guestData = getDepartureById(params.id);

  if (!guestData) {
    notFound();
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* ── Breadcrumbs & Status ─────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            <span>Front Desk</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-[#BA722E]">Guest Check-Out & Billing</span>
          </div>
          <div className="flex items-center gap-4">
            <Badge className="bg-gray-100 text-gray-400 border-0 text-[8px] font-bold uppercase tracking-widest px-2 py-0.5">
              Room {guestData.room}
            </Badge>
            <Badge className="bg-red-50 text-red-500 border-0 text-[8px] font-bold uppercase tracking-widest px-2 py-0.5">
              Departing Today
            </Badge>
          </div>
          <h1 className="manrope-bold text-5xl text-[#00152A] tracking-tight">
            {guestData.guest}
          </h1>
          <p className="text-gray-500 text-sm font-medium">
            Folio #88492-B • Stay: Oct 12 - Oct 15 (3 Nights)
          </p>
        </div>

        <div className="flex items-center gap-4">
          <Button variant="outline" className="h-11 px-6 bg-gray-50 border-gray-100 text-[#00152A] font-bold flex items-center gap-2">
            <Printer className="w-4 h-4" />
            Print Invoice
          </Button>
          <Button variant="outline" className="h-11 px-6 bg-gray-50 border-gray-100 text-[#00152A] font-bold flex items-center gap-2">
            <Mail className="w-4 h-4" />
            Email Folio
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10 items-start">
        <div className="xl:col-span-2 space-y-8">
          {/* ── Final Bill Summary ───────────────────── */}
          <div className="bg-white rounded-lg border-l-4 border-l-[#00152A] shadow-sm p-10 space-y-12">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-[#BA722E]" />
              <h2 className="manrope-bold text-2xl text-[#00152A]">Final Bill Summary</h2>
            </div>

            {/* Room Charges */}
            <div className="space-y-6">
              <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Room Charges</h3>
              <div className="flex items-start justify-between group">
                <div className="space-y-1">
                  <p className="text-sm font-bold text-[#00152A]">Deluxe King Suite (3 Nights)</p>
                  <p className="text-xs text-gray-500">Oct 12 - Oct 14 @ $450/night</p>
                </div>
                <div className="flex items-center gap-6">
                  <p className="manrope-bold text-lg text-[#00152A]">$1,350.00</p>
                  <button className="text-gray-200 hover:text-gray-400"><Flag className="w-4 h-4" /></button>
                </div>
              </div>
            </div>

            {/* Food & Beverage */}
            <div className="space-y-6 pt-8 border-t border-gray-50">
              <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Food & Beverage</h3>
              <div className="space-y-6">
                <div className="flex items-start justify-between group">
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-[#00152A]">In-Room Dining</p>
                    <p className="text-xs text-gray-500">Oct 13 • Citrus Salmon & Wine</p>
                  </div>
                  <div className="flex items-center gap-6">
                    <p className="manrope-bold text-lg text-[#00152A]">$125.00</p>
                    <button className="text-gray-200 hover:text-gray-400"><Flag className="w-4 h-4" /></button>
                  </div>
                </div>
                <div className="flex items-start justify-between group">
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-[#00152A]">Minibar</p>
                    <p className="text-xs text-gray-500">Oct 14 • Sparkling Water (x2)</p>
                  </div>
                  <div className="flex items-center gap-6">
                    <p className="manrope-bold text-lg text-[#00152A]">$18.00</p>
                    <button className="text-gray-200 hover:text-gray-400"><Flag className="w-4 h-4" /></button>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Fees & Taxes */}
            <div className="space-y-6 pt-8 border-t border-gray-50">
              <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Additional Fees & Taxes</h3>
              <div className="space-y-6">
                <div className="bg-red-50/50 p-6 rounded-lg flex items-start justify-between group border border-red-100">
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-red-500 shadow-sm border border-red-50">
                      <AlertCircle className="w-4 h-4" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-red-500">Late Check-Out Fee</p>
                      <p className="text-[10px] text-gray-500 font-medium">Applied automatically at 12:30 PM</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <p className="manrope-bold text-lg text-red-500">$50.00</p>
                    <button className="text-red-300 hover:text-red-500"><Flag className="w-4 h-4" /></button>
                  </div>
                </div>
                
                <div className="flex items-start justify-between px-6">
                  <p className="text-sm font-bold text-[#00152A]">City Occupancy Tax (8.5%)</p>
                  <p className="manrope-bold text-lg text-[#00152A]">$114.75</p>
                </div>
                <div className="flex items-start justify-between px-6">
                  <p className="text-sm font-bold text-[#00152A]">State Tax (4%)</p>
                  <p className="manrope-bold text-lg text-[#00152A]">$54.00</p>
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
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Balance</p>
              <p className="text-[#BA722E] tracking-tight">
                <span className="text-5xl manrope-bold">$1,711</span>
                <span className="text-xl font-bold">.75</span>
                <span className="ml-2 text-[10px] font-bold uppercase tracking-widest text-gray-500">USD</span>
              </p>
            </div>

            <div className="space-y-4 pt-6 border-t border-white/10 relative">
              <div className="flex justify-between items-center text-sm font-medium">
                <span className="text-gray-400">Subtotal</span>
                <span>$1,543.00</span>
              </div>
              <div className="flex justify-between items-center text-sm font-medium">
                <span className="text-gray-400">Taxes</span>
                <span>$168.75</span>
              </div>
              <div className="flex justify-between items-center text-sm font-medium text-gray-400">
                <span>Prior Payments (Deposit)</span>
                <span>-$0.00</span>
              </div>
            </div>
          </div>

          {/* Payment Method on File */}
          <div className="bg-white rounded-lg p-8 border border-gray-100 shadow-sm space-y-6">
            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Payment Method on File</h3>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-10 bg-gray-50 rounded flex items-center justify-center text-[8px] font-bold text-gray-400 border border-gray-100 uppercase">
                  AMEX
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-[#00152A]">•••• •••• 1005</p>
                  <p className="text-[10px] text-gray-400 font-medium">Exp: 08/26</p>
                </div>
              </div>
              <button className="text-[10px] font-bold text-[#BA722E] uppercase tracking-widest hover:underline">Change</button>
            </div>
            
            <Button className="w-full h-12 bg-[#BA722E]/10 hover:bg-[#BA722E]/20 text-[#BA722E] font-bold rounded-md border border-[#BA722E]/20 transition-all">
              Confirm Check-Out
            </Button>
          </div>

          {/* Guest Notes */}
          <div className="bg-[#F8F9FA] rounded-lg p-8 border border-gray-100 space-y-4">
            <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              <Info className="w-3.5 h-3.5" />
              Disputes Pending?
            </div>
            <p className="text-xs text-gray-500 leading-relaxed italic">
              If items are flagged, balance cannot be settled until resolved by management.
            </p>
            <button className="text-[10px] font-bold text-[#00152A] uppercase tracking-widest hover:underline">View Flagged Items</button>
          </div>
        </div>
      </div>
    </div>
  );
}
