import { getStaff } from "@/lib/data/staff";
import StaffClient from "./staff-client";

export const dynamic = "force-dynamic";

export default async function StaffDirectory() {
  let staff: Awaited<ReturnType<typeof getStaff>> = [];
  let error: string | null = null;

  try {
    staff = await getStaff();
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load staff";
  }

  return <StaffClient staff={staff} error={error} />;
}
