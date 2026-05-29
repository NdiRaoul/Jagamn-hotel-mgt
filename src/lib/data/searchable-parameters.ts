/**
 * JAGAMN PALACE ADMINISTRATIVE SUITE
 * Global Search Data Dictionary
 * 
 * This file documents the multi-parameter search capabilities implemented across 
 * all administrative modules. The global search bar dispatches a `jagamn-global-search`
 * event, which is intercepted by the following pages to filter their respective 
 * data arrays based on the parameters listed below.
 */

export const SEARCHABLE_PARAMETERS = {
  staffDirectory: {
    path: "/admin/staff",
    description: "Personnel Management & Directory",
    searchableColumns: [
      "name",       // e.g., "Julianne Devis"
      "id",         // e.g., "JD001"
      "email",      // e.g., "j.devis@grandpalace.com"
      "position",   // e.g., "Lead Concierge"
      "role",       // e.g., "ADMIN"
      "dept"        // e.g., "Guest Relations"
    ],
    additionalFilters: [
      "Department (Dropdown)",
      "Hire Date (Date Range Selector from/to)"
    ]
  },
  
  revenueIntelligence: {
    path: "/admin/revenue",
    description: "Fiscal Command Center & Transaction Ledger",
    searchableColumns: [
      "client",     // e.g., "Corporate Gala - Oracle"
      "id",         // e.g., "TX-9903"
      "type",       // e.g., "Banqueting"
      "status",     // e.g., "Completed", "Pending"
      "amount"      // e.g., "42000"
    ],
    additionalFilters: [
      "Status (Dropdown)",
      "Transaction Date (Date Range Selector from/to)",
      "Timeframe (Weekly, Monthly, Yearly Buttons)"
    ]
  },

  procurementCommand: {
    path: "/admin/procurement",
    description: "Supply Chain & Logistics Engine",
    searchableColumns: [
      "item",       // e.g., "Premium Linen Set (King)"
      "supplier",   // e.g., "Regency Textiles Ltd"
      "id",         // e.g., "PO-4401"
      "status",     // e.g., "In Transit", "Delivered"
      "priority",   // e.g., "High", "Urgent"
      "amount"      // e.g., "12500"
    ],
    additionalFilters: [
      "Priority (Dropdown)",
      "Order Date (Date Range Selector from/to)",
      "Tab State (Active Orders vs. Archive)"
    ]
  },

  humanResources: {
    path: "/admin/hr",
    description: "Human Capital Intelligence (Leave & Deductions)",
    searchableColumns: [
      "staff.name", // e.g., "Elena Rodriguez"
      "staff.id",   // e.g., "ST-1042"
      "staff.role", // e.g., "Housekeeping Lead"
      "id",         // e.g., "LR-1042"
      "category",   // e.g., "Sick Leave"
      "status",     // e.g., "Pending"
      "reason"      // (Deductions specific)
    ],
    additionalFilters: [
      "Leave Type (Dropdown)",
      "Leave Status (Buttons: Pending, Approved, etc.)",
      "Date Range (Date Range Selector from/to)"
    ]
  },

  payrollComputation: {
    path: "/admin/payroll",
    description: "Financial Compensation Scheduling",
    searchableColumns: [
      "name",       // e.g., "Marcus Vane"
      "id",         // e.g., "S-103"
      "role",       // e.g., "Chef de Cuisine"
      "gross",      // e.g., "5200"
      "net"         // e.g., "4800"
    ],
    additionalFilters: [
      "Role (Dropdown via Filter Icon)",
      "Pay Period (Dropdown: Oct-2024, Sep-2024)"
    ]
  },

  foodAndBeverage: {
    path: "/admin/fb",
    description: "Menu & Culinary Operations",
    searchableColumns: [
      "name",         // e.g., "Palace Reserve Ribeye"
      "id",           // e.g., "M-002"
      "category",     // e.g., "Grill"
      "subCategory",  // e.g., "Grill"
      "status"        // e.g., "Available", "Out of Stock"
    ],
    additionalFilters: [
      "Category (Horizontal Scroll Buttons)"
    ]
  },

  roomsAndSuites: {
    path: "/admin/rooms",
    description: "Suite Logistics & Occupancy",
    searchableColumns: [
      "id",         // e.g., "101"
      "type",       // e.g., "Deluxe Suite"
      "guest",      // e.g., "Mr. Julian Thorne"
      "status"      // e.g., "occupied", "available"
    ],
    additionalFilters: [
      "Floor Filter (Dropdown: All, 1, 2)"
    ]
  }
};
