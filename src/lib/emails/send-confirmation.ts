/**
 * Shared helper: send the "Booking Confirmed" email ONLY after payment succeeds.
 * Called from both the Stripe and Fapshi webhooks — never from booking creation.
 * The recipient is always the booking's guest_email (the address the user typed),
 * never the session/auth account email.
 */
import { supabaseAdmin } from "@/lib/supabase-server";
import { resend } from "@/lib/resend";
import { buildReceiptEmailHtml } from "@/lib/emails/booking-receipt";

export async function sendConfirmationEmail(bookingRef: string): Promise<boolean> {
  // Load the full booking row so we always use the stored guest_email
  const { data: booking, error } = await supabaseAdmin
    .from("bookings")
    .select(
      "booking_ref, guest_name, guest_email, room_slug, check_in, check_out, nights, guests, room_price_per_night, resort_fee, tax_amount, total_amount, payment_method",
    )
    .eq("booking_ref", bookingRef)
    .single();

  if (error || !booking) {
    console.error(
      "[sendConfirmationEmail] could not load booking:",
      bookingRef,
      error,
    );
    return false;
  }

  // Resolve a human-readable room name from the room_types table if possible
  const { data: roomType, error: roomTypeError } = await supabaseAdmin
    .from("room_types")
    .select("name")
    .eq("slug", booking.room_slug)
    .maybeSingle();

  if (roomTypeError) {
    console.error(
      "[sendConfirmationEmail] could not resolve room name:",
      bookingRef,
      roomTypeError,
    );
  }

  const roomName = roomType?.name || booking.room_slug;

  try {
    await resend.emails.send({
      from: "Jagamn Palace <reservations@jagamnpalace.com>",
      // Always send to the email the guest typed — never the auth account email
      to: [booking.guest_email],
      subject: `Booking Confirmed — ${booking.booking_ref} | Jagamn Palace`,
      html: buildReceiptEmailHtml({
        bookingRef: booking.booking_ref,
        guestName: booking.guest_name,
        roomName,
        checkIn: booking.check_in,
        checkOut: booking.check_out,
        nights: booking.nights || 1,
        guests: booking.guests || 1,
        pricePerNight: booking.room_price_per_night,
        resortFee: booking.resort_fee || 150,
        taxAmount: booking.tax_amount || 0,
        totalAmount: booking.total_amount,
        paymentMethod: booking.payment_method || "Online Payment",
      }),
    });
  } catch (emailErr) {
    console.error(
      "[sendConfirmationEmail] email send failed for",
      bookingRef,
      emailErr,
    );
    return false;
  }

  const { error: updateError } = await supabaseAdmin
    .from("bookings")
    .update({ receipt_sent_at: new Date().toISOString() })
    .eq("booking_ref", bookingRef);

  if (updateError) {
    console.error(
      "[sendConfirmationEmail] failed to update receipt_sent_at for",
      bookingRef,
      updateError,
    );
    return false;
  }

  return true;
}
