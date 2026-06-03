import { getStaffById } from "@/lib/data/staff";
import { requireAdminOrHigher } from "@/lib/auth/guard";
import { notFound } from "next/navigation";
import StaffProfileClient from "./staff-profile-client";

export const dynamic = "force-dynamic";

export default async function AdminStaffProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdminOrHigher();
  const { id } = await params;
  const staff = await getStaffById(id);

  if (!staff) {
    notFound();
  }

  return <StaffProfileClient staff={staff} />;
}
