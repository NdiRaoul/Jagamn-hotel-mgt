import { getPayrollMonthly, getPayrollSummary } from "@/lib/data/admin";
import { requireOwner } from "@/lib/auth/guard";
import PayrollClient from "./payroll-client";

export const dynamic = "force-dynamic";

export default async function PayrollPage() {
  await requireOwner();
  const [monthly, summary] = await Promise.all([
    getPayrollMonthly(),
    getPayrollSummary(),
  ]);
  return <PayrollClient payrollMonthly={monthly} payrollSummary={summary} />;
}
