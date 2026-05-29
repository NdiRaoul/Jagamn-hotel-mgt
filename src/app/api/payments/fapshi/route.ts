import { NextRequest, NextResponse } from "next/server";

const FAPSHI_BASE_URL = process.env.FAPSHI_BASE_URL || "https://sandbox.fapshi.com";
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
    const { amount, phone, medium, bookingRef, email, name } = body;

    if (!amount || !phone || !medium || !bookingRef) {
      return NextResponse.json(
        { error: "amount, phone, medium, and bookingRef are required" },
        { status: 400 }
      );
    }

    // Convert USD to XAF (1 USD ≈ 615 XAF), minimum 100 XAF
    const xafAmount = Math.max(100, Math.round(amount * 615));

    const payload = {
      amount: xafAmount,
      phone,
      medium,
      externalId: bookingRef,
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
        { status: response.status }
      );
    }

    return NextResponse.json(data);
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
    const response = await fetch(
      `${FAPSHI_BASE_URL}/payment-status/${transId}`,
      { headers: fapshiHeaders }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.message || "Failed to fetch payment status" },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (err: any) {
    console.error("[GET /api/payments/fapshi] error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
