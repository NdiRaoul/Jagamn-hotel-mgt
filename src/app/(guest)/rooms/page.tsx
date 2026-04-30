import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Search, SlidersHorizontal } from "lucide-react";
import { ROOMS } from "@/lib/data/rooms";
import { Badge } from "@/components/ui/badge";

export default function RoomsCollectionPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Page Header spacer for absolute navbar */}
      <div className="h-24"></div>

      <div className="flex flex-1 max-w-7xl mx-auto w-full px-8 py-12 gap-10">
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
                placeholder="e.g. Regency Suite"
                className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-md text-sm focus:outline-none focus:border-jagamn-primary text-jagamn-primary placeholder:text-gray-400"
              />
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
                    defaultValue={250}
                    className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-jagamn-primary text-jagamn-primary"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-[10px] text-jagamn-secondary uppercase tracking-wider block mb-1">
                    Max
                  </label>
                  <input
                    type="number"
                    defaultValue={999}
                    className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-jagamn-primary text-jagamn-primary"
                  />
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="mb-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-jagamn-secondary mb-3">
                Location
              </p>
              {["Palace Gardens", "City Skyline", "Oceanfront"].map((loc) => (
                <label
                  key={loc}
                  className="flex items-center gap-2 mb-2 cursor-pointer group"
                >
                  <input
                    type="checkbox"
                    defaultChecked={loc === "Palace Gardens"}
                    className="accent-jagamn-primary w-4 h-4"
                  />
                  <span className="text-sm text-jagamn-primary group-hover:text-jagamn-tertiary transition-colors">
                    {loc}
                  </span>
                </label>
              ))}
            </div>

            {/* Signature Amenities */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-jagamn-secondary mb-3">
                Signature Amenities
              </p>
              <div className="flex flex-wrap gap-2">
                {[
                  "Plunge Pool",
                  "Butler Service",
                  "Terrace",
                  "Fireplace",
                  "Spa Access",
                ].map((amenity, i) => (
                  <button
                    key={amenity}
                    className={`text-xs px-3 py-1.5 rounded-sm border transition-colors ${
                      i < 2
                        ? "bg-jagamn-primary text-white border-jagamn-primary"
                        : "border-gray-200 text-jagamn-secondary hover:border-jagamn-primary hover:text-jagamn-primary"
                    }`}
                  >
                    {amenity}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* ───── Main Content ───── */}
        <main className="flex-1">
          {/* Collection Header */}
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
                  Showing {ROOMS.length} Suites & Rooms
                </p>
                <button className="flex items-center gap-2 text-sm text-jagamn-primary border border-gray-200 px-3 py-2 rounded-md hover:border-jagamn-primary transition-colors lg:hidden">
                  <SlidersHorizontal className="w-4 h-4" />
                  Filters
                </button>
              </div>
            </div>
          </div>

          {/* Room Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {ROOMS.map((room) => (
              <div
                key={room.slug}
                className="group border border-gray-100 rounded-md overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Room Image */}
                <div className="relative h-56 overflow-hidden">
                  <Image
                    src={room.images.main}
                    alt={room.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  {room.badge && (
                    <div className="absolute top-3 left-3 bg-jagamn-tertiary text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-sm">
                      {room.badge}
                    </div>
                  )}
                </div>

                {/* Room Info */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      {/* <p className="text-xs text-jagamn-tertiary font-semibold uppercase tracking-wider mb-1">
                        {room.collectionLabel}
                      </p> */}
                      <h2 className="manrope-bold text-xl text-jagamn-primary">
                        {room.name}
                      </h2>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="manrope-bold text-2xl text-jagamn-primary">
                        ${room.price.toLocaleString()}
                      </p>
                      <p className="text-xs text-jagamn-secondary">/night</p>
                    </div>
                  </div>

                  <p className="text-sm text-jagamn-secondary leading-relaxed mb-4">
                    {room.description}
                  </p>

                  {/* Meta badges */}
                  <div className="flex items-center gap-4 mb-6 text-xs text-jagamn-secondary">
                    <span>{room.sqft.toLocaleString()} sq.ft</span>
                    <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                    <span>{room.bedType}</span>
                    <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                    <span>Up to {room.maxGuests} Guests</span>
                  </div>

                  <Link
                    href={`/rooms/${room.slug}`}
                    className="w-full flex items-center justify-center gap-2 bg-transparent hover:bg-[#FFB77A] text-jagamn-primary hover:text-[#412000] border border-jagamn-primary hover:border-none py-3 rounded-md text-sm font-semibold transition-colors"
                  >
                    Reserve {room.name.split(" ")[0]}
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
