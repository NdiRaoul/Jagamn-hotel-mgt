// ─────────────────────────────────────────────────────────────────────────────
// Reporting / Analytics Mock Data
// ─────────────────────────────────────────────────────────────────────────────

export interface UnavailabilityIncident {
  id: string;
  item: string;
  sku: string;
  timestamp: string;
  reason: "STOCK OUT" | "PROCUREMENT DELAY" | "PRODUCTION HALT";
  duration: string;
  type: "food" | "drink" | "ingredient";
}

export const UNAVAILABILITY_LOG: UnavailabilityIncident[] = [
  {
    id: "1",
    item: "Wagyu Ribeye (A5)",
    sku: "SKU: JAG-772-B",
    timestamp: "14:22 PM",
    reason: "STOCK OUT",
    duration: "Ongoing",
    type: "food",
  },
  {
    id: "2",
    item: "Dom Pérignon '12",
    sku: "SKU: VIN-001-L",
    timestamp: "11:05 AM",
    reason: "PROCUREMENT DELAY",
    duration: "2h 15m",
    type: "drink",
  },
  {
    id: "3",
    item: "Black Truffle Brioche",
    sku: "SKU: PAS-442-S",
    timestamp: "09:30 AM",
    reason: "PRODUCTION HALT",
    duration: "45m",
    type: "ingredient",
  },
];

export const HOURLY_VOLUME = [
  { time: "08:00", dineIn: 12, roomService: 8 },
  { time: "10:00", dineIn: 18, roomService: 12 },
  { time: "12:00", dineIn: 45, roomService: 28 },
  { time: "14:00", dineIn: 22, roomService: 15 },
  { time: "16:00", dineIn: 15, roomService: 10 },
  { time: "18:00", dineIn: 58, roomService: 42 },
  { time: "20:00", dineIn: 40, roomService: 25 },
];

export const KITCHEN_HARDWARE = [
  {
    id: "h1",
    name: "Main Range Active",
    status: "online",
    desc: "Optimal operational temperature",
    color: "bg-green-500",
  },
  {
    id: "h2",
    name: "Cold Storage Warning",
    status: "warning",
    desc: "Sensor A12 reporting +2°C shift",
    color: "bg-orange-500",
  },
  {
    id: "h3",
    name: "Pastry Station Idle",
    status: "offline",
    desc: "Scheduled cleaning in progress",
    color: "bg-gray-400",
  },
];
