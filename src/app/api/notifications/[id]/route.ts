import { NextResponse } from "next/server";
import {
  markRead,
  resolveNotificationAudience,
} from "@/lib/data/notifications";

// PATCH /api/notifications/[id] — mark a single notification read.
export async function PATCH(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const audience = await resolveNotificationAudience();
  if (!audience) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await markRead(id, audience);
  return NextResponse.json({ success: true });
}
