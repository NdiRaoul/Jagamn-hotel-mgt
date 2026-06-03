import { NextRequest, NextResponse } from "next/server";
import {
  getNotifications,
  getUnreadCount,
  markAllRead,
  resolveNotificationAudience,
} from "@/lib/data/notifications";

// GET /api/notifications — list + unread count, scoped to the caller.
export async function GET(request: NextRequest) {
  const audience = await resolveNotificationAudience();
  if (!audience) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const unreadOnly = new URL(request.url).searchParams.get("unreadOnly") === "1";
  const [notifications, unreadCount] = await Promise.all([
    getNotifications(audience, { unreadOnly, limit: 20 }),
    getUnreadCount(audience),
  ]);

  // Minimal audience descriptor so the client can filter realtime payloads.
  const descriptor =
    audience.kind === "guest"
      ? { kind: "guest", userId: audience.userId }
      : { kind: "staff", staffId: audience.staffId, role: audience.role };

  return NextResponse.json({ notifications, unreadCount, audience: descriptor });
}

// PATCH /api/notifications — mark all of the caller's notifications read.
export async function PATCH() {
  const audience = await resolveNotificationAudience();
  if (!audience) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await markAllRead(audience);
  return NextResponse.json({ success: true });
}
