import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";

// Fapshi sends a POST with { transId, status, externalId, amount }
// status values: "SUCCESSFUL" | "FAILED" | "EXPIRED"
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { transId, status, externalId: bookingRef, amount } = body;

    console.log("[fapshi webhook]", { transId, status, bookingRef, amount });

    if (!transId || !status) {
      return NextResponse.json(
        { error: "Missing transId or status" },
        { status: 400 },
      );
    }

    if (status === "SUCCESSFUL") {
      // 1. Update booking
      const { data: booking } = await supabaseAdmin
        .from("bookings")
        .update({ payment_status: "paid", status: "confirmed" })
        .eq("booking_ref", bookingRef)
        .select("id, user_id, total_amount")
        .single();

      // 2. Upsert payment record
      if (booking) {
        await supabaseAdmin.from("payments").upsert(
          {
            booking_id: booking.id,
            booking_ref: bookingRef,
            user_id: booking.user_id,
            amount: booking.total_amount,
            currency: "XAF",
            payment_method: "mobile_money",
            provider: "fapshi",
            provider_tx_id: transId,
            fapshi_trans_id: transId,
            status: "paid",
          },
          { onConflict: "fapshi_trans_id" },
        );
      }
    } else if (status === "FAILED" || status === "EXPIRED") {
      await supabaseAdmin
        .from("bookings")
        .update({ payment_status: "failed" })
        .eq("booking_ref", bookingRef);
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error("[fapshi webhook] error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
