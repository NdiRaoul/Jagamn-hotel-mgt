// ── Client-only Supabase client ─────────────────────────────────────────────
// This file is safe to import in Client Components for realtime subscriptions

import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
