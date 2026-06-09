import { formatMoney } from "@/lib/currency";

export interface PayslipEmailDeduction {
  type: string;
  reason: string | null;
  amount_minor: number;
}

/**
 * Build the "Your payslip" email HTML. All amounts are passed in *minor* units
 * (francs × 100) to match the payroll tables, then rendered as whole XAF.
 */
export function buildPayslipEmailHtml(data: {
  staffName: string;
  periodLabel: string;
  grossMinor: number;
  deductionsMinor: number;
  netMinor: number;
  deductionLines: PayslipEmailDeduction[];
}): string {
  const toXaf = (minor: number) => formatMoney(Math.round(minor / 100));

  const deductionRows =
    data.deductionLines.length > 0
      ? data.deductionLines
          .map(
            (d) => `
        <tr>
          <td style="padding:8px 0;color:#6b7280;border-bottom:1px solid #f3f4f6;text-transform:capitalize;">${d.type}${d.reason ? ` — ${d.reason}` : ""}</td>
          <td style="text-align:right;color:#dc2626;border-bottom:1px solid #f3f4f6;">-${toXaf(d.amount_minor)}</td>
        </tr>`,
          )
          .join("")
      : `
        <tr>
          <td style="padding:8px 0;color:#9ca3af;" colspan="2">No deductions this period.</td>
        </tr>`;

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"/></head>
<body style="font-family:Georgia,serif;background:#FAFAFA;margin:0;padding:40px;">
  <div style="max-width:600px;margin:0 auto;background:white;border-radius:8px;overflow:hidden;">
    <div style="background:#00152A;padding:40px;text-align:center;">
      <h1 style="color:#FFB77A;margin:0;">Jagamn Palace</h1>
      <p style="color:#9ca3af;font-size:11px;letter-spacing:4px;text-transform:uppercase;">Payslip · ${data.periodLabel}</p>
    </div>
    <div style="padding:40px;">
      <p>Dear ${data.staffName},</p>
      <p style="color:#6b7280;font-size:14px;">Your payslip for <strong>${data.periodLabel}</strong> is now available. A copy is also accessible under <strong>My Account → Payslips</strong>.</p>
      <table style="width:100%;border-collapse:collapse;font-size:14px;margin-top:16px;">
        <tr>
          <td style="padding:10px 0;color:#6b7280;border-bottom:1px solid #f3f4f6;">Gross Salary</td>
          <td style="text-align:right;font-weight:bold;color:#00152A;border-bottom:1px solid #f3f4f6;">${toXaf(data.grossMinor)}</td>
        </tr>
        ${deductionRows}
        <tr>
          <td style="padding:10px 0;color:#6b7280;border-bottom:1px solid #f3f4f6;">Total Deductions</td>
          <td style="text-align:right;color:#dc2626;border-bottom:1px solid #f3f4f6;">-${toXaf(data.deductionsMinor)}</td>
        </tr>
        <tr>
          <td style="padding:14px 0;color:#00152A;font-weight:bold;font-size:16px;">Net Pay</td>
          <td style="text-align:right;font-weight:bold;font-size:16px;color:#00152A;">${toXaf(data.netMinor)}</td>
        </tr>
      </table>
    </div>
    <div style="background:#F4F6F8;padding:24px;text-align:center;">
      <p style="color:#9ca3af;font-size:11px;letter-spacing:2px;text-transform:uppercase;margin:0;">Jagamn Palace · Excellence Since 1892</p>
    </div>
  </div>
</body>
</html>`;
}
