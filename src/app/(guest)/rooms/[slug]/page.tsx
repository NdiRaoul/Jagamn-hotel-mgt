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
  TreePine,
  Bath,
  Waves,
  Utensils,
  Library,
  Car,
  Dumbbell,
  Music,
} from "lucide-react";
import { getRoomBySlug, ROOMS } from "@/lib/data/rooms";
import { RoomBookingWidget } from "@/components/guest/room-booking-widget";
import { supabaseAdmin } from "@/lib/supabase-server";
import type {
  RoomTypeWithDetails,
  RoomAvailabilitySummary,
} from "@/types/database";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Wifi,
  Wine,
  UserCheck,
  Coffee,
  Thermometer,
  Sparkles,
  TreePine,
  Bath,
  Waves,
  Utensils,
  Library,
  Car,
  Dumbbell,
  Music,
};

type Props = {
  params: Promise<{ slug: string }>;
};

async function getRoomData(slug: string) {
  const isConfigured =
    !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !!process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!isConfigured) return null;

  try {
    const { data, error } = await supabaseAdmin
      .from("room_types")
      .select("*, room_amenities(*), room_type_unavailable_dates(*)")
      .eq("slug", slug)
      .single();

    if (error || !data) return null;
    return data as RoomTypeWithDetails;
  } catch {
    return null;
  }
}

async function getAvailableCount(slug: string): Promise<number | null> {
  try {
    const { data } = await supabaseAdmin
      .from("room_availability_summary")
      .select("available_today")
      .eq("slug", slug)
      .single();
    return data?.available_today ?? null;
  } catch {
    return null;
  }
}

async function getSimilarRooms(slug: string) {
  try {
    const { data } = await supabaseAdmin
      .from("room_types")
      .select(
        "slug, name, collection_label, badge, price_per_night, main_image, description",
      )
      .neq("slug", slug)
      .order("sort_order")
      .limit(3);
    return data || [];
  } catch {
    return [];
  }
}

