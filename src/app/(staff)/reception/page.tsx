import React from "react";
import {
  getArrivals,
  getDepartures,
  getRoomBoard,
  getRecentTransactions,
} from "@/lib/data/reception";
import { getDashboardKpis } from "@/lib/data/admin";
import ReceptionOverviewClient from "./reception-overview-client";

export const dynamic = "force-dynamic";

export default async function ReceptionOverviewPage() {
  const today = new Date().toISOString().slice(0, 10);

  const [arrivals, departures, rooms, transactions, kpis] = await Promise.all([
    getArrivals(today).catch(() => []),
    getDepartures(today).catch(() => []),
    getRoomBoard().catch(() => []),
    getRecentTransactions().catch(() => []),
    getDashboardKpis().catch(() => []),
  ]);

  return (
    <ReceptionOverviewClient
      arrivals={arrivals}
      departures={departures}
      rooms={rooms}
      transactions={transactions}
      kpis={kpis}
    />
  );
}
