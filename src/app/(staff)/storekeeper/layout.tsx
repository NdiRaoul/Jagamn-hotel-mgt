import { redirect } from "next/navigation";
import { getStaffSession } from "@/lib/auth/staff-session";
import { SessionGuard } from "@/components/staff/session-guard";

export default async function StorekeeperLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getStaffSession();

  if (!session) {
    redirect("/staff-login");
  }

  // Allow storekeeper, manager, admin, owner
  if (!["storekeeper", "manager", "admin", "owner"].includes(session.role)) {
    redirect("/");
  }

  return <SessionGuard>{children}</SessionGuard>;
}
