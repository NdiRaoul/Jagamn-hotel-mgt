import type { ReactNode } from "react";
import { requireStaffRole } from "@/lib/auth/guard";
import KitchenLayoutClient from "./kitchen-layout-client";

export const dynamic = "force-dynamic";

// Kitchen portal is kitchen-only; the owner is confined to /superadmin.
export default async function KitchenLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireStaffRole(["kitchen"]);
  return <KitchenLayoutClient>{children}</KitchenLayoutClient>;
}
