"use client";

import React, { useState } from "react";
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
      id: "1042",
    },
    category: "Sick Leave",
    dates: { from: "Oct 28, 2023", to: "Oct 29, 2023" },
    duration: "2 Days",
    status: "Pending",
    type: "SICK LEAVE",
    reason:
      "Experiencing severe seasonal flu symptoms and requiring medical rest as per physician's advice.",
    supportingDoc: "Medical_Report_Elena.pdf",
    balance: { accrued: 12, used: 4, available: 8 },
  },
  {
    id: "LR-1043",
    staff: {
      name: "Sterling",
      role: "Front Desk Supervisor",
      avatar: "/images/staff-sterling.jpg",
      id: "1042",
    },
    category: "Annual Paid Leave",
    dates: { from: "Oct 24, 2023", to: "Oct 26, 2023" },
    duration: "3 Days",
    status: "Pending",
    type: "ANNUAL",
    reason:
      "Attending a family gathering and personal commitments. Requires three consecutive days away from the Front Desk operations.",
    supportingDoc: "Travel_Itinerary.pdf",
    balance: { accrued: 24, used: 6, available: 18 },
  },
  {
    id: "LR-1044",
    staff: {
      name: "Julian Chen",
      role: "Sous Chef",
      avatar: "/images/staff-julian.jpg",
      id: "1045",
    },
    category: "Annual Leave",
    dates: { from: "Nov 02, 2023", to: "Nov 10, 2023" },
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
    },
    type: "ABSENCE",
    tag: "UNEXCUSED",
    amount: "145.00",
    date: "Today, 09:15 AM",
    reason:
      "Employee failed to report for the morning shift without prior notification. Coverage had to be outsourced at an emergency rate.",
  },
  {
    id: "D-902",
    staff: {
      name: "Elena Rodriguez",
      dept: "Concierge",
      role: "Guest Services",
      avatar: "/images/staff-elena.jpg",
    },
    type: "DAMAGE",
    tag: "EQUIPMENT",
    amount: "320.00",
    date: "Applied Yesterday",
    reason:
      "Replacement of tablet workstation damaged during handover. Deducted as per resource policy (partial coverage).",
  },
];

export default function HRPage() {
  const [activeTab, setActiveTab] = useState<"leave" | "deductions">("leave");
  const [leaveStatusFilter, setLeaveStatusFilter] = useState("Pending");
  const [selectedRequest, setSelectedRequest] = useState(LEAVE_REQUESTS[1]);

  const filteredLeaveRequests = React.useMemo(() => {
    if (leaveStatusFilter === "All") return LEAVE_REQUESTS;
    return LEAVE_REQUESTS.filter((req) => req.status === leaveStatusFilter);
  }, [leaveStatusFilter]);

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* ── Sub Navigation Switcher ─────────────────── */}
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

      {activeTab === "leave" ? (
        <LeaveManagementView
          leaveStatusFilter={leaveStatusFilter}
          setLeaveStatusFilter={setLeaveStatusFilter}
          selectedRequest={selectedRequest}
          setSelectedRequest={setSelectedRequest}
          requests={filteredLeaveRequests}
        />
      ) : (
        <DeductionsView />
      )}
    </div>
  );
}

// --- Sub-Views ---

