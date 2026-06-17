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
  balanceDue: number; // amount the guest still owes (>= 0)
  refundDue: number; // amount owed back to the guest, e.g. after a downgrade (>= 0)
  roomPaid: boolean;
  fullyPaid: boolean; // charges fully covered (a pending refund still counts as covered)
}

export function computeBookingBalance(i: BalanceInputs): ComputedBalance {
  const room = i.totalAmount ?? 0;
  const folioCharges = (i.folioChargesMinor ?? 0) / 100;
  const folioPayments = (i.folioPaymentsMinor ?? 0) / 100;
  const roomPrepaid = i.paymentStatus === "paid";

  let extraCharges: number;
  let roomBalance: number;
  let extrasBalance: number;
  let totalCharges: number;
  let totalPaid: number;

  if (i.roomInFolio) {
    // Folio is the single ledger: room + extras are all charges; every payment
    // (carried-over prepayment from a reassignment, cash at the desk) is a
    // payment entry. The net can go NEGATIVE — a credit owed back to the guest,
    // e.g. when a downgrade leaves them having paid more than the new room costs.
    extraCharges = Math.max(folioCharges - room, 0);
    totalCharges = folioCharges;
    totalPaid = folioPayments;
    const paymentsTowardRoom = Math.min(folioPayments, room);
    roomBalance = Math.max(room - paymentsTowardRoom, 0);
    const paymentsTowardExtras = Math.max(folioPayments - room, 0);
    extrasBalance = Math.max(extraCharges - paymentsTowardExtras, 0);
  } else {
    // Room settled via payment_status (online prepay); only extras live in the
    // folio.
    extraCharges = folioCharges;
    const roomPaidAmt = roomPrepaid ? room : 0;
    roomBalance = Math.max(room - roomPaidAmt, 0);
    extrasBalance = Math.max(extraCharges - folioPayments, 0);
    totalCharges = room + extraCharges;
    totalPaid = roomPaidAmt + folioPayments;
  }

  const net = totalCharges - totalPaid;
  const balanceDue = Math.max(net, 0);
  const refundDue = Math.max(-net, 0);

  return {
    roomCharge: room,
    extraCharges,
    roomBalance,
    extrasBalance,
    totalCharges,
    totalPaid,
    balanceDue,
    refundDue,
    roomPaid: roomBalance <= 0,
    fullyPaid: balanceDue <= 0,
  };
}
