import { getHrLeaveSummary, getStaffRoster } from "@/lib/data/admin";
import { getLeaveRequests } from "@/lib/data/hr";
import { requireOwner } from "@/lib/auth/guard";
import HrClient from "./hr-client";

export const dynamic = "force-dynamic";

export default async function HrPage() {
  await requireOwner();
  const [leaveSummary, staff, leaveRequests] = await Promise.all([
    getHrLeaveSummary(),
    getStaffRoster(),
    getLeaveRequests(),
  ]);
  return (
    <HrClient
      leaveSummary={leaveSummary}
      staff={staff}
      leaveRequests={leaveRequests}
    />
  );
}
