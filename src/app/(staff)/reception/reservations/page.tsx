import React from "react";
import { getActiveReservations } from "@/lib/data/reception";
import ReservationsClient from "./reservations-client";

export const dynamic = "force-dynamic";

export default async function ActiveReservationsPage() {
  let reservations: Awaited<ReturnType<typeof getActiveReservations>> = [];
  let error: string | null = null;

  try {
    reservations = await getActiveReservations();
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load reservations";
  }

  return <ReservationsClient reservations={reservations} error={error} />;
}
