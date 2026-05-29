// ─────────────────────────────────────────────────────────────────────────────
// Kitchen Portal Mock Data
// ─────────────────────────────────────────────────────────────────────────────

export type OrderStatus = "new" | "pending_stock" | "in_preparation" | "ready";

export interface KitchenOrder {
  id: string;
  displayId: string;
  timeAgo: string;
  dish: string;
  modifiers: string;
  location: string;
  server: string;
  status: OrderStatus;
  actionRequired?: boolean;
  stockAlert?: string;
  currentStock?: number;
  stockUnit?: string;
  prepProgress?: number;
  stockConfirmed?: boolean;
}

export const KITCHEN_ORDERS: KitchenOrder[] = [
  {
    id: "jgm-4092",
    displayId: "JGM-4092",
    timeAgo: "5m ago",
    dish: "Wagyu Ribeye",
    modifiers: "Medium-Rare, Truffle Jus, Asparagus",
    location: "Table 12",
    server: "Marco",
    status: "new",
  },
  {
    id: "jgm-4150",
    displayId: "JGM-4150",
    timeAgo: "2m ago",
    dish: "Room 402",
    modifiers: "Grilled chicken and french Fries",
    location: "",
    server: "Marco",
    status: "new",
  },
  {
    id: "jgm-4083",
    displayId: "JGM-4083",
    timeAgo: "12m ago",
    dish: "Seared Scallops",
    modifiers: "Low inventory alert: Fresh Scallops",
    location: "",
    server: "Diana",
    status: "pending_stock",
    actionRequired: true,
    stockAlert: "Fresh Scallops",
    currentStock: 2,
    stockUnit: "UNITS",
  },
  {
    id: "jgm-4085",
    displayId: "JGM-4085",
    timeAgo: "18m ago",
    dish: "Dover Sole",
    modifiers: "Citrus Beurre Blanc, Capers",
    location: "Table 7",
    server: "Marco",
    status: "in_preparation",
    prepProgress: 75,
    stockConfirmed: true,
  },
];

export interface MenuItem {
  id: string;
  category: string;
  name: string;
  description: string;
  image: string;
  available: boolean;
  outOfStock?: boolean;
  size: "large" | "small";
  ingredients: { label: string; amount: string }[];
  inventoryStatus?: string;
  inventoryOk?: boolean;
}

export const MENU_ITEMS: MenuItem[] = [
  {
    id: "wagyu-ribeye",
    category: "SIGNATURE ENTRÉE",
    name: "A5 Wagyu Ribeye",
    description:
      "Marble score 12+ Kagoshima beef, smoked sea salt, truffled bone marrow jus, and roasted heirloom roots.",
    image: "/images/food1.png",
    available: true,
    size: "large",
    ingredients: [
      { label: "BEEF", amount: "4.2KG" },
      { label: "TRUFFLE", amount: "120G" },
    ],
  },
  {
    id: "lobster-thermidor",
    category: "CLASSIC SEAFOOD",
    name: "Lobster Thermidor",
    description:
      "Maine lobster medallions in a cognac cream sauce, topped with Gruyère crust and served with wild asparagus.",
    image: "/images/food2.png",
    available: false,
    outOfStock: true,
    size: "large",
    ingredients: [
      { label: "LOBSTER", amount: "0KG" },
      { label: "COGNAC", amount: "1.5L" },
    ],
  },
  {
    id: "estate-burrata",
    category: "STARTER",
    name: "Estate Burrata",
    description: "Hand-tied burrata, heritage tomatoes, cold-pressed estate olive oil.",
    image: "/images/food3.png",
    available: true,
    size: "small",
    ingredients: [],
    inventoryStatus: "High Stock",
    inventoryOk: true,
  },
  {
    id: "wild-sea-bass",
    category: "MAIN",
    name: "Wild Sea Bass",
    description: "Line-caught bass, lemongrass emulsion, garden pea purée.",
    image: "/images/food4.png",
    available: true,
    size: "small",
    ingredients: [],
    inventoryStatus: "Low Stock (2 portions)",
    inventoryOk: false,
  },
];

export interface InventoryTask {
  id: string;
  orderId: string;
  dish: string;
  status: "confirmed" | "insufficient" | "awaiting" | "system_alert";
  items?: { name: string; amount: string; available?: boolean }[];
  storeKeeperNote?: string;
  alertMessage?: string;
  remainingStock?: number;
  depletionTime?: string;
}

export const INVENTORY_TASKS: InventoryTask[] = [
  {
    id: "jp-8821",
    orderId: "#JP-8821",
    dish: "Saffron Risotto",
    status: "confirmed",
    items: [
      { name: "Arborio Rice", amount: "500g", available: true },
      { name: "Premium Saffron Threads", amount: "0.5g", available: true },
      { name: "Parmigiano Reggiano", amount: "120g", available: true },
    ],
  },
  {
    id: "jp-8824",
    orderId: "#JP-8824",
    dish: "Black Truffle Pasta",
    status: "insufficient",
    items: [
      { name: "Fresh Black Truffles", amount: "", available: false },
      { name: "Handmade Tagliatelle", amount: "", available: true },
    ],
    storeKeeperNote: '"Items Unavailable - Notify Guest. Next delivery expected in 4 hours."',
  },
  {
    id: "awaiting",
    orderId: "",
    dish: "Awaiting Store Feedback",
    status: "awaiting",
  },
  {
    id: "lobster-alert",
    orderId: "",
    dish: "Lobster Stock Low",
    status: "system_alert",
    alertMessage: "Remaining stock: 4 Units. Estimated depletion: 45 mins based on current reservations.",
    remainingStock: 4,
    depletionTime: "45 mins",
  },
];

export const VERIFICATION_LOG = [
  {
    id: 1,
    name: "Store Keeper (Arthur)",
    action: "Confirmed stock for #JP-8821",
    time: "2 mins ago",
    color: "green",
  },
  {
    id: 2,
    name: "Store Keeper (Arthur)",
    action: "Flagged missing items for #JP-8824",
    time: "8 mins ago",
    color: "red",
  },
  {
    id: 3,
    name: "Automated Audit",
    action: 'Restock request generated for "Heavy Cream"',
    time: "15 mins ago",
    color: "orange",
  },
];

export const EFFICIENCY_DATA = [
  { hour: "8am", orders: 6 },
  { hour: "9am", orders: 9 },
  { hour: "10am", orders: 7 },
  { hour: "11am", orders: 12 },
  { hour: "12pm", orders: 15 },
  { hour: "1pm", orders: 18 },
];
