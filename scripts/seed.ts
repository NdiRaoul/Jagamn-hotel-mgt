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

// ── Helpers ──────────────────────────────────────────────────────────────────

function log(step: string, ok: boolean, detail?: string) {
  const icon = ok ? "✅" : "❌";
  console.log(`${icon}  ${step}${detail ? ` — ${detail}` : ""}`);
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// ── Main seed function ───────────────────────────────────────────────────────

async function seed() {
  console.log("\n🌱  Starting Jagamn Palace seed...\n");

  const summary: { step: string; status: "ok" | "error"; detail: string }[] =
    [];

  // ── 1. Room Types ──────────────────────────────────────────
  console.log("── Room Types ──────────────────────────────────────────");
  const slugMap: Record<string, string> = {}; // slug → id

  // First, load any already-existing room types
  const { data: existingRoomTypes } = await supabase
    .from("room_types")
    .select("id, slug");

  for (const rt of existingRoomTypes ?? []) {
    slugMap[rt.slug] = rt.id;
  }

  const existingSlugs = new Set(Object.keys(slugMap));
  const toInsert = ROOM_TYPES.filter((rt) => !existingSlugs.has(rt.slug));

  if (toInsert.length === 0) {
    log("room_types: all 5", true, "already exist — skipped");
    for (const rt of ROOM_TYPES) {
      summary.push({ step: `room_type:${rt.slug}`, status: "ok", detail: "skipped" });
    }
  } else {
    // Batch insert all missing room types in one request
    let inserted: any[] = [];
    let insertError: any = null;
    for (let attempt = 1; attempt <= 5; attempt++) {
      const result = await supabase
        .from("room_types")
        .insert(toInsert as any[])
        .select("id, slug");
      inserted = result.data ?? [];
      insertError = result.error;
      if (!insertError) break;
      console.log(`  ↻ retry ${attempt}/5 for batch room_types insert…`);
      await sleep(1500 * attempt);
    }

    if (insertError) {
      log("room_types: batch insert", false, insertError.message);
      for (const rt of toInsert) {
        summary.push({ step: `room_type:${rt.slug}`, status: "error", detail: insertError.message });
      }
    } else {
      for (const row of inserted) {
        slugMap[row.slug] = row.id;
        log(`room_types: ${row.slug}`, true, `id=${row.id}`);
        summary.push({ step: `room_type:${row.slug}`, status: "ok", detail: "inserted" });
      }
    }
  }

  // Re-fetch slugMap to make sure we have all IDs (handles partial prior runs)
  const { data: allRoomTypes } = await supabase
    .from("room_types")
    .select("id, slug");
  for (const rt of allRoomTypes ?? []) {
    slugMap[rt.slug] = rt.id;
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

    // Check if amenities already exist for this room type
    const { count } = await supabase
      .from("room_amenities")
      .select("id", { count: "exact", head: true })
      .eq("room_type_id", roomTypeId);

    if (count && count > 0) {
      log(`amenities: ${slug}`, true, `${count} already exist — skipped`);
      summary.push({
        step: `amenities:${slug}`,
        status: "ok",
        detail: "skipped",
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

    const { count } = await supabase
      .from("rooms")
      .select("id", { count: "exact", head: true })
      .eq("room_type_id", roomTypeId);

    if (count && count > 0) {
      log(`rooms: ${slug}`, true, `${count} already exist — skipped`);
      summary.push({ step: `rooms:${slug}`, status: "ok", detail: "skipped" });
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

    const { count } = await supabase
      .from("room_type_unavailable_dates")
      .select("id", { count: "exact", head: true })
      .eq("room_type_id", roomTypeId)
      .eq("from_date", ud.from_date);

    if (count && count > 0) {
      log(
        `unavailable: ${ud.slug} ${ud.from_date}`,
        true,
        "already exists — skipped",
      );
      summary.push({
        step: `unavailable:${ud.slug}:${ud.from_date}`,
        status: "ok",
        detail: "skipped",
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
    const { count } = await supabase
      .from("hotel_amenities")
      .select("id", { count: "exact", head: true })
      .eq("name", ha.name);

    if (count && count > 0) {
      log(`hotel_amenity: ${ha.name}`, true, "already exists — skipped");
      summary.push({
        step: `hotel_amenity:${ha.name}`,
        status: "ok",
        detail: "skipped",
      });
      continue;
    }

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
