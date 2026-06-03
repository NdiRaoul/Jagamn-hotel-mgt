import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import {
  createSupabaseServerClient,
  supabaseAdmin,
} from "@/lib/supabase-server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-05-27.dahlia",
});

export async function POST(request: NextRequest) {
  try {
    const { setupIntentId } = await request.json();

    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const intent = await stripe.setupIntents.retrieve(setupIntentId);
    if (intent.status !== "succeeded") {
      return NextResponse.json(
        { error: `SetupIntent status is ${intent.status}, not succeeded` },
        { status: 400 },
      );
    }

    const pmId = intent.payment_method as string;
    const pm = await stripe.paymentMethods.retrieve(pmId);

    // Check if this card is already saved for this user
    const { data: existing } = await supabaseAdmin
      .from("payment_methods")
      .select("id")
      .eq("user_id", user.id)
      .eq("stripe_pm_id", pmId)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ success: true, duplicate: true });
    }

    // Count existing methods to set is_default correctly
    const { count } = await supabaseAdmin
      .from("payment_methods")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id);

    const brand = pm.card?.brand ?? "card";
    const last4 = pm.card?.last4 ?? "????";
    const expMonth = pm.card?.exp_month;
    const expYear = pm.card?.exp_year;

    const { error } = await supabaseAdmin.from("payment_methods").insert({
      user_id: user.id,
      method_type: "card",
      label: `${brand.charAt(0).toUpperCase() + brand.slice(1)} •••• ${last4}`,
      card_last4: last4,
      card_brand: brand,
      card_expiry:
        expMonth && expYear
          ? `${String(expMonth).padStart(2, "0")}/${String(expYear).slice(-2)}`
          : null,
      card_holder_name: pm.billing_details?.name ?? null,
      stripe_pm_id: pmId,
      is_default: (count ?? 0) === 0, // first card becomes default
    });

    if (error) {
      console.error("[save-method] db error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error("[save-method] error:", err);
    const message =
      err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
