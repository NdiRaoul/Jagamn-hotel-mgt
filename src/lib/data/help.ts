import { supabaseAdmin } from "@/lib/supabase-server";
import { getCached } from "@/lib/redis/cache";

export interface HelpArticle {
  id: string;
  role: string | null;
  slug: string;
  title: string;
  body: string;
  category: string | null;
  sort_order: number;
}

/**
 * Active help articles for a portal: those scoped to `role` plus global
 * (role IS NULL) articles, ordered by category then sort order.
 *
 * `role` is always a trusted literal from our own pages ("kitchen",
 * "reception", "account", "storekeeper") — never user input.
 */
export async function getHelpArticles(role: string): Promise<HelpArticle[]> {
  // Help content changes rarely, so serve it through the shared cache-aside
  // layer (Redis → Next cache → Supabase). Edits become visible within the TTL;
  // an admin editor should call invalidate(`help:role:${role}`) for immediacy.
  const cached = await getCached<HelpArticle[]>(
    `help:role:${role}`,
    120,
    async () => {
      const { data, error } = await supabaseAdmin
        .from("help_articles")
        .select("id, role, slug, title, body, category, sort_order")
        .or(`role.eq.${role},role.is.null`)
        .eq("is_active", true)
        .order("category", { ascending: true })
        .order("sort_order", { ascending: true });

      if (error) {
        console.error("[getHelpArticles] error:", error);
        return [];
      }
      return (data ?? []) as HelpArticle[];
    },
  );

  return cached ?? [];
}
