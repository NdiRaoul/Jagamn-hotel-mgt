"use client";

import React, { useState, useEffect, useMemo } from "react";
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
  Wallet,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// --- Mock Data ---
const PAYROLL_PERIODS: Record<string, any[]> = {
  "oct-2024": [
    { id: "S-101", name: "Julian Thorne", role: "Butler", gross: 4500.0, deductions: 250.0, net: 4250.0, avatar: "/images/staff-julian.jpg" },
    { id: "S-102", name: "Elena Rodriguez", role: "Concierge", gross: 3800.0, deductions: 120.0, net: 3680.0, avatar: "/images/staff-elena.jpg" },
    { id: "S-103", name: "Marcus Vane", role: "Chef de Cuisine", gross: 5200.0, deductions: 400.0, net: 4800.0, avatar: "/images/staff-marcus.jpg" },
  ],
  "sep-2024": [
    { id: "S-101", name: "Julian Thorne", role: "Butler", gross: 4500.0, deductions: 150.0, net: 4350.0, avatar: "/images/staff-julian.jpg" },
    { id: "S-102", name: "Elena Rodriguez", role: "Concierge", gross: 3800.0, deductions: 100.0, net: 3700.0, avatar: "/images/staff-elena.jpg" },
  ],
  "aug-2024": [
    { id: "S-103", name: "Marcus Vane", role: "Chef de Cuisine", gross: 5200.0, deductions: 300.0, net: 4900.0, avatar: "/images/staff-marcus.jpg" },
  ],
};

