"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Search, SlidersHorizontal } from "lucide-react";
import { ROOMS } from "@/lib/data/rooms";
import { SearchBar } from "@/components/guest/search-bar";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import { formatMoney } from "@/lib/currency";

type RoomDisplay = {
  slug: string;
  name: string;
  collection: string;
  collectionLabel: string;
  badge: string | null;
  price: number;
  description: string;
  sqft: number;
  bedType: string;
  maxGuests: number;
  mainImage: string;
  availableCount: number | null;
};

const COLLECTIONS = [
  { key: "all", label: "All" },
  { key: "garden_collection", label: "Garden" },
  { key: "heritage_collection", label: "Heritage" },
  { key: "signature_collection", label: "Signature" },
  { key: "royal_collection", label: "Royal" },
  { key: "presidential_collection", label: "Presidential" },
];

export default function RoomsCollectionPage() {
  const [rooms, setRooms] = useState<RoomDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const supabase = createSupabaseBrowserClient();

  // Filters
  const [search, setSearch] = useState("");
  const [collection, setCollection] = useState("all");
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(9999999);
  const [minGuests, setMinGuests] = useState(1);

  useEffect(() => {
    // Check auth state
    supabase.auth.getUser().then(({ data: { user } }) => {
      setIsLoggedIn(!!user);
    });

    async function fetchRooms() {
      try {
        const res = await fetch("/api/rooms");
        const json = await res.json();

        if (json.source === "supabase" && json.rooms) {
          setRooms(
            json.rooms.map(
              (rt: {
                slug: string;
                name: string;
                collection: string;
                collection_label: string;
                badge: string | null;
                price_per_night: number;
                description: string | null;
                sqft: number | null;
                bed_type: string | null;
                max_guests: number | null;
                main_image: string | null;
                available_count: number | null;
              }) => ({
                slug: rt.slug,
                name: rt.name,
                collection: rt.collection,
                collectionLabel: rt.collection_label,
                badge: rt.badge,
                price: rt.price_per_night,
                description: rt.description || "",
                sqft: rt.sqft || 0,
                bedType: rt.bed_type || "",
                maxGuests: rt.max_guests || 1,
                mainImage: rt.main_image || "/images/classic-heritage.png",
                availableCount: rt.available_count ?? null,
              }),
            ),
          );
        } else {
          // Static fallback
          setRooms(
            ROOMS.map((r) => ({
              slug: r.slug,
              name: r.name,
              collection: r.collectionLabel.toLowerCase().replace(/ /g, "_"),
              collectionLabel: r.collectionLabel,
              badge: r.badge || null,
              price: r.price,
              description: r.description,
              sqft: r.sqft,
              bedType: r.bedType,
              maxGuests: r.maxGuests,
              mainImage: r.images.main,
              availableCount: null,
            })),
          );
        }
      } catch {
        // Fallback to static
        setRooms(
          ROOMS.map((r) => ({
            slug: r.slug,
            name: r.name,
            collection: r.collectionLabel.toLowerCase().replace(/ /g, "_"),
            collectionLabel: r.collectionLabel,
            badge: r.badge || null,
            price: r.price,
            description: r.description,
            sqft: r.sqft,
            bedType: r.bedType,
            maxGuests: r.maxGuests,
            mainImage: r.images.main,
            availableCount: null,
          })),
        );
      } finally {
        setLoading(false);
      }
    }
    fetchRooms();
  }, []);

  const filtered = useMemo(() => {
    return rooms.filter((r) => {
      if (search && !r.name.toLowerCase().includes(search.toLowerCase()))
        return false;
      if (collection !== "all" && r.collection !== collection) return false;
      if (r.price < minPrice || r.price > maxPrice) return false;
      if (r.maxGuests < minGuests) return false;
      return true;
    });
  }, [rooms, search, collection, minPrice, maxPrice, minGuests]);

  return (
    <div className="flex flex-col min-h-screen">
      <div className="h-24" />

      {/* ── Search / Date Picker Bar ── */}
      <div className="bg-jagamn-primary py-8 px-4 sm:px-8">
        <div className="max-w-5xl mx-auto">
          <p className="text-white/60 text-xs font-bold uppercase tracking-widest mb-3">
            {isLoggedIn ? "Find your next stay" : "Browse & Book"}
          </p>
          <SearchBar
            roomTypes={rooms.map((r) => ({ slug: r.slug, name: r.name }))}
          />
        </div>
      </div>

      <div className="flex flex-1 max-w-7xl mx-auto w-full px-4 sm:px-8 py-12 gap-10">
        {/* ───── Sidebar ───── */}
        <aside className="hidden lg:flex flex-col w-64 flex-shrink-0 gap-8 bg-[#F4F6F8] border-l-4 border-[#00152A] p-6 rounded-md">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-jagamn-secondary mb-4">
              Refine Collection
            </p>

            {/* Search */}
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-jagamn-secondary" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="e.g. Regency Suite"
                className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-md text-sm focus:outline-none focus:border-jagamn-primary text-jagamn-primary placeholder:text-gray-400"
              />
            </div>

            {/* Collection Tabs */}
            <div className="mb-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-jagamn-secondary mb-3">
                Collection
              </p>
              <div className="flex flex-col gap-1">
                {COLLECTIONS.map((c) => (
                  <button
                    key={c.key}
                    onClick={() => setCollection(c.key)}
                    className={`text-left text-sm px-3 py-2 rounded-md transition-colors ${
                      collection === c.key
                        ? "bg-jagamn-primary text-white font-bold"
                        : "text-jagamn-secondary hover:bg-gray-200"
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div className="mb-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-jagamn-secondary mb-3">
                Price per Night
              </p>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-[10px] text-jagamn-secondary uppercase tracking-wider block mb-1">
                    Min
                  </label>
                  <input
                    type="number"
                    value={minPrice}
                    onChange={(e) => setMinPrice(Number(e.target.value))}
                    className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-jagamn-primary text-jagamn-primary"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-[10px] text-jagamn-secondary uppercase tracking-wider block mb-1">
                    Max
                  </label>
                  <input
                    type="number"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(Number(e.target.value))}
                    className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-jagamn-primary text-jagamn-primary"
                  />
                </div>
              </div>
            </div>

            {/* Min Guests */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-jagamn-secondary mb-3">
                Min Guests
              </p>
              <select
                value={minGuests}
                onChange={(e) => setMinGuests(Number(e.target.value))}
                className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-jagamn-primary text-jagamn-primary"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                  <option key={n} value={n}>
                    {n}+ Guests
                  </option>
                ))}
              </select>
            </div>
          </div>
        </aside>

        {/* ───── Main Content ───── */}
        <main className="flex-1">
          <div className="mb-10">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-jagamn-secondary mb-1">
              JAGAMN PALACE
            </p>
            <div className="flex items-end justify-between">
              <h1 className="manrope-bold text-4xl text-jagamn-primary">
                The Collection
              </h1>
              <div className="flex items-center gap-4">
                <p className="text-sm text-jagamn-secondary hidden md:block">
                  {loading
                    ? "Loading..."
                    : `Showing ${filtered.length} of ${rooms.length} room types`}
                </p>
                <button className="flex items-center gap-2 text-sm text-jagamn-primary border border-gray-200 px-3 py-2 rounded-md hover:border-jagamn-primary transition-colors lg:hidden">
                  <SlidersHorizontal className="w-4 h-4" />
                  Filters
                </button>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="border border-gray-100 rounded-md overflow-hidden shadow-sm animate-pulse"
                >
                  <div className="h-56 bg-gray-200" />
                  <div className="p-6 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-100 rounded w-full" />
                    <div className="h-3 bg-gray-100 rounded w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
              {filtered.map((room) => (
                <div
                  key={room.slug}
                  className="group border border-gray-100 rounded-md overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="relative h-56 overflow-hidden">
                    <Image
                      src={room.mainImage}
                      alt={room.name}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    {room.badge && (
                      <div className="absolute top-3 left-3 bg-jagamn-tertiary text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-sm">
                        {room.badge}
                      </div>
                    )}
                    {room.availableCount !== null && (
                      <div className="absolute top-3 right-3 bg-white/90 text-jagamn-primary text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-sm flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                        {room.availableCount} Available
                      </div>
                    )}
                  </div>

                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h2 className="manrope-bold text-xl text-jagamn-primary">
                          {room.name}
                        </h2>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="manrope-bold text-2xl text-jagamn-primary">
                          {formatMoney(room.price)}
                        </p>
                        <p className="text-xs text-jagamn-secondary">/night</p>
                      </div>
                    </div>

                    <p className="text-sm text-jagamn-secondary leading-relaxed mb-4">
                      {room.description}
                    </p>

                    <div className="flex items-center gap-4 mb-6 text-xs text-jagamn-secondary">
                      <span>{room.sqft.toLocaleString()} sq.ft</span>
                      <span className="w-1 h-1 rounded-full bg-gray-300" />
                      <span>{room.bedType}</span>
                      <span className="w-1 h-1 rounded-full bg-gray-300" />
                      <span>Up to {room.maxGuests} Guests</span>
                    </div>

                    <Link
                      href={`/rooms/${room.slug}`}
                      className="w-full flex items-center justify-center gap-2 bg-jagamn-primary hover:bg-jagamn-primary/90 text-white py-3 rounded-md text-sm font-semibold transition-colors"
                    >
                      {isLoggedIn ? "Book Now" : "View & Reserve"}
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))}

              {filtered.length === 0 && (
                <div className="col-span-2 text-center py-20 text-jagamn-secondary">
                  <p className="text-lg font-semibold">
                    No rooms match your filters.
                  </p>
                  <button
                    onClick={() => {
                      setSearch("");
                      setCollection("all");
                      setMinPrice(0);
                      setMaxPrice(9999999);
                      setMinGuests(1);
                    }}
                    className="mt-4 text-sm text-jagamn-tertiary underline"
                  >
                    Clear all filters
                  </button>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
