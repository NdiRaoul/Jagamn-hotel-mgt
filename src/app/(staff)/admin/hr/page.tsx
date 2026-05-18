"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Search,
  Plus,
  FileDown,
  Calendar,
  Clock,
  ChevronRight,
  FileText,
  Download,
  CheckCircle2,
  XCircle,
  TrendingDown,
  ArrowRight,
  LayoutDashboard,
  Users,
  X,
  Info,
  ChevronDown,
  AlertCircle,
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

// --- Mock Data ---

const LEAVE_REQUESTS = [
  {
    id: "LR-1042",
    staff: {
      name: "Elena Rodriguez",
      role: "Housekeeping Lead",
      avatar: "/images/staff-elena.jpg",
      id: "ST-1042",
    },
    category: "Sick Leave",
    dates: { from: "2026-10-28", to: "2026-10-29" },
    duration: "2 Days",
    status: "Pending",
    type: "SICK LEAVE",
    reason:
      "Experiencing severe seasonal flu symptoms and requiring medical rest.",
    supportingDoc: "Medical_Report_Elena.pdf",
    balance: { accrued: 12, used: 4, available: 8 },
  },
  {
    id: "LR-1043",
    staff: {
      name: "Sterling",
      role: "Front Desk Supervisor",
      avatar: "/images/staff-sterling.jpg",
      id: "ST-2091",
    },
    category: "Annual Paid Leave",
    dates: { from: "2026-10-24", to: "2026-10-26" },
    duration: "3 Days",
    status: "Pending",
    type: "ANNUAL",
    reason: "Attending a family gathering and personal commitments.",
    supportingDoc: "Travel_Itinerary.pdf",
    balance: { accrued: 24, used: 6, available: 18 },
  },
  {
    id: "LR-1044",
    staff: {
      name: "Julian Chen",
      role: "Sous Chef",
      avatar: "/images/staff-julian.jpg",
      id: "ST-1045",
    },
    category: "Annual Leave",
    dates: { from: "2026-11-02", to: "2026-11-10" },
    duration: "8 Days",
    status: "Pending",
    type: "ANNUAL",
    reason: "Scheduled annual vacation for international travel.",
    supportingDoc: "Visa_Approval.pdf",
    balance: { accrued: 20, used: 5, available: 15 },
  },
];

const RECENT_DEDUCTIONS = [
  {
    id: "D-901",
    staff: {
      name: "Julian Thorne",
      dept: "Front Desk",
      role: "Rooms Div.",
      avatar: "/images/staff-julian.jpg",
      id: "ST-3301",
    },
    type: "ABSENCE",
    tag: "UNEXCUSED",
    amount: "145.00",
    date: "2026-05-15",
    reason:
      "Employee failed to report for the morning shift without prior notification.",
  },
];

export default function HRPage() {
  const [activeTab, setActiveTab] = useState<"leave" | "deductions">("leave");
  const [leaveStatusFilter, setLeaveStatusFilter] = useState("Pending");
  const [leaveTypeFilter, setLeaveTypeFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState<{ from: string; to: string }>({
    from: "",
    to: "",
  });
  const [selectedRequest, setSelectedRequest] = useState(LEAVE_REQUESTS[0]);

  // Global Search Integration
  useEffect(() => {
    const handleGlobalSearch = (e: any) => {
      setSearchQuery(e.detail || "");
    };
    window.addEventListener("jagamn-global-search", handleGlobalSearch);
    return () =>
      window.removeEventListener("jagamn-global-search", handleGlobalSearch);
  }, []);

  const filteredLeaveRequests = useMemo(() => {
    return LEAVE_REQUESTS.filter((req) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        req.staff.name.toLowerCase().includes(q) ||
        req.staff.id.toLowerCase().includes(q) ||
        req.staff.role.toLowerCase().includes(q) ||
        req.id.toLowerCase().includes(q) ||
        req.category.toLowerCase().includes(q) ||
        req.status.toLowerCase().includes(q);

      const matchesStatus =
        leaveStatusFilter === "All" || req.status === leaveStatusFilter;
      const matchesType =
        leaveTypeFilter === "all" || req.category.includes(leaveTypeFilter);

      const reqDate = new Date(req.dates.from).getTime();
      const from = dateFilter.from
        ? new Date(dateFilter.from).getTime()
        : -Infinity;
      const to = dateFilter.to ? new Date(dateFilter.to).getTime() : Infinity;
      const matchesDate =
        reqDate >= from && (dateFilter.to ? reqDate <= to : true);

      return matchesSearch && matchesStatus && matchesType && matchesDate;
    });
  }, [searchQuery, leaveStatusFilter, leaveTypeFilter, dateFilter]);

  const filteredDeductions = useMemo(() => {
    return RECENT_DEDUCTIONS.filter((d) => {
      const q = searchQuery.toLowerCase();
      return (
        !searchQuery ||
        d.staff.name.toLowerCase().includes(q) ||
        d.staff.id.toLowerCase().includes(q) ||
        d.id.toLowerCase().includes(q) ||
        d.type.toLowerCase().includes(q) ||
        d.reason.toLowerCase().includes(q)
      );
    });
  }, [searchQuery]);

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* ── Sub Navigation Switcher ─────────────────── */}
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
            Deductions & Penalties
          </button>
        </div>

        {/* Enhanced Toolbar Filter */}
        <div className="flex flex-wrap items-center justify-start sm:justify-end gap-4 w-full sm:w-auto mt-4 sm:mt-0">
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
      </div>

      {activeTab === "leave" ? (
        <LeaveManagementView
          leaveStatusFilter={leaveStatusFilter}
          setLeaveStatusFilter={setLeaveStatusFilter}
          selectedRequest={selectedRequest}
          setSelectedRequest={setSelectedRequest}
          requests={filteredLeaveRequests}
        />
      ) : (
        <DeductionsView requests={filteredDeductions} />
      )}
    </div>
  );
}

