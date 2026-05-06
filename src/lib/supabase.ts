import { createBrowserClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL!;
const supabasePublishableKey = process.env.SUPABASE_PUBLISHABLE_KEY!;
const supabaseSecret = process.env.SUPABASE_SECRET!;

/**
 * Browser client — use in Client Components.
 * Uses the publishable (anon) key and handles cookies via @supabase/ssr.
 */
export const createSupabaseBrowserClient = () =>
  createBrowserClient(supabaseUrl, supabasePublishableKey);

/**
 * Server/admin client — use in Server Components, Route Handlers, and Server Actions.
 * Uses the secret key and bypasses Row Level Security.
 */
export const supabaseAdmin = createClient(supabaseUrl, supabaseSecret);
