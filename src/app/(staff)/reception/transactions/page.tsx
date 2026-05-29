import React from "react";
import { getTransactions } from "@/lib/data/reception";
import TransactionsClient from "./transactions-client";

export const dynamic = "force-dynamic";

export default async function TransactionsPage() {
  let transactions: Awaited<ReturnType<typeof getTransactions>> = [];
  let error: string | null = null;

  try {
    transactions = await getTransactions();
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load transactions";
  }

  return <TransactionsClient transactions={transactions} error={error} />;
}
