import { getRevenueSummary, getRevenueDaily, getRevenueByRoomType } from "@/lib/data/admin";
import { getTransactions } from "@/lib/data/reception";
import { requireOwner } from "@/lib/auth/guard";
import RevenueClient from "./revenue-client";

export const dynamic = "force-dynamic";

export default async function RevenuePage() {
  await requireOwner();

  const [revenue, transactions, revenueDaily, revenueByRoomType] = await Promise.all([
    getRevenueSummary(),
    getTransactions(),
    getRevenueDaily(),
    getRevenueByRoomType(),
  ]);

  return (
    <RevenueClient
      revenue={revenue}
      transactions={transactions}
      revenueDaily={revenueDaily}
      revenueByRoomType={revenueByRoomType}
    />
  );
}
