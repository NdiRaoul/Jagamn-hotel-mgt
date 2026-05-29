import { getPayrollSummary } from "@/lib/data/admin";
import PayrollClient from "./payroll-client";

export const dynamic = "force-dynamic";

export default async function PayrollPage() {
  let data: Awaited<ReturnType<typeof getPayrollSummary>> = {
    rows: [],
    staffCount: 0,
  };
  let error: string | null = null;

  try {
    data = await getPayrollSummary();
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load payroll data";
  }

  return <PayrollClient rows={data.rows} staffCount={data.staffCount} error={error} />;
}
