import { supabaseAdmin } from "@/lib/supabase-server";
import Link from "next/link";
import {
  CheckCircle2,
  Printer,
  Mail,
  ArrowLeft,
  Key,
  Hash,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function CheckInSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id } = await searchParams;

  let booking: {
    booking_ref: string;
    guest_name: string;
    guest_email: string;
    rooms: { unit_code: string } | null;
  } | null = null;

  if (id) {
    const { data } = await supabaseAdmin
      .from("bookings")
      .select("booking_ref,guest_name,guest_email,rooms(unit_code)")
      .eq("id", id)
      .maybeSingle();
    if (data) {
      // Supabase returns joined FK relations as arrays; normalise to single object
      const rawRooms = data.rooms as unknown;
      booking = {
        booking_ref: data.booking_ref,
        guest_name: data.guest_name,
        guest_email: data.guest_email,
        rooms: Array.isArray(rawRooms)
          ? (rawRooms[0] as { unit_code: string } | undefined) ?? null
          : (rawRooms as { unit_code: string } | null),
      };
    }
  }

  const roomCode = booking?.rooms?.unit_code ?? "—";
  const accessCode = booking?.booking_ref
    ? booking.booking_ref.replace(/\D/g, "").slice(-4) || "—"
    : "—";

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 space-y-12 animate-in fade-in zoom-in-95 duration-500">
      {/* ── Success Icon ─────────────────────────── */}
      <div className="relative">
        <div className="w-24 h-24 rounded-2xl bg-[#BA722E]/10 flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-[#BA722E] flex items-center justify-center text-white shadow-lg shadow-[#BA722E]/30">
            <CheckCircle2 className="w-7 h-7" />
          </div>
        </div>
      </div>

      {/* ── Heading ──────────────────────────────── */}
      <div className="text-center space-y-3">
        <h1 className="manrope-bold text-5xl text-[#00152A] tracking-tight">
          Check-In Successful
        </h1>
        <p className="text-gray-500 text-lg">
          {booking
            ? `${booking.guest_name} has been checked in.`
            : "Guest has been successfully checked in and room keys are active."}
        </p>
        {booking && (
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
            Booking Ref: {booking.booking_ref}
          </p>
        )}
      </div>

      {/* ── Info Cards ────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
        {/* Room Assigned */}
        <div className="bg-white rounded-lg border-l-4 border-l-[#00152A] shadow-sm p-10 flex flex-col items-center justify-center text-center space-y-4 group hover:shadow-md transition-all border border-gray-50 relative overflow-hidden">
          <div className="absolute right-[-10px] top-[-10px] opacity-[0.03] group-hover:scale-110 transition-transform duration-700">
            <Key className="w-32 h-32" />
          </div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            Room Assigned
          </p>
          <p className="manrope-bold text-7xl text-[#00152A] tracking-tighter">
            {roomCode}
          </p>
        </div>

        {/* Digital Access Code */}
        <div className="bg-white rounded-lg border-l-4 border-l-[#00152A] shadow-sm p-10 flex flex-col items-center justify-center text-center space-y-4 group hover:shadow-md transition-all border border-gray-50 relative overflow-hidden">
          <div className="absolute right-[-10px] top-[-10px] opacity-[0.03] group-hover:scale-110 transition-transform duration-700">
            <Hash className="w-32 h-32" />
          </div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            Booking Reference
          </p>
          <p className="manrope-bold text-4xl text-[#00152A] tracking-tighter">
            {booking?.booking_ref ?? "—"}
          </p>
        </div>
      </div>

      {/* ── Actions ──────────────────────────────── */}
      <div className="flex flex-col md:flex-row items-center gap-6">
        <Button className="h-14 px-10 bg-[#00152A] hover:bg-[#0A2038] text-white font-bold rounded-md flex items-center gap-3 shadow-xl shadow-black/10">
          <Printer className="w-5 h-5" />
          Print Receipt
        </Button>
        {booking?.guest_email && (
          <Button
            onClick={() => {}}
            className="h-14 px-10 bg-[#00152A] hover:bg-[#0A2038] text-white font-bold rounded-md flex items-center gap-3 shadow-xl shadow-black/10"
          >
            <Mail className="w-5 h-5" />
            Email Receipt
          </Button>
        )}
        <Link
          href="/reception/arrivals"
          className="ml-4 flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest hover:text-[#BA722E] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Return to Arrivals List
        </Link>
      </div>
    </div>
  );
}
