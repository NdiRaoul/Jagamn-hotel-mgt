import { getRevenueSummary } from "@/lib/data/admin";
import { getTransactions } from "@/lib/data/reception";
import RevenueClient from "./revenue-client";

export const dynamic = "force-dynamic";

export default async function RevenuePage() {
  let revenue = { revenue: 0, settledPayments: 0, pendingPayments: 0 };
  let transactions: Awaited<ReturnType<typeof getTransactions>> = [];
  let error: string | null = null;

  try {
    [revenue, transactions] = await Promise.all([
      getRevenueSummary(),
      getTransactions(),
    ]);
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load revenue data";
  }

  return (
    <RevenueClient revenue={revenue} transactions={transactions} error={error} />
  );
}
