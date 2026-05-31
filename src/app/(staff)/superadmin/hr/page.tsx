import { getHrLeaveSummary, getStaffRoster } from "@/lib/data/admin";
import { requireOwner } from "@/lib/auth/guard";
import HrClient from "./hr-client";

export const dynamic = "force-dynamic";

export default async function HrPage() {
  await requireOwner();
  const [leaveSummary, staff] = await Promise.all([
    getHrLeaveSummary(),
    getStaffRoster(),
  ]);
  return <HrClient leaveSummary={leaveSummary} staff={staff} />;
}
