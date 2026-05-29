"use client";

import React, { useState } from "react";
import {
  X,
  ChevronDown,
  AlertCircle,
  ShieldAlert,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";

import { toast } from "sonner";

const ALERTS = [
  {
    id: "ERR-9024",
    module: "Audit Alerts",
    status: "URGENT",
    title: "Financial Sync Failure: Midnight Audit Interrupted",
    description: "The nightly synchronization with Central Revenue Authority failed at 00:05. Manual reconciliation required for 402 entries.",
    time: "Today, 12:45 AM",
    action: "Take Action",
    type: "critical"
  },
  {
    id: "CMP-1102",
    module: "Guest Complaints",
    status: "PENDING",
    title: "Suite 402: Climate Control System Malfunction",
    description: "Guest reported temperature stuck at 18°C. Engineering notified, but guest demands room move or service credit.",
    time: "Today, 09:12 AM",
    action: "Take Action",
    type: "warning"
  },
  {
    id: "PRO-552",
    module: "Procurement",
    status: "PENDING",
    title: "Critical Stock Alert: Egyptian Cotton Linens",
    description: "Inventory levels for Heritage King sets have dropped below the 15% threshold. Reorder pending signature.",
    time: "Yesterday, 04:30 PM",
    action: "Take Action",
    type: "warning"
  },
  {
    id: "SYS-004",
    module: "System Settings",
    status: "RESOLVED",
    title: "API Gateway Latency Spike",
    description: "Temporary 500ms delay observed in external concierge integrations. Auto-scaled server nodes resolved the issue.",
    time: "Yesterday, 11:20 AM",
    action: "View Log",
    type: "success"
  },
  {
    id: "SEC-011",
    module: "Security Alerts",
    status: "URGENT",
    title: "Unplanned Access: Server Room B",
    description: "Manual keycard bypass detected on Server Room B at the West Wing. Security footage currently being indexed.",
    time: "Today, 01:10 AM",
    action: "Take Action",
    type: "critical"
  }
];

export default function SystemAlertCenter() {
  const [activeTab, setActiveTab] = useState("All Alerts");
  const [selectedAlert, setSelectedAlert] = useState<(typeof ALERTS)[0] | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [assignedSpecialist, setAssignedSpecialist] = useState("Finance Director - Elena Vance");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleResolve = async () => {
    if (!resolutionNotes.trim()) {
      toast.error("Please enter resolution notes before completing.");
      return;
    }

    setIsProcessing(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    toast.success(`Alert ${selectedAlert?.id} resolved successfully`, {
      description: `Assigned to ${assignedSpecialist}`
    });

    setIsProcessing(false);
    setSelectedAlert(null);
    setResolutionNotes("");
  };

  const handleEscalate = async () => {
    setIsProcessing(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));

    toast.warning(`Alert ${selectedAlert?.id} escalated to Executive Board`);

    setIsProcessing(false);
    setSelectedAlert(null);
    setResolutionNotes("");
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-20 animate-in fade-in duration-700">
      <div className="max-w-7xl mx-auto pt-8 md:pt-12 space-y-10 md:space-y-12 px-4 md:px-0">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div className="space-y-2">
            <p className="text-[10px] font-black text-jagamn-primary/40 uppercase tracking-[0.4em]">
              REAL-TIME OPERATIONS
            </p>
            <h1 className="manrope-bold text-3xl md:text-5xl text-jagamn-primary tracking-tight">
              System Alert Center
            </h1>
            <p className="text-slate-400 font-medium max-w-2xl text-sm md:text-base">
              Monitor and resolve critical system events, guest complaints, and operational bottlenecks.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-6 px-6 py-4 bg-white rounded-sm border border-gray-100 shadow-sm">
              <div className="border-l-[3px] border-jagamn-primary pl-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">
                  Active Urgent
                </p>
                <p className="manrope-bold text-xl text-jagamn-primary">04</p>
              </div>
              <div className="border-l-[3px] border-jagamn-tertiary pl-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">
                  Pending Actions
                </p>
                <p className="manrope-bold text-xl text-jagamn-tertiary">12</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 bg-white/50 p-1 rounded-sm w-fit border border-gray-100 shadow-sm">
          {["All Alerts", "Urgent", "Guest Complaints", "Sync Failures", "Resolved"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-6 py-2 rounded-sm text-xs font-bold transition-all",
                activeTab === tab
                  ? "bg-white text-jagamn-primary shadow-sm"
                  : "text-slate-400 hover:text-slate-600"
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Alerts List */}
        <div className="space-y-4">
          {ALERTS.map((alert) => (
            <div
              key={alert.id}
              className={cn(
                "bg-white rounded-sm border border-gray-100 shadow-sm p-6 flex items-start gap-6 border-l-4 transition-all hover:shadow-md",
                alert.type === "critical" ? "border-l-red-500" :
                alert.type === "warning" ? "border-l-jagamn-tertiary" :
                "border-l-slate-400"
              )}
            >
              <div className={cn(
                "w-12 h-12 rounded-sm flex items-center justify-center shrink-0",
                alert.type === "critical" ? "bg-red-50 text-red-500" :
                alert.type === "warning" ? "bg-orange-50 text-jagamn-tertiary" :
                "bg-slate-50 text-slate-400"
              )}>
                {alert.type === "critical" ? <ShieldAlert className="w-5 h-5" /> :
                 alert.type === "warning" ? <AlertCircle className="w-5 h-5" /> :
                 <CheckCircle2 className="w-5 h-5" />}
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className={cn(
                    "px-2 py-0.5 rounded-sm text-[8px] font-black uppercase tracking-widest",
                    alert.status === "URGENT" ? "bg-red-500 text-white" :
                    alert.status === "PENDING" ? "bg-jagamn-tertiary/20 text-jagamn-tertiary" :
                    "bg-slate-100 text-slate-500"
                  )}>
                    {alert.status}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                    ID: {alert.id} • {alert.module}
                  </span>
                </div>
                <h3 className="manrope-bold text-sm text-jagamn-primary mb-1">
                  {alert.title}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">
                  {alert.description}
                </p>
              </div>

              <div className="text-right shrink-0">
                <p className="text-[10px] font-bold text-slate-400 mb-4">
                  {alert.time}
                </p>
                <Button
                  variant={alert.status === "RESOLVED" ? "outline" : "default"}
                  className={cn(
                    "h-9 px-6 rounded-sm text-[10px] font-black uppercase tracking-widest",
                    alert.status !== "RESOLVED"
                      ? "bg-jagamn-primary hover:bg-jagamn-primary/90 text-white"
                      : "border-slate-200 text-slate-400"
                  )}
                  onClick={() => alert.status !== "RESOLVED" && setSelectedAlert(alert)}
                >
                  {alert.action}
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="mt-12 flex items-center justify-between border-t border-gray-100 pt-6">
          <p className="text-[10px] font-bold text-slate-400">
            Showing <span className="text-slate-600">5 of 42</span> active system events
          </p>
          <div className="flex items-center gap-2">
            <button className="p-2 text-slate-400 hover:text-jagamn-primary transition-colors disabled:opacity-30" disabled>
              <ChevronDown className="w-4 h-4 rotate-90" />
            </button>
            <div className="flex items-center gap-1">
              <button className="w-6 h-6 rounded-sm bg-jagamn-primary text-white text-[10px] font-black">1</button>
              <button className="w-6 h-6 rounded-sm hover:bg-slate-100 text-slate-400 text-[10px] font-black">2</button>
              <button className="w-6 h-6 rounded-sm hover:bg-slate-100 text-slate-400 text-[10px] font-black">3</button>
              <span className="text-slate-300 text-[10px] px-1">...</span>
              <button className="w-6 h-6 rounded-sm hover:bg-slate-100 text-slate-400 text-[10px] font-black">8</button>
            </div>
            <button className="p-2 text-slate-400 hover:text-jagamn-primary transition-colors">
              <ChevronDown className="w-4 h-4 -rotate-90" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Resolve Alert Sheet ──────────────────────── */}
      <Sheet open={!!selectedAlert} onOpenChange={(open) => !open && setSelectedAlert(null)}>
        <SheetContent showCloseButton={false} className="overflow-y-auto sm:max-w-[500px] p-0 border-l border-gray-100 shadow-2xl flex flex-col gap-0 outline-none">
          {/* Header */}
          <div className="p-10 border-b border-gray-50 flex items-center justify-between bg-white shrink-0">
            <SheetTitle className="manrope-bold text-2xl text-jagamn-primary">Resolve Alert</SheetTitle>
            <SheetClose asChild>
              <button className="p-2 text-slate-400 hover:text-red-500 transition-colors focus:outline-none">
                <X className="w-6 h-6" />
              </button>
            </SheetClose>
          </div>

          {/* Scrollable Content */}
          <div className="p-10 space-y-12 custom-scrollbar bg-white">
            {/* Selected Priority Info Card */}
            {selectedAlert && (
              <div className="bg-slate-100 rounded-sm p-10 space-y-4">
                <p className="text-[10px] font-black text-jagamn-tertiary uppercase tracking-[0.25em]">
                  SELECTED PRIORITY
                </p>
                <h3 className="manrope-bold text-xl text-jagamn-primary leading-tight">
                  {selectedAlert.title}
                </h3>
              </div>
            )}

            {/* Resolution Notes Section */}
            <div className="space-y-5">
              <label className="text-[11px] font-black text-jagamn-primary uppercase tracking-[0.2em]">
                RESOLUTION NOTES
              </label>
              <textarea
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                placeholder="Enter resolution details or escalation steps..."
                className="w-full h-56 bg-slate-50/50 border border-slate-100 rounded-sm p-6 text-sm font-medium placeholder:text-slate-300 focus:outline-none focus:border-jagamn-tertiary focus:bg-white transition-all resize-none shadow-sm leading-relaxed"
              />
            </div>

            {/* Assign Specialist Section */}
            <div className="space-y-5">
              <label className="text-[11px] font-black text-jagamn-primary uppercase tracking-[0.2em]">
                ASSIGN SPECIALIST
              </label>
              <div className="relative">
                <select
                  value={assignedSpecialist}
                  onChange={(e) => setAssignedSpecialist(e.target.value)}
                  className="w-full h-14 bg-slate-50/50 border border-slate-100 rounded-sm px-6 text-sm font-bold text-jagamn-primary appearance-none focus:outline-none focus:border-jagamn-tertiary focus:bg-white transition-all shadow-sm"
                >
                  <option>Finance Director - Elena Vance</option>
                  <option>System Admin - Marcus Vance</option>
                  <option>Ops Manager - Sarah Jenkins</option>
                </select>
                <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-10 bg-white border-t border-gray-100 space-y-4 shadow-[0_-10px_30px_rgba(0,0,0,0.04)] shrink-0">
            <Button
              disabled={isProcessing}
              onClick={handleResolve}
              className="w-full h-14 bg-jagamn-tertiary hover:bg-jagamn-tertiary/90 text-white manrope-bold rounded-sm shadow-sm transition-all text-base font-bold"
            >
              {isProcessing ? "Processing..." : "Complete Resolution"}
            </Button>
            <Button
              disabled={isProcessing}
              onClick={handleEscalate}
              className="w-full h-14 bg-slate-100 text-jagamn-primary manrope-bold rounded-sm hover:bg-slate-200 transition-all text-base font-bold"
            >
              Escalate to Executive Board
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
