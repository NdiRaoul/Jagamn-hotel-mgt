// Pure balance math shared by the guest folio API and the staff room board.
// No server-only imports — safe to use from any data layer.
//
// A booking's balance has two parts:
//   • The ROOM — `bookings.total_amount`. Settled either by online prepayment
//     (`payment_status = 'paid'`, no folio entry) or, for desk/walk-in
//     bookings, by posting the room as a folio `room` charge that cash payments
//     draw down.
//   • EXTRAS — in-room dining, minibar, manual charges — always in the folio.
//
// `folio_entries.amount_minor` (and the view's *_minor columns) are XAF × 100.

export interface BalanceInputs {
  totalAmount: number; // bookings.total_amount (whole XAF)
  paymentStatus: string | null | undefined;
  folioChargesMinor: number; // booking_folio_balance.charges_minor
  folioPaymentsMinor: number; // booking_folio_balance.paid_minor
  roomInFolio: boolean; // a folio `room` charge exists for this booking
}

export interface ComputedBalance {
  roomCharge: number;
  extraCharges: number;
  roomBalance: number; // room still owed
  extrasBalance: number; // extras still owed
  totalCharges: number;
  totalPaid: number;
  balanceDue: number;
  roomPaid: boolean;
  fullyPaid: boolean;
}

export function computeBookingBalance(i: BalanceInputs): ComputedBalance {
  const room = i.totalAmount ?? 0;
  const folioCharges = (i.folioChargesMinor ?? 0) / 100;
  const folioPayments = (i.folioPaymentsMinor ?? 0) / 100;
  const roomPrepaid = i.paymentStatus === "paid";

  // When the room is in the folio, its charge is part of folioCharges; strip it
  // back out so `extraCharges` is dining/misc only.
  const extraCharges = Math.max(folioCharges - (i.roomInFolio ? room : 0), 0);

  // Apply desk payments to the room first, then to extras.
  const paymentsTowardRoom = roomPrepaid ? room : Math.min(folioPayments, room);
  const roomBalance = Math.max(room - paymentsTowardRoom, 0);
  const paymentsTowardExtras = roomPrepaid
    ? folioPayments
    : Math.max(folioPayments - room, 0);
  const extrasBalance = Math.max(extraCharges - paymentsTowardExtras, 0);

  const balanceDue = roomBalance + extrasBalance;
  const totalCharges = room + extraCharges;
  const totalPaid = totalCharges - balanceDue;

  return {
    roomCharge: room,
    extraCharges,
    roomBalance,
    extrasBalance,
    totalCharges,
    totalPaid,
    balanceDue,
    roomPaid: roomBalance <= 0,
    fullyPaid: balanceDue <= 0,
  };
}
