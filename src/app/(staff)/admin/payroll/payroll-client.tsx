"use client";

import React, { useState, useMemo } from "react";
import {
  Download,
  Filter,
  RefreshCcw,
  CheckCircle2,
  Search,
  Wallet,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import type { PayrollRow } from "@/lib/data/admin";

interface Props {
  rows: PayrollRow[];
  staffCount: number;
  error: string | null;
}

export default function PayrollClient({ rows, staffCount, error }: Props) {
  const [payPeriod, setPayPeriod] = useState("current");
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentStatus, setCurrentStatus] = useState({
    label: "Draft Pending Approval",
    color: "bg-[#E8924A]",
  });
  const [roleFilter, setRoleFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const uniqueRoles = useMemo(
    () => Array.from(new Set(rows.map((r) => r.role))).sort(),
    [rows],
  );

  const grossTotal = rows.reduce((sum, r) => sum + r.gross, 0);

  const filteredRows = useMemo(
    () =>
      rows.filter((r) => {
        const q = searchQuery.toLowerCase();
        const matchSearch =
          !searchQuery ||
          r.name.toLowerCase().includes(q) ||
          r.id.toLowerCase().includes(q) ||
          r.role.toLowerCase().includes(q);
        const matchRole = roleFilter === "all" || r.role === roleFilter;
        return matchSearch && matchRole;
      }),
    [rows, roleFilter, searchQuery],
  );

  const handleExportCSV = () => {
    const headers = ["Name", "Role", "Department", "Gross Salary", "Net Pay"];
    const csvRows = filteredRows.map((r) => [
      r.name,
      r.role,
      r.department || "",
      r.gross.toFixed(2),
      r.net.toFixed(2),
    ]);
    const csv = [
      headers.join(","),
      ...csvRows.map((r) => r.join(",")),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", `Jagamn_Payroll_${payPeriod.toUpperCase()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleGeneratePayroll = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setCurrentStatus({
        label: "Computation Finalized",
        color: "bg-green-500",
      });
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-20 animate-in fade-in duration-700">
      <div className="mx-auto pt-8 md:pt-12 space-y-8 md:space-y-12 px-4 md:px-0">

        {/* ── Header ─────────────────────────────────── */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="space-y-2 text-center lg:text-left">
            <p className="text-[10px] font-black text-[#0D2137]/40 uppercase tracking-[0.4em]">
              Financial Suite
            </p>
            <h1 className="manrope-bold text-3xl md:text-5xl text-[#0D2137] tracking-tight">
              Payroll Computation
            </h1>
            {error && (
              <p className="text-red-500 text-sm font-medium">{error}</p>
            )}
          </div>

          <div className="flex flex-col gap-2 w-full lg:w-auto">
            <p className="text-[9px] font-black text-[#43474D] uppercase tracking-widest text-center lg:text-right">
              Pay Period
            </p>
            <Select value={payPeriod} onValueChange={setPayPeriod}>
              <SelectTrigger className="w-full lg:w-[220px] h-12 bg-white border-gray-100 rounded-xl shadow-sm manrope-bold text-sm text-[#0D2137]">
                <SelectValue placeholder="Select Period" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-gray-100 shadow-2xl">
                <SelectItem value="current" className="manrope-bold">
                  Current Period
                </SelectItem>
                <SelectItem value="last-month" className="manrope-bold">
                  Last Month
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* ── Stats Grid ─────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          <div className="bg-white p-6 md:p-8 rounded-xl border border-gray-100 shadow-sm border-l-4 border-l-[#0D2137] hover:shadow-md transition-all">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">
              Total Gross Payroll
            </p>
            <div className="flex items-baseline gap-2">
              <h3 className="manrope-bold text-4xl text-[#0D2137] tracking-tight">
                ${(grossTotal / 12).toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </h3>
              <span className="text-slate-400 font-bold text-sm">/mo</span>
            </div>
          </div>
          <div className="bg-white p-6 md:p-8 rounded-xl border border-gray-100 shadow-sm border-l-4 border-l-[#E8924A] hover:shadow-md transition-all">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">
              Staff Count
            </p>
            <div className="flex items-baseline gap-2">
              <h3 className="manrope-bold text-4xl text-[#0D2137] tracking-tight">
                {staffCount}
              </h3>
              <span className="text-slate-400 font-bold text-sm">
                Active Employees
              </span>
            </div>
          </div>
          <div className="bg-white p-6 md:p-8 rounded-xl border border-gray-100 shadow-sm border-l-4 border-l-slate-400">
            <p className="text-[10px] font-black text-[#43474D] uppercase tracking-[0.2em] mb-4">
              Computation Status
            </p>
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "w-3 h-3 rounded-full animate-pulse",
                  currentStatus.color,
                )}
              />
              <h3 className="manrope-bold text-xl md:text-2xl text-[#0D2137] tracking-tight">
                {currentStatus.label}
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
                    {uniqueRoles.map((role) => (
                      <DropdownMenuRadioItem
                        key={role}
                        value={role}
                        className="manrope-bold text-sm"
                      >
                        {role}
                      </DropdownMenuRadioItem>
                    ))}
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
            <table className="w-full text-left" style={{ minWidth: 800 }}>
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-50">
                  <th className="px-6 md:px-8 py-5 text-[10px] font-black text-[#43474D] uppercase tracking-widest">
                    Staff Name
                  </th>
                  <th className="px-6 md:px-8 py-5 text-[10px] font-black text-[#43474D] uppercase tracking-widest text-center">
                    Role
                  </th>
                  <th className="px-6 md:px-8 py-5 text-[10px] font-black text-[#43474D] uppercase tracking-widest text-right">
                    Annual Salary
                  </th>
                  <th className="px-6 md:px-8 py-5 text-[10px] font-black text-[#43474D] uppercase tracking-widest text-right">
                    Monthly Gross
                  </th>
                  <th className="px-6 md:px-8 py-5 text-[10px] font-black text-[#43474D] uppercase tracking-widest text-right">
                    Monthly Net
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredRows.map((r) => (
                  <tr
                    key={r.id}
                    className="group hover:bg-gray-50/50 transition-colors cursor-pointer"
                  >
                    <td className="px-6 md:px-8 py-5 md:py-6">
                      <div className="flex items-center gap-3 md:gap-4">
                        <Avatar className="w-8 h-8 md:w-10 md:h-10 border border-gray-100">
                          <AvatarFallback className="text-[10px] font-black text-[#0D2137]">
                            {r.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <span className="manrope-bold text-sm md:text-base text-[#0D2137] block">
                            {r.name}
                          </span>
                          {r.department && (
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                              {r.department}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 md:px-8 py-5 md:py-6 text-center">
                      <span className="text-xs md:text-sm font-medium text-slate-400">
                        {r.role}
                      </span>
                    </td>
                    <td className="px-6 md:px-8 py-5 md:py-6 text-right">
                      <span className="manrope-bold text-sm md:text-base text-[#0D2137]">
                        ${r.gross.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </td>
                    <td className="px-6 md:px-8 py-5 md:py-6 text-right">
                      <span className="manrope-bold text-sm md:text-base text-[#0D2137]">
                        ${(r.gross / 12).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </td>
                    <td className="px-6 md:px-8 py-5 md:py-6 text-right">
                      <span className="manrope-bold text-sm md:text-base text-[#0D2137]">
                        ${(r.net / 12).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </td>
                  </tr>
                ))}
                {filteredRows.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-8 py-20 text-center text-slate-400 manrope-bold italic"
                    >
                      {rows.length === 0
                        ? "No staff salary data available yet."
                        : "No payroll records match your current filters."}
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
                {filteredRows.length > 0 ? "1" : "0"}–{filteredRows.length}
              </span>{" "}
              of{" "}
              <span className="text-[#0D2137]">{rows.length}</span> staff
              members
            </p>
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
            <RefreshCcw
              className={cn("w-5 h-5", isGenerating && "animate-spin")}
            />
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