function LeaveManagementView({
  leaveStatusFilter,
  setLeaveStatusFilter,
  selectedRequest,
  setSelectedRequest,
  requests,
}: any) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isAvailabilityExpanded, setIsAvailabilityExpanded] = useState(false);
  const [manualFromDate, setManualFromDate] = useState("");
  const [manualToDate, setManualToDate] = useState("");
  return (
    <div className="space-y-10">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <h1 className="manrope-bold text-3xl md:text-5xl text-[#0D2137] tracking-tight">
          Leave Requests
        </h1>
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            className="h-12 px-6 rounded-xl border border-gray-100 bg-white text-xs font-bold text-slate-400 shadow-sm flex items-center gap-2"
          >
            <Download className="w-4 h-4" /> Export Report
          </Button>
          <Sheet>
            <SheetTrigger asChild>
              <Button className="h-12 px-6 rounded-xl bg-[#E8924A] hover:bg-[#E8924A]/90 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-[#E8924A]/20">
                <Plus className="w-4 h-4" /> Manual Entry
              </Button>
            </SheetTrigger>
            <SheetContent className="sm:max-w-[540px] p-0 border-l-0 overflow-hidden flex flex-col">
              <div className="bg-[#0D2137] p-10 text-white relative">
                <SheetHeader className="text-left space-y-2">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
                    Administrator Tool
                  </p>
                  <SheetTitle className="manrope-bold text-4xl text-white tracking-tight">
                    Manual Leave Entry
                  </SheetTitle>
                  <SheetDescription className="text-slate-400 font-medium">
                    Create a manual leave record for a staff member. This will
                    bypass the standard approval workflow.
                  </SheetDescription>
                </SheetHeader>
                <div className="absolute top-10 right-10 opacity-10">
                  <Calendar className="w-24 h-24" />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-10 space-y-10 custom-scrollbar">
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Users className="w-3 h-3" /> Select Staff Member
                  </label>
                  <Select>
                    <SelectTrigger className="h-14 bg-gray-50 border-gray-100 rounded-xl px-5 text-sm font-bold text-[#0D2137]">
                      <SelectValue placeholder="Search staff records..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="elena">
                        Elena Rodriguez (Housekeeping Lead)
                      </SelectItem>
                      <SelectItem value="sterling">
                        Sterling (Front Desk Supervisor)
                      </SelectItem>
                      <SelectItem value="julian">
                        Julian Chen (Sous Chef)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <LayoutDashboard className="w-3 h-3" /> Leave Type
                    </label>
                    <Select>
                      <SelectTrigger className="h-14 bg-gray-50 border-gray-100 rounded-xl px-5 text-sm font-bold text-[#0D2137]">
                        <SelectValue placeholder="Annual Paid" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="annual">
                          Annual Paid Leave
                        </SelectItem>
                        <SelectItem value="sick">Sick Leave</SelectItem>
                        <SelectItem value="unpaid">Unpaid Leave</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <Clock className="w-3 h-3" /> Total Days
                    </label>
                    <Input
                      className="h-14 bg-gray-50 border-gray-100 rounded-xl px-5 text-sm font-bold text-[#0D2137]"
                      type="number"
                      placeholder="0"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Calendar className="w-3 h-3" /> Duration Period
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 flex flex-col gap-1 relative focus-within:border-slate-300 transition-all">
                      <span className="text-[9px] font-bold text-slate-300 uppercase">
                        From
                      </span>
                      <input
                        type="date"
                        value={manualFromDate}
                        onChange={(e) => setManualFromDate(e.target.value)}
                        className="bg-transparent text-sm font-bold text-[#0D2137] outline-none w-full"
                      />
                    </div>
                    <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 flex flex-col gap-1 relative focus-within:border-slate-300 transition-all">
                      <span className="text-[9px] font-bold text-slate-300 uppercase">
                        To
                      </span>
                      <input
                        type="date"
                        value={manualToDate}
                        onChange={(e) => setManualToDate(e.target.value)}
                        className="bg-transparent text-sm font-bold text-[#0D2137] outline-none w-full"
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Entry Reasoning
                  </label>
                  <textarea
                    className="w-full min-h-[120px] bg-gray-50 border border-gray-100 rounded-xl p-5 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-[#0D2137]/20 placeholder:text-slate-300"
                    placeholder="Provide justification for this manual entry..."
                  />
                </div>
                <div 
                  onClick={() => document.getElementById("manual-entry-doc")?.click()}
                  className="border-2 border-dashed border-gray-100 rounded-xl p-8 flex flex-col items-center justify-center text-center bg-gray-50/50 group hover:border-[#E8924A]/30 transition-all cursor-pointer relative"
                >
                  <input
                    type="file"
                    id="manual-entry-doc"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) setSelectedFile(file);
                    }}
                    accept=".pdf,.png,.jpg,.jpeg"
                  />
                  {selectedFile ? (
                    <div className="flex flex-col items-center gap-2">
                      <div className="p-3 bg-[#E8924A]/10 rounded-full text-[#E8924A] mb-1">
                        <FileText className="w-6 h-6" />
                      </div>
                      <p className="text-xs font-bold text-[#0D2137] max-w-[200px] truncate">
                        {selectedFile.name}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedFile(null);
                        }}
                        className="mt-2 text-[9px] font-black text-red-500 uppercase tracking-widest hover:underline animate-in fade-in"
                      >
                        Remove Document
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="p-3 bg-white rounded-full shadow-sm mb-3 group-hover:scale-110 transition-transform">
                        <FileDown className="w-5 h-5 text-slate-300" />
                      </div>
                      <p className="text-xs font-bold text-slate-400 mb-1">
                        Drag & drop documentation
                      </p>
                      <p className="text-[10px] text-slate-300">
                        Max file size: 10MB (PDF, PNG, JPG)
                      </p>
                    </>
                  )}
                </div>
              </div>
              <div className="p-10 border-t border-gray-100 bg-white">
                <Button className="w-full h-14 bg-[#0D2137] text-white manrope-bold rounded-xl flex items-center justify-center gap-3 shadow-xl hover:bg-[#0D2137]/90 transition-all">
                  COMMIT MANUAL ENTRY
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <div className="flex flex-col lg:grid lg:grid-cols-12 gap-10">
        <div className="lg:col-span-4 space-y-8">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
            {["All", "Pending", "Approved", "Rejected"].map((status) => (
              <button
                key={status}
                onClick={() => setLeaveStatusFilter(status)}
                className={cn(
                  "px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                  leaveStatusFilter === status
                    ? "bg-[#0D2137] text-white shadow-xl"
                    : "bg-gray-100/80 text-slate-400",
                )}
              >
                {status}
              </button>
            ))}
          </div>
          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            {requests.map((request: any) => (
              <div
                key={request.id}
                onClick={() => setSelectedRequest(request)}
                className={cn(
                  "p-6 rounded-xl transition-all cursor-pointer group relative overflow-hidden",
                  selectedRequest.id === request.id
                    ? "bg-white border-[#0D2137] shadow-xl border-l-4 border-l-[#0D2137]"
                    : "bg-gray-100/40 border-transparent hover:bg-white",
                )}
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-[#0D2137] flex items-center justify-center border-2 border-white shadow-sm text-white text-xs font-black">
                      {request.staff.name
                        .split(" ")
                        .map((n: any) => n[0])
                        .join("")}
                    </div>
                    <div>
                      <h4 className="manrope-bold text-[15px] text-[#0D2137] leading-tight">
                        {request.staff.name}
                      </h4>
                      <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mt-1">
                        {request.staff.role}
                      </p>
                    </div>
                  </div>
                  <Badge
                    className={cn(
                      "border-0 text-[8px] font-black px-2 py-1 rounded-lg uppercase",
                      request.category.includes("Sick")
                        ? "bg-[#E1E7EF] text-[#0D2137]"
                        : "bg-[#FFF7ED] text-[#E8924A]",
                    )}
                  >
                    {request.category.split(" ")[0]}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-[11px] font-bold text-slate-400">
                      {request.dates.from} - {request.dates.to}
                    </p>
                    <p className="text-[10px] text-slate-300 font-bold uppercase tracking-widest">
                      {request.duration}
                    </p>
                  </div>
                  <ChevronRight
                    className={cn(
                      "w-5 h-5 transition-transform",
                      selectedRequest.id === request.id
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
          <div className="bg-white rounded-xl border border-gray-100 shadow-2xl overflow-hidden flex flex-col h-full sticky top-8">
            <div className="bg-[#0D2137] p-6 md:p-10 text-white relative overflow-hidden">
              <div className="flex items-center gap-6 md:gap-8 relative z-10">
                <div className="w-16 h-16 md:w-24 md:h-24 rounded-full bg-white flex items-center justify-center border-4 border-white/10 shadow-2xl text-[#0D2137] text-xl md:text-2xl font-black">
                  {selectedRequest.staff.name
                    .split(" ")
                    .map((n: any) => n[0])
                    .join("")}
                </div>
                <div>
                  <h2 className="manrope-bold text-2xl md:text-4xl tracking-tight mb-2">
                    {selectedRequest.staff.name}
                  </h2>
                  <p className="text-xs md:text-sm font-bold text-slate-400">
                    {selectedRequest.staff.role} • ID:{" "}
                    {selectedRequest.staff.id}
                  </p>
                </div>
              </div>
              <Calendar className="absolute top-4 right-4 md:top-10 md:right-10 w-16 h-16 md:w-24 md:h-24 text-white/5 -rotate-12" />
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
                      <div className="bg-gray-50 p-4 rounded-xl border-gray-100 flex-1 text-center">
                        <p className="text-[9px] font-black text-gray-400 uppercase mb-1">
                          From
                        </p>
                        <p className="manrope-bold text-sm text-[#0D2137]">
                          {selectedRequest.dates.from}
                        </p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-200" />
                      <div className="bg-gray-50 p-4 rounded-xl border-gray-100 flex-1 text-center">
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
                    <p className="text-sm leading-relaxed text-gray-500 font-medium">
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

          <div
            className={cn(
              "absolute bottom-6 -right-6 bg-white rounded-xl shadow-2xl border border-gray-100 transition-all duration-500 ease-in-out z-50 overflow-hidden",
              isAvailabilityExpanded
                ? "w-80 p-8"
                : "w-14 h-14 p-0 flex items-center justify-center cursor-pointer hover:bg-gray-50",
            )}
            onClick={() =>
              !isAvailabilityExpanded && setIsAvailabilityExpanded(true)
            }
          >
            {isAvailabilityExpanded ? (
              <div className="animate-in fade-in duration-500">
                {(() => {
                  // Dynamic Availability Logic
                  const role = selectedRequest.staff.role;
                  const statsMap: Record<
                    string,
                    { active: number; total: number; label: string }
                  > = {
                    "Housekeeping Lead": {
                      active: 28,
                      total: 45,
                      label: "Housekeeping",
                    },
                    "Front Desk Supervisor": {
                      active: 11,
                      total: 12,
                      label: "Front Desk",
                    },
                    "Sous Chef": { active: 5, total: 10, label: "Kitchen" },
                  };

                  const stats = statsMap[role] || {
                    active: 142,
                    total: 160,
                    label: "General Staff",
                  };
                  const coverage = Math.round(
                    (stats.active / stats.total) * 100,
                  );

                  // Status Logic
                  const isCritical = coverage < 65;
                  const isWarning = coverage >= 65 && coverage < 80;
                  const isSafe = coverage >= 80;

                  return (
                    <>
                      <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-2">
                          <LayoutDashboard
                            className={cn(
                              "w-4 h-4",
                              isCritical ? "text-red-500" : "text-[#0D2137]",
                            )}
                          />
                          <h5 className="text-[10px] font-black text-[#0D2137] uppercase tracking-widest">
                            {stats.label} Availability
                          </h5>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsAvailabilityExpanded(false);
                          }}
                          className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                        >
                          <X className="w-4 h-4 text-slate-300" />
                        </button>
                      </div>
                      <div className="space-y-6">
                        <div className="bg-gray-50 rounded-xl p-5 flex items-center justify-between">
                          <div className="space-y-1">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                              Active / Total
                            </p>
                            <p className="manrope-bold text-3xl text-[#0D2137]">
                              {stats.active}
                              <span className="text-slate-300 text-lg ml-1">
                                / {stats.total}
                              </span>
                            </p>
                          </div>
                          <div
                            className={cn(
                              "w-12 h-12 rounded-full flex items-center justify-center",
                              isSafe
                                ? "bg-green-500/10"
                                : isWarning
                                  ? "bg-amber-500/10"
                                  : "bg-red-500/10",
                            )}
                          >
                            {isSafe ? (
                              <CheckCircle2 className="w-6 h-6 text-green-500" />
                            ) : isWarning ? (
                              <AlertCircle className="w-6 h-6 text-amber-500" />
                            ) : (
                              <XCircle className="w-6 h-6 text-red-500" />
                            )}
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div className="flex items-end justify-between">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                              Department Coverage
                            </p>
                            <p
                              className={cn(
                                "text-[11px] font-black",
                                isSafe
                                  ? "text-green-500"
                                  : isWarning
                                    ? "text-amber-500"
                                    : "text-red-500",
                              )}
                            >
                              {coverage}%
                            </p>
                          </div>
                          <Progress
                            value={coverage}
                            className="h-2 bg-gray-100"
                            indicatorClassName={cn(
                              isSafe
                                ? "bg-green-500"
                                : isWarning
                                  ? "bg-amber-500"
                                  : "bg-red-500",
                            )}
                          />
                        </div>

                        {/* Logic-Corrected Warning/Safe Message */}
                        <div
                          className={cn(
                            "flex items-start gap-3 p-4 rounded-xl",
                            isSafe
                              ? "bg-green-50/50"
                              : isWarning
                                ? "bg-amber-50/50"
                                : "bg-red-50/50",
                          )}
                        >
                          {isSafe ? (
                            <Info className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                          ) : (
                            <AlertCircle
                              className={cn(
                                "w-4 h-4 shrink-0 mt-0.5",
                                isWarning ? "text-amber-500" : "text-red-500",
                              )}
                            />
                          )}
                          <p
                            className={cn(
                              "text-[9px] font-medium leading-relaxed",
                              isSafe
                                ? "text-green-600"
                                : isWarning
                                  ? "text-amber-600"
                                  : "text-red-600",
                            )}
                          >
                            {isSafe
                              ? "Optimal staffing levels detected. This leave request has a low impact on operational continuity."
                              : isWarning
                                ? `Reduced coverage (${coverage}%). Approving this leave will bring ${stats.label} capacity near the critical threshold.`
                                : `CRITICAL STAFFING: Only ${stats.active} members active. Approving further leave is highly discouraged for department stability.`}
                          </p>
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>
            ) : (
              <div className="relative group flex items-center justify-center w-full h-full">
                <LayoutDashboard className="w-6 h-6 text-[#0D2137]" />
                {(() => {
                  const role = selectedRequest.staff.role;
                  const statsMap: Record<
                    string,
                    { active: number; total: number }
                  > = {
                    "Housekeeping Lead": { active: 28, total: 45 },
                    "Front Desk Supervisor": { active: 11, total: 12 },
                    "Sous Chef": { active: 5, total: 10 },
                  };
                  const stats = statsMap[role] || { active: 142, total: 160 };
                  const coverage = (stats.active / stats.total) * 100;
                  return (
                    <div
                      className={cn(
                        "absolute top-1 right-1 w-3 h-3 border-2 border-white rounded-full",
                        coverage > 80
                          ? "bg-green-500"
                          : coverage > 65
                            ? "bg-amber-500"
                            : "bg-red-500",
                      )}
                    />
                  );
                })()}
                <div className="absolute left-full ml-4 whitespace-nowrap bg-[#0D2137] text-white text-[9px] font-black uppercase tracking-widest px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl">
                  Check {selectedRequest.staff.role.split(" ")[0]} Availability
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function DeductionsView({ requests }: any) {
  return (
    <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden overflow-x-auto">
      <table className="w-full min-w-[900px]">
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
          {requests.map((d: any) => (
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
                <Button variant="ghost" className="h-10 w-10 p-0 rounded-xl">
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
                No records found matching your current parameters.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
