import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import {
  Check,
  Download,
  Calendar,
  CreditCard,
  MapPin,
  Clock,
  Car,
  FileText,
  ArrowRight,
  Share2,
  Printer,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getRoomBySlug } from "@/lib/data/rooms";

type Props = {
  searchParams: Promise<{
    ref?: string;
    room?: string;
    checkIn?: string;
    checkOut?: string;
    guests?: string;
  }>;
};

async function ConfirmedContent({ searchParams }: { searchParams: any }) {
  const params = await searchParams;
  const {
    ref = "JP-8829-QX",
    room: roomSlug,
    checkIn: ci,
    checkOut: co,
    guests = "2a1c",
  } = params;

  const room = roomSlug ? getRoomBySlug(roomSlug) : null;
  const checkIn = ci ? new Date(ci) : new Date();
  const checkOut = co ? new Date(co) : new Date();

  // Mock data for display if params are missing (for preview)
  const roomName = room?.name || "Maharaja Signature Suite";
  const roomPrice = room?.price || 2400;
  const nights = room
    ? Math.max(
        1,
        Math.floor(
          (checkOut.getTime() - checkIn.getTime()) / (1000 * 3600 * 24),
        ),
      )
    : 4;
  const serviceFee = 120;
  const taxes = 184.2;
  const total = roomPrice + serviceFee + taxes;

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 space-y-12 mt-20">
      {/* ── Success Header ─────────────────────────── */}
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

      {/* ── Reference Banner ────────────────────────── */}
      <div className="bg-white rounded-md border-l-4 border-[#00152A] shadow-sm p-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">
            Unique Booking Reference
          </p>
          <p className="manrope-bold text-4xl text-[#00152A]">{ref}</p>
        </div>
        <Button
          variant="outline"
          className="border-[#00152A] text-[#00152A] h-12 px-8 flex items-center gap-2 hover:bg-gray-50"
        >
          <Download className="w-4 h-4" />
          Download PDF Confirmation
        </Button>
      </div>

      {/* ── Details Grid ───────────────────────────── */}
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
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1 text-right">
                    Check-out
                  </p>
                  <p className="text-sm font-bold text-[#00152A]">
                    {format(checkOut, "MMM d, yyyy")}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 pt-4 border-t border-gray-50">
                <div className="relative w-16 h-16 rounded overflow-hidden flex-shrink-0">
                  <Image
                    src={room?.images.main || "/room-1.png"}
                    alt="Room"
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <p className="text-sm font-bold text-[#00152A]">{roomName}</p>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider">
                    {nights} Nights •{" "}
                    {guests.includes("2a") ? "2 Guests" : "1 Guest"} • Garden
                    View
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
                  <span className="text-gray-500">Room Rate</span>
                  <span className="text-gray-300">
                    ${roomPrice.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Palace Service Fee</span>
                  <span className="text-gray-300">
                    ${serviceFee.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Taxes & Duties</span>
                  <span className="text-gray-300">
                    ${taxes.toLocaleString()}
                  </span>
                </div>
              </div>
              <div className="pt-4 border-t border-white/5 flex items-end justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">
                    Total Paid
                  </p>
                  <p className="text-2xl manrope-bold">
                    ${total.toLocaleString()}.20
                  </p>
                </div>
                <p className="text-[9px] text-gray-600 italic">
                  Charged to Visa ending in 4242
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Protocols & Actions */}
        <div className="space-y-8">
          <div className="bg-[#F4F6F8] rounded-md p-8 space-y-8">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[#00152A]">
              Arrival Protocols
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
                      Check-in Time
                    </p>
                  </div>
                  <p className="text-[10px] text-gray-500 leading-relaxed">
                    Your suite will be ready at 14:00. Early check-in available
                    upon request.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded bg-white flex items-center justify-center text-[10px] font-bold shadow-sm flex-shrink-0">
                  02
                </div>
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <Car className="w-3.5 h-3.5 text-gray-400" />
                    <p className="text-xs font-bold text-[#00152A]">
                      Valet Parking
                    </p>
                  </div>
                  <p className="text-[10px] text-gray-500 leading-relaxed">
                    Complimentary valet is available at the main East Gate
                    entrance.
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
                      Documents
                    </p>
                  </div>
                  <p className="text-[10px] text-gray-500 leading-relaxed">
                    Please present your reference {ref} and a valid government
                    ID.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Link
              href="/dashboard"
              className="w-full h-14 bg-[#BA722E] hover:bg-[#A35F24] text-white flex items-center justify-center gap-2 rounded-md font-bold text-sm shadow-md transition-all"
            >
              Go to Dashboard
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Button
              variant="outline"
              className="w-full h-14 border-2 border-jagamn-primary text-[#00152A] font-bold text-sm"
            >
              Book Concierge Services
            </Button>
            <p className="text-center text-[10px] text-gray-400 cursor-pointer hover:text-gray-600">
              Modify or Cancel Reservation
            </p>
          </div>
        </div>
      </div>

      {/* ── Map Section ────────────────────────────── */}
      <div className="relative h-[300px] md:h-[450px] rounded-md overflow-hidden bg-gray-100 shadow-inner group">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3628.7512403666573!2d73.68112347604313!3d24.56330455711681!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3967e5445209c15d%3A0xc3192070f08104d4!2sThe%20Oberoi%20Udaivilas%2C%20Udaipur!5e0!3m2!1sen!2scm!4v1714470000000!5m2!1sen!2scm"
          width="100%"
          height="100%"
          style={{ border: 0, filter: "grayscale(0.2) contrast(1.1)" }}
          allowFullScreen={true}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="transition-all duration-700"
        />
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/20 to-transparent" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white/95 backdrop-blur shadow-2xl rounded-md p-5 flex items-center gap-4 max-w-xs animate-in zoom-in-95 duration-500">
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

      {/* ── Confirmation Footer ────────────────────── */}
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
        <div className="flex items-center gap-4">
          <button className="w-9 h-9 rounded-full border border-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-50">
            <Share2 className="w-4 h-4" />
          </button>
          <button className="w-9 h-9 rounded-full border border-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-50">
            <Printer className="w-4 h-4" />
          </button>
        </div>
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
