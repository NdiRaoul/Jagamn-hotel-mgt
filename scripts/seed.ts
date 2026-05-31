/**
 * Jagamn Palace — Database Seed Script
 * Run: npx ts-node --project tsconfig.json scripts/seed.ts
 *
 * Idempotent: checks by slug before inserting.
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
    price_per_night: 122000, // XAF (was 199 USD)
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
    price_per_night: 184000, // XAF (was 299 USD)
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
    price_per_night: 277000, // XAF (was 450 USD)
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
    price_per_night: 553000, // XAF (was 899 USD)
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
    price_per_night: 922000, // XAF (was 1499 USD)
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

function buildUnits(prefix: string, count: number) {
  return Array.from({ length: count }, (_, i) => ({
    unit_code: `${prefix}-${String(i + 1).padStart(3, "0")}`,
  }));
}

const ROOM_UNITS: Record<string, { unit_code: string }[]> = {
  "garden-terrace": buildUnits("GT", 20),
  "classic-heritage": buildUnits("CH", 12),
  "palace-deluxe": buildUnits("PD", 8),
  "royal-grand-suite": buildUnits("RG", 4),
  "maharaja-presidential": buildUnits("MP", 2),
};

// ── Unavailable date ranges ──────────────────────────────────────────────────

const UNAVAILABLE_DATES: {
  slug: string;
  from_date: string;
  to_date: string;
  alternate_room_slugs: string[];
  alternate_dates?: { from: string; to: string }[];
}[] = [
  {
    slug: "classic-heritage",
    from_date: "2026-05-12",
    to_date: "2026-05-19",
    alternate_room_slugs: ["palace-deluxe", "royal-grand-suite"],
    alternate_dates: [
      { from: "2026-05-07", to: "2026-05-11" },
      { from: "2026-05-20", to: "2026-05-25" },
    ],
  },
  {
    slug: "classic-heritage",
    from_date: "2026-06-01",
    to_date: "2026-06-07",
    alternate_room_slugs: ["palace-deluxe"],
    alternate_dates: [
      { from: "2026-05-28", to: "2026-05-31" },
      { from: "2026-06-08", to: "2026-06-12" },
    ],
  },
  {
    slug: "palace-deluxe",
    from_date: "2026-05-15",
    to_date: "2026-05-22",
    alternate_room_slugs: ["classic-heritage", "royal-grand-suite"],
    alternate_dates: [
      { from: "2026-05-10", to: "2026-05-14" },
      { from: "2026-05-23", to: "2026-05-28" },
    ],
  },
  {
    slug: "royal-grand-suite",
    from_date: "2026-05-20",
    to_date: "2026-05-27",
    alternate_room_slugs: ["palace-deluxe"],
    alternate_dates: [
      { from: "2026-05-15", to: "2026-05-19" },
      { from: "2026-05-28", to: "2026-06-02" },
    ],
  },
  {
    slug: "garden-terrace",
    from_date: "2026-05-25",
    to_date: "2026-06-02",
    alternate_room_slugs: ["classic-heritage"],
    alternate_dates: [
      { from: "2026-05-20", to: "2026-05-24" },
      { from: "2026-06-03", to: "2026-06-08" },
    ],
  },
  {
    slug: "maharaja-presidential",
    from_date: "2026-06-10",
    to_date: "2026-06-20",
    alternate_room_slugs: ["royal-grand-suite"],
    alternate_dates: [
      { from: "2026-06-05", to: "2026-06-09" },
      { from: "2026-06-21", to: "2026-06-28" },
    ],
  },
];

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

// ── Admin accounts ───────────────────────────────────────────────────────────

type AdminAccount = {
  email: string;
  password: string;
  full_name: string;
  department: string;
  position: string;
  role: "owner" | "admin" | "manager" | "reception" | "kitchen" | "storekeeper";
  salary?: number;
  is_owner?: boolean;
};
const ALL_STAFF_ACCOUNTS: AdminAccount[] = [
  {
    email: "owner@jagamnpalace.com",
    password: "Owner123",
    full_name: "Owner Account",
    role: "owner",
    department: "Executive",
    position: "Owner",
    salary: 0,
    is_owner: true,
  },
  {
    email: "admin@jagamnpalace.com",
    password: "Admin123",
    full_name: "Palace Administrator",
    role: "admin",
    department: "Management",
    position: "System Administrator",
    salary: 0,
    is_owner: false,
  },
  {
    email: "manager@jagamnpalace.com",
    password: "Manager123",
    full_name: "Hotel Manager",
    role: "manager",
    department: "Management",
    position: "General Manager",
    salary: 0,
    is_owner: false,
  },
  {
    email: "reception@jagamnpalace.com",
    password: "Reception123",
    full_name: "Front Desk Officer",
    role: "reception",
    department: "Front Office",
    position: "Senior Receptionist",
    salary: 0,
    is_owner: false,
  },
  {
    email: "kitchen@jagamnpalace.com",
    password: "Kitchen123",
    full_name: "Kitchen User",
    role: "kitchen",
    department: "Kitchen",
    position: "Chef",
    salary: 0,
    is_owner: false,
  },
  {
    email: "store@jagamnpalace.com",
    password: "Store123",
    full_name: "Store Keeper",
    role: "storekeeper",
    department: "Procurement",
    position: "Store Keeper",
    salary: 0,
    is_owner: false,
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

  // Delete staff rows (auth.users entries are preserved to avoid re-invite flows)
  const { error: delStaff } = await supabase
    .from("staff")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000");
  log("staff: cleared", !delStaff, delStaff?.message);

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

  // ── 6. Admin Accounts ─────────────────────────────────────
  console.log("\n── Admin Accounts ──────────────────────────────────────");
  for (const admin of ALL_STAFF_ACCOUNTS) {
    // Check if auth user already exists by trying to list users
    // We use admin.createUser which is idempotent via email check
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existingAuthUser = existingUsers?.users?.find(
      (u) => u.email === admin.email,
    );

    let authUserId: string;

    if (existingAuthUser) {
      // Update password in case it changed
      const { error: updateErr } = await supabase.auth.admin.updateUserById(
        existingAuthUser.id,
        { password: admin.password },
      );
      if (updateErr) {
        log(`admin auth: ${admin.email}`, false, updateErr.message);
        summary.push({
          step: `admin_auth:${admin.email}`,
          status: "error",
          detail: updateErr.message,
        });
        continue;
      }
      authUserId = existingAuthUser.id;
      log(`admin auth: ${admin.email}`, true, `exists, password updated`);
    } else {
      const { data: newUser, error: createErr } =
        await supabase.auth.admin.createUser({
          email: admin.email,
          password: admin.password,
          email_confirm: true,
        });
      if (createErr || !newUser?.user) {
        log(
          `admin auth: ${admin.email}`,
          false,
          createErr?.message ?? "no user returned",
        );
        summary.push({
          step: `admin_auth:${admin.email}`,
          status: "error",
          detail: createErr?.message ?? "no user returned",
        });
        continue;
      }
      authUserId = newUser.user.id;
      log(`admin auth: ${admin.email}`, true, `created, id=${authUserId}`);
    }

    // Upsert staff row
    const { error: staffErr } = await supabase.from("staff").upsert(
      {
        auth_user_id: authUserId,
        full_name: admin.full_name,
        email: admin.email,
        role: admin.role,
        status: "active",
        department: admin.department,
        position: admin.position,
        salary: admin.salary ?? 0,
        is_owner: admin.is_owner ?? false,
        must_reset_pw: false,
      },
      { onConflict: "auth_user_id" },
    );

    if (staffErr) {
      log(`admin staff row: ${admin.email}`, false, staffErr.message);
      summary.push({
        step: `admin_staff:${admin.email}`,
        status: "error",
        detail: staffErr.message,
      });
    } else {
      log(`admin staff row: ${admin.email}`, true, `role=${admin.role}`);
      summary.push({
        step: `admin_staff:${admin.email}`,
        status: "ok",
        detail: `role=${admin.role}`,
      });
    }
  }

  // ── 7. Seed Extensions (from 03_seed_additions.ts) ──────────
  console.log(
    "\n── Seed Extensions (Departments, Positions, Leave Types, Menu, Inventory, Procurement) ──",
  );

  // Departments
  const DEPARTMENTS = [
    { name: "Executive", sort_order: 1 },
    { name: "Management", sort_order: 2 },
    { name: "Front Office", sort_order: 3 },
    { name: "Kitchen", sort_order: 4 },
    { name: "Procurement", sort_order: 5 },
    { name: "Housekeeping", sort_order: 6 },
    { name: "Sales", sort_order: 7 },
    { name: "Finance", sort_order: 8 },
  ];

  for (const dept of DEPARTMENTS) {
    const { error } = await supabase
      .from("departments")
      .upsert(dept, { onConflict: "name" });
    log(`department: ${dept.name}`, !error, error?.message);
    summary.push({
      step: `department:${dept.name}`,
      status: error ? "error" : "ok",
      detail: error?.message || "inserted",
    });
  }

  // Positions
  const { data: depts } = await supabase.from("departments").select("id, name");
  const deptMap = new Map(
    (depts ?? []).map((d: { id: string; name: string }) => [d.name, d.id]),
  );

  const POSITIONS = [
    { title: "Owner", department: "Executive", default_role: "owner" },
    {
      title: "System Administrator",
      department: "Management",
      default_role: "admin",
    },
    {
      title: "General Manager",
      department: "Management",
      default_role: "manager",
    },
    {
      title: "Assistant Manager",
      department: "Management",
      default_role: "manager",
    },
    {
      title: "Senior Receptionist",
      department: "Front Office",
      default_role: "reception",
    },
    {
      title: "Receptionist",
      department: "Front Office",
      default_role: "reception",
    },
    {
      title: "Front Desk Supervisor",
      department: "Front Office",
      default_role: "reception",
    },
    { title: "Executive Chef", department: "Kitchen", default_role: "kitchen" },
    { title: "Sous Chef", department: "Kitchen", default_role: "kitchen" },
    { title: "Chef", department: "Kitchen", default_role: "kitchen" },
    {
      title: "Store Supervisor",
      department: "Procurement",
      default_role: "storekeeper",
    },
    {
      title: "Procurement Officer",
      department: "Procurement",
      default_role: "storekeeper",
    },
    {
      title: "Housekeeping Lead",
      department: "Housekeeping",
      default_role: "admin",
    },
    { title: "Sales Manager", department: "Sales", default_role: "manager" },
    { title: "Finance Officer", department: "Finance", default_role: "admin" },
  ];

  for (const pos of POSITIONS) {
    const dept_id = deptMap.get(pos.department) ?? null;
    const { error } = await supabase.from("positions").upsert(
      {
        title: pos.title,
        department_id: dept_id,
        default_role: pos.default_role,
      },
      { onConflict: "title,department_id" },
    );
    log(`position: ${pos.title}`, !error, error?.message);
    summary.push({
      step: `position:${pos.title}`,
      status: error ? "error" : "ok",
      detail: error?.message || "inserted",
    });
  }

  // Leave Types
  const LEAVE_TYPES = [
    {
      name: "Annual Paid Leave",
      code: "annual",
      color: "#E8924A",
      max_days: 24,
    },
    { name: "Sick Leave", code: "sick", color: "#EF4444", max_days: 12 },
    {
      name: "Maternity Leave",
      code: "maternity",
      color: "#8B5CF6",
      max_days: 90,
    },
    {
      name: "Paternity Leave",
      code: "paternity",
      color: "#3B82F6",
      max_days: 14,
    },
    {
      name: "Compassionate Leave",
      code: "compassionate",
      color: "#6B7280",
      max_days: 5,
    },
    { name: "Unpaid Leave", code: "unpaid", color: "#9CA3AF", max_days: 30 },
  ];

  for (const lt of LEAVE_TYPES) {
    const { error } = await supabase
      .from("leave_types")
      .upsert(lt, { onConflict: "code" });
    log(`leave_type: ${lt.name}`, !error, error?.message);
    summary.push({
      step: `leave_type:${lt.name}`,
      status: error ? "error" : "ok",
      detail: error?.message || "inserted",
    });
  }

  // Menu Categories
  const MENU_CATEGORIES = [
    { name: "Breakfast", sort_order: 1 },
    { name: "Main Course", sort_order: 2 },
    { name: "Beverages", sort_order: 3 },
  ];

  for (const cat of MENU_CATEGORIES) {
    const { error } = await supabase.from("menu_categories").insert(cat);
    log(`menu_category: ${cat.name}`, !error, error?.message);
    summary.push({
      step: `menu_category:${cat.name}`,
      status: error ? "error" : "ok",
      detail: error?.message || "inserted",
    });
  }

  // Menu Items
  const { data: cats } = await supabase
    .from("menu_categories")
    .select("id, name");
  const catMap = new Map(
    (cats ?? []).map((c: { id: string; name: string }) => [c.name, c.id]),
  );

  const MENU_ITEMS = [
    {
      name: "Palace Eggs Benedict",
      category: "Breakfast",
      price: 4500,
      description: "Poached eggs on toasted brioche with hollandaise sauce",
      is_special: false,
    },
    {
      name: "Rajasthani Thali Breakfast",
      category: "Breakfast",
      price: 5500,
      description:
        "Traditional Indian breakfast platter with dal, roti, and chutneys",
      is_special: true,
    },
    {
      name: "Wagyu Beef Tenderloin",
      category: "Main Course",
      price: 18000,
      description:
        "A5 Wagyu with truffle jus, roasted vegetables, and potato gratin",
      is_special: true,
    },
    {
      name: "Butter Chicken Royale",
      category: "Main Course",
      price: 8500,
      description: "Slow-cooked chicken in rich tomato-cream sauce with naan",
      is_special: false,
    },
    {
      name: "Palace Chai",
      category: "Beverages",
      price: 1200,
      description: "Spiced masala tea with cardamom and ginger",
      is_special: false,
    },
    {
      name: "Mango Lassi",
      category: "Beverages",
      price: 1500,
      description: "Chilled yogurt drink with fresh Alphonso mango",
      is_special: false,
    },
  ];

  for (const item of MENU_ITEMS) {
    const cat_id = catMap.get(item.category) ?? null;
    const { error } = await supabase.from("menu_items").insert({
      name: item.name,
      category_id: cat_id,
      price: item.price,
      description: item.description,
      is_special: item.is_special,
      is_available: true,
      currency: "XAF",
    });
    log(`menu_item: ${item.name}`, !error, error?.message);
    summary.push({
      step: `menu_item:${item.name}`,
      status: error ? "error" : "ok",
      detail: error?.message || "inserted",
    });
  }

  // Inventory Items
  const INVENTORY_ITEMS = [
    {
      name: "Saffron (premium)",
      category: "Spices",
      unit: "grams",
      on_hand: 500,
      reorder_level: 100,
    },
    {
      name: "Wagyu Beef A5",
      category: "Proteins",
      unit: "kg",
      on_hand: 15,
      reorder_level: 5,
    },
    {
      name: "Alphonso Mangoes",
      category: "Produce",
      unit: "kg",
      on_hand: 30,
      reorder_level: 10,
    },
  ];

  for (const item of INVENTORY_ITEMS) {
    const { error } = await supabase
      .from("inventory_items")
      .insert({ ...item, is_active: true });
    log(`inventory: ${item.name}`, !error, error?.message);
    summary.push({
      step: `inventory:${item.name}`,
      status: error ? "error" : "ok",
      detail: error?.message || "inserted",
    });
  }

  // Procurement Budgets
  const year = new Date().getFullYear();
  const BUDGETS = [
    {
      department: "Food & Beverage",
      year,
      month: null,
      budget_minor: 12000000,
    },
    { department: "Housekeeping", year, month: null, budget_minor: 5000000 },
    { department: "Maintenance", year, month: null, budget_minor: 3000000 },
    { department: "Technology", year, month: null, budget_minor: 2000000 },
  ];

  for (const budget of BUDGETS) {
    const { error } = await supabase
      .from("procurement_budgets")
      .upsert(budget, { onConflict: "department,year,month" });
    log(`budget: ${budget.department} ${year}`, !error, error?.message);
    summary.push({
      step: `budget:${budget.department}`,
      status: error ? "error" : "ok",
      detail: error?.message || "inserted",
    });
  }

  // Suppliers
  const SUPPLIERS = [
    {
      name: "Global Gourmet Imports",
      category: "Food & Beverage",
      rating: 4.9,
    },
    {
      name: "Palace Provisions Co.",
      category: "General Supplies",
      rating: 4.6,
    },
    {
      name: "Spice Route Traders",
      category: "Spices & Condiments",
      rating: 4.7,
    },
  ];

  for (const sup of SUPPLIERS) {
    const { error } = await supabase
      .from("suppliers")
      .insert({ ...sup, is_active: true });
    log(`supplier: ${sup.name}`, !error, error?.message);
    summary.push({
      step: `supplier:${sup.name}`,
      status: error ? "error" : "ok",
      detail: error?.message || "inserted",
    });
  }

  // ── 8. Sample Data (from 04_seed_samples.ts) ────────────────
  console.log("\n── Sample Data (Salaries, Leave, Payroll, Dining, Help) ──");

  // Staff Salaries + Hire Dates
  const STAFF_SALARIES: Record<string, { salary: number; hire_date: string }> =
    {
      "owner@jagamnpalace.com": { salary: 0, hire_date: "2020-01-15" },
      "admin@jagamnpalace.com": { salary: 850000, hire_date: "2021-03-10" },
      "manager@jagamnpalace.com": { salary: 750000, hire_date: "2021-06-01" },
      "reception@jagamnpalace.com": { salary: 450000, hire_date: "2022-02-14" },
      "kitchen@jagamnpalace.com": { salary: 550000, hire_date: "2021-09-20" },
      "store@jagamnpalace.com": { salary: 400000, hire_date: "2023-01-05" },
    };

  for (const [email, data] of Object.entries(STAFF_SALARIES)) {
    const { error } = await supabase
      .from("staff")
      .update({ salary: data.salary, hire_date: data.hire_date })
      .eq("email", email);
    log(`staff salary: ${email}`, !error, error?.message);
    summary.push({
      step: `staff_salary:${email}`,
      status: error ? "error" : "ok",
      detail: error?.message || "updated",
    });
  }

  // Help Articles
  const HELP_ARTICLES: Array<{
    role: string | null;
    slug: string;
    title: string;
    body: string;
    category: string;
    sort_order: number;
  }> = [
    {
      role: null,
      slug: "contact-support",
      title: "Contact Support",
      body: "For technical assistance, contact IT Support at ext. 5000 or email support@jagamnpalace.com. For urgent issues outside business hours, call the duty manager at +237 670 000 000.",
      category: "General",
      sort_order: 1,
    },
    {
      role: "kitchen",
      slug: "order-workflow",
      title: "Order Workflow",
      body: "1. New orders appear automatically on the Orders board\n2. Tap 'Acknowledge' to move to Preparing\n3. If ingredients are short, tap 'Request Stock' on the order\n4. When plated, tap 'Mark Ready' to notify the guest\n5. After delivery, tap 'Delivered' to complete",
      category: "Orders",
      sort_order: 1,
    },
    {
      role: "kitchen",
      slug: "inventory-requests",
      title: "Requesting Stock",
      body: "When an ingredient is running low:\n1. Open the order that needs the ingredient\n2. Tap 'Request Stock'\n3. Select the item or enter a custom name\n4. Specify quantity and add notes\n5. The storekeeper will be notified automatically\n\nNote: Orders can proceed to ready/delivered without waiting for stock fulfillment.",
      category: "Inventory",
      sort_order: 2,
    },
    {
      role: "kitchen",
      slug: "menu-management",
      title: "Managing the Menu",
      body: "To update menu items:\n1. Go to Menu tab\n2. Toggle availability with the switch\n3. Edit prices, descriptions, or images\n4. Changes appear immediately for guests\n\nTo add new items, contact the admin or use the 'Add Item' button.",
      category: "Menu",
      sort_order: 3,
    },
    {
      role: "reception",
      slug: "check-in-process",
      title: "Check-In Process",
      body: "1. Find the reservation in Arrivals\n2. Verify guest ID and booking details\n3. Assign a room (system suggests available units)\n4. Collect payment if not pre-paid\n5. Issue room key and welcome packet\n6. Tap 'Complete Check-In'",
      category: "Front Desk",
      sort_order: 1,
    },
    {
      role: "reception",
      slug: "walk-in-bookings",
      title: "Walk-In Bookings",
      body: "For guests without reservations:\n1. Go to Walk-In tab\n2. Select room type and dates\n3. Enter guest details\n4. Choose payment method (Card or Cash)\n5. For cash: specify amount received, partial, or no payment\n6. System assigns room automatically\n7. Print confirmation and issue key",
      category: "Bookings",
      sort_order: 2,
    },
    {
      role: "reception",
      slug: "checkout-folio",
      title: "Checkout & Folio",
      body: "At checkout:\n1. Open the departure in Departures tab\n2. Review the folio (room charges, dining, minibar, etc.)\n3. Add any final charges if needed\n4. Verify balance is settled\n5. If balance outstanding, collect payment or request manager override\n6. Complete checkout and email receipt",
      category: "Front Desk",
      sort_order: 3,
    },
    {
      role: "account",
      slug: "leave-requests",
      title: "Requesting Leave",
      body: "To request time off:\n1. Go to Leave tab in My Account\n2. Select leave type (Annual, Sick, etc.)\n3. Choose start and end dates\n4. Add reason and optional supporting document\n5. Submit for approval\n\nYou can view your remaining balance and cancel pending requests.",
      category: "Leave",
      sort_order: 1,
    },
    {
      role: "account",
      slug: "payslips",
      title: "Viewing Payslips",
      body: "Access your payslips in My Account > Payslips:\n- View all past payslips\n- See gross, deductions, and net pay\n- Download PDF for your records\n- Check payment status and date",
      category: "Payroll",
      sort_order: 2,
    },
    {
      role: "account",
      slug: "payout-setup",
      title: "Setting Up Payout",
      body: "To receive salary payments:\n1. Go to My Account > Payout\n2. Choose method: Stripe, MTN MoMo, Orange Money, or Bank\n3. Enter account details\n4. For Stripe: complete onboarding flow\n5. For MoMo/Bank: verify details with admin\n6. Set as default payout method\n\nPayroll will use your default method for payments.",
      category: "Payroll",
      sort_order: 3,
    },
    {
      role: "storekeeper",
      slug: "fulfilling-requests",
      title: "Fulfilling Stock Requests",
      body: "When kitchen requests stock:\n1. View requests in Requests tab\n2. Check inventory availability\n3. Approve and fulfill, or reject with reason\n4. Update inventory levels\n5. Kitchen is notified automatically\n\nNote: Full storekeeper portal coming soon.",
      category: "Inventory",
      sort_order: 1,
    },
  ];

  for (const article of HELP_ARTICLES) {
    const { error } = await supabase
      .from("help_articles")
      .upsert(article, { onConflict: "role,slug" });
    log(`help_article: ${article.slug}`, !error, error?.message);
    summary.push({
      step: `help_article:${article.slug}`,
      status: error ? "error" : "ok",
      detail: error?.message || "inserted",
    });
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
