"use client";

import React, { useState } from "react";
import { 
  Download, 
  Filter, 
  RefreshCcw, 
  CheckCircle2, 
  ChevronLeft, 
  ChevronRight,
  TrendingUp,
  Users,
  Clock,
  Search,
  LayoutDashboard,
  Wallet
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// --- Mock Data ---
const PAYROLL_DATA = [
  {
    id: "EMP-001",
    name: "Alexander Wright",
    role: "Housekeeping Manager",
    gross: 4200.00,
    deductions: 340.00,
    net: 3860.00,
    avatar: "/images/staff-alexander.jpg"
  },
  {
    id: "EMP-002",
    name: "Eleanor Vance",
    role: "Head Concierge",
    gross: 5100.00,
    deductions: 512.00,
    net: 4588.00,
    avatar: "/images/staff-eleanor.jpg"
  },
  {
    id: "EMP-003",
    name: "Julian Martinez",
    role: "Executive Sous Chef",
    gross: 6800.00,
    deductions: 920.00,
    net: 5880.00,
    avatar: "/images/staff-julian.jpg"
  },
  {
    id: "EMP-004",
    name: "Sarah Lowndes",
    role: "F&B Director",
    gross: 7500.00,
    deductions: 1025.00,
    net: 6475.00,
    avatar: "/images/staff-sarah.jpg"
  }
];

const StatCard = ({ title, value, subtext, accentColor }: { 
  title: string, 
  value: string, 
  subtext?: string,
  accentColor: string 
}) => (
  <div className={cn(
    "bg-white p-8 rounded-xl border border-gray-100 shadow-sm transition-all hover:shadow-md border-l-4",
    accentColor
  )}>
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">{title}</p>
    <div className="flex items-baseline gap-2">
      <h3 className="manrope-bold text-4xl text-[#0D2137] tracking-tight">{value}</h3>
      {subtext && <span className="text-slate-400 font-bold text-sm tracking-tight">{subtext}</span>}
    </div>
  </div>
);

export default function PayrollPage() {
  const [payPeriod, setPayPeriod] = useState("oct-2024");
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentStatus, setCurrentStatus] = useState({
    label: "Draft Pending Approval",
    color: "bg-[#E8924A]"
  });

  const handleExportCSV = () => {
    const headers = ["Staff Name", "Role", "Gross Salary", "Deductions", "Net Pay"];
    const rows = PAYROLL_DATA.map(staff => [
      staff.name,
      staff.role,
      staff.gross.toFixed(2),
      staff.deductions.toFixed(2),
      staff.net.toFixed(2)
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `Jagamn_Payroll_${payPeriod.toUpperCase()}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleGeneratePayroll = () => {
    setIsGenerating(true);
    // Simulate system calculation pulling from Attendance & HR
    setTimeout(() => {
      setIsGenerating(false);
      setCurrentStatus({
        label: "Computation Finalized",
        color: "bg-green-500"
      });
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-20 animate-in fade-in duration-700">
      <div className="max-w-7xl mx-auto pt-8 md:pt-12 space-y-8 md:space-y-12">
        
        {/* ── Header Section ─────────────────────────── */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="space-y-2 text-center lg:text-left">
            <p className="text-[10px] font-black text-[#0D2137]/40 uppercase tracking-[0.4em]">Financial Suite</p>
            <h1 className="manrope-bold text-3xl md:text-5xl text-[#0D2137] tracking-tight">Payroll Computation</h1>
            <p className="text-slate-400 font-medium max-w-2xl text-sm md:text-base">
              Review and finalize the employee compensation schedules for the current billing cycle.
            </p>
          </div>
          
          <div className="flex flex-col gap-2 w-full lg:w-auto">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest text-center lg:text-right lg:mr-1">Pay Period</p>
            <Select value={payPeriod} onValueChange={setPayPeriod}>
              <SelectTrigger className="w-full lg:w-[220px] h-12 bg-white border-gray-100 rounded-xl shadow-sm manrope-bold text-sm text-[#0D2137]">
                <SelectValue placeholder="Select Period" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-gray-100 shadow-2xl">
                <SelectItem value="oct-2024" className="manrope-bold">October 2024</SelectItem>
                <SelectItem value="sep-2024" className="manrope-bold">September 2024</SelectItem>
                <SelectItem value="aug-2024" className="manrope-bold">August 2024</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* ── Stats Grid ─────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          <StatCard 
            title="Total Gross Payroll" 
            value="$ 284,500.00" 
            accentColor="border-l-[#0D2137]" 
          />
          <StatCard 
            title="Staff Count" 
            value="142" 
            subtext="Active Employees"
            accentColor="border-l-[#E8924A]" 
          />
          <div className="bg-white p-6 md:p-8 rounded-xl border border-gray-100 shadow-sm border-l-4 border-l-slate-400">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Computation Status</p>
            <div className="flex items-center gap-3">
              <div className={cn("w-3 h-3 rounded-full animate-pulse", currentStatus.color)} />
              <h3 className="manrope-bold text-xl md:text-2xl text-[#0D2137] tracking-tight">{currentStatus.label}</h3>
            </div>
          </div>
        </div>

        {/* ── Table Section ──────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 md:p-8 border-b border-gray-50 flex items-center justify-between">
            <h2 className="manrope-bold text-lg md:text-xl text-[#0D2137]">Payroll Summary Table</h2>
            <div className="flex items-center gap-2 md:gap-3">
              <Button variant="ghost" size="icon" className="w-9 h-9 md:w-10 md:h-10 rounded-xl text-slate-400 hover:text-[#0D2137] hover:bg-gray-50">
                <Filter className="w-4 h-4 md:w-5 h-5" />
              </Button>
              <Button 
                onClick={handleExportCSV}
                variant="ghost" size="icon" className="w-9 h-9 md:w-10 md:h-10 rounded-xl text-slate-400 hover:text-[#0D2137] hover:bg-gray-50"
              >
                <Download className="w-4 h-4 md:w-5 h-5" />
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full min-w-[800px] text-left">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-50">
                  <th className="px-6 md:px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Staff Name</th>
                  <th className="px-6 md:px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Role</th>
                  <th className="px-6 md:px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Gross Salary</th>
                  <th className="px-6 md:px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Deductions</th>
                  <th className="px-6 md:px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Net Pay</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {PAYROLL_DATA.map((staff) => (
                  <tr key={staff.id} className="group hover:bg-gray-50/50 transition-colors cursor-pointer">
                    <td className="px-6 md:px-8 py-5 md:py-6">
                      <div className="flex items-center gap-3 md:gap-4">
                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-[#0D2137]/5 flex items-center justify-center border border-gray-100 shrink-0">
                          <Avatar className="w-full h-full">
                            <AvatarImage src={staff.avatar} className="object-cover" />
                            <AvatarFallback className="text-[10px] font-black text-[#0D2137]">
                              {staff.name.split(" ").map(n => n[0]).join("")}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                        <span className="manrope-bold text-sm md:text-base text-[#0D2137]">{staff.name}</span>
                      </div>
                    </td>
                    <td className="px-6 md:px-8 py-5 md:py-6 text-center">
                      <span className="text-xs md:text-sm font-medium text-slate-400">{staff.role}</span>
                    </td>
                    <td className="px-6 md:px-8 py-5 md:py-6 text-right">
                      <span className="manrope-bold text-sm md:text-base text-[#0D2137]">
                        ${staff.gross.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </td>
                    <td className="px-6 md:px-8 py-5 md:py-6 text-right">
                      <span className="manrope-bold text-sm md:text-base text-red-500">
                        (${staff.deductions.toLocaleString(undefined, { minimumFractionDigits: 2 })})
                      </span>
                    </td>
                    <td className="px-6 md:px-8 py-5 md:py-6 text-right">
                      <span className="manrope-bold text-sm md:text-base text-[#0D2137]">
                        ${staff.net.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-6 md:p-8 bg-gray-50/30 border-t border-gray-50 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs font-bold text-slate-400">
              Showing <span className="text-[#0D2137]">1-4</span> of <span className="text-[#0D2137]">142</span> staff members
            </p>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button variant="outline" className="flex-1 sm:flex-none h-10 px-5 rounded-xl border-gray-200 text-slate-400 manrope-bold text-xs hover:bg-white hover:text-[#0D2137] shadow-sm">
                Previous
              </Button>
              <Button variant="outline" className="flex-1 sm:flex-none h-10 px-5 rounded-xl border-gray-200 text-slate-400 manrope-bold text-xs hover:bg-white hover:text-[#0D2137] shadow-sm">
                Next
              </Button>
            </div>
          </div>
        </div>

        {/* ── Footer Actions ─────────────────────────── */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-4 md:gap-5">
          <Button 
            onClick={handleGeneratePayroll}
            disabled={isGenerating}
            variant="ghost" 
            className="w-full sm:w-auto h-14 md:h-16 px-8 md:px-10 rounded-2xl bg-[#0D2137]/5 text-[#0D2137] manrope-bold text-sm md:text-base flex items-center justify-center gap-3 transition-all hover:bg-[#0D2137]/10 disabled:opacity-50"
          >
            <RefreshCcw className={cn("w-5 h-5", isGenerating && "animate-spin")} />
            {isGenerating ? "Synchronizing..." : "Generate Payroll"}
          </Button>
          <Button 
            className="w-full sm:w-auto h-14 md:h-16 px-8 md:px-10 rounded-2xl bg-[#E8924A] hover:bg-[#E8924A]/90 text-white manrope-bold text-sm md:text-base flex items-center justify-center gap-3 shadow-xl shadow-orange-500/20 transition-all hover:scale-[1.02]"
          >
            <CheckCircle2 className="w-5 h-5" />
            Approve Payroll
          </Button>
        </div>

      </div>
    </div>
  );
}
