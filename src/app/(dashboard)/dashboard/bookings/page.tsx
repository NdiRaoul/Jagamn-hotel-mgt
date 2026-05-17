"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Key,
  UtensilsCrossed,
  Download,
  Plus,
  ChevronRight,
  BedDouble,
  Users,
  Ban,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import { format } from "date-fns";
import type { Booking } from "@/types/database";

export default function MyBookingsPage() {
  const supabase = createSupabaseBrowserClient();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadBookings() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    // Get the users row id
    const { data: userRow } = await supabase
      .from("users")
      .select("id")
      .eq("auth_user_id", user.id)
      .single();

    if (!userRow) {
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from("bookings")
      .select("*, room_types(*)")
      .eq("app_user_id", userRow.id)
      .order("check_in", { ascending: false });

    setBookings((data as Booking[]) || []);
    setLoading(false);
  }

  useEffect(() => {
    loadBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleCancel(bookingId: string, totalAmount: number) {
    const fee = Math.round(totalAmount * 0.15);
    const refund = totalAmount - fee;
    const ok = confirm(
      `Cancelling will charge a $${fee} fee (15%). You will be refunded $${refund} (85%). Continue?`,
    );
    if (!ok) return;

    const res = await fetch(`/api/bookings/${bookingId}/cancel`, {
      method: "POST",
    });
    const data = await res.json();
    if (data.success) {
      alert("Booking cancelled. A confirmation email has been sent.");
      router.refresh();
      await loadBookings();
    } else {
      alert(data.error || "Failed to cancel booking.");
    }
  }

  const today = new Date().toISOString().split("T")[0];

  const currentStay = bookings.find(
    (b) =>
      b.check_in <= today && b.check_out > today && b.status === "confirmed",
  );
  const upcoming = bookings.filter(
    (b) => b.check_in > today && b.status === "confirmed",
  );
  const pastAndCancelled = bookings.filter(
    (b) => b.check_out < today || b.status === "cancelled",
  );

  const stats = [
    {
      label: "Current Stay",
      value: currentStay
        ? (currentStay.room_types as any)?.name?.split(" ")[0] + " Room"
        : "None",
      subtext: currentStay
        ? `Checkout: ${format(new Date(currentStay.check_out), "MMM d, yyyy")}`
        : "No active booking",
      primary: true,
    },
    {
      label: "Upcoming",
      value: String(upcoming.length).padStart(2, "0"),
      subtext: upcoming[0]
        ? `Next: ${format(new Date(upcoming[0].check_in), "MMM d, yyyy")}`
        : "No upcoming stays",
      border: true,
    },
    {
      label: "Past History",
      value: String(pastAndCancelled.length).padStart(2, "0"),
      subtext: "Lifetime Guest Member",
      border: true,
    },
  ];

  if (loading) {
    return (
      <div className="space-y-8 max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-md p-8 bg-white shadow-sm border border-gray-100 animate-pulse h-32"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12 max-w-6xl relative pb-20">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {stats.map((stat, idx) => (
          <div
            key={idx}
            className={cn(
              "rounded-md p-8 shadow-sm border border-gray-100 relative overflow-hidden",
              stat.primary
                ? "bg-jagamn-primary text-white shadow-lg shadow-jagamn-primary/20"
                : "bg-white",
              stat.border && "border-l-4 border-l-jagamn-primary",
            )}
          >
            <p
              className={cn(
                "text-[10px] font-bold uppercase tracking-widest mb-2",
                stat.primary ? "text-gray-500" : "text-gray-400",
              )}
            >
              {stat.label}
            </p>
            <h2
              className={cn(
                "manrope-bold text-4xl mb-1",
                stat.primary ? "text-white" : "text-jagamn-primary",
              )}
            >
              {stat.value}
            </h2>
            <p
              className={cn(
                "text-xs font-medium",
                stat.primary ? "text-gray-500" : "text-gray-400",
              )}
            >
              {stat.subtext}
            </p>
            {stat.primary && (
              <div className="absolute right-[-20px] bottom-[-20px] opacity-10">
                <div className="w-32 h-32 border-[15px] border-white rounded-full" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Current Stay */}
      {currentStay && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="manrope-bold text-xl text-jagamn-primary">
              Active Reservation
            </h2>
            <Badge className="bg-[#E8F5E9] text-[#2E7D32] border-0 text-[9px] font-bold uppercase tracking-wider px-3 py-1 flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-[#2E7D32]" />
              Checked-In
            </Badge>
          </div>

          <div className="bg-white rounded-md border-l-4 border-l-jagamn-primary shadow-sm overflow-hidden flex flex-col lg:flex-row gap-5 border-r border-t border-b border-gray-100 p-8">
            <div className="lg:w-1/4 relative h-[200px] rounded overflow-hidden shrink-0">
              <Image
                src={
                  (currentStay.room_types as any)?.main_image ||
                  "/images/palace-deluxe.png"
                }
                alt={currentStay.room_slug}
                fill
                sizes="25vw"
                className="object-cover"
              />
            </div>
            <div className="flex-1 space-y-6">
              <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div className="space-y-1">
                  <h3 className="manrope-bold text-2xl text-jagamn-primary">
                    {(currentStay.room_types as any)?.name ||
                      currentStay.room_slug}
                  </h3>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest font-mono">
                    Ref: {currentStay.booking_ref}
                  </p>
                </div>
                <div className="text-right">
                  <p className="manrope-bold text-xl text-jagamn-tertiary">
                    ${currentStay.total_amount.toLocaleString()}
                  </p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                    {currentStay.payment_status === "paid"
                      ? "Paid in Full"
                      : currentStay.payment_status}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-4 border-t border-[#ECEEF0]">
                {[
                  {
                    label: "Check-in",
                    value: format(
                      new Date(currentStay.check_in),
                      "MMM d, yyyy",
                    ),
                  },
                  {
                    label: "Check-out",
                    value: format(
                      new Date(currentStay.check_out),
                      "MMM d, yyyy",
                    ),
                  },
                  { label: "Nights", value: String(currentStay.nights) },
                  {
                    label: "Guests",
                    value: `${currentStay.guests} Guest${currentStay.guests !== 1 ? "s" : ""}`,
                  },
                ].map((info, idx) => (
                  <div key={idx} className="space-y-1">
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                      {info.label}
                    </p>
                    <p className="text-sm font-bold text-jagamn-primary">
                      {info.value}
                    </p>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-4 pt-2">
                <Link href={`/dashboard/bookings/${currentStay.id}`}>
                  <Button className="bg-jagamn-primary hover:bg-jagamn-primary/90 text-white h-12 px-6 rounded-md flex items-center gap-2">
                    <Key className="w-4 h-4" />
                    View Details
                  </Button>
                </Link>
                <Link href="/dashboard/dining">
                  <Button
                    variant="secondary"
                    className="bg-jagamn-neutral hover:bg-gray-200 text-jagamn-primary h-12 px-6 rounded-md flex items-center gap-2 border-0"
                  >
                    <UtensilsCrossed className="w-4 h-4" />
                    In-Room Dining
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upcoming Stays */}
      {upcoming.length > 0 && (
        <div className="space-y-6">
          <h2 className="manrope-bold text-xl text-jagamn-primary">
            Upcoming Stays
          </h2>
          <div className="space-y-4">
            {upcoming.map((booking) => {
              const rt = booking.room_types as any;
              return (
                <div
                  key={booking.id}
                  className="bg-white rounded-md border-l-4 border-l-jagamn-tertiary shadow-sm p-6 flex flex-col md:flex-row items-center justify-between gap-6 border-r border-t border-b border-gray-100"
                >
                  <div className="flex items-center gap-6 w-full md:w-auto">
                    <div className="w-24 h-16 relative rounded overflow-hidden shrink-0">
                      <Image
                        src={rt?.main_image || "/images/palace-deluxe.png"}
                        alt={booking.room_slug}
                        fill
                        sizes="96px"
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-bold text-jagamn-primary">
                          {rt?.name || booking.room_slug}
                        </h4>
                        <Badge className="bg-[#FFF3E0] text-[#E65100] border-0 text-[8px] font-bold uppercase tracking-wider h-5">
                          Confirmed
                        </Badge>
                      </div>
                      <p className="text-[10px] text-gray-400 font-medium">
                        {format(new Date(booking.check_in), "MMM d")} —{" "}
                        {format(new Date(booking.check_out), "MMM d, yyyy")} •
                        Ref:{" "}
                        <span className="font-mono">{booking.booking_ref}</span>
                      </p>
                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-1.5 text-[9px] font-bold text-gray-400 uppercase">
                          <BedDouble className="w-3 h-3" /> {booking.nights}{" "}
                          Night{booking.nights !== 1 ? "s" : ""}
                        </div>
                        <div className="flex items-center gap-1.5 text-[9px] font-bold text-gray-400 uppercase">
                          <Users className="w-3 h-3" /> {booking.guests} Guest
                          {booking.guests !== 1 ? "s" : ""}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 w-full md:w-auto justify-end">
                    <Link href={`/dashboard/bookings/${booking.id}`}>
                      <Button
                        variant="ghost"
                        className="text-[10px] font-bold text-jagamn-tertiary uppercase tracking-widest gap-1 p-0 hover:bg-transparent"
                      >
                        View Details <ChevronRight className="w-3.5 h-3.5" />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      onClick={() =>
                        handleCancel(booking.id, booking.total_amount)
                      }
                      className="text-[10px] font-bold text-red-400 hover:text-red-600 uppercase tracking-widest gap-1 p-0 hover:bg-transparent"
                    >
                      <Ban className="w-3.5 h-3.5" /> Cancel
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Past & Cancelled */}
      {pastAndCancelled.length > 0 && (
        <div className="space-y-6">
          <h2 className="manrope-bold text-xl text-jagamn-primary">
            Past & Cancelled
          </h2>
          <div className="bg-white rounded-md shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-jagamn-neutral border-b border-gray-100">
                  {["Date", "Room Type", "Reference", "Status", "Invoice"].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-8 py-4 text-[9px] font-bold text-gray-400 uppercase tracking-widest last:text-right"
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {pastAndCancelled.map((booking) => {
                  const rt = booking.room_types as any;
                  return (
                    <tr
                      key={booking.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-8 py-5 text-sm font-bold text-jagamn-primary">
                        {format(new Date(booking.check_in), "MMM d, yyyy")}
                      </td>
                      <td className="px-8 py-5 text-sm text-gray-500">
                        {rt?.name || booking.room_slug}
                      </td>
                      <td className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest font-mono">
                        {booking.booking_ref}
                      </td>
                      <td className="px-8 py-5">
                        <Badge className="bg-gray-100 text-gray-500 border-0 text-[8px] font-bold uppercase tracking-wider px-2 py-0.5">
                          {booking.status}
                        </Badge>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <Link href={`/dashboard/bookings/${booking.id}`}>
                          <button className="text-gray-400 hover:text-jagamn-primary transition-colors">
                            <Download className="w-4 h-4" />
                          </button>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!loading && bookings.length === 0 && (
        <div className="text-center py-20 space-y-4">
          <Calendar className="w-12 h-12 text-gray-200 mx-auto" />
          <h3 className="manrope-bold text-xl text-jagamn-primary">
            No bookings yet
          </h3>
          <p className="text-sm text-gray-400">
            Your reservations will appear here once you book a room.
          </p>
          <Link href="/rooms">
            <Button className="bg-jagamn-primary text-white mt-4">
              Browse Rooms
            </Button>
          </Link>
        </div>
      )}

      {/* FAB */}
      <Link href="/rooms">
        <button className="fixed bottom-10 right-10 w-16 h-16 bg-jagamn-tertiary text-white rounded-xl shadow-2xl shadow-jagamn-tertiary/40 flex items-center justify-center hover:bg-jagamn-tertiary/90 hover:scale-110 transition-all z-50">
          <Plus className="w-8 h-8" />
        </button>
      </Link>
    </div>
  );
}
