// ─── Types ───────────────────────────────────────────────────────────────────

export type KitchenRequestStatus = "NEEDS APPROVAL" | "IN QUEUE" | "DISPATCHED";
export type KitchenRequestPriority = "Priority High" | "Regular Inventory";
export type KitchenRequestStation =
  | "MAIN KITCHEN"
  | "BAKERY"
  | "PASTRY"
  | "BAR";

export interface KitchenRequest {
  id: string;
  orderNumber: string;
  title: string;
  requestedBy: string;
  itemCount: number;
  priority: KitchenRequestPriority;
  status: KitchenRequestStatus;
  station: KitchenRequestStation;
  image: string;
}

export type StockAlertLevel = "CRITICAL LEVEL" | "LOW INVENTORY";

export interface StockAlert {
  id: string;
  level: StockAlertLevel;
  name: string;
  currentUnits: number;
  minUnits: number;
  selected: boolean;
}

export type POStatus = "DRAFTS" | "SUBMITTED" | "APPROVED";

export type POBadge =
  | "Pending Finance"
  | "Vendor Review"
  | "Expected 2 PM"
  | "In Transit"
  | null;

export interface PurchaseOrder {
  id: string;
  name: string;
  amount?: string;
  badge?: POBadge;
  column: POStatus;
}

// ─── Simulated Data ───────────────────────────────────────────────────────────

export const mockStockIn = 142;
export const mockStockOut = 89;
export const mockStockInChange = "+12% from yesterday";
export const mockStockOutNote = "Normal turnover";

export const mockKitchenRequests: KitchenRequest[] = [
  {
    id: "1",
    orderNumber: "CK-402",
    title: "Italian Night Prep",
    requestedBy: "Chef de Cuisine",
    itemCount: 12,
    priority: "Priority High",
    status: "NEEDS APPROVAL",
    station: "MAIN KITCHEN",
    image: "https://images.unsplash.com/photo-1498579150354-977475b7ea0b?w=80&h=80&fit=crop",
  },
  {
    id: "2",
    orderNumber: "CK-405",
    title: "Pastry Station Refill",
    requestedBy: "Sous Chef",
    itemCount: 5,
    priority: "Regular Inventory",
    status: "IN QUEUE",
    station: "BAKERY",
    image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=80&h=80&fit=crop",
  },
];

export const mockStockAlerts: StockAlert[] = [
  {
    id: "1",
    level: "CRITICAL LEVEL",
    name: "Veuve Clicquot 750ml",
    currentUnits: 4,
    minUnits: 24,
    selected: false,
  },
  {
    id: "2",
    level: "LOW INVENTORY",
    name: "Grade A Egyptian Cotton Towels",
    currentUnits: 42,
    minUnits: 100,
    selected: false,
  },
  {
    id: "3",
    level: "LOW INVENTORY",
    name: "Artisanal Espresso Roast (Kg)",
    currentUnits: 12,
    minUnits: 30,
    selected: false,
  },
];

export const mockPurchaseOrders: PurchaseOrder[] = [
  { id: "8822", name: "Stationery", amount: "$1,240", column: "DRAFTS" },
  { id: "8825", name: "Linen", amount: "$4,800", column: "DRAFTS" },
  { id: "8790", name: "Wine Cellar", badge: "Pending Finance", column: "SUBMITTED" },
  { id: "8795", name: "Pool Chem", badge: "Vendor Review", column: "SUBMITTED" },
  { id: "8750", name: "Fresh Produce", badge: "Expected 2 PM", column: "APPROVED" },
  { id: "8742", name: "Spa Oils", badge: "In Transit", column: "APPROVED" },
];

export const mockPOCounts = {
  DRAFTS: 8,
  SUBMITTED: 14,
  APPROVED: 22,
};