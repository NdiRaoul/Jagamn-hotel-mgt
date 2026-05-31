import { getMenu } from "@/lib/data/menu";
import { requireOwner } from "@/lib/auth/guard";
import FBClient from "./fb-client";

export const dynamic = "force-dynamic";

export default async function FBPage() {
  await requireOwner();
  const menu = await getMenu();
  return <FBClient menu={menu} />;
}
