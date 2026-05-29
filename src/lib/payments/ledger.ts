import { supabaseAdmin } from "@/lib/supabase-server";
import type { PaymentLedger, PaymentEvent } from "@/types/database";

export type CreateLedgerInput = {
  clientIdempotencyKey: string;
  bookingRef: string;
  provider: "stripe" | "fapshi";
  amountMinor: number;
  currency: string;
};

export async function getOrCreateLedger({
  clientIdempotencyKey,
  bookingRef,
  provider,
  amountMinor,
  currency,
}: CreateLedgerInput): Promise<PaymentLedger> {
  const payload = {
    booking_ref: bookingRef,
    provider,
    amount_minor: amountMinor,
    currency,
    client_idempotency_key: clientIdempotencyKey,
    status: "pending",
  };

  const { data, error } = await supabaseAdmin
    .from("payment_ledger")
    .upsert(payload, { onConflict: "client_idempotency_key" })
    .select()
    .maybeSingle();

  if (error || !data) {
    throw error ?? new Error("Failed to get or create payment ledger");
  }

  return data as PaymentLedger;
}

export async function appendEvent(
  paymentId: string,
  type: string,
  opts?: {
    source?: string;
    amountMinor?: number;
    payload?: unknown;
  },
): Promise<PaymentEvent> {
  const { source, amountMinor, payload } = opts ?? {};
  const { data, error } = await supabaseAdmin
    .from("payment_events")
    .insert({
      payment_id: paymentId,
      type,
      source,
      amount_minor: amountMinor ?? null,
      payload: payload ? payload : null,
    })
    .select()
    .maybeSingle();

  if (error || !data) {
    throw error ?? new Error("Failed to append payment event");
  }

  return data as PaymentEvent;
}

export async function getStatus(paymentId: string): Promise<string | null> {
  const { data, error } = await supabaseAdmin.rpc("derive_payment_status", {
    p_payment_id: paymentId,
  });

  if (error) {
    console.error("[ledger] derive_payment_status error:", error);
    return null;
  }

  if (typeof data === "string") {
    return data;
  }

  if (data && typeof data === "object") {
    const values = Object.values(data);
    return values.length > 0 ? String(values[0]) : null;
  }

  return null;
}
