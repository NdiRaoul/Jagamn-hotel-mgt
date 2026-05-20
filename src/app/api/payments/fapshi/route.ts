import { NextRequest, NextResponse } from "next/server";

const BASE = process.env.FAPSHI_BASE_URL || "https://sandbox.fapshi.com";
const API_USER = process.env.FAPSHI_API_USER || "";
const API_KEY = process.env.FAPSHI_API_KEY || "";

function fapshiHeaders() {
  return {
    "Content-Type": "application/json",
    apiuser: API_USER,
    apikey: API_KEY,
  };
}

function guardCreds(): NextResponse | null {
  if (!API_USER || !API_KEY) {
    console.error(
      "[fapshi] FAPSHI_API_USER or FAPSHI_API_KEY env vars are not set",
    );
    return NextResponse.json(
      {
        error:
          "Fapshi credentials not configured. Set FAPSHI_API_USER and FAPSHI_API_KEY in Vercel.",
      },
      { status: 500 },
    );
  }
  return null;
}

// Normalise medium to exactly what Fapshi sandbox expects
function normaliseMedium(raw: string): string {
  const lower = raw.toLowerCase();
  if (lower.includes("mtn")) return "MTN Mobile Money";
  if (lower.includes("orange")) return "Orange Money";
  return raw;
}

// POST /api/payments/fapshi
// body: { amount, phone, medium, bookingRef, email?, name?, mode? }
// mode = "direct" (default) — pushes USSD prompt to phone
// mode = "initiate" — returns a payment link the user opens themselves
export async function POST(request: NextRequest) {
  const guard = guardCreds();
  if (guard) return guard;

  try {
    const body = await request.json();
    const {
      amount,
      phone,
      medium,
      bookingRef,
      email,
      name,
      mode = "direct",
    } = body;

    if (!amount || !bookingRef) {
      return NextResponse.json(
        { error: "amount and bookingRef are required" },
        { status: 400 },
      );
    }

    // Convert USD → XAF (1 USD ≈ 615 XAF), Fapshi minimum is 100 XAF
    const xafAmount = Math.max(100, Math.round(amount * 615));

    if (mode === "initiate") {
      // initiate-pay: generates a hosted payment link (no phone required)
      const payload: Record<string, unknown> = {
        amount: xafAmount,
        externalId: bookingRef,
        message: "Jagamn Palace Booking",
        redirectUrl: `${
          process.env.NEXT_PUBLIC_APP_URL ||
          "https://jagamnhotelpalace.vercel.app"
        }/booking/confirmed`,
      };
      if (email) payload.email = email;
      if (name) payload.name = name;

      const res = await fetch(`${BASE}/initiate-pay`, {
        method: "POST",
        headers: fapshiHeaders(),
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        console.error("[fapshi initiate-pay] error:", data);
        return NextResponse.json(
          { error: data.message || "Fapshi initiate-pay failed" },
          { status: res.status },
        );
      }
      return NextResponse.json(data); // { transId, link }
    }

    // direct-pay: pushes USSD prompt to phone (requires phone + medium)
    if (!phone || !medium) {
      return NextResponse.json(
        { error: "phone and medium are required for direct pay" },
        { status: 400 },
      );
    }

    const payload = {
      amount: xafAmount,
      phone,
      medium: normaliseMedium(medium),
      externalId: bookingRef,
      message: "Jagamn Palace Booking",
      ...(email ? { email } : {}),
      ...(name ? { name } : {}),
    };

    const res = await fetch(`${BASE}/direct-pay`, {
      method: "POST",
      headers: fapshiHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      console.error("[fapshi direct-pay] error:", data);
      return NextResponse.json(
        { error: data.message || "Fapshi direct-pay failed" },
        { status: res.status },
      );
    }
    return NextResponse.json(data); // { transId }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[POST /api/payments/fapshi] error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// GET /api/payments/fapshi?transId=xxx  — poll payment status
export async function GET(request: NextRequest) {
  const guard = guardCreds();
  if (guard) return guard;

  const { searchParams } = new URL(request.url);
  const transId = searchParams.get("transId");

  if (!transId) {
    return NextResponse.json({ error: "transId is required" }, { status: 400 });
  }

  try {
    const res = await fetch(`${BASE}/payment-status/${transId}`, {
      headers: fapshiHeaders(),
    });
    const data = await res.json();
    if (!res.ok) {
      return NextResponse.json(
        { error: data.message || "Failed to fetch payment status" },
        { status: res.status },
      );
    }
    return NextResponse.json(data);
    // Fapshi returns: { status: "SUCCESSFUL" | "FAILED" | "PENDING" | "EXPIRED", transId, amount, ... }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[GET /api/payments/fapshi] error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
