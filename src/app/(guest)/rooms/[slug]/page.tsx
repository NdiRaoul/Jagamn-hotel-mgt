import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  Bed,
  Users,
  Maximize,
  Wifi,
  Wine,
  UserCheck,
  Coffee,
  Thermometer,
  Sparkles,
  ChevronLeft,
  AlertCircle,
} from "lucide-react";
import { getRoomBySlug, ROOMS } from "@/lib/data/rooms";
import { RoomBookingWidget } from "@/components/guest/room-booking-widget";

// Map icon name strings from data to actual lucide components
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Wifi,
  Wine,
  UserCheck,
  Coffee,
  Thermometer,
  Sparkles,
};

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function RoomDetailPage({ params }: Props) {
  const { slug } = await params;
  const room = getRoomBySlug(slug);

  if (!room) notFound();

  const similarRooms = ROOMS.filter((r) => r.slug !== slug).slice(0, 3);

  return (
    <div className="flex flex-col min-h-screen bg-[#F9FAFB]">
      {/* Navbar spacer */}
      <div className="h-24"></div>

      <div className="max-w-7xl mx-auto w-full px-8 py-10">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-jagamn-secondary mb-8">
          <Link href="/" className="hover:text-jagamn-primary transition-colors">Home</Link>
          <span>/</span>
          <Link href="/rooms" className="hover:text-jagamn-primary transition-colors">Rooms & Suites</Link>
          <span>/</span>
          <span className="text-jagamn-primary font-medium">{room.name}</span>
        </div>

        {/* ── Gallery ── */}
        <div className="grid grid-cols-2 gap-2 mb-10 h-[420px]">
          {/* Main large image */}
          <div className="relative rounded-md overflow-hidden col-span-1 row-span-2">
            <Image
              src={room.images.main}
              alt={room.name}
              fill
              className="object-cover"
              priority
            />
          </div>

          {/* Smaller images */}
          <div className="grid grid-cols-2 grid-rows-2 gap-2">
            {room.images.gallery.slice(0, 3).map((img, i) => (
              <div key={i} className="relative rounded-md overflow-hidden">
                <Image src={img} alt={`${room.name} photo ${i + 2}`} fill className="object-cover" />
              </div>
            ))}
            {/* +More badge on 4th image slot */}
            <div className="relative rounded-md overflow-hidden">
              {room.images.gallery[3] && (
                <Image src={room.images.gallery[3]} alt={`${room.name} more`} fill className="object-cover" />
              )}
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center cursor-pointer hover:bg-black/40 transition-colors">
                <span className="text-white font-bold text-sm">+8 More</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Two-column layout ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left: Details */}
          <div className="lg:col-span-2">
            {/* Room meta */}
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-jagamn-tertiary mb-2">
              {room.collectionLabel}
            </p>
            <h1 className="manrope-extrabold text-4xl text-jagamn-primary mb-4">{room.name}</h1>
            <div className="flex items-center gap-6 text-sm text-jagamn-secondary mb-8">
              <span className="flex items-center gap-1.5">
                <Maximize className="w-4 h-4" />
                {room.sqft.toLocaleString()} sq.ft
              </span>
              <span className="flex items-center gap-1.5">
                <Bed className="w-4 h-4" />
                {room.bedType}
              </span>
              <span className="flex items-center gap-1.5">
                <Users className="w-4 h-4" />
                Up to {room.maxGuests} Guests
              </span>
            </div>

            {/* Description */}
            <div className="mb-10">
              <h2 className="manrope-bold text-xl text-jagamn-primary mb-3">The Palace Experience</h2>
              <p className="text-sm text-jagamn-secondary leading-relaxed">{room.description}</p>
              <p className="text-sm text-jagamn-secondary leading-relaxed mt-3">{room.longDescription}</p>
            </div>

            {/* Premium Amenities */}
            <div className="mb-10">
              <h2 className="manrope-bold text-xl text-jagamn-primary mb-5">Premium Amenities</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {room.amenities.map((amenity) => {
                  const Icon = ICON_MAP[amenity.icon] ?? Sparkles;
                  return (
                    <div key={amenity.label} className="flex items-center gap-3 text-sm text-jagamn-primary">
                      <div className="w-8 h-8 rounded-full bg-jagamn-neutral border border-gray-100 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-4 h-4 text-jagamn-secondary" />
                      </div>
                      {amenity.label}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Cancellation Policy */}
            <div className="flex items-start gap-3 bg-amber-50 border border-amber-100 rounded-md p-4 mb-12">
              <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-jagamn-primary mb-1">Flexible Cancellation</p>
                <p className="text-xs text-jagamn-secondary">{room.cancellationPolicy}</p>
              </div>
            </div>

            {/* You May Also Like */}
            <div>
              <div className="flex items-end justify-between mb-6">
                <div>
                  <h2 className="manrope-bold text-2xl text-jagamn-primary">You May Also Like</h2>
                  <p className="text-sm text-jagamn-secondary mt-1">
                    Explore other exceptional sanctuaries within the Palace grounds.
                  </p>
                </div>
                <Link
                  href="/rooms"
                  className="flex items-center gap-1 text-sm text-jagamn-primary hover:text-jagamn-tertiary transition-colors font-semibold"
                >
                  View All Rooms
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {similarRooms.map((similar) => (
                  <Link key={similar.slug} href={`/rooms/${similar.slug}`} className="group">
                    <div className="relative h-44 rounded-md overflow-hidden mb-3">
                      <Image
                        src={similar.images.main}
                        alt={similar.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      {similar.badge && (
                        <div className="absolute top-2 left-2 bg-jagamn-tertiary text-white text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-sm">
                          {similar.badge}
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-jagamn-tertiary font-semibold uppercase tracking-wider mb-0.5">
                      {similar.collectionLabel}
                    </p>
                    <h3 className="manrope-bold text-sm text-jagamn-primary group-hover:text-jagamn-tertiary transition-colors">
                      {similar.name}
                    </h3>
                    <p className="text-xs text-jagamn-secondary mt-0.5">From ${similar.price} / night</p>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Booking Widget */}
          <div className="lg:col-span-1">
            <div className="sticky top-28">
              <RoomBookingWidget room={room} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
