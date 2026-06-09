import React from "react";
import { getDepartures } from "@/lib/data/reception";
import DeparturesClient from "./departures-client";

export const dynamic = "force-dynamic";

export default async function DeparturesPage() {
  const today = new Date().toISOString().slice(0, 10);
  const tomorrowDate = new Date();
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const tomorrow = tomorrowDate.toISOString().slice(0, 10);
  let departures: Awaited<ReturnType<typeof getDepartures>> = [];
  let error: string | null = null;

  try {
    // Today + next-day check-outs.
    departures = await getDepartures(today, tomorrow);
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load departures";
  }

  return (
    <DeparturesClient departures={departures} date={today} error={error} />
  );
}
