"use client";

import React from "react";
import {
  Search,
  Download,
  Calendar,
  ChevronDown,
  Filter,
  Monitor,
  Smartphone,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Laptop,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const AUDIT_LOGS = [
  {
    timestamp: "Oct 24, 14:22:05",
    timezone: "UTC +0:00",
    user: {
      name: "Julian Draxler",
      role: "ADMINISTRATOR",
      initials: "JD",
    },
    module: "PAYROLL",
    action: "Authorized batch release for Q3 Staff Bonuses",
    transactionId: "#PX-9920",
    ip: "192.168.1.104",
    device: "Chrome / macOS",
    status: "Success",
  },
  {
    timestamp: "Oct 24, 13:45:12",
    timezone: "UTC +0:00",
    user: {
      name: "Elena Rossi",
      role: "CONFIG LEAD",
      avatar: "/images/avatars/elena.png",
      initials: "ER",
    },
    module: "CONFIG",
    action: "Modified Global VAT settings for F&B",
    details: "Value changed: 12% to 15%",
    ip: "172.16.254.1",
    device: "Safari / iPadOS",
    status: "Success",
  },
  {
    timestamp: "Oct 24, 11:10:44",
    timezone: "UTC +0:00",
    user: {
      name: "System Automator",
      role: "INTERNAL SERVICE",
      initials: "SY",
      isSystem: true,
    },
    module: "SECURITY",
    action: "Multiple failed login attempts detected",
    details: "Account Lockout triggered for user 'v_marcus'",
    ip: "45.22.11.231",
    location: "Sofia, Bulgaria",
    status: "Critical Failure",
  },
  {
    timestamp: "Oct 24, 09:30:00",
    timezone: "UTC +0:00",
    user: {
      name: "Sarah Lansing",
      role: "AUDIT OFFICER",
      initials: "SL",
    },
    module: "AUDIT",
    action: "Daily revenue report exported",
    details: "Format: PDF | Size: 1.2MB",
    ip: "192.168.1.55",
    device: "Chrome / macOS",
    status: "Success",
  },
];

const SELECT_VALUES = [
  {
    id: 1,
    label: "Date Range",
    placeholder: "Select Range",
    items: ["Last 24 Hours", "Last 7 Days"],
  },
  {
    id: 2,
    label: "Module",
    placeholder: "All Modules",
    items: ["All Modules"],
  },
  {
    id: 3,
    label: "User Role",
    placeholder: "All Roles",
    items: ["All Roles"],
  },
  {
    id: 4,
    label: "Security",
    placeholder: "All Severities",
    items: ["All Severities"],
  },
];

export default function AuditLogsPage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Search Bar Top */}
      <div className="relative max-w-2xl">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          placeholder="Search audit trail..."
          className="h-12 bg-white border-slate-200 rounded-sm pl-12 text-sm font-medium focus-visible:ring-1 focus-visible:ring-jagamn-tertiary/20"
        />
      </div>

      {/* ── Header ───────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-jagamn-tertiary mb-1">
            System Integrity
          </p>
          <h1 className="manrope-bold text-2xl text-jagamn-primary">
            Security Audit Log
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-jagamn-primary hover:text-jagamn-tertiary transition-colors">
            <Download className="w-4 h-4" />
            Export CSV
          </button>
          <Button className="bg-jagamn-primary hover:bg-jagamn-primary/90 text-white rounded-sm manrope-bold text-xs gap-2 px-6 h-12 shadow-xl">
            <Download className="w-4 h-4" />
            Export Full Audit Trail
          </Button>
        </div>
      </div>

      {/* ── Filters ──────────────────────────────────── */}
      <div className="flex flex-wrap items-end gap-4">
        {SELECT_VALUES.map((value, id) => (
          <div
            key={id}
            className="space-y-2 flex-1 min-w-[150px] rounded-sm border-l-4 border-l-jagamn-primary bg-white"
          >
            <label className="px-2 text-[9px] font-black uppercase tracking-widest text-gray-400">
              {value.label}
            </label>
            <Select defaultValue={value.items[0] || ""}>
              <SelectTrigger className="h-11 w-full border-none rounded-sm text-xs manrope-bold text-jagamn-primary">
                <SelectValue placeholder={value.placeholder} />
              </SelectTrigger>
              <SelectContent>
                {value.items.map((item, id) => (
                  <SelectItem key={id} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ))}

        <Button className="bg-jagamn-primary hover:bg-jagamn-primary/90 text-white rounded-sm manrope-bold text-xs gap-2 px-8 h-11">
          <Filter className="w-4 h-4" />
          Apply Filters
        </Button>
      </div>

      {/* ── Table ────────────────────────────────────── */}
      <div className="bg-white rounded-sm border-l-4 border-l-jagamn-primary shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-50 bg-slate-50/30">
                <th className="px-6 py-6 text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">
                  Timestamp
                </th>
                <th className="px-6 py-6 text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">
                  User / Role
                </th>
                <th className="px-6 py-6 text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">
                  Module
                </th>
                <th className="px-6 py-6 text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">
                  Action Details
                </th>
                <th className="px-6 py-6 text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">
                  IP & Device
                </th>
                <th className="px-6 py-6 text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 text-right">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {AUDIT_LOGS.map((log, index) => (
                <tr
                  key={index}
                  className="hover:bg-slate-50/30 transition-all group"
                >
                  <td className="px-6 py-6 whitespace-nowrap">
                    <p
                      className={cn(
                        "text-xs font-bold",
                        log.status === "Critical Failure"
                          ? "text-red-500"
                          : "text-jagamn-primary",
                      )}
                    >
                      {log.timestamp}
                    </p>
                    <p className="text-[10px] font-bold text-slate-300 mt-1">
                      {log.timezone}
                    </p>
                  </td>
                  <td className="px-6 py-6 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-9 h-9 border border-gray-100 rounded-full">
                        <AvatarFallback
                          className={cn(
                            "text-[10px] font-black rounded-full",
                            log.user.isSystem
                              ? "bg-red-500 text-white"
                              : "bg-slate-100 text-jagamn-primary",
                          )}
                        >
                          {log.user.initials}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-xs font-bold text-jagamn-primary">
                          {log.user.name}
                        </p>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">
                          {log.user.role}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-sm bg-slate-100 text-[9px] font-black text-slate-500 uppercase">
                      {log.module}
                    </span>
                  </td>
                  <td className="px-6 py-6">
                    <div className="max-w-xs">
                      <p className="text-xs font-bold text-slate-600 leading-relaxed">
                        {log.action}
                      </p>
                      {log.transactionId && (
                        <p className="text-[10px] font-bold text-jagamn-tertiary mt-1">
                          Transaction ID: {log.transactionId}
                        </p>
                      )}
                      {log.details && (
                        <p
                          className={cn(
                            "text-[10px] font-bold mt-1",
                            log.status === "Critical Failure"
                              ? "text-red-500"
                              : "text-slate-400",
                          )}
                        >
                          {log.details}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-6 whitespace-nowrap">
                    <div className="text-left">
                      <p
                        className={cn(
                          "text-xs font-bold",
                          log.status === "Critical Failure"
                            ? "text-red-500"
                            : "text-slate-700",
                        )}
                      >
                        {log.ip}
                      </p>
                      <div className="flex items-center gap-1.5 mt-1 text-slate-300">
                        {log.location ? (
                          <span className="text-[10px] font-bold">
                            Location: {log.location}
                          </span>
                        ) : (
                          <>
                            <Laptop className="w-3 h-3" />
                            <span className="text-[10px] font-bold">
                              {log.device}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-6 text-right">
                    <div className="flex justify-end">
                      <div
                        className={cn(
                          "flex items-center gap-2 px-3 py-1 rounded-full border",
                          log.status === "Success"
                            ? "border-green-100 bg-green-50/50 text-green-600"
                            : "border-red-100 bg-red-50/50 text-red-600",
                        )}
                      >
                        <div
                          className={cn(
                            "w-1.5 h-1.5 rounded-full",
                            log.status === "Success"
                              ? "bg-green-500"
                              : "bg-red-500",
                          )}
                        />
                        <span className="text-[10px] font-bold">
                          {log.status}
                        </span>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── Pagination ──────────────────────────────── */}
        <div className="px-8 py-6 flex items-center justify-between bg-white border-t border-gray-100">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Showing <span className="text-jagamn-primary">1 - 20</span> of 1,429
            records
          </p>
          <div className="flex items-center gap-2">
            <button className="p-2 text-slate-300 hover:text-jagamn-primary transition-colors disabled:opacity-30">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-1">
              <button className="w-7 h-7 rounded-sm bg-jagamn-primary text-white text-[10px] font-black">
                1
              </button>
              <button className="w-7 h-7 rounded-sm hover:bg-slate-50 text-slate-400 text-[10px] font-black">
                2
              </button>
              <button className="w-7 h-7 rounded-sm hover:bg-slate-50 text-slate-400 text-[10px] font-black">
                3
              </button>
              <span className="text-slate-200 text-[10px] px-1">...</span>
              <button className="w-7 h-7 rounded-sm hover:bg-slate-50 text-slate-400 text-[10px] font-black">
                72
              </button>
            </div>
            <button className="p-2 text-slate-300 hover:text-jagamn-primary transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
