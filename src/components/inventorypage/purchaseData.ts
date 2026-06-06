export type POStatus = "DRAFT" | "SUBMITTED" | "APPROVED" | "RECEIVED" | "RECONCILED";

export type TabFilter = "All Orders" | "Drafts" | "Submitted" | "Approved" | "Received" | "Reconciled";

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplier: string;
  items: number;
  totalValue: string;
  totalValueRaw: number;
  status: POStatus;
  date: string;
}

export interface ActivityItem {
  id: string;
  color: "amber" | "dark" | "gray" | "green";
  description: string;
  sub: string;
  time: string;
}

export interface LineItem {
  id: string;
  name: string;
  category: string;
  qty: number;
  unitLabel: string;
  estUnitPrice: number;
}

export const SUPPLIERS = [
  "Grand Millennial Textiles",
  "Estate Vineyard Supply",
  "Royal Gourmet Imports",
  "Maritime & Slate Co.",
  "Silverware Specialists",
  "Grand Estates Linens Ltd.",
  "CleanPro Supplies",
  "Fresh Farm Produce",
  "Aromatics & Spa",
];

export const AVAILABLE_ITEMS = [
  { name: "Egyptian Cotton Sheets", category: "Textiles", unitLabel: "Units" },
  { name: "Silk Pillowcase Set", category: "Textiles", unitLabel: "Units" },
  { name: "Artisan Mineral Water", category: "Consumables", unitLabel: "Cases" },
  { name: "Lavender Bath Salts", category: "Amenities", unitLabel: "Kg" },
  { name: "Microfibre Cloths", category: "Maintenance", unitLabel: "Packs" },
  { name: "Palace Signature Mist", category: "Amenities", unitLabel: "Bottles" },
  { name: "Gourmet Tea Selection", category: "F&B", unitLabel: "Boxes" },
  { name: "Premium Coffee Beans", category: "F&B", unitLabel: "Kg" },
];

export const mockPurchaseOrders: PurchaseOrder[] = [
  {
    id: "1",
    poNumber: "#8822",
    supplier: "Grand Millennial Textiles",
    items: 12,
    totalValue: "$1,240.00",
    totalValueRaw: 1240,
    status: "DRAFT",
    date: "Oct 25, 2025",
  },
  {
    id: "2",
    poNumber: "#8790",
    supplier: "Estate Vineyard Supply",
    items: 45,
    totalValue: "$8,920.50",
    totalValueRaw: 8920.5,
    status: "SUBMITTED",
    date: "Oct 22, 2025",
  },
  {
    id: "3",
    poNumber: "#8750",
    supplier: "Royal Gourmet Imports",
    items: 8,
    totalValue: "$3,400.00",
    totalValueRaw: 3400,
    status: "APPROVED",
    date: "Oct 20, 2025",
  },
  {
    id: "4",
    poNumber: "#8742",
    supplier: "Maritime & Slate Co.",
    items: 22,
    totalValue: "$12,450.00",
    totalValueRaw: 12450,
    status: "RECEIVED",
    date: "Oct 18, 2025",
  },
  {
    id: "5",
    poNumber: "#8731",
    supplier: "Silverware Specialists",
    items: 150,
    totalValue: "$2,115.00",
    totalValueRaw: 2115,
    status: "RECONCILED",
    date: "Oct 15, 2025",
  },
  {
    id: "6",
    poNumber: "#8720",
    supplier: "CleanPro Supplies",
    items: 5,
    totalValue: "$890.00",
    totalValueRaw: 890,
    status: "DRAFT",
    date: "Oct 12, 2025",
  },
  {
    id: "7",
    poNumber: "#8711",
    supplier: "Aromatics & Spa",
    items: 4,
    totalValue: "$1,950.00",
    totalValueRaw: 1950,
    status: "SUBMITTED",
    date: "Oct 10, 2025",
  },
  {
    id: "8",
    poNumber: "#8700",
    supplier: "Fresh Farm Produce",
    items: 8,
    totalValue: "$3,200.00",
    totalValueRaw: 3200,
    status: "APPROVED",
    date: "Oct 8, 2025",
  },
];

export const mockActivity: ActivityItem[] = [
  {
    id: "1",
    color: "amber",
    description: "PO #8750 Approved",
    sub: "Approved by Operations Director",
    time: "2 hours ago",
  },
  {
    id: "2",
    color: "dark",
    description: "PO #8822 Created as Draft",
    sub: "Created by Procurement Officer",
    time: "4 hours ago",
  },
  {
    id: "3",
    color: "gray",
    description: "PO #8742 Fully Received",
    sub: "All items received · Signed by Warehouse Manager",
    time: "Yesterday",
  },
];

export const mockOpenOrders = 14;
export const mockPendingReceipt = 6;