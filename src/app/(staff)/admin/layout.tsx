import type { ReactNode } from "react";
import { requireAdminOrHigher } from "@/lib/auth/guard";
import AdminLayoutClient from "./admin-layout-client";

export const dynamic = "force-dynamic";

// Admin portal is for admin-tier roles (admin, manager) plus the owner.
export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireAdminOrHigher();
  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
