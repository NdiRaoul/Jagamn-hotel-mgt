"use client";

import { useState, useMemo, useEffect } from "react";
import {
  format,
  parseISO,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  addMonths,
  subMonths,
  isSameDay,
  isWithinInterval,
  differenceInDays,
} from "date-fns";
import {
  CalendarIcon,
  Users,
  AlertCircle,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  type Room,
  type UnavailableDateRange,
  isDateRangeUnavailable,
  ROOMS,
} from "@/lib/data/rooms";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import { formatMoney } from "@/lib/currency";
import { resolveBookingSearch, BOOKING_SEARCH_KEY } from "@/lib/booking-search";

// MON–SUN column headers matching the design
const DAY_HEADERS = ["M", "T", "W", "T", "F", "S", "S"];

type Props = { room: Room };

type AuthUser = {
  name: string;
  avatar: string | null;
};

const mapGuestsParam = (val: string | undefined): string => {
  if (!val) return "3";
  if (val === "1a" || val === "1") return "1";
  if (val === "2a" || val === "2") return "2";
  if (val === "2a1c" || val === "3") return "3";
  if (val === "2a2c" || val === "4") return "4";
  return val;
};

export function RoomBookingWidget({ room }: Props) {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const [checkIn, setCheckIn] = useState<Date>();
  const [checkOut, setCheckOut] = useState<Date>();
  const [guests, setGuests] = useState("3");
  const [conflict, setConflict] = useState(false);
  const [conflictRange, setConflictRange] =
    useState<UnavailableDateRange | null>(null);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);

  // The month displayed in the inline availability calendar
  const [calMonth, setCalMonth] = useState<Date>(new Date());

  // Pre-fill check-in / check-out / guests from the selection the guest
  // made earlier (via URL params or the stored search), so it carries
  // over when they open any room.
  useEffect(() => {
    function hydrateFromSearch() {
      const params = new URLSearchParams(window.location.search);
      const urlCheckIn = params.get("checkIn");
      const urlCheckOut = params.get("checkOut");

      if (urlCheckIn && urlCheckOut) {
        try {
          const d = parseISO(urlCheckIn);
          setCheckIn(d);
          setCalMonth(d);
          setCheckOut(parseISO(urlCheckOut));
        } catch {
          /* ignore bad date */
        }
      } else {
        // If not in URL, clear the state to avoid stale pre-fills
        setCheckIn(undefined);
        setCheckOut(undefined);
        try {
          sessionStorage.removeItem(BOOKING_SEARCH_KEY);
        } catch {}
      }

      const resolved = resolveBookingSearch(params);
      if (resolved.guests) setGuests(mapGuestsParam(resolved.guests));
    }
    hydrateFromSearch();
    // Run once on mount.
  }, []);

  // Load auth state
  useEffect(() => {
    async function loadAuth() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("users")
        .select("full_name, avatar_url")
        .eq("auth_user_id", user.id)
        .single();

      setAuthUser({
        name:
          profile?.full_name ||
          user.user_metadata?.full_name ||
          user.email?.split("@")[0] ||
          "Guest",
        avatar: profile?.avatar_url || user.user_metadata?.avatar_url || null,
      });
    }
    loadAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Build calendar grid
  const calDays = useMemo(() => {
    const first = startOfMonth(calMonth);
    const last = endOfMonth(calMonth);
    const days = eachDayOfInterval({ start: first, end: last });
    // getDay() returns 0=Sun–6=Sat; shift so Monday=0
    const firstDow = (getDay(first) + 6) % 7;
    const prefixBlanks = Array(firstDow).fill(null);
    return [...prefixBlanks, ...days];
  }, [calMonth]);

  // Price for the selected stay: number of nights × the room's nightly rate.
  const nights =
    checkIn && checkOut ? Math.max(0, differenceInDays(checkOut, checkIn)) : 0;
  const roomTotal = room.price * nights;
  const tax = Math.round(roomTotal * 0.1);
  const stayTotal = roomTotal + tax;

  function isDayInRange(d: Date) {
    if (!checkIn || !checkOut) return checkIn ? isSameDay(d, checkIn) : false;
    return (
      isWithinInterval(d, { start: checkIn, end: checkOut }) ||
      isSameDay(d, checkIn) ||
      isSameDay(d, checkOut)
    );
  }

  function isDayUnavailable(d: Date) {
    return room.unavailableDates.some((r) => {
      const from = new Date(r.from);
      const to = new Date(r.to);
      return isWithinInterval(d, { start: from, end: to });
    });
  }

  function handleBook() {
    if (!checkIn || !checkOut) return;
    const unavailable = isDateRangeUnavailable(room, checkIn, checkOut);
    if (unavailable) {
      setConflict(true);
      setConflictRange(unavailable);
      return;
    }
    setConflict(false);
    setConflictRange(null);
    const params = new URLSearchParams({
      checkIn: format(checkIn, "yyyy-MM-dd"),
      checkOut: format(checkOut, "yyyy-MM-dd"),
      guests,
      room: room.slug,
    });
    router.push(`/booking?${params.toString()}`);
  }

  return (
    <>
      <div className="bg-white rounded-md shadow-lg border border-gray-100 border-t-4 border-t-[#BA722E] p-6 space-y-5">
        {/* ── Logged-in user badge ───────────────────── */}
        {authUser && (
          <div className="flex items-center gap-3 bg-[#F4F6F8] rounded-md px-3 py-2.5 border border-gray-100">
            <div className="relative w-8 h-8 rounded-full overflow-hidden flex-shrink-0 border-2 border-jagamn-tertiary/40">
              {authUser.avatar ? (
                <Image
                  src={authUser.avatar}
                  alt={authUser.name}
                  fill
                  sizes="32px"
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-jagamn-primary flex items-center justify-center text-white text-xs font-bold">
                  {authUser.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-jagamn-primary truncate">
                {authUser.name}
              </p>
              <p className="text-[10px] text-jagamn-secondary">
                Booking as Palace Member
              </p>
            </div>
            <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
          </div>
        )}

        {/* ── Price ─────────────────────────────────── */}
        <div className="flex items-end gap-2 border-b border-gray-100 pb-5">
          <p className="manrope-extrabold text-3xl text-jagamn-primary">
            {formatMoney(room.price)}
          </p>
          <p className="text-sm text-jagamn-secondary mb-1">/night</p>
        </div>

        {/* ── Date pickers ──────────────────────────── */}
        <div className="grid grid-cols-2 gap-3">
          {/* Check In */}
          <Popover>
            <PopoverTrigger asChild>
              <div className="flex flex-col border border-gray-200 rounded-md px-3 py-2.5 cursor-pointer hover:border-jagamn-primary transition-colors">
                <span className="text-[10px] font-bold uppercase tracking-wider text-jagamn-secondary mb-1">
                  Check-in
                </span>
                <div className="flex items-center gap-1.5">
                  <CalendarIcon className="w-3.5 h-3.5 text-jagamn-tertiary" />
                  <span
                    className={cn(
                      "text-sm font-semibold text-jagamn-primary",
                      !checkIn && "text-gray-400 font-normal text-xs",
                    )}
                  >
                    {checkIn ? format(checkIn, "MMM d, yyyy") : "Select date"}
                  </span>
                </div>
              </div>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={checkIn}
                onSelect={(d) => {
                  setCheckIn(d);
                  setConflict(false);
                  setConflictRange(null);
                  if (d) setCalMonth(d);
                  if (d && checkOut && checkOut <= d) setCheckOut(undefined);
                }}
                disabled={(date) => date < today}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          {/* Check Out */}
          <Popover>
            <PopoverTrigger asChild>
              <div className="flex flex-col border border-gray-200 rounded-md px-3 py-2.5 cursor-pointer hover:border-jagamn-primary transition-colors">
                <span className="text-[10px] font-bold uppercase tracking-wider text-jagamn-secondary mb-1">
                  Check-out
                </span>
                <div className="flex items-center gap-1.5">
                  <CalendarIcon className="w-3.5 h-3.5 text-jagamn-tertiary" />
                  <span
                    className={cn(
                      "text-sm font-semibold text-jagamn-primary",
                      !checkOut && "text-gray-400 font-normal text-xs",
                    )}
                  >
                    {checkOut ? format(checkOut, "MMM d, yyyy") : "Select date"}
                  </span>
                </div>
              </div>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={checkOut}
                onSelect={(d) => {
                  setCheckOut(d);
                  setConflict(false);
                  setConflictRange(null);
                }}
                disabled={(date) =>
                  date < today || (checkIn ? date <= checkIn : false)
                }
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* ── Guests ────────────────────────────────── */}
        <div className="border border-gray-200 rounded-md px-3 py-2.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-jagamn-secondary block mb-1">
            Guests
          </span>
          <Select value={guests} onValueChange={setGuests}>
            <SelectTrigger className="border-0 p-0 h-auto shadow-none bg-transparent focus:ring-0 w-full">
              <div className="flex items-center gap-2 text-jagamn-primary">
                <Users className="w-3.5 h-3.5 text-jagamn-tertiary" />
                <SelectValue />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1 Adult</SelectItem>
              <SelectItem value="2">2 Adults</SelectItem>
              <SelectItem value="3">2 Adults, 1 Child</SelectItem>
              <SelectItem value="4">2 Adults, 2 Children</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* ── Inline Availability Calendar ──────────── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-jagamn-secondary">
              Availability
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCalMonth((m) => subMonths(m, 1))}
                className="p-0.5 hover:text-jagamn-primary transition-colors text-jagamn-secondary"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="text-[10px] font-bold uppercase tracking-wider text-jagamn-primary">
                {format(calMonth, "MMMM yyyy")}
              </span>
              <button
                onClick={() => setCalMonth((m) => addMonths(m, 1))}
                className="p-0.5 hover:text-jagamn-primary transition-colors text-jagamn-secondary"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Day-of-week headers */}
          <div className="grid grid-cols-7 mb-1">
            {DAY_HEADERS.map((d, i) => (
              <div
                key={i}
                className="text-center text-[10px] font-bold text-jagamn-secondary py-0.5"
              >
                {d}
              </div>
            ))}
          </div>

          {/* Date cells */}
          <div className="grid grid-cols-7 gap-y-0.5">
            {calDays.map((day, i) => {
              if (!day) return <div key={`blank-${i}`} />;

              const inRange = isDayInRange(day);
              const unavail = isDayUnavailable(day);
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              const isPast = day < today;

              return (
                <div
                  key={day.toISOString()}
                  className={cn(
                    "flex items-center justify-center text-xs h-7 w-full rounded-sm font-medium transition-colors",
                    inRange
                      ? "bg-jagamn-primary text-white"
                      : unavail
                        ? "bg-red-50 text-red-500 line-through cursor-not-allowed"
                        : isPast
                          ? "text-gray-300 cursor-not-allowed"
                          : "text-jagamn-primary hover:bg-jagamn-primary/10 cursor-pointer",
                  )}
                  title={unavail ? "Unavailable" : undefined}
                >
                  {format(day, "d")}
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 mt-2 pt-2 border-t border-gray-100">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-jagamn-primary" />
              <span className="text-[9px] text-jagamn-secondary uppercase tracking-wider">
                Selected
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-red-50 border border-red-200" />
              <span className="text-[9px] text-red-500 uppercase tracking-wider">
                Unavailable
              </span>
            </div>
          </div>
        </div>

        {/* ── Price Breakdown (calculated from selected nights) ── */}
        {nights > 0 && (
          <div className="space-y-2 border-t border-gray-100 pt-4">
            <div className="flex justify-between text-sm">
              <span className="text-jagamn-secondary">
                {formatMoney(room.price)} × {nights} night
                {nights !== 1 ? "s" : ""}
              </span>
              <span className="font-semibold text-jagamn-primary">
                {formatMoney(roomTotal)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-jagamn-secondary">Taxes (10%)</span>
              <span className="font-semibold text-jagamn-primary">
                {formatMoney(tax)}
              </span>
            </div>
            <div className="flex justify-between items-end border-t border-gray-100 pt-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-jagamn-secondary">
                Total
              </span>
              <span className="manrope-bold text-xl text-jagamn-primary">
                {formatMoney(stayTotal)}
              </span>
            </div>
          </div>
        )}

        {/* ── Book Button ───────────────────────────── */}
        <Button
          onClick={handleBook}
          disabled={!checkIn || !checkOut}
          className="w-full h-12 bg-jagamn-primary hover:bg-jagamn-primary/90 text-white font-semibold rounded-md disabled:opacity-40"
        >
          {authUser
            ? `Book as ${authUser.name.split(" ")[0]}`
            : "Book This Room"}
        </Button>

        <p className="text-center text-[10px] uppercase tracking-widest text-jagamn-secondary">
          {authUser
            ? "Your details will be pre-filled at checkout"
            : "No charges until check-in for club members"}
        </p>
      </div>

      {/* ── Stately Alternatives — rendered OUTSIDE the white card ── */}
      {conflict && conflictRange && (
        <div
          className="rounded-md border-l-4 border-[#BA1A1A] p-4 space-y-3 mt-2"
          style={{ backgroundColor: "rgba(186,26,26,0.10)" }}
        >
          <div className="flex items-center gap-2">
            <AlertCircle
              className="w-4 h-4 flex-shrink-0"
              style={{ color: "#93000A" }}
            />
            <p className="text-xs font-bold" style={{ color: "#93000A" }}>
              Room not available for selected dates
            </p>
          </div>

          <p
            className="text-[10px] font-bold uppercase tracking-widest"
            style={{ color: "#43474D" }}
          >
            Stately Alternatives
          </p>

          <div className="space-y-2">
            {(conflictRange.alternateRooms ?? []).map((slug) => {
              const alt = ROOMS.find((r) => r.slug === slug);
              if (!alt) return null;
              return (
                <Link
                  key={slug}
                  href={`/rooms/${slug}`}
                  className="flex items-center gap-3 rounded-md p-2.5 group transition-opacity hover:opacity-80"
                  style={{ backgroundColor: "rgba(255,218,214,0.55)" }}
                >
                  <div className="relative w-11 h-11 rounded-sm overflow-hidden flex-shrink-0">
                    <Image
                      src={alt.images.main}
                      alt={alt.name}
                      fill
                      sizes="44px"
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-xs font-bold truncate"
                      style={{ color: "#191C1E" }}
                    >
                      {alt.name}
                    </p>
                    <p className="text-[10px]" style={{ color: "#43474D" }}>
                      {formatMoney(alt.price)} / night
                    </p>
                  </div>
                  <ArrowRight
                    className="w-3.5 h-3.5 flex-shrink-0 group-hover:translate-x-0.5 transition-transform"
                    style={{ color: "#93000A" }}
                  />
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}
