// ============================================================
// Database TypeScript interfaces — mirrors Supabase schema
// ============================================================

export interface RoomType {
  id: string;
  slug: string;
  name: string;
  collection_label: string;
  collection: string;
  badge: string | null;
  price_per_night: number;
  description: string | null;
  long_description: string | null;
  sqft: number | null;
  bed_type: string | null;
  max_guests: number | null;
  cancellation_policy: string | null;
  main_image: string | null;
  gallery_images: string[] | null;
  sort_order: number;
  created_at: string;
}

export interface RoomAmenity {
  id: string;
  room_type_id: string;
  icon: string;
  label: string;
  sort_order: number;
}

export interface Room {
  id: string;
  room_type_id: string;
  unit_code: string;
  floor: number | null;
  is_active: boolean;
  housekeeping_status: string; // 'clean' | 'dirty' | 'out_of_order'
  created_at: string;
}

export interface RoomTypeUnavailableDate {
  id: string;
  room_type_id: string;
  from_date: string;
  to_date: string;
  alternate_room_slugs: string[] | null;
  alternate_dates: { from: string; to: string }[] | null;
}

export interface User {
  id: string; // our own UUID — NOT the auth.users id
  auth_user_id: string | null; // links to auth.users — null for guests without accounts
  full_name: string | null;
  email: string;
  phone: string | null;
  country: string | null;
  nationality: string | null;
  id_type: string | null;
  id_number: string | null;
  role: "member" | "guest"; // guest = no account, member = has Supabase auth account
  loyalty_tier: string;
  special_requests: string | null;
  avatar_url: string | null;
  stripe_customer_id: string | null; // references users.stripe_customer_id — null until Stripe customer created
  created_at: string;
  updated_at: string;
}

/** @deprecated Use User instead */
export interface GuestProfile {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  country: string | null;
  id_type: string | null;
  id_number: string | null;
  nationality: string | null;
  loyalty_tier: string;
  role: "member" | "guest";
  special_requests: string | null;
  created_at: string;
  updated_at: string;
}

export interface PaymentMethod {
  id: string;
  user_id: string;
  app_user_id: string | null; // references users(id)
  method_type: string; // 'card' | 'mobile_money' | 'orange_money' | 'google_pay' | 'apple_pay'
  label: string | null;
  card_last4: string | null;
  card_brand: string | null;
  card_expiry: string | null;
  card_holder_name: string | null;
  phone: string | null;
  stripe_pm_id: string | null;
  is_default: boolean;
  created_at: string;
}

export interface Booking {
  id: string;
  booking_ref: string;
  user_id: string | null;
  guest_email: string;
  guest_name: string;
  guest_phone: string | null;
  guest_country: string | null;
  guest_id_type: string | null;
  guest_id_number: string | null;
  room_type_id: string | null;
  room_id: string | null;
  room_slug: string;
  check_in: string;
  check_out: string;
  nights: number;
  guests: number;
  room_price_per_night: number;
  tax_amount: number | null;
  total_amount: number;
  payment_method: string | null;
  payment_status: string; // 'pending' | 'paid' | 'failed' | 'cancelled'
  status: string; // 'confirmed' | 'cancelled' | 'completed'
  receipt_sent_at: string | null; // ISO timestamp; null until confirmation email sent (idempotency guard)
  special_requests: string | null;
  app_user_id: string | null;
  cancelled_at: string | null;
  cancellation_fee: number;
  refund_amount: number;
  created_at: string;
  // joined
  room_types?: RoomType;
}

export interface Payment {
  id: string;
  booking_id: string | null;
  booking_ref: string | null;
  user_id: string | null;
  app_user_id: string | null; // references users(id)
  amount: number;
  currency: string;
  payment_method: string | null;
  provider: string | null; // 'stripe' | 'fapshi'
  provider_tx_id: string | null;
  status: string; // 'pending' | 'paid' | 'failed'
  fapshi_trans_id: string | null;
  stripe_payment_intent_id: string | null;
  refund_status: string | null;
  refund_tx_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface HotelAmenity {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  image: string | null;
  sort_order: number;
}

export interface RoomAvailabilitySummary {
  room_type_id: string;
  slug: string;
  name: string;
  total_rooms: number;
  booked_today: number;
  available_today: number;
}

// ── Enriched types used across the app ──────────────────────────────────────

export interface RoomTypeWithDetails extends RoomType {
  room_amenities: RoomAmenity[];
  room_type_unavailable_dates: RoomTypeUnavailableDate[];
  available_count?: number;
}

export interface Staff {
  id: string;
  auth_user_id: string;
  full_name: string;
  email: string;
  role: string; // staff_role enum: 'owner' | 'admin' | 'manager' | 'reception' | 'kitchen' | 'storekeeper'
  status: string; // staff_status enum: 'active' | 'suspended' | 'removed'
  avatar_url: string | null;
  must_reset_pw: boolean;
  staff_code: string | null;
  phone: string | null;
  department: string | null;
  position: string | null;
  salary: number | null;
  hire_date: string | null;
  is_owner: boolean;
  created_at: string;
  updated_at: string;
}

export interface PaymentLedger {
  id: string;
  booking_ref: string;
  provider: string;
  amount_minor: number;
  currency: string;
  processor_ref: string | null;
  client_idempotency_key: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface PaymentEvent {
  id: number;
  payment_id: string;
  type: string;
  source: string | null;
  amount_minor: number | null;
  payload: unknown;
  created_at: string;
}

// ── Procurement / Inventory (storekeeper) ───────────────────────────────────
// Money columns (*_minor) store francs × 100; divide by 100 in the data layer.

export interface Supplier {
  id: string;
  name: string;
  category: string | null;
  contact: string | null;
  email: string | null;
  phone: string | null;
  rating: number;
  is_active: boolean;
  created_at: string;
}

export interface PurchaseOrder {
  id: string;
  po_number: string;
  supplier_id: string | null;
  description: string;
  total_minor: number; // francs × 100
  currency: string;
  status: string; // pending_approval | approved | ordered | in_transit | delivered | cancelled
  priority: string; // low | medium | high | urgent
  department: string | null;
  ordered_at: string | null;
  delivered_at: string | null;
  created_by: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface PurchaseOrderItem {
  id: string;
  order_id: string;
  description: string;
  quantity: number;
  unit_price_minor: number; // francs × 100
  total_minor: number; // generated: quantity * unit_price_minor
}

export interface ProcurementBudget {
  id: string;
  department: string;
  year: number;
  month: number | null;
  budget_minor: number; // francs × 100
  created_at: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: string | null;
  unit: string;
  on_hand: number;
  reorder_level: number;
  max_stock: number | null;
  image_url: string | null;
  last_counted_at: string | null;
  supplier_id: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface InventoryRequest {
  id: string;
  item_id: string | null;
  item_name: string;
  quantity: number;
  requested_by: string | null;
  status: "requested" | "approved" | "fulfilled" | "rejected";
  notes: string | null;
  approved_by: string | null;
  approved_at: string | null;
  fulfilled_at: string | null;
  fulfilled_by: string | null;
  created_at: string;
  updated_at: string;
}
