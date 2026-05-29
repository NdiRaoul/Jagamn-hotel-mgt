import { createBrowserClient } from "@supabase/ssr";

// ── Browser client (Client Components) ──────────────────────────────────────
// Safe to import anywhere — only uses NEXT_PUBLIC_ vars.
export const createSupabaseBrowserClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
