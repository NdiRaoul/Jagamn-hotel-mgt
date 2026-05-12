import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Waves, BookOpen } from "lucide-react";
import { SearchBar } from "@/components/guest/search-bar";
import { ROOMS } from "@/lib/data/rooms";
import { supabaseAdmin } from "@/lib/supabase-server";
import type { RoomType, RoomAvailabilitySummary } from "@/types/database";

const AMENITY_IMAGES = {
  hero: "/images/hero-img.png",
  spa: "/images/celestial-spa.png",
  dining: "/images/saffron-silk.png",
  pool: "/images/royal-pool.png",
  library: "/images/the-library.png",
};

// Slugs for the 3 featured mid-tier cards
const FEATURED_SLUGS = [
  "classic-heritage",
  "palace-deluxe",
  "royal-grand-suite",
];
// Slugs for the 2 compact cards
const COMPACT_SLUGS = ["garden-terrace", "maharaja-presidential"];

async function getRoomData() {
  const isConfigured =
    !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !!process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!isConfigured) {
    return { roomTypes: null, availability: null };
  }

  try {
    const [{ data: roomTypes }, { data: availability }] = await Promise.all([
      supabaseAdmin.from("room_types").select("*").order("sort_order"),
      supabaseAdmin.from("room_availability_summary").select("*"),
    ]);
    return { roomTypes, availability };
  } catch {
    return { roomTypes: null, availability: null };
  }
}

