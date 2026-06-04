"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Search, Download, Calendar, ArrowRight, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface HrClientProps {
  leaveSummary: any;
  staff: any[];
}

export default function HrClient({ leaveSummary, staff }: HrClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState<{ from: string; to: string }>({
    from: "",
    to: "",
  });

  // Global Search Integration
  useEffect(() => {
    const handleGlobalSearch = (e: any) => {
      setSearchQuery(e.detail || "");
    };
    window.addEventListener("jagamn-global-search", handleGlobalSearch);
    return () =>
      window.removeEventListener("jagamn-global-search", handleGlobalSearch);
  }, []);

  const filteredStaff = useMemo(() => {
    return (staff || []).filter((s: any) => {
      const q = searchQuery.toLowerCase();
      return (
        !searchQuery ||
        (s.name && s.name.toLowerCase().includes(q)) ||
        (s.email && s.email.toLowerCase().includes(q)) ||
        (s.role && s.role.toLowerCase().includes(q)) ||
        (s.department && s.department.toLowerCase().includes(q))
      );
    });
  }, [staff, searchQuery]);

  const handleExport = () => {
    const headers = ["Name", "Email", "Role", "Department", "Status"];
    const rows = filteredStaff.map((s: any) => [
      s.name || "",
      s.email || "",
      s.role || "",
      s.department || "",
      s.status || "",
    ]);
    const csvContent = [headers, ...rows]
      .map((row) =>
        row
          .map((cell: any) => `"${String(cell).replace(/"/g, '""')}"`)
          .join(","),
      )
      .join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `HR_Report_${new Date().toISOString().slice(0, 10)}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* ── Header ─────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <h1 className="manrope-bold text-3xl md:text-5xl text-[#0D2137] tracking-tight">
          HR Overview
        </h1>
        <div className="flex items-center gap-3">
          <Button
            onClick={handleExport}
            variant="ghost"
            className="h-12 px-6 rounded-xl border border-gray-100 bg-white text-xs font-bold text-slate-400 shadow-sm flex items-center gap-2"
          >
            <Download className="w-4 h-4" /> Export Report
          </Button>
        </div>
      </div>

      {/* ── Enhanced Toolbar Filter ──────────────────── */}
      <div className="flex flex-wrap items-center justify-start sm:justify-end gap-4 w-full sm:w-auto">
        <div className="flex items-center gap-2 bg-white border border-gray-100 rounded-xl p-1 px-3 shadow-sm h-11 w-full sm:w-auto">
          <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
          <input
            type="date"
            value={dateFilter.from}
            onChange={(e) =>
              setDateFilter({ ...dateFilter, from: e.target.value })
            }
            className="bg-transparent text-[10px] font-bold text-[#0D2137] outline-none w-[110px]"
          />
          <ArrowRight className="w-3 h-3 text-gray-300 shrink-0" />
          <input
            type="date"
            value={dateFilter.to}
            onChange={(e) =>
              setDateFilter({ ...dateFilter, to: e.target.value })
            }
            className="bg-transparent text-[10px] font-bold text-[#0D2137] outline-none w-[110px]"
          />
          {(dateFilter.from || dateFilter.to) && (
            <button
              onClick={() => setDateFilter({ from: "", to: "" })}
              className="shrink-0"
            >
              <X className="w-3 h-3 text-gray-300 hover:text-red-500" />
            </button>
          )}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Global HR search..."
            className="h-11 bg-white border-gray-100 rounded-xl pl-12 text-[10px] font-black uppercase tracking-widest shadow-sm"
          />
        </div>
      </div>

      {/* ── Leave Summary Stats ─────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm border-l-4 border-l-[#0D2137]">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
            Total Leave Days
          </p>
          <h3 className="manrope-bold text-4xl text-[#0D2137]">
            {leaveSummary?.total_days || 0}
          </h3>
        </div>
        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm border-l-4 border-l-[#E8924A]">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
            Pending Requests
          </p>
          <h3 className="manrope-bold text-4xl text-[#0D2137]">
            {leaveSummary?.pending_requests || 0}
          </h3>
        </div>
        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm border-l-4 border-l-slate-400">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
            Active Staff
          </p>
          <h3 className="manrope-bold text-4xl text-[#0D2137]">
            {staff?.length || 0}
          </h3>
        </div>
      </div>

      {/* ── Staff Table ────────────────────────────── */}
      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full md:min-w-[900px]">
            <thead className="bg-[#F8FAFC]">
              <tr>
                <th className="px-10 py-6 text-left text-[10px] font-black text-[#43474D] uppercase tracking-widest">
                  Staff Name
                </th>
                <th className="px-10 py-6 text-left text-[10px] font-black text-[#43474D] uppercase tracking-widest">
                  Email
                </th>
                <th className="px-10 py-6 text-left text-[10px] font-black text-[#43474D] uppercase tracking-widest">
                  Role
                </th>
                <th className="px-10 py-6 text-left text-[10px] font-black text-[#43474D] uppercase tracking-widest">
                  Department
                </th>
                <th className="px-10 py-6 text-center text-[10px] font-black text-[#43474D] uppercase tracking-widest">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredStaff.map((s: any) => (
                <tr
                  key={s.id}
                  className="group hover:bg-gray-50 transition-colors"
                >
                  <td className="px-10 py-6">
                    <span className="manrope-bold text-sm text-[#0D2137]">
                      {s.name || "N/A"}
                    </span>
                  </td>
                  <td className="px-10 py-6">
                    <span className="text-xs text-slate-400">
                      {s.email || "N/A"}
                    </span>
                  </td>
                  <td className="px-10 py-6">
                    <Badge
                      variant="outline"
                      className="text-[9px] font-black uppercase tracking-widest border-gray-200 text-slate-400"
                    >
                      {s.role || "N/A"}
                    </Badge>
                  </td>
                  <td className="px-10 py-6">
                    <span className="text-xs text-slate-400">
                      {s.department || "N/A"}
                    </span>
                  </td>
                  <td className="px-10 py-6 text-center">
                    <div
                      className={cn(
                        "inline-flex items-center gap-2 px-3 py-1.5 rounded-full",
                        s.status === "active"
                          ? "bg-green-50 text-green-600"
                          : "bg-gray-50 text-gray-600",
                      )}
                    >
                      <div
                        className={cn(
                          "w-1.5 h-1.5 rounded-full",
                          s.status === "active"
                            ? "bg-green-500"
                            : "bg-gray-500",
                        )}
                      />
                      <span className="text-[9px] font-black uppercase tracking-widest">
                        {s.status || "Unknown"}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredStaff.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-10 py-20 text-center text-slate-400 manrope-bold italic"
                  >
                    No staff records found matching your current parameters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
