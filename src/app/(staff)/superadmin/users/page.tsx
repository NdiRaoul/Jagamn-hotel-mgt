import { getCustomers } from "@/lib/data/customers";
import UsersClient from "@/components/users/users-client";
import { requireOwner } from "@/lib/auth/guard";

export const dynamic = "force-dynamic";

export default async function SuperadminUsersPage() {
  await requireOwner();
  const data = await getCustomers();
  return <UsersClient data={data} />;
}
