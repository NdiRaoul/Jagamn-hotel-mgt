
// ── Server-only Supabase clients ─────────────────────────────────────────────
// This file must ONLY be imported in:
//   - Server Components
//   - Route Handlers  (app/api/**/route.ts)
//   - Middleware
//   - Server Actions
// Never import this in Client Components — it will crash the browser bundle.

import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

// Session-aware server client — refreshes cookies on every request
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Called from a Server Component — safe to ignore
          }
        },
      },
    },
  );
}

// Route handler client for API routes.
// Next.js 16 made `cookies()` async, so this must be awaited by callers.
export async function createSupabaseRouteHandlerClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Called from a Route Handler — safe to ignore
          }
        },
      },
    },
  );
}

// Service-role admin client — bypasses RLS, never expose to browser
export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
);

// Idempotently ensure a public storage bucket exists before an upload. Storage
// buckets aren't created by schema.sql, so a fresh environment would otherwise
// fail with "Bucket not found". Safe to call on every upload — a re-create on
// an existing bucket is ignored.
export async function ensureBucket(bucket: string) {
  await supabaseAdmin.storage
    .createBucket(bucket, { public: true, fileSizeLimit: 4 * 1024 * 1024 })
    .catch(() => undefined);
}
