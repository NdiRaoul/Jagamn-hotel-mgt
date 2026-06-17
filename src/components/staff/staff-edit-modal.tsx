"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Shield,
  Cloud,
  AlertTriangle,
  Camera,
  X,
  Loader2,
  Trash2,
  RefreshCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Staff } from "@/types/database";

const ROLE_OPTIONS: { value: string; label: string }[] = [
  { value: "owner", label: "Owner" },
  { value: "admin", label: "Admin" },
  { value: "manager", label: "Manager" },
  { value: "reception", label: "Reception" },
  { value: "kitchen", label: "Kitchen" },
  { value: "storekeeper", label: "Store Keeper" },
];

interface StaffEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  staff: Staff;
  /**
   * Restrict the assignable roles shown in the dropdown. Defaults to the full
   * role set. The server is the source of truth — see lib/auth/staff-permissions.
   */
  allowedRoles?: string[];
  /**
   * Whether the current viewer may edit this staffer's salary. When false the
   * field is read-only (e.g. an admin viewing another admin, or your own
   * record — only the owner may set admin/manager salaries). Defaults to true.
   */
  canEditSalary?: boolean;
}

export function StaffEditModal({
  open,
  onOpenChange,
  staff,
  allowedRoles,
  canEditSalary = true,
}: StaffEditModalProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editPreview, setEditPreview] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(
    staff.avatar_url ?? null,
  );
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // form state seeded from staff record
  const [fullName, setFullName] = useState(staff.full_name);
  const [email, setEmail] = useState(staff.email);
  const [phone, setPhone] = useState(staff.phone ?? "");
  const [department, setDepartment] = useState(staff.department ?? "");
  const [position, setPosition] = useState(staff.position ?? "");
  const [role, setRole] = useState(staff.role);
  const [salary, setSalary] = useState(
    staff.salary != null ? String(staff.salary) : "",
  );
  const [hireDate, setHireDate] = useState(staff.hire_date ?? "");

  const isSuspended = staff.status === "suspended";
  const [suspendToggle, setSuspendToggle] = useState(isSuspended);

  const [saving, setSaving] = useState(false);

  // Suggested options (derived from common palace departments/roles)
  const SUGGESTED_DEPARTMENTS = [
    "Executive",
    "Management",
    "Front Office",
    "Kitchen",
    "Procurement",
    "Housekeeping",
    "Sales",
  ];

  const SUGGESTED_POSITIONS = [
    "General Manager",
    "Assistant Manager",
    "Senior Receptionist",
    "Receptionist",
    "Chef",
    "Sous Chef",
    "Store Supervisor",
  ];
  const [resettingPw, setResettingPw] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setApiError("Please select an image file.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setApiError("Image must be less than 2MB.");
      return;
    }
    // Show an instant local preview, then upload to the avatars bucket and keep
    // the returned public URL so it is persisted with the staff record on save.
    setEditPreview(URL.createObjectURL(file));
    setApiError(null);
    setUploadingAvatar(true);
    try {
      const fd = new FormData();
      fd.append("avatar", file);
      const res = await fetch("/api/admin/staff/avatar", {
        method: "POST",
        body: fd,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Upload failed");
      setAvatarUrl(data.avatar_url);
    } catch (err) {
      setEditPreview(null);
      setApiError(err instanceof Error ? err.message : "Avatar upload failed");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const mutate = async (url: string, method: string, body?: object) => {
    const res = await fetch(url, {
      method,
      ...(body
        ? {
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          }
        : {}),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok)
      throw new Error(data.error ?? `Request failed (${res.status})`);
    return data;
  };

  const handleSave = async () => {
    setApiError(null);
    setSaving(true);
    try {
      await mutate(`/api/staff/${staff.id}`, "PATCH", {
        full_name: fullName,
        email,
        phone: phone || null,
        department: department || null,
        position: position || null,
        role,
        // Only include salary when the viewer is permitted to change it,
        // otherwise the server (rightly) rejects the whole update.
        ...(canEditSalary ? { salary: salary ? parseFloat(salary) : null } : {}),
        hire_date: hireDate || null,
        ...(avatarUrl !== (staff.avatar_url ?? null)
          ? { avatar_url: avatarUrl }
          : {}),
      });

      // Suspend / reactivate if toggle changed
      if (suspendToggle !== isSuspended) {
        const action = suspendToggle ? "suspend" : "reactivate";
        await mutate(`/api/staff/${staff.id}/${action}`, "POST");
      }

      router.refresh();
      onOpenChange(false);
    } catch (err) {
      setApiError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleResetPassword = async () => {
    setApiError(null);
    setResettingPw(true);
    try {
      const data = await mutate(
        `/api/staff/${staff.id}/reset-password`,
        "POST",
      );
      if (data.tempPassword) {
        alert(
          `New temporary password:\n${data.tempPassword}\n\nShare this securely with the staff member.`,
        );
      } else {
        alert("Password reset email sent.");
      }
    } catch (err) {
      setApiError(err instanceof Error ? err.message : "Reset failed");
    } finally {
      setResettingPw(false);
    }
  };

  const handleDelete = async () => {
    setApiError(null);
    setDeleting(true);
    try {
      await mutate(`/api/staff/${staff.id}`, "DELETE");
      router.refresh();
      onOpenChange(false);
    } catch (err) {
      setApiError(err instanceof Error ? err.message : "Delete failed");
      setDeleting(false);
    }
  };

  const initials = staff.full_name
    .split(" ")
    .map((n) => n[0])
    .join("");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] lg:w-full lg:max-w-4xl p-6 lg:p-10 rounded-2xl border-0 shadow-2xl bg-[#F8F9FA] gap-6 max-h-[95vh] flex flex-col">
        <DialogHeader className="space-y-1 shrink-0">
          <DialogTitle className="manrope-bold text-2xl text-jagamn-primary">
            Edit Staff Profile
          </DialogTitle>
          <p className="text-gray-500 text-sm font-medium">
            Update administrative details for{" "}
            <span className="text-jagamn-primary font-bold">
              {staff.full_name}
            </span>
          </p>
        </DialogHeader>

        {apiError && (
          <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-red-600 text-sm font-medium shrink-0">
            {apiError}
          </div>
        )}

        <div className="flex-1 overflow-y-auto pr-2 space-y-8 scrollbar-hide">
          <div className="flex flex-col md:flex-row gap-8 mt-2">
            {/* ── Left Column: Avatar & Security ── */}
            <div className="w-full md:w-[280px] space-y-6 shrink-0">
              <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm flex flex-col items-center text-center relative">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-jagamn-primary rounded-l-xl" />
                <div className="relative mb-4 group">
                  <Avatar className="w-24 h-24 border-4 border-white shadow-lg rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center">
                    {editPreview || avatarUrl ? (
                      <img
                        src={editPreview ?? avatarUrl ?? ""}
                        className="w-full h-full object-cover"
                        alt="Preview"
                      />
                    ) : (
                      <>
                        <AvatarImage
                          src={staff.avatar_url ?? ""}
                          className="object-cover"
                        />
                        <AvatarFallback className="bg-jagamn-primary text-white manrope-bold text-2xl rounded-xl">
                          {initials}
                        </AvatarFallback>
                      </>
                    )}
                  </Avatar>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleAvatarChange}
                    className="hidden"
                    accept="image/*"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute -bottom-2 -right-2 bg-[#E8924A] text-white p-2 rounded-lg shadow-md hover:scale-110 transition-all border-2 border-white z-20"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                  {editPreview && (
                    <button
                      type="button"
                      onClick={() => setEditPreview(null)}
                      className="absolute -top-2 -right-2 bg-white text-red-500 p-1.5 rounded-lg shadow-md hover:scale-110 transition-all border border-gray-100 z-30"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <h3 className="manrope-bold text-lg text-jagamn-primary">
                  {fullName || staff.full_name}
                </h3>
                <p className="text-[10px] text-gray-400 font-bold tracking-widest uppercase mb-4">
                  {staff.staff_code || staff.id.slice(0, 8)}
                </p>
                <div
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-full",
                    staff.status === "active"
                      ? "bg-green-50"
                      : staff.status === "suspended"
                        ? "bg-amber-50"
                        : "bg-red-50",
                  )}
                >
                  <span
                    className={cn(
                      "w-1.5 h-1.5 rounded-full",
                      staff.status === "active"
                        ? "bg-green-500"
                        : staff.status === "suspended"
                          ? "bg-amber-500"
                          : "bg-red-500",
                    )}
                  />
                  <span
                    className={cn(
                      "text-[9px] font-black uppercase tracking-[0.1em]",
                      staff.status === "active"
                        ? "text-green-700"
                        : staff.status === "suspended"
                          ? "text-amber-700"
                          : "text-red-700",
                    )}
                  >
                    {staff.status.toUpperCase()} ACCOUNT
                  </span>
                </div>
              </div>

              {/* Security Context */}
              <div className="bg-[#0D2137] p-6 rounded-xl shadow-xl text-white space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Shield className="w-4 h-4 text-[#E8924A]" />
                  <h4 className="manrope-bold text-sm">Security Context</h4>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  disabled={resettingPw}
                  onClick={handleResetPassword}
                  className="w-full bg-transparent border-white/20 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 hover:text-white transition-colors gap-2"
                >
                  {resettingPw ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <RefreshCcw className="w-3 h-3" />
                  )}
                  Reset Password
                </Button>
              </div>
            </div>

            {/* ── Right Column: Edit Form ── */}
            <div className="flex-1 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <Label className="text-[9px] font-black text-[#43474D] uppercase tracking-widest">
                    Full Legal Name
                  </Label>
                  <Input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="h-12 bg-white border-gray-200 rounded-lg text-sm font-semibold focus-visible:ring-0 focus-visible:border-jagamn-tertiary transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[9px] font-black text-[#43474D] uppercase tracking-widest">
                    Corporate Email
                  </Label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 bg-white border-gray-200 rounded-lg text-sm font-semibold focus-visible:ring-0 focus-visible:border-jagamn-tertiary transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[9px] font-black text-[#43474D] uppercase tracking-widest">
                    Phone
                  </Label>
                  <Input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="h-12 bg-white border-gray-200 rounded-lg text-sm font-semibold focus-visible:ring-0 focus-visible:border-jagamn-tertiary transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[9px] font-black text-[#43474D] uppercase tracking-widest">
                    Department
                  </Label>
                  <div className="flex gap-2">
                    <Select
                      value={department || "none"}
                      onValueChange={(v) =>
                        setDepartment(v === "none" ? "" : v)
                      }
                    >
                      <SelectTrigger className="h-12 bg-white border-gray-200 rounded-lg text-sm font-semibold focus-visible:ring-0 focus-visible:border-jagamn-tertiary">
                        <SelectValue placeholder="Choose department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {SUGGESTED_DEPARTMENTS.map((d) => (
                          <SelectItem key={d} value={d}>
                            {d}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      placeholder="Or enter new..."
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="h-12 bg-white border-gray-200 rounded-lg text-sm font-semibold focus-visible:ring-0 focus-visible:border-jagamn-tertiary transition-all flex-1"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[9px] font-black text-[#43474D] uppercase tracking-widest">
                    Position / Title
                  </Label>
                  <div className="flex gap-2">
                    <Select
                      value={position || "none"}
                      onValueChange={(v) => setPosition(v === "none" ? "" : v)}
                    >
                      <SelectTrigger className="h-12 bg-white border-gray-200 rounded-lg text-sm font-semibold focus-visible:ring-0 focus-visible:border-jagamn-tertiary">
                        <SelectValue placeholder="Choose position" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {SUGGESTED_POSITIONS.map((p) => (
                          <SelectItem key={p} value={p}>
                            {p}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      placeholder="Or enter new..."
                      value={position}
                      onChange={(e) => setPosition(e.target.value)}
                      className="h-12 bg-white border-gray-200 rounded-lg text-sm font-semibold focus-visible:ring-0 focus-visible:border-jagamn-tertiary transition-all flex-1"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[9px] font-black text-[#43474D] uppercase tracking-widest">
                    Role Assignment
                  </Label>
                  <Select value={role} onValueChange={setRole}>
                    <SelectTrigger className="h-12 bg-white border-gray-200 rounded-lg text-sm font-semibold focus:ring-0 focus:border-jagamn-tertiary">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ROLE_OPTIONS.filter(
                        (opt) =>
                          !allowedRoles ||
                          allowedRoles.includes(opt.value) ||
                          // Always show the staffer's current role so it
                          // renders even if it's outside the allowed set.
                          opt.value === staff.role,
                      ).map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[9px] font-black text-[#43474D] uppercase tracking-widest">
                  Base Annual Salary (FCFA)
                </Label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-semibold">
                    FCFA
                  </span>
                  <Input
                    type="number"
                    value={salary}
                    onChange={(e) => setSalary(e.target.value)}
                    disabled={!canEditSalary}
                    className="h-12 bg-white border-gray-200 rounded-lg pl-14 text-sm font-semibold focus-visible:ring-0 focus-visible:border-jagamn-tertiary transition-all disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed"
                  />
                </div>
                {!canEditSalary && (
                  <p className="text-[10px] font-semibold text-gray-400">
                    Only the owner can change admin or manager salaries.
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label className="text-[9px] font-black text-[#43474D] uppercase tracking-widest">
                  Hire Date
                </Label>
                <Input
                  type="date"
                  value={hireDate}
                  onChange={(e) => setHireDate(e.target.value)}
                  className="h-12 bg-white border-gray-200 rounded-lg text-sm font-semibold focus-visible:ring-0 focus-visible:border-jagamn-tertiary transition-all"
                />
              </div>

              <hr className="border-gray-100 my-4" />

              {/* Suspend toggle */}
              <div
                className={cn(
                  "p-6 rounded-xl flex items-center justify-between border transition-colors",
                  suspendToggle
                    ? "bg-red-50 border-red-100"
                    : "bg-white border-gray-100 shadow-sm",
                )}
              >
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-red-100 text-red-600 rounded-lg shrink-0">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm manrope-bold text-red-600 mb-1">
                      {suspendToggle ? "SUSPENDED" : "SUSPEND ACCOUNT"}
                    </h4>
                    <p className="text-xs text-gray-500 font-medium">
                      Suspending revokes portal access immediately.
                    </p>
                  </div>
                </div>
                <Switch
                  checked={suspendToggle}
                  onCheckedChange={setSuspendToggle}
                  className="data-[state=checked]:bg-red-500"
                />
              </div>

              {/* Delete */}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    disabled={deleting}
                    className="w-full h-11 text-red-500 hover:bg-red-50 hover:text-red-600 font-bold text-xs uppercase tracking-widest gap-2 rounded-xl border border-red-100"
                  >
                    {deleting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                    Remove Staff Member (Permanent)
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Remove {staff.full_name}?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      This permanently deletes the staff record and revokes
                      their auth account. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      Yes, Remove
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-6 border-t border-gray-200 shrink-0">
          <div className="flex items-center gap-2 text-gray-400">
            <Cloud className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-widest">
              Changes saved on submit
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="h-11 px-6 text-gray-500 text-xs font-black uppercase tracking-widest hover:text-jagamn-primary"
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={saving || uploadingAvatar}
              onClick={handleSave}
              className="h-11 px-8 bg-[#0D2137] hover:bg-[#0D2137]/90 text-white manrope-bold rounded-lg shadow-md transition-all gap-2"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {saving ? "Saving…" : "Save Changes"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
