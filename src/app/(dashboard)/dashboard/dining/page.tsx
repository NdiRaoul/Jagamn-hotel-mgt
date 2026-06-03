import { getMenu } from "@/lib/data/menu";
import { getDiningOrdersForGuest } from "@/lib/data/dining";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import DiningClient from "./dining-client";

export const dynamic = "force-dynamic";

export default async function DiningPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Get app_user_id
  const { data: appUser } = await supabase
    .from("users")
    .select("id")
    .eq("auth_user_id", user.id)
    .single();

  if (!appUser) {
    redirect("/login");
  }

  // Fetch menu and order history in parallel
  const [menu, orders] = await Promise.all([
    getMenu(),
    getDiningOrdersForGuest(appUser.id),
  ]);

  return <DiningClient menu={menu} orders={orders} />;
}
