import type { ReactNode } from "react";
import { requireStaffRole } from "@/lib/auth/guard";
import StorekeeperLayoutClient from "./storekeeper-layout-client";

export const dynamic = "force-dynamic";

// Storekeeper portal is storekeeper-only; the owner is confined to /superadmin.
export default async function StorekeeperLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireStaffRole(["storekeeper"]);
  return <StorekeeperLayoutClient>{children}</StorekeeperLayoutClient>;
}
