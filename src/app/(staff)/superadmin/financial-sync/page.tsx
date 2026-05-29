"use client";

import React, { useState } from "react";
import {
  Copy,
  Eye,
  EyeOff,
  Zap,
  Clock,
  Moon,
  Info,
  Download,
  Check,
  X,
  Activity,
  Link as LinkIcon,
  Loader2
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

export default function FinancialSyncPage() {
  const [showToken, setShowToken] = useState(false);
  const [showTestModal, setShowTestModal] = useState(false);
  const [syncSchedule, setSyncSchedule] = useState("Hourly Batch");
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadLog = () => {
    setIsDownloading(true);
    setTimeout(() => {
      // Generate CSV content
      const csvContent = [
        "Status,Timestamp,Payload Size,Hash ID",
        "Success,Oct 24 2023 • 14:00:02,12.4 MB,7f8c...3a2e",
        "Failed,Oct 24 2023 • 13:00:01,-,0000...0000",
        "Success,Oct 24 2023 • 12:00:15,8.1 MB,a4b2...d1f9",
        "Success,Oct 24 2023 • 11:00:08,11.9 MB,e3f7...b8c2"
      ].join("\n");

      // Create Blob and download link
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", "sync_history_log.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setIsDownloading(false);
    }, 1500);
  };

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-700 max-w-7xl">
      {/* ── Page Header ───────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2">
        <div>
          <h1 className="manrope-bold text-3xl text-[#0D2137]">
            Financial Sync Aggregator
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage API bridges and data synchronization schedules.
          </p>
        </div>
      </div>

      {/* ── Top Row ───────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Endpoint Configuration */}
        <div className="lg:col-span-8">
          <div className="bg-white rounded-sm p-8 border-l-4 border-l-jagamn-primary shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col h-full">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h2 className="text-[#0D2137] manrope-bold text-xl mb-1">
                  Endpoint Configuration
                </h2>
                <p className="text-sm text-slate-500 font-medium">
                  Configure secure data bridges for cross-property
                  synchronization.
                </p>
              </div>
              <div className="text-slate-300">
                <LinkIcon className="w-6 h-6" />
              </div>
            </div>

            <div className="space-y-6 flex-1">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block">
                  Webhook URL
                </label>
                <div className="relative">
                  <Input
                    className="h-12 bg-slate-50 border-0 rounded-xl pr-10 text-sm font-medium text-slate-700 focus-visible:ring-1 focus-visible:ring-slate-300"
                    value="https://api.regencyaggregator.com/v1/sync/palace"
                    readOnly
                  />
                  <button className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block">
                  Authentication Token (Bearer)
                </label>
                <div className="relative">
                  <Input
                    className="h-12 bg-slate-50 border-0 rounded-xl pr-10 text-sm font-black text-slate-700 tracking-widest focus-visible:ring-1 focus-visible:ring-slate-300"
                    type={showToken ? "text" : "password"}
                    value="sk_test_51Nx...8zL"
                    readOnly
                  />
                  <button
                    onClick={() => setShowToken(!showToken)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showToken ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-8 flex items-center justify-end">
              <Button
                onClick={() => setShowTestModal(true)}
                className="w-full sm:w-auto h-12 bg-[#0D2137] hover:bg-[#1a365d] text-white rounded-xl manrope-bold px-8 shadow-lg flex items-center justify-center gap-2 transition-all"
              >
                <Zap className="w-4 h-4 fill-white/20" /> Test Connection
              </Button>
            </div>
          </div>
        </div>

        {/* Sync Schedule */}
        <div className="lg:col-span-4">
          <div className="bg-[#0D2137] rounded-sm p-8 shadow-lg flex flex-col h-full text-white border-l-4 border-l-jagamn-primary">
            <h2 className="manrope-bold text-xl mb-6">Sync Schedule</h2>

            <div className="space-y-4 flex-1">
              {[
                { id: "Real-Time", icon: Activity, color: "text-[#F4A261]" },
                { id: "Hourly Batch", icon: Clock },
                { id: "End of Day", icon: Moon, color: "text-slate-400" },
              ].map((option) => (
                <div 
                  key={option.id}
                  onClick={() => setSyncSchedule(option.id)}
                  className={cn(
                    "flex items-center justify-between p-4 rounded-sm cursor-pointer transition-all",
                    syncSchedule === option.id 
                      ? "bg-white text-[#0D2137] shadow-md border border-transparent" 
                      : "border border-white/10 hover:bg-white/5"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <option.icon className={cn("w-5 h-5", option.color)} />
                    <span className={cn("text-sm", syncSchedule === option.id ? "manrope-bold" : "manrope-semibold", option.color === "text-slate-400" && syncSchedule !== option.id ? "text-slate-300" : "")}>{option.id}</span>
                  </div>
                  <div className={cn(
                    "w-4 h-4 rounded-full",
                    syncSchedule === option.id 
                      ? "border-[4px] border-[#0D2137] bg-white" 
                      : "border border-white/30"
                  )}></div>
                </div>
              ))}
            </div>

            <div className="mt-8 flex items-start gap-3 text-slate-400">
              <Info className="w-5 h-5 shrink-0" />
              <p className="text-xs leading-relaxed font-medium">
                Hourly syncing reduces API overhead while maintaining fiscal
                precision.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom Row ───────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Data Payload Selection */}
        <div className="lg:col-span-4">
          <div className="bg-[#F8FAFC] rounded-sm p-8 border-l-4 border-l-jagamn-primary shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col h-full">
            <h2 className="manrope-bold text-xl text-[#0D2137] mb-6">
              Data Payload Selection
            </h2>

            <div className="space-y-4">
              {/* Checkbox 1 */}
              <div className="bg-white p-4 rounded-sm border border-gray-100 shadow-sm flex items-start gap-4">
                <div className="mt-1">
                  <div className="w-5 h-5 rounded-sm bg-[#0D2137] flex items-center justify-center text-white">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                </div>
                <div>
                  <h4 className="manrope-bold text-sm text-[#0D2137] mb-1">
                    Gross Revenue Streams
                  </h4>
                  <p className="text-xs text-slate-500 font-medium">
                    Room bookings, F&B, and services.
                  </p>
                </div>
              </div>
              {/* Checkbox 2 */}
              <div className="bg-white p-4 rounded-sm border border-gray-100 shadow-sm flex items-start gap-4">
                <div className="mt-1">
                  <div className="w-5 h-5 rounded-sm bg-[#0D2137] flex items-center justify-center text-white">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                </div>
                <div>
                  <h4 className="manrope-bold text-sm text-[#0D2137] mb-1">
                    Operational Expenses
                  </h4>
                  <p className="text-xs text-slate-500 font-medium">
                    Maintenance, utilities, and staffing.
                  </p>
                </div>
              </div>
              {/* Checkbox 3 */}
              <div className="bg-white p-4 rounded-sm border border-gray-100 shadow-sm flex items-start gap-4">
                <div className="mt-1">
                  <div className="w-5 h-5 rounded-sm bg-[#0D2137] flex items-center justify-center text-white">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                </div>
                <div>
                  <h4 className="manrope-bold text-sm text-[#0D2137] mb-1">
                    Tax Liability Estimates
                  </h4>
                  <p className="text-xs text-slate-500 font-medium">
                    Projected quarterly VAT and local tax.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Sync History */}
        <div className="lg:col-span-8">
          <div className="bg-white rounded-sm p-8 border-l-4 border-l-jagamn-primary border-y border-r border-y-gray-100 border-r-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col h-full">
            <div className="flex justify-between items-center mb-8">
              <h2 className="manrope-bold text-xl text-[#0D2137]">
                Recent Sync History
              </h2>
              <button 
                onClick={handleDownloadLog}
                disabled={isDownloading}
                className="flex items-center gap-2 text-xs manrope-bold text-[#0D2137] hover:text-[#1a365d] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />} Download Full Log
              </button>
            </div>

            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left min-w-[500px]">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                      Status
                    </th>
                    <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                      Timestamp
                    </th>
                    <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                      Payload Size
                    </th>
                    <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                      Hash ID
                    </th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  <tr className="border-b border-gray-50 hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 font-semibold text-[#0D2137] flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-[#F4A261]"></div>{" "}
                      Success
                    </td>
                    <td className="py-4 text-slate-600 font-medium">
                      Oct 24, 2023 • 14:00:02
                    </td>
                    <td className="py-4 text-slate-600 font-medium">12.4 MB</td>
                    <td className="py-4">
                      <span className="bg-slate-100 px-2 py-1 rounded-md text-xs font-mono text-slate-500">
                        7f8c...3a2e
                      </span>
                    </td>
                  </tr>
                  <tr className="border-b border-gray-50 hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 font-semibold text-[#0D2137] flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-red-500"></div>{" "}
                      Failed
                    </td>
                    <td className="py-4 text-slate-600 font-medium">
                      Oct 24, 2023 • 13:00:01
                    </td>
                    <td className="py-4 text-slate-600 font-medium">-</td>
                    <td className="py-4">
                      <span className="bg-slate-100 px-2 py-1 rounded-md text-xs font-mono text-slate-500">
                        0000...0000
                      </span>
                    </td>
                  </tr>
                  <tr className="border-b border-gray-50 hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 font-semibold text-[#0D2137] flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-[#F4A261]"></div>{" "}
                      Success
                    </td>
                    <td className="py-4 text-slate-600 font-medium">
                      Oct 24, 2023 • 12:00:15
                    </td>
                    <td className="py-4 text-slate-600 font-medium">8.1 MB</td>
                    <td className="py-4">
                      <span className="bg-slate-100 px-2 py-1 rounded-md text-xs font-mono text-slate-500">
                        a4b2...d1f9
                      </span>
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 font-semibold text-[#0D2137] flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-[#F4A261]"></div>{" "}
                      Success
                    </td>
                    <td className="py-4 text-slate-600 font-medium">
                      Oct 24, 2023 • 11:00:08
                    </td>
                    <td className="py-4 text-slate-600 font-medium">11.9 MB</td>
                    <td className="py-4">
                      <span className="bg-slate-100 px-2 py-1 rounded-md text-xs font-mono text-slate-500">
                        e3f7...b8c2
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* ── Test Connection Modal (Image 2) ───────────────────────────────── */}
      <Dialog open={showTestModal} onOpenChange={setShowTestModal}>
        <DialogContent className="sm:max-w-[400px] p-0 border-0 bg-transparent shadow-none [&>button]:hidden">
          <DialogTitle className="sr-only">Connection Successful</DialogTitle>
          <div className="bg-[#EFEFEE] rounded-sm p-8 relative flex flex-col items-center text-center shadow-2xl">
            <button
              onClick={() => setShowTestModal(false)}
              className="absolute top-6 right-6 text-slate-500 hover:text-[#0D2137] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-16 h-16 rounded-sm bg-[#FAD2B4] flex items-center justify-center mb-6 shadow-sm">
              <div className="w-8 h-8 rounded-full bg-[#0D2137] flex items-center justify-center text-white">
                <Check className="w-5 h-5 stroke-[3]" />
              </div>
            </div>

            <h3 className="manrope-bold text-xl text-[#0D2137] mb-3">
              Connection Successful
            </h3>
            <p className="text-sm text-slate-500 mb-8 max-w-[280px] font-medium leading-relaxed">
              Your handshake with the primary financial terminal was established
              with no latency errors.
            </p>

            <div className="w-full bg-white rounded-sm border border-gray-200 overflow-hidden mb-8 shadow-sm">
              <div className="flex divide-x divide-gray-100 border-b border-gray-100">
                <div className="flex-1 p-5">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                    Response Time
                  </p>
                  <p className="manrope-bold text-base text-[#0D2137]">240ms</p>
                </div>
                <div className="flex-1 p-5">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                    Status Code
                  </p>
                  <p className="manrope-bold text-base text-emerald-600">
                    200 OK
                  </p>
                </div>
              </div>
              <div className="p-5 bg-[#F8FAFC] text-left">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">
                  Validated Endpoint
                </p>
                <div className="bg-white border border-gray-100 shadow-sm rounded-sm p-3 flex items-center gap-3">
                  <LinkIcon className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="font-mono text-xs text-[#0D2137] truncate font-semibold">
                    api.regencysuite.finance/v1/sync/auth
                  </span>
                </div>
              </div>
            </div>

            <div className="w-full space-y-4">
              <Button
                onClick={() => setShowTestModal(false)}
                className="w-full h-12 bg-[#0D2137] hover:bg-[#1a365d] text-white rounded-sm manrope-bold shadow-lg transition-all text-[13px]"
              >
                Save Configuration <Copy className="w-4 h-4 ml-2 opacity-50" />
              </Button>
              <button
                className="text-[13px] text-slate-500 hover:text-[#0D2137] font-semibold transition-colors"
                onClick={() => setShowTestModal(false)}
              >
                Run Diagnostics Again
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
