import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import {
  createSupabaseServerClient,
  supabaseAdmin,
} from "@/lib/supabase-server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-04-22.dahlia" as Stripe.LatestApiVersion,
});

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Fetch user profile for Stripe customer lookup
    const { data: profile } = await supabaseAdmin
      .from("users")
      .select("stripe_customer_id, email, full_name")
      .eq("auth_user_id", user.id)
      .single();

    let customerId = profile?.stripe_customer_id;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: profile?.email ?? user.email,
        name: profile?.full_name ?? undefined,
        metadata: { supabase_user_id: user.id },
      });
      customerId = customer.id;
      await supabaseAdmin
        .from("users")
        .update({ stripe_customer_id: customerId })
        .eq("auth_user_id", user.id);
    }

    const setupIntent = await stripe.setupIntents.create({
      customer: customerId,
      usage: "off_session",
    });

    return NextResponse.json({ clientSecret: setupIntent.client_secret });
  } catch (err: any) {
    console.error("[setup-intent] error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
