"use client";

import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, Users, Building, ArrowRight } from "lucide-react";
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
import { DatesUnavailableModal } from "@/components/guest/dates-unavailable-modal";
import { ROOMS, isDateRangeUnavailable, type UnavailableDateRange } from "@/lib/data/rooms";
import { useRouter } from "next/navigation";

export function SearchBar() {
  const router = useRouter();
  const [checkIn, setCheckIn] = useState<Date>();
  const [checkOut, setCheckOut] = useState<Date>();
  const [roomType, setRoomType] = useState<string>("all");
  const [guests, setGuests] = useState<string>("2a1c");

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState<{
    roomSlug: string;
    unavailableRange: UnavailableDateRange;
  } | null>(null);

  function handleCheckAvailability() {
    if (!checkIn || !checkOut) {
      // No dates selected — go to collection page
      router.push("/rooms");
      return;
    }

    const params = new URLSearchParams({
      checkIn: format(checkIn, "yyyy-MM-dd"),
      checkOut: format(checkOut, "yyyy-MM-dd"),
      guests,
      ...(roomType !== "all" ? { roomType } : {}),
    });

    // If a specific room is selected, check its availability
    if (roomType !== "all") {
      const room = ROOMS.find((r) => r.slug === roomType);
      if (room) {
        const conflict = isDateRangeUnavailable(room, checkIn, checkOut);
        if (conflict) {
          setModalData({ roomSlug: room.slug, unavailableRange: conflict });
          setModalOpen(true);
          return;
        }
        // Dates available — go straight to room detail
        router.push(`/rooms/${room.slug}?${params.toString()}`);
        return;
      }
    }

    // No specific room — go to collection with search params
    router.push(`/rooms?${params.toString()}`);
  }

  return (
    <>
      <div className="bg-white rounded-md shadow-xl p-2 flex flex-col md:flex-row items-center gap-2 w-full">
        {/* Check In */}
        <Popover>
          <PopoverTrigger asChild>
            <div className="flex-1 flex flex-col px-4 py-2 hover:bg-gray-50 rounded-md cursor-pointer transition-colors border-b md:border-b-0 md:border-r border-gray-100 last:border-0 w-full text-left">
              <span className="text-xs font-semibold text-jagamn-secondary mb-1 uppercase tracking-wider">
                Check-in
              </span>
              <div className="flex items-center gap-2 text-jagamn-primary">
                <CalendarIcon className="w-4 h-4 text-[#00152A]" />
                <span className={cn("font-semibold text-sm", !checkIn && "text-muted-foreground")}>
                  {checkIn ? format(checkIn, "dd MMM yyyy") : "Select date"}
                </span>
              </div>
            </div>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar mode="single" selected={checkIn} onSelect={setCheckIn} initialFocus />
          </PopoverContent>
        </Popover>

        {/* Check Out */}
        <Popover>
          <PopoverTrigger asChild>
            <div className="flex-1 flex flex-col px-4 py-2 hover:bg-gray-50 rounded-md cursor-pointer transition-colors border-b md:border-b-0 md:border-r border-gray-100 last:border-0 w-full text-left">
              <span className="text-xs font-semibold text-jagamn-secondary mb-1 uppercase tracking-wider">
                Check-out
              </span>
              <div className="flex items-center gap-2 text-jagamn-primary">
                <CalendarIcon className="w-4 h-4 text-[#00152A]" />
                <span className={cn("font-semibold text-sm", !checkOut && "text-muted-foreground")}>
                  {checkOut ? format(checkOut, "dd MMM yyyy") : "Select date"}
                </span>
              </div>
            </div>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar mode="single" selected={checkOut} onSelect={setCheckOut} initialFocus />
          </PopoverContent>
        </Popover>

        {/* Room Type */}
        <div className="flex-1 flex flex-col px-4 py-1.5 hover:bg-gray-50 rounded-md transition-colors border-b md:border-b-0 md:border-r border-gray-100 last:border-0 w-full">
          <span className="text-xs font-semibold text-jagamn-secondary mb-0.5 uppercase tracking-wider">
            Room Type
          </span>
          <Select value={roomType} onValueChange={setRoomType}>
            <SelectTrigger className="border-0 p-0 h-auto w-full focus:ring-0 shadow-none bg-transparent hover:bg-transparent">
              <div className="flex items-center gap-2 text-jagamn-primary">
                <Building className="w-4 h-4 text-jagamn-tertiary" />
                <SelectValue placeholder="Select room type" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Rooms</SelectItem>
              <SelectItem value="classic-heritage">Classic Heritage</SelectItem>
              <SelectItem value="palace-deluxe">Palace Deluxe</SelectItem>
              <SelectItem value="royal-grand-suite">Royal Grand Suite</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Guests */}
        <div className="flex-1 flex flex-col px-4 py-1.5 hover:bg-gray-50 rounded-md transition-colors border-b md:border-b-0 md:border-r border-gray-100 last:border-0 w-full">
          <span className="text-xs font-semibold text-jagamn-secondary mb-0.5 uppercase tracking-wider">
            Requirement
          </span>
          <Select value={guests} onValueChange={setGuests}>
            <SelectTrigger className="border-0 p-0 h-auto w-full focus:ring-0 shadow-none bg-transparent hover:bg-transparent">
              <div className="flex items-center gap-2 text-jagamn-primary">
                <Users className="w-4 h-4 text-[#00152A]" />
                <SelectValue placeholder="Select guests" />
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

        {/* Action Button */}
        <div className="px-2 w-full md:w-auto mt-2 md:mt-0">
          <Button
            onClick={handleCheckAvailability}
            className="w-full md:w-auto h-14 px-8 bg-jagamn-primary hover:bg-jagamn-primary/90 text-white rounded-md text-sm font-semibold flex items-center justify-center gap-2"
          >
            Check Availability
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Dates Unavailable Modal */}
      {modalData && checkIn && checkOut && (
        <DatesUnavailableModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          roomSlug={modalData.roomSlug}
          checkIn={checkIn}
          checkOut={checkOut}
          unavailableRange={modalData.unavailableRange}
        />
      )}
    </>
  );
}
