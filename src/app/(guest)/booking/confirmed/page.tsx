import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import {
  Check,
  Calendar,
  CreditCard,
  MapPin,
  Clock,
  Car,
  FileText,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getRoomBySlug } from "@/lib/data/rooms";
import { supabaseAdmin } from "@/lib/supabase-server";
import type { Booking, RoomType } from "@/types/database";
import { DownloadReceiptButton } from "./print-actions";
import { formatMoney } from "@/lib/currency";

type Props = {
  searchParams: Promise<{
    ref?: string;
    room?: string;
    checkIn?: string;
    checkOut?: string;
    guests?: string;
  }>;
};

async function fetchBooking(ref: string): Promise<Booking | null> {
  if (!ref || !process.env.SUPABASE_SERVICE_ROLE_KEY) return null;
  try {
    const { data, error } = await supabaseAdmin
      .from("bookings")
      .select("*, room_types(*)")
      .eq("booking_ref", ref)
      .single();
    if (error) return null;
    return data as Booking;
  } catch {
    return null;
  }
}

async function ConfirmedContent({
  searchParams,
}: {
  searchParams: Promise<{
    ref?: string;
    room?: string;
    checkIn?: string;
    checkOut?: string;
    guests?: string;
  }>;
}) {
  const params = await searchParams;
  const {
    ref = "JP-0000-XX",
    room: roomSlug,
    checkIn: ci,
    checkOut: co,
    guests = "2a1c",
  } = params;

  // Try to fetch real booking from DB
  const booking = await fetchBooking(ref);

  // Resolve display data — prefer DB booking, then URL params, then static fallback
  const staticRoom = roomSlug ? getRoomBySlug(roomSlug) : null;
  const dbRoomType = booking?.room_types as RoomType | undefined;

  const roomName =
    dbRoomType?.name || staticRoom?.name || "Jagamn Palace Suite";
  const roomImage =
    dbRoomType?.main_image ||
    staticRoom?.images.main ||
    "/images/palace-deluxe.png";

  const checkIn = booking?.check_in
    ? new Date(booking.check_in)
    : ci
      ? new Date(ci)
      : new Date();
  const checkOut = booking?.check_out
    ? new Date(booking.check_out)
    : co
      ? new Date(co)
      : new Date();

  const nights =
    booking?.nights ||
    Math.max(
      1,
      Math.floor((checkOut.getTime() - checkIn.getTime()) / 86400000),
    );
  const guestCount =
    booking?.guests ||
    (guests.includes("2a2c")
      ? 4
      : guests.includes("2a1c")
        ? 3
        : guests.includes("2a")
          ? 2
          : 1);

  const roomPricePerNight =
    booking?.room_price_per_night || staticRoom?.price || 0;
  const roomTotal = roomPricePerNight * nights;
  const taxAmount = booking?.tax_amount ?? Math.round(roomTotal * 0.12);
  const totalAmount = booking?.total_amount ?? roomTotal + taxAmount;

  const bookingRef = booking?.booking_ref || ref;
  const isGuestBooking = !booking?.user_id;
  const guestEmail = booking?.guest_email || "";

  // Receipt data passed to the client component
  const receiptData = {
    bookingRef,
    guestName: booking?.guest_name || "Guest",
    guestEmail: booking?.guest_email || "",
    guestPhone: booking?.guest_phone ?? null,
    guestCountry: booking?.guest_country ?? null,
    roomName,
    checkIn: format(checkIn, "MMM d, yyyy"),
    checkOut: format(checkOut, "MMM d, yyyy"),
    nights,
    guestCount,
    roomPricePerNight,
    roomTotal,
    taxAmount,
    totalAmount,
    paymentMethod: booking?.payment_method ?? null,
    paymentStatus: booking?.payment_status || "confirmed",
    issuedAt: format(new Date(), "MMM d, yyyy"),
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 space-y-12 mt-20">
      {/* ── Success Header ── */}
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <div className="w-16 h-16 bg-[#BA722E] rounded-xl flex items-center justify-center mx-auto shadow-lg shadow-[#BA722E]/20">
          <Check className="w-8 h-8 text-white" />
        </div>
        <h1 className="manrope-bold text-4xl text-[#00152A] tracking-tight">
          Reservation Confirmed!
        </h1>
        <p className="text-sm text-gray-500 leading-relaxed">
          Your stay at the Jagamn Palace has been secured. We are preparing for
          your arrival with the utmost care and attention.
        </p>
      </div>

      {/* ── Reference Banner ── */}
      <div className="bg-white rounded-md border-l-4 border-[#00152A] shadow-sm p-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">
            Unique Booking Reference
          </p>
          <p className="manrope-bold text-4xl text-[#00152A] font-mono tracking-wider">
            {bookingRef}
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/dashboard/bookings">
            <Button className="h-12 px-8 bg-jagamn-primary hover:bg-jagamn-primary/90 text-white flex items-center gap-2">
              <ArrowRight className="w-4 h-4" />
              Manage Booking
            </Button>
          </Link>
          <DownloadReceiptButton receipt={receiptData} />
        </div>
      </div>

      {/* ── Details Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Summary Cards */}
        <div className="lg:col-span-2 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Stay Summary */}
            <div className="bg-white rounded-md border-l-4 border-[#BA722E] shadow-sm p-8 space-y-6">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <h3 className="text-sm font-bold text-[#00152A]">
                  Stay Summary
                </h3>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">
                    Check-in
                  </p>
                  <p className="text-sm font-bold text-[#00152A]">
                    {format(checkIn, "MMM d, yyyy")}
                  </p>
                  <p className="text-[10px] text-gray-400">From 3:00 PM</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">
                    Check-out
                  </p>
                  <p className="text-sm font-bold text-[#00152A]">
                    {format(checkOut, "MMM d, yyyy")}
                  </p>
                  <p className="text-[10px] text-gray-400">By 12:00 PM</p>
                </div>
              </div>
              <div className="flex items-center gap-4 pt-4 border-t border-gray-50">
                <div className="relative w-16 h-16 rounded overflow-hidden flex-shrink-0">
                  <Image
                    src={roomImage}
                    alt="Room"
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                </div>
                <div>
                  <p className="text-sm font-bold text-[#00152A]">{roomName}</p>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider">
                    {nights} Night{nights !== 1 ? "s" : ""} • {guestCount} Guest
                    {guestCount !== 1 ? "s" : ""}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    Valid ID required at reception
                  </p>
                </div>
              </div>
            </div>

            {/* Payment Details */}
            <div className="bg-[#00152A] rounded-md shadow-sm p-8 text-white space-y-6">
              <div className="flex items-center gap-2 mb-2">
                <CreditCard className="w-4 h-4 text-gray-500" />
                <h3 className="text-sm font-bold">Payment Details</h3>
              </div>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500">
                    {roomName} × {nights} night{nights !== 1 ? "s" : ""}
                  </span>
                  <span className="text-gray-300">
                    {formatMoney(roomTotal)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Taxes (10%)</span>
                  <span className="text-gray-300">
                    {formatMoney(taxAmount)}
                  </span>
                </div>
              </div>
              <div className="pt-4 border-t border-white/5 flex items-end justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">
                    Total Paid
                  </p>
                  <p className="text-2xl manrope-bold">
                    {formatMoney(totalAmount)}
                  </p>
                </div>
                <p className="text-[9px] text-gray-600 italic">
                  {booking?.payment_method || "Secured payment"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Protocols & Actions */}
        <div className="space-y-8">
          <div className="bg-[#F4F6F8] rounded-md p-8 space-y-8">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[#00152A]">
              Important Information
            </h3>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded bg-white flex items-center justify-center text-[10px] font-bold shadow-sm flex-shrink-0">
                  01
                </div>
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <Clock className="w-3.5 h-3.5 text-gray-400" />
                    <p className="text-xs font-bold text-[#00152A]">
                      Check-in from 3:00 PM
                    </p>
                  </div>
                  <p className="text-[10px] text-gray-500 leading-relaxed">
                    Early check-in available upon request, subject to
                    availability.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded bg-white flex items-center justify-center text-[10px] font-bold shadow-sm flex-shrink-0">
                  02
                </div>
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <Clock className="w-3.5 h-3.5 text-gray-400" />
                    <p className="text-xs font-bold text-[#00152A]">
                      Check-out by 12:00 PM
                    </p>
                  </div>
                  <p className="text-[10px] text-gray-500 leading-relaxed">
                    Late check-out available for Palace Club members.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded bg-white flex items-center justify-center text-[10px] font-bold shadow-sm flex-shrink-0">
                  03
                </div>
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <FileText className="w-3.5 h-3.5 text-gray-400" />
                    <p className="text-xs font-bold text-[#00152A]">
                      Valid ID Required
                    </p>
                  </div>
                  <p className="text-[10px] text-gray-500 leading-relaxed">
                    Present reference{" "}
                    <span className="font-mono font-bold">{bookingRef}</span>{" "}
                    and a valid government ID at reception.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded bg-white flex items-center justify-center text-[10px] font-bold shadow-sm flex-shrink-0">
                  04
                </div>
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <Car className="w-3.5 h-3.5 text-gray-400" />
                    <p className="text-xs font-bold text-[#00152A]">
                      Valet Parking
                    </p>
                  </div>
                  <p className="text-[10px] text-gray-500 leading-relaxed">
                    Complimentary valet at the main East Gate entrance.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Link
              href="/dashboard/bookings"
              className="w-full h-14 bg-[#BA722E] hover:bg-[#A35F24] text-white flex items-center justify-center gap-2 rounded-md font-bold text-sm shadow-md transition-all"
            >
              Manage Your Booking
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/rooms"
              className="w-full h-14 border-2 border-jagamn-primary text-[#00152A] font-bold text-sm flex items-center justify-center rounded-md hover:bg-gray-50 transition-all"
            >
              Explore More Rooms
            </Link>
            <Link
              href="/"
              className="w-full h-14 border border-gray-200 text-gray-500 font-bold text-sm flex items-center justify-center rounded-md hover:bg-gray-50 transition-all"
            >
              Return to Home
            </Link>
          </div>

          {/* Create Account card — shown only for guest bookings */}
          {isGuestBooking && (
            <div className="bg-jagamn-primary text-white rounded-md p-8 space-y-4">
              <h3 className="manrope-bold text-xl">
                Save Your Booking to an Account
              </h3>
              <p className="text-sm text-gray-300">
                Create a free account to view your booking history and manage
                reservations.
              </p>
              <Link
                href={`/login?tab=signup&email=${encodeURIComponent(guestEmail)}&redirect=/dashboard`}
                className="inline-flex items-center gap-2 bg-jagamn-tertiary hover:bg-jagamn-tertiary/90 text-white font-bold px-6 h-12 rounded-md text-sm transition-all"
              >
                Create Account <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* ── Map Section ── */}
      <div className="relative h-[300px] md:h-[400px] rounded-md overflow-hidden bg-gray-100 shadow-inner">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3628.7512403666573!2d73.68112347604313!3d24.56330455711681!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3967e5445209c15d%3A0xc3192070f08104d4!2sThe%20Oberoi%20Udaivilas%2C%20Udaipur!5e0!3m2!1sen!2scm!4v1714470000000!5m2!1sen!2scm"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white/95 backdrop-blur shadow-2xl rounded-md p-5 flex items-center gap-4 max-w-xs">
          <div className="w-10 h-10 rounded-full bg-[#00152A] flex items-center justify-center flex-shrink-0">
            <MapPin className="w-5 h-5 text-[#FFB77A]" />
          </div>
          <div>
            <p className="text-sm font-bold text-[#00152A]">
              Jagamn Palace Grounds
            </p>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-0.5">
              Lake Pichola, Rajasthan
            </p>
          </div>
        </div>
      </div>

      {/* ── Footer ── */}
      <div className="pt-12 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6 pb-8">
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-300">
          Jagamn Palace Excellence since 1892
        </p>
        <div className="flex items-center gap-8 text-[10px] font-bold uppercase tracking-widest text-gray-400">
          <Link href="#" className="hover:text-[#00152A]">
            Terms of Stay
          </Link>
          <Link href="#" className="hover:text-[#00152A]">
            Privacy Policy
          </Link>
          <Link href="#" className="hover:text-[#00152A]">
            Contact Butler
          </Link>
        </div>
        <DownloadReceiptButton receipt={receiptData} />
      </div>
    </div>
  );
}

export default function ConfirmationPage({ searchParams }: Props) {
  return (
    <div className="bg-[#FAFAFA] min-h-screen">
      <Suspense
        fallback={
          <div className="pt-40 text-center">
            Loading confirmation details...
          </div>
        }
      >
        <ConfirmedContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
