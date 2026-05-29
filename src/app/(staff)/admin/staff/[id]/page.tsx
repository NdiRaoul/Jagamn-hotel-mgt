import { getStaffById } from "@/lib/data/staff";
import { notFound } from "next/navigation";
import StaffProfileClient from "./staff-profile-client";

export const dynamic = "force-dynamic";

export default async function StaffProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const staff = await getStaffById(id);

  if (!staff) {
    notFound();
  }

  return <StaffProfileClient staff={staff} />;
}
