import { getStaffRoster } from "@/lib/data/admin";
import { requireOwner } from "@/lib/auth/guard";
import StaffClient from "./staff-client";

export const dynamic = "force-dynamic";

export default async function StaffPage() {
  await requireOwner();
  const staff = await getStaffRoster();
  return <StaffClient staff={staff} />;
}
