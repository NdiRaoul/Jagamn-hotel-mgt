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
  const handleExport = () => {
    if (!requests || requests.length === 0) return;
    const headers = [
      "ID",
      "Staff Name",
      "Department",
      "Role",
      "Category",
      "From Date",
      "To Date",
      "Status",
      "Duration",
    ];
    const rows = requests.map((req: any) => [
      req.id,
      req.staff?.name || "",
      req.staff?.dept || "",
      req.staff?.role || "",
      req.category || "",
      req.from || "",
      req.to || "",
      req.status || "",
      req.duration || "",
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
      `palace_leave_requests_export_${new Date().toISOString().slice(0, 10)}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <h1 className="manrope-bold text-3xl md:text-5xl text-[#0D2137] tracking-tight">
          Leave Requests
        </h1>
        <div className="flex items-center gap-3">
          <Button
            onClick={handleExport}
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
                  onClick={() =>
                    document.getElementById("manual-entry-doc")?.click()
                  }
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
  const [selectedStaff, setSelectedStaff] = useState("");
  const [deductionType, setDeductionType] = useState("absence");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");

  const deductions = [
    {
      id: "D-901",
      staff: {
        name: "Julian Thorne",
        dept: "FRONT DESK",
        role: "ROOMS DIV.",
        avatar: "/images/staff-julian.jpg",
      },
      type: "ABSENCE",
      tag: "UNEXCUSED",
      amount: "145.00",
      time: "Applied Today, 09:15 AM",
      quote:
        "Employee failed to report for the morning shift without prior notification. Coverage had to be outsourced at an emergency rate.",
    },
    {
      id: "D-902",
      staff: {
        name: "Elena Rodriguez",
        dept: "CONCIERGE",
        role: "GUEST SERVICES",
        avatar: "/images/staff-elena.jpg",
      },
      type: "DAMAGE",
      tag: "EQUIPMENT",
      amount: "320.00",
      time: "Applied Yesterday",
      quote:
        "Replacement of tablet workstation damaged during handover. Deducted as per resource policy (partial coverage).",
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Upper header section for deductions view */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 border-b border-slate-100 pb-6">
        <div className="space-y-1">
          <h2 className="manrope-bold text-3xl md:text-4xl text-[#0D2137] tracking-tight">
            Deductions & Penalties
          </h2>
          <p className="text-gray-400 text-xs md:text-sm font-medium max-w-2xl leading-relaxed">
            Enforce professional standards through precise financial
            adjustments. Manage disciplinary actions and resource recovery with
            editorial clarity.
          </p>
        </div>

        {/* MONTHLY IMPACT block */}
        <div className="border border-slate-100 rounded-xl bg-white shadow-sm p-4 px-6 flex items-center justify-between gap-8 min-w-[240px] shrink-0 border-l-4 border-l-[#0D2137]">
          <div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">
              MONTHLY IMPACT
            </p>
            <h3 className="manrope-bold text-2xl text-[#0D2137]">$4,820.00</h3>
          </div>
          <div className="text-red-500 shrink-0">
            <TrendingDown className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main 2-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Form (col-span-5) */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-100 border-l-4 border-l-[#0D2137] p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-3 text-jagamn-primary pb-2">
            <div className="p-2.5 bg-slate-50 rounded-xl">
              <FileText className="w-5 h-5 text-jagamn-primary" />
            </div>
            <h3 className="manrope-bold text-lg">Add New Deduction</h3>
          </div>

          <div className="space-y-5">
            {/* Staff dropdown */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-[#43474D] uppercase tracking-widest">
                STAFF MEMBER
              </label>
              <Select value={selectedStaff} onValueChange={setSelectedStaff}>
                <SelectTrigger className="h-12 bg-slate-50 border-0 rounded-xl px-4 text-xs font-semibold text-slate-700">
                  <SelectValue placeholder="Select an employee..." />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="julian">
                    Julian Thorne (Front Desk)
                  </SelectItem>
                  <SelectItem value="elena">
                    Elena Rodriguez (Concierge)
                  </SelectItem>
                  <SelectItem value="sterling">
                    Sterling (Front Desk)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Type & Amount in one row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-[#43474D] uppercase tracking-widest">
                  TYPE
                </label>
                <Select value={deductionType} onValueChange={setDeductionType}>
                  <SelectTrigger className="h-12 bg-slate-50 border-0 rounded-xl px-4 text-xs font-semibold text-slate-700">
                    <SelectValue placeholder="Absence" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="absence">Absence</SelectItem>
                    <SelectItem value="damage">Damage</SelectItem>
                    <SelectItem value="conduct">Conduct</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-[#43474D] uppercase tracking-widest">
                  AMOUNT ($)
                </label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="h-12 bg-slate-50 border-0 rounded-xl px-4 text-xs font-semibold text-slate-700"
                />
              </div>
            </div>

            {/* Reason Textarea */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-[#43474D] uppercase tracking-widest">
                REASON FIELD
              </label>
              <textarea
                placeholder="Provide detailed context for the penalty..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full h-28 bg-slate-50 border border-slate-50 rounded-xl p-4 text-xs font-semibold text-slate-700 resize-none outline-none focus:ring-0 placeholder:text-slate-300"
              />
            </div>

            <Button className="w-full h-12 bg-[#0D2137] hover:bg-[#1a3854] text-white text-xs font-black uppercase tracking-widest rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-[#0D2137]/10 mt-4">
              APPLY PENALTY <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Right Column: Recent Deductions Applied (col-span-7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="manrope-bold text-lg text-[#0D2137]">
              Recent Deductions Applied
            </h3>
            <button className="text-xs font-bold text-[#E8924A] hover:underline flex items-center gap-1">
              View Full History <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-4">
            {deductions.map((d) => (
              <div
                key={d.id}
                className="bg-white rounded-2xl border border-slate-100 border-l-4 border-l-[#0D2137] p-6 shadow-sm space-y-4 hover:shadow-md transition-shadow duration-300"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[#0D2137]/5 flex items-center justify-center text-[#0D2137] text-xs font-black border-2 border-white shadow-sm overflow-hidden">
                      {d.staff.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                    <div>
                      <h4 className="manrope-bold text-sm text-[#0D2137]">
                        {d.staff.name}
                      </h4>
                      <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mt-0.5">
                        {d.staff.dept} • {d.staff.role}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge
                          className={cn(
                            "border-0 text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md shadow-none",
                            d.type === "ABSENCE"
                              ? "bg-red-50 text-red-500 hover:bg-red-100"
                              : "bg-orange-50 text-orange-500 hover:bg-orange-100",
                          )}
                        >
                          {d.type}
                        </Badge>
                        <Badge className="border-0 bg-slate-50 text-slate-400 text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md hover:bg-slate-100 shadow-none">
                          {d.tag}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg manrope-bold text-red-500">
                      -${d.amount}
                    </p>
                    <p className="text-[9px] text-slate-300 font-semibold mt-1">
                      {d.time}
                    </p>
                  </div>
                </div>

                <div className="bg-slate-50/50 rounded-xl p-4 border border-slate-50">
                  <p className="text-xs text-slate-500 leading-relaxed font-medium">
                    &ldquo;{d.quote}&rdquo;
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Policy Compliance Navy Card */}
          <div className="bg-[#0D2137] rounded-3xl p-8 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 relative z-10 max-w-md">
              <h4 className="manrope-bold text-lg">Policy Compliance</h4>
              <p className="text-xs text-slate-400 leading-relaxed font-medium">
                94% of deductions were successfully resolved through the
                employee grievance portal this quarter.
              </p>
            </div>
            <div className="flex items-center gap-8 relative z-10 shrink-0">
              <div className="text-center md:text-left">
                <span className="manrope-bold text-3xl md:text-4xl text-white">
                  12
                </span>
                <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mt-1">
                  PENDING
                </p>
              </div>
              <div className="text-center md:text-left">
                <span className="manrope-bold text-3xl md:text-4xl text-[#FFB77A]">
                  156
                </span>
                <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mt-1">
                  RESOLVED
                </p>
              </div>
            </div>
            {/* Decorative background element */}
            <div className="absolute top-[-40%] right-[-20%] w-60 h-60 bg-white/5 rounded-full blur-3xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
