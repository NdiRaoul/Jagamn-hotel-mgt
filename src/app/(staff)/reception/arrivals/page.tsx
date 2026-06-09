import React from "react";
import { ArrowDownCircle, Search } from "lucide-react";
import { getArrivals } from "@/lib/data/reception";
import ArrivalsClient from "./arrivals-client";

export const dynamic = "force-dynamic";

export default async function ArrivalsPage() {
  const today = new Date().toISOString().slice(0, 10);
  const tomorrowDate = new Date();
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const tomorrow = tomorrowDate.toISOString().slice(0, 10);
  let arrivals: Awaited<ReturnType<typeof getArrivals>> = [];
  let error: string | null = null;

  try {
    // Today + next-day check-ins.
    arrivals = await getArrivals(today, tomorrow);
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load arrivals";
  }

  return <ArrivalsClient arrivals={arrivals} date={today} error={error} />;
}
