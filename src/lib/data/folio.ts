import "server-only";
import { supabaseAdmin } from "@/lib/supabase-server";
import type {
  FolioEntry,
  BookingFolio,
  GuestFolioSummary,
} from "@/types/folio";
import { computeBookingBalance } from "@/lib/folio-balance";

export type { FolioEntry, BookingFolio, GuestFolioSummary };

// ============================================================
// Guest folio / balance consolidation
// ------------------------------------------------------------
// A guest's outstanding balance has two parts:
//   1. The room itself — tracked by `bookings.payment_status`
//      ('paid' once settled online; 'pending'/'partial' otherwise).
//   2. Extras charged to the room — in-room dining, minibar, manual
//      reception charges, etc. — recorded in `folio_entries` and
//      aggregated by the `booking_folio_balance` view. Cash payments
//      taken at the front desk also live there as `payment` entries.
//
// `folio_entries` is staff-only under RLS, so guests can never read it
// from the browser. This helper runs with the service-role client so the
// guest-facing pages can show a single, consolidated balance.
//
// Money: `bookings.total_amount` is whole XAF/USD; `folio_entries.amount_minor`
// (and the view's *_minor columns) are minor units (× 100). We normalise
// everything to whole units here so callers never juggle the two.
// ============================================================

const EMPTY_SUMMARY: GuestFolioSummary = {
  bookings: [],
  totalCharges: 0,
  totalPaid: 0,
  totalBalanceDue: 0,
  totalRefundDue: 0,
  hasOutstanding: false,
  hasRefund: false,
};

/**
 * Consolidated balance for a guest's bookings (room + extras − payments).
 *
 * Pass `bookingId` to scope to a single booking, and `includeEntries` to get
 * the per-line folio breakdown (used by the booking detail page).
 */
export async function getGuestFolios(
  appUserId: string,
  opts: { bookingId?: string; includeEntries?: boolean } = {},
): Promise<GuestFolioSummary> {
  // Only genuine stays carry a balance — skip cancelled/expired holds and
  // unpaid pending reservations that never became a real booking.
  let query = supabaseAdmin
    .from("bookings")
    .select("id, booking_ref, total_amount, payment_status, status")
    .eq("app_user_id", appUserId)
    .not("status", "in", "(cancelled,expired,pending)");

  if (opts.bookingId) query = query.eq("id", opts.bookingId);

  const { data: bookingRows, error } = await query;
  if (error || !bookingRows || bookingRows.length === 0) return EMPTY_SUMMARY;

  type Row = {
    id: string;
    booking_ref: string;
    total_amount: number;
    payment_status: string | null;
    status: string;
  };
  const bookings = bookingRows as Row[];
  const ids = bookings.map((b) => b.id);

  // Folio aggregates (dining etc.). A missing view / failed read degrades to
  // zero extras rather than breaking the whole balance.
  const folioByBooking = new Map<
    string,
    { chargesMinor: number; paymentsMinor: number }
  >();
  const { data: folios } = await supabaseAdmin
    .from("booking_folio_balance")
    .select("booking_id, charges_minor, paid_minor")
    .in("booking_id", ids);
  for (const f of folios ?? []) {
    folioByBooking.set(f.booking_id, {
      chargesMinor: f.charges_minor ?? 0,
      paymentsMinor: f.paid_minor ?? 0,
    });
  }

  // Which bookings carry the room itself as a folio charge (desk / walk-in
  // bookings settled at the front desk). Online prepaid rooms never do.
  const roomInFolio = new Set<string>();
  const { data: roomCharges } = await supabaseAdmin
    .from("folio_entries")
    .select("booking_id")
    .in("booking_id", ids)
    .eq("category", "room")
    .eq("entry_type", "charge");
  for (const r of roomCharges ?? []) roomInFolio.add(r.booking_id);

  // Per-line entries only when asked (single-booking detail view).
  const entriesByBooking = new Map<string, FolioEntry[]>();
  if (opts.includeEntries) {
    const { data: rawEntries } = await supabaseAdmin
      .from("folio_entries")
      .select("id, booking_id, category, description, amount_minor, entry_type, created_at")
      .in("booking_id", ids)
      .order("created_at", { ascending: true });
    for (const e of rawEntries ?? []) {
      const list = entriesByBooking.get(e.booking_id) ?? [];
      list.push({
        id: e.id,
        category: e.category,
        description: e.description,
        amount: Math.abs(e.amount_minor ?? 0) / 100,
        entryType: e.entry_type === "payment" ? "payment" : "charge",
        createdAt: e.created_at,
      });
      entriesByBooking.set(e.booking_id, list);
    }
  }

  const result: BookingFolio[] = bookings.map((b) => {
    const folio = folioByBooking.get(b.id) ?? {
      chargesMinor: 0,
      paymentsMinor: 0,
    };
    const balance = computeBookingBalance({
      totalAmount: b.total_amount ?? 0,
      paymentStatus: b.payment_status,
      folioChargesMinor: folio.chargesMinor,
      folioPaymentsMinor: folio.paymentsMinor,
      roomInFolio: roomInFolio.has(b.id),
    });
    return {
      bookingId: b.id,
      bookingRef: b.booking_ref,
      roomCharge: balance.roomCharge,
      roomPaid: balance.roomPaid,
      roomBalance: balance.roomBalance,
      extraCharges: balance.extraCharges,
      extrasBalance: balance.extrasBalance,
      totalCharges: balance.totalCharges,
      totalPaid: balance.totalPaid,
      balanceDue: balance.balanceDue,
      refundDue: balance.refundDue,
      fullyPaid: balance.fullyPaid,
      // For a folio-tracked room, the standalone "room" charge line is internal
      // accounting — hide it so the breakdown shows room (via nights × rate) +
      // genuine extras only.
      entries: opts.includeEntries
        ? (entriesByBooking.get(b.id) ?? []).filter(
            (e) => !(e.category === "room" && e.entryType === "charge"),
          )
        : undefined,
    };
  });

  const totalCharges = result.reduce((s, b) => s + b.totalCharges, 0);
  const totalPaid = result.reduce((s, b) => s + b.totalPaid, 0);
  const totalBalanceDue = result.reduce((s, b) => s + b.balanceDue, 0);
  const totalRefundDue = result.reduce((s, b) => s + b.refundDue, 0);

  return {
    bookings: result,
    totalCharges,
    totalPaid,
    totalBalanceDue,
    totalRefundDue,
    hasOutstanding: totalBalanceDue > 0,
    hasRefund: totalRefundDue > 0,
  };
}
