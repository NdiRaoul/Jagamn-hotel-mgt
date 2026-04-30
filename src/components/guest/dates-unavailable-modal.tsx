"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { format } from "date-fns";
import { X, ArrowRight, CalendarX } from "lucide-react";
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
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  if (!isOpen || !isMounted) return null;

  const room = ROOMS.find((r) => r.slug === roomSlug);
  const roomName = room?.name ?? "This Room";

  const alternateRooms = (unavailableRange.alternateRooms ?? [])
    .map((slug) => ROOMS.find((r) => r.slug === slug))
    .filter(Boolean);

  // Build the "Explore X & Y" label from alternative rooms
  const exploreLabel =
    alternateRooms.length > 0
      ? `Explore ${alternateRooms.map((r) => r!.name).join(" & ")}`
      : "Explore Available Suites";

  // The date range string for the "Available" section header
  const availRangeLabel = `Available ${format(checkIn, "MMM d")} – ${format(checkOut, "MMM d")}`;

  function handleViewAvailability() {
    const params = new URLSearchParams({
      checkIn: format(checkIn, "yyyy-MM-dd"),
      checkOut: format(checkOut, "yyyy-MM-dd"),
    });
    router.push(`/rooms?${params.toString()}`);
    onClose();
  }

  function handleExploreAlternatives() {
    if (alternateRooms.length === 1) {
      router.push(`/rooms/${alternateRooms[0]!.slug}`);
    } else {
      router.push("/rooms");
    }
    onClose();
  }

  return createPortal(
    // Full-page fixed overlay — rendered at document.body, so it covers everything
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Backdrop: covers the full viewport with blur */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal panel */}
      <div className="relative bg-white rounded-lg border-l-4 border-[#00152A] shadow-2xl w-full max-w-lg mx-4 z-10 overflow-hidden">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-8">
          {/* Header */}
          <div className="flex items-start gap-3 mb-2">
            <CalendarX className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
            <h2 className="manrope-bold text-2xl text-jagamn-primary leading-tight">
              Dates Unavailable
            </h2>
          </div>
          <p className="text-sm text-jagamn-secondary mb-5 ml-9">
            {roomName}&nbsp;&bull;&nbsp;
            {format(checkIn, "MMM d")} – {format(checkOut, "MMM d, yyyy")}
          </p>

          {/* Body */}
          <p className="text-sm text-jagamn-secondary leading-relaxed mb-6">
            We regret to inform you that the {roomName} is currently reserved
            for your selected dates. To assist you in maintaining your itinerary,
            we have curated a selection of exceptional alternatives.
          </p>

          {/* Suggested Alternate Dates */}
          {unavailableRange.alternateDates &&
            unavailableRange.alternateDates.length > 0 && (
              <div className="bg-[#F4F6F8] rounded-md p-4 mb-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-jagamn-secondary mb-3">
                  Suggested Alternate Dates
                </p>
                <div className="flex gap-3">
                  {unavailableRange.alternateDates.map((alt, i) => (
                    <button
                      key={i}
                      className="flex-1 border border-gray-200 bg-white rounded-md px-4 py-2.5 text-sm text-center hover:border-jagamn-primary hover:bg-white transition-colors"
                    >
                      <span className="manrope-semibold text-jagamn-primary text-sm">
                        {format(new Date(alt.from), "MMM d")} –{" "}
                        {format(new Date(alt.to), "MMM d")}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

          {/* Available Alternatives card */}
          {alternateRooms.length > 0 && (
            <div className="bg-[#F4F6F8] rounded-md p-4 mb-6">
              <p className="text-[10px] font-bold uppercase tracking-widest text-jagamn-secondary mb-2">
                {availRangeLabel}
              </p>
              <div className="flex items-center justify-between">
                <p className="manrope-semibold text-jagamn-primary text-base">
                  {exploreLabel}
                </p>
                <button
                  onClick={handleExploreAlternatives}
                  className="w-9 h-9 rounded-md border border-gray-200 bg-white flex items-center justify-center hover:border-jagamn-primary transition-colors flex-shrink-0 ml-4"
                >
                  <ArrowRight className="w-4 h-4 text-jagamn-primary" />
                </button>
              </div>
            </div>
          )}

          {/* Divider */}
          <div className="border-t border-gray-100 mb-6" />

          {/* Actions */}
          <div className="flex items-center justify-end gap-6">
            <button
              onClick={onClose}
              className="text-sm text-jagamn-secondary hover:text-jagamn-primary transition-colors font-medium"
            >
              Modify Search
            </button>
            <button
              onClick={handleViewAvailability}
              className="bg-jagamn-primary hover:bg-jagamn-primary/90 text-white text-sm font-semibold px-6 py-3 rounded-md transition-colors"
            >
              View All Availability
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
