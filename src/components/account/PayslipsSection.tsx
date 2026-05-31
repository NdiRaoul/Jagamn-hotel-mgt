"use client";

import React, { useState, useEffect } from "react";
import {
  FileText,
  Download,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
} from "lucide-react";
import { formatMoneyMinor } from "@/lib/currency";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Payslip } from "@/lib/data/self-service";

const statusConfig: Record<string, { label: string; icon: React.ReactNode; className: string }> = {
  unpaid: {
    label: "Unpaid",
    icon: <Clock className="w-4 h-4" />,
    className: "bg-yellow-50 text-yellow-700 border-yellow-200",
  },
  processing: {
    label: "Processing",
    icon: <Clock className="w-4 h-4" />,
    className: "bg-blue-50 text-blue-700 border-blue-200",
  },
  paid: {
    label: "Paid",
    icon: <CheckCircle2 className="w-4 h-4" />,
    className: "bg-green-50 text-green-700 border-green-200",
  },
  failed: {
    label: "Failed",
    icon: <XCircle className="w-4 h-4" />,
    className: "bg-red-50 text-red-700 border-red-200",
  },
};

export function PayslipsSection() {
  const [payslips, setPayslips] = useState<Payslip[]>([]);
  const [staff, setStaff] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/account/payslips")
      .then((r) => r.json())
      .then((data) => {
        setPayslips(data.payslips || []);
        setStaff(data.staff);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const downloadPDF = async (payslip: Payslip) => {
    if (!staff) return;
    setIsGenerating(payslip.id);
    try {
      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const margin = 20;
      let yPos = margin;

      doc.setFontSize(20);
      doc.setTextColor(13, 33, 55);
      doc.text("JAGAMN PALACE", margin, yPos);
      yPos += 10;
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text("Payslip", margin, yPos);

      yPos += 15;
      doc.setFontSize(11);
      doc.setTextColor(13, 33, 55);
      const infoY = yPos;
      doc.text(`Employee: ${staff.full_name}`, margin, infoY);
      doc.text(`Email: ${staff.email}`, margin, infoY + 7);
      if (payslip.run) {
        doc.text(
          `Period: ${new Date(payslip.run.period_start).toLocaleDateString()} - ${new Date(payslip.run.period_end).toLocaleDateString()}`,
          margin,
          infoY + 14
        );
      }
      yPos = infoY + 30;

      const tableData = [
        ["Component", "Amount"],
        ["Gross Monthly Salary", formatMoneyMinor(payslip.gross_minor)],
        ["Deductions", formatMoneyMinor(payslip.deductions_minor)],
        ["Net Amount", formatMoneyMinor(payslip.net_minor)],
      ];

      (doc as any).autoTable({
        startY: yPos,
        head: [tableData[0]],
        body: tableData.slice(1),
        margin: { left: margin, right: margin },
        styles: { font: "helvetica", fontSize: 10, cellPadding: 6, textColor: [50, 50, 50] },
        headStyles: { fillColor: [232, 146, 74], textColor: [255, 255, 255], fontStyle: "bold" },
      });

      yPos = (doc as any).lastAutoTable.finalY + 20;
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      const status = statusConfig[payslip.payment_status] || statusConfig.unpaid;
      doc.text(`Status: ${status.label}`, margin, yPos);
      if (payslip.paid_at) {
        doc.text(`Paid on: ${new Date(payslip.paid_at).toLocaleDateString()}`, margin, yPos + 7);
      }

      doc.save(`payslip_${staff.full_name}_${payslip.run?.period_label ?? payslip.id}.pdf`);
    } finally {
      setIsGenerating(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {payslips.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center shadow-sm">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500 text-sm">No payslips available yet</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-50">
                  <th className="px-6 py-4 text-[10px] font-black text-[#43474D] uppercase tracking-widest">Period</th>
                  <th className="px-6 py-4 text-[10px] font-black text-[#43474D] uppercase tracking-widest text-right">Gross</th>
                  <th className="px-6 py-4 text-[10px] font-black text-[#43474D] uppercase tracking-widest text-right">Deductions</th>
                  <th className="px-6 py-4 text-[10px] font-black text-[#43474D] uppercase tracking-widest text-right">Net</th>
                  <th className="px-6 py-4 text-[10px] font-black text-[#43474D] uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-[10px] font-black text-[#43474D] uppercase tracking-widest text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {payslips.map((payslip) => {
                  const status = statusConfig[payslip.payment_status] || statusConfig.unpaid;
                  return (
                    <tr key={payslip.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-slate-400" />
                          <div>
                            <p className="manrope-bold text-sm text-[#0D2137]">
                              {payslip.run?.period_label ?? "Unknown"}
                            </p>
                            {payslip.run && (
                              <p className="text-xs text-slate-500">
                                {new Date(payslip.run.period_start).toLocaleDateString()} -{" "}
                                {new Date(payslip.run.period_end).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right text-sm text-slate-600">
                        {formatMoneyMinor(payslip.gross_minor)}
                      </td>
                      <td className="px-6 py-4 text-right text-sm text-slate-600">
                        {formatMoneyMinor(payslip.deductions_minor)}
                      </td>
                      <td className="px-6 py-4 text-right manrope-bold text-sm text-[#0D2137]">
                        {formatMoneyMinor(payslip.net_minor)}
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="outline" className={`flex items-center gap-1 w-fit ${status.className}`}>
                          {status.icon}
                          <span className="text-[10px] uppercase font-black">{status.label}</span>
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => downloadPDF(payslip)}
                          disabled={isGenerating === payslip.id}
                          className="text-[#E8924A] hover:text-[#E8924A] hover:bg-[#E8924A]/10"
                        >
                          {isGenerating === payslip.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Download className="w-4 h-4" />
                          )}
                          <span className="ml-2">PDF</span>
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
