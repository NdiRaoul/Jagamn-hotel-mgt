import { getStaffRoster } from "@/lib/data/admin";
import { requireOwner } from "@/lib/auth/guard";
import { notFound } from "next/navigation";
import StaffProfileClient from "./staff-profile-client";

export const dynamic = "force-dynamic";

export default async function StaffProfilePage({ params }: { params: { id: string } }) {
  await requireOwner();
  const staff = await getStaffRoster();
  const record = staff.find((item) => item.id === params.id);

  if (!record) {
    notFound();
  }

  return <StaffProfileClient staff={record} />;
}
