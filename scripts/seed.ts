/**
 * Jagamn Palace — Database Seed Script
 * Run: npx ts-node --project tsconfig.json scripts/seed.ts
 *
 * Idempotent: clears all seeded tables then re-inserts.
 * All room types are seeded with NO unavailable-date blocks so every
 * room is immediately bookable.
 * Also seeds menu_categories + menu_items for the dining feature.
 */

import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import { fileURLToPath } from "url";
import * as path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const supabaseUrl =
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

if (!supabaseUrl || !supabaseKey) {
  console.error(
    "❌  Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env",
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// ── Room Types ───────────────────────────────────────────────────────────────

type RoomTypeInsert = {
  slug: string;
  name: string;
  collection_label: string;
  collection: string;
  badge: string | null;
  price_per_night: number;
  sqft: number;
  bed_type: string;
  max_guests: number;
  description: string;
  long_description: string;
  main_image: string;
  gallery_images: string[];
  cancellation_policy: string;
  sort_order: number;
};

const ROOM_TYPES: RoomTypeInsert[] = [
  {
    slug: "garden-terrace",
    name: "Garden Terrace Room",
    collection_label: "Garden Collection",
    collection: "garden_collection",
    badge: null,
    price_per_night: 199,
    sqft: 820,
    bed_type: "Queen Garden",
    max_guests: 2,
    description:
      "A serene retreat surrounded by the palace's manicured gardens, offering a private terrace and tranquil views.",
    long_description:
      "Step onto your private terrace and wake up to birdsong amid the palace's lush botanical gardens. The Garden Terrace Room blends natural textures with refined comfort — hand-loomed linens, a rainfall shower, and curated palace toiletries await your arrival.",
    main_image: "/images/classic-heritage.png",
    gallery_images: [
      "/images/royal-pool.png",
      "/images/the-library.png",
      "/images/celestial-spa.png",
      "/images/saffron-silk.png",
    ],
    cancellation_policy:
      "Cancel at no cost 24 hours before check-in. Same-day cancellations are subject to a one-night fee.",
    sort_order: 1,
  },
  {
    slug: "classic-heritage",
    name: "Classic Heritage",
    collection_label: "Heritage Collection",
    collection: "heritage_collection",
    badge: null,
    price_per_night: 299,
    sqft: 1268,
    bed_type: "King Terrace",
    max_guests: 3,
    description:
      "Inspired by the regal heritage of 17th-century Rajasthani architecture, the Classic Heritage offers an expansive sanctuary of peace and prestige.",
    long_description:
      "Featuring hand-woven silk tapestries, a private sandstone terrace overlooking the reflecting pool, and a dedicated 24-hour butler service, this suite is the pinnacle of modern stately living.",
    main_image: "/images/classic-heritage.png",
    gallery_images: [
      "/images/palace-deluxe.png",
      "/images/royal-pool.png",
      "/images/the-library.png",
      "/images/saffron-silk.png",
    ],
    cancellation_policy:
      "Cancel at no cost 48 hours before check-in. After that, Palace Club members enjoy exemption up to 4 hours prior.",
    sort_order: 2,
  },
  {
    slug: "palace-deluxe",
    name: "Palace Deluxe",
    collection_label: "Signature Collection",
    collection: "signature_collection",
    badge: "Most Popular",
    price_per_night: 450,
    sqft: 1800,
    bed_type: "King Canopy",
    max_guests: 4,
    description:
      "Experience palace suite living featuring award-winning quarters, panoramic garden views, and dedicated 24-hour in-suite dining.",
    long_description:
      "The Palace Deluxe is our crown jewel — a grand space adorned with hand-carved marble pillars, bespoke Rajasthani artwork, and a private plunge pool shaded by ancient tamarind trees.",
    main_image: "/images/palace-deluxe.png",
    gallery_images: [
      "/images/classic-heritage.png",
      "/images/royal-grand-suite.png",
      "/images/celestial-spa.png",
      "/images/royal-pool.png",
    ],
    cancellation_policy:
      "Cancel at no cost 48 hours before check-in. After that, Palace Club members enjoy exemption up to 4 hours prior.",
    sort_order: 3,
  },
  {
    slug: "royal-grand-suite",
    name: "Royal Grand Suite",
    collection_label: "Royal Collection",
    collection: "royal_collection",
    badge: null,
    price_per_night: 899,
    sqft: 3500,
    bed_type: "Emperor King",
    max_guests: 6,
    description:
      "The ultimate expression of palace luxury and privacy. Reserved for royalty, heads of state, and those who demand nothing less.",
    long_description:
      "Spanning two floors, the Royal Grand Suite features a personal butler's pantry, a private rooftop terrace with a heated infinity pool, a formal dining room for eight, and a master dressing room lined with custom cabinetry.",
    main_image: "/images/royal-grand-suite.png",
    gallery_images: [
      "/images/palace-deluxe.png",
      "/images/celestial-spa.png",
      "/images/saffron-silk.png",
      "/images/the-library.png",
    ],
    cancellation_policy:
      "Cancel at no cost 72 hours before check-in. Fully flexible for Palace Elite members.",
    sort_order: 4,
  },
  {
    slug: "maharaja-presidential",
    name: "Maharaja Presidential Suite",
    collection_label: "Presidential Collection",
    collection: "presidential_collection",
    badge: "Ultra Exclusive",
    price_per_night: 1499,
    sqft: 5200,
    bed_type: "Twin Emperor",
    max_guests: 8,
    description:
      "The sovereign experience. Reserved for those who define luxury.",
    long_description:
      "The Maharaja Presidential Suite is the crown of Jagamn Palace — an entire private floor featuring a grand reception hall, two master bedrooms with Emperor beds, a private library, cigar lounge, and a heated rooftop infinity pool with panoramic views of the palace grounds.",
    main_image: "/images/royal-grand-suite.png",
    gallery_images: [
      "/images/palace-deluxe.png",
      "/images/celestial-spa.png",
      "/images/royal-pool.png",
      "/images/the-library.png",
    ],
    cancellation_policy:
      "Fully flexible cancellation for all guests. Cancel any time before check-in for a full refund.",
    sort_order: 5,
  },
];

// ── Amenities per room type ──────────────────────────────────────────────────

const AMENITIES: Record<string, { icon: string; label: string }[]> = {
  "garden-terrace": [
    { icon: "Wifi", label: "Ultra Fast Wifi" },
    { icon: "Coffee", label: "Nespresso Machine" },
    { icon: "Thermometer", label: "Climate Control" },
    { icon: "TreePine", label: "Garden Terrace Access" },
    { icon: "Bath", label: "Rainfall Shower" },
    { icon: "Sparkles", label: "Palace Toiletries" },
  ],
  "classic-heritage": [
    { icon: "Wifi", label: "Ultra Fast Wifi" },
    { icon: "Wine", label: "Curated Mini-Bar" },
    { icon: "UserCheck", label: "Private Butler" },
    { icon: "Coffee", label: "Nespresso Machine" },
    { icon: "Thermometer", label: "Climate Control" },
    { icon: "Sparkles", label: "Palace Spa Linens" },
  ],
  "palace-deluxe": [
    { icon: "Wifi", label: "Ultra Fast Wifi" },
    { icon: "Wine", label: "Curated Mini-Bar" },
    { icon: "UserCheck", label: "Private Butler" },
    { icon: "Coffee", label: "Nespresso Machine" },
    { icon: "Thermometer", label: "Climate Control" },
    { icon: "Sparkles", label: "Palace Spa Linens" },
    { icon: "Waves", label: "Private Plunge Pool" },
    { icon: "Utensils", label: "24hr In-Suite Dining" },
  ],
  "royal-grand-suite": [
    { icon: "Wifi", label: "Ultra Fast Wifi" },
    { icon: "Wine", label: "Curated Mini-Bar" },
    { icon: "UserCheck", label: "Private Butler" },
    { icon: "Coffee", label: "Nespresso Machine" },
    { icon: "Thermometer", label: "Climate Control" },
    { icon: "Sparkles", label: "Palace Spa Linens" },
    { icon: "Waves", label: "Heated Infinity Pool" },
    { icon: "Utensils", label: "Formal Dining Room (8)" },
    { icon: "Library", label: "Private Library" },
    { icon: "Car", label: "Rolls-Royce Transfer" },
  ],
  "maharaja-presidential": [
    { icon: "Wifi", label: "Ultra Fast Wifi" },
    { icon: "Wine", label: "Curated Mini-Bar" },
    { icon: "UserCheck", label: "Dedicated Concierge" },
    { icon: "Coffee", label: "Nespresso Machine" },
    { icon: "Thermometer", label: "Climate Control" },
    { icon: "Sparkles", label: "Palace Spa Linens" },
    { icon: "Waves", label: "Rooftop Infinity Pool" },
    { icon: "Utensils", label: "Private Chef on Request" },
    { icon: "Dumbbell", label: "Private Gym" },
    { icon: "Music", label: "Cinema Room" },
  ],
};

// ── Physical room units ──────────────────────────────────────────────────────
// Conventional hotel numbering: <floor><2-digit room on floor>
// e.g. 201 = floor 2, room 01.  All room types occupy floors 2–6.
//
// Layout:
//   Garden Terrace       12 rooms  floors 2–3  (6/floor)  201–206, 301–306
//   Classic Heritage     20 rooms  floors 2–5  (5/floor)  210–214, 310–314, 410–414, 510–514
//   Palace Deluxe         8 rooms  floors 4–5  (4/floor)  420–423, 520–523
//   Royal Grand Suite     4 rooms  floor 6     (4 rooms)  601–604
//   Maharaja Presidential 2 rooms  floor 6     (2 rooms)  610–611

function buildFloorUnits(
  startNumbers: { floor: number; roomStart: number; count: number }[],
): { unit_code: string; floor: number }[] {
  const units: { unit_code: string; floor: number }[] = [];
  for (const { floor, roomStart, count } of startNumbers) {
    for (let r = 0; r < count; r++) {
      const roomNum = roomStart + r;
      units.push({
        unit_code: `${floor}${String(roomNum).padStart(2, "0")}`,
        floor,
      });
    }
  }
  return units;
}

const ROOM_UNITS: Record<string, { unit_code: string; floor: number }[]> = {
  // 12 rooms across floors 2–3, 6 per floor, starting at x01
  "garden-terrace": buildFloorUnits([
    { floor: 2, roomStart: 1, count: 6 },
    { floor: 3, roomStart: 1, count: 6 },
  ]),

  // 20 rooms across floors 2–5, 5 per floor, starting at x10
  "classic-heritage": buildFloorUnits([
    { floor: 2, roomStart: 10, count: 5 },
    { floor: 3, roomStart: 10, count: 5 },
    { floor: 4, roomStart: 10, count: 5 },
    { floor: 5, roomStart: 10, count: 5 },
  ]),

  // 8 rooms across floors 4–5, 4 per floor, starting at x20
  "palace-deluxe": buildFloorUnits([
    { floor: 4, roomStart: 20, count: 4 },
    { floor: 5, roomStart: 20, count: 4 },
  ]),

  // 4 rooms on floor 6, starting at 601
  "royal-grand-suite": buildFloorUnits([{ floor: 6, roomStart: 1, count: 4 }]),

  // 2 rooms on floor 6, starting at 610 (penthouse wing)
  "maharaja-presidential": buildFloorUnits([
    { floor: 6, roomStart: 10, count: 2 },
  ]),
};

// ── Unavailable date ranges ──────────────────────────────────────────────────
// Empty — all room types are fully available for booking.
const UNAVAILABLE_DATES: {
  slug: string;
  from_date: string;
  to_date: string;
  alternate_room_slugs: string[];
  alternate_dates?: { from: string; to: string }[];
}[] = [];

// ── Hotel amenities ──────────────────────────────────────────────────────────

const HOTEL_AMENITIES = [
  {
    name: "Celestial Spa",
    description:
      "Rejuvenation programs rooted in ancient Ayurvedic wisdom, offering a full range of treatments.",
    icon: "Sparkles",
    image: "/images/celestial-spa.png",
    sort_order: 1,
  },
  {
    name: "The Gilded Fork",
    description:
      "Award-winning fine dining under the desert stars. Seasonal menus crafted by our resident chef.",
    icon: "Utensils",
    image: "/images/saffron-silk.png",
    sort_order: 2,
  },
  {
    name: "The Royal Pool",
    description:
      "An Olympic-length heated infinity pool overlooking the palace gardens.",
    icon: "Waves",
    image: "/images/royal-pool.png",
    sort_order: 3,
  },
  {
    name: "The Library",
    description:
      "A curated collection of rare manuscripts and first editions in a serene reading sanctuary.",
    icon: "BookOpen",
    image: "/images/the-library.png",
    sort_order: 4,
  },
];

// ── Menu categories + items (dining feature) ─────────────────────────────────

type MenuCategoryInsert = {
  name: string;
  sort_order: number;
  is_active: boolean;
};

type MenuItemInsert = {
  name: string;
  description: string;
  price: number; // whole XAF
  currency: string;
  is_special: boolean;
  is_available: boolean;
  sort_order: number;
  image_url: string | null;
};

const MENU_CATEGORIES: (MenuCategoryInsert & {
  items: MenuItemInsert[];
})[] = [
  {
    name: "Breakfast",
    sort_order: 1,
    is_active: true,
    items: [
      {
        name: "Palace Continental",
        description:
          "Freshly baked croissants, seasonal fruit, yoghurt, and artisan preserves",
        price: 8500,
        currency: "XAF",
        is_special: false,
        is_available: true,
        sort_order: 1,
        image_url: "/images/food1.png",
      },
      {
        name: "Royal Full Breakfast",
        description:
          "Eggs your way, grilled tomatoes, sautéed mushrooms, turkey bacon, and sourdough toast",
        price: 12500,
        currency: "XAF",
        is_special: true,
        is_available: true,
        sort_order: 2,
        image_url: "/images/food2.png",
      },
      {
        name: "Avocado & Poached Eggs",
        description:
          "Smashed avocado on toasted brioche with two poached eggs and chilli flakes",
        price: 9500,
        currency: "XAF",
        is_special: false,
        is_available: true,
        sort_order: 3,
        image_url: null,
      },
      {
        name: "Fresh Fruit Platter",
        description: "Seasonal tropical fruits, honey drizzle, and mint",
        price: 6000,
        currency: "XAF",
        is_special: false,
        is_available: true,
        sort_order: 4,
        image_url: null,
      },
    ],
  },
  {
    name: "Starters",
    sort_order: 2,
    is_active: true,
    items: [
      {
        name: "Saffron Bisque",
        description:
          "Velvety lobster bisque with saffron cream and toasted brioche croutons",
        price: 11000,
        currency: "XAF",
        is_special: true,
        is_available: true,
        sort_order: 1,
        image_url: "/images/food3.png",
      },
      {
        name: "Palace Garden Salad",
        description:
          "Heritage tomatoes, burrata, basil oil, and aged balsamic reduction",
        price: 8500,
        currency: "XAF",
        is_special: false,
        is_available: true,
        sort_order: 2,
        image_url: null,
      },
      {
        name: "Spiced Lamb Kofta",
        description:
          "Hand-rolled lamb kofta with tzatziki, pomegranate, and flatbread",
        price: 13500,
        currency: "XAF",
        is_special: false,
        is_available: true,
        sort_order: 3,
        image_url: null,
      },
    ],
  },
  {
    name: "Main Course",
    sort_order: 3,
    is_active: true,
    items: [
      {
        name: "Grilled Sea Bass",
        description:
          "Line-caught sea bass, lemon beurre blanc, wilted spinach, and saffron potatoes",
        price: 28000,
        currency: "XAF",
        is_special: true,
        is_available: true,
        sort_order: 1,
        image_url: "/images/food4.png",
      },
      {
        name: "Maharaja Lamb Shank",
        description:
          "Slow-braised lamb shank in aromatic spices, served with saffron rice and naan",
        price: 32000,
        currency: "XAF",
        is_special: true,
        is_available: true,
        sort_order: 2,
        image_url: null,
      },
      {
        name: "Truffle Risotto",
        description:
          "Arborio rice, black truffle, aged Parmesan, and wild mushroom ragù",
        price: 24000,
        currency: "XAF",
        is_special: false,
        is_available: true,
        sort_order: 3,
        image_url: null,
      },
      {
        name: "Palace Chicken Supreme",
        description:
          "Free-range chicken breast, tarragon jus, dauphinoise potatoes, and haricots verts",
        price: 22000,
        currency: "XAF",
        is_special: false,
        is_available: true,
        sort_order: 4,
        image_url: null,
      },
    ],
  },
  {
    name: "Desserts",
    sort_order: 4,
    is_active: true,
    items: [
      {
        name: "Mango Panna Cotta",
        description:
          "Silky vanilla panna cotta with fresh mango coulis and toasted coconut",
        price: 7500,
        currency: "XAF",
        is_special: false,
        is_available: true,
        sort_order: 1,
        image_url: null,
      },
      {
        name: "Warm Chocolate Fondant",
        description:
          "Valrhona dark chocolate fondant with salted caramel ice cream",
        price: 9000,
        currency: "XAF",
        is_special: true,
        is_available: true,
        sort_order: 2,
        image_url: null,
      },
      {
        name: "Palace Cheese Board",
        description:
          "Selection of five artisan cheeses, quince paste, walnuts, and crackers",
        price: 12000,
        currency: "XAF",
        is_special: false,
        is_available: true,
        sort_order: 3,
        image_url: null,
      },
    ],
  },
  {
    name: "Beverages",
    sort_order: 5,
    is_active: true,
    items: [
      {
        name: "Freshly Squeezed Juice",
        description: "Orange, mango, pineapple, or watermelon",
        price: 3500,
        currency: "XAF",
        is_special: false,
        is_available: true,
        sort_order: 1,
        image_url: null,
      },
      {
        name: "Palace Afternoon Tea",
        description:
          "Assorted finger sandwiches, scones with clotted cream, and a pot of loose-leaf tea",
        price: 15000,
        currency: "XAF",
        is_special: true,
        is_available: true,
        sort_order: 2,
        image_url: null,
      },
      {
        name: "Nespresso Selection",
        description: "Espresso, lungo, cappuccino, or flat white",
        price: 2500,
        currency: "XAF",
        is_special: false,
        is_available: true,
        sort_order: 3,
        image_url: null,
      },
      {
        name: "Sparkling Mineral Water",
        description: "750 ml chilled sparkling or still",
        price: 1500,
        currency: "XAF",
        is_special: false,
        is_available: true,
        sort_order: 4,
        image_url: null,
      },
    ],
  },
];

// ── Helpers ──────────────────────────────────────────────────────────────────

function log(step: string, ok: boolean, detail?: string) {
  const icon = ok ? "✅" : "❌";
  console.log(`${icon}  ${step}${detail ? ` — ${detail}` : ""}`);
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// ── Main seed function ───────────────────────────────────────────────────────

async function seed() {
  console.log("\n🌱  Starting Jagamn Palace seed...\n");

  // ── 0. Clean up tables that are being replaced ─────────────────────────────
  console.log("── Cleanup ─────────────────────────────────────────────────");

  // New tables added in the current schema.
  for (const table of [
    "dining_order_items",
    "dining_orders",
    "notifications",
    "stay_preferences",
    "webhook_events",
    "payment_methods",
    "menu_items",
    "menu_categories",
  ]) {
    const { error } = await supabase
      .from(table)
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");
    log(`${table}: cleared`, !error, error?.message);
  }

  // Delete all bookings (cascades to payments via booking_id)
  const { error: delBookings } = await supabase
    .from("bookings")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000");
  log("bookings: cleared", !delBookings, delBookings?.message);

  // Delete all payments
  const { error: delPayments } = await supabase
    .from("payments")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000");
  log("payments: cleared", !delPayments, delPayments?.message);

  // Delete all users (our custom table, not auth.users)
  const { error: delUsers } = await supabase
    .from("users")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000");
  log("users: cleared", !delUsers, delUsers?.message);

  // Delete room amenities, unavailable dates, rooms, room types
  await supabase
    .from("room_amenities")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase
    .from("room_type_unavailable_dates")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase
    .from("rooms")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase
    .from("room_types")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase
    .from("hotel_amenities")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000");
  log(
    "room data: cleared",
    true,
    "room_types, amenities, rooms, unavailable_dates, hotel_amenities",
  );

  console.log("");

  const summary: { step: string; status: "ok" | "error"; detail: string }[] =
    [];

  // ── 1. Room Types ──────────────────────────────────────────
  console.log("── Room Types ──────────────────────────────────────────");
  const slugMap: Record<string, string> = {}; // slug → id

  // Insert all room types fresh (we cleared them above)
  let inserted: { id: string; slug: string }[] = [];
  let insertError: { message: string } | null = null;
  for (let attempt = 1; attempt <= 5; attempt++) {
    const result = await supabase
      .from("room_types")
      .insert(ROOM_TYPES)
      .select("id, slug");
    inserted = result.data ?? [];
    insertError = result.error;
    if (!insertError) break;
    console.log(`  ↻ retry ${attempt}/5 for batch room_types insert…`);
    await sleep(1500 * attempt);
  }

  if (insertError) {
    log("room_types: batch insert", false, insertError.message);
    for (const rt of ROOM_TYPES) {
      summary.push({
        step: `room_type:${rt.slug}`,
        status: "error",
        detail: insertError.message,
      });
    }
  } else {
    for (const row of inserted) {
      slugMap[row.slug] = row.id;
      log(`room_types: ${row.slug}`, true, `id=${row.id}`);
      summary.push({
        step: `room_type:${row.slug}`,
        status: "ok",
        detail: "inserted",
      });
    }
  }

  // ── 2. Room Amenities ──────────────────────────────────────
  console.log("\n── Room Amenities ──────────────────────────────────────");
  for (const [slug, amenities] of Object.entries(AMENITIES)) {
    const roomTypeId = slugMap[slug];
    if (!roomTypeId) {
      log(`amenities: ${slug}`, false, "room_type_id not found");
      summary.push({
        step: `amenities:${slug}`,
        status: "error",
        detail: "room_type_id missing",
      });
      continue;
    }

    const rows = amenities.map((a, i) => ({
      room_type_id: roomTypeId,
      icon: a.icon,
      label: a.label,
      sort_order: i,
    }));

    const { error } = await supabase.from("room_amenities").insert(rows);
    if (error) {
      log(`amenities: ${slug}`, false, error.message);
      summary.push({
        step: `amenities:${slug}`,
        status: "error",
        detail: error.message,
      });
    } else {
      log(`amenities: ${slug}`, true, `${rows.length} inserted`);
      summary.push({
        step: `amenities:${slug}`,
        status: "ok",
        detail: `${rows.length} inserted`,
      });
    }
  }

  // ── 3. Physical Room Units ─────────────────────────────────
  console.log("\n── Physical Room Units ─────────────────────────────────");
  for (const [slug, units] of Object.entries(ROOM_UNITS)) {
    const roomTypeId = slugMap[slug];
    if (!roomTypeId) {
      log(`rooms: ${slug}`, false, "room_type_id not found");
      summary.push({
        step: `rooms:${slug}`,
        status: "error",
        detail: "room_type_id missing",
      });
      continue;
    }

    const rows = units.map((u) => ({
      room_type_id: roomTypeId,
      unit_code: u.unit_code,
      floor: u.floor,
      is_active: true,
    }));

    const { error } = await supabase.from("rooms").insert(rows);
    if (error) {
      log(`rooms: ${slug}`, false, error.message);
      summary.push({
        step: `rooms:${slug}`,
        status: "error",
        detail: error.message,
      });
    } else {
      log(`rooms: ${slug}`, true, `${rows.length} units inserted`);
      summary.push({
        step: `rooms:${slug}`,
        status: "ok",
        detail: `${rows.length} inserted`,
      });
    }
  }

  // ── 4. Unavailable Date Ranges ─────────────────────────────
  console.log("\n── Unavailable Date Ranges ─────────────────────────────");
  for (const ud of UNAVAILABLE_DATES) {
    const roomTypeId = slugMap[ud.slug];
    if (!roomTypeId) {
      log(
        `unavailable: ${ud.slug} ${ud.from_date}`,
        false,
        "room_type_id not found",
      );
      summary.push({
        step: `unavailable:${ud.slug}:${ud.from_date}`,
        status: "error",
        detail: "room_type_id missing",
      });
      continue;
    }

    const { error } = await supabase
      .from("room_type_unavailable_dates")
      .insert({
        room_type_id: roomTypeId,
        from_date: ud.from_date,
        to_date: ud.to_date,
        alternate_room_slugs: ud.alternate_room_slugs,
        alternate_dates: ud.alternate_dates ?? null,
      });

    if (error) {
      log(`unavailable: ${ud.slug} ${ud.from_date}`, false, error.message);
      summary.push({
        step: `unavailable:${ud.slug}:${ud.from_date}`,
        status: "error",
        detail: error.message,
      });
    } else {
      log(
        `unavailable: ${ud.slug} ${ud.from_date}→${ud.to_date}`,
        true,
        "inserted",
      );
      summary.push({
        step: `unavailable:${ud.slug}:${ud.from_date}`,
        status: "ok",
        detail: "inserted",
      });
    }
  }

  // ── 5. Hotel Amenities ─────────────────────────────────────
  console.log("\n── Hotel Amenities ─────────────────────────────────────");
  for (const ha of HOTEL_AMENITIES) {
    const { error } = await supabase.from("hotel_amenities").insert(ha);
    if (error) {
      log(`hotel_amenity: ${ha.name}`, false, error.message);
      summary.push({
        step: `hotel_amenity:${ha.name}`,
        status: "error",
        detail: error.message,
      });
    } else {
      log(`hotel_amenity: ${ha.name}`, true, "inserted");
      summary.push({
        step: `hotel_amenity:${ha.name}`,
        status: "ok",
        detail: "inserted",
      });
    }
  }

  // ── 6. Menu Categories + Items ─────────────────────────────
  console.log("\n── Menu Categories + Items ─────────────────────────────");
  for (const cat of MENU_CATEGORIES) {
    // Insert category
    const { data: catRow, error: catErr } = await supabase
      .from("menu_categories")
      .insert({
        name: cat.name,
        sort_order: cat.sort_order,
        is_active: cat.is_active,
      })
      .select("id")
      .single();

    if (catErr || !catRow) {
      log(`menu_category: ${cat.name}`, false, catErr?.message ?? "no row");
      summary.push({
        step: `menu_category:${cat.name}`,
        status: "error",
        detail: catErr?.message ?? "no row returned",
      });
      continue;
    }

    log(`menu_category: ${cat.name}`, true, `id=${catRow.id}`);
    summary.push({
      step: `menu_category:${cat.name}`,
      status: "ok",
      detail: "inserted",
    });

    // Insert items for this category
    const itemRows = cat.items.map((item) => ({
      ...item,
      category_id: catRow.id,
    }));

    const { error: itemErr } = await supabase
      .from("menu_items")
      .insert(itemRows);

    if (itemErr) {
      log(`  menu_items: ${cat.name}`, false, itemErr.message);
      summary.push({
        step: `menu_items:${cat.name}`,
        status: "error",
        detail: itemErr.message,
      });
    } else {
      log(`  menu_items: ${cat.name}`, true, `${itemRows.length} inserted`);
      summary.push({
        step: `menu_items:${cat.name}`,
        status: "ok",
        detail: `${itemRows.length} inserted`,
      });
    }
  }

  // ── Summary ────────────────────────────────────────────────
  const ok = summary.filter((s) => s.status === "ok").length;
  const errors = summary.filter((s) => s.status === "error");

  console.log("\n══════════════════════════════════════════════════════");
  console.log(`  Seed complete: ${ok}/${summary.length} steps succeeded`);
  if (errors.length > 0) {
    console.log(`  ⚠️  ${errors.length} error(s):`);
    errors.forEach((e) => console.log(`     • ${e.step}: ${e.detail}`));
  }
  console.log("══════════════════════════════════════════════════════\n");

  process.exit(errors.length > 0 ? 1 : 0);
}

seed().catch((err) => {
  console.error("Fatal seed error:", err);
  process.exit(1);
});
