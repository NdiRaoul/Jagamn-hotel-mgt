import { getStaffRoster, getHousekeepingTasks } from "@/lib/data/admin";
import HRClient from "./hr-client";

export const dynamic = "force-dynamic";

export default async function HRPage() {
  let roster: Awaited<ReturnType<typeof getStaffRoster>> = [];
  let tasks: Awaited<ReturnType<typeof getHousekeepingTasks>> = [];
  let error: string | null = null;

  try {
    [roster, tasks] = await Promise.all([
      getStaffRoster(),
      getHousekeepingTasks(),
    ]);
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load HR data";
  }

  return <HRClient roster={roster} housekeepingTasks={tasks} error={error} />;
}
