import { NextRequest, NextResponse } from "next/server";
import { enqueueReconcile } from "@/lib/redis/reconcile";

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

// Normalise medium to exactly what Fapshi expects (lowercase, as per Fapshi docs):
// "mobile money" for MTN, "orange money" for Orange
function normaliseMedium(raw: string): string {
  const lower = raw.toLowerCase();
  if (lower.includes("mtn") || lower === "mobile money") return "mobile money";
  if (lower.includes("orange")) return "orange money";
  return raw;
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

  // Log only non-sensitive fields — never log phone numbers or email addresses
  console.log("[fapshi POST] request:", {
    amount,
    medium,
    bookingRef,
    mode,
    hasPhone: !!phone,
    hasEmail: !!email,
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
    `[fapshi POST] converted amount: ${amount} USD → ${xafAmount} XAF`,
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

      console.log("[fapshi POST] initiate-pay:", {
        amount: xafAmount,
        bookingRef,
        hasEmail: !!email,
        hasName: !!name,
      });

      const res = await fetch(`${BASE}/initiate-pay`, {
        method: "POST",
        headers: fapshiHeaders(),
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      console.log(`[fapshi POST] initiate-pay response status=${res.status}`);

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
      console.error("[fapshi POST] direct-pay missing phone or medium");
      return NextResponse.json(
        { error: "phone and medium are required for direct pay" },
        { status: 400 },
      );
    }

    // Fapshi requires exact lowercase values: "mobile money" (MTN) or "orange money" (Orange).
    // The phone must be a bare 9-digit Cameroonian number — no +237, no spaces.
    const normalisedMedium = normaliseMedium(medium);

    // Log only non-sensitive fields — never log phone numbers
    console.log("[fapshi POST] direct-pay:", {
      amount: xafAmount,
      rawMedium: medium,
      normalisedMedium,
      bookingRef,
    });

    const payload = {
      amount: xafAmount,
      // phone must be bare 9-digit local number (e.g. "676982949"), no +237, no spaces
      phone,
      // medium must be lowercase "mobile money" or "orange money" per Fapshi docs
      medium: normalisedMedium,
      externalId: bookingRef,
      message: "Jagamn Palace Booking",
      ...(email ? { email } : {}),
      ...(name ? { name } : {}),
    };

    console.log(`[fapshi POST] calling ${BASE}/direct-pay`);

    const res = await fetch(`${BASE}/direct-pay`, {
      method: "POST",
      headers: fapshiHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await res.json();

    console.log(`[fapshi POST] direct-pay response status=${res.status}`);

    if (!res.ok) {
      return NextResponse.json(
        { error: data.message || "Fapshi direct-pay failed" },
        { status: res.status },
      );
    }

    // Enqueue for opportunistic reconciliation (Fix 2).
    // If the webhook is missed and the guest closes the browser, the queue
    // drain will poll Fapshi and self-heal the booking.
    if (bookingRef && data.transId) {
      enqueueReconcile({
        bookingId: "", // bookingId not available here; bookingRef is sufficient
        bookingRef,
        provider: "fapshi",
        transactionId: data.transId as string,
      }).catch(() => {}); // fire-and-forget
    }

    return NextResponse.json(data); // { transId }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[fapshi POST] unexpected error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// GET /api/payments/fapshi?transId=xxx[&bookingRef=JP-xxx]
// Polls Fapshi for live payment status.
//
// FIX 1 — RECONCILE-ON-READ:
// If the local booking is still "pending" but Fapshi reports SUCCESSFUL,
// we confirm the booking right here using the same idempotent logic the
// webhook uses. This self-heals missed webhooks the moment anyone polls
// the status (the booking page polls every 5 s while the guest is waiting).
//
// If Fapshi reports FAILED/EXPIRED, we expire the booking immediately.
//
// The dedup guard (isEventProcessed / markEventProcessed) ensures this
// path and the webhook path cannot double-confirm or double-send email.
export async function GET(request: NextRequest) {
  const guard = guardCreds();
  if (guard) return guard;

  const { searchParams } = new URL(request.url);
  const transId = searchParams.get("transId");
  const bookingRef = searchParams.get("bookingRef");

  if (!transId) {
    return NextResponse.json({ error: "transId is required" }, { status: 400 });
  }

  console.log(`[fapshi GET] polling status for transId=${transId}`);

  try {
    const res = await fetch(`${BASE}/payment-status/${transId}`, {
      headers: fapshiHeaders(),
    });
    const data = (await res.json()) as {
      status?: string;
      transId?: string;
      amount?: number;
      [key: string]: unknown;
    };

    if (!res.ok) {
      return NextResponse.json(
        { error: data.message || "Failed to fetch payment status" },
        { status: res.status },
      );
    }

    // ── Reconcile-on-read ────────────────────────────────────────────────────
    // Only attempt reconciliation when we have a bookingRef to act on.
    if (bookingRef && data.status) {
      if (data.status === "SUCCESSFUL") {
        try {
          const { confirmBookingFromPayment } =
            await import("@/lib/payments/confirm-booking");
          await confirmBookingFromPayment({
            provider: "fapshi",
            eventKey: `${transId}:SUCCESSFUL`,
            bookingRef,
            transactionId: transId,
            amount: data.amount,
            currency: "XAF",
            paymentMethod: "mobile_money",
          });
        } catch (reconcileErr) {
          // Log but don't fail the status response — the client still gets
          // the live Fapshi status and can retry.
          console.error("[fapshi GET] reconcile-on-read error:", reconcileErr);
        }
      } else if (data.status === "FAILED" || data.status === "EXPIRED") {
        try {
          const { expireBooking } =
            await import("@/lib/payments/confirm-booking");
          await expireBooking({ bookingRef, transactionId: transId });
        } catch (expireErr) {
          console.error("[fapshi GET] expire-on-read error:", expireErr);
        }
      }
    }

    // Return the live Fapshi status to the client unchanged
    return NextResponse.json(data);
    // Fapshi returns: { status: "SUCCESSFUL" | "FAILED" | "PENDING" | "EXPIRED", transId, amount, ... }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[fapshi GET] unexpected error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
