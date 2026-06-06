// ============================================================
// Booking search selection — shared across the guest flow
// Keeps the guest's check-in / check-out / guests / room-type
// selection in sync between the SearchBar (landing + collection)
// and the per-room booking widget.
//
// Persisted in sessionStorage so the selection follows the guest
// no matter how they navigate (search bar, room cards, "similar
// rooms", direct links). URL params always take priority when
// present so links remain shareable.
// ============================================================

export const BOOKING_SEARCH_KEY = "jagamn:booking-search";

export type BookingSearch = {
  checkIn?: string; // ISO date "yyyy-MM-dd"
  checkOut?: string; // ISO date "yyyy-MM-dd"
  guests?: string; // e.g. "2a1c"
  roomType?: string; // slug, or "all"
};

export function saveBookingSearch(search: BookingSearch): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(BOOKING_SEARCH_KEY, JSON.stringify(search));
  } catch {
    // ignore storage failures (private mode, quota, etc.)
  }
}

export function loadBookingSearch(): BookingSearch {
  if (typeof window === "undefined") return {};
  try {
    const raw = sessionStorage.getItem(BOOKING_SEARCH_KEY);
    return raw ? (JSON.parse(raw) as BookingSearch) : {};
  } catch {
    return {};
  }
}

/**
 * Resolve the effective selection: URL params win, then any stored
 * selection from sessionStorage fills in the gaps.
 */
export function resolveBookingSearch(
  params: URLSearchParams,
): BookingSearch {
  const stored = loadBookingSearch();
  return {
    checkIn: params.get("checkIn") || stored.checkIn,
    checkOut: params.get("checkOut") || stored.checkOut,
    guests: params.get("guests") || stored.guests,
    roomType: params.get("roomType") || stored.roomType,
  };
}

/**
 * Build a query string carrying the current selection forward in links.
 */
export function bookingSearchParams(search: BookingSearch): string {
  const params = new URLSearchParams();
  if (search.checkIn) params.set("checkIn", search.checkIn);
  if (search.checkOut) params.set("checkOut", search.checkOut);
  if (search.guests) params.set("guests", search.guests);
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}
