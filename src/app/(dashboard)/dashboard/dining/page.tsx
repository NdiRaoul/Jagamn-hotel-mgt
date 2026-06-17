import { getMenu } from "@/lib/data/menu";
import {
  getDiningOrdersForGuest,
  getGuestBookingRoomInfo,
} from "@/lib/data/dining";
import { getGuestFolios } from "@/lib/data/folio";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { resolveAppUser } from "@/lib/auth/app-user";
import DiningClient from "./dining-client";

export const dynamic = "force-dynamic";

export default async function DiningPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Browsing the menu is open to everyone — we only gate the *order action*.
  // Resolve by auth_user_id with an email fallback so a guest who booked before
  // creating an account is still recognised as signed in (see Guest-006).
  const appUser = user
    ? await resolveAppUser(user.id, user.email)
    : null;

  const [menu, orders, roomInfo, folio] = await Promise.all([
    getMenu(),
    appUser ? getDiningOrdersForGuest(appUser.id) : Promise.resolve([]),
    appUser ? getGuestBookingRoomInfo(appUser.id) : Promise.resolve(null),
    appUser ? getGuestFolios(appUser.id) : Promise.resolve(null),
  ]);

  return (
    <DiningClient
      menu={menu}
      orders={orders}
      roomInfo={roomInfo}
      isAuthenticated={!!appUser}
      roomBalance={folio?.totalBalanceDue ?? 0}
    />
  );
}
