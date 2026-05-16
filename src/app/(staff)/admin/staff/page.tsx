"use client";

import React, { useState, useEffect, useMemo } from "react";
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
  Camera,
  X,
  Calendar,
  Search,
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
  const [deptFilter, setDeptFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("name");
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState<{ from: string; to: string }>({
    from: "",
    to: "",
  });
  const router = useRouter();

  // Global Search Integration
  useEffect(() => {
    const handleGlobalSearch = (e: any) => {
      setSearchQuery(e.detail || "");
    };
    window.addEventListener("jagamn-global-search", handleGlobalSearch);
    return () =>
      window.removeEventListener("jagamn-global-search", handleGlobalSearch);
  }, []);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPhotoPreview(url);
    }
  };

  const removePhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPhotoPreview(null);
  };

  const handleEditClick = (staff: any) => {
    setSelectedStaff(staff);
    setIsEditModalOpen(true);
  };

  const handleViewProfile = (id: string) => {
    router.push(`/admin/staff/${id}`);
  };

  const filteredStaff = useMemo(() => {
    let result = [...STAFF_DATA];

    // Search Query (All Columns)
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.id.toLowerCase().includes(q) ||
          s.email.toLowerCase().includes(q) ||
          s.position.toLowerCase().includes(q) ||
          s.role.toLowerCase().includes(q) ||
          s.dept.toLowerCase().includes(q),
      );
    }

    // Dept Filter
    if (deptFilter !== "all") {
      result = result.filter((s) => s.dept === deptFilter);
    }

    // Date Filter
    if (dateFilter.from || dateFilter.to) {
      result = result.filter((s) => {
        const hireDate = new Date(s.hireDate).getTime();
        const from = dateFilter.from
          ? new Date(dateFilter.from).getTime()
          : -Infinity;
        const to = dateFilter.to ? new Date(dateFilter.to).getTime() : Infinity;
        return hireDate >= from && (to ? hireDate <= to : true);
      });
    }

    result.sort((a, b) => {
      if (sortOrder === "name") {
        return a.name.localeCompare(b.name);
      } else {
        return new Date(b.hireDate).getTime() - new Date(a.hireDate).getTime();
      }
    });

    return result;
  }, [deptFilter, sortOrder, searchQuery, dateFilter]);

  const handleExportCSV = () => {
    const headers = [
      "Staff ID",
      "Name",
      "Email",
      "Department",
      "Position",
      "Role",
      "Hire Date",
      "Salary",
    ];
    const rows = filteredStaff.map((staff) => [
      staff.id,
      staff.name,
      staff.email,
      staff.dept,
      staff.position,
      staff.role,
      staff.hireDate,
      staff.salary,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `Staff_Directory_${new Date().toLocaleDateString()}.csv`,
    );
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
              {/* Onboarding form remains same... */}
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
                {/* Form fields... */}
                <div className="space-y-10">
                  <div className="space-y-6">
                    <div className="flex items-center justify-center md:justify-start gap-3 text-[#E8924A]">
                      <div className="w-8 h-8 rounded-lg bg-[#FFF1E6] flex items-center justify-center">
                        <Camera className="w-5 h-5" />
                      </div>
                      <h3 className="manrope-bold text-base text-jagamn-primary tracking-tight">
                        Staff Photo Presentation
                      </h3>
                    </div>
                    <div className="flex flex-col md:flex-row gap-8 items-center">
                      <div className="w-full md:w-48 aspect-square rounded-2xl border-2 border-dashed border-gray-200 bg-[#F8F9FA] flex flex-col items-center justify-center gap-3 text-center p-4 group hover:border-[#E8924A] transition-all cursor-pointer relative overflow-hidden">
                        <input
                          type="file"
                          id="staff-photo-upload"
                          onChange={handlePhotoChange}
                          className="hidden"
                          accept="image/*"
                        />
                        <label
                          htmlFor="staff-photo-upload"
                          className="absolute inset-0 cursor-pointer flex flex-col items-center justify-center gap-2"
                        >
                          {photoPreview ? (
                            <>
                              <img
                                src={photoPreview}
                                className="absolute inset-0 w-full h-full object-cover"
                                alt="Preview"
                              />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <Plus className="w-8 h-8 text-white" />
                              </div>
                              <button
                                onClick={removePhoto}
                                className="absolute top-2 right-2 bg-white p-1.5 rounded-lg shadow-lg text-red-500 z-10"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </>
                          ) : (
                            <>
                              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm">
                                <Plus className="w-5 h-5 text-slate-400" />
                              </div>
                              <p className="manrope-bold text-[10px] text-slate-400 uppercase tracking-widest">
                                Upload Photo
                              </p>
                            </>
                          )}
                        </label>
                      </div>
                    </div>
                  </div>
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
          <div className="absolute bottom-[-20%] right-[-10%] w-40 h-40 bg-white/5 rounded-full blur-2xl" />
        </div>
      </div>

      {/* ── Toolbar & Enhanced Filter ─────────────────── */}
      <div className="flex flex-col space-y-4 xl:space-y-0 xl:flex-row xl:items-center justify-between gap-4 bg-white/50 backdrop-blur-sm p-4 rounded-2xl border border-gray-100">
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-4 w-full xl:w-auto justify-start">
          <Select value={deptFilter} onValueChange={setDeptFilter}>
            <SelectTrigger className="h-12 w-full sm:w-[200px] bg-white border-gray-100 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] shadow-sm">
              <SelectValue placeholder="All Departments" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              <SelectItem value="Guest Relations">Guest Relations</SelectItem>
              <SelectItem value="Food & Beverage">Food & Beverage</SelectItem>
              <SelectItem value="Inventory">Inventory</SelectItem>
              <SelectItem value="Security">Security</SelectItem>
            </SelectContent>
          </Select>
          
          {/* Date Filter */}
          <div className="flex items-center gap-2 bg-white border border-gray-100 rounded-xl p-1 shadow-sm h-12 w-full sm:w-auto px-3">
            <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
            <input 
              type="date" 
              value={dateFilter.from}
              onChange={(e) => setDateFilter({...dateFilter, from: e.target.value})}
              className="bg-transparent text-[10px] font-bold text-jagamn-primary outline-none w-[110px]"
            />
            <ArrowRight className="w-3 h-3 text-gray-300 shrink-0" />
            <input 
              type="date" 
              value={dateFilter.to}
              onChange={(e) => setDateFilter({...dateFilter, to: e.target.value})}
              className="bg-transparent text-[10px] font-bold text-jagamn-primary outline-none w-[110px]"
            />
            {(dateFilter.from || dateFilter.to) && (
              <button onClick={() => setDateFilter({from: "", to: ""})} className="ml-2 text-gray-400 hover:text-red-500 shrink-0">
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-4 w-full xl:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search personnel..."
              className="h-12 bg-white border-gray-100 rounded-xl pl-12 text-[10px] font-bold uppercase tracking-widest shadow-sm"
            />
          </div>
          <Button
            onClick={handleExportCSV}
            variant="ghost"
            className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] gap-2.5 h-12 px-6"
          >
            <Download className="w-4 h-4" /> Export
          </Button>
          <div className="flex bg-gray-100/80 p-1.5 rounded-[1.25rem] shadow-inner shrink-0">
            <button
              onClick={() => setViewMode("grid")}
              className={cn(
                "p-2.5 rounded-xl",
                viewMode === "grid"
                  ? "bg-white text-jagamn-tertiary shadow-md"
                  : "text-gray-400",
              )}
            >
              <LayoutGrid className="w-4.5 h-4.5" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={cn(
                "p-2.5 rounded-xl",
                viewMode === "list"
                  ? "bg-white text-jagamn-tertiary shadow-md"
                  : "text-gray-400",
              )}
            >
              <List className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Directory Table/Grid ─────────────────────── */}
      {viewMode === "list" ? (
        <div className="bg-white rounded-xl border border-gray-100 border-l-4 border-l-jagamn-primary shadow-sm overflow-hidden overflow-x-auto">
          <table className="w-full min-w-[950px]">
            <thead className="bg-jagamn-neutral/30">
              <tr>
                <th className="px-6 py-5 text-left text-[11px] font-black text-gray-400 uppercase tracking-widest">
                  Staff Member
                </th>
                <th className="px-6 py-5 text-left text-[11px] font-black text-gray-400 uppercase tracking-widest">
                  Dept
                </th>
                <th className="px-6 py-5 text-left text-[11px] font-black text-gray-400 uppercase tracking-widest">
                  Position
                </th>
                <th className="px-6 py-5 text-left text-[11px] font-black text-gray-400 uppercase tracking-widest">
                  Role
                </th>
                <th className="px-6 py-5 text-left text-[11px] font-black text-gray-400 uppercase tracking-widest">
                  Hire Date
                </th>
                <th className="px-6 py-5 text-right text-[11px] font-black text-gray-400 uppercase tracking-widest">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredStaff.map((staff) => (
                <tr
                  key={staff.id}
                  className="group hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4.5 flex items-center gap-4">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback
                        className={cn(
                          "text-white font-black text-[10px]",
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
                      <p className="manrope-bold text-sm text-jagamn-primary">
                        {staff.name}
                      </p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase">
                        {staff.id}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4.5 text-xs font-bold text-gray-500">
                    {staff.dept}
                  </td>
                  <td className="px-6 py-4.5 text-xs font-bold text-gray-500">
                    {staff.position}
                  </td>
                  <td className="px-6 py-4.5">
                    <RoleBadge role={staff.role} />
                  </td>
                  <td className="px-6 py-4.5 text-[11px] font-black text-gray-400 uppercase">
                    {staff.hireDate}
                  </td>
                  <td className="px-6 py-4.5 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="p-2 hover:bg-gray-100 rounded-lg">
                          <MoreHorizontal className="w-5 h-5 text-gray-400" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="w-48 rounded-xl"
                      >
                        <DropdownMenuItem
                          onClick={() => handleViewProfile(staff.id)}
                          className="text-[10px] font-black uppercase tracking-widest gap-2 py-3 px-4"
                        >
                          <Eye className="w-4 h-4" /> View Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleEditClick(staff)}
                          className="text-[10px] font-black uppercase tracking-widest gap-2 py-3 px-4"
                        >
                          <Edit2 className="w-4 h-4" /> Edit Details
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
              {filteredStaff.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-20 text-center text-gray-400 manrope-bold italic"
                  >
                    No personnel matches found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {filteredStaff.map((staff) => (
            <div
              key={staff.id}
              className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden group hover:shadow-2xl transition-all duration-500"
            >
              <div className={cn("h-24", staff.color)} />
              <div className="p-6 pt-12 relative">
                <Avatar className="w-20 h-20 absolute -top-10 left-6 border-4 border-white shadow-lg">
                  <AvatarFallback
                    className={cn("text-white font-black", staff.color)}
                  >
                    {staff.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-4">
                  <div>
                    <h4 className="manrope-bold text-lg text-jagamn-primary">
                      {staff.name}
                    </h4>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      {staff.position}
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <RoleBadge role={staff.role} />
                    <span className="text-[10px] font-bold text-gray-300 uppercase">
                      {staff.id}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedStaff && (
        <StaffEditModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedStaff(null);
          }}
          staff={selectedStaff}
          onSave={(updated) => console.log("Save", updated)}
        />
      )}
    </div>
  );
}
