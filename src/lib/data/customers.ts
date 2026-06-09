import { supabaseAdmin } from "@/lib/supabase-server";

export interface CustomerBooking {
  booking_ref: string;
  check_in: string;
  check_out: string;
  total_amount: number; // whole XAF
  payment_status: string;
  status: string;
}

export interface CustomerRow {
  id: string;
  full_name: string | null;
  email: string;
  phone: string | null;
  role: string; // 'member' | 'guest'
  loyalty_tier: string;
  has_account: boolean; // auth_user_id present
  booking_count: number;
  returning: boolean; // more than one booking
  total_spent: number; // whole XAF across paid/confirmed bookings
  last_booking_at: string | null;
  created_at: string;
  bookings: CustomerBooking[];
}

export interface CustomersResult {
  rows: CustomerRow[];
  overview: {
    total: number;
    members: number;
    guests: number;
    returning: number;
    withAccount: number;
  };
}

const EMPTY_RESULT: CustomersResult = {
  rows: [],
  overview: { total: 0, members: 0, guests: 0, returning: 0, withAccount: 0 },
};

export async function getCustomers(): Promise<CustomersResult> {
  const [usersRes, bookingsRes] = await Promise.all([
    supabaseAdmin
      .from("users")
      .select(
        "id,auth_user_id,full_name,email,phone,role,loyalty_tier,created_at",
      )
      .order("created_at", { ascending: false }),
    supabaseAdmin
      .from("bookings")
      .select(
        "booking_ref,app_user_id,guest_email,guest_name,guest_phone,check_in,check_out,total_amount,payment_status,status,created_at",
      )
      .order("created_at", { ascending: false }),
  ]);

  if (usersRes.error || bookingsRes.error) {
    console.error(
      "[getCustomers] query error:",
      usersRes.error ?? bookingsRes.error,
    );
    return EMPTY_RESULT;
  }

  const users = usersRes.data;
  const bookings = bookingsRes.data;

  // Index bookings by user id and by email so guests (no account) match too.
  const byUserId = new Map<string, any[]>();
  const byEmail = new Map<string, any[]>();
  for (const b of bookings ?? []) {
    if (b.app_user_id) {
      byUserId.set(b.app_user_id, [...(byUserId.get(b.app_user_id) ?? []), b]);
    }
    if (b.guest_email) {
      const key = b.guest_email.toLowerCase();
      byEmail.set(key, [...(byEmail.get(key) ?? []), b]);
    }
  }

  const rows: CustomerRow[] = (users ?? []).map((u: any) => {
    const seen = new Set<string>();
    const list: any[] = [];
    for (const b of byUserId.get(u.id) ?? []) {
      if (!seen.has(b.booking_ref)) {
        seen.add(b.booking_ref);
        list.push(b);
      }
    }
    for (const b of byEmail.get((u.email ?? "").toLowerCase()) ?? []) {
      if (!seen.has(b.booking_ref)) {
        seen.add(b.booking_ref);
        list.push(b);
      }
    }
    list.sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );

    const totalSpent = list
      .filter((b) => b.payment_status === "paid")
      .reduce((sum, b) => sum + (b.total_amount ?? 0), 0);

    return {
      id: u.id,
      full_name: u.full_name,
      email: u.email,
      phone: u.phone,
      role: u.role,
      loyalty_tier: u.loyalty_tier ?? "standard",
      has_account: !!u.auth_user_id,
      booking_count: list.length,
      returning: list.length > 1,
      total_spent: totalSpent,
      last_booking_at: list[0]?.created_at ?? null,
      created_at: u.created_at,
      bookings: list.slice(0, 10).map((b) => ({
        booking_ref: b.booking_ref,
        check_in: b.check_in,
        check_out: b.check_out,
        total_amount: b.total_amount ?? 0,
        payment_status: b.payment_status,
        status: b.status,
      })),
    };
  });

  // ── Synthesize guest rows for bookings with no matching users row ──────────
  // (walk-ins booked before B.2.1 landed, legacy/dining-only guests, etc.)
  // Dedupe by lowercased email against the real users rows we already built.
  const accountedEmails = new Set(
    (users ?? [])
      .map((u: any) => (u.email ?? "").toLowerCase())
      .filter(Boolean),
  );

  for (const [emailLower, list] of byEmail) {
    if (!emailLower || accountedEmails.has(emailLower)) continue;

    const sorted = [...list].sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
    const latest = sorted[0];
    const totalSpent = sorted
      .filter((b) => b.payment_status === "paid")
      .reduce((sum, b) => sum + (b.total_amount ?? 0), 0);

    rows.push({
      id: `guest:${emailLower}`,
      full_name: latest?.guest_name ?? null,
      email: latest?.guest_email ?? emailLower,
      phone: latest?.guest_phone ?? null,
      role: "guest",
      loyalty_tier: "standard",
      has_account: false,
      booking_count: sorted.length,
      returning: sorted.length > 1,
      total_spent: totalSpent,
      last_booking_at: latest?.created_at ?? null,
      created_at: sorted[sorted.length - 1]?.created_at ?? latest?.created_at,
      bookings: sorted.slice(0, 10).map((b) => ({
        booking_ref: b.booking_ref,
        check_in: b.check_in,
        check_out: b.check_out,
        total_amount: b.total_amount ?? 0,
        payment_status: b.payment_status,
        status: b.status,
      })),
    });
  }

  rows.sort(
    (a, b) =>
      new Date(b.created_at ?? 0).getTime() -
      new Date(a.created_at ?? 0).getTime(),
  );

  return {
    rows,
    overview: {
      total: rows.length,
      members: rows.filter((r) => r.role === "member").length,
      guests: rows.filter((r) => r.role !== "member").length,
      returning: rows.filter((r) => r.returning).length,
      withAccount: rows.filter((r) => r.has_account).length,
    },
  };
}