function LeaveManagementView({
  leaveStatusFilter,
  setLeaveStatusFilter,
  selectedRequest,
  setSelectedRequest,
  requests,
}: any) {
  const [showNotes, setShowNotes] = useState(false);
  const [isAvailabilityExpanded, setIsAvailabilityExpanded] = useState(false);

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1 text-center lg:text-left">
            Management Dashboard
          </p>
          <h1 className="manrope-bold text-3xl md:text-5xl text-[#0D2137] tracking-tight text-center lg:text-left">
            Leave Requests
          </h1>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <Button
            onClick={() => {
              const headers = [
                "Staff",
                "Role",
                "Category",
                "Dates",
                "Duration",
                "Status",
              ];
              const rows = LEAVE_REQUESTS.map((req) => [
                req.staff.name,
                req.staff.role,
                req.category,
                `${req.dates.from} - ${req.dates.to}`,
                req.duration,
                req.status,
              ]);
              const csvContent = [
                headers.join(","),
                ...rows.map((r) => r.join(",")),
              ].join("\n");
              const blob = new Blob([csvContent], {
                type: "text/csv;charset=utf-8;",
              });
              const url = URL.createObjectURL(blob);
              const link = document.createElement("a");
              link.setAttribute("href", url);
              link.setAttribute("download", "Leave_Requests_Report.csv");
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
            variant="ghost"
            className="w-full sm:w-auto h-12 px-6 rounded-xl border border-gray-100 bg-white text-xs font-bold text-slate-400 shadow-sm hover:bg-gray-50 hover:text-[#0D2137] transition-all flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" /> Export Report
          </Button>
          <Sheet>
            <SheetTrigger asChild>
              <Button className="w-full sm:w-auto h-12 px-6 rounded-xl bg-[#E8924A] hover:bg-[#E8924A]/90 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-[#E8924A]/20">
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
                    <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 flex flex-col gap-1">
                      <span className="text-[9px] font-bold text-slate-300 uppercase">
                        From
                      </span>
                      <span className="text-sm font-bold text-[#0D2137]">
                        Select Start Date
                      </span>
                    </div>
                    <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 flex flex-col gap-1">
                      <span className="text-[9px] font-bold text-slate-300 uppercase">
                        To
                      </span>
                      <span className="text-sm font-bold text-[#0D2137]">
                        Select End Date
                      </span>
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
                <div className="border-2 border-dashed border-gray-100 rounded-xl p-8 flex flex-col items-center justify-center text-center bg-gray-50/50 group hover:border-[#E8924A]/30 transition-all cursor-pointer">
                  <div className="p-3 bg-white rounded-full shadow-sm mb-3 group-hover:scale-110 transition-transform">
                    <FileDown className="w-5 h-5 text-slate-300" />
                  </div>
                  <p className="text-xs font-bold text-slate-400 mb-1">
                    Drag & drop documentation
                  </p>
                  <p className="text-[10px] text-slate-300">
                    Max file size: 10MB (PDF, PNG, JPG)
                  </p>
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

      {/* Main Content Layout */}
      <div className="flex flex-col lg:grid lg:grid-cols-12 gap-10">
        <div className="lg:col-span-4 space-y-8">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar snap-x no-scrollbar sm:no-scrollbar">
            {["All", "Pending", "Approved", "Rejected"].map((status) => (
              <button
                key={status}
                onClick={() => setLeaveStatusFilter(status)}
                className={cn(
                  "px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap snap-start",
                  leaveStatusFilter === status
                    ? "bg-[#0D2137] text-white shadow-xl"
                    : "bg-gray-100/80 text-slate-400 hover:text-[#0D2137]",
                )}
              >
                {status}{" "}
                {status === "Pending" &&
                  `(${requests.filter((r: any) => r.status === "Pending").length})`}
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
                    <div className="w-12 h-12 rounded-full bg-[#0D2137] flex items-center justify-center border-2 border-white shadow-sm shrink-0">
                      <span className="text-white text-xs font-black">
                        {request.staff.name
                          .split(" ")
                          .map((n: any[]) => n[0])
                          .join("")}
                      </span>
                    </div>
                    <div>
                      <h4 className="manrope-bold text-[15px] text-[#0D2137] leading-tight">
                        {request.staff.name}
                      </h4>
                      <p className="text-[9px] text-slate-400 font-black uppercase tracking-[0.15em] mt-1">
                        {request.staff.role}
                      </p>
                    </div>
                  </div>
                  <Badge
                    className={cn(
                      "border-0 text-[8px] font-black px-2 py-1 rounded-lg uppercase",
                      request.category === "Sick Leave"
                        ? "bg-[#E1E7EF] text-[#0D2137]"
                        : "bg-[#FFF7ED] text-[#E8924A]",
                    )}
                  >
                    {request.category === "Sick Leave"
                      ? "SICK LEAVE"
                      : "ANNUAL"}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-[11px] font-bold text-slate-400">
                      {request.dates.from.split(",")[0]} -{" "}
                      {request.dates.to.split(",")[0]}
                    </p>
                    <div className="flex items-center gap-1.5">
                      <div className="w-1 h-1 rounded-full bg-slate-200" />
                      <p className="text-[10px] text-slate-300 font-bold uppercase tracking-widest">
                        {request.duration}
                      </p>
                    </div>
                  </div>
                  <ChevronRight
                    className={cn(
                      "w-5 h-5 transition-transform duration-500",
                      selectedRequest.id === request.id
                        ? "text-[#0D2137] translate-x-1"
                        : "text-slate-200 group-hover:translate-x-1",
                    )}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-8 relative">
          <div className="bg-white rounded-xl border border-gray-100 shadow-2xl overflow-hidden flex flex-col h-full sticky top-8">
            <div className="bg-[#0D2137] p-6 md:p-10 text-white relative overflow-hidden">
              <div className="flex items-center gap-6 md:gap-8 relative z-10">
                <div className="w-16 h-16 md:w-24 md:h-24 rounded-full bg-white flex items-center justify-center border-4 border-white/10 shadow-2xl shrink-0">
                  <span className="text-[#0D2137] text-xl md:text-2xl font-black">
                    {selectedRequest.staff.name
                      .split(" ")
                      .map((n: any[]) => n[0])
                      .join("")}
                  </span>
                </div>
                <div>
                  <h2 className="manrope-bold text-2xl md:text-4xl tracking-tight mb-2">
                    {selectedRequest.staff.name}
                  </h2>
                  <div className="flex flex-wrap items-center gap-3 md:gap-4">
                    <p className="text-xs md:text-sm font-bold text-slate-400">
                      {selectedRequest.staff.role} • ID:{" "}
                      {selectedRequest.staff.id}
                    </p>
                    <div className="flex items-center gap-2 bg-white/5 px-3 py-1 rounded-full">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#FFB067] animate-pulse" />
                      <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-slate-300">
                        Pending Review
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <Calendar className="absolute top-4 right-4 md:top-10 md:right-10 w-16 h-16 md:w-24 md:h-24 text-white/5 -rotate-12" />
            </div>

            <div className="p-6 md:p-12 flex-1 space-y-10 md:space-y-12 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16">
                <div className="space-y-10 md:space-y-12">
                  <div className="space-y-2">
                    <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">
                      Leave Category
                    </p>
                    <h3 className="manrope-bold text-xl md:text-2xl text-[#0D2137]">
                      {selectedRequest.category}
                    </h3>
                  </div>

                  <div className="space-y-4">
                    <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">
                      Duration
                    </p>
                    <div className="flex items-center gap-4 md:gap-6">
                      <div className="bg-gray-100/40 p-4 md:p-6 rounded-xl border border-gray-100 flex-1 text-center">
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 md:mb-2">
                          From
                        </p>
                        <p className="manrope-bold text-base md:text-lg text-[#0D2137]">
                          {selectedRequest.dates.from.split(",")[0]}
                        </p>
                        <p className="text-[10px] text-gray-400 font-bold mt-1">
                          2023
                        </p>
                      </div>
                      <ArrowRight className="w-4 h-4 md:w-6 md:h-6 text-gray-200 shrink-0" />
                      <div className="bg-gray-100/40 p-4 md:p-6 rounded-xl border border-gray-100 flex-1 text-center">
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 md:mb-2">
                          To
                        </p>
                        <p className="manrope-bold text-base md:text-lg text-[#0D2137]">
                          {selectedRequest.dates.to.split(",")[0]}
                        </p>
                        <p className="text-[10px] text-gray-400 font-bold mt-1">
                          2023
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">
                      Reason for Request
                    </p>
                    <p className="text-sm leading-relaxed text-gray-500 font-medium">
                      {selectedRequest.reason}
                    </p>
                  </div>

                  <div className="space-y-4">
                    <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">
                      Supporting Documentation
                    </p>
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex items-center justify-between group hover:bg-white hover:border-[#0D2137]/20 transition-all cursor-pointer">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="p-2 bg-[#0D2137] rounded-lg shrink-0">
                          <FileText className="w-4 h-4 text-[#FFB067]" />
                        </div>
                        <span className="text-[10px] font-bold text-[#0D2137] truncate">
                          {selectedRequest.supportingDoc}
                        </span>
                      </div>
                      <Download className="w-4 h-4 text-gray-300 shrink-0" />
                    </div>
                  </div>
                </div>

                <div className="space-y-10 md:space-y-12">
                  <div className="bg-gray-100/40 rounded-xl p-6 md:p-8 border border-gray-100 relative overflow-hidden">
                    <div className="flex items-center gap-3 mb-8 md:mb-10">
                      <div className="p-2 bg-white rounded-lg shadow-sm">
                        <Clock className="w-4 h-4 text-[#0D2137]" />
                      </div>
                      <h4 className="text-[10px] font-black text-[#0D2137] uppercase tracking-[0.2em]">
                        Leave Balance
                      </h4>
                    </div>

                    <div className="grid grid-cols-2 gap-y-8 md:gap-y-10">
                      <div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight mb-1">
                          Total Accrued
                        </p>
                        <p className="manrope-bold text-base md:text-lg text-[#0D2137]">
                          {selectedRequest.balance.accrued} Days
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight mb-1">
                          Used This Year
                        </p>
                        <p className="manrope-bold text-base md:text-lg text-[#0D2137]">
                          0{selectedRequest.balance.used} Days
                        </p>
                      </div>
                      <div className="col-span-2 pt-6 border-t border-gray-200/50">
                        <div className="flex items-end justify-between mb-4">
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">
                            Available Balance
                          </p>
                          <div className="text-right">
                            <span className="manrope-bold text-3xl md:text-4xl text-[#0D2137]">
                              {selectedRequest.balance.available}
                            </span>
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 md:ml-2">
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

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">
                        Manager's Notes
                      </p>
                      {!showNotes && (
                        <button
                          onClick={() => setShowNotes(true)}
                          className="text-[9px] font-black text-[#E8924A] uppercase tracking-widest hover:underline"
                        >
                          Add Comment
                        </button>
                      )}
                    </div>
                    {showNotes ? (
                      <div className="animate-in slide-in-from-top-2 duration-300">
                        <textarea
                          autoFocus
                          className="w-full min-h-[120px] md:min-h-[160px] border-2 border-dashed border-gray-200 rounded-xl p-5 md:p-6 bg-gray-50/30 text-xs font-medium focus:outline-none focus:border-[#E8924A] transition-all"
                          placeholder="Type your notes here..."
                        />
                      </div>
                    ) : (
                      <div className="min-h-[100px] md:min-h-[120px] w-full border-2 border-dashed border-gray-100 rounded-xl p-6 flex items-center justify-center bg-gray-50/10">
                        <p className="text-[10px] text-gray-300 font-medium italic">
                          No notes added yet.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 md:p-8 bg-white border-t border-gray-100 flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-6">
              <Button
                variant="outline"
                className="w-full sm:w-auto h-14 px-12 rounded-xl border-2 border-red-500 bg-white text-red-500 manrope-bold hover:bg-red-50 transition-all sm:min-w-[200px]"
              >
                REJECT REQUEST
              </Button>
              <Button className="w-full sm:w-auto h-14 px-12 rounded-xl bg-[#0D2137] text-white manrope-bold hover:bg-[#0D2137]/90 shadow-xl transition-all sm:min-w-[200px]">
                APPROVE LEAVE
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
              <div className="relative group">
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

function DeductionsView() {
  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-10">
        <div className="max-w-3xl">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
            <h1 className="manrope-bold text-3xl md:text-5xl text-jagamn-primary tracking-tight">
              Deductions & Penalties
            </h1>
            <Button
              onClick={() => {
                const headers = [
                  "Staff",
                  "Dept",
                  "Role",
                  "Type",
                  "Amount",
                  "Date",
                  "Reason",
                ];
                const headersString = headers.join(",");
                const rows = RECENT_DEDUCTIONS.map((d) => [
                  d.staff.name,
                  d.staff.dept,
                  d.staff.role,
                  d.type,
                  d.amount,
                  d.date,
                  d.reason.replace(/,/g, ";"), // Escape commas
                ]);
                const csvContent = [
                  headersString,
                  ...rows.map((r) => r.join(",")),
                ].join("\n");
                const blob = new Blob([csvContent], {
                  type: "text/csv;charset=utf-8;",
                });
                const url = URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.setAttribute("href", url);
                link.setAttribute("download", "Employee_Deductions_Report.csv");
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }}
              variant="ghost"
              className="w-fit h-10 px-4 rounded-xl border border-gray-100 bg-white text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-[#0D2137] transition-all flex items-center gap-2"
            >
              <Download className="w-3.5 h-3.5" /> Export Data
            </Button>
          </div>
          <p className="text-sm text-gray-400 font-medium leading-relaxed">
            Enforce professional standards through precise financial
            adjustments. Manage disciplinary actions and resource recovery with
            editorial clarity.
          </p>
        </div>

        {/* Monthly Impact Card */}
        <div className="bg-white p-6 md:p-8 rounded-xl border border-gray-100 shadow-xl border-l-4 border-l-[#0D2137] w-full lg:min-w-[280px] lg:w-auto relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
              Monthly Impact
            </p>
            <div className="flex items-center justify-between gap-6">
              <h3 className="manrope-bold text-3xl md:text-4xl text-[#0D2137] tracking-tight">
                $4,820.00
              </h3>
              <div className="w-10 h-10 bg-[#FFB067]/10 rounded-full flex items-center justify-center">
                <TrendingDown className="w-5 h-5 text-[#FFB067]" />
              </div>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-24 h-full bg-gray-50/50 skew-x-[-20deg] translate-x-1/2" />
        </div>
      </div>

      <div className="flex flex-col lg:grid lg:grid-cols-12 gap-10">
        {/* Left: Add New Deduction Form */}
        <div className="lg:col-span-4">
          <div className="bg-white rounded-xl border border-gray-100 shadow-xl p-6 md:p-10 space-y-8 md:space-y-10 sticky top-8 border-l-4 border-l-[#0D2137]">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-jagamn-primary/5 rounded-lg">
                <Plus className="w-5 h-5 text-jagamn-primary" />
              </div>
              <h2 className="manrope-bold text-xl md:text-2xl text-jagamn-primary">
                Add New Deduction
              </h2>
            </div>

            <div className="space-y-6 md:space-y-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-300 uppercase tracking-widest">
                  Staff Member
                </label>
                <div className="relative">
                  <Input
                    placeholder="Select an employee..."
                    className="h-14 bg-gray-50 border-gray-100 rounded-xl pl-5 font-medium"
                  />
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-300 uppercase tracking-widest">
                    Type
                  </label>
                  <div className="relative">
                    <Input
                      placeholder="Absence"
                      className="h-14 bg-gray-50 border-gray-100 rounded-xl pl-5 font-medium"
                    />
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-300 uppercase tracking-widest">
                    Amount ($)
                  </label>
                  <Input
                    placeholder="0.00"
                    className="h-14 bg-gray-50 border-gray-100 rounded-xl pl-5 font-medium"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-300 uppercase tracking-widest">
                  Reason Field
                </label>
                <textarea
                  className="w-full min-h-[120px] md:min-h-[140px] bg-gray-50 border border-gray-100 rounded-xl p-5 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-jagamn-primary/20 placeholder:text-gray-300"
                  placeholder="Provide detailed context for the penalty..."
                />
              </div>

              <Button className="w-full h-14 bg-[#0D2137] text-white manrope-bold rounded-xl flex items-center justify-center gap-3 shadow-xl hover:bg-[#0D2137]/90 transition-all group">
                APPLY PENALTY
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>
        </div>

        {/* Right: Recent & Stats */}
        <div className="lg:col-span-8 space-y-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h3 className="manrope-bold text-2xl text-jagamn-primary">
              Recent Deductions Applied
            </h3>
            <button className="text-[11px] font-black text-jagamn-tertiary uppercase tracking-widest hover:underline flex items-center gap-2">
              View Full History <FileDown className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-6">
            {RECENT_DEDUCTIONS.map((deduction) => (
              <div
                key={deduction.id}
                className="bg-white p-6 md:p-8 rounded-xl border border-gray-100 shadow-sm space-y-6 md:space-y-8 group hover:shadow-xl transition-all border-l-4 border-l-[#0D2137]"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                  <div className="flex items-center gap-4 md:gap-6">
                    <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-[#0D2137] flex items-center justify-center border-4 border-white shadow-lg shrink-0">
                      <span className="text-white font-black text-base md:text-lg">
                        {deduction.staff.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </span>
                    </div>
                    <div>
                      <h4 className="manrope-bold text-lg md:text-xl text-jagamn-primary">
                        {deduction.staff.name}
                      </h4>
                      <div className="flex flex-wrap items-center gap-2 md:gap-3 mt-1">
                        <p className="text-[9px] md:text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                          {deduction.staff.dept} • {deduction.staff.role}
                        </p>
                        <div className="flex items-center gap-1.5">
                          <Badge className="bg-red-50 text-red-500 border-0 text-[8px] font-black px-2 py-0.5 rounded-md">
                            {deduction.type}
                          </Badge>
                          <Badge className="bg-gray-50 text-gray-400 border-0 text-[8px] font-black px-2 py-0.5 rounded-md">
                            {deduction.tag}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="sm:text-right">
                    <p className="manrope-bold text-2xl md:text-3xl text-red-500">
                      -${deduction.amount}
                    </p>
                    <p className="text-[9px] text-gray-300 font-black uppercase tracking-widest mt-1">
                      Applied {deduction.date}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-gray-500 font-medium leading-relaxed italic border-l-2 border-gray-50 pl-4 md:pl-6">
                  "{deduction.reason}"
                </p>
              </div>
            ))}
          </div>

          {/* Policy Compliance Card */}
          <div className="bg-[#0D2137] rounded-3xl p-10 text-white relative overflow-hidden shadow-2xl flex flex-col md:flex-row items-center justify-between">
            <div className="relative z-10 max-w-sm">
              <h4 className="manrope-bold text-2xl mb-4">Policy Compliance</h4>
              <p className="text-sm text-gray-400 leading-relaxed">
                94% of deductions were successfully resolved through the
                employee grievance portal this quarter.
              </p>
            </div>

            <div className="relative z-10 flex items-center gap-16 mt-8 md:mt-0">
              <div className="text-center">
                <p className="manrope-bold text-5xl text-jagamn-tertiary mb-2">
                  12
                </p>
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                  Pending
                </p>
              </div>
              <div className="text-center">
                <p className="manrope-bold text-5xl text-white mb-2">156</p>
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                  Resolved
                </p>
              </div>
            </div>

            <div className="absolute top-1/2 left-0 -translate-y-1/2 w-48 h-48 bg-white/5 rounded-full blur-3xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
