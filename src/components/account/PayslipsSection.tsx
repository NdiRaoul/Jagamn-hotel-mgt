"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Download, FileText } from "lucide-react";
import { formatMoney } from "@/lib/currency";
import jsPDF from "jspdf";

interface Payslip {
  id: string;
  payroll_run_id: string;
  staff_id: string;
  base_salary_minor: number;
  deductions_minor: number;
  net_pay_minor: number;
  status: string;
  paid_at: string | null;
  run_period_start: string;
  run_period_end: string;
  run_status: string;
  deduction_lines?: {
    type: string;
    reason: string | null;
    amount_minor: number;
  }[];
}

interface StaffInfo {
  id: string;
  full_name: string;
  email: string;
}

export function PayslipsSection() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [payslips, setPayslips] = useState<Payslip[]>([]);
  const [staff, setStaff] = useState<StaffInfo | null>(null);

  useEffect(() => {
    loadPayslips();
  }, []);

  async function loadPayslips() {
    try {
      setLoading(true);
      const res = await fetch("/api/account/payslips");
      if (!res.ok) throw new Error("Failed to load payslips");
      const data = await res.json();
      setPayslips(data.payslips || []);
      setStaff(data.staff || null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  function downloadPayslip(payslip: Payslip) {
    if (!staff) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Header
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("Jagamn Palace", pageWidth / 2, 20, { align: "center" });

    doc.setFontSize(16);
    doc.text("Payslip", pageWidth / 2, 30, { align: "center" });

    // Period
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const periodStart = new Date(payslip.run_period_start).toLocaleDateString();
    const periodEnd = new Date(payslip.run_period_end).toLocaleDateString();
    doc.text(`Period: ${periodStart} - ${periodEnd}`, pageWidth / 2, 40, {
      align: "center",
    });

    // Staff Info
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Employee Information", 20, 55);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Name: ${staff.full_name}`, 20, 65);
    doc.text(`Email: ${staff.email}`, 20, 72);
    doc.text(`Employee ID: ${staff.id.slice(0, 8)}`, 20, 79);

    // Payment Details
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Payment Details", 20, 95);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(
      `Base Salary: ${formatMoney(Math.round(payslip.base_salary_minor / 100))}`,
      20,
      105,
    );
    doc.text(
      `Deductions: ${formatMoney(Math.round(payslip.deductions_minor / 100))}`,
      20,
      112,
    );

    // Net Pay (highlighted)
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(`Net Pay: ${formatMoney(Math.round(payslip.net_pay_minor / 100))}`, 20, 125);

    // Status
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Status: ${payslip.status.toUpperCase()}`, 20, 135);
    if (payslip.paid_at) {
      doc.text(
        `Paid On: ${new Date(payslip.paid_at).toLocaleDateString()}`,
        20,
        142,
      );
    }

    // Deduction breakdown (reason + amount)
    if (payslip.deduction_lines && payslip.deduction_lines.length > 0) {
      let dy = 156;
      doc.setFont("helvetica", "bold");
      doc.text("Deduction Breakdown", 20, dy);
      doc.setFont("helvetica", "normal");
      dy += 7;
      payslip.deduction_lines.forEach((d) => {
        const label = `${d.type}${d.reason ? ` — ${d.reason}` : ""}`;
        doc.text(label.slice(0, 70), 20, dy);
        doc.text(
          `-${formatMoney(Math.round(d.amount_minor / 100))}`,
          pageWidth - 20,
          dy,
          { align: "right" },
        );
        dy += 7;
      });
    }

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(
      "This is a computer-generated document. No signature required.",
      pageWidth / 2,
      280,
      { align: "center" },
    );

    // Save
    const filename = `payslip_${periodStart.replace(/\//g, "-")}_${staff.full_name.replace(/\s+/g, "_")}.pdf`;
    doc.save(filename);

    toast({
      title: "Success",
      description: "Payslip downloaded",
    });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-jagamn-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-jagamn-primary mb-4">
          My Payslips
        </h3>
        <div className="space-y-3">
          {payslips.map((payslip) => (
            <div
              key={payslip.id}
              className="p-4 bg-white rounded-lg border border-gray-200 hover:border-jagamn-primary transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <FileText className="w-5 h-5 text-jagamn-primary" />
                    <h4 className="font-bold text-jagamn-primary">
                      {new Date(payslip.run_period_start).toLocaleDateString()}{" "}
                      - {new Date(payslip.run_period_end).toLocaleDateString()}
                    </h4>
                    <span
                      className={`px-2 py-1 text-xs font-bold uppercase tracking-wider rounded ${
                        payslip.status === "paid"
                          ? "bg-green-100 text-green-700"
                          : payslip.status === "approved"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {payslip.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500 text-xs uppercase tracking-wider">
                        Base Salary
                      </p>
                      <p className="font-medium text-jagamn-primary">
                        {formatMoney(Math.round(payslip.base_salary_minor / 100))}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs uppercase tracking-wider">
                        Deductions
                      </p>
                      <p className="font-medium text-red-600">
                        {formatMoney(Math.round(payslip.deductions_minor / 100))}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs uppercase tracking-wider">
                        Net Pay
                      </p>
                      <p className="font-bold text-jagamn-primary text-lg">
                        {formatMoney(Math.round(payslip.net_pay_minor / 100))}
                      </p>
                    </div>
                  </div>
                  {payslip.deduction_lines &&
                    payslip.deduction_lines.length > 0 && (
                      <div className="mt-3 rounded-lg bg-red-50/60 border border-red-100 p-3">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-red-600 mb-1.5">
                          Deduction breakdown
                        </p>
                        <ul className="space-y-1">
                          {payslip.deduction_lines.map((d, i) => (
                            <li
                              key={i}
                              className="flex items-center justify-between text-xs text-gray-600"
                            >
                              <span className="capitalize">
                                {d.type}
                                {d.reason ? ` — ${d.reason}` : ""}
                              </span>
                              <span className="font-semibold text-red-600">
                                -{formatMoney(Math.round(d.amount_minor / 100))}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  {payslip.paid_at && (
                    <p className="text-xs text-gray-500 mt-2">
                      Paid on {new Date(payslip.paid_at).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => downloadPayslip(payslip)}
                  className="ml-4"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
          ))}
          {payslips.length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500">No payslips available yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
