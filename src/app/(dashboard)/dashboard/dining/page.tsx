import { getMenu } from "@/lib/data/menu";
import {
  getDiningOrdersForGuest,
  getGuestBookingRoomInfo,
} from "@/lib/data/dining";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import DiningClient from "./dining-client";

export const dynamic = "force-dynamic";

export default async function DiningPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Browsing the menu is open to everyone — we only gate the *order action*.
  let appUser: { id: string } | null = null;
  if (user) {
    const { data } = await supabase
      .from("users")
      .select("id")
      .eq("auth_user_id", user.id)
      .single();
    appUser = data;
  }

  const [menu, orders, roomInfo] = await Promise.all([
    getMenu(),
    appUser ? getDiningOrdersForGuest(appUser.id) : Promise.resolve([]),
    appUser ? getGuestBookingRoomInfo(appUser.id) : Promise.resolve(null),
  ]);

  return (
    <DiningClient
      menu={menu}
      orders={orders}
      roomInfo={roomInfo}
      isAuthenticated={!!appUser}
    />
  );
}
