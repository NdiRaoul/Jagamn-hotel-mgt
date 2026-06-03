import { getPayrollRuns, getPayrollItems } from "@/lib/data/payroll";
import PayrollClient from "./payroll-client";

export const dynamic = "force-dynamic";

export default async function PayrollPage() {
  let runs: Awaited<ReturnType<typeof getPayrollRuns>> = [];
  let items: Awaited<ReturnType<typeof getPayrollItems>> = [];
  let error: string | null = null;

  try {
    runs = await getPayrollRuns(12);
    // Get items for the most recent run if available
    if (runs.length > 0) {
      items = await getPayrollItems(runs[0].id);
    }
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load payroll data";
  }

  return <PayrollClient runs={runs} items={items} error={error} />;
}