export default async function RoomDetailPage({ params }: Props) {
  const { slug } = await params;

  // Try Supabase first
  const dbRoom = await getRoomData(slug);
  const availableCount = await getAvailableCount(slug);

  // Build a unified room object for the widget (uses static Room type)
  let widgetRoom = getRoomBySlug(slug);

  if (!dbRoom && !widgetRoom) notFound();

  // Merge DB data into widget room if available
  if (dbRoom && widgetRoom) {
    // Patch unavailable dates from DB
    widgetRoom = {
      ...widgetRoom,
      unavailableDates: (dbRoom.room_type_unavailable_dates || []).map(
        (ud) => ({
          from: ud.from_date,
          to: ud.to_date,
          alternateRooms: ud.alternate_room_slugs || [],
          alternateDates: (ud.alternate_dates as any) || [],
        }),
      ),
    };
  }

  // Display data — prefer DB
  const name = dbRoom?.name || widgetRoom?.name || "";
  const collectionLabel =
    dbRoom?.collection_label || widgetRoom?.collectionLabel || "";
  const description = dbRoom?.description || widgetRoom?.description || "";
  const longDescription =
    dbRoom?.long_description || widgetRoom?.longDescription || "";
  const sqft = dbRoom?.sqft || widgetRoom?.sqft || 0;
  const bedType = dbRoom?.bed_type || widgetRoom?.bedType || "";
  const maxGuests = dbRoom?.max_guests || widgetRoom?.maxGuests || 0;
  const cancellationPolicy =
    dbRoom?.cancellation_policy || widgetRoom?.cancellationPolicy || "";
  const mainImage = dbRoom?.main_image || widgetRoom?.images.main || "";
  const galleryImages =
    dbRoom?.gallery_images || widgetRoom?.images.gallery || [];

  const amenities = dbRoom?.room_amenities?.length
    ? dbRoom.room_amenities.map((a) => ({ icon: a.icon, label: a.label }))
    : widgetRoom?.amenities || [];

  // Similar rooms
  const dbSimilar = await getSimilarRooms(slug);
  const similarRooms =
    dbSimilar.length > 0
      ? dbSimilar.map((r: any) => ({
          slug: r.slug,
          name: r.name,
          collectionLabel: r.collection_label,
          badge: r.badge,
          price: r.price_per_night,
          mainImage: r.main_image || "/images/classic-heritage.png",
          description: r.description || "",
        }))
      : ROOMS.filter((r) => r.slug !== slug)
          .slice(0, 3)
          .map((r) => ({
            slug: r.slug,
            name: r.name,
            collectionLabel: r.collectionLabel,
            badge: r.badge,
            price: r.price,
            mainImage: r.images.main,
            description: r.description,
          }));

  return (
    <div className="flex flex-col min-h-screen bg-[#F9FAFB]">
      <div className="h-24" />

      <div className="max-w-7xl mx-auto w-full px-8 py-10">
        {/* Back link */}
        <Link
          href="/rooms"
          className="inline-flex items-center gap-1.5 text-sm text-jagamn-secondary hover:text-jagamn-primary transition-colors mb-6"
        >
          <ChevronLeft className="w-4 h-4" />
          All Rooms & Suites
        </Link>

        {/* ── Gallery ── */}
        <div
          className="grid grid-cols-2 gap-2 mb-10"
          style={{ height: "420px" }}
        >
          <div className="relative rounded-md overflow-hidden h-full">
            <Image
              src={mainImage}
              alt={name}
              fill
              sizes="50vw"
              className="object-cover"
              priority
            />
            {availableCount !== null && (
              <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-jagamn-primary text-xs font-bold px-3 py-1.5 rounded-sm flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                {availableCount} room{availableCount !== 1 ? "s" : ""} of this
                type available at Jagamn Palace
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 grid-rows-2 gap-2 h-full">
            {galleryImages.slice(0, 3).map((img, i) => (
              <div key={i} className="relative rounded-md overflow-hidden">
                <Image
                  src={img}
                  alt={`${name} photo ${i + 2}`}
                  fill
                  sizes="25vw"
                  className="object-cover"
                />
              </div>
            ))}
            <div className="relative rounded-md overflow-hidden cursor-pointer">
              {galleryImages[3] && (
                <Image
                  src={galleryImages[3]}
                  alt={`${name} more`}
                  fill
                  sizes="25vw"
                  className="object-cover"
                />
              )}
              <div className="absolute inset-0 bg-black/50 hover:bg-black/40 transition-colors flex items-center justify-center">
                <span className="text-white font-bold text-sm">+8 More</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Two-column layout ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left: Details */}
          <div className="lg:col-span-2">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-jagamn-tertiary mb-2">
              {collectionLabel}
            </p>
            <h1 className="manrope-extrabold text-4xl text-jagamn-primary mb-4">
              {name}
            </h1>
            <div className="flex items-center gap-6 text-sm text-jagamn-secondary mb-8">
              <span className="flex items-center gap-1.5">
                <Maximize className="w-4 h-4" />
                {sqft.toLocaleString()} sq.ft
              </span>
              <span className="flex items-center gap-1.5">
                <Bed className="w-4 h-4" />
                {bedType}
              </span>
              <span className="flex items-center gap-1.5">
                <Users className="w-4 h-4" />
                Up to {maxGuests} Guests
              </span>
            </div>

            <div className="mb-10 bg-[#F4F6F8] border-l-4 border-[#00152A] p-8 rounded-r-md">
              <h2 className="manrope-bold text-xl text-jagamn-primary mb-3">
                The Palace Experience
              </h2>
              <p className="text-sm text-jagamn-secondary leading-relaxed">
                {description}
              </p>
              {longDescription && (
                <p className="text-sm text-jagamn-secondary leading-relaxed mt-3">
                  {longDescription}
                </p>
              )}
            </div>

            {/* Premium Amenities */}
            <div className="mb-10">
              <h2 className="manrope-bold text-xl text-jagamn-primary mb-5">
                Premium Amenities
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {amenities.map((amenity) => {
                  const Icon = ICON_MAP[amenity.icon] ?? Sparkles;
                  return (
                    <div
                      key={amenity.label}
                      className="flex items-center gap-3 text-sm text-jagamn-primary"
                    >
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
            <div className="flex items-start gap-3 bg-[#ECEEF0] border border-amber-100 rounded-md p-4 mb-4">
              <AlertCircle className="w-5 h-5 text-jagamn-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-jagamn-primary mb-1">
                  Flexible Cancellation
                </p>
                <p className="text-xs text-jagamn-secondary">
                  {cancellationPolicy}
                </p>
              </div>
            </div>
          </div>

          {/* Right: Booking Widget */}
          <div className="lg:col-span-1">
            <div className="sticky top-28">
              {widgetRoom && <RoomBookingWidget room={widgetRoom} />}
            </div>
          </div>
        </div>

        {/* ── You May Also Like ── */}
        <div className="mt-16 pt-12 border-t border-gray-200">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="manrope-bold text-2xl text-jagamn-primary">
                You May Also Like
              </h2>
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {similarRooms.map((similar) => (
              <Link
                key={similar.slug}
                href={`/rooms/${similar.slug}`}
                className="group"
              >
                <div className="relative h-52 rounded-md overflow-hidden mb-4">
                  <Image
                    src={similar.mainImage}
                    alt={similar.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  {similar.badge && (
                    <div className="absolute top-2 left-2 bg-jagamn-tertiary text-white text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-sm">
                      {similar.badge}
                    </div>
                  )}
                  <div className="absolute top-2 right-2 bg-white/90 text-jagamn-primary text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-sm">
                    From ${similar.price}
                  </div>
                </div>
                <p className="text-xs text-jagamn-tertiary font-semibold uppercase tracking-wider mb-0.5">
                  {similar.collectionLabel}
                </p>
                <h3 className="manrope-bold text-base text-jagamn-primary group-hover:text-jagamn-tertiary transition-colors">
                  {similar.name}
                </h3>
                <p className="text-xs text-jagamn-secondary mt-0.5">
                  {similar.description.slice(0, 60)}...
                </p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
