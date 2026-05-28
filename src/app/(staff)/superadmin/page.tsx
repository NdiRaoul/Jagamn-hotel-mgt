"use client";

import React, { useState } from "react";
import {
  Banknote,
  TrendingUp,
  BedDouble,
  Utensils,
  AlertCircle,
  ShieldAlert,
  ChevronRight,
  ChevronDown,
  ExternalLink,
  ShieldCheck,
  RefreshCcw,
  X,
  Loader2,
  History,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

// ── Components ──────────────────────────────────────

const MetricCard = ({
  title,
  value,
  pillText,
  pillType,
  subtext,
  icon: Icon,
}: any) => {
  const isPositive = pillType === "positive";
  const isNegative = pillType === "negative";

  return (
    <div className="bg-white p-6 md:p-8 rounded-sm shadow-[0_2px_10px_rgba(0,0,0,0.02)] border-l-4 border-l-[#0D2137] border-y border-r border-gray-100 flex flex-col justify-between">
      <div className="flex items-start justify-between mb-4">
        <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-[#0D2137]">
          <Icon className="w-4 h-4" />
        </div>
        <div
          className={cn(
            "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
            isPositive ? "bg-[#F4A261]/10 text-[#D9772A]" : "",
            isNegative ? "bg-red-50 text-red-600" : "",
          )}
        >
          {pillText}
        </div>
      </div>
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
          {title}
        </p>
        <h3 className="manrope-bold text-3xl text-[#0D2137] mb-2">{value}</h3>
        <p className="text-xs text-slate-500 font-medium">{subtext}</p>
      </div>
    </div>
  );
};

export default function ExecutiveOverviewPage() {
  const [showRetryModal, setShowRetryModal] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [showEscalationModal, setShowEscalationModal] = useState(false);
  const [escalationPriority, setEscalationPriority] = useState("Urgent");

  const handleRetry = () => {
    setIsRetrying(true);
    setTimeout(() => {
      setIsRetrying(false);
      setShowRetryModal(false);
    }, 2000);
  };

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-700">
      {/* ── Page Header ───────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2">
        <div>
          <h1 className="manrope-bold text-3xl text-jagamn-primary">
            Executive Overview
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Real-time consolidated metrics and critical actions.
          </p>
        </div>
        <div className="text-right">
          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
            Last Sync
          </p>
          <p className="text-sm manrope-bold text-jagamn-primary">2 mins ago</p>
        </div>
      </div>

      {/* ── Metrics Row ───────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          icon={Banknote}
          title="Total Revenue"
          value="$4.2M"
          pillText="+12.5%"
          pillType="positive"
          subtext="vs last fiscal year"
        />
        <MetricCard
          icon={TrendingUp}
          title="Net Profit"
          value="$1.8M"
          pillText="+8.2%"
          pillType="positive"
          subtext="consolidated margin 42%"
        />
        <MetricCard
          icon={BedDouble}
          title="Avg. Occupancy"
          value="84%"
          pillText="-2.1%"
          pillType="negative"
          subtext="peak seasonal variance"
        />
        <MetricCard
          icon={Utensils}
          title="F&B Revenue"
          value="$950K"
          pillText="+18.4%"
          pillType="positive"
          subtext="driven by Heritage Bar"
        />
      </div>

      {/* ── Main Layout (Charts & Critical Actions) ───── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Content (Charts & Status) */}
        <div className="lg:col-span-8 space-y-8">
          {/* Chart Container */}
          <div className="bg-white p-8 rounded-3xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-gray-100">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="manrope-bold text-xl text-[#0D2137]">
                  Financial Performance
                </h2>
                <p className="text-sm text-slate-500 font-medium">
                  12-month revenue vs net profit trend analysis
                </p>
              </div>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#0D2137]"></div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">
                    Revenue
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#F4A261]"></div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">
                    Profit
                  </span>
                </div>
              </div>
            </div>

            {/* Custom SVG Chart Area */}
            <div className="relative w-full h-[320px] overflow-visible">
              {/* Tooltip (Static for presentation) */}
              <div className="absolute top-1/2 left-[60%] -translate-x-1/2 -translate-y-[120%] bg-white p-4 rounded-xl shadow-2xl border border-gray-100 z-10 w-48">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">
                  Sept Performance
                </p>
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 font-semibold">
                      Revenue
                    </span>
                    <span className="manrope-bold text-[#0D2137]">$442K</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 font-semibold">
                      Net Profit
                    </span>
                    <span className="manrope-bold text-[#F4A261]">$198K</span>
                  </div>
                </div>
                {/* Pointer arrow */}
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-b border-r border-gray-100 transform rotate-45"></div>
              </div>

              {/* Grid Lines */}
              <div className="absolute inset-0 flex flex-col justify-between">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="w-full h-px bg-slate-100"></div>
                ))}
              </div>

              {/* Chart SVG */}
              <svg
                className="absolute inset-0 w-full h-full"
                preserveAspectRatio="none"
                viewBox="0 0 1000 300"
              >
                {/* Profit Line (Orange, dashed or solid with less stroke) */}
                <path
                  d="M 0 250 C 100 250, 150 200, 200 220 C 300 260, 350 150, 400 200 C 500 300, 550 200, 600 220 C 700 260, 750 100, 800 120 C 850 140, 900 200, 1000 150"
                  fill="none"
                  stroke="#F4A261"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Revenue Line (Dark Blue, thick) */}
                <path
                  d="M 0 200 C 100 200, 150 150, 200 180 C 300 220, 350 50, 400 100 C 500 200, 550 150, 600 180 C 650 200, 700 -50, 800 20 C 850 60, 900 150, 1000 100"
                  fill="none"
                  stroke="#0D2137"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>

              {/* X-Axis Labels */}
              <div className="absolute -bottom-8 left-0 right-0 flex justify-between text-[9px] font-black uppercase tracking-widest text-slate-400">
                <span>Jan</span>
                <span>Feb</span>
                <span>Mar</span>
                <span>Apr</span>
                <span>May</span>
                <span>Jun</span>
                <span>Jul</span>
                <span>Aug</span>
                <span>Sep</span>
                <span>Oct</span>
                <span>Nov</span>
                <span>Dec</span>
              </div>
            </div>
          </div>

          {/* Bottom Cards Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Image Card */}
            <div className="relative rounded-3xl overflow-hidden h-64 group shadow-lg">
              <img
                src="/images/classic-heritage.png"
                alt="Heritage Suite"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                onError={(e) => {
                  e.currentTarget.src =
                    "https://images.unsplash.com/photo-1542314831-c6a4d14d8c85?q=80&w=2070&auto=format&fit=crop";
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0D2137]/90 via-[#0D2137]/40 to-transparent"></div>
              <div className="absolute inset-x-0 bottom-0 p-8">
                <h3 className="manrope-bold text-xl text-white mb-2">
                  Heritage Suite Performance
                </h3>
                <p className="text-white/80 text-sm font-medium">
                  Review occupancy and guest satisfaction for premium wings.
                </p>
              </div>
            </div>

            {/* System Status Card */}
            <div className="bg-[#F8FAFC] rounded-3xl p-8 border border-gray-100 flex flex-col justify-between">
              <div>
                <h3 className="manrope-bold text-xl text-[#0D2137] mb-2">
                  System Status
                </h3>
                <p className="text-slate-500 text-sm font-medium leading-relaxed mb-6">
                  All primary hospitality modules are currently operational with
                  nominal latency.
                </p>
              </div>
              <div className="flex items-end justify-between">
                <div className="flex gap-6">
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">
                      Core API
                    </p>
                    <p className="manrope-bold text-lg text-[#F4A261]">
                      99.98%
                    </p>
                  </div>
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">
                      Gateway
                    </p>
                    <p className="manrope-bold text-lg text-[#F4A261]">12ms</p>
                  </div>
                </div>
                {/* Shield Icon styling to match design */}
                <div className="relative w-16 h-20 bg-transparent flex items-center justify-center">
                  <div className="absolute inset-0 border-[3px] border-[#F4A261] border-t-0 rounded-b-xl opacity-60"></div>
                  <ShieldCheck
                    className="w-8 h-8 text-[#0D2137] relative -top-2"
                    strokeWidth={1.5}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Content (Critical Actions Sidebar) */}
        <div className="lg:col-span-4">
          <div className="bg-[#F8FAFC] rounded-3xl p-6 md:p-8 h-full border border-gray-100 flex flex-col">
            <div className="flex items-center justify-between mb-8">
              <h2 className="manrope-bold text-lg text-[#0D2137]">
                Critical Actions
              </h2>
              <div className="bg-red-600 text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">
                3 Active
              </div>
            </div>

            <div className="space-y-4 flex-1">
              {/* Alert 1 */}
              <div
                onClick={() => setShowEscalationModal(true)}
                className="bg-white p-6 rounded-sm shadow-sm border-l-4 border-l-red-500 hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex gap-4">
                  <div className="shrink-0 mt-0.5">
                    <AlertCircle className="w-5 h-5 text-red-500" />
                  </div>
                  <div>
                    <h4 className="manrope-bold text-sm text-jagamn-primary mb-2">
                      Escalated Guest Complaint
                    </h4>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed mb-4">
                      Suite 402: Service delay & structural HVAC issue reported
                      twice.
                    </p>
                    <button className="text-[10px] font-black uppercase tracking-widest text-red-600 hover:text-red-700 flex items-center gap-1">
                      Assign Manager <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Alert 2 */}
              <div className="bg-white p-6 rounded-sm shadow-sm border-l-4 border-l-jagamn-tertiary hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex gap-4">
                  <div className="shrink-0 mt-0.5">
                    <RefreshCcw className="w-5 h-5 text-[#A57850]" />
                  </div>
                  <div>
                    <h4 className="manrope-bold text-sm text-[#0D2137] mb-2">
                      Financial Sync Failed
                    </h4>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed mb-4">
                      Stripe payout sync interrupted. Manual reconciliation
                      required for batch #8291.
                    </p>
                    <button
                      onClick={() => setShowRetryModal(true)}
                      className="text-[10px] font-black uppercase tracking-widest text-[#A57850] hover:text-[#8a6341] flex items-center gap-1 transition-colors"
                    >
                      Retry Sync <RefreshCcw className="w-3 h-3 ml-1" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Alert 3 */}
              <div className="bg-white p-6 rounded-sm shadow-sm border-l-4 border-l-[#0D2137] hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex gap-4">
                  <div className="shrink-0 mt-0.5">
                    <ShieldAlert className="w-5 h-5 text-[#0D2137]" />
                  </div>
                  <div>
                    <h4 className="manrope-bold text-sm text-[#0D2137] mb-2">
                      System Audit Alert
                    </h4>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed mb-4">
                      Unusual login detected from remote IP (Frankfurt, DE).
                      Administrative lock recommended.
                    </p>
                    <button className="text-[10px] font-black uppercase tracking-widest text-[#0D2137] hover:text-slate-700 flex items-center gap-1">
                      View Logs <ExternalLink className="w-3 h-3 ml-1" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-8 mt-4 border-t border-gray-200">
              <button className="w-full text-center text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-[#0D2137] transition-colors">
                View All System Alerts
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Assign Management Escalation Modal (Image 1) ───────────────────────────────── */}
      <Dialog open={showEscalationModal} onOpenChange={setShowEscalationModal}>
        <DialogContent className="sm:max-w-[450px] p-0 border-0 bg-transparent shadow-none [&>button]:hidden">
          <DialogTitle className="sr-only">
            Assign Management Escalation
          </DialogTitle>
          <div className="bg-[#EFEFEE] rounded-sm p-8 relative shadow-2xl">
            <button
              onClick={() => setShowEscalationModal(false)}
              className="absolute top-6 right-6 text-slate-500 hover:text-jagamn-primary transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-6">
              <span className="inline-block px-3 py-1 bg-red-100 text-red-500 text-[9px] font-black uppercase tracking-widest rounded-full mb-4">
                Priority: Critical
              </span>
              <h3 className="manrope-bold text-lg text-jagamn-primary mb-1">
                Assign Management Escalation
              </h3>
              <p className="text-sm text-slate-500 font-medium">
                Escalated Guest Complaint — Heritage Suite 402
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block">
                  Select Manager
                </label>
                <div className="relative">
                  <select className="w-full h-11 bg-transparent border border-slate-300 rounded-sm px-4 text-sm font-medium text-jagamn-primary appearance-none outline-none focus:border-jagamn-primary cursor-pointer">
                    <option value="">Assign a lead executive...</option>
                    <option value="manager1">
                      Sarah Jenkins - Guest Relations
                    </option>
                    <option value="manager2">Michael Chang - Operations</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block">
                  Priority Level
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {["Urgent", "High", "Medium"].map((level) => (
                    <button
                      key={level}
                      onClick={() => setEscalationPriority(level)}
                      className={cn(
                        "h-10 rounded-sm text-xs font-semibold transition-colors",
                        escalationPriority === level
                          ? "bg-jagamn-primary text-white"
                          : "bg-transparent border border-slate-300 text-slate-500 hover:border-jagamn-primary hover:text-jagamn-primary",
                      )}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block">
                  Assignment Notes
                </label>
                <textarea
                  className="w-full bg-transparent border border-slate-300 rounded-sm p-4 text-sm font-medium text-jagamn-primary placeholder:text-slate-400 outline-none focus:border-jagamn-primary resize-none h-24"
                  placeholder="Provide specific directives for the assigned manager..."
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  onClick={() => setShowEscalationModal(false)}
                  className="flex-1 h-12 bg-jagamn-primary hover:bg-[#1a365d] text-white rounded-sm manrope-bold shadow-lg transition-all text-sm"
                >
                  Confirm Assignment
                </Button>
                <Button
                  onClick={() => setShowEscalationModal(false)}
                  variant="outline"
                  className="flex-1 h-12 bg-transparent border border-slate-300 hover:bg-slate-100 text-slate-600 rounded-sm manrope-bold transition-all text-sm"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Retry Sync Modal (Image 3) ───────────────────────────────── */}
      <Dialog open={showRetryModal} onOpenChange={setShowRetryModal}>
        <DialogContent className="sm:max-w-[450px] p-0 border-0 bg-transparent shadow-none [&>button]:hidden">
          <DialogTitle className="sr-only">
            Retry Financial Synchronization
          </DialogTitle>
          <div className="bg-[#F8F9FA] rounded-sm p-8 relative shadow-2xl border-l-4 border-l-jagamn-primary">
            <button
              onClick={() => setShowRetryModal(false)}
              className="absolute top-6 right-6 text-slate-500 hover:text-[#0D2137] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 rounded-sm bg-[#FDECEE] flex items-center justify-center shrink-0">
                <RefreshCcw className="w-6 h-6 text-red-500" />
              </div>
              <div className="pt-1">
                <h3 className="manrope-bold text-lg text-[#0D2137] mb-1">
                  Retry Financial Synchronization
                </h3>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                  STATUS: FAILED (ERROR 408)
                </p>
              </div>
            </div>

            <p className="text-sm text-slate-600 mb-8 leading-relaxed font-medium">
              The last batch sync to the Multi-Business Aggregator failed due to
              a timeout (Error 408). Attempting to re-push the last 24 hours of
              financial data.
            </p>

            <div className="bg-white p-6 rounded-sm border border-gray-100 shadow-sm mb-8">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#F4A261]"></div>
                  <span className="text-sm manrope-bold text-[#0D2137]">
                    Connecting to Gateway...
                  </span>
                </div>
                <span className="text-sm manrope-bold text-[#0D2137]">45%</span>
              </div>
              <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden mb-4">
                <div className="h-full bg-[#0D2137] w-[45%] rounded-full"></div>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                <History className="w-3.5 h-3.5" />
                <span>Last successful sync: 14 May, 08:30 AM</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-6">
              <button
                onClick={() => setShowRetryModal(false)}
                className="text-sm manrope-bold text-[#0D2137] hover:text-slate-600 transition-colors"
              >
                Cancel Task
              </button>
              <Button
                onClick={handleRetry}
                disabled={isRetrying}
                className="h-12 bg-[#0D2137] hover:bg-[#1a365d] text-white rounded-sm manrope-bold px-8 shadow-lg transition-all text-sm"
              >
                {isRetrying ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCcw className="w-4 h-4 mr-2 text-[#F4A261]" />
                )}
                Retry Now
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
