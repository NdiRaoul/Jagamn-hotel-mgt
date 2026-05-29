"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Search,
  Plus,
  Download,
  Calendar,
  Clock,
  ChevronRight,
  CheckCircle2,
  ArrowRight,
  X,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Staff } from "@/types/database";

// Leave requests and deductions remain static until a dedicated HR table is added
const LEAVE_REQUESTS = [
  {
    id: "LR-1042",
    staff: { name: "Elena Rodriguez", role: "Housekeeping Lead", id: "ST-1042" },
    category: "Sick Leave",
    dates: { from: "2026-10-28", to: "2026-10-29" },
    duration: "2 Days",
    status: "Pending",
    type: "SICK LEAVE",
    reason: "Experiencing severe seasonal flu symptoms and requiring medical rest.",
    balance: { accrued: 12, used: 4, available: 8 },
  },
  {
    id: "LR-1043",
    staff: { name: "Sterling Holt", role: "Front Desk Supervisor", id: "ST-2091" },
    category: "Annual Paid Leave",
    dates: { from: "2026-10-24", to: "2026-10-26" },
    duration: "3 Days",
    status: "Pending",
    type: "ANNUAL",
    reason: "Attending a family gathering and personal commitments.",
    balance: { accrued: 24, used: 6, available: 18 },
  },
];

const RECENT_DEDUCTIONS = [
  {
    id: "D-901",
    staff: { name: "Julian Thorne", dept: "Front Desk", id: "ST-3301" },
    type: "ABSENCE",
    tag: "UNEXCUSED",
    amount: "145.00",
    date: "2026-05-15",
    reason: "Employee failed to report for the morning shift without prior notification.",
  },
];

interface Props {
  roster: Staff[];
  housekeepingTasks: { room: string; task: string; dueDate: string }[];
  error: string | null;
}

