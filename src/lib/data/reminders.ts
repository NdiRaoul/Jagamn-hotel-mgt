import "server-only";
import { supabaseAdmin } from "@/lib/supabase-server";
import { notify } from "@/lib/data/notifications";
import { isEventProcessed, markEventProcessed } from "@/lib/redis/webhook";

/**
 * Emit day-before in-app reminders for tomorrow's check-ins and check-outs.
 *
 * Reception gets a fanned-out role notification; the guest (if they have an
 * account) gets a personal one. Each (booking, kind, date) pair is deduped via
 * the shared webhook-dedup store so repeated drains never double-notify.
 *
 * Designed to be called fire-and-forget from organic traffic (the reconcile
 * drain), so there is no scheduler dependency. Failures are swallowed.
 */
export async function sendStayReminders(): Promise<void> {
  try {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayKey = tomorrow.toISOString().slice(0, 10);

    const [{ data: arrivals }, { data: departures }] = await Promise.all([
      supabaseAdmin
        .from("bookings")
        .select("booking_ref,guest_name,app_user_id")
        .eq("check_in", dayKey)
        .not("status", "in", "(cancelled,expired)"),
      supabaseAdmin
        .from("bookings")
        .select("booking_ref,guest_name,app_user_id")
        .eq("check_out", dayKey)
        .not("status", "in", "(cancelled,expired)"),
    ]);

    for (const b of arrivals ?? []) {
      await emitOnce("checkin", dayKey, b);
    }
    for (const b of departures ?? []) {
      await emitOnce("checkout", dayKey, b);
    }
  } catch (e) {
    console.error("[sendStayReminders] failed (non-fatal):", e);
  }
}

async function emitOnce(
  kind: "checkin" | "checkout",
  dayKey: string,
  booking: { booking_ref: string; guest_name: string; app_user_id: string | null },
): Promise<void> {
  const eventKey = `${kind}:${booking.booking_ref}:${dayKey}`;
  if (await isEventProcessed("reminder", eventKey)) return;

  const isArrival = kind === "checkin";
  const title = isArrival
    ? "Check-in tomorrow"
    : "Check-out tomorrow";
  const body = isArrival
    ? `${booking.guest_name} (${booking.booking_ref}) is due to check in tomorrow.`
    : `${booking.guest_name} (${booking.booking_ref}) is due to check out tomorrow.`;

  // Reception desk (role fan-out).
  await notify({ role: "reception", type: `${kind}_reminder`, title, body });

  // The guest themselves, if they have an account.
  if (booking.app_user_id) {
    await notify({
      appUserId: booking.app_user_id,
      type: `${kind}_reminder`,
      title: isArrival ? "Your stay is tomorrow" : "Check-out reminder",
      body: isArrival
        ? "We look forward to welcoming you tomorrow. Safe travels!"
        : "This is a reminder that your check-out is tomorrow.",
    });
  }

  await markEventProcessed("reminder", eventKey);
}
