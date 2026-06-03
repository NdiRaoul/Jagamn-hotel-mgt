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
  Download,
  PieChart,
  Eye,
  Camera,
  X,
  Calendar,
  Search,
  Copy,
  Check,
  Send,
  Loader2,
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
import { formatMoney } from "@/lib/currency";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import type { Staff } from "@/types/database";

const ROLE_COLORS: Record<string, string> = {
  owner: "bg-[#F3F7FF] text-[#2E4FB8]",
  admin: "bg-[#E8EFFE] text-[#4F7BDD]",
  manager: "bg-[#E8EFFE] text-[#4F7BDD]",
  reception: "bg-[#EAF7ED] text-[#2E7D32]",
  kitchen: "bg-[#EAEAEA] text-[#606060]",
  storekeeper: "bg-[#FFF1E6] text-[#E8924A]",
};

const RoleBadge = ({ role }: { role: string }) => (
  <Badge
    variant="outline"
    className={cn(
      "text-[9px] font-black tracking-widest px-2.5 py-1 border-0 rounded-md",
      ROLE_COLORS[role] ?? "bg-gray-100 text-gray-600",
    )}
  >
    {role.toUpperCase()}
  </Badge>
);

const AVATAR_COLORS = [
  "bg-jagamn-primary",
  "bg-jagamn-tertiary",
  "bg-slate-500",
  "bg-indigo-600",
];

interface Props {
  staff: Staff[];
  error: string | null;
}

interface AddStaffForm {
  full_name: string;
  email: string;
  phone: string;
  department: string;
  position: string;
  role: string;
  salary: string;
  hire_date: string;
  password: string;
}

const EMPTY_FORM: AddStaffForm = {
  full_name: "",
  email: "",
  phone: "",
  department: "",
  position: "",
  role: "",
  salary: "",
  hire_date: "",
  password: "",
};