export default async function GuestLandingPage() {
  const { roomTypes, availability } = await getRoomData();

  // Build availability map: slug → available_today
  const availMap: Record<string, number> = {};
  if (availability) {
    for (const row of availability as RoomAvailabilitySummary[]) {
      availMap[row.slug] = row.available_today;
    }
  }

  // Build room display data — prefer DB, fallback to static
  function getRoomDisplay(slug: string) {
    if (roomTypes) {
      const rt = (roomTypes as RoomType[]).find((r) => r.slug === slug);
      if (rt) {
        return {
          slug: rt.slug,
          name: rt.name,
          price: rt.price_per_night,
          badge: rt.badge,
          mainImage: rt.main_image || "/images/classic-heritage.png",
          availableCount: availMap[rt.slug] ?? null,
        };
      }
    }
    // Static fallback
    const r = ROOMS.find((r) => r.slug === slug);
    if (!r) return null;
    return {
      slug: r.slug,
      name: r.name,
      price: r.price,
      badge: r.badge,
      mainImage: r.images.main,
      availableCount: null,
    };
  }

  const featuredRooms = FEATURED_SLUGS.map(getRoomDisplay).filter(Boolean);
  const compactRooms = COMPACT_SLUGS.map(getRoomDisplay).filter(Boolean);

  // All room types for SearchBar dropdown
  const allRoomNames = roomTypes
    ? (roomTypes as RoomType[]).map((rt) => ({ slug: rt.slug, name: rt.name }))
    : ROOMS.map((r) => ({ slug: r.slug, name: r.name }));

  return (
    <div className="flex flex-col min-h-screen">
      {/* ── Hero Section ───────────────────────────────────────────── */}
      <section className="relative h-[85vh] w-full flex flex-col items-center justify-center pt-24">
        <div className="absolute inset-0 z-0 bg-slate-900">
          <Image
            src={AMENITY_IMAGES.hero}
            alt="Jagamn Palace Heritage Luxury"
            fill
            className="opacity-80 object-cover object-top"
            priority
          />
          <div className="absolute inset-0 bg-black/30" />
        </div>

        <div className="relative z-10 text-center text-white px-4 flex flex-col items-center mt-[-10vh]">
          <p className="manrope-extralight text-lg md:text-xl max-w-2xl text-[#FFDCC2] uppercase tracking-widest mb-4">
            Experience The Sublime
          </p>
          <h1 className="manrope-extrabold text-5xl md:text-7xl mb-6 max-w-4xl leading-tight">
            Heritage Luxury <br /> Redefined
          </h1>
          <p className="manrope-medium text-lg md:text-xl max-w-2xl text-[#E2E8F0]">
            Enter a world where royal tradition meets modern sophistication in
            the heart of our majestic palace.
          </p>
        </div>

        <div className="hidden lg:block absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 z-20 w-full max-w-5xl px-4">
          <SearchBar roomTypes={allRoomNames} />
        </div>
      </section>

      <div className="lg:hidden w-full max-w-5xl px-4">
        <SearchBar roomTypes={allRoomNames} />
      </div>

      <div className="h-24 md:h-32" />

      {/* ── Rooms & Suites Section ─────────────────────────────────── */}
      <section className="py-16 px-8 max-w-7xl mx-auto w-full">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-4">
          <div>
            <h2 className="manrope-bold text-3xl text-jagamn-primary mb-2">
              Our Rooms & Suites
            </h2>
            <p className="manrope-regular text-jagamn-secondary">
              Curated sanctuaries of rest designed with bespoke textures and
              historic motifs.
            </p>
          </div>
          <Link
            href="/rooms"
            className="flex items-center gap-2 text-sm font-semibold text-jagamn-primary hover:text-jagamn-tertiary transition-colors"
          >
            View All Categories
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* 3 featured mid-tier cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center mb-8">
          {featuredRooms.map((room, i) => {
            if (!room) return null;
            const isFeatured = !!room.badge;
            return (
              <Link
                key={room.slug}
                href={`/rooms/${room.slug}`}
                className={`group relative overflow-hidden rounded-md cursor-pointer border border-gray-100 shadow-sm block ${
                  isFeatured ? "h-[480px] shadow-xl z-10 -my-4" : "h-[420px]"
                }`}
              >
                <Image
                  src={room.mainImage}
                  alt={room.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />

                {room.badge && (
                  <div className="absolute top-4 right-4 bg-jagamn-tertiary text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-sm z-20">
                    {room.badge}
                  </div>
                )}

                {room.availableCount !== null && (
                  <div className="absolute top-4 left-4 bg-white/90 text-jagamn-primary text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-sm z-20 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                  </div>
                )}

                <div className="absolute bottom-4 left-4 right-4 bg-white p-4 rounded shadow-md flex justify-between items-center transition-transform group-hover:-translate-y-2 duration-300">
                  <div>
                    <h3 className="manrope-bold text-lg text-jagamn-primary">
                      {room.name}
                    </h3>
                    <p className="text-xs text-jagamn-secondary mt-1">
                      Starting from ${room.price} / Night
                    </p>
                  </div>
                  <div className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-jagamn-tertiary group-hover:bg-jagamn-tertiary group-hover:text-white transition-colors">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* 2 compact cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {compactRooms.map((room) => {
            if (!room) return null;
            return (
              <Link
                key={room.slug}
                href={`/rooms/${room.slug}`}
                className="group relative overflow-hidden rounded-md cursor-pointer border border-gray-100 shadow-sm block h-[280px]"
              >
                <Image
                  src={room.mainImage}
                  alt={room.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />

                {room.badge && (
                  <div className="absolute top-4 right-4 bg-jagamn-tertiary text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-sm z-20">
                    {room.badge}
                  </div>
                )}

                {room.availableCount !== null && (
                  <div className="absolute top-4 left-4 bg-white/90 text-jagamn-primary text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-sm z-20 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                  </div>
                )}

                <div className="absolute bottom-4 left-4 right-4 bg-white p-4 rounded shadow-md flex justify-between items-center transition-transform group-hover:-translate-y-2 duration-300">
                  <div>
                    <h3 className="manrope-bold text-lg text-jagamn-primary">
                      {room.name}
                    </h3>
                    <p className="text-xs text-jagamn-secondary mt-1">
                      Starting from ${room.price} / Night
                    </p>
                  </div>
                  <div className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-jagamn-tertiary group-hover:bg-jagamn-tertiary group-hover:text-white transition-colors">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ── Amenities / Experiences Grid ───────────────────────────── */}
      <section className="py-8 px-8 max-w-7xl mx-auto w-full mb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-auto md:h-[500px]">
          <div className="relative rounded-md overflow-hidden h-[300px] md:h-full group cursor-pointer shadow-sm">
            <Image
              src={AMENITY_IMAGES.spa}
              alt="The Celestial Spa"
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent pointer-events-none" />
            <div className="absolute bottom-8 left-8">
              <h3 className="manrope-bold text-3xl text-white mb-2">
                The Celestial Spa
              </h3>
              <p className="text-sm text-white/80 max-w-xs">
                Rejuvenation programs rooted in ancient Ayurvedic wisdom.
              </p>
            </div>
          </div>

          <div className="grid grid-rows-2 gap-4 h-[600px] md:h-full">
            <div className="relative rounded-md overflow-hidden group cursor-pointer shadow-sm">
              <Image
                src={AMENITY_IMAGES.dining}
                alt="Saffron & Silk"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
              <div className="absolute bottom-6 left-6">
                <h3 className="manrope-bold text-xl text-white mb-1">
                  Saffron & Silk
                </h3>
                <p className="text-xs text-white/80">
                  Award-winning fine dining under the desert stars.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="relative rounded-md overflow-hidden group cursor-pointer shadow-sm">
                <Image
                  src={AMENITY_IMAGES.pool}
                  alt="Royal Pool"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors pointer-events-none" />
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                  <Waves className="w-8 h-8 text-white" />
                  <h3 className="manrope-bold text-sm text-white">
                    Royal Pool
                  </h3>
                </div>
              </div>

              <div className="relative rounded-md overflow-hidden group cursor-pointer shadow-sm">
                <Image
                  src={AMENITY_IMAGES.library}
                  alt="The Library"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors pointer-events-none" />
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                  <BookOpen className="w-8 h-8 text-white" />
                  <h3 className="manrope-bold text-sm text-white">
                    The Library
                  </h3>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
