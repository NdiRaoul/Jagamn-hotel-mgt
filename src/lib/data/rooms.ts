// ============================================================
// ROOMS — Single source of truth
// When real data is ready, update this file only.
// All pages (homepage, collection, detail) read from here.
// ============================================================

export type RoomAmenity = {
  icon: string; // lucide icon name
  label: string;
};

export type UnavailableDateRange = {
  from: string; // ISO date string "YYYY-MM-DD"
  to: string;
  alternateRooms?: string[]; // slugs of suggested alternatives
  alternateDates?: { from: string; to: string }[];
};

export type Room = {
  slug: string;
  name: string;
  collectionLabel: string; // e.g. "Heritage Collection"
  badge?: string; // e.g. "Most Popular"
  price: number; // per night in USD
  description: string;
  longDescription: string;
  sqft: number;
  bedType: string;
  maxGuests: number;
  images: {
    main: string;
    gallery: string[]; // up to 4 extra images
  };
  amenities: RoomAmenity[];
  cancellationPolicy: string;
  unavailableDates: UnavailableDateRange[];
};

// ============================================================
// ROOM DEFINITIONS
// ============================================================
export const ROOMS: Room[] = [
  {
    slug: "classic-heritage",
    name: "Classic Heritage",
    collectionLabel: "Heritage Collection",
    price: 299,
    description:
      "Inspired by the regal heritage of the 17th-century Rajasthani architecture, the Classic Heritage offers an expansive sanctuary of peace and prestige.",
    longDescription:
      "Featuring hand-woven silk tapestries, a private sandstone terrace overlooking the reflecting pool, and a dedicated 24-hour butler service, this suite is the pinnacle of modern stately living.",
    sqft: 1268,
    bedType: "King Terrace",
    maxGuests: 3,
    images: {
      main: "/images/classic-heritage.png",
      gallery: [
        "/images/palace-deluxe.png",
        "/images/royal-pool.png",
        "/images/the-library.png",
        "/images/saffron-silk.png",
      ],
    },
    amenities: [
      { icon: "Wifi", label: "Ultra Fast Wifi" },
      { icon: "Wine", label: "Curated Mini-Bar" },
      { icon: "UserCheck", label: "Private Butler" },
      { icon: "Coffee", label: "Nespresso Machine" },
      { icon: "Thermometer", label: "Climate Control" },
      { icon: "Sparkles", label: "Palace Spa Linens" },
    ],
    cancellationPolicy:
      "Cancel at no cost 48 hours before check-in. After that, Palace Club members enjoy exemption up to 4 hours prior.",
    unavailableDates: [
      {
        from: "2026-05-12",
        to: "2026-05-19",
        alternateRooms: ["palace-deluxe", "royal-grand-suite"],
        alternateDates: [
          { from: "2026-05-07", to: "2026-05-11" },
          { from: "2026-05-20", to: "2026-05-25" },
        ],
      },
      {
        from: "2026-06-01",
        to: "2026-06-07",
        alternateRooms: ["palace-deluxe"],
        alternateDates: [
          { from: "2026-05-28", to: "2026-05-31" },
          { from: "2026-06-08", to: "2026-06-12" },
        ],
      },
    ],
  },

  {
    slug: "palace-deluxe",
    name: "Palace Deluxe",
    collectionLabel: "Signature Collection",
    badge: "Most Popular",
    price: 450,
    description:
      "Experience palace suite living featuring award-winning quarters, panoramic garden views, and dedicated 24-hour in-suite dining.",
    longDescription:
      "The Palace Deluxe is our crown jewel — a grand space adorned with hand-carved marble pillars, bespoke Rajasthani artwork, and a private plunge pool shaded by ancient tamarind trees.",
    sqft: 1800,
    bedType: "King Canopy",
    maxGuests: 4,
    images: {
      main: "/images/palace-deluxe.png",
      gallery: [
        "/images/classic-heritage.png",
        "/images/royal-grand-suite.png",
        "/images/celestial-spa.png",
        "/images/royal-pool.png",
      ],
    },
    amenities: [
      { icon: "Wifi", label: "Ultra Fast Wifi" },
      { icon: "Wine", label: "Curated Mini-Bar" },
      { icon: "UserCheck", label: "Private Butler" },
      { icon: "Coffee", label: "Nespresso Machine" },
      { icon: "Thermometer", label: "Climate Control" },
      { icon: "Sparkles", label: "Palace Spa Linens" },
    ],
    cancellationPolicy:
      "Cancel at no cost 48 hours before check-in. After that, Palace Club members enjoy exemption up to 4 hours prior.",
    unavailableDates: [
      {
        from: "2026-05-15",
        to: "2026-05-22",
        alternateRooms: ["classic-heritage", "royal-grand-suite"],
        alternateDates: [
          { from: "2026-05-10", to: "2026-05-14" },
          { from: "2026-05-23", to: "2026-05-28" },
        ],
      },
    ],
  },

  {
    slug: "royal-grand-suite",
    name: "Royal Grand Suite",
    collectionLabel: "Royal Collection",
    price: 899,
    description:
      "The ultimate expression of palace luxury and privacy. Reserved for royalty, heads of state, and those who demand nothing less.",
    longDescription:
      "Spanning two floors, the Royal Grand Suite features a personal butler's pantry, a private rooftop terrace with a heated infinity pool, a formal dining room for eight, and a master dressing room lined with custom cabinetry.",
    sqft: 3500,
    bedType: "Emperor King",
    maxGuests: 6,
    images: {
      main: "/images/royal-grand-suite.png",
      gallery: [
        "/images/palace-deluxe.png",
        "/images/celestial-spa.png",
        "/images/saffron-silk.png",
        "/images/the-library.png",
      ],
    },
    amenities: [
      { icon: "Wifi", label: "Ultra Fast Wifi" },
      { icon: "Wine", label: "Curated Mini-Bar" },
      { icon: "UserCheck", label: "Private Butler" },
      { icon: "Coffee", label: "Nespresso Machine" },
      { icon: "Thermometer", label: "Climate Control" },
      { icon: "Sparkles", label: "Palace Spa Linens" },
    ],
    cancellationPolicy:
      "Cancel at no cost 72 hours before check-in. Fully flexible for Palace Elite members.",
    unavailableDates: [
      {
        from: "2026-05-20",
        to: "2026-05-27",
        alternateRooms: ["palace-deluxe"],
        alternateDates: [
          { from: "2026-05-15", to: "2026-05-19" },
          { from: "2026-05-28", to: "2026-06-02" },
        ],
      },
    ],
  },
];

// ============================================================
// HELPERS
// ============================================================

export function getRoomBySlug(slug: string): Room | undefined {
  return ROOMS.find((r) => r.slug === slug);
}

/** Returns true if the given range overlaps any unavailable range for the room */
export function isDateRangeUnavailable(
  room: Room,
  checkIn: Date,
  checkOut: Date
): UnavailableDateRange | null {
  for (const range of room.unavailableDates) {
    const from = new Date(range.from);
    const to = new Date(range.to);
    if (checkIn <= to && checkOut >= from) {
      return range;
    }
  }
  return null;
}
