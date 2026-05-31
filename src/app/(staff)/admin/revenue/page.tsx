import {
  getRevenueSummary,
  getRevenueDaily,
  getRevenueMonthly,
  getRevenueByRoomType,
} from "@/lib/data/admin";
import { getTransactions } from "@/lib/data/reception";
import RevenueClient from "./revenue-client";

export const dynamic = "force-dynamic";

export default async function RevenuePage() {
  let revenue = { revenue: 0, settledPayments: 0, pendingPayments: 0 };
  let transactions: Awaited<ReturnType<typeof getTransactions>> = [];
  let revenueDaily: Awaited<ReturnType<typeof getRevenueDaily>> = [];
  let revenueByRoomType: Awaited<ReturnType<typeof getRevenueByRoomType>> = [];
  let error: string | null = null;

  try {
    [revenue, transactions, revenueDaily, revenueByRoomType] =
      await Promise.all([
        getRevenueSummary(),
        getTransactions(),
        getRevenueDaily(),
        getRevenueByRoomType(),
      ]);
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load revenue data";
  }

  return (
    <RevenueClient
      revenue={revenue}
      transactions={transactions}
      revenueDaily={revenueDaily}
      revenueByRoomType={revenueByRoomType}
      error={error}
    />
  );
}
