import type { ReactNode } from "react";
import { requireOwner } from "@/lib/auth/guard";
import SuperAdminLayoutClient from "./superadmin-layout-client";

export const dynamic = "force-dynamic";

export default async function SuperAdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await requireOwner();

  return (
    <SuperAdminLayoutClient initialStaff={session.staff}>
      {children}
    </SuperAdminLayoutClient>
  );
}
