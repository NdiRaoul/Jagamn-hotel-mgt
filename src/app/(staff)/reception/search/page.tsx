import { searchFrontDesk } from "@/lib/data/reception";
import SearchClient from "./search-client";

export const dynamic = "force-dynamic";

export default async function FindReservationPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = (q ?? "").trim();

  let results: Awaited<ReturnType<typeof searchFrontDesk>> = [];
  let searchError: string | null = null;

  if (query) {
    try {
      results = await searchFrontDesk(query);
    } catch (e) {
      searchError = e instanceof Error ? e.message : "Search failed";
    }
  }

  return (
    <SearchClient
      initialQuery={query}
      results={results}
      searchError={searchError}
    />
  );
}
