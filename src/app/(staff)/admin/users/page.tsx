import { getCustomers } from "@/lib/data/customers";
import UsersClient from "@/components/users/users-client";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const data = await getCustomers();
  return <UsersClient data={data} />;
}
