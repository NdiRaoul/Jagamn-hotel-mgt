"use client";

import { useState } from "react";
import { format, differenceInDays } from "date-fns";
import { CalendarIcon, Users, AlertCircle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { type Room, isDateRangeUnavailable } from "@/lib/data/rooms";
import { useRouter } from "next/navigation";

// Quick-select availability chips shown on the booking card
// Replace with real available windows when API is ready
const AVAILABILITY_CHIPS = [
  "28", "29", "30", "31", "01", "02", "03",
];

type Props = {
  room: Room;
};

export function RoomBookingWidget({ room }: Props) {
  const router = useRouter();
  const [checkIn, setCheckIn] = useState<Date>();
  const [checkOut, setCheckOut] = useState<Date>();
  const [guests, setGuests] = useState("2a");
  const [conflict, setConflict] = useState(false);

  const nights =
    checkIn && checkOut ? differenceInDays(checkOut, checkIn) : 0;
  const total = nights > 0 ? nights * room.price : null;

  function handleBook() {
    if (!checkIn || !checkOut) return;

    const unavailable = isDateRangeUnavailable(room, checkIn, checkOut);
    if (unavailable) {
      setConflict(true);
      return;
    }
    setConflict(false);
    // Navigate to booking / confirmation flow (to be wired up later)
    const params = new URLSearchParams({
      checkIn: format(checkIn, "yyyy-MM-dd"),
      checkOut: format(checkOut, "yyyy-MM-dd"),
      guests,
      room: room.slug,
    });
    router.push(`/dashboard?${params.toString()}`);
  }

  return (
    <div className="bg-white rounded-md shadow-lg border border-gray-100 p-6 space-y-6">
      {/* Price */}
      <div className="flex items-end gap-2 border-b border-gray-100 pb-5">
        <p className="manrope-extrabold text-3xl text-jagamn-primary">
          ${room.price.toLocaleString()}
        </p>
        <p className="text-sm text-jagamn-secondary mb-1">/ Night</p>
      </div>

      {/* Date pickers */}
      <div className="grid grid-cols-2 gap-3">
        {/* Check In */}
        <Popover>
          <PopoverTrigger asChild>
            <div className="flex flex-col border border-gray-200 rounded-md px-3 py-2.5 cursor-pointer hover:border-jagamn-primary transition-colors">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-jagamn-secondary mb-1">
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
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        {/* Check Out */}
        <Popover>
          <PopoverTrigger asChild>
            <div className="flex flex-col border border-gray-200 rounded-md px-3 py-2.5 cursor-pointer hover:border-jagamn-primary transition-colors">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-jagamn-secondary mb-1">
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
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Guests */}
      <div className="border border-gray-200 rounded-md px-3 py-2.5">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-jagamn-secondary block mb-1">
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
            <SelectItem value="1a">1 Adult</SelectItem>
            <SelectItem value="2a">2 Adults</SelectItem>
            <SelectItem value="2a1c">2 Adults, 1 Child</SelectItem>
            <SelectItem value="2a2c">2 Adults, 2 Children</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Availability quick chips */}
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-jagamn-secondary mb-2">
          * 10 Rooms Available
        </p>
        <div className="flex gap-2 flex-wrap">
          {AVAILABILITY_CHIPS.map((day) => (
            <span
              key={day}
              className="text-xs border border-gray-200 rounded-md px-2.5 py-1 text-jagamn-primary hover:border-jagamn-primary hover:bg-jagamn-primary/5 cursor-pointer transition-colors"
            >
              {day}
            </span>
          ))}
        </div>
      </div>

      {/* Price breakdown */}
      {total && (
        <div className="border-t border-gray-100 pt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-jagamn-secondary">
              ${room.price} × {nights} nights
            </span>
            <span className="text-jagamn-primary font-semibold">${total.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-jagamn-secondary">Taxes & Fees</span>
            <span className="text-jagamn-primary font-semibold">
              ${Math.round(total * 0.12).toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between text-base font-bold border-t border-gray-100 pt-2 mt-2">
            <span className="text-jagamn-primary">Total</span>
            <span className="text-jagamn-primary">
              ${Math.round(total * 1.12).toLocaleString()}
            </span>
          </div>
        </div>
      )}

      {/* Conflict warning */}
      {conflict && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-100 rounded-md p-3">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-red-600">
            Room not available for selected dates. Please choose different dates or{" "}
            <a href="/rooms" className="underline font-semibold">
              view all availability
            </a>
            .
          </p>
        </div>
      )}

      {/* Book button */}
      <Button
        onClick={handleBook}
        disabled={!checkIn || !checkOut}
        className="w-full h-12 bg-jagamn-primary hover:bg-jagamn-primary/90 text-white font-semibold rounded-md disabled:opacity-40"
      >
        Book This Room
      </Button>

      <p className="text-center text-xs text-jagamn-secondary">
        No charges yet. Review on the next step.
      </p>
    </div>
  );
}
