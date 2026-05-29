import { getFoodAndBeverageSummary } from "@/lib/data/admin";
import FBClient from "./fb-client";

export const dynamic = "force-dynamic";

export default async function FBManagementPage() {
  let data: Awaited<ReturnType<typeof getFoodAndBeverageSummary>> = {
    items: [],
    totalItems: 0,
    outOfStock: 0,
  };
  let error: string | null = null;

  try {
    data = await getFoodAndBeverageSummary();
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load F&B data";
  }

  return <FBClient summary={data} error={error} />;
}
