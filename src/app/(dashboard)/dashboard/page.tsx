"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Calendar,
  BedDouble,
  UtensilsCrossed,
  Clock,
  ArrowRight,
  ChevronRight,
  CalendarDays,
  History,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import { format } from "date-fns";
import type { Booking } from "@/types/database";
import { useFolioSummary } from "@/hooks/use-folio";
import {
  OutstandingBalanceBanner,
  formatMoney,
} from "@/components/guest/balance";
import { Wallet } from "lucide-react";

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning";
  if (h < 17) return "Good Afternoon";
  return "Good Evening";
}

type Activity = {
  title: string;
  location: string;
  time: string;
  sortAt: number;
  icon: typeof BedDouble;
  status: string;
  statusColor: string;
};

export default function DashboardOverviewPage() {
  const supabase = createSupabaseBrowserClient();
  const [userName, setUserName] = useState("Guest");
  const [currentStay, setCurrentStay] = useState<Booking | null>(null);
  const [upcomingCount, setUpcomingCount] = useState(0);
  const [pastCount, setPastCount] = useState(0);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const { summary: folio, loading: folioLoading } = useFolioSummary();

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      // Get user name via users table
      const { data: profile } = await supabase
        .from("users")
        .select("id, full_name")
        .eq("auth_user_id", user.id)
        .single();

      setUserName(
        profile?.full_name ||
          user.user_metadata?.full_name ||
          user.email?.split("@")[0] ||
          "Guest",
      );

      const userRowId = profile?.id;
      const today = new Date().toISOString().split("T")[0];

      if (userRowId) {
        // Current stay — spans today AND is an active stay. A guest who has
        // been checked in at the front desk has status "checked_in", not
        // "confirmed", so we must accept both or the dashboard wrongly shows
        // "No active stay" during the actual stay. maybeSingle() avoids the
        // PGRST116 error that .single() throws on the common no-stay case.
        const { data: current } = await supabase
          .from("bookings")
          .select("*, room_types(*)")
          .eq("app_user_id", userRowId)
          .in("status", ["confirmed", "checked_in"])
          .lte("check_in", today)
          .gte("check_out", today)
          .order("check_in", { ascending: false })
          .limit(1)
          .maybeSingle();

        setCurrentStay(current as Booking | null);

        // Upcoming count — future confirmed reservations.
        const { count: upcoming } = await supabase
          .from("bookings")
          .select("id", { count: "exact", head: true })
          .eq("app_user_id", userRowId)
          .in("status", ["confirmed", "checked_in"])
          .gt("check_in", today);

        setUpcomingCount(upcoming || 0);

        // Past count — only genuine stays; exclude abandoned/cancelled holds.
        const { count: past } = await supabase
          .from("bookings")
          .select("id", { count: "exact", head: true })
          .eq("app_user_id", userRowId)
          .not("status", "in", "(pending,cancelled,expired)")
          .lt("check_out", today);

        setPastCount(past || 0);

        // ── Recent & Upcoming activity — derived from real bookings + orders ──
        const acts: Activity[] = [];

        // Upcoming / current stays
        const { data: stayRows } = await supabase
          .from("bookings")
          .select("booking_ref, check_in, check_out, status, room_types(name)")
          .eq("app_user_id", userRowId)
          .not("status", "in", "(cancelled,expired)")
          .gte("check_out", today)
          .order("check_in", { ascending: true })
          .limit(4);

        for (const b of (stayRows || []) as Array<{
          booking_ref: string;
          check_in: string;
          status: string;
          room_types: { name?: string } | { name?: string }[] | null;
        }>) {
          const rt = Array.isArray(b.room_types) ? b.room_types[0] : b.room_types;
          const checkIn = new Date(b.check_in);
          acts.push({
            title: rt?.name || "Your Stay",
            location: `Booking ${b.booking_ref}`,
            time: format(checkIn, "MMM d, yyyy"),
            sortAt: checkIn.getTime(),
            icon: BedDouble,
            status: checkIn.getTime() <= Date.now() ? "Current" : "Upcoming",
            statusColor: "bg-[#FFF7F0] text-[#BA722E]",
          });
        }

        // Recent in-room dining orders
        const { data: orderRows } = await supabase
          .from("dining_orders")
          .select("status, total_amount, created_at")
          .eq("app_user_id", userRowId)
          .order("created_at", { ascending: false })
          .limit(4);

        for (const o of (orderRows || []) as Array<{
          status: string;
          total_amount: number | null;
          created_at: string;
        }>) {
          const at = new Date(o.created_at);
          acts.push({
            title: "In-Room Dining",
            location: `Order • ${(o.total_amount || 0).toLocaleString()} FCFA`,
            time: format(at, "MMM d, h:mm a"),
            sortAt: at.getTime(),
            icon: UtensilsCrossed,
            status: o.status
              ? o.status.charAt(0).toUpperCase() + o.status.slice(1)
              : "Placed",
            statusColor: "bg-gray-100 text-gray-500",
          });
        }

        acts.sort((a, b) => b.sortAt - a.sortAt);
        setActivities(acts.slice(0, 4));
      }

      setLoading(false);
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const dbRoomType = currentStay?.room_types as any;
  const currentRoomName = dbRoomType?.name || "—";
  const currentRoomImage =
    dbRoomType?.main_image || "/images/palace-deluxe.png";
  const currentCheckOut = currentStay?.check_out
    ? format(new Date(currentStay.check_out), "MMM d, h:mm a")
    : "—";

  return (
    <div className="space-y-10 max-w-6xl">
      {/* Welcome Header */}
      <div className="space-y-1">
        <h1 className="manrope-bold text-4xl text-jagamn-primary">
          {getGreeting()}, {userName}.
        </h1>
        <p className="text-gray-400 font-medium uppercase tracking-widest text-[10px]">
          Jagamn Palace Hotel
        </p>
      </div>

      {/* Outstanding Balance — room not fully paid and/or dining charged to room */}
      <OutstandingBalanceBanner summary={folio} loading={folioLoading} />

      {/* Top Widgets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Current Stay Widget */}
        <div className="md:col-span-2 lg:col-span-2 bg-white rounded-md border-l-4 border-l-jagamn-primary overflow-hidden flex shadow-sm border-r border-t border-b border-gray-100 group">
          <div className="flex-1 p-8 flex flex-col justify-between">
            {loading ? (
              <div className="space-y-3 animate-pulse">
                <div className="h-3 bg-gray-100 rounded w-24" />
                <div className="h-8 bg-gray-200 rounded w-48" />
                <div className="h-3 bg-gray-100 rounded w-32" />
              </div>
            ) : currentStay ? (
              <div className="space-y-6">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">
                    Current Stay
                  </p>
                  <h3 className="manrope-bold text-3xl text-jagamn-primary">
                    {currentRoomName}
                  </h3>
                  {currentStay.room_id && (
                    <p className="text-xs text-gray-400 mt-1">
                      Unit: {(currentStay as any).rooms?.unit_code || "—"}
                    </p>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded bg-jagamn-neutral flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-jagamn-tertiary" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        Check-out
                      </p>
                      <p className="text-sm font-bold text-jagamn-primary">
                        {currentCheckOut}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded bg-[#FFF7F0] flex items-center justify-center">
                      <BedDouble className="w-5 h-5 text-jagamn-tertiary" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        Booking Ref
                      </p>
                      <p className="text-sm font-bold text-jagamn-primary font-mono">
                        {currentStay.booking_ref}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  Current Stay
                </p>
                <h3 className="manrope-bold text-2xl text-jagamn-primary">
                  No active stay
                </h3>
                <p className="text-sm text-gray-400">
                  You don&apos;t have a current booking at the palace.
                </p>
              </div>
            )}

            {currentStay ? (
              <Link href={`/dashboard/bookings/${currentStay.id}`}>
                <Button className="w-fit bg-jagamn-primary hover:bg-jagamn-primary/90 text-white h-12 px-6 rounded-md flex items-center gap-2 mt-8">
                  View Folio
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            ) : (
              <Link href="/rooms">
                <Button className="w-fit bg-jagamn-primary hover:bg-jagamn-primary/90 text-white h-12 px-6 rounded-md flex items-center gap-2 mt-8">
                  Book a Room
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            )}
          </div>

          <div className="w-[40%] relative hidden md:block">
            <Image
              src={currentStay ? currentRoomImage : "/images/palace-deluxe.png"}
              alt="Current Stay"
              fill
              sizes="40vw"
              className="object-cover group-hover:scale-105 transition-transform duration-700"
            />
          </div>
        </div>

        {/* Quick Stats */}
        <div className="flex flex-col gap-4">
          {/* Balance — always visible: amount owed (room + dining) or settled */}
          <Link
            href="/dashboard/payments"
            className={cn(
              "rounded-md border-l-4 shadow-sm p-6 flex items-center gap-4 transition-shadow hover:shadow-md",
              folio?.hasOutstanding
                ? "bg-[#FFF7F0] border-[#E65100]"
                : "bg-white border-jagamn-secondary/40",
            )}
          >
            <div
              className={cn(
                "w-12 h-12 rounded-lg flex items-center justify-center",
                folio?.hasOutstanding ? "bg-[#FFE8D6]" : "bg-jagamn-neutral",
              )}
            >
              <Wallet
                className={cn(
                  "w-6 h-6",
                  folio?.hasOutstanding
                    ? "text-[#E65100]"
                    : "text-jagamn-primary",
                )}
              />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Balance
              </p>
              <p
                className={cn(
                  "manrope-bold text-3xl",
                  folio?.hasOutstanding ? "text-[#E65100]" : "text-jagamn-primary",
                )}
              >
                {folioLoading
                  ? "—"
                  : folio?.hasOutstanding
                    ? formatMoney(folio.totalBalanceDue)
                    : formatMoney(0)}
              </p>
              <p className="text-[10px] text-gray-400 font-medium">
                {folioLoading
                  ? ""
                  : folio?.hasOutstanding
                    ? "Outstanding — tap to settle"
                    : "All settled"}
              </p>
            </div>
          </Link>

          <div className="bg-white rounded-md border-l-4 border-[#FFB77A] shadow-sm p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-jagamn-neutral flex items-center justify-center">
              <CalendarDays className="w-6 h-6 text-jagamn-primary" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Upcoming Stays
              </p>
              <p className="manrope-bold text-3xl text-jagamn-primary">
                {loading ? "—" : upcomingCount}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-md border-l-4 border-jagamn-primary shadow-sm p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-jagamn-neutral flex items-center justify-center">
              <History className="w-6 h-6 text-jagamn-primary" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Past Stays
              </p>
              <p className="manrope-bold text-3xl text-jagamn-primary">
                {loading ? "—" : pastCount}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-md border-l-4 border-[#FFB77A] shadow-sm p-8 flex flex-col justify-between flex-1 group">
            <div className="w-12 h-12 rounded-lg bg-jagamn-neutral flex items-center justify-center mb-4">
              <UtensilsCrossed className="w-6 h-6 text-jagamn-primary" />
            </div>
            <div className="space-y-2 mb-4">
              <h3 className="manrope-bold text-lg text-jagamn-primary">
                In-Room Dining
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Explore our culinary offerings delivered to your suite.
              </p>
            </div>
            <Link href="/dashboard/dining">
              <Button className="w-full bg-[#FFB77A] hover:bg-[#FFA552] text-[#412000] font-bold h-10 flex items-center justify-between px-4 rounded-md text-sm">
                Order Now
                <UtensilsCrossed className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Recent & Upcoming Activities — live from bookings + dining orders */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="manrope-bold text-xl text-jagamn-primary">
            Recent & Upcoming
          </h2>
          <Link href="/dashboard/bookings">
            <Button
              variant="ghost"
              className="text-xs font-bold text-gray-400 hover:text-jagamn-primary uppercase tracking-widest gap-1"
            >
              See All <ChevronRight className="w-3 h-3" />
            </Button>
          </Link>
        </div>

        {!loading && activities.length === 0 ? (
          <div className="bg-white rounded-md p-10 flex flex-col items-center justify-center text-center shadow-sm border border-dashed border-gray-200">
            <div className="w-12 h-12 rounded-full bg-jagamn-neutral flex items-center justify-center mb-3">
              <Clock className="w-6 h-6 text-gray-300" />
            </div>
            <p className="text-sm font-bold text-jagamn-primary">
              No recent activity yet
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Your upcoming stays and in-room orders will appear here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activities.map((activity, idx) => (
              <div
                key={idx}
                className="bg-white rounded-md p-6 flex items-center justify-between shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 rounded bg-jagamn-neutral flex items-center justify-center">
                    <activity.icon className="w-6 h-6 text-gray-400" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-jagamn-primary">
                      {activity.title}
                    </h4>
                    <p className="text-[10px] text-gray-400 font-medium">
                      {activity.location}
                    </p>
                    <div className="flex items-center gap-1.5 pt-1">
                      <Clock className="w-3 h-3 text-jagamn-tertiary" />
                      <span className="text-[10px] font-bold text-jagamn-primary">
                        {activity.time}
                      </span>
                    </div>
                  </div>
                </div>
                <Badge
                  className={cn(
                    "border-0 text-[9px] font-bold uppercase tracking-wider px-3 py-1",
                    activity.statusColor,
                  )}
                >
                  {activity.status}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
