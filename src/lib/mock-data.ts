export const ARRIVALS_DATA = [
  {
    id: "sterling-alexander",
    guest: "Sterling, Alexander",
    tier: "Palace Member",
    reservation: "RSV-8820-A",
    room: "Maharaja Suite",
    eta: "2:00 PM",
    status: "Ready for Check-In",
    balance: "$500.00",
    vip: true,
  },
  {
    id: "pendelton-arthur",
    guest: "Pendelton, Arthur",
    tier: "Standard",
    reservation: "RSV-8821-B",
    room: "Deluxe King",
    eta: "4:30 PM",
    status: "Room Not Ready",
    balance: "$0.00",
    vip: false,
  },
  {
    id: "chen-wei",
    guest: "Chen, Wei",
    tier: "Gold Elite",
    reservation: "RSV-8822-C",
    room: "Ocean View Suite",
    eta: "6:00 PM",
    status: "Ready for Check-In",
    balance: "$150.00",
    vip: false,
  },
];

export const DEPARTURES_DATA = [
  {
    id: "sterling-alexander",
    guest: "Sterling, Alexander",
    room: "402",
    type: "Deluxe King Suite",
    departure: "11:00 AM",
    status: "Pending Checkout",
    balance: "$1,711.75",
    vip: true,
  },
  {
    id: "jameson-claire",
    guest: "Jameson, Claire",
    room: "215",
    type: "Double Queen",
    departure: "9:30 AM",
    status: "Checked Out",
    balance: "$0.00",
    vip: false,
  },
  {
    id: "kensington-paul",
    guest: "Kensington, Paul",
    room: "508",
    type: "Executive Suite",
    departure: "12:00 PM",
    status: "Late Checkout",
    balance: "$45.00",
    vip: false,
  },
];

export function getArrivalById(id: string) {
  return ARRIVALS_DATA.find((a) => a.id === id);
}

export function getDepartureById(id: string) {
  return DEPARTURES_DATA.find((d) => d.id === id);
}

export const ACTIVE_RESERVATIONS_DATA = [
  {
    id: "vance-eleanor",
    guest: "Eleanor Vance",
    initials: "EW",
    room: "402",
    roomType: "Premium King Suite",
    confirmation: "PR-8842",
    checkIn: "Oct 12",
    checkOut: "Oct 18",
    checkInTime: "Oct 12, 3:00 PM",
    checkOutTime: "Oct 18, 11:00 AM",
    nights: 6,
    currentDay: 2,
    badge: "VIP Status",
    phone: "+1 (555) 019-8234",
    email: "e.vance@example.com",
    payment: "Card on File (ending 4421)",
    incidentalHold: "$500.00",
  },
  {
    id: "sterling-marcus",
    guest: "Marcus Sterling",
    initials: "MR",
    room: "215",
    roomType: "Standard King",
    confirmation: "PR-9102",
    checkIn: "Oct 14",
    checkOut: "Oct 16",
    checkInTime: "Oct 14, 3:00 PM",
    checkOutTime: "Oct 16, 11:00 AM",
    nights: 2,
    currentDay: 1,
    badge: "",
    phone: "+1 (555) 892-1122",
    email: "m.sterling@example.com",
    payment: "Card on File (ending 8812)",
    incidentalHold: "$250.00",
  },
  {
    id: "chen-priya",
    guest: "Priya & Liam Chen",
    initials: "PL",
    room: "510",
    roomType: "Ocean View Suite",
    confirmation: "PR-7731",
    checkIn: "Oct 10",
    checkOut: "Oct 15",
    checkInTime: "Oct 10, 2:00 PM",
    checkOutTime: "Oct 15, 12:00 PM",
    nights: 5,
    currentDay: 4,
    badge: "Anniversary",
    phone: "+1 (555) 334-9911",
    email: "p.chen@example.com",
    payment: "Card on File (ending 1192)",
    incidentalHold: "$500.00",
  },
];

export function getActiveReservationById(id: string) {
  return ACTIVE_RESERVATIONS_DATA.find((r) => r.id === id);
}
