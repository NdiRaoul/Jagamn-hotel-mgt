import { NextRequest, NextResponse } from "next/server";
import {
  supabaseAdmin,
  createSupabaseServerClient,
} from "@/lib/supabase-server";

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { transId } = await request.json();

  if (!transId) {
    return NextResponse.json({ error: "transId is required" }, { status: 400 });
  }

  // Look up the payment row and verify the authenticated user owns it.
  // Never trust a client-supplied refund amount — use the stored amount.
  const { data: userRow } = await supabaseAdmin
    .from("users")
    .select("id")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (!userRow) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const { data: payment } = await supabaseAdmin
    .from("payments")
    .select("id, amount, fapshi_trans_id")
    .eq("fapshi_trans_id", transId)
    .eq("app_user_id", userRow.id)
    .maybeSingle();

  if (!payment) {
    // Either the payment doesn't exist or it belongs to a different user
    return NextResponse.json(
      { error: "Payment not found or access denied" },
      { status: 404 },
    );
  }

  try {
    // Refund the amount stored on the payment row — never the client-supplied figure.
    // Fapshi amounts are in XAF; the stored amount is already in XAF.
    const res = await fetch(`${process.env.FAPSHI_BASE_URL}/refund`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apiuser: process.env.FAPSHI_API_USER || "",
        apikey: process.env.FAPSHI_API_KEY || "",
      },
      body: JSON.stringify({
        transId,
        amount: payment.amount, // stored XAF amount — not client-supplied
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      console.error("[fapshi-refund] error:", data);
      return NextResponse.json(
        { error: "Refund failed. Please contact support." },
        { status: res.status },
      );
    }
    return NextResponse.json(data);
  } catch (err: unknown) {
    console.error("[fapshi-refund] unexpected error:", err);
    return NextResponse.json(
      { error: "Refund failed. Please contact support." },
      { status: 500 },
    );
  }
}
