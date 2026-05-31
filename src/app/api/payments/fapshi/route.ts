import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import {
  getOrCreateLedger,
  appendEvent,
  getStatus,
} from "@/lib/payments/ledger";
import {
  confirmBookingFromPayment,
  expireBooking,
} from "@/lib/payments/confirm-booking";

const FAPSHI_BASE_URL =
  process.env.FAPSHI_BASE_URL || "https://sandbox.fapshi.com";
const FAPSHI_API_USER = process.env.FAPSHI_API_USER || "";
const FAPSHI_API_KEY = process.env.FAPSHI_API_KEY || "";

const fapshiHeaders = {
  "Content-Type": "application/json",
  apiuser: FAPSHI_API_USER,
  apikey: FAPSHI_API_KEY,
};

// POST /api/payments/fapshi — initiate direct-pay
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      amount,
      phone,
      medium,
      bookingRef,
      email,
      name,
      clientIdempotencyKey,
    } = body;

    if (!amount || !phone || !medium || !bookingRef || !clientIdempotencyKey) {
      return NextResponse.json(
        {
          error:
            "amount, phone, medium, bookingRef and clientIdempotencyKey are required",
        },
        { status: 400 },
      );
    }

    // Fapshi is XAF-native. `amount` from the client is whole XAF.
    const amountXaf = Math.max(100, Math.round(amount));
    const amountMinor = amountXaf * 100;

    const ledger = await getOrCreateLedger({
      bookingRef,
      provider: "fapshi",
      amountMinor,
      currency: "XAF",
      clientIdempotencyKey,
    });

    if (ledger.processor_ref) {
      return NextResponse.json({
        transId: ledger.processor_ref,
        paymentId: ledger.id,
      });
    }

    await appendEvent(ledger.id, "intent_created", { source: "server" });

    const payload = {
      amount: amountXaf,
      phone,
      medium,
      externalId: ledger.id,
      message: "Jagamn Palace Booking",
      email: email || undefined,
      name: name || undefined,
    };

    const response = await fetch(`${FAPSHI_BASE_URL}/direct-pay`, {
      method: "POST",
      headers: fapshiHeaders,
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.message || "Fapshi payment initiation failed" },
        { status: response.status },
      );
    }

    const transId = data.transId || data.trans_id || data.trans;
    if (!transId) {
      return NextResponse.json(
        { error: "Fapshi response did not include transId" },
        { status: 500 },
      );
    }

    await supabaseAdmin
      .from("payment_ledger")
      .update({ processor_ref: transId })
      .eq("id", ledger.id);

    await appendEvent(ledger.id, "authorization_pending", {
      source: "server",
      payload: data,
    });

    return NextResponse.json({
      ...data,
      transId,
      paymentId: ledger.id,
    });
  } catch (err: any) {
    console.error("[POST /api/payments/fapshi] error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// GET /api/payments/fapshi?transId=xxx — check payment status
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const transId = searchParams.get("transId");

  if (!transId) {
    return NextResponse.json({ error: "transId is required" }, { status: 400 });
  }

  try {
    const { data: ledger } = await supabaseAdmin
      .from("payment_ledger")
      .select("*")
      .eq("processor_ref", transId)
      .maybeSingle();

    const response = await fetch(
      `${FAPSHI_BASE_URL}/payment-status/${transId}`,
      { headers: fapshiHeaders },
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.message || "Failed to fetch payment status" },
        { status: response.status },
      );
    }

    if (ledger && ledger.id) {
      const paymentId = ledger.id;
      const status = String(data.status || "").toUpperCase();

      if (status === "SUCCESSFUL") {
        await appendEvent(paymentId, "processor_succeeded", {
          source: "poll",
          payload: data,
        });

        await confirmBookingFromPayment({
          provider: "fapshi",
          eventKey: `${transId}:SUCCESSFUL`,
          bookingRef: ledger.booking_ref,
          transactionId: transId,
          amount: typeof data.amount === "number" ? data.amount : undefined,
          currency: "XAF",
          paymentMethod: "mobile_money",
          paymentId,
        });
      } else if (status === "FAILED" || status === "EXPIRED") {
        await appendEvent(paymentId, "processor_failed", {
          source: "poll",
          payload: data,
        });
        await expireBooking({
          bookingRef: ledger.booking_ref,
          transactionId: transId,
        });
      }

      const ledgerStatus = await getStatus(paymentId);
      return NextResponse.json({ ...data, paymentId, ledgerStatus });
    }

    return NextResponse.json(data);
  } catch (err: any) {
    console.error("[GET /api/payments/fapshi] error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
