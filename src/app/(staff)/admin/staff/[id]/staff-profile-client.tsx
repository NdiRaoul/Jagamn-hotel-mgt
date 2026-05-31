"use client";

import React, { useState } from "react";
import {
  ArrowLeft,
  Edit3,
  UserMinus,
  Briefcase,
  Contact2,
  Clock,
  ChevronRight,
  Printer,
  Mail,
  Download,
} from "lucide-react";
import { formatMoney } from "@/lib/currency";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { StaffEditModal } from "@/components/staff/staff-edit-modal";
import type { Staff } from "@/types/database";

function tenure(hireDate: string | null): string {
  if (!hireDate) return "—";
  const ms = Date.now() - new Date(hireDate).getTime();
  const years = Math.floor(ms / (1000 * 60 * 60 * 24 * 365));
  const months = Math.floor(
    (ms % (1000 * 60 * 60 * 24 * 365)) / (1000 * 60 * 60 * 24 * 30),
  );
  return `${years > 0 ? `${years} yr${years !== 1 ? "s" : ""}, ` : ""}${months} month${months !== 1 ? "s" : ""}`;
}

export default function StaffProfileClient({ staff }: { staff: Staff }) {
  const router = useRouter();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleDeactivate = async () => {
    if (
      !confirm(
        `Suspend ${staff.full_name}? They will lose portal access immediately.`,
      )
    )
      return;
    const res = await fetch(`/api/staff/${staff.id}/suspend`, {
      method: "POST",
    });
    if (res.ok) router.refresh();
    else alert("Failed to suspend — check console");
  };

  const handleExportCSV = () => {
    const rows = [
      ["Attribute", "Value"],
      ["Staff ID", staff.id],
      ["Staff Code", staff.staff_code || ""],
      ["Name", staff.full_name],
      ["Email", staff.email],
      ["Phone", staff.phone || ""],
      ["Department", staff.department || ""],
      ["Position", staff.position || ""],
      ["Role", staff.role],
      ["Status", staff.status],
      ["Hire Date", staff.hire_date || ""],
      ["Salary", staff.salary != null ? formatMoney(staff.salary) : ""],
    ];
    const csv = rows
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute(
      "download",
      `Record_${staff.staff_code || staff.id}_${staff.full_name.replace(/\s/g, "_")}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-20 animate-in fade-in duration-700">
      <div className="mx-auto pt-6 space-y-10 md:space-y-12">
        {/* ── Breadcrumb ─────────────────────────────── */}
        <Link
          href="/admin/staff"
          className="flex items-center gap-3 text-jagamn-primary hover:text-jagamn-tertiary transition-colors group w-fit"
        >
          <div className="p-2 rounded-lg group-hover:bg-gray-100 transition-all">
            <ArrowLeft className="w-5 h-5" />
          </div>
          <span className="manrope-bold text-xs md:text-sm tracking-tight uppercase">
            Staff Management
          </span>
        </Link>

        {/* ── Header ─────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-10">
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-10">
            <div className="relative">
              <div className="w-40 h-40 md:w-52 md:h-52 rounded-full border-8 border-white shadow-2xl relative flex items-center justify-center bg-white p-1">
                <Avatar className="w-full h-full rounded-full">
                  <AvatarImage
                    src={staff.avatar_url ?? ""}
                    className="object-cover"
                  />
                  <AvatarFallback className="bg-[#0D2137] text-white text-4xl md:text-5xl manrope-bold">
                    {staff.full_name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div
                className={cn(
                  "absolute bottom-2 right-2 md:bottom-4 md:right-4 w-6 h-6 md:w-7 md:h-7 border-4 border-white rounded-full shadow-lg",
                  staff.status === "active"
                    ? "bg-green-500"
                    : staff.status === "suspended"
                      ? "bg-amber-500"
                      : "bg-gray-400",
                )}
              />
            </div>

            <div className="flex flex-col text-center md:text-left">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] mb-3 md:mb-4">
                STAFF ID: {staff.staff_code || staff.id.slice(0, 8)}
              </p>
              <h1 className="manrope-bold text-4xl md:text-6xl text-jagamn-primary tracking-tight leading-none mb-6 md:mb-8">
                {staff.full_name}
              </h1>
              <div className="flex flex-wrap justify-center md:justify-start gap-6 md:gap-8">
                {staff.department && (
                  <div className="flex items-center gap-3">
                    <Briefcase className="w-4 h-4 md:w-5 md:h-5 text-[#E8924A]" />
                    <span className="text-xs md:text-sm font-bold text-slate-500">
                      {staff.department}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <Contact2 className="w-4 h-4 md:w-5 md:h-5 text-[#E8924A]" />
                  <span className="text-xs md:text-sm font-bold text-slate-500">
                    {staff.position || staff.role}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 md:gap-4 w-full md:w-auto md:min-w-[200px]">
            <Button
              onClick={() => setIsEditModalOpen(true)}
              className="h-14 bg-[#0D2137] hover:bg-[#0D2137]/90 text-white manrope-bold px-8 rounded-2xl shadow-xl flex items-center justify-center gap-3 transition-all hover:scale-[1.02]"
            >
              <Edit3 className="w-5 h-5" />
              Edit Details
            </Button>
            <Button
              variant="ghost"
              onClick={handleDeactivate}
              disabled={staff.status !== "active"}
              className="h-14 text-slate-400 font-bold hover:text-red-500 hover:bg-red-50 rounded-2xl flex items-center justify-center gap-3 transition-all disabled:opacity-40"
            >
              <UserMinus className="w-5 h-5" />
              {staff.status === "suspended"
                ? "Already Suspended"
                : "Suspend Account"}
            </Button>
          </div>
        </div>

        {/* ── Main Content Grid ─────────────────────── */}
        <div className="flex flex-col lg:grid lg:grid-cols-2 gap-8 items-stretch">
          {/* Contact Information */}
          <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-100 shadow-sm border-l-4 border-l-jagamn-primary flex flex-col">
            <h3 className="text-[10px] font-black text-[#43474D] uppercase tracking-[0.2em] mb-8 md:mb-10">
              Contact Information
            </h3>
            <div className="space-y-8 md:space-y-10 flex-1">
              <div className="space-y-1.5">
                <p className="text-[9px] font-black text-[#43474D] uppercase tracking-widest">
                  Email Address
                </p>
                <p className="manrope-bold text-lg md:text-xl text-jagamn-primary break-all">
                  {staff.email}
                </p>
              </div>
              {staff.phone && (
                <div className="space-y-1.5">
                  <p className="text-[9px] font-black text-[#43474D] uppercase tracking-widest">
                    Phone Number
                  </p>
                  <p className="manrope-bold text-lg md:text-xl text-jagamn-primary">
                    {staff.phone}
                  </p>
                </div>
              )}
            </div>

            <div className="pt-8 md:pt-10 mt-8 md:mt-10 border-t border-gray-50 space-y-4 md:space-y-6">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold text-[#43474D] uppercase tracking-widest">
                  Account Status
                </p>
                <Badge
                  className={cn(
                    "border-0 text-[9px] font-black px-3 py-1 rounded-lg",
                    staff.status === "active"
                      ? "bg-green-50 text-green-600"
                      : staff.status === "suspended"
                        ? "bg-amber-50 text-amber-600"
                        : "bg-red-50 text-red-600",
                  )}
                >
                  {staff.status.toUpperCase()}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold text-[#43474D] uppercase tracking-widest">
                  Must Reset Password
                </p>
                <Badge
                  className={cn(
                    "border-0 text-[9px] font-black px-3 py-1 rounded-lg",
                    staff.must_reset_pw
                      ? "bg-amber-50 text-amber-600"
                      : "bg-gray-50 text-gray-500",
                  )}
                >
                  {staff.must_reset_pw ? "YES" : "NO"}
                </Badge>
              </div>
            </div>
          </div>

          {/* Performance & Compensation */}
          <div className="space-y-8 flex flex-col">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-100 shadow-sm border-l-4 border-l-jagamn-primary">
                <h3 className="text-[10px] font-black text-[#43474D] uppercase tracking-[0.2em] mb-8 md:mb-10">
                  Remuneration
                </h3>
                <div className="space-y-8">
                  <div className="space-y-2">
                    <p className="text-[9px] font-black text-[#43474D] uppercase tracking-widest">
                      Annual Salary
                    </p>
                    <div className="flex items-baseline gap-2">
                      <span className="manrope-bold text-3xl md:text-4xl text-jagamn-primary">
                        {staff.salary != null ? formatMoney(staff.salary) : "—"}
                      </span>
                      {staff.salary != null && (
                        <span className="text-gray-400 font-bold text-[10px] md:text-xs uppercase">
                          / yr
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-100 shadow-sm border-l-4 border-l-jagamn-primary">
                <h3 className="text-[10px] font-black text-[#43474D] uppercase tracking-[0.2em] mb-8 md:mb-10">
                  Employment Tenure
                </h3>
                <div className="space-y-8">
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-[#43474D] uppercase tracking-widest">
                      Hire Date
                    </p>
                    <p className="manrope-bold text-xl md:text-2xl text-jagamn-primary">
                      {staff.hire_date
                        ? new Date(staff.hire_date).toLocaleDateString(
                            "en-US",
                            { month: "long", day: "numeric", year: "numeric" },
                          )
                        : "—"}
                    </p>
                  </div>
                  <div className="bg-[#F8F9FA] p-4 rounded-xl flex items-center gap-4 border border-gray-100">
                    <div className="w-10 h-10 bg-[#0D2137] rounded-xl flex items-center justify-center text-[#E8924A] shrink-0">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[8px] font-black text-[#43474D] uppercase tracking-widest">
                        Total Service
                      </p>
                      <p className="manrope-bold text-xs md:text-sm text-jagamn-primary whitespace-nowrap">
                        {tenure(staff.hire_date)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Role Banner */}
            <div className="bg-[#0D2137] rounded-2xl p-6 md:p-8 text-white flex flex-col md:flex-row items-center justify-between relative overflow-hidden shadow-2xl flex-1 min-h-[180px]">
              <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 md:gap-12">
                <div className="space-y-2 text-center md:text-left">
                  <p className="text-[10px] font-black text-[#43474D] uppercase tracking-widest">
                    System Role
                  </p>
                  <div className="flex items-baseline gap-2 justify-center md:justify-start">
                    <span className="manrope-bold text-3xl md:text-4xl text-white uppercase">
                      {staff.role}
                    </span>
                  </div>
                </div>
                <div className="w-full h-px md:w-px md:h-12 bg-white/10" />
                <div className="space-y-2 text-center md:text-left">
                  <p className="text-[10px] font-black text-[#43474D] uppercase tracking-widest">
                    Staff Code
                  </p>
                  <span className="manrope-bold text-2xl text-white">
                    {staff.staff_code || "—"}
                  </span>
                </div>
              </div>
              <div className="absolute top-0 right-0 w-[200px] h-full bg-white/5 skew-x-[-20deg] translate-x-1/2" />
            </div>
          </div>
        </div>

        {/* ── Footer Actions ─────────────────────────── */}
        <div className="flex items-center justify-end gap-3 pb-10">
          <Button
            onClick={() => (window.location.href = `mailto:${staff.email}`)}
            variant="outline"
            size="icon"
            className="w-12 h-12 rounded-xl border-gray-100 bg-white text-[#0D2137] hover:bg-[#0D2137] hover:text-white shadow-sm transition-all"
          >
            <Mail className="w-5 h-5" />
          </Button>
          <Button
            onClick={() => window.print()}
            variant="outline"
            size="icon"
            className="w-12 h-12 rounded-xl border-gray-100 bg-white text-[#0D2137] hover:bg-[#0D2137] hover:text-white shadow-sm transition-all"
          >
            <Printer className="w-5 h-5" />
          </Button>
          <Button
            onClick={handleExportCSV}
            variant="outline"
            size="icon"
            className="w-12 h-12 rounded-xl border-gray-100 bg-white text-[#0D2137] hover:bg-[#0D2137] hover:text-white shadow-sm transition-all"
          >
            <Download className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <StaffEditModal
        open={isEditModalOpen}
        onOpenChange={(open) => {
          setIsEditModalOpen(open);
          if (!open) router.refresh();
        }}
        staff={staff}
      />
    </div>
  );
}
