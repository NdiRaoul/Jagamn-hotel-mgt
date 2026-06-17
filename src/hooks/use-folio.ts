"use client";

import { useEffect, useState } from "react";
import type { GuestFolioSummary } from "@/types/folio";

/**
 * Fetch the signed-in guest's consolidated balance (room + extras − payments)
 * from `/api/bookings/folio`. Pass a `bookingId` to scope to one booking and
 * receive the per-line folio breakdown.
 */
export function useFolioSummary(bookingId?: string) {
  const [summary, setSummary] = useState<GuestFolioSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    const url = bookingId
      ? `/api/bookings/folio?booking_id=${encodeURIComponent(bookingId)}`
      : "/api/bookings/folio";
    fetch(url)
      .then((r) => (r.ok ? r.json() : null))
      .then((data: GuestFolioSummary | null) => {
        if (active) {
          setSummary(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [bookingId]);

  return { summary, loading };
}
