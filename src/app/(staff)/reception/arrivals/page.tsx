import React from "react";
import { ArrowDownCircle, Search } from "lucide-react";
import { getArrivals } from "@/lib/data/reception";
import ArrivalsClient from "./arrivals-client";

export const dynamic = "force-dynamic";

export default async function ArrivalsPage() {
  const today = new Date().toISOString().slice(0, 10);
  let arrivals: Awaited<ReturnType<typeof getArrivals>> = [];
  let error: string | null = null;

  try {
    arrivals = await getArrivals(today);
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load arrivals";
  }

  return <ArrivalsClient arrivals={arrivals} date={today} error={error} />;
}
