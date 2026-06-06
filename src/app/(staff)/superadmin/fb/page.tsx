import { getMenuForKitchen } from "@/lib/data/menu";
import { requireOwner } from "@/lib/auth/guard";
import FBClient from "./fb-client";

export const dynamic = "force-dynamic";

export default async function FBPage() {
  await requireOwner();
  // Flat list of all menu items (incl. unavailable) for management/display.
  const menu = await getMenuForKitchen();
  return <FBClient menu={menu} />;
}
