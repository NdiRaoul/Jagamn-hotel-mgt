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
  resort_fee: number;
  tax_amount: number | null;
  total_amount: number;
  payment_method: string | null;
  payment_status: string; // 'pending' | 'paid' | 'failed' | 'cancelled'
  status: string; // 'confirmed' | 'cancelled' | 'completed'
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
