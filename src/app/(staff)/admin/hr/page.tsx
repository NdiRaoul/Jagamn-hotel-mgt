import {
  getStaffRoster,
  getHousekeepingTasks,
  getHrLeaveSummary,
} from "@/lib/data/admin";
import { getLeaveRequests, getLeaveTypes, getDeductions } from "@/lib/data/hr";
import HRClient from "./hr-client";

export const dynamic = "force-dynamic";

export default async function HRPage() {
  let roster: Awaited<ReturnType<typeof getStaffRoster>> = [];
  let tasks: Awaited<ReturnType<typeof getHousekeepingTasks>> = [];
  let leaveRequests: Awaited<ReturnType<typeof getLeaveRequests>> = [];
  let leaveTypes: Awaited<ReturnType<typeof getLeaveTypes>> = [];
  let deductions: Awaited<ReturnType<typeof getDeductions>> = [];
  let leaveSummary: Awaited<ReturnType<typeof getHrLeaveSummary>> = [];
  let error: string | null = null;

  try {
    [roster, tasks, leaveRequests, leaveTypes, deductions, leaveSummary] =
      await Promise.all([
        getStaffRoster(),
        getHousekeepingTasks(),
        getLeaveRequests(),
        getLeaveTypes(),
        getDeductions(),
        getHrLeaveSummary(),
      ]);
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load HR data";
  }

  return (
    <HRClient
      roster={roster}
      housekeepingTasks={tasks}
      leaveRequests={leaveRequests}
      leaveTypes={leaveTypes}
      deductions={deductions}
      leaveSummary={leaveSummary}
      error={error}
    />
  );
}