export default function StaffClient({ staff, error }: Props) {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [editModal, setEditModal] = useState<{
    open: boolean;
    member: Staff | null;
  }>({ open: false, member: null });
  const [deptFilter, setDeptFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("name");
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState<{ from: string; to: string }>({
    from: "",
    to: "",
  });

  // Add-staff form state
  const [form, setForm] = useState<AddStaffForm>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [createdCredentials, setCreatedCredentials] = useState<{
    staff: Staff;
    tempPassword?: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    const handleGlobalSearch = (e: CustomEvent<string>) => {
      setSearchQuery(e.detail || "");
    };
    window.addEventListener(
      "jagamn-global-search",
      handleGlobalSearch as EventListener,
    );
    return () =>
      window.removeEventListener(
        "jagamn-global-search",
        handleGlobalSearch as EventListener,
      );
  }, []);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setPhotoPreview(URL.createObjectURL(file));
  };

  const departments = useMemo(() => {
    const depts = new Set(
      staff.map((s) => s.department).filter(Boolean) as string[],
    );
    return Array.from(depts).sort();
  }, [staff]);

  const positions = useMemo(() => {
    const pos = new Set(
      staff.map((s) => s.position).filter(Boolean) as string[],
    );
    return Array.from(pos).sort();
  }, [staff]);

  const filteredStaff = useMemo(() => {
    let result = [...staff];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (s) =>
          s.full_name.toLowerCase().includes(q) ||
          (s.staff_code || "").toLowerCase().includes(q) ||
          s.email.toLowerCase().includes(q) ||
          (s.position || "").toLowerCase().includes(q) ||
          s.role.toLowerCase().includes(q) ||
          (s.department || "").toLowerCase().includes(q),
      );
    }

    if (deptFilter !== "all") {
      result = result.filter((s) => s.department === deptFilter);
    }

    if (dateFilter.from || dateFilter.to) {
      result = result.filter((s) => {
        const hireDate = s.hire_date ? new Date(s.hire_date).getTime() : 0;
        const from = dateFilter.from
          ? new Date(dateFilter.from).getTime()
          : -Infinity;
        const to = dateFilter.to ? new Date(dateFilter.to).getTime() : Infinity;
        return hireDate >= from && hireDate <= to;
      });
    }

    result.sort((a, b) => {
      if (sortOrder === "name") return a.full_name.localeCompare(b.full_name);
      const aDate = a.hire_date ? new Date(a.hire_date).getTime() : 0;
      const bDate = b.hire_date ? new Date(b.hire_date).getTime() : 0;
      return bDate - aDate;
    });

    return result;
  }, [staff, deptFilter, sortOrder, searchQuery, dateFilter]);

  const handleExportCSV = () => {
    const headers = [
      "Staff Code",
      "Name",
      "Email",
      "Department",
      "Position",
      "Role",
      "Hire Date",
      "Status",
    ];
    const rows = filteredStaff.map((s) => [
      s.staff_code || "",
      s.full_name,
      s.email,
      s.department || "",
      s.position || "",
      s.role,
      s.hire_date || "",
      s.status,
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute(
      "download",
      `Staff_Directory_${new Date().toLocaleDateString()}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAddStaffSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          salary: form.salary ? parseFloat(form.salary) : 0,
          hire_date: form.hire_date || null,
          password: form.password || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error || "Failed to create staff member");
        return;
      }
      setCreatedCredentials({
        staff: data.staff,
        tempPassword: data.tempPassword,
      });
      setForm(EMPTY_FORM);
      setPhotoPreview(null);
      router.refresh();
    } catch {
      setFormError("Network error — please try again");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyCredentials = () => {
    if (!createdCredentials) return;
    const text = `Staff: ${createdCredentials.staff.full_name}\nEmail: ${createdCredentials.staff.email}\nTemp Password: ${createdCredentials.tempPassword ?? "(provided by staff)"}`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleSendCredentials = async () => {
    if (!createdCredentials) return;
    setSending(true);
    try {
      await fetch(
        `/api/staff/${createdCredentials.staff.id}/send-credentials`,
        {
          method: "POST",
        },
      );
      setSent(true);
    } finally {
      setSending(false);
    }
  };

  const closeOnboarding = () => {
    setIsOnboardingOpen(false);
    setCreatedCredentials(null);
    setFormError(null);
    setForm(EMPTY_FORM);
    setPhotoPreview(null);
    setSent(false);
    setCopied(false);
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
          {error && (
            <p className="text-red-500 text-sm mt-2 font-medium">{error}</p>
          )}
        </div>

        <Dialog open={isOnboardingOpen} onOpenChange={setIsOnboardingOpen}>
          <DialogTrigger asChild>
            <Button className="w-full md:w-auto bg-jagamn-primary text-white manrope-bold h-12 md:h-14 px-8 rounded-xl gap-2 shadow-lg hover:bg-jagamn-primary/90 transition-all hover:scale-[1.02]">
              <Plus className="w-5 h-5" />
              Add New Staff Member
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[95vw] lg:w-full lg:max-w-4xl p-0 overflow-hidden rounded-2xl border-0 shadow-2xl bg-[#F8F9FA] max-h-[90vh] overflow-y-auto">
            <DialogHeader className="sr-only">
              <DialogTitle>Personnel Onboarding</DialogTitle>
            </DialogHeader>

            {createdCredentials ? (
              /* ── Credentials card shown after successful creation ── */
              <div className="p-10 space-y-8">
                <div>
                  <p className="text-[10px] font-black text-jagamn-tertiary uppercase tracking-widest mb-2">
                    Staff Management › Onboarding Complete
                  </p>
                  <h2 className="manrope-bold text-3xl text-jagamn-primary">
                    Account Created
                  </h2>
                  <p className="text-gray-400 text-sm mt-1">
                    Share these credentials securely with the new team member.
                  </p>
                </div>

                <div className="bg-jagamn-primary rounded-2xl p-8 text-white space-y-4">
                  <div className="flex items-center gap-4 mb-6">
                    <Avatar className="w-14 h-14 border-2 border-white/20">
                      <AvatarFallback className="bg-jagamn-tertiary text-white manrope-bold">
                        {createdCredentials.staff.full_name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="manrope-bold text-xl">
                        {createdCredentials.staff.full_name}
                      </p>
                      <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">
                        {createdCredentials.staff.staff_code}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Email</span>
                      <span className="font-bold">
                        {createdCredentials.staff.email}
                      </span>
                    </div>
                    {createdCredentials.tempPassword && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Temp Password</span>
                        <span className="font-mono font-bold text-jagamn-tertiary">
                          {createdCredentials.tempPassword}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <Button
                    onClick={handleCopyCredentials}
                    variant="outline"
                    className="flex-1 h-12 rounded-xl border-gray-200 gap-2"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                    {copied ? "Copied!" : "Copy Credentials"}
                  </Button>
                  <Button
                    onClick={handleSendCredentials}
                    disabled={sending || sent}
                    className="flex-1 h-12 rounded-xl bg-jagamn-primary gap-2"
                  >
                    {sending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : sent ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    {sent ? "Email Sent!" : "Send to Email"}
                  </Button>
                  <Button
                    onClick={closeOnboarding}
                    variant="ghost"
                    className="h-12 px-6 text-gray-400 hover:text-jagamn-primary"
                  >
                    Close
                  </Button>
                </div>
              </div>
            ) : (
              /* ── Add staff form ── */
              <form onSubmit={handleAddStaffSubmit}>
                <div className="p-8 lg:p-12 space-y-8">
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                      Staff Management › Add New Staff Member
                    </p>
                    <h2 className="manrope-bold text-2xl md:text-3xl text-jagamn-primary mb-2">
                      Personnel Onboarding
                    </h2>
                    <p className="text-gray-400 text-sm font-medium">
                      Enroll a new team member into the Palace management
                      system.
                    </p>
                  </div>

                  {formError && (
                    <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-red-600 text-sm font-medium">
                      {formError}
                    </div>
                  )}

                  {/* Photo upload */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-jagamn-tertiary">
                      <div className="w-8 h-8 rounded-lg bg-[#FFF1E6] flex items-center justify-center">
                        <Camera className="w-5 h-5" />
                      </div>
                      <h3 className="manrope-bold text-base text-jagamn-primary tracking-tight">
                        Staff Photo (optional)
                      </h3>
                    </div>
                    <div className="w-32 aspect-square rounded-2xl border-2 border-dashed border-gray-200 bg-[#F8F9FA] flex flex-col items-center justify-center gap-2 text-center relative overflow-hidden hover:border-jagamn-tertiary transition-all cursor-pointer">
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
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setPhotoPreview(null);
                              }}
                              className="absolute top-1 right-1 bg-white p-1 rounded-lg shadow text-red-500 z-10"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </>
                        ) : (
                          <>
                            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
                              <Plus className="w-4 h-4 text-slate-400" />
                            </div>
                            <p className="manrope-bold text-[10px] text-slate-400 uppercase tracking-widest">
                              Upload
                            </p>
                          </>
                        )}
                      </label>
                    </div>
                  </div>

                  {/* Personal info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                        Full Name *
                      </Label>
                      <Input
                        required
                        value={form.full_name}
                        onChange={(e) =>
                          setForm({ ...form, full_name: e.target.value })
                        }
                        placeholder="Jane Smith"
                        className="h-12 bg-white border-gray-200 rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                        Email Address *
                      </Label>
                      <Input
                        required
                        type="email"
                        value={form.email}
                        onChange={(e) =>
                          setForm({ ...form, email: e.target.value })
                        }
                        placeholder="jane@palace.com"
                        className="h-12 bg-white border-gray-200 rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                        Phone Number
                      </Label>
                      <Input
                        value={form.phone}
                        onChange={(e) =>
                          setForm({ ...form, phone: e.target.value })
                        }
                        placeholder="+1 (555) 000-0000"
                        className="h-12 bg-white border-gray-200 rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                        Department
                      </Label>
                      <div className="flex gap-2">
                        <Select
                          value={form.department || "none"}
                          onValueChange={(v) =>
                            setForm({
                              ...form,
                              department: v === "none" ? "" : v,
                            })
                          }
                        >
                          <SelectTrigger className="h-12 bg-white border-gray-200 rounded-xl">
                            <SelectValue placeholder="Choose department" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">None</SelectItem>
                            {departments.map((d) => (
                              <SelectItem key={d} value={d}>
                                {d}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Input
                          placeholder="Or enter new..."
                          value={form.department}
                          onChange={(e) =>
                            setForm({ ...form, department: e.target.value })
                          }
                          className="h-12 bg-white border-gray-200 rounded-xl flex-1"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                        Position / Title
                      </Label>
                      <div className="flex gap-2">
                        <Select
                          value={form.position || "none"}
                          onValueChange={(v) =>
                            setForm({
                              ...form,
                              position: v === "none" ? "" : v,
                            })
                          }
                        >
                          <SelectTrigger className="h-12 bg-white border-gray-200 rounded-xl">
                            <SelectValue placeholder="Choose position" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">None</SelectItem>
                            {positions.map((p) => (
                              <SelectItem key={p} value={p}>
                                {p}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Input
                          placeholder="Or enter new..."
                          value={form.position}
                          onChange={(e) =>
                            setForm({ ...form, position: e.target.value })
                          }
                          className="h-12 bg-white border-gray-200 rounded-xl flex-1"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                        Role *
                      </Label>
                      <Select
                        value={form.role}
                        onValueChange={(v) => setForm({ ...form, role: v })}
                        required
                      >
                        <SelectTrigger className="h-12 bg-white border-gray-200 rounded-xl">
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="owner">Owner</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="manager">Manager</SelectItem>
                          <SelectItem value="reception">Reception</SelectItem>
                          <SelectItem value="kitchen">Kitchen</SelectItem>
                          <SelectItem value="storekeeper">
                            Store Keeper
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                        Annual Salary (FCFA)
                      </Label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-semibold text-xs">
                          FCFA
                        </span>
                        <Input
                          type="number"
                          value={form.salary}
                          onChange={(e) =>
                            setForm({ ...form, salary: e.target.value })
                          }
                          placeholder="52000"
                          className="h-12 bg-white border-gray-200 rounded-xl pl-8"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                        Hire Date
                      </Label>
                      <Input
                        type="date"
                        value={form.hire_date}
                        onChange={(e) =>
                          setForm({ ...form, hire_date: e.target.value })
                        }
                        className="h-12 bg-white border-gray-200 rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                        Password (leave blank to auto-generate)
                      </Label>
                      <Input
                        type="password"
                        value={form.password}
                        onChange={(e) =>
                          setForm({ ...form, password: e.target.value })
                        }
                        placeholder="Auto-generate"
                        className="h-12 bg-white border-gray-200 rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-4 pt-2 border-t border-gray-100">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={closeOnboarding}
                      className="h-12 px-6 text-gray-400 text-xs font-black uppercase tracking-widest"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={
                        submitting ||
                        !form.full_name ||
                        !form.email ||
                        !form.role
                      }
                      className="h-12 px-10 bg-jagamn-primary text-white manrope-bold rounded-xl shadow-lg gap-2"
                    >
                      {submitting && (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      )}
                      {submitting ? "Creating…" : "Create Staff Account"}
                    </Button>
                  </div>
                </div>
              </form>
            )}
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
            {staff.length}
          </h2>
          <p className="text-[10px] md:text-[11px] text-jagamn-tertiary font-black uppercase tracking-widest">
            {staff.filter((s) => s.status === "active").length} ACTIVE
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
            {departments.length} Departments
          </p>
        </div>
        <div className="bg-jagamn-primary p-6 md:p-8 rounded-2xl text-white shadow-2xl relative overflow-hidden group hover:scale-[1.01] transition-transform">
          <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6 md:mb-8">
            Monthly Payroll Forecast
          </p>
          <h2 className="manrope-bold text-3xl md:text-5xl mb-6">
            {formatMoney(
              Math.round(
                staff.reduce((sum, s) => sum + (s.salary ?? 0), 0) / 12,
              ),
            )}
          </h2>
          <div className="absolute bottom-[-20%] right-[-10%] w-40 h-40 bg-white/5 rounded-full blur-2xl" />
        </div>
      </div>

      {/* ── Toolbar & Enhanced Filter ─────────────────── */}
      <div className="flex flex-col space-y-4 xl:space-y-0 xl:flex-row xl:items-center justify-between gap-4 bg-white/50 backdrop-blur-sm p-4 rounded-2xl border border-gray-100">
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full xl:w-auto">
          <Select value={deptFilter} onValueChange={setDeptFilter}>
            <SelectTrigger className="h-12 w-full sm:w-[200px] bg-white border-gray-100 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] shadow-sm">
              <SelectValue placeholder="All Departments" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {departments.map((d) => (
                <SelectItem key={d} value={d}>
                  {d}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex items-center gap-2 bg-white border border-gray-100 rounded-xl p-1 shadow-sm h-12 w-full sm:w-auto px-3">
            <Calendar className="w-4 h-4 text-gray-400" />
            <input
              type="date"
              value={dateFilter.from}
              onChange={(e) =>
                setDateFilter({ ...dateFilter, from: e.target.value })
              }
              className="bg-transparent text-[10px] font-bold text-jagamn-primary outline-none"
            />
            <span className="text-gray-300 mx-1">/</span>
            <input
              type="date"
              value={dateFilter.to}
              onChange={(e) =>
                setDateFilter({ ...dateFilter, to: e.target.value })
              }
              className="bg-transparent text-[10px] font-bold text-jagamn-primary outline-none"
            />
            {(dateFilter.from || dateFilter.to) && (
              <button
                onClick={() => setDateFilter({ from: "", to: "" })}
                className="ml-2 text-gray-400 hover:text-red-500"
              >
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
              <LayoutGrid className="w-4 h-4" />
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
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Directory Table/Grid ─────────────────────── */}
      {viewMode === "list" ? (
        <div className="bg-white rounded-xl border border-gray-100 border-l-4 border-l-jagamn-primary shadow-sm overflow-hidden overflow-x-auto">
          <table className="w-full" style={{ minWidth: 950 }}>
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
                <th className="px-6 py-5 text-left text-[11px] font-black text-gray-400 uppercase tracking-widest">
                  Status
                </th>
                <th className="px-6 py-5 text-right text-[11px] font-black text-gray-400 uppercase tracking-widest">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredStaff.map((member, idx) => (
                <tr
                  key={member.id}
                  className="group hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={member.avatar_url ?? ""} />
                        <AvatarFallback
                          className={cn(
                            "text-white font-black text-[10px]",
                            AVATAR_COLORS[idx % AVATAR_COLORS.length],
                          )}
                        >
                          {member.full_name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="manrope-bold text-sm text-jagamn-primary">
                          {member.full_name}
                        </p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase">
                          {member.staff_code || member.id.slice(0, 8)}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs font-bold text-gray-500">
                    {member.department || "—"}
                  </td>
                  <td className="px-6 py-4 text-xs font-bold text-gray-500">
                    {member.position || "—"}
                  </td>
                  <td className="px-6 py-4">
                    <RoleBadge role={member.role} />
                  </td>
                  <td className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase">
                    {member.hire_date
                      ? new Date(member.hire_date).toLocaleDateString()
                      : "—"}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={cn(
                        "text-[9px] font-black px-2 py-1 rounded-full uppercase",
                        member.status === "active"
                          ? "bg-green-50 text-green-600"
                          : member.status === "suspended"
                            ? "bg-amber-50 text-amber-600"
                            : "bg-red-50 text-red-500",
                      )}
                    >
                      {member.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
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
                          onClick={() =>
                            router.push(`/admin/staff/${member.id}`)
                          }
                          className="text-[10px] font-black uppercase tracking-widest gap-2 py-3 px-4"
                        >
                          <Eye className="w-4 h-4" /> View Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setEditModal({ open: true, member })}
                          className="text-[10px] font-black uppercase tracking-widest gap-2 py-3 px-4"
                        >
                          <Briefcase className="w-4 h-4" /> Edit Details
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
              {filteredStaff.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-20 text-center text-gray-400 manrope-bold italic"
                  >
                    {staff.length === 0
                      ? "No staff members yet — add your first above."
                      : "No personnel matches found."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {filteredStaff.map((member, idx) => (
            <div
              key={member.id}
              className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden group hover:shadow-2xl transition-all duration-500"
            >
              <div
                className={cn(
                  "h-24",
                  AVATAR_COLORS[idx % AVATAR_COLORS.length],
                )}
              />
              <div className="p-6 pt-12 relative">
                <Avatar className="w-20 h-20 absolute -top-10 left-6 border-4 border-white shadow-lg">
                  <AvatarImage src={member.avatar_url ?? ""} />
                  <AvatarFallback
                    className={cn(
                      "text-white font-black",
                      AVATAR_COLORS[idx % AVATAR_COLORS.length],
                    )}
                  >
                    {member.full_name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-4">
                  <div>
                    <h4 className="manrope-bold text-lg text-jagamn-primary">
                      {member.full_name}
                    </h4>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      {member.position || member.role}
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <RoleBadge role={member.role} />
                    <span className="text-[10px] font-bold text-gray-300 uppercase">
                      {member.staff_code || member.id.slice(0, 8)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {editModal.member && (
        <StaffEditModal
          open={editModal.open}
          onOpenChange={(open) => {
            setEditModal({ open, member: open ? editModal.member : null });
            if (!open) router.refresh();
          }}
          staff={editModal.member}
        />
      )}
    </div>
  );
}
