"use client";

import { useState } from "react";
import { Download, CheckCircle2 } from "lucide-react";

interface ExportReportBarProps {
  activeTab: string;
}

export function ExportReportBar({ activeTab }: ExportReportBarProps) {
  const [exporting, setExporting] = useState(false);
  const [done, setDone] = useState(false);

  function handleExport() {
    setExporting(true);
    // TODO: GET /reports/export?type=activeTab → download file
    setTimeout(() => {
      setExporting(false);
      setDone(true);
      setTimeout(() => setDone(false), 3000);
    }, 1500);
  }

  return (
    <div className="mt-6 bg-gray-900 rounded-xl px-6 py-4 flex items-center justify-between">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-0.5">
          Palace Reserve · 2026 · Operations Intelligence
        </p>
        <p className="text-sm text-gray-300">
          Exporting: <span className="font-semibold text-white">{activeTab}</span>
        </p>
      </div>

      <div className="flex items-center gap-3">
        <span className="flex items-center gap-1.5 text-xs text-green-400 font-semibold">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          System Status: Optimal
        </span>

        <button
          onClick={handleExport}
          disabled={exporting || done}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${
            done
              ? "bg-green-600 text-white"
              : exporting
              ? "bg-gray-600 text-gray-300 cursor-default"
              : "bg-amber-500 hover:bg-amber-400 text-white active:scale-95"
          }`}
        >
          {done ? (
            <><CheckCircle2 className="w-4 h-4" /> Exported!</>
          ) : exporting ? (
            "Exporting…"
          ) : (
            <><Download className="w-4 h-4" /> Export Full Report</>
          )}
        </button>
      </div>
    </div>
  );
}