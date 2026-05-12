"use client";

import React from "react";
import {
  TrendingUp,
  Bed,
  Utensils,
  ArrowRight,
  AlertCircle,
  FileText,
  UserPlus,
  Printer,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Wallet,
  Building2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export default function OperationsDashboard() {
  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* ── Page Header ────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-black text-jagamn-tertiary uppercase tracking-[0.2em] mb-1">
            System Pulse
          </p>
          <h1 className="manrope-bold text-4xl text-jagamn-primary">
            Operations Dashboard
          </h1>
        </div>
        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
            Live Operations
          </span>
        </div>
      </div>

      {/* ── Row 1: KPI Cards ─────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Revenue Card */}
        <div className="bg-jagamn-primary p-8 rounded-3xl text-white shadow-xl relative overflow-hidden group">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">
            Revenue Today
          </p>
          <div className="flex items-end justify-between">
            <div>
              <h2 className="manrope-bold text-5xl mb-3">$4,250</h2>
              <div className="flex items-center gap-1.5 text-green-400 text-xs font-bold">
                <TrendingUp className="w-4 h-4" />
                <span>+12.5% from yesterday</span>
              </div>
            </div>
            <div className="p-4 bg-white/5 rounded-2xl group-hover:bg-jagamn-tertiary transition-colors duration-500">
              <Wallet className="w-8 h-8 text-white" />
            </div>
          </div>
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-3xl group-hover:bg-jagamn-tertiary/20 transition-all duration-500" />
        </div>

        {/* Occupancy Card */}
        <div className="bg-white p-8 rounded-3xl border border-gray-100 border-l-4 border-l-jagamn-primary shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-8">
            <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
              <Bed className="w-6 h-6" />
            </div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Occupancy Rate
            </p>
          </div>
          <div>
            <h3 className="manrope-bold text-4xl text-jagamn-primary mb-2">
              78%
            </h3>
            <Progress value={78} indicatorClassName="bg-jagamn-tertiary" className="h-2 bg-gray-100" />
          </div>
        </div>

        {/* Food Orders Card */}
        <div className="bg-white p-8 rounded-3xl border border-gray-100 border-l-4 border-l-jagamn-primary shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-8">
            <div className="p-3 bg-orange-50 rounded-xl text-jagamn-tertiary">
              <Utensils className="w-6 h-6" />
            </div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Active Food Orders
            </p>
          </div>
          <div>
            <h3 className="manrope-bold text-4xl text-jagamn-primary mb-1">
              5
            </h3>
            <p className="text-xs text-gray-400 font-medium">Avg. Wait: 18m</p>
          </div>
        </div>
      </div>

      {/* ── Row 2: Quick Actions ─────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-jagamn-primary">
              <ArrowUpRight className="w-6 h-6 rotate-45" />
            </div>
            <div>
              <h4 className="manrope-bold text-2xl">12</h4>
              <p className="text-xs text-gray-400 font-medium tracking-tight">
                Pending Check-ins
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            className="h-10 rounded-lg text-xs font-black uppercase tracking-widest border-gray-200"
          >
            Review Queue
          </Button>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-jagamn-primary">
              <ArrowUpRight className="w-6 h-6 rotate-[135deg]" />
            </div>
            <div>
              <h4 className="manrope-bold text-2xl">8</h4>
              <p className="text-xs text-gray-400 font-medium tracking-tight">
                Pending Check-outs
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            className="h-10 rounded-lg text-xs font-black uppercase tracking-widest border-gray-200"
          >
            Verify Folios
          </Button>
        </div>
      </div>

      {/* ── Row 3: Alerts & Outlook ──────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Alerts Feed */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="manrope-bold text-xl text-jagamn-primary">
              Operational Alerts
            </h3>
            <button className="text-[10px] font-black text-jagamn-tertiary uppercase tracking-widest hover:underline">
              Mark all as seen
            </button>
          </div>

          <div className="space-y-4">
            {[
              {
                icon: AlertCircle,
                title: "Low-Stock Alert: Kitchen Staples",
                desc: "3 critical items below threshold: Premium Coffee, Organic Flour, Napkins.",
                tag: "CRITICAL",
                tagColor: "bg-red-50 text-red-600",
                borderColor: "border-l-red-500",
              },
              {
                icon: FileText,
                title: "Pending PO Approvals",
                desc: "Purchase order #8842 for Housekeeping Supplies requires signature.",
                tag: "1 ACTION",
                tagColor: "bg-blue-50 text-blue-600",
                borderColor: "border-l-jagamn-primary",
              },
              {
                icon: Calendar,
                title: "Pending Leave Requests",
                desc: "Requests from F&B Lead and Reception Staff pending review.",
                tag: "2 NEW",
                tagColor: "bg-orange-50 text-orange-600",
                borderColor: "border-l-jagamn-tertiary",
              },
            ].map((alert, i) => (
              <div
                key={i}
                className={cn(
                  "bg-white p-5 rounded-2xl border border-gray-100 border-l-4 flex items-center justify-between group hover:border-gray-200 transition-all",
                  alert.borderColor,
                )}
              >
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center shrink-0">
                    <alert.icon className="w-6 h-6 text-gray-400 group-hover:text-jagamn-tertiary transition-colors" />
                  </div>
                  <div>
                    <h5 className="manrope-bold text-sm text-jagamn-primary">
                      {alert.title}
                    </h5>
                    <p className="text-xs text-gray-400 mt-0.5">{alert.desc}</p>
                  </div>
                </div>
                <span
                  className={cn(
                    "px-3 py-1 rounded-full text-[9px] font-black tracking-tighter shrink-0",
                    alert.tagColor,
                  )}
                >
                  {alert.tag}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Weekend Outlook */}
        <div className="bg-jagamn-primary rounded-3xl p-8 text-white relative overflow-hidden">
          <h3 className="manrope-bold text-xl mb-3">Weekend Outlook</h3>
          <p className="text-xs text-gray-400 leading-relaxed mb-8">
            Forecast predicts 94% occupancy. Dynamic pricing recommended for
            remaining suites.
          </p>

          <div className="space-y-6 mb-10">
            {["FRIDAY", "SATURDAY"].map((day, i) => (
              <div key={day} className="space-y-2">
                <div className="flex justify-between text-[10px] font-black tracking-[0.2em] text-gray-500 uppercase">
                  <span>{day}</span>
                  <span className="text-white">{i === 0 ? "82%" : "96%"}</span>
                </div>
                <Progress 
                  value={i === 0 ? 82 : 96} 
                  indicatorClassName={i === 0 ? "bg-white" : "bg-jagamn-tertiary"} 
                  className="h-1 bg-white/10"
                />
              </div>
            ))}
          </div>

          <Button className="w-full bg-white text-jagamn-primary hover:bg-gray-100 manrope-bold rounded-xl py-6">
            Optimize Inventory
          </Button>

          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-3xl" />
        </div>
      </div>

      {/* ── Row 4: Staff Deployment ─────────────────── */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-gray-50 flex items-center justify-between">
          <h3 className="manrope-bold text-xl text-jagamn-primary">
            Live Staff Deployment
          </h3>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              className="text-xs font-black uppercase tracking-widest text-gray-400 gap-2"
            >
              <Printer className="w-4 h-4" />
              Print Report
            </Button>
            <Button className="bg-jagamn-primary text-white text-xs font-black uppercase tracking-widest px-6 rounded-lg">
              Manage Rota
            </Button>
          </div>
        </div>

        <table className="w-full">
          <thead>
            <tr className="bg-jagamn-neutral/50">
              <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">
                Department
              </th>
              <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">
                On-Duty
              </th>
              <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">
                Status
              </th>
              <th className="px-8 py-5 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">
                Coverage
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {[
              {
                dept: "Front Desk",
                icon: Bed,
                onDuty: "4 Staff members",
                status: "Full Coverage",
                statusColor: "text-green-500",
                coverage: "100%",
              },
              {
                dept: "Housekeeping",
                icon: Building2,
                onDuty: "12 Staff members",
                status: "High Load",
                statusColor: "text-orange-500",
                coverage: "85%",
              },
              {
                dept: "Food & Beverage",
                icon: Utensils,
                onDuty: "8 Staff members",
                status: "Active",
                statusColor: "text-green-500",
                coverage: "92%",
              },
            ].map((row, i) => (
              <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-8 py-6">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-jagamn-neutral rounded-lg">
                      <row.icon className="w-4 h-4 text-gray-400" />
                    </div>
                    <span className="manrope-bold text-sm text-jagamn-primary">
                      {row.dept}
                    </span>
                  </div>
                </td>
                <td className="px-8 py-6 text-xs text-gray-500 font-medium">
                  {row.onDuty}
                </td>
                <td className="px-8 py-6">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "w-1.5 h-1.5 rounded-full bg-current",
                        row.statusColor,
                      )}
                    />
                    <span
                      className={cn(
                        "text-[10px] font-bold uppercase tracking-widest",
                        row.statusColor,
                      )}
                    >
                      {row.status}
                    </span>
                  </div>
                </td>
                <td className="px-8 py-6 text-right manrope-bold text-sm text-jagamn-primary">
                  {row.coverage}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Footer ───────────────────────────────────── */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex items-center gap-6">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            The Palace CMS v2.4.0
          </p>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Main Server: Active
            </p>
          </div>
        </div>
        <p className="text-[9px] text-gray-300 font-medium">
          © 2024 Jagamn Palace Hotel & Resorts. Editorial Management Interface.
        </p>
      </div>
    </div>
  );
}
