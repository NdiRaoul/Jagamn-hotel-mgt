"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { StaffEditModal } from "@/components/staff/staff-edit-modal";
import {
  Users,
  Plus,
  LayoutGrid,
  List,
  MoreHorizontal,
  Briefcase,
  UserCircle,
  Download,
  PieChart,
  ArrowRight,
  CheckCircle2,
  Clock,
  TrendingUp,
  UserPlus,
  Edit2,
  Trash2,
  Eye,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

const STAFF_DATA = [
  {
    id: "JD001",
    name: "Julianne Devis",
    email: "j.devis@grandpalace.com",
    dept: "Guest Relations",
    position: "Lead Concierge",
    role: "ADMIN",
    hireDate: "Jan 12, 2022",
    salary: "$4,200",
    color: "bg-jagamn-primary",
  },
  {
    id: "RK002",
    name: "Robert Kincaid",
    email: "r.kincaid@grandpalace.com",
    dept: "Food & Beverage",
    position: "Head Sommelier",
    role: "KITCHEN",
    hireDate: "Mar 05, 2023",
    salary: "$3,850",
    color: "bg-jagamn-tertiary",
  },
  {
    id: "EM003",
    name: "Elena Martinez",
    email: "e.martinez@grandpalace.com",
    dept: "Inventory",
    position: "Procurement Officer",
    role: "STORE KEEPER",
    hireDate: "Nov 18, 2021",
    salary: "$3,100",
    color: "bg-slate-500",
  },
  {
    id: "SL004",
    name: "Simon Lee",
    email: "s.lee@grandpalace.com",
    dept: "Security",
    position: "Chief Warden",
    role: "ADMIN",
    hireDate: "Jun 22, 2020",
    salary: "$4,000",
    color: "bg-jagamn-primary",
  },
];

const RoleBadge = ({ role }: { role: string }) => {
  const styles: Record<string, string> = {
    ADMIN: "bg-[#E8EFFE] text-[#4F7BDD]",
    KITCHEN: "bg-[#EAEAEA] text-[#606060]",
    "STORE KEEPER": "bg-[#FFF1E6] text-[#E8924A]",
  };

  return (
    <Badge
      variant="outline"
      className={cn(
        "text-[9px] font-black tracking-widest px-2.5 py-1 border-0 rounded-md",
        styles[role] || "bg-gray-100 text-gray-600",
      )}
    >
      {role}
    </Badge>
  );
};

export default function StaffDirectory() {
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<any>(null);
  const router = useRouter();

  const handleEditClick = (staff: any) => {
    setSelectedStaff(staff);
    setIsEditModalOpen(true);
  };

  const handleViewProfile = (id: string) => {
    router.push(`/admin/staff/${id}`);
  };

  const handleExportCSV = () => {
    const headers = ["Staff ID", "Name", "Email", "Department", "Position", "Role", "Hire Date", "Salary"];
    const rows = STAFF_DATA.map(staff => [
      staff.id,
      staff.name,
      staff.email,
      staff.dept,
      staff.position,
      staff.role,
      staff.hireDate,
      staff.salary
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "Staff_Directory_Report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 md:space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* ── Page Header & Stats ──────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-4 md:px-0">
        <div className="text-center md:text-left">
          <h1 className="manrope-bold text-3xl md:text-4xl text-jagamn-primary uppercase tracking-tight">
            Staff Directory
          </h1>
          <p className="text-gray-500 mt-2 max-w-xl font-medium text-sm md:text-base">
            Manage your distinguished team members across all palace departments
            and oversee professional roles.
          </p>
        </div>

        <Dialog open={isOnboardingOpen} onOpenChange={setIsOnboardingOpen}>
          <DialogTrigger asChild>
            <Button className="w-full md:w-auto bg-jagamn-primary text-white manrope-bold h-12 md:h-14 px-8 rounded-xl gap-2 shadow-lg hover:bg-jagamn-primary/90 transition-all hover:scale-[1.02]">
              <UserPlus className="w-5 h-5" />
              Add New Staff Member
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[95vw] lg:w-full lg:max-w-5xl p-0 overflow-hidden rounded-2xl border-0 shadow-2xl bg-[#F8F9FA] h-[85vh] max-h-[850px] overflow-y-scroll">
            <DialogHeader className="sr-only">
              <DialogTitle>Personnel Onboarding</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col md:flex-row h-full">
              {/* Left Side: Form */}
              <div className="flex-[1.8] p-8 lg:p-12 bg-white overflow-y-auto custom-scrollbar">
                <div className="mb-10 text-center md:text-left">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                    STAFF MANAGEMENT{" "}
                    <span className="mx-1 text-gray-300">›</span> ADD NEW STAFF
                    MEMBER
                  </p>
                  <h2 className="manrope-bold text-2xl md:text-3xl text-jagamn-primary mb-2">
                    Personnel Onboarding
                  </h2>
                  <p className="text-gray-400 text-xs md:text-sm font-medium">
                    Enroll a new member of the Palace Suite staff into the
                    digital management system.
                  </p>
                </div>

                <div className="space-y-10">
                  {/* Personal Information */}
                  <div className="space-y-6">
                    <div className="flex items-center justify-center md:justify-start gap-3 text-[#E8924A]">
                      <div className="w-8 h-8 rounded-lg bg-[#FFF1E6] flex items-center justify-center">
                        <UserCircle className="w-5 h-5" />
                      </div>
                      <h3 className="manrope-bold text-base text-jagamn-primary tracking-tight">
                        Personal Information
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
                      <div className="space-y-1.5">
                        <Label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                          Full Name
                        </Label>
                        <Input
                          placeholder="e.g. Julian Montgomery"
                          className="h-11 bg-transparent border-0 border-b border-gray-200 rounded-none px-0 text-sm font-semibold focus-visible:ring-0 focus-visible:border-jagamn-tertiary transition-all"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                          Email Address
                        </Label>
                        <Input
                          placeholder="j.montgomery@palacesuite.com"
                          className="h-11 bg-transparent border-0 border-b border-gray-200 rounded-none px-0 text-sm font-semibold focus-visible:ring-0 focus-visible:border-jagamn-tertiary transition-all"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                          Phone Number
                        </Label>
                        <Input
                          placeholder="+44 20 7946 0958"
                          className="h-11 bg-transparent border-0 border-b border-gray-200 rounded-none px-0 text-sm font-semibold focus-visible:ring-0 focus-visible:border-jagamn-tertiary transition-all"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                          Position/Title
                        </Label>
                        <Input
                          placeholder="Senior Concierge"
                          className="h-11 bg-transparent border-0 border-b border-gray-200 rounded-none px-0 text-sm font-semibold focus-visible:ring-0 focus-visible:border-jagamn-tertiary transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Administrative Assignment */}
                  <div className="space-y-6">
                    <div className="flex items-center justify-center md:justify-start gap-3 text-[#E8924A]">
                      <div className="w-8 h-8 rounded-lg bg-[#FFF1E6] flex items-center justify-center">
                        <Briefcase className="w-5 h-5" />
                      </div>
                      <h3 className="manrope-bold text-base text-jagamn-primary tracking-tight">
                        Administrative Assignment
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
                      <div className="space-y-1.5">
                        <Label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                          Department
                        </Label>
                        <Select>
                          <SelectTrigger className="h-11 bg-transparent border-0 border-b border-gray-200 rounded-none px-0 text-sm font-semibold focus:ring-0 focus:border-jagamn-tertiary">
                            <SelectValue placeholder="Select Department" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="front-desk">
                              Front Desk
                            </SelectItem>
                            <SelectItem value="kitchen">Kitchen</SelectItem>
                            <SelectItem value="housekeeping">
                              Housekeeping
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                          Role Assignment
                        </Label>
                        <Select>
                          <SelectTrigger className="h-11 bg-transparent border-0 border-b border-gray-200 rounded-none px-0 text-sm font-semibold focus:ring-0 focus:border-jagamn-tertiary">
                            <SelectValue placeholder="Select Role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="staff">Staff</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                          Base Monthly Salary
                        </Label>
                        <div className="relative">
                          <span className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                            $
                          </span>
                          <Input
                            placeholder="4,500.00"
                            className="h-11 bg-transparent border-0 border-b border-gray-200 rounded-none pl-4 pr-0 text-sm font-semibold focus-visible:ring-0 focus-visible:border-jagamn-tertiary transition-all"
                          />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                          Hire Date
                        </Label>
                        <Input
                          placeholder="mm/dd/yyyy"
                          className="h-11 bg-transparent border-0 border-b border-gray-200 rounded-none px-0 text-sm font-semibold focus-visible:ring-0 focus-visible:border-jagamn-tertiary transition-all"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-end gap-6 mt-16">
                  <Button
                    variant="ghost"
                    onClick={() => setIsOnboardingOpen(false)}
                    className="w-full sm:w-auto h-12 px-6 text-gray-500 font-bold uppercase tracking-widest text-[11px] hover:bg-transparent hover:text-red-500 transition-colors"
                  >
                    CANCEL
                  </Button>
                  <Button className="w-full sm:w-auto h-12 px-12 bg-[#0D2137] hover:bg-[#0D2137]/90 text-white manrope-bold rounded-lg shadow-lg transition-all">
                    Complete Enrollment
                  </Button>
                </div>
              </div>

              {/* Right Side: Registry Guide */}
              <div className="flex-1 bg-[#F1F3F5] p-10 border-l border-gray-100 hidden md:flex flex-col justify-between">
                <div>
                  <div className="bg-[#0D2137] rounded-xl p-8 text-white shadow-xl mb-10 relative overflow-hidden">
                    <div className="relative z-10">
                      <h3 className="manrope-bold text-xl mb-3">
                        Registry Guide
                      </h3>
                      <p className="text-[11px] text-gray-400 leading-relaxed font-medium">
                        Credentials will be generated and dispatched
                        automatically via secure portal.
                      </p>
                      <div className="mt-8 flex items-center gap-3 bg-white/5 p-4 rounded-xl border border-white/10">
                        <div className="p-2 bg-[#E8924A] rounded-lg shadow-lg shadow-[#E8924A]/20">
                          <TrendingUp className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-[9px] font-black uppercase tracking-[0.15em] text-gray-100">
                          ONBOARDING PROTOCOLS ACTIVE
                        </span>
                      </div>
                    </div>
                    {/* Decorative element */}
                    <div className="absolute top-[-20%] right-[-20%] w-48 h-48 bg-jagamn-tertiary/10 rounded-full blur-3xl" />
                  </div>

                  <div className="space-y-6">
                    <p className="text-[10px] font-black text-jagamn-primary uppercase tracking-[0.2em]">
                      Compliance Checklist
                    </p>
                    <div className="space-y-4">
                      {[
                        { label: "Background check verified.", done: true },
                        { label: "Digital keycard enabled.", done: true },
                        { label: "Safety training pending.", done: false },
                      ].map((item, i) => (
                        <div key={i} className="flex items-center gap-4">
                          <div
                            className={cn(
                              "w-5 h-5 rounded-full flex items-center justify-center border",
                              item.done
                                ? "bg-green-50 border-green-200 text-green-600"
                                : "bg-white border-gray-200 text-gray-300",
                            )}
                          >
                            {item.done ? (
                              <CheckCircle2 className="w-3 h-3" />
                            ) : (
                              <div className="w-2.5 h-2.5 border border-gray-200 rounded-full" />
                            )}
                          </div>
                          <span
                            className={cn(
                              "text-[13px] font-medium tracking-tight",
                              item.done
                                ? "text-jagamn-primary"
                                : "text-gray-400",
                            )}
                          >
                            {item.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="rounded-xl overflow-hidden shadow-xl border-4 border-white grayscale">
                    <img
                      src="/images/classic-heritage.png"
                      alt="Palace Suite"
                      className="w-full h-32 object-cover"
                    />
                  </div>
                  <p className="text-[10px] text-gray-400 italic text-center leading-relaxed font-medium px-4">
                    "Service is the soul of the Palace Suite. Excellence is our
                    only standard."
                  </p>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
        <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-100 border-l-4 border-l-jagamn-tertiary shadow-sm hover:shadow-xl transition-all group">
          <div className="flex items-center justify-between mb-6 md:mb-8">
            <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">
              Total Personnel
            </p>
            <Users className="w-5 h-5 md:w-6 md:h-6 text-gray-200 group-hover:text-jagamn-tertiary transition-colors" />
          </div>
          <h2 className="manrope-bold text-3xl md:text-5xl text-jagamn-primary mb-3">
            128
          </h2>
          <p className="text-[10px] md:text-[11px] text-jagamn-tertiary font-black uppercase tracking-widest">
            +4 NEW ENROLLMENTS
          </p>
        </div>

        <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-100 border-l-4 border-l-jagamn-primary shadow-sm hover:shadow-xl transition-all group">
          <div className="flex items-center justify-between mb-6 md:mb-8">
            <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">
              Departmental Split
            </p>
            <PieChart className="w-5 h-5 md:w-6 md:h-6 text-gray-200 group-hover:text-jagamn-primary transition-colors" />
          </div>
          <div className="flex gap-1.5 h-8 md:h-10 mb-5">
            <div className="flex-1 bg-jagamn-primary rounded-lg shadow-inner" />
            <div className="flex-[0.6] bg-jagamn-tertiary shadow-inner" />
            <div className="flex-[0.3] bg-slate-100 rounded-lg shadow-inner" />
          </div>
          <p className="text-[10px] md:text-[11px] text-gray-400 font-bold uppercase tracking-widest">
            F&B holding 42% share
          </p>
        </div>

        <div className="bg-jagamn-primary p-6 md:p-8 rounded-2xl text-white shadow-2xl relative overflow-hidden group hover:scale-[1.01] transition-transform">
          <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6 md:mb-8">
            Monthly Payroll Forecast
          </p>
          <h2 className="manrope-bold text-3xl md:text-5xl mb-6">$242,500</h2>
          <div className="flex items-center gap-4">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map((i) => (
                <Avatar
                  key={i}
                  className="w-7 h-7 md:w-8 md:h-8 border-4 border-jagamn-primary"
                >
                  <AvatarFallback className="bg-jagamn-tertiary text-[9px] md:text-[10px] font-black">
                    ST
                  </AvatarFallback>
                </Avatar>
              ))}
            </div>
            <p className="text-[10px] md:text-[11px] text-gray-400 font-black uppercase tracking-widest">
              Next Run: Oct 28
            </p>
          </div>
          <div className="absolute bottom-[-20%] right-[-10%] w-40 h-40 bg-white/5 rounded-full blur-2xl" />
        </div>
      </div>

      {/* ── Toolbar & View Switcher ─────────────────── */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-white/50 backdrop-blur-sm p-4 rounded-2xl border border-gray-100">
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full xl:w-auto">
          <Select defaultValue="all">
            <SelectTrigger className="h-12 w-full sm:w-[220px] bg-white border-gray-100 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] shadow-sm focus:ring-jagamn-tertiary/20">
              <SelectValue placeholder="All Departments" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              <SelectItem value="front">Front Desk</SelectItem>
              <SelectItem value="kitchen">Kitchen</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="name">
            <SelectTrigger className="h-12 w-full sm:w-[220px] bg-white border-gray-100 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] shadow-sm focus:ring-jagamn-tertiary/20">
              <SelectValue placeholder="Sort by Name" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Sort by Name</SelectItem>
              <SelectItem value="date">Sort by Hire Date</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-4 w-full xl:w-auto">
          <Button
            onClick={handleExportCSV}
            variant="ghost"
            className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] gap-2.5 h-12 px-4 sm:px-6"
          >
            <Download className="w-4 h-4" /> <span className="hidden sm:inline">Export CSV</span><span className="sm:hidden">Export</span>
          </Button>
          <div className="flex bg-gray-100/80 p-1.5 rounded-[1.25rem] shadow-inner shrink-0">
            <button
              onClick={() => setViewMode("grid")}
              className={cn(
                "p-2.5 rounded-xl transition-all",
                viewMode === "grid"
                  ? "bg-white text-jagamn-tertiary shadow-md"
                  : "text-gray-400 hover:text-jagamn-primary",
              )}
            >
              <LayoutGrid className="w-4.5 h-4.5" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={cn(
                "p-2.5 rounded-xl transition-all",
                viewMode === "list"
                  ? "bg-white text-jagamn-tertiary shadow-md"
                  : "text-gray-400 hover:text-jagamn-primary",
              )}
            >
              <List className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Directory Content ────────────────────────── */}
      {viewMode === "list" ? (
        <div className="bg-white rounded-xl border border-gray-100 border-l-4 border-l-jagamn-primary shadow-sm overflow-hidden overflow-x-auto">
          <table className="w-full min-w-[950px]">
            <thead className="bg-jagamn-neutral/30">
              <tr>
                <th className="px-6 py-5 text-left text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">
                  Staff Member
                </th>
                <th className="px-6 py-5 text-left text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">
                  Department
                </th>
                <th className="px-6 py-5 text-left text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">
                  Position
                </th>
                <th className="px-6 py-5 text-left text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">
                  Role
                </th>
                <th className="px-6 py-5 text-left text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">
                  Hire Date
                </th>
                <th className="px-6 py-5 text-left text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">
                  Base Salary
                </th>
                <th className="px-6 py-5 text-right text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {STAFF_DATA.map((staff) => (
                <tr
                  key={staff.id}
                  className="group hover:bg-jagamn-neutral/40 transition-colors"
                >
                  <td className="px-6 py-4.5">
                    <div className="flex items-center gap-4">
                      <Avatar className="w-12 h-12 border-4 border-white shadow-md">
                        <AvatarFallback
                          className={cn(
                            "text-white text-xs font-black",
                            staff.color,
                          )}
                        >
                          {staff.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="manrope-bold text-[15px] text-jagamn-primary group-hover:text-jagamn-tertiary transition-colors">
                          {staff.name}
                        </p>
                        <p className="text-[11px] text-gray-400 font-bold tracking-tight uppercase">
                          {staff.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4.5 text-sm font-bold text-jagamn-primary/70 tracking-tight">
                    {staff.dept}
                  </td>
                  <td className="px-6 py-4.5 text-sm font-bold text-jagamn-primary/70 tracking-tight">
                    {staff.position}
                  </td>
                  <td className="px-6 py-4.5">
                    <RoleBadge role={staff.role} />
                  </td>
                  <td className="px-6 py-4.5 text-[13px] font-black text-gray-400 uppercase tracking-widest">
                    {staff.hireDate}
                  </td>
                  <td className="px-6 py-4.5 text-[15px] manrope-bold text-jagamn-primary">
                    {staff.salary}
                  </td>
                      <td className="px-6 py-4.5 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="h-10 w-10 inline-flex items-center justify-center text-jagamn-primary hover:text-jagamn-tertiary transition-all bg-gray-50 hover:bg-gray-100 rounded-xl border border-gray-100 shadow-sm">
                              <MoreHorizontal className="w-5 h-5" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48 p-2 rounded-xl border-gray-100 shadow-xl">
                            <DropdownMenuItem onClick={() => handleViewProfile(staff.id)} className="flex items-center gap-2 py-3 px-4 rounded-lg cursor-pointer hover:bg-gray-50 text-[11px] font-black uppercase tracking-widest text-gray-500">
                              <Eye className="w-4 h-4" /> View Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditClick(staff)} className="flex items-center gap-2 py-3 px-4 rounded-lg cursor-pointer hover:bg-gray-50 text-[11px] font-black uppercase tracking-widest text-jagamn-primary">
                              <Edit2 className="w-4 h-4" /> Edit Details
                            </DropdownMenuItem>
                            <div className="h-px bg-gray-50 my-1" />
                            <DropdownMenuItem className="flex items-center gap-2 py-3 px-4 rounded-lg cursor-pointer hover:bg-red-50 text-[11px] font-black uppercase tracking-widest text-red-500">
                              <Trash2 className="w-4 h-4" /> Deactivate
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {STAFF_DATA.map((staff) => (
            <div
              key={staff.id}
              className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden group hover:shadow-2xl transition-all duration-700 hover:-translate-y-2"
            >
              <div
                className={cn(
                  "h-32 relative transition-all duration-700",
                  staff.color,
                )}
              >
                <div className="absolute -bottom-12 left-8">
                  <div className="w-24 h-24 rounded-xl bg-white p-1.5 shadow-xl transition-transform group-hover:scale-105 duration-700">
                    <Avatar className="w-full h-full rounded-lg">
                      <AvatarFallback
                        className={cn(
                          "text-white manrope-bold text-2xl",
                          staff.color,
                        )}
                      >
                        {staff.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </div>
              </div>
              <div className="pt-16 pb-10 px-8 space-y-8">
                <div>
                  <h3 className="manrope-bold text-2xl text-jagamn-primary group-hover:text-jagamn-tertiary transition-colors">
                    {staff.name}
                  </h3>
                  <p className="text-[11px] text-gray-400 font-bold tracking-widest uppercase mt-2">
                    {staff.email}
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-4 text-jagamn-primary/60">
                    <div className="p-2 bg-gray-50 rounded-lg">
                      <Briefcase className="w-4 h-4 text-gray-400" />
                    </div>
                    <span className="text-xs font-bold tracking-tight">
                      {staff.dept}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-jagamn-primary/60">
                    <div className="p-2 bg-gray-50 rounded-lg">
                      <UserCircle className="w-4 h-4 text-gray-400" />
                    </div>
                    <span className="text-xs font-bold tracking-tight">
                      {staff.position}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                  <RoleBadge role={staff.role} />
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="h-10 w-10 flex items-center justify-center text-jagamn-primary hover:text-jagamn-tertiary transition-all bg-gray-50 hover:bg-gray-100 rounded-xl border border-gray-100 shadow-sm">
                        <MoreHorizontal className="w-5 h-5" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 p-2 rounded-xl border-gray-100 shadow-xl">
                      <DropdownMenuItem onClick={() => handleViewProfile(staff.id)} className="flex items-center gap-2 py-3 px-4 rounded-lg cursor-pointer hover:bg-gray-50 text-[11px] font-black uppercase tracking-widest text-gray-500">
                        <Eye className="w-4 h-4" /> View Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEditClick(staff)} className="flex items-center gap-2 py-3 px-4 rounded-lg cursor-pointer hover:bg-gray-50 text-[11px] font-black uppercase tracking-widest text-jagamn-primary">
                        <Edit2 className="w-4 h-4" /> Edit Details
                      </DropdownMenuItem>
                      <div className="h-px bg-gray-50 my-1" />
                      <DropdownMenuItem className="flex items-center gap-2 py-3 px-4 rounded-lg cursor-pointer hover:bg-red-50 text-[11px] font-black uppercase tracking-widest text-red-500">
                        <Trash2 className="w-4 h-4" /> Deactivate
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Edit Staff Modal ───────────────────────── */}
      <StaffEditModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        staffName={selectedStaff?.name}
        staffEmail={selectedStaff?.email}
        staffAvatar={selectedStaff?.name?.split(" ").map((n: any) => n[0]).join("")}
      />
    </div>
  );
}
