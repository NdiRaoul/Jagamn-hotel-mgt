"use client";

import { X, ArrowRight, CalendarX } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { ROOMS, type UnavailableDateRange } from "@/lib/data/rooms";
import { useRouter } from "next/navigation";

type DatesUnavailableModalProps = {
  isOpen: boolean;
  onClose: () => void;
  roomSlug: string;
  checkIn: Date;
  checkOut: Date;
  unavailableRange: UnavailableDateRange;
};

export function DatesUnavailableModal({
  isOpen,
  onClose,
  roomSlug,
  checkIn,
  checkOut,
  unavailableRange,
}: DatesUnavailableModalProps) {
  const router = useRouter();

  if (!isOpen) return null;

  const room = ROOMS.find((r) => r.slug === roomSlug);
  const roomName = room?.name ?? "This Room";

  const alternateRooms = (unavailableRange.alternateRooms ?? [])
    .map((slug) => ROOMS.find((r) => r.slug === slug))
    .filter(Boolean);

  function handleViewAvailability() {
    // Navigate to collection page with search params
    const params = new URLSearchParams({
      checkIn: format(checkIn, "yyyy-MM-dd"),
      checkOut: format(checkOut, "yyyy-MM-dd"),
    });
    router.push(`/rooms?${params.toString()}`);
    onClose();
  }

  function handleRoomClick(slug: string) {
    const params = new URLSearchParams({
      checkIn: format(checkIn, "yyyy-MM-dd"),
      checkOut: format(checkOut, "yyyy-MM-dd"),
    });
    router.push(`/rooms/${slug}?${params.toString()}`);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-md shadow-2xl w-full max-w-md mx-4 p-8 z-10">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-start gap-4 mb-6">
          <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
            <CalendarX className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <h2 className="manrope-bold text-xl text-jagamn-primary">
              Dates Unavailable
            </h2>
            <p className="text-sm text-jagamn-secondary mt-1">
              {roomName} &bull;{" "}
              {format(checkIn, "MMM d")} – {format(checkOut, "MMM d, yyyy")}
            </p>
          </div>
        </div>

        {/* Body */}
        <p className="text-sm text-jagamn-secondary leading-relaxed mb-6">
          We regret to inform you that the {roomName} is currently reserved for
          your selected dates. To assist you in maintaining your itinerary, we
          have curated a selection of exceptional alternatives.
        </p>

        {/* Suggested Alternate Dates */}
        {unavailableRange.alternateDates &&
          unavailableRange.alternateDates.length > 0 && (
            <div className="mb-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-jagamn-secondary mb-3">
                Suggested Alternate Dates
              </p>
              <div className="flex gap-3">
                {unavailableRange.alternateDates.map((alt, i) => (
                  <div
                    key={i}
                    className="flex-1 border border-gray-200 rounded-md px-4 py-3 text-sm text-center cursor-pointer hover:border-jagamn-primary hover:bg-jagamn-primary/5 transition-colors"
                  >
                    <p className="text-xs text-jagamn-secondary mb-0.5">
                      Option {i + 1}
                    </p>
                    <p className="manrope-semibold text-jagamn-primary text-xs">
                      {format(new Date(alt.from), "MMM d")} –{" "}
                      {format(new Date(alt.to), "MMM d")}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

        {/* Available Alternative Rooms */}
        {alternateRooms.length > 0 && (
          <div className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-wider text-jagamn-secondary mb-3">
              Available for your dates
            </p>
            <div className="space-y-2">
              {alternateRooms.map((altRoom) => {
                if (!altRoom) return null;
                return (
                  <button
                    key={altRoom.slug}
                    onClick={() => handleRoomClick(altRoom.slug)}
                    className="w-full flex items-center justify-between border border-gray-200 rounded-md px-4 py-3 hover:border-jagamn-primary hover:bg-jagamn-primary/5 transition-colors group text-left"
                  >
                    <div>
                      <p className="text-xs text-jagamn-secondary">
                        {altRoom.collectionLabel}
                      </p>
                      <p className="manrope-semibold text-sm text-jagamn-primary">
                        Explore {altRoom.name}
                      </p>
                      <p className="text-xs text-jagamn-secondary">
                        From ${altRoom.price} / night
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-jagamn-tertiary group-hover:translate-x-1 transition-transform" />
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 border-gray-200 text-jagamn-primary hover:bg-gray-50"
          >
            Modify Search
          </Button>
          <Button
            onClick={handleViewAvailability}
            className="flex-1 bg-jagamn-primary hover:bg-jagamn-primary/90 text-white"
          >
            View All Availability
          </Button>
        </div>
      </div>
    </div>
  );
}
