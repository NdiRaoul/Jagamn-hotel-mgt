export type ReportTab =
  | "Inventory Valuation"
  | "Stock Movement"
  | "Low Stock Report"
  | "PO History"
  | "Consumption Trends";

// ─── Header Stats ─────────────────────────────────────────────────────────────
export const mockTotalInventoryValue = "$1,284,500.00";
export const mockInventoryChange = "+4.2% from last month";
export const mockStockTurnoverRate = "8.4x";
export const mockTurnoverNote = "Optimal Efficiency Range";
export const mockAvgLeadTime = "3.2";
export const mockLeadTimeAlert = "Delayed: Fine Wine vendors";

// ─── Inventory Valuation Chart Data ──────────────────────────────────────────
export const inventoryValuationData = [
  { category: "Kitchen", value: 210000 },
  { category: "Bar/Wine", value: 380000 },
  { category: "Linens", value: 195000 },
  { category: "Housekeeping", value: 285000 },
  { category: "Amenities", value: 214500 },
];

export const topCategories = [
  { name: "Premium Spirits", sub: "Bar & Beverage", turnover: "9.2x" },
  { name: "Dairy & Poultry", sub: "Kitchen Supplies", turnover: "12.1x" },
  { name: "Spa Amenities", sub: "2% Below Active", turnover: "5.4x" },
];

export const predictiveInsight =
  "Based on projected booking volumes for next month, we recommend increasing stock by 15% before the holiday weekend spike.";

// ─── Stock Movement Data ──────────────────────────────────────────────────────
export const stockMovementData = [
  { period: "FRI", inflow: 42000, outflow: 31000 },
  { period: "SAT", inflow: 38000, outflow: 44000 },
  { period: "SUN", inflow: 55000, outflow: 38000 },
  { period: "MON", inflow: 29000, outflow: 25000 },
  { period: "TUE", inflow: 61000, outflow: 48000 },
  { period: "WED", inflow: 47000, outflow: 52000 },
  { period: "THU", inflow: 53000, outflow: 41000 },
];

// ─── Low Stock Report Data ────────────────────────────────────────────────────
export interface LowStockReportItem {
  id: string;
  name: string;
  image: string;
  lastTime: string;
  currentUnits: number;
  minUnits: number;
  category: string;
  level: "CRITICAL" | "LOW";
}

export const lowStockItems: LowStockReportItem[] = [
  { id: "1", name: "Macallan 18yr Single Malt", image: "https://images.unsplash.com/photo-1527281400683-1aae777175f8?w=60&h=60&fit=crop", lastTime: "Last Time: 5 Days", currentUnits: 2, minUnits: 12, category: "Bar/Wine", level: "CRITICAL" },
  { id: "2", name: "Hermès Body Wash (Refill)", image: "https://images.unsplash.com/photo-1570194065650-d99fb4b38d41?w=60&h=60&fit=crop", lastTime: "Last Time: 3 Days", currentUnits: 15, minUnits: 40, category: "Amenities", level: "LOW" },
  { id: "3", name: "Silver Polishing Paste", image: "https://images.unsplash.com/photo-1563453392212-326f5e854473?w=60&h=60&fit=crop", lastTime: "Last Time: 10 Days", currentUnits: 6, minUnits: 20, category: "Housekeeping", level: "LOW" },
  { id: "4", name: "Veuve Clicquot 750ml", image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=60&h=60&fit=crop", lastTime: "Last Time: 1 Day", currentUnits: 4, minUnits: 24, category: "Bar/Wine", level: "CRITICAL" },
  { id: "5", name: "Egyptian Cotton Towels", image: "https://images.unsplash.com/photo-1584736286279-5d85e4a8c45c?w=60&h=60&fit=crop", lastTime: "Last Time: 2 Days", currentUnits: 12, minUnits: 80, category: "Linens", level: "LOW" },
];

// ─── PO History Data ──────────────────────────────────────────────────────────
export interface POHistoryItem {
  id: string;
  poNumber: string;
  supplier: string;
  items: number;
  value: string;
  status: "DRAFT" | "SUBMITTED" | "APPROVED" | "RECEIVED" | "RECONCILED";
  date: string;
}

export const poHistoryItems: POHistoryItem[] = [
  { id: "1", poNumber: "#8750", supplier: "Royal Gourmet Imports", items: 8, value: "$3,400.00", status: "RECEIVED", date: "Oct 20, 2025" },
  { id: "2", poNumber: "#8742", supplier: "Maritime & Slate Co.", items: 22, value: "$12,450.00", status: "RECONCILED", date: "Oct 18, 2025" },
  { id: "3", poNumber: "#8731", supplier: "Silverware Specialists", items: 150, value: "$2,115.00", status: "RECONCILED", date: "Oct 15, 2025" },
  { id: "4", poNumber: "#8720", supplier: "CleanPro Supplies", items: 5, value: "$890.00", status: "RECEIVED", date: "Oct 12, 2025" },
  { id: "5", poNumber: "#8711", supplier: "Aromatics & Spa", items: 4, value: "$1,950.00", status: "SUBMITTED", date: "Oct 10, 2025" },
];

// ─── Consumption Trends Data ──────────────────────────────────────────────────
export const consumptionTrendsData = [
  { month: "Jun", purchased: 38000, consumed: 31000 },
  { month: "Jul", purchased: 42000, consumed: 35000 },
  { month: "Aug", purchased: 51000, consumed: 44000 },
  { month: "Sep", purchased: 46000, consumed: 41000 },
  { month: "Oct", purchased: 48200, consumed: 39100 },
];

export const consumptionSummary = {
  purchased: "$48,200",
  consumed: "$39,100",
  note: "Consumption running 18% below procurement — healthy buffer",
};