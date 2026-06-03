import { requireOwner } from "@/lib/auth/guard";
import {
  getRecentDeductions,
  getMonthlyDeductionsTotal,
  getDeductionStats,
} from "@/lib/data/deductions";
import { getStaff } from "@/lib/data/staff";
import DeductionsClient from "./deductions-client";

export const dynamic = "force-dynamic";

export default async function DeductionsPage() {
  await requireOwner();

  const [deductions, monthlyTotal, stats, staff] = await Promise.all([
    getRecentDeductions(20),
    getMonthlyDeductionsTotal(),
    getDeductionStats(),
    getStaff(),
  ]);

  return (
    <DeductionsClient
      deductions={deductions}
      monthlyTotal={monthlyTotal}
      stats={stats}
      staff={staff}
    />
  );
}