export default function HRClient({ roster, housekeepingTasks, error }: Props) {
  const [activeTab, setActiveTab] = useState<"leave" | "deductions">("leave");
  const [leaveStatusFilter, setLeaveStatusFilter] = useState("Pending");
  const [leaveTypeFilter, setLeaveTypeFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState<{ from: string; to: string }>({
    from: "",
    to: "",
  });
  const [selectedRequest, setSelectedRequest] = useState(LEAVE_REQUESTS[0]);

  useEffect(() => {
    const handler = (e: CustomEvent<string>) => setSearchQuery(e.detail || "");
    window.addEventListener("jagamn-global-search", handler as EventListener);
    return () =>
      window.removeEventListener(
        "jagamn-global-search",
        handler as EventListener,
      );
  }, []);

  const filteredLeave = useMemo(
    () =>
      LEAVE_REQUESTS.filter((req) => {
        const q = searchQuery.toLowerCase();
        const matchSearch =
          !searchQuery ||
          req.staff.name.toLowerCase().includes(q) ||
          req.id.toLowerCase().includes(q) ||
          req.category.toLowerCase().includes(q);
        const matchStatus =
          leaveStatusFilter === "All" || req.status === leaveStatusFilter;
        const matchType =
          leaveTypeFilter === "all" || req.category.includes(leaveTypeFilter);
        const d = new Date(req.dates.from).getTime();
        const from = dateFilter.from
          ? new Date(dateFilter.from).getTime()
          : -Infinity;
        const to = dateFilter.to
          ? new Date(dateFilter.to).getTime()
          : Infinity;
        return matchSearch && matchStatus && matchType && d >= from && d <= to;
      }),
    [searchQuery, leaveStatusFilter, leaveTypeFilter, dateFilter],
  );

  const filteredDeductions = useMemo(
    () =>
      RECENT_DEDUCTIONS.filter((d) => {
        const q = searchQuery.toLowerCase();
        return (
          !searchQuery ||
          d.staff.name.toLowerCase().includes(q) ||
          d.id.toLowerCase().includes(q) ||
          d.type.toLowerCase().includes(q)
        );
      }),
    [searchQuery],
  );

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {error && (
        <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-red-600 text-sm">
          {error}
        </div>
      )}

      {/* Housekeeping task strip (live from DB) */}
      {housekeepingTasks.length > 0 && (
        <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex flex-wrap gap-4">
          <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest mr-2">
            Housekeeping Tasks Today:
          </span>
          {housekeepingTasks.map((t, i) => (
            <span
              key={i}
              className="text-xs font-bold text-amber-700"
            >
              Room {t.room} — {t.task}
            </span>
          ))}
        </div>
      )}

      {/* ── Sub Navigation ─────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-2 bg-white/50 p-1.5 rounded-xl border border-gray-100 w-fit">
          <button
            onClick={() => setActiveTab("leave")}
            className={cn(
              "px-6 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
              activeTab === "leave"
                ? "bg-[#0D2137] text-white shadow-lg"
                : "text-gray-400 hover:text-[#0D2137]",
            )}
          >
            Leave Management
          </button>
          <button
            onClick={() => setActiveTab("deductions")}
            className={cn(
              "px-6 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
              activeTab === "deductions"
                ? "bg-[#0D2137] text-white shadow-lg"
                : "text-gray-400 hover:text-[#0D2137]",
            )}
          >
            Deductions &amp; Penalties
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto">
          {activeTab === "leave" && (
            <Select value={leaveTypeFilter} onValueChange={setLeaveTypeFilter}>
              <SelectTrigger className="h-11 w-full sm:w-[160px] bg-white border-gray-100 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Annual">Annual</SelectItem>
                <SelectItem value="Sick">Sick Leave</SelectItem>
              </SelectContent>
            </Select>
          )}

          <div className="flex items-center gap-2 bg-white border border-gray-100 rounded-xl px-3 shadow-sm h-11 w-full sm:w-auto">
            <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
            <input
              type="date"
              value={dateFilter.from}
              onChange={(e) =>
                setDateFilter({ ...dateFilter, from: e.target.value })
              }
              className="bg-transparent text-[10px] font-bold text-[#0D2137] outline-none w-28"
            />
            <ArrowRight className="w-3 h-3 text-gray-300 shrink-0" />
            <input
              type="date"
              value={dateFilter.to}
              onChange={(e) =>
                setDateFilter({ ...dateFilter, to: e.target.value })
              }
              className="bg-transparent text-[10px] font-bold text-[#0D2137] outline-none w-28"
            />
            {(dateFilter.from || dateFilter.to) && (
              <button onClick={() => setDateFilter({ from: "", to: "" })}>
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
      </div>

      {activeTab === "leave" ? (
        <LeaveView
          leaveStatusFilter={leaveStatusFilter}
          setLeaveStatusFilter={setLeaveStatusFilter}
          selectedRequest={selectedRequest}
          setSelectedRequest={setSelectedRequest}
          requests={filteredLeave}
          staffCount={roster.length}
        />
      ) : (
        <DeductionsView requests={filteredDeductions} />
      )}
    </div>
  );
}

function LeaveView({
  leaveStatusFilter,
  setLeaveStatusFilter,
  selectedRequest,
  setSelectedRequest,
  requests,
  staffCount,
}: {
  leaveStatusFilter: string;
  setLeaveStatusFilter: (v: string) => void;
  selectedRequest: (typeof LEAVE_REQUESTS)[0];
  setSelectedRequest: (r: (typeof LEAVE_REQUESTS)[0]) => void;
  requests: (typeof LEAVE_REQUESTS);
  staffCount: number;
}) {
  return (
    <div className="space-y-10">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="manrope-bold text-3xl md:text-5xl text-[#0D2137] tracking-tight">
            Leave Requests
          </h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
            {staffCount} active staff members on roster
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            className="h-12 px-6 rounded-xl border border-gray-100 bg-white text-xs font-bold text-slate-400 shadow-sm flex items-center gap-2"
          >
            <Download className="w-4 h-4" /> Export Report
          </Button>
          <Sheet>
            <SheetTrigger asChild>
              <Button className="h-12 px-6 rounded-xl bg-[#E8924A] hover:bg-[#E8924A]/90 text-white text-xs font-bold flex items-center gap-2 shadow-lg">
                <Plus className="w-4 h-4" /> Manual Entry
              </Button>
            </SheetTrigger>
            <SheetContent className="sm:max-w-[540px] p-0 border-l-0 overflow-hidden flex flex-col">
              <div className="bg-[#0D2137] p-10 text-white">
                <SheetHeader className="text-left space-y-2">
                  <SheetDescription className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
                    Administrator Tool
                  </SheetDescription>
                  <SheetTitle className="manrope-bold text-4xl text-white tracking-tight">
                    Manual Leave Entry
                  </SheetTitle>
                </SheetHeader>
              </div>
              <div className="flex-1 p-10 text-slate-400 text-sm">
                Leave request form — connect to a leave_requests table.
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <div className="flex flex-col lg:grid lg:grid-cols-12 gap-10">
        <div className="lg:col-span-4 space-y-8">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
            {["All", "Pending", "Approved", "Rejected"].map((s) => (
              <button
                key={s}
                onClick={() => setLeaveStatusFilter(s)}
                className={cn(
                  "px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                  leaveStatusFilter === s
                    ? "bg-[#0D2137] text-white shadow-xl"
                    : "bg-gray-100/80 text-slate-400",
                )}
              >
                {s}
              </button>
            ))}
          </div>
          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            {requests.map((req) => (
              <div
                key={req.id}
                onClick={() => setSelectedRequest(req)}
                className={cn(
                  "p-6 rounded-xl transition-all cursor-pointer group relative overflow-hidden",
                  selectedRequest.id === req.id
                    ? "bg-white border-[#0D2137] shadow-xl border-l-4 border-l-[#0D2137]"
                    : "bg-gray-100/40 hover:bg-white",
                )}
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-[#0D2137] flex items-center justify-center text-white text-xs font-black">
                      {req.staff.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                    <div>
                      <h4 className="manrope-bold text-[15px] text-[#0D2137] leading-tight">
                        {req.staff.name}
                      </h4>
                      <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mt-1">
                        {req.staff.role}
                      </p>
                    </div>
                  </div>
                  <Badge
                    className={cn(
                      "border-0 text-[8px] font-black px-2 py-1 rounded-lg uppercase",
                      req.category.includes("Sick")
                        ? "bg-[#E1E7EF] text-[#0D2137]"
                        : "bg-[#FFF7ED] text-[#E8924A]",
                    )}
                  >
                    {req.category.split(" ")[0]}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-bold text-slate-400">
                      {req.dates.from} — {req.dates.to}
                    </p>
                    <p className="text-[10px] text-slate-300 font-bold uppercase tracking-widest">
                      {req.duration}
                    </p>
                  </div>
                  <ChevronRight
                    className={cn(
                      "w-5 h-5 transition-transform",
                      selectedRequest.id === req.id
                        ? "text-[#0D2137] translate-x-1"
                        : "text-slate-200",
                    )}
                  />
                </div>
              </div>
            ))}
            {requests.length === 0 && (
              <div className="text-center py-20 text-slate-400 italic font-bold">
                No requests found.
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-8 relative">
          {selectedRequest && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-2xl overflow-hidden flex flex-col h-full sticky top-8">
              <div className="bg-[#0D2137] p-6 md:p-10 text-white relative overflow-hidden">
                <div className="flex items-center gap-6 md:gap-8 relative z-10">
                  <div className="w-16 h-16 md:w-24 md:h-24 rounded-full bg-white flex items-center justify-center text-[#0D2137] text-xl md:text-2xl font-black">
                    {selectedRequest.staff.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <div>
                    <h2 className="manrope-bold text-2xl md:text-4xl tracking-tight mb-2">
                      {selectedRequest.staff.name}
                    </h2>
                    <p className="text-xs font-bold text-slate-400">
                      {selectedRequest.staff.role} · ID:{" "}
                      {selectedRequest.staff.id}
                    </p>
                  </div>
                </div>
                <Calendar className="absolute top-4 right-4 w-16 h-16 text-white/5 -rotate-12" />
              </div>
              <div className="p-6 md:p-12 flex-1 space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-10">
                    <div className="space-y-2">
                      <p className="text-[10px] font-black text-[#43474D] uppercase tracking-widest">
                        Leave Category
                      </p>
                      <h3 className="manrope-bold text-xl md:text-2xl text-[#0D2137]">
                        {selectedRequest.category}
                      </h3>
                    </div>
                    <div className="space-y-4">
                      <p className="text-[10px] font-black text-[#43474D] uppercase tracking-widest">
                        Duration
                      </p>
                      <div className="flex items-center gap-4">
                        <div className="bg-gray-50 p-4 rounded-xl flex-1 text-center">
                          <p className="text-[9px] font-black text-gray-400 uppercase mb-1">
                            From
                          </p>
                          <p className="manrope-bold text-sm text-[#0D2137]">
                            {selectedRequest.dates.from}
                          </p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-gray-200" />
                        <div className="bg-gray-50 p-4 rounded-xl flex-1 text-center">
                          <p className="text-[9px] font-black text-gray-400 uppercase mb-1">
                            To
                          </p>
                          <p className="manrope-bold text-sm text-[#0D2137]">
                            {selectedRequest.dates.to}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <p className="text-[10px] font-black text-[#43474D] uppercase tracking-widest">
                        Reason
                      </p>
                      <p className="text-sm leading-relaxed text-gray-500">
                        {selectedRequest.reason}
                      </p>
                    </div>
                  </div>
                  <div className="bg-gray-100/40 rounded-xl p-6 md:p-8 border border-gray-100">
                    <div className="flex items-center gap-3 mb-8">
                      <Clock className="w-4 h-4 text-[#0D2137]" />
                      <h4 className="text-[10px] font-black text-[#0D2137] uppercase tracking-widest">
                        Leave Balance
                      </h4>
                    </div>
                    <div className="space-y-6">
                      <div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">
                          Available Balance
                        </p>
                        <div className="flex items-end gap-2">
                          <span className="manrope-bold text-4xl text-[#0D2137]">
                            {selectedRequest.balance.available}
                          </span>
                          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                            Days
                          </span>
                        </div>
                      </div>
                      <Progress
                        value={
                          (selectedRequest.balance.available /
                            selectedRequest.balance.accrued) *
                          100
                        }
                        className="h-1.5 bg-gray-200"
                        indicatorClassName="bg-[#E8924A]"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-6 md:p-8 border-t border-gray-100 flex items-center justify-center gap-6">
                <Button
                  variant="outline"
                  className="h-14 px-12 rounded-xl border-2 border-red-500 text-red-500 manrope-bold hover:bg-red-50"
                >
                  REJECT
                </Button>
                <Button className="h-14 px-12 rounded-xl bg-[#0D2137] text-white manrope-bold hover:bg-[#0D2137]/90 shadow-xl">
                  APPROVE
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DeductionsView({
  requests,
}: {
  requests: typeof RECENT_DEDUCTIONS;
}) {
  return (
    <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden overflow-x-auto">
      <table className="w-full" style={{ minWidth: 900 }}>
        <thead className="bg-[#F8FAFC]">
          <tr>
            <th className="px-10 py-6 text-left text-[10px] font-black text-[#43474D] uppercase tracking-widest">
              Staff Member
            </th>
            <th className="px-10 py-6 text-left text-[10px] font-black text-[#43474D] uppercase tracking-widest">
              Category
            </th>
            <th className="px-10 py-6 text-left text-[10px] font-black text-[#43474D] uppercase tracking-widest">
              Amount
            </th>
            <th className="px-10 py-6 text-left text-[10px] font-black text-[#43474D] uppercase tracking-widest">
              Date
            </th>
            <th className="px-10 py-6 text-right text-[10px] font-black text-[#43474D] uppercase tracking-widest">
              Action
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {requests.map((d) => (
            <tr key={d.id} className="group hover:bg-gray-50 transition-colors">
              <td className="px-10 py-6 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-black">
                  {d.staff.name[0]}
                </div>
                <div>
                  <p className="manrope-bold text-sm text-[#0D2137]">
                    {d.staff.name}
                  </p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">
                    {d.staff.id}
                  </p>
                </div>
              </td>
              <td className="px-10 py-6">
                <Badge
                  variant="outline"
                  className="text-[9px] font-black uppercase tracking-widest"
                >
                  {d.type}
                </Badge>
              </td>
              <td className="px-10 py-6 text-red-500 manrope-bold text-base">
                -${d.amount}
              </td>
              <td className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                {d.date}
              </td>
              <td className="px-10 py-6 text-right">
                <Button
                  variant="ghost"
                  className="h-10 w-10 p-0 rounded-xl"
                >
                  <Info className="w-4 h-4 text-slate-300" />
                </Button>
              </td>
            </tr>
          ))}
          {requests.length === 0 && (
            <tr>
              <td
                colSpan={5}
                className="px-10 py-20 text-center text-slate-400 manrope-bold italic"
              >
                No deduction records found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
