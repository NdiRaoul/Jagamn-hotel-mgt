import { requireAdminOrHigher } from "@/lib/auth/guard";
import {
  getRecentDeductions,
  getMonthlyDeductionsTotal,
  getDeductionStats,
} from "@/lib/data/deductions";
import { getStaff } from "@/lib/data/staff";
import DeductionsClient from "../../../superadmin/hr/deductions/deductions-client";

export const dynamic = "force-dynamic";

export default async function AdminDeductionsPage() {
  await requireAdminOrHigher();

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
