import type { ReactNode } from "react";
import { requireStaffRole } from "@/lib/auth/guard";
import ReceptionLayoutClient from "./reception-layout-client";

export const dynamic = "force-dynamic";

// Reception portal is reception-only; the owner is confined to /superadmin.
// Admin/manager/kitchen/storekeeper are bounced to their own portal.
export default async function ReceptionLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireStaffRole(["reception"]);
  return <ReceptionLayoutClient>{children}</ReceptionLayoutClient>;
}
