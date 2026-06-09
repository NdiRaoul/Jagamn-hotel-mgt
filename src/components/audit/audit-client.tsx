"use client";

import { useMemo, useState } from "react";
import { Search, FileText, Download, Shield, Activity } from "lucide-react";
import { jsPDF } from "jspdf";
import type { AuditLogEntry } from "@/lib/data/audit";

type Tab = "operations" | "logins";

function fmt(ts: string) {
  return new Date(ts).toLocaleString();
}

function download(filename: string, content: string | Blob, type: string) {
  const blob = content instanceof Blob ? content : new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function AuditClient({ logs }: { logs: AuditLogEntry[] }) {
  const [tab, setTab] = useState<Tab>("operations");
  const [search, setSearch] = useState("");

  const { operations, logins } = useMemo(() => {
    const ops: AuditLogEntry[] = [];
    const lg: AuditLogEntry[] = [];
    for (const l of logs) {
      (l.action.startsWith("auth.") ? lg : ops).push(l);
    }
    return { operations: ops, logins: lg };
  }, [logs]);

  const current = tab === "operations" ? operations : logins;
  const rows = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return current;
    return current.filter(
      (l) =>
        l.action.toLowerCase().includes(q) ||
        (l.actor_role ?? "").toLowerCase().includes(q) ||
        (l.target_type ?? "").toLowerCase().includes(q) ||
        JSON.stringify(l.payload ?? {})
          .toLowerCase()
          .includes(q),
    );
  }, [current, search]);

  function dataset() {
    if (tab === "logins") {
      return {
        title: "Audit — Logins",
        headers: ["When", "User", "Role", "Device", "Location", "IP"],
        rows: rows.map((l) => [
          fmt(l.created_at),
          l.payload?.name ?? l.payload?.email ?? l.actor_id ?? "—",
          l.actor_role ?? "—",
          l.payload?.device ?? "—",
          l.payload?.location ?? "—",
          l.ip ?? "—",
        ]),
      };
    }
    return {
      title: "Audit — Operations",
      headers: ["When", "Action", "Role", "Target", "IP"],
      rows: rows.map((l) => [
        fmt(l.created_at),
        l.action,
        l.actor_role ?? "—",
        `${l.target_type ?? ""}${l.target_id ? `:${l.target_id.slice(0, 8)}` : ""}`,
        l.ip ?? "—",
      ]),
    };
  }

  function exportCsv() {
    const ds = dataset();
    const esc = (v: string) => `"${String(v).replace(/"/g, '""')}"`;
    const csv = [ds.headers, ...ds.rows]
      .map((r) => r.map(esc).join(","))
      .join("\n");
    download(`${ds.title.replace(/\s+/g, "-").toLowerCase()}.csv`, csv, "text/csv");
  }

  function exportPdf() {
    const ds = dataset();
    const doc = new jsPDF({ orientation: "landscape" });
    doc.setFontSize(15);
    doc.text("Jagamn Palace — " + ds.title, 14, 16);
    doc.setFontSize(8);
    doc.text(new Date().toLocaleString(), 14, 22);
    let y = 32;
    const colX = ds.headers.map((_, i) => 14 + i * (270 / ds.headers.length));
    doc.setFont("helvetica", "bold");
    ds.headers.forEach((h, i) => doc.text(String(h), colX[i], y));
    doc.setFont("helvetica", "normal");
    y += 6;
    ds.rows.forEach((row) => {
      if (y > 200) {
        doc.addPage();
        y = 20;
      }
      row.forEach((c, i) => doc.text(String(c).slice(0, 34), colX[i], y));
      y += 6;
    });
    download(
      `${ds.title.replace(/\s+/g, "-").toLowerCase()}.pdf`,
      doc.output("blob"),
      "application/pdf",
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-jagamn-tertiary">
            Security &amp; Compliance
          </p>
          <h1 className="manrope-bold text-3xl text-jagamn-primary">Audit Logs</h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={exportCsv}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold bg-white border border-gray-200 text-jagamn-primary hover:bg-gray-50"
          >
            <FileText className="w-4 h-4" /> CSV
          </button>
          <button
            onClick={exportPdf}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold bg-jagamn-primary text-white hover:bg-jagamn-primary/90"
          >
            <Download className="w-4 h-4" /> PDF
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200">
        <TabBtn
          active={tab === "operations"}
          onClick={() => setTab("operations")}
          icon={Activity}
          label={`Operations (${operations.length})`}
        />
        <TabBtn
          active={tab === "logins"}
          onClick={() => setTab("logins")}
          icon={Shield}
          label={`Logins (${logins.length})`}
        />
      </div>

      <div className="relative w-full sm:max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search logs…"
          className="w-full h-11 pl-10 pr-3 rounded-lg bg-white border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-jagamn-primary"
        />
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px]">
            <thead>
              <tr className="bg-jagamn-primary text-white text-[10px] uppercase tracking-widest">
                {tab === "logins" ? (
                  <>
                    <th className="text-left px-5 py-3">When</th>
                    <th className="text-left px-4 py-3">User</th>
                    <th className="text-left px-4 py-3">Role</th>
                    <th className="text-left px-4 py-3">Device</th>
                    <th className="text-left px-4 py-3">Location</th>
                    <th className="text-left px-4 py-3">IP</th>
                  </>
                ) : (
                  <>
                    <th className="text-left px-5 py-3">When</th>
                    <th className="text-left px-4 py-3">Action</th>
                    <th className="text-left px-4 py-3">Role</th>
                    <th className="text-left px-4 py-3">Target</th>
                    <th className="text-left px-4 py-3">IP</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {rows.map((l, idx) => (
                <tr
                  key={l.id}
                  className={`border-b border-gray-50 text-sm ${idx % 2 ? "bg-gray-50/40" : "bg-white"}`}
                >
                  <td className="px-5 py-3 text-gray-500 whitespace-nowrap">
                    {fmt(l.created_at)}
                  </td>
                  {tab === "logins" ? (
                    <>
                      <td className="px-4 py-3 font-semibold text-jagamn-primary">
                        {l.payload?.name ?? l.payload?.email ?? "—"}
                      </td>
                      <td className="px-4 py-3 capitalize text-gray-600">
                        {l.actor_role ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {l.payload?.device ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {l.payload?.location ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-gray-400">{l.ip ?? "—"}</td>
                    </>
                  ) : (
                    <>
                      <td className="px-4 py-3 font-semibold text-jagamn-primary">
                        {l.action}
                      </td>
                      <td className="px-4 py-3 capitalize text-gray-600">
                        {l.actor_role ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {l.target_type ?? "—"}
                        {l.target_id ? `:${l.target_id.slice(0, 8)}` : ""}
                      </td>
                      <td className="px-4 py-3 text-gray-400">{l.ip ?? "—"}</td>
                    </>
                  )}
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="text-center py-12 text-sm text-gray-400 italic"
                  >
                    No {tab} records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function TabBtn({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ElementType;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 -mb-px transition-colors ${
        active
          ? "border-jagamn-tertiary text-jagamn-primary"
          : "border-transparent text-gray-400 hover:text-jagamn-primary"
      }`}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );
}
