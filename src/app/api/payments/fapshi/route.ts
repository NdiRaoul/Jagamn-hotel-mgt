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

/**
 * Normalise a phone number to the E.164 format Fapshi expects.
 *
 * Handles all of these inputs:
 *   "676982949"          → "+237676982949"
 *   "+237676982949"      → "+237676982949"
 *   "237676982949"       → "+237676982949"
 *   "00237676982949"     → "+237676982949"
 *   "+1 650 555 1234"    → "+16505551234"  (non-CM numbers kept as-is)
 *
 * For Cameroonian numbers (9 digits starting with 6) the +237 country code
 * is always attached even if the caller omitted it.
 */
function normalisePhone(raw: string): string {
  // Strip all whitespace and dashes
  let digits = raw.replace(/[\s\-]/g, "");

  // Convert 00-prefix international format to +
  if (digits.startsWith("00")) {
    digits = "+" + digits.slice(2);
  }

  // Already has a + — return as-is (E.164)
  if (digits.startsWith("+")) {
    return digits;
  }

  // Starts with 237 (CM country code without +)
  if (digits.startsWith("237") && digits.length >= 12) {
    return "+" + digits;
  }

  // Bare 9-digit Cameroonian local number (starts with 6)
  if (/^6\d{8}$/.test(digits)) {
    return "+237" + digits;
  }

  // Fallback: prepend + and hope for the best
  return "+" + digits;
}

// POST /api/payments/fapshi
// body: { amount, phone, medium, bookingRef, email?, name?, mode? }
// mode = "direct" (default) — pushes USSD prompt to phone
// mode = "initiate" — returns a payment link the user opens themselves
export async function POST(request: NextRequest) {
  console.log("[fapshi POST] handler entered");

  const guard = guardCreds();
  if (guard) return guard;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    console.error("[fapshi POST] failed to parse request body");
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const {
    amount,
    phone,
    medium,
    bookingRef,
    email,
    name,
    mode = "direct",
  } = body as {
    amount?: number;
    phone?: string;
    medium?: string;
    bookingRef?: string;
    email?: string;
    name?: string;
    mode?: string;
  };

  console.log("[fapshi POST] parsed body:", {
    amount,
    phone,
    medium,
    bookingRef,
    email,
    name,
    mode,
  });

  if (!amount || !bookingRef) {
    console.error(
      "[fapshi POST] missing required fields: amount or bookingRef",
    );
    return NextResponse.json(
      { error: "amount and bookingRef are required" },
      { status: 400 },
    );
  }

  // Convert USD → XAF (1 USD ≈ 615 XAF), Fapshi minimum is 100 XAF
  const xafAmount = Math.max(100, Math.round((amount as number) * 615));
  console.log(
    `[fapshi POST] converted amount: $${amount} USD → ${xafAmount} XAF`,
  );

  try {
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

      console.log("[fapshi POST] initiate-pay payload:", payload);

      const res = await fetch(`${BASE}/initiate-pay`, {
        method: "POST",
        headers: fapshiHeaders(),
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      console.log(
        `[fapshi POST] initiate-pay response status=${res.status}:`,
        data,
      );

      if (!res.ok) {
        return NextResponse.json(
          { error: data.message || "Fapshi initiate-pay failed" },
          { status: res.status },
        );
      }
      return NextResponse.json(data); // { transId, link }
    }

    // direct-pay: pushes USSD prompt to phone (requires phone + medium)
    if (!phone || !medium) {
      console.error("[fapshi POST] direct-pay missing phone or medium:", {
        phone,
        medium,
      });
      return NextResponse.json(
        { error: "phone and medium are required for direct pay" },
        { status: 400 },
      );
    }

    const normalisedPhone = normalisePhone(phone);
    const normalisedMedium = normaliseMedium(medium);

    console.log("[fapshi POST] normalised values:", {
      rawPhone: phone,
      normalisedPhone,
      rawMedium: medium,
      normalisedMedium,
    });

    const payload = {
      amount: xafAmount,
      phone: normalisedPhone,
      medium: normalisedMedium,
      externalId: bookingRef,
      message: "Jagamn Palace Booking",
      ...(email ? { email } : {}),
      ...(name ? { name } : {}),
    };

    console.log("[fapshi POST] direct-pay payload:", payload);
    console.log(`[fapshi POST] calling ${BASE}/direct-pay`);

    const res = await fetch(`${BASE}/direct-pay`, {
      method: "POST",
      headers: fapshiHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await res.json();

    console.log(
      `[fapshi POST] direct-pay response status=${res.status}:`,
      data,
    );

    if (!res.ok) {
      return NextResponse.json(
        { error: data.message || "Fapshi direct-pay failed" },
        { status: res.status },
      );
    }
    return NextResponse.json(data); // { transId }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[fapshi POST] unexpected error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// GET /api/payments/fapshi?transId=xxx  — poll payment status
export async function GET(request: NextRequest) {
  console.log("[fapshi GET] handler entered");

  const guard = guardCreds();
  if (guard) return guard;

  const { searchParams } = new URL(request.url);
  const transId = searchParams.get("transId");

  if (!transId) {
    console.error("[fapshi GET] missing transId param");
    return NextResponse.json({ error: "transId is required" }, { status: 400 });
  }

  console.log(`[fapshi GET] polling status for transId=${transId}`);

  try {
    const res = await fetch(`${BASE}/payment-status/${transId}`, {
      headers: fapshiHeaders(),
    });
    const data = await res.json();

    console.log(
      `[fapshi GET] payment-status response status=${res.status}:`,
      data,
    );

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
    console.error("[fapshi GET] unexpected error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
