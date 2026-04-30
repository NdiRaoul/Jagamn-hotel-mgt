"use client";

import { useState, useMemo } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  addMonths,
  subMonths,
  isSameDay,
  isWithinInterval,
  isBefore,
  isAfter,
  addDays,
} from "date-fns";
import {
  CalendarIcon,
  Users,
  AlertCircle,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
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

// MON–SUN column headers matching the design
const DAY_HEADERS = ["M", "T", "W", "T", "F", "S", "S"];

type Props = { room: Room };

export function RoomBookingWidget({ room }: Props) {
  const router = useRouter();

  const [checkIn, setCheckIn] = useState<Date>();
  const [checkOut, setCheckOut] = useState<Date>();
  const [guests, setGuests] = useState("2a1c");
  const [conflict, setConflict] = useState(false);
  const [conflictRange, setConflictRange] =
    useState<UnavailableDateRange | null>(null);

  // The month displayed in the inline availability calendar
  const [calMonth, setCalMonth] = useState<Date>(new Date());

  // Build calendar grid — identical to the design
  const calDays = useMemo(() => {
    const first = startOfMonth(calMonth);
    const last = endOfMonth(calMonth);
    const days = eachDayOfInterval({ start: first, end: last });

    // getDay() returns 0=Sun–6=Sat; we want 0=Mon–6=Sun
    const firstDow = (getDay(first) + 6) % 7; // shift so Monday=0
    const prefixBlanks = Array(firstDow).fill(null);
    return [...prefixBlanks, ...days];
  }, [calMonth]);

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
      {/* ── Price ─────────────────────────────────── */}
      <div className="flex items-end gap-2 border-b border-gray-100 pb-5">
        <p className="manrope-extrabold text-3xl text-jagamn-primary">
          ${room.price.toLocaleString()}
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
                    !checkIn && "text-gray-400 font-normal text-xs"
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
              }}
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
                    !checkOut && "text-gray-400 font-normal text-xs"
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
        <Select
          value={guests}
          onValueChange={(v) => {
            setGuests(v);
          }}
        >
          <SelectTrigger className="border-0 p-0 h-auto shadow-none bg-transparent focus:ring-0 w-full">
            <div className="flex items-center gap-2 text-jagamn-primary">
              <Users className="w-3.5 h-3.5 text-jagamn-tertiary" />
              <SelectValue />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1a">1 Adult</SelectItem>
            <SelectItem value="2a">2 Adults</SelectItem>
            <SelectItem value="2a1c">2 Adults, 1 Child</SelectItem>
            <SelectItem value="2a2c">2 Adults, 2 Children</SelectItem>
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
            if (!day) {
              return <div key={`blank-${i}`} />;
            }

            const inRange = isDayInRange(day);
            const unavail = isDayUnavailable(day);
            const isStart = checkIn && isSameDay(day, checkIn);
            const isEnd = checkOut && isSameDay(day, checkOut);

            return (
              <div
                key={day.toISOString()}
                className={cn(
                  "flex items-center justify-center text-xs h-7 w-full rounded-sm font-medium transition-colors",
                  inRange
                    ? "bg-jagamn-primary text-white"
                    : unavail
                    ? "text-gray-300 line-through cursor-not-allowed"
                    : "text-jagamn-primary hover:bg-jagamn-primary/10 cursor-pointer"
                )}
              >
                {format(day, "d")}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Book Button ───────────────────────────── */}
      <Button
        onClick={handleBook}
        disabled={!checkIn || !checkOut}
        className="w-full h-12 bg-jagamn-primary hover:bg-jagamn-primary/90 text-white font-semibold rounded-md disabled:opacity-40"
      >
        Book This Room
      </Button>

      <p className="text-center text-[10px] uppercase tracking-widest text-jagamn-secondary">
        No charges until check-in for club members
      </p>
    </div>

    {/* ── Stately Alternatives — rendered OUTSIDE the white card ── */}
    {conflict && conflictRange && (
      <div
        className="rounded-md border-l-4 border-[#BA1A1A] p-4 space-y-3 mt-2"
        style={{ backgroundColor: "rgba(186,26,26,0.10)" }}
      >
        {/* Header */}
        <div className="flex items-center gap-2">
          <AlertCircle
            className="w-4 h-4 flex-shrink-0"
            style={{ color: "#93000A" }}
          />
          <p
            className="text-xs font-bold"
            style={{ color: "#93000A" }}
          >
            Room not available for selected dates
          </p>
        </div>

        {/* Stately Alternatives label */}
        <p
          className="text-[10px] font-bold uppercase tracking-widest"
          style={{ color: "#43474D" }}
        >
          Stately Alternatives
        </p>

        {/* Alternative room cards */}
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
                    ${alt.price} / night
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
