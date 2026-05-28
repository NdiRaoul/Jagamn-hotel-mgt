"use client";

import React, { useState } from "react";
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  Banknote,
  Percent,
  Info,
  Plus,
  Calendar,
  ShieldCheck,
  UserCheck,
  Search,
  ChevronDown,
  Edit2,
  Image as ImageIcon,
  Check,
  X,
  Send,
  ShieldAlert,
  Utensils,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

const POLICIES = [
  {
    id: "p1",
    title: "Cancellation Policy",
    description: "Full refund for cancellations made 48 hours prior to arrival...",
    status: "ACTIVE",
    icon: Calendar,
    color: "bg-green-500",
  },
  {
    id: "p2",
    title: "No-Show Rules",
    description: "In the event of a no-show, the total cost of the first night will be...",
    status: "ACTIVE",
    icon: ShieldCheck,
    color: "bg-green-500",
  },
  {
    id: "p3",
    title: "HR Leave Accrual",
    description: "Full-time staff accrue 1.67 days per month. Maximum carry-over of 5",
    status: "UNDER REVIEW",
    icon: UserCheck,
    color: "bg-orange-400",
  },
];

const ICONS = [
  { id: "calendar", icon: Calendar },
  { id: "shield", icon: ShieldCheck },
  { id: "finance", icon: Banknote },
  { id: "fb", icon: Utensils },
  { id: "staff", icon: UserCheck },
  { id: "security", icon: ShieldAlert },
];

