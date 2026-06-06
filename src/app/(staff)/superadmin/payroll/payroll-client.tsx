"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Download, Filter, Search } from "lucide-react";
import { formatMoney } from "@/lib/currency";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const StatCard = ({ title, value, subtext, accentColor }: any) => (
  <div
    className={cn(
      "bg-white p-8 rounded-xl border border-gray-100 shadow-sm transition-all hover:shadow-md border-l-4",
      accentColor,
    )}
  >
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">
      {title}
    </p>
    <div className="flex items-baseline gap-2">
      <h3 className="manrope-bold text-4xl text-[#0D2137] tracking-tight">
        {value}
      </h3>
      {subtext && (
        <span className="text-slate-400 font-bold text-sm tracking-tight">
          {subtext}
        </span>
      )}
    </div>
  </div>
);

interface PayrollClientProps {
  payrollMonthly: any[];
  payrollSummary: any;
}

export default function PayrollClient({
  payrollMonthly,
  payrollSummary,
}: PayrollClientProps) {
  const [roleFilter, setRoleFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Global Search Integration
  useEffect(() => {
    const handleGlobalSearch = (e: any) => {
      setSearchQuery(e.detail || "");
    };
    window.addEventListener("jagamn-global-search", handleGlobalSearch);
    return () =>
      window.removeEventListener("jagamn-global-search", handleGlobalSearch);
  }, []);

  const payrollData = useMemo(() => {
    return (payrollMonthly || []).filter((staff: any) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        (staff.name && staff.name.toLowerCase().includes(q)) ||
        (staff.staff_id && staff.staff_id.toLowerCase().includes(q)) ||
        (staff.role && staff.role.toLowerCase().includes(q)) ||
        (staff.gross_salary && staff.gross_salary.toString().includes(q)) ||
        (staff.net_salary && staff.net_salary.toString().includes(q));

      const matchesRole = roleFilter === "all" || staff.role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [payrollMonthly, roleFilter, searchQuery]);

  const handleExportCSV = () => {
    const headers = [
      "Staff Name",
      "Role",
      "Gross Salary",
      "Deductions",
      "Net Pay",
    ];
    const rows = payrollData.map((staff: any) => [
      staff.name || "",
      staff.role || "",
      (staff.gross_salary || 0).toFixed(2),
      (staff.deductions || 0).toFixed(2),
      (staff.net_salary || 0).toFixed(2),
    ]);
    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.setAttribute("href", URL.createObjectURL(blob));
    link.setAttribute(
      "download",
      `Payroll_Report_${new Date().toLocaleDateString()}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-20 animate-in fade-in duration-700">
      <div className="mx-auto pt-8 md:pt-12 space-y-8 md:space-y-12 px-4 md:px-0">
        {/* ── Header Section ─────────────────────────── */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="space-y-2 text-center lg:text-left">
            <p className="text-[10px] font-black text-[#0D2137]/40 uppercase tracking-[0.4em]">
              Financial Suite
            </p>
            <h1 className="manrope-bold text-3xl md:text-5xl text-[#0D2137] tracking-tight">
              Payroll Overview
            </h1>
            <p className="text-slate-400 font-medium max-w-2xl text-sm md:text-base">
              Review employee compensation schedules for the current billing
              cycle.
            </p>
          </div>
        </div>

        {/* ── Stats Grid ─────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          <StatCard
            title="Total Gross Payroll"
            value={formatMoney(payrollSummary?.total_gross ?? 0)}
            accentColor="border-l-[#0D2137]"
          />
          <StatCard
            title="Staff Count"
            value={payrollSummary?.staff_count || 0}
            subtext="Active Employees"
            accentColor="border-l-[#E8924A]"
          />
          <div className="bg-white p-6 md:p-8 rounded-xl border border-gray-100 shadow-sm border-l-4 border-l-slate-400">
            <p className="text-[10px] font-black text-[#43474D] uppercase tracking-[0.2em] mb-4">
              Status
            </p>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <h3 className="manrope-bold text-xl md:text-2xl text-[#0D2137] tracking-tight">
                Read-Only View
              </h3>
            </div>
          </div>
        </div>

        {/* ── Table Section ──────────────────────────── */}
        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 md:p-8 border-b border-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="manrope-bold text-lg md:text-xl text-[#0D2137]">
              Payroll Summary Table
            </h2>

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
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "w-10 h-10 rounded-xl transition-all shrink-0",
                      roleFilter !== "all"
                        ? "bg-jagamn-primary text-white shadow-lg"
                        : "text-slate-400 hover:text-[#0D2137] hover:bg-gray-50",
                    )}
                  >
                    <Filter className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 rounded-xl border-gray-100 shadow-2xl">
                  <DropdownMenuLabel className="manrope-bold text-[10px] uppercase tracking-widest text-slate-400 p-4 pb-2">
                    Filter by Role
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuRadioGroup
                    value={roleFilter}
                    onValueChange={setRoleFilter}
                  >
                    <DropdownMenuRadioItem
                      value="all"
                      className="manrope-bold text-sm"
                    >
                      All Roles
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem
                      value="manager"
                      className="manrope-bold text-sm"
                    >
                      Manager
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem
                      value="reception"
                      className="manrope-bold text-sm"
                    >
                      Reception
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem
                      value="housekeeping"
                      className="manrope-bold text-sm"
                    >
                      Housekeeping
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem
                      value="kitchen"
                      className="manrope-bold text-sm"
                    >
                      Kitchen
                    </DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button
                onClick={handleExportCSV}
                variant="ghost"
                size="icon"
                className="w-10 h-10 rounded-xl text-slate-400 hover:text-[#0D2137] hover:bg-gray-50 shrink-0"
              >
                <Download className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full md:min-w-[800px] text-left">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-50">
                  <th className="px-6 md:px-8 py-5 text-[10px] font-black text-[#43474D] uppercase tracking-widest">
                    Staff Name
                  </th>
                  <th className="px-6 md:px-8 py-5 text-[10px] font-black text-[#43474D] uppercase tracking-widest text-center">
                    Role
                  </th>
                  <th className="px-6 md:px-8 py-5 text-[10px] font-black text-[#43474D] uppercase tracking-widest text-right">
                    Gross Salary
                  </th>
                  <th className="px-6 md:px-8 py-5 text-[10px] font-black text-[#43474D] uppercase tracking-widest text-right">
                    Deductions
                  </th>
                  <th className="px-6 md:px-8 py-5 text-[10px] font-black text-[#43474D] uppercase tracking-widest text-right">
                    Net Pay
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {payrollData.map((staff: any) => (
                  <tr
                    key={staff.staff_id}
                    className="group hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-6 md:px-8 py-5 md:py-6">
                      <div className="flex items-center gap-3 md:gap-4">
                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-[#0D2137]/5 flex items-center justify-center border border-gray-100 shrink-0">
                          <Avatar className="w-full h-full">
                            <AvatarFallback className="text-[10px] font-black text-[#0D2137]">
                              {staff.name
                                ? staff.name
                                    .split(" ")
                                    .map((n: string) => n[0])
                                    .join("")
                                : "??"}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                        <div>
                          <span className="manrope-bold text-sm md:text-base text-[#0D2137] block">
                            {staff.name || "N/A"}
                          </span>
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                            {staff.staff_id || "N/A"}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 md:px-8 py-5 md:py-6 text-center">
                      <span className="text-xs md:text-sm font-medium text-slate-400">
                        {staff.role || "N/A"}
                      </span>
                    </td>
                    <td className="px-6 md:px-8 py-5 md:py-6 text-right">
                      <span className="manrope-bold text-sm md:text-base text-[#0D2137]">
                        {formatMoney(staff.gross_salary || 0)}
                      </span>
                    </td>
                    <td className="px-6 md:px-8 py-5 md:py-6 text-right">
                      <span className="manrope-bold text-sm md:text-base text-red-500">
                        ({formatMoney(staff.deductions || 0)})
                      </span>
                    </td>
                    <td className="px-6 md:px-8 py-5 md:py-6 text-right">
                      <span className="manrope-bold text-sm md:text-base text-[#0D2137]">
                        {formatMoney(staff.net_salary || 0)}
                      </span>
                    </td>
                  </tr>
                ))}
                {payrollData.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-8 py-20 text-center text-slate-400 manrope-bold italic"
                    >
                      No payroll records match your current filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="p-6 md:p-8 bg-gray-50/30 border-t border-gray-50 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs font-bold text-slate-400">
              Showing{" "}
              <span className="text-[#0D2137]">
                {payrollData.length > 0 ? "1" : "0"}-{payrollData.length}
              </span>{" "}
              of{" "}
              <span className="text-[#0D2137]">
                {payrollMonthly?.length || 0}
              </span>{" "}
              staff members
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