const StatCard = ({ title, value, subtext, accentColor }: any) => (
  <div className={cn("bg-white p-8 rounded-xl border border-gray-100 shadow-sm transition-all hover:shadow-md border-l-4", accentColor)}>
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
  const [currentStatus, setCurrentStatus] = useState({ label: "Draft Pending Approval", color: "bg-[#E8924A]" });
  const [roleFilter, setRoleFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Global Search Integration
  useEffect(() => {
    const handleGlobalSearch = (e: any) => {
      setSearchQuery(e.detail || "");
    };
    window.addEventListener('jagamn-global-search', handleGlobalSearch);
    return () => window.removeEventListener('jagamn-global-search', handleGlobalSearch);
  }, []);

  const payrollData = useMemo(() => {
    let data = PAYROLL_PERIODS[payPeriod] || [];
    
    return data.filter((staff) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = !searchQuery || 
        staff.name.toLowerCase().includes(q) ||
        staff.id.toLowerCase().includes(q) ||
        staff.role.toLowerCase().includes(q) ||
        staff.gross.toString().includes(q) ||
        staff.net.toString().includes(q);

      const matchesRole = roleFilter === "all" || staff.role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [payPeriod, roleFilter, searchQuery]);

  const handleExportCSV = () => {
    const headers = ["Staff Name", "Role", "Gross Salary", "Deductions", "Net Pay"];
    const rows = payrollData.map((staff) => [staff.name, staff.role, staff.gross.toFixed(2), staff.deductions.toFixed(2), staff.net.toFixed(2)]);
    const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.setAttribute("href", URL.createObjectURL(blob));
    link.setAttribute("download", `Jagamn_Payroll_${payPeriod.toUpperCase()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleGeneratePayroll = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setCurrentStatus({ label: "Computation Finalized", color: "bg-green-500" });
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-20 animate-in fade-in duration-700">
      <div className="max-w-7xl mx-auto pt-8 md:pt-12 space-y-8 md:space-y-12 px-4 md:px-0">
        {/* ── Header Section ─────────────────────────── */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="space-y-2 text-center lg:text-left">
            <p className="text-[10px] font-black text-[#0D2137]/40 uppercase tracking-[0.4em]">Financial Suite</p>
            <h1 className="manrope-bold text-3xl md:text-5xl text-[#0D2137] tracking-tight">Payroll Computation</h1>
            <p className="text-slate-400 font-medium max-w-2xl text-sm md:text-base">Review and finalize the employee compensation schedules for the current billing cycle.</p>
          </div>

          <div className="flex flex-col gap-2 w-full lg:w-auto">
            <p className="text-[9px] font-black text-[#43474D] uppercase tracking-widest text-center lg:text-right lg:mr-1">Pay Period</p>
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
          <StatCard title="Total Gross Payroll" value="$ 284,500.00" accentColor="border-l-[#0D2137]" />
          <StatCard title="Staff Count" value="142" subtext="Active Employees" accentColor="border-l-[#E8924A]" />
          <div className="bg-white p-6 md:p-8 rounded-xl border border-gray-100 shadow-sm border-l-4 border-l-slate-400">
            <p className="text-[10px] font-black text-[#43474D] uppercase tracking-[0.2em] mb-4">Computation Status</p>
            <div className="flex items-center gap-3">
              <div className={cn("w-3 h-3 rounded-full animate-pulse", currentStatus.color)} />
              <h3 className="manrope-bold text-xl md:text-2xl text-[#0D2137] tracking-tight">{currentStatus.label}</h3>
            </div>
          </div>
        </div>

        {/* ── Table Section ──────────────────────────── */}
        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 md:p-8 border-b border-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="manrope-bold text-lg md:text-xl text-[#0D2137]">Payroll Summary Table</h2>
            
            <div className="flex items-center gap-2 md:gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-none sm:w-64">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search ledger..." 
                  className="h-10 bg-gray-50 border-gray-100 rounded-xl pl-10 text-[10px] font-black uppercase tracking-widest shadow-sm" 
                />
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className={cn("w-10 h-10 rounded-xl transition-all shrink-0", roleFilter !== "all" ? "bg-jagamn-primary text-white shadow-lg" : "text-slate-400 hover:text-[#0D2137] hover:bg-gray-50")}>
                    <Filter className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 rounded-xl border-gray-100 shadow-2xl">
                  <DropdownMenuLabel className="manrope-bold text-[10px] uppercase tracking-widest text-slate-400 p-4 pb-2">Filter by Role</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuRadioGroup value={roleFilter} onValueChange={setRoleFilter}>
                    <DropdownMenuRadioItem value="all" className="manrope-bold text-sm">All Roles</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="Butler" className="manrope-bold text-sm">Butler</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="Concierge" className="manrope-bold text-sm">Concierge</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="Chef de Cuisine" className="manrope-bold text-sm">Chef de Cuisine</DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button onClick={handleExportCSV} variant="ghost" size="icon" className="w-10 h-10 rounded-xl text-slate-400 hover:text-[#0D2137] hover:bg-gray-50 shrink-0">
                <Download className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full min-w-[800px] text-left">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-50">
                  <th className="px-6 md:px-8 py-5 text-[10px] font-black text-[#43474D] uppercase tracking-widest">Staff Name</th>
                  <th className="px-6 md:px-8 py-5 text-[10px] font-black text-[#43474D] uppercase tracking-widest text-center">Role</th>
                  <th className="px-6 md:px-8 py-5 text-[10px] font-black text-[#43474D] uppercase tracking-widest text-right">Gross Salary</th>
                  <th className="px-6 md:px-8 py-5 text-[10px] font-black text-[#43474D] uppercase tracking-widest text-right">Deductions</th>
                  <th className="px-6 md:px-8 py-5 text-[10px] font-black text-[#43474D] uppercase tracking-widest text-right">Net Pay</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {payrollData.map((staff) => (
                  <tr key={staff.id} className="group hover:bg-gray-50/50 transition-colors cursor-pointer">
                    <td className="px-6 md:px-8 py-5 md:py-6">
                      <div className="flex items-center gap-3 md:gap-4">
                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-[#0D2137]/5 flex items-center justify-center border border-gray-100 shrink-0">
                          <Avatar className="w-full h-full">
                            <AvatarImage src={staff.avatar} className="object-cover" />
                            <AvatarFallback className="text-[10px] font-black text-[#0D2137]">{staff.name.split(" ").map((n: any[]) => n[0]).join("")}</AvatarFallback>
                          </Avatar>
                        </div>
                        <div>
                          <span className="manrope-bold text-sm md:text-base text-[#0D2137] block">{staff.name}</span>
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{staff.id}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 md:px-8 py-5 md:py-6 text-center"><span className="text-xs md:text-sm font-medium text-slate-400">{staff.role}</span></td>
                    <td className="px-6 md:px-8 py-5 md:py-6 text-right"><span className="manrope-bold text-sm md:text-base text-[#0D2137]">${staff.gross.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span></td>
                    <td className="px-6 md:px-8 py-5 md:py-6 text-right"><span className="manrope-bold text-sm md:text-base text-red-500">(${staff.deductions.toLocaleString(undefined, { minimumFractionDigits: 2 })})</span></td>
                    <td className="px-6 md:px-8 py-5 md:py-6 text-right"><span className="manrope-bold text-sm md:text-base text-[#0D2137]">${staff.net.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span></td>
                  </tr>
                ))}
                {payrollData.length === 0 && (
                  <tr><td colSpan={5} className="px-8 py-20 text-center text-slate-400 manrope-bold italic">No payroll records match your current filters.</td></tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="p-6 md:p-8 bg-gray-50/30 border-t border-gray-50 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs font-bold text-slate-400">Showing <span className="text-[#0D2137]">{payrollData.length > 0 ? "1" : "0"}-{payrollData.length}</span> of <span className="text-[#0D2137]">{PAYROLL_PERIODS[payPeriod]?.length || 0}</span> staff members</p>
            <div className="flex items-center gap-2 w-full sm:w-auto"><Button variant="outline" className="flex-1 sm:flex-none h-10 px-5 rounded-xl border-gray-200 text-slate-400 manrope-bold text-xs hover:bg-white hover:text-[#0D2137] shadow-sm">Previous</Button><Button variant="outline" className="flex-1 sm:flex-none h-10 px-5 rounded-xl border-gray-200 text-slate-400 manrope-bold text-xs hover:bg-white hover:text-[#0D2137] shadow-sm">Next</Button></div>
          </div>
        </div>

        {/* ── Footer Actions ─────────────────────────── */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-4 md:gap-5">
          <Button onClick={handleGeneratePayroll} disabled={isGenerating} variant="ghost" className="w-full sm:w-auto h-14 md:h-16 px-8 md:px-10 rounded-2xl bg-[#0D2137]/5 text-[#0D2137] manrope-bold text-sm md:text-base flex items-center justify-center gap-3 transition-all hover:bg-[#0D2137]/10 disabled:opacity-50">
            <RefreshCcw className={cn("w-5 h-5", isGenerating && "animate-spin")} />
            {isGenerating ? "Synchronizing..." : "Generate Payroll"}
          </Button>
          <Button className="w-full sm:w-auto h-14 md:h-16 px-8 md:px-10 rounded-2xl bg-[#E8924A] hover:bg-[#E8924A]/90 text-white manrope-bold text-sm md:text-base flex items-center justify-center gap-3 shadow-xl shadow-orange-500/20 transition-all hover:scale-[1.02]">
            <CheckCircle2 className="w-5 h-5" /> Approve Payroll
          </Button>
        </div>
      </div>
    </div>
  );
}
