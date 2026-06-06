// ─── Types ───────────────────────────────────────────────────────────────────

export type ItemCategory = "Consumables" | "Maintenance" | "Textiles";
export type StockStatus = "OPTIMAL" | "BELOW THRESHOLD" | "REORDER PENDING";
export type PredictiveStatus = "HIGH RISK OF DEPLETION" | "STABLE" | "MONITOR";

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  unitLabel: string;
  currentStock: number;
  maxStock: number;
  status: StockStatus;
  lastSync: string;
  image: string;
}

export interface PredictiveItem {
  id: string;
  name: string;
  status: PredictiveStatus;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

export const mockInventoryItems: InventoryItem[] = [
  {
    id: "1",
    name: "Egyptian Cotton Towels",
    category: "Textiles",
    unitLabel: "Cases (12ct)",
    currentStock: 12,
    maxStock: 80,
    status: "BELOW THRESHOLD",
    lastSync: "2 hours ago",
    image: "https://images.unsplash.com/photo-1584736286279-5d85e4a8c45c?w=60&h=60&fit=crop",
  },
  {
    id: "2",
    name: "Artisan Mineral Water",
    category: "Consumables",
    unitLabel: "Units",
    currentStock: 410,
    maxStock: 500,
    status: "OPTIMAL",
    lastSync: "5 hours ago",
    image: "https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=60&h=60&fit=crop",
  },
  {
    id: "3",
    name: "Silk Pillowcase Set",
    category: "Textiles",
    unitLabel: "Sets",
    currentStock: 45,
    maxStock: 120,
    status: "REORDER PENDING",
    lastSync: "Yesterday",
    image: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=60&h=60&fit=crop",
  },
  {
    id: "4",
    name: "Palace Signature Mist",
    category: "Consumables",
    unitLabel: "Bottles (500ml)",
    currentStock: 190,
    maxStock: 200,
    status: "OPTIMAL",
    lastSync: "3 days ago",
    image: "https://images.unsplash.com/photo-1541643600914-78b084683702?w=60&h=60&fit=crop",
  },
  {
    id: "5",
    name: "Microfibre Cleaning Cloths",
    category: "Maintenance",
    unitLabel: "Packs",
    currentStock: 8,
    maxStock: 50,
    status: "BELOW THRESHOLD",
    lastSync: "1 hour ago",
    image: "https://images.unsplash.com/photo-1563453392212-326f5e854473?w=60&h=60&fit=crop",
  },
  {
    id: "6",
    name: "Lavender Bath Salts",
    category: "Consumables",
    unitLabel: "Kg",
    currentStock: 22,
    maxStock: 40,
    status: "REORDER PENDING",
    lastSync: "Yesterday",
    image: "https://images.unsplash.com/photo-1570194065650-d99fb4b38d41?w=60&h=60&fit=crop",
  },
];

export const mockPredictiveItems: PredictiveItem[] = [
  { id: "1", name: "Toiletries & Spa Kits", status: "HIGH RISK OF DEPLETION" },
  { id: "2", name: "Gourmet Minibar Selection", status: "STABLE" },
  { id: "3", name: "Guest Slippers", status: "MONITOR" },
];

export const mockCriticalAlerts = 12;
export const mockActiveSKUs = 1402;