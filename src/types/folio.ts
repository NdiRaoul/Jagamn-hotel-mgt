// Shared folio / balance types — used by both the server data layer and the
// client hook, so they must NOT import anything server-only.

export interface FolioEntry {
  id: string;
  category: string;
  description: string | null;
  amount: number; // whole units, always positive
  entryType: "charge" | "payment";
  createdAt: string;
}

export interface BookingFolio {
  bookingId: string;
  bookingRef: string;
  roomCharge: number; // booking total (room + tax)
  roomPaid: boolean; // room portion fully settled
  roomBalance: number; // room still owed
  extraCharges: number; // dining / minibar / misc charged to room
  extrasBalance: number; // extras still owed
  totalCharges: number; // roomCharge + extraCharges
  totalPaid: number; // payments applied across room + extras
  balanceDue: number; // amount still owed (>= 0)
  refundDue: number; // amount owed back to the guest, e.g. after a downgrade (>= 0)
  fullyPaid: boolean;
  entries?: FolioEntry[];
}

export interface GuestFolioSummary {
  bookings: BookingFolio[];
  totalCharges: number;
  totalPaid: number;
  totalBalanceDue: number;
  totalRefundDue: number;
  hasOutstanding: boolean;
  hasRefund: boolean;
}