export default function SystemSettingsPage() {
  const [isPolicySheetOpen, setIsPolicySheetOpen] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState("calendar");

  const handleSaveSettings = () => {
    toast.success("System configurations updated successfully");
  };

  const handlePublishPolicy = () => {
    toast.success("New policy published and synchronized across all departments");
    setIsPolicySheetOpen(false);
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-10 pb-20 animate-in fade-in duration-700">
      {/* ── Header Area ──────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="manrope-bold text-3xl text-jagamn-primary">
            System Configuration
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Global architectural settings and institutional logic.
          </p>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search parameters..."
            className="w-full h-11 bg-white border-0 shadow-sm rounded-sm pl-12 text-sm focus-visible:ring-1 focus-visible:ring-jagamn-tertiary/20"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* ── Hotel Identity ──────────────────────────── */}
        <Card className="lg:col-span-7 p-8 border-0 shadow-sm rounded-sm relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1 h-full bg-jagamn-primary" />
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="manrope-bold text-lg text-jagamn-primary">Hotel Identity</h2>
              <p className="text-xs text-slate-400">Core architectural brand settings.</p>
            </div>
            <Building2 className="w-6 h-6 text-slate-200" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Name</label>
              <Input defaultValue="The Palace Heritage" className="h-12 bg-slate-50 border-0 rounded-sm font-medium text-jagamn-primary" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Primary Address</label>
              <Input defaultValue="12 Victoria Esplanade, London" className="h-12 bg-slate-50 border-0 rounded-sm font-medium text-jagamn-primary" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Contact Email</label>
              <Input defaultValue="ops@thepalaceheritage.com" className="h-12 bg-slate-50 border-0 rounded-sm font-medium text-jagamn-primary" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Contact Phone</label>
              <Input defaultValue="+44 20 7946 0122" className="h-12 bg-slate-50 border-0 rounded-sm font-medium text-jagamn-primary" />
            </div>
          </div>

          <div className="mt-10 pt-10 border-t border-slate-100 flex items-start gap-6">
             <div className="w-24 h-32 bg-jagamn-primary rounded-sm flex items-center justify-center p-4 relative overflow-hidden shadow-xl group/logo">
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                <img src="/images/logo-emblem.png" alt="Logo" className="w-12 h-12 object-contain relative z-10 brightness-200" />
             </div>
             <div className="flex-1 space-y-2">
                <h3 className="manrope-bold text-sm text-jagamn-primary">Official Brand Logo</h3>
                <p className="text-xs text-slate-400 leading-relaxed max-w-xs">
                  Recommended size: 512x512px. SVG or high-res PNG with transparency.
                </p>
                <button className="text-[10px] font-black text-jagamn-tertiary uppercase tracking-widest mt-2 hover:underline">
                  Replace Mark
                </button>
             </div>
          </div>
        </Card>

        {/* ── Financial Rules ─────────────────────────── */}
        <Card className="lg:col-span-5 p-8 border-0 shadow-sm rounded-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-jagamn-primary" />
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="manrope-bold text-lg text-jagamn-primary">Financial Rules</h2>
              <p className="text-xs text-slate-400">Global taxation and fiscal governance.</p>
            </div>
            <Banknote className="w-6 h-6 text-slate-200" />
          </div>

          <div className="space-y-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Default Currency</label>
              <div className="relative">
                <select className="w-full h-12 bg-slate-50 border-0 rounded-sm px-4 text-sm font-bold text-jagamn-primary appearance-none focus:ring-1 focus:ring-jagamn-tertiary/20">
                  <option>USD - US Dollar ($)</option>
                  <option>GBP - British Pound (£)</option>
                  <option>EUR - Euro (€)</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Standard VAT %</label>
                <div className="relative">
                  <Input defaultValue="20" className="h-12 bg-slate-50 border-0 rounded-sm px-4 text-center font-bold text-jagamn-primary" />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">%</span>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Service Charge %</label>
                <div className="relative">
                  <Input defaultValue="12.5" className="h-12 bg-slate-50 border-0 rounded-sm px-4 text-center font-bold text-jagamn-primary" />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">%</span>
                </div>
              </div>
            </div>

            <div className="bg-[#FFF8F1] border-l-4 border-jagamn-tertiary p-5 rounded-r-sm space-y-2">
              <div className="flex items-center gap-2 text-jagamn-tertiary">
                <Info className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">Legal Requirement</span>
              </div>
              <p className="text-[11px] text-jagamn-tertiary/80 font-medium leading-relaxed">
                Changes to VAT rates will take effect at 00:00 UTC on the next business day.
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* ── Global Policies ─────────────────────────── */}
      <Card className="p-8 border-0 shadow-sm rounded-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-jagamn-primary" />
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="manrope-bold text-lg text-jagamn-primary">Global Policies</h2>
            <p className="text-xs text-slate-400">Operational guidelines and institutional logic.</p>
          </div>

          <Sheet open={isPolicySheetOpen} onOpenChange={setIsPolicySheetOpen}>
            <SheetTrigger asChild>
              <Button className="h-12 bg-jagamn-primary hover:bg-jagamn-primary/90 text-white rounded-sm px-6 flex items-center gap-2 shadow-lg transition-all">
                <Plus className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-widest">Add New Policy</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:max-w-xl p-0 border-0 bg-white">
              <div className="h-full flex flex-col">
                <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-jagamn-neutral">
                  <div>
                    <nav className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">
                      <span>MANAGEMENT SUITE</span>
                      <span>/</span>
                      <span className="text-jagamn-primary">POLICY MANAGER</span>
                    </nav>
                    <SheetTitle className="manrope-bold text-xl text-jagamn-primary">Add New Policy</SheetTitle>
                  </div>
                  <button onClick={() => setIsPolicySheetOpen(false)} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar bg-white">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">POLICY NAME</label>
                    <Input placeholder="e.g., Late Check-out Grace Period" className="h-14 bg-slate-50 border-0 rounded-sm px-6 text-sm font-bold text-jagamn-primary placeholder:text-slate-300" />
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">POLICY CATEGORY</label>
                    <div className="relative">
                      <select className="w-full h-14 bg-slate-50 border-0 rounded-sm px-6 text-sm font-bold text-jagamn-primary appearance-none">
                        <option>Room Operations</option>
                        <option>Finance & Taxation</option>
                        <option>HR & Staffing</option>
                        <option>Food & Beverage</option>
                      </select>
                      <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">DESCRIPTION & RULES</label>
                    <div className="relative">
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-jagamn-primary rounded-full" />
                      <textarea
                        placeholder="Define the specific terms, conditions..."
                        className="w-full h-48 bg-slate-50 border-0 rounded-sm p-6 text-sm font-medium leading-relaxed placeholder:text-slate-300 focus:ring-0 focus:outline-none resize-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-6 pt-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Icon Representation</label>
                    <div className="grid grid-cols-3 gap-3">
                      {ICONS.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => setSelectedIcon(item.id)}
                          className={cn(
                            "h-20 rounded-sm border flex items-center justify-center transition-all",
                            selectedIcon === item.id
                              ? "bg-jagamn-primary border-jagamn-primary text-white shadow-lg"
                              : "bg-slate-50 border-transparent text-slate-400 hover:bg-slate-100"
                          )}
                        >
                          <item.icon className="w-6 h-6" />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-sm p-6 border-l-4 border-jagamn-tertiary flex items-center justify-between">
                    <div>
                      <p className="text-sm manrope-bold text-jagamn-primary">Policy Status</p>
                      <p className="text-[11px] text-slate-400 font-medium">Set to Active on publish</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>

                <div className="p-8 border-t border-slate-50 space-y-6">
                  <Button onClick={handlePublishPolicy} className="w-full h-14 bg-jagamn-primary hover:bg-jagamn-primary/90 text-white rounded-sm manrope-bold text-sm uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl">
                    Publish Policy
                    <Send className="w-4 h-4" />
                  </Button>
                  <p className="text-[10px] text-slate-400 text-center leading-relaxed font-medium px-4">
                    Publishing will immediately synchronize this policy across all departmental management portals.
                  </p>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {POLICIES.map((policy) => (
            <div key={policy.id} className="bg-slate-50 rounded-sm p-8 space-y-6 relative group border border-transparent hover:border-slate-200 transition-all">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 bg-white rounded-sm shadow-sm flex items-center justify-center">
                  <policy.icon className="w-5 h-5 text-jagamn-primary" />
                </div>
                <button className="p-2 text-slate-300 hover:text-jagamn-primary transition-colors">
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2">
                <h3 className="manrope-bold text-[15px] text-jagamn-primary">{policy.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                  {policy.description}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <div className={cn("w-1.5 h-1.5 rounded-full", policy.color)} />
                <span className={cn("text-[9px] font-black uppercase tracking-[0.15em]", policy.status === 'ACTIVE' ? 'text-green-600' : 'text-orange-500')}>
                  {policy.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* ── Footer Actions ───────────────────────────── */}
      <div className="flex items-center justify-end gap-4 mt-8">
        <Button variant="ghost" className="h-12 px-8 text-slate-400 font-bold text-sm hover:text-slate-600">
          Cancel
        </Button>
        <Button
          onClick={handleSaveSettings}
          className="h-14 px-12 bg-jagamn-primary hover:bg-jagamn-primary/90 text-white rounded-sm manrope-bold text-sm shadow-xl transition-all"
        >
          Save Changes
        </Button>
      </div>

      {/* ── System Stats Footer ─────────────────────── */}
      <div className="pt-12 border-t border-slate-200 flex flex-wrap items-center justify-between gap-8 text-[10px] font-black uppercase tracking-widest text-slate-400">
        <div className="flex items-center gap-10">
          <div className="flex items-center gap-4">
             <span>System Version:</span>
             <span className="text-slate-600">2.4.0-Stable</span>
          </div>
          <div className="flex items-center gap-4">
             <span>Last Audit:</span>
             <span className="text-slate-600">Oct 24, 2023 - 14:32</span>
          </div>
          <button className="hover:text-jagamn-primary transition-colors">Security Policy</button>
          <button className="hover:text-jagamn-primary transition-colors">Documentation</button>
        </div>
        <div className="text-right">
          © 2024 The Palace Heritage Admin
        </div>
      </div>
    </div>
  );
}
