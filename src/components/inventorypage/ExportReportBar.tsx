"use client";

import { useState } from "react";
import { Download, FileText, CheckCircle2 } from "lucide-react";
import { jsPDF } from "jspdf";
import { formatMoney } from "@/lib/currency";
import type { StoreReports } from "@/lib/data/storekeeper";

interface ExportReportBarProps {
  activeTab: string;
  reports?: StoreReports;
}

type Dataset = { title: string; headers: string[]; rows: (string | number)[][] };

function datasetFor(activeTab: string, r?: StoreReports): Dataset {
  if (!r) return { title: activeTab, headers: [], rows: [] };
  switch (activeTab) {
    case "Stock Movement":
      return {
        title: "Stock Movement (last 7 days)",
        headers: ["Day", "Inflow", "Outflow"],
        rows: r.stockMovement.map((m) => [m.day, m.inflow, m.outflow]),
      };
    case "Low Stock Report":
      return {
        title: "Low Stock Report",
        headers: ["Item", "Category", "On hand", "Reorder", "Unit"],
        rows: r.lowStock.map((l) => [
          l.name,
          l.category ?? "—",
          l.on_hand,
          l.reorder_level,
          l.unit,
        ]),
      };
    case "PO History":
      return {
        title: "Purchase Order History",
        headers: ["PO", "Supplier", "Items", "Total", "Status", "Date"],
        rows: r.poHistory.map((p) => [
          p.po_number,
          p.supplier_name ?? "—",
          p.item_count,
          formatMoney(p.total_xaf),
          p.status,
          new Date(p.created_at).toLocaleDateString(),
        ]),
      };
    case "Consumption Trends":
      return {
        title: "Consumption Trends",
        headers: ["Item", "Total qty issued"],
        rows: r.consumption.map((c) => [c.item_name, c.total_qty]),
      };
    case "Inventory Valuation":
    default:
      return {
        title: "Inventory Valuation by Category",
        headers: ["Category", "Value", "SKUs"],
        rows: r.valuationByCategory.map((v) => [
          v.category,
          formatMoney(v.value_xaf),
          v.skus,
        ]),
      };
  }
}

function toCsv(ds: Dataset): string {
  const esc = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
  return [ds.headers, ...ds.rows]
    .map((row) => row.map(esc).join(","))
    .join("\n");
}

function download(filename: string, content: string | Blob, type: string) {
  const blob =
    content instanceof Blob ? content : new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function ExportReportBar({ activeTab, reports }: ExportReportBarProps) {
  const [done, setDone] = useState<"csv" | "pdf" | null>(null);

  const flash = (kind: "csv" | "pdf") => {
    setDone(kind);
    setTimeout(() => setDone(null), 2500);
  };

  const exportCsv = () => {
    const ds = datasetFor(activeTab, reports);
    download(
      `${ds.title.replace(/\s+/g, "-").toLowerCase()}.csv`,
      toCsv(ds),
      "text/csv;charset=utf-8;",
    );
    flash("csv");
  };

  const exportPdf = () => {
    const ds = datasetFor(activeTab, reports);
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Jagamn Palace — Store Report", 14, 18);
    doc.setFontSize(11);
    doc.text(ds.title, 14, 27);
    doc.setFontSize(9);
    doc.text(new Date().toLocaleString(), 14, 33);

    let y = 44;
    const colX = ds.headers.map((_, i) => 14 + i * (182 / ds.headers.length));
    doc.setFont("helvetica", "bold");
    ds.headers.forEach((h, i) => doc.text(String(h), colX[i], y));
    doc.setFont("helvetica", "normal");
    y += 7;
    ds.rows.forEach((row) => {
      if (y > 280) {
        doc.addPage();
        y = 20;
      }
      row.forEach((cell, i) =>
        doc.text(String(cell).slice(0, 26), colX[i], y),
      );
      y += 7;
    });

    download(
      `${ds.title.replace(/\s+/g, "-").toLowerCase()}.pdf`,
      doc.output("blob"),
      "application/pdf",
    );
    flash("pdf");
  };

  return (
    <div className="mt-6 bg-jagamn-primary rounded-xl px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-0.5">
          Palace Reserve · Operations Intelligence
        </p>
        <p className="text-sm text-gray-300">
          Exporting: <span className="font-semibold text-white">{activeTab}</span>
        </p>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={exportCsv}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold transition-all bg-white/10 text-white hover:bg-white/20 active:scale-95"
        >
          {done === "csv" ? (
            <>
              <CheckCircle2 className="w-4 h-4" /> CSV ready
            </>
          ) : (
            <>
              <FileText className="w-4 h-4" /> Export CSV
            </>
          )}
        </button>
        <button
          onClick={exportPdf}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all bg-jagamn-tertiary hover:opacity-90 text-white active:scale-95"
        >
          {done === "pdf" ? (
            <>
              <CheckCircle2 className="w-4 h-4" /> PDF ready
            </>
          ) : (
            <>
              <Download className="w-4 h-4" /> Export PDF
            </>
          )}
        </button>
      </div>
    </div>
  );
}
