"use client";

import React, { useState } from "react";
import {
  ArrowLeft,
  Edit3,
  UserMinus,
  Mail,
  Clock,
  Printer,
  Download,
  Briefcase,
  Contact2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { StaffEditModal } from "@/components/staff/staff-edit-modal";
import type { Staff } from "@/types/database";

interface StaffProfileClientProps {
  staff: Staff;
}

export default function StaffProfileClient({ staff }: StaffProfileClientProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const formatSalary = (salary: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "XAF",
      minimumFractionDigits: 0,
    }).format(salary);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const calculateTenure = (hireDate: string | null) => {
    if (!hireDate) return "N/A";
    const start = new Date(hireDate);
    const now = new Date();
    const years = now.getFullYear() - start.getFullYear();
    const months = now.getMonth() - start.getMonth();
    const totalMonths = years * 12 + months;
    const displayYears = Math.floor(totalMonths / 12);
    const displayMonths = totalMonths % 12;
    return `${displayYears} year${displayYears !== 1 ? "s" : ""}, ${displayMonths} month${displayMonths !== 1 ? "s" : ""}`;
  };

  const initials = staff.full_name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-20 animate-in fade-in duration-700">
      <div className="mx-auto pt-6 space-y-10 md:space-y-12">
        {/* Breadcrumb Navigation - Admin version */}
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

        {/* Header Profile Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-10">
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-10">
            <div className="relative">
              <div className="w-40 h-40 md:w-52 md:h-52 rounded-full border-8 border-white shadow-2xl relative flex items-center justify-center bg-white p-1">
                <Avatar className="w-full h-full rounded-full">
                  <AvatarImage
                    src={staff.avatar_url || undefined}
                    className="object-cover"
                  />
                  <AvatarFallback className="bg-[#0D2137] text-white text-4xl md:text-5xl manrope-bold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div
                className={`absolute bottom-2 right-2 md:bottom-4 md:right-4 w-6 h-6 md:w-7 md:h-7 border-4 border-white rounded-full shadow-lg ${
                  staff.status === "active"
                    ? "bg-green-500"
                    : staff.status === "suspended"
                      ? "bg-yellow-500"
                      : "bg-red-500"
                }`}
              />
            </div>

            <div className="flex flex-col text-center md:text-left">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] mb-3 md:mb-4">
                STAFF ID: {staff.staff_code || "N/A"}
              </p>
              <h1 className="manrope-bold text-4xl md:text-6xl text-jagamn-primary tracking-tight leading-none mb-6 md:mb-8">
                {staff.full_name}
              </h1>
              <div className="flex flex-wrap justify-center md:justify-start gap-6 md:gap-8">
                <div className="flex items-center gap-3">
                  <Briefcase className="w-4 h-4 md:w-5 md:h-5 text-[#E8924A]" />
                  <span className="text-xs md:text-sm font-bold text-slate-500">
                    {staff.department || "No Department"}
                  </span>
                </div>
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
              className="h-14 text-slate-400 font-bold hover:text-red-500 hover:bg-red-50 rounded-2xl flex items-center justify-center gap-3 transition-all"
            >
              <UserMinus className="w-5 h-5" />
              Deactivate Account
            </Button>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="flex flex-col lg:grid lg:grid-cols-2 gap-8 items-stretch">
          {/* Column 1: Contact Information */}
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
              <div className="space-y-1.5">
                <p className="text-[9px] font-black text-[#43474D] uppercase tracking-widest">
                  Phone Number
                </p>
                <p className="manrope-bold text-lg md:text-xl text-jagamn-primary">
                  {staff.phone || "Not provided"}
                </p>
              </div>
              <div className="space-y-1.5">
                <p className="text-[9px] font-black text-[#43474D] uppercase tracking-widest">
                  Role
                </p>
                <p className="manrope-bold text-lg md:text-xl text-jagamn-primary capitalize">
                  {staff.role}
                </p>
              </div>
            </div>

            <div className="pt-8 md:pt-10 mt-8 md:mt-10 border-t border-gray-50 space-y-4 md:space-y-6">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold text-[#43474D] uppercase tracking-widest">
                  Account Status
                </p>
                <Badge
                  className={`text-[9px] font-black px-3 py-1 rounded-lg ${
                    staff.status === "active"
                      ? "bg-green-100 text-green-700"
                      : staff.status === "suspended"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-red-100 text-red-700"
                  }`}
                >
                  {staff.status.toUpperCase()}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold text-[#43474D] uppercase tracking-widest">
                  Access Level
                </p>
                <Badge className="bg-blue-50 text-blue-600 border-0 text-[9px] font-black px-3 py-1 rounded-lg">
                  {staff.role === "owner" ? "FULL ACCESS" : "RESTRICTED"}
                </Badge>
              </div>
            </div>
          </div>

          {/* Column 2: Performance & Compensation Stack */}
          <div className="space-y-8 flex flex-col">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {/* Remuneration */}
              <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-100 shadow-sm border-l-4 border-l-jagamn-primary">
                <h3 className="text-[10px] font-black text-[#43474D] uppercase tracking-[0.2em] mb-8 md:mb-10">
                  Remuneration
                </h3>
                <div className="space-y-8">
                  <div className="space-y-2">
                    <p className="text-[9px] font-black text-[#43474D] uppercase tracking-widest">
                      Base Salary
                    </p>
                    <div className="flex items-baseline gap-2">
                      <span className="manrope-bold text-3xl md:text-4xl text-jagamn-primary">
                        {formatSalary(staff.salary || 0)}
                      </span>
                      <span className="text-gray-400 font-bold text-[10px] md:text-xs uppercase">
                        / yr
                      </span>
                    </div>
                  </div>
                  <div className="h-px bg-gray-50 w-full" />
                  <div className="flex items-center justify-between">
                    <p className="text-[9px] font-bold text-[#43474D] uppercase tracking-widest">
                      Next Review
                    </p>
                    <p className="manrope-bold text-xs text-jagamn-primary">
                      {staff.hire_date
                        ? new Date(
                            new Date(staff.hire_date).setFullYear(
                              new Date(staff.hire_date).getFullYear() + 1,
                            ),
                          ).toLocaleDateString("en-US", {
                            month: "short",
                            year: "numeric",
                          })
                        : "TBD"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Employment Tenure */}
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
                      {formatDate(staff.hire_date)}
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
                        {calculateTenure(staff.hire_date)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Performance Banner */}
            <div className="bg-[#0D2137] rounded-2xl p-6 md:p-8 text-white flex flex-col md:flex-row items-center justify-between relative overflow-hidden shadow-2xl flex-1 min-h-[220px]">
              <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 md:gap-12">
                <div className="space-y-2 text-center md:text-left">
                  <p className="text-[10px] font-black text-white/60 uppercase tracking-widest">
                    Account Created
                  </p>
                  <div className="flex items-baseline gap-2 justify-center md:justify-start">
                    <span className="manrope-bold text-2xl md:text-3xl text-white">
                      {new Date(staff.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="w-full h-px md:w-px md:h-12 bg-white/10" />
                <div className="space-y-2 text-center md:text-left">
                  <p className="text-[10px] font-black text-white/60 uppercase tracking-widest">
                    Last Updated
                  </p>
                  <div className="flex items-baseline gap-2 justify-center md:justify-start">
                    <span className="manrope-bold text-2xl md:text-3xl text-white">
                      {new Date(staff.updated_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              <Button className="relative z-10 w-full md:w-auto h-14 px-8 bg-[#FFB067] hover:bg-[#FFB067]/90 text-jagamn-primary manrope-bold rounded-xl shadow-lg mt-8 md:mt-0 transition-all hover:scale-105">
                View Full Report
              </Button>

              {/* Decorative Background */}
              <div className="absolute top-0 right-0 w-[200px] h-full bg-white/5 skew-x-[-20deg] translate-x-1/2" />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3">
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
            onClick={() => {
              const csvContent = [
                ["Attribute", "Value"],
                ["Staff ID", staff.staff_code || "N/A"],
                ["Name", staff.full_name],
                ["Email", staff.email],
                ["Phone", staff.phone || "N/A"],
                ["Department", staff.department || "N/A"],
                ["Position", staff.position || staff.role],
                ["Role", staff.role],
                ["Status", staff.status],
                ["Hire Date", formatDate(staff.hire_date)],
                ["Salary", formatSalary(staff.salary || 0)],
                ["Tenure", calculateTenure(staff.hire_date)],
              ]
                .map((row) =>
                  row
                    .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
                    .join(","),
                )
                .join("\n");

              const blob = new Blob([csvContent], {
                type: "text/csv;charset=utf-8;",
              });
              const url = URL.createObjectURL(blob);
              const link = document.createElement("a");
              link.setAttribute("href", url);
              link.setAttribute(
                "download",
                `Staff_${staff.staff_code || staff.id}_${staff.full_name.replace(/\s/g, "_")}.csv`,
              );
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
            variant="outline"
            size="icon"
            className="w-12 h-12 rounded-xl border-gray-100 bg-white text-[#0D2137] hover:bg-[#0D2137] hover:text-white shadow-sm transition-all"
          >
            <Download className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Edit Staff Modal — admins manage operational staff only; admin/manager
          roles and their salaries are owner-only. */}
      <StaffEditModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        staff={staff}
        allowedRoles={["reception", "kitchen", "storekeeper"]}
        canEditSalary={
          !["owner", "admin", "manager"].includes(staff.role)
        }
      />
    </div>
  );
}
