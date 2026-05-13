"use client";

import React, { useState, use } from "react";
import { 
  ArrowLeft, 
  Search, 
  Bell, 
  History, 
  Edit3, 
  UserMinus, 
  Mail, 
  Phone, 
  User, 
  DollarSign, 
  Calendar, 
  Clock, 
  ChevronRight,
  Printer,
  Share2,
  MoreHorizontal,
  Briefcase,
  Contact2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { StaffEditModal } from "@/components/staff/staff-edit-modal";

export default function StaffProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Mock data based on the image
  const staff = {
    id: resolvedParams.id || "RS-7429",
    name: "Elena Rodriguez",
    email: "e.rodriguez@regencysuite.com",
    phone: "+1 (555) 248-9012",
    emergencyContact: "Julian Rodriguez (+1 555-248-0000)",
    dept: "Front Desk",
    role: "Receptionist",
    salary: "$52,400",
    hireDate: "March 12, 2021",
    tenure: "3 years, 4 Months",
    performance: "98.2%",
    pendingTasks: 12,
    avatar: "/images/staff-elena.jpg"
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-20 animate-in fade-in duration-700">
      <div className="max-w-7xl mx-auto px-8 pt-6 space-y-12">
        {/* ── Breadcrumb Navigation ───────────────────── */}
        <Link 
          href="/admin/staff" 
          className="flex items-center gap-3 text-jagamn-primary hover:text-jagamn-tertiary transition-colors group w-fit"
        >
          <div className="p-2 rounded-lg group-hover:bg-gray-100 transition-all">
            <ArrowLeft className="w-5 h-5" />
          </div>
          <span className="manrope-bold text-sm tracking-tight uppercase">Staff Management</span>
        </Link>
        {/* ── Header Profile Section ──────────────────── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-10">
          <div className="flex flex-col md:flex-row items-center gap-10">
            <div className="relative">
              <div className="w-52 h-52 rounded-full border-8 border-white shadow-2xl relative flex items-center justify-center bg-white p-1">
                <Avatar className="w-full h-full rounded-full">
                  <AvatarImage src={staff.avatar} className="object-cover" />
                  <AvatarFallback className="bg-[#0D2137] text-white text-5xl manrope-bold">
                    {staff.name.split(" ").map(n => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="absolute bottom-4 right-4 w-7 h-7 bg-green-500 border-4 border-white rounded-full shadow-lg" />
            </div>

            <div className="flex flex-col text-center md:text-left">
              <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.4em] mb-4">
                STAFF ID: {staff.id}
              </p>
              <h1 className="manrope-bold text-6xl text-jagamn-primary tracking-tight leading-none mb-8">
                {staff.name}
              </h1>
              <div className="flex flex-wrap justify-center md:justify-start gap-8">
                <div className="flex items-center gap-3">
                  <Briefcase className="w-5 h-5 text-[#E8924A]" />
                  <span className="text-sm font-bold text-slate-500">{staff.dept}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Contact2 className="w-5 h-5 text-[#E8924A]" />
                  <span className="text-sm font-bold text-slate-500">{staff.role}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4 min-w-[200px]">
            <Button 
              onClick={() => setIsEditModalOpen(true)}
              className="h-14 bg-[#0D2137] hover:bg-[#0D2137]/90 text-white manrope-bold px-8 rounded-2xl shadow-xl flex items-center gap-3 transition-all hover:scale-[1.02]"
            >
              <Edit3 className="w-5 h-5" />
              Edit Details
            </Button>
            <Button variant="ghost" className="h-14 text-slate-400 font-bold hover:text-red-500 hover:bg-red-50 rounded-2xl flex items-center gap-3 transition-all">
              <UserMinus className="w-5 h-5" />
              Deactivate Account
            </Button>
          </div>
        </div>

        {/* ── Main Content Grid ───────────────────────── */}
        {/* ── Main Content Grid ───────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          {/* Column 1: Contact Information */}
          <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm border-l-4 border-l-jagamn-primary flex flex-col">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-10">Contact Information</h3>
            <div className="space-y-10 flex-1">
              <div className="space-y-1.5">
                <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest">Email Address</p>
                <p className="manrope-bold text-xl text-jagamn-primary break-all">{staff.email}</p>
              </div>
              <div className="space-y-1.5">
                <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest">Phone Number</p>
                <p className="manrope-bold text-xl text-jagamn-primary">{staff.phone}</p>
              </div>
              <div className="space-y-1.5">
                <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest">Emergency Contact</p>
                <p className="manrope-bold text-xl text-jagamn-primary leading-relaxed">{staff.emergencyContact}</p>
              </div>
            </div>
            
            <div className="pt-10 mt-10 border-t border-gray-50 space-y-6">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Work Authorization</p>
                <Badge className="bg-blue-50 text-blue-600 border-0 text-[9px] font-black px-3 py-1 rounded-lg">VERIFIED</Badge>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Compliance Level</p>
                <Badge className="bg-green-50 text-green-600 border-0 text-[9px] font-black px-3 py-1 rounded-lg">L4 SECURE</Badge>
              </div>
            </div>
          </div>

          {/* Column 2: Performance & Compensation Stack */}
          <div className="space-y-8 flex flex-col">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {/* Remuneration */}
              <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm border-l-4 border-l-jagamn-primary">
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-10">Remuneration</h3>
                <div className="space-y-8">
                  <div className="space-y-2">
                    <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest">Base Salary</p>
                    <div className="flex items-baseline gap-2">
                      <span className="manrope-bold text-4xl text-jagamn-primary">{staff.salary}</span>
                      <span className="text-gray-400 font-bold text-xs uppercase">/ yr</span>
                    </div>
                  </div>
                  <div className="h-px bg-gray-50 w-full" />
                  <div className="flex items-center justify-between">
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Next Review</p>
                    <p className="manrope-bold text-xs text-jagamn-primary">Oct 2024</p>
                  </div>
                </div>
              </div>

              {/* Employment Tenure */}
              <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm border-l-4 border-l-jagamn-primary">
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-10">Employment Tenure</h3>
                <div className="space-y-8">
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest">Hire Date</p>
                    <p className="manrope-bold text-2xl text-jagamn-primary">{staff.hireDate}</p>
                  </div>
                  <div className="bg-[#F8F9FA] p-4 rounded-xl flex items-center gap-4 border border-gray-100">
                    <div className="w-10 h-10 bg-[#0D2137] rounded-xl flex items-center justify-center text-[#E8924A] shrink-0">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Total Service</p>
                      <p className="manrope-bold text-sm text-jagamn-primary whitespace-nowrap">{staff.tenure}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Performance Banner (Jumbotron) */}
            <div className="bg-[#0D2137] rounded-2xl p-8 text-white flex flex-col md:flex-row items-center justify-between relative overflow-hidden shadow-2xl flex-1 min-h-[220px]">
              <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
                <div className="space-y-2 text-center md:text-left">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Shift Performance</p>
                  <div className="flex items-baseline gap-2 justify-center md:justify-start">
                    <span className="manrope-bold text-5xl text-white">{staff.performance}</span>
                  </div>
                </div>
                <div className="w-px h-12 bg-white/10 hidden md:block" />
                <div className="space-y-2 text-center md:text-left">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Active Tasks</p>
                  <div className="flex items-baseline gap-2 justify-center md:justify-start">
                    <span className="manrope-bold text-5xl text-white">{staff.pendingTasks}</span>
                  </div>
                </div>
              </div>
              
              <Button className="relative z-10 h-14 px-8 bg-[#FFB067] hover:bg-[#FFB067]/90 text-jagamn-primary manrope-bold rounded-xl shadow-lg mt-10 md:mt-0 transition-all hover:scale-105">
                View Full Report
              </Button>

              {/* Decorative Background */}
              <div className="absolute top-0 right-0 w-[200px] h-full bg-white/5 skew-x-[-20deg] translate-x-1/2" />
            </div>
          </div>
        </div>

        {/* ── Logs & Activity ─────────────────────────── */}
        <div className="space-y-6 pb-10">
          <div className="flex items-center justify-between">
            <h2 className="manrope-bold text-2xl text-jagamn-primary">System Logs & Activity</h2>
            <Link href="#" className="text-[11px] font-black text-[#E8924A] uppercase tracking-widest hover:underline underline-offset-4">
              View Audit Trail
            </Link>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm divide-y divide-gray-50 overflow-hidden">
            {[
              { time: "TODAY, 09:12 AM", event: "Clock-in Recorded", desc: "Front Desk Terminal A (Physical Entry)", status: "bg-green-500" },
              { time: "YESTERDAY", event: "Keycard Re-authorization", desc: "Updated access for floors 4-7 for VIP hosting", status: "bg-[#FFB067]" },
              { time: "JUL 18, 2024", event: "Profile Detail Update", desc: "Base salary adjusted per annual review cycle (Admin: J. Sterling)", status: "bg-gray-300" },
            ].map((log, i) => (
              <div key={i} className="p-6 flex items-center justify-between group hover:bg-gray-50 transition-colors cursor-pointer">
                <div className="flex items-center gap-10">
                  <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest w-24 shrink-0">{log.time}</p>
                  <div className="flex items-center gap-5">
                    <div className={cn("w-2 h-2 rounded-full", log.status)} />
                    <div>
                      <h4 className="manrope-bold text-base text-jagamn-primary">{log.event}</h4>
                      <p className="text-xs text-gray-400 font-medium">{log.desc}</p>
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-100 group-hover:text-jagamn-tertiary transition-all" />
              </div>
            ))}
          </div>
        </div>

        {/* ── Footer Actions ─────────────────────────── */}
        <div className="flex items-center justify-end gap-3">
          <Button variant="outline" size="icon" className="w-12 h-12 rounded-xl border-gray-100 bg-white text-[#0D2137] hover:bg-[#0D2137] hover:text-white shadow-sm transition-all">
            <Mail className="w-5 h-5" />
          </Button>
          <Button variant="outline" size="icon" className="w-12 h-12 rounded-xl border-gray-100 bg-white text-[#0D2137] hover:bg-[#0D2137] hover:text-white shadow-sm transition-all">
            <Printer className="w-5 h-5" />
          </Button>
          <Button variant="outline" size="icon" className="w-12 h-12 rounded-xl border-gray-100 bg-white text-[#0D2137] hover:bg-[#0D2137] hover:text-white shadow-sm transition-all">
            <Share2 className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* ── Edit Staff Modal ───────────────────────── */}
      <StaffEditModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        staffName={staff.name}
        staffEmail={staff.email}
      />
    </div>
  );
}
