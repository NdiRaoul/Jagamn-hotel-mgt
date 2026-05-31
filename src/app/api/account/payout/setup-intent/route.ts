import { NextRequest, NextResponse } from "next/server";
import { getStaffSession } from "@/lib/auth/staff-session";
import { supabaseAdmin } from "@/lib/supabase-server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-04-22.dahlia" as Stripe.LatestApiVersion,
});

// POST /api/account/payout/setup-intent - Create Stripe Connect account and onboarding link
export async function POST(request: NextRequest) {
  const session = await getStaffSession();
  if (!session || session.status !== "active") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Check if staff already has a Stripe account
    const { data: existingAccount } = await supabaseAdmin
      .from("staff_payout_accounts")
      .select("*")
      .eq("staff_id", session.id)
      .eq("method", "stripe")
      .single();

    let stripeAccountId = existingAccount?.stripe_account_id;

    // Create Stripe Connect Express account if doesn't exist
    if (!stripeAccountId) {
      const account = await stripe.accounts.create({
        type: "express",
        country: "CM", // Cameroon
        email: session.email,
        capabilities: {
          transfers: { requested: true },
        },
        metadata: {
          staff_id: session.id,
          staff_name: session.full_name,
        },
      });

      stripeAccountId = account.id;

      // Store in database
      if (existingAccount) {
        await supabaseAdmin
          .from("staff_payout_accounts")
          .update({
            stripe_account_id: stripeAccountId,
            stripe_status: "pending",
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingAccount.id);
      } else {
        await supabaseAdmin.from("staff_payout_accounts").insert({
          staff_id: session.id,
          method: "stripe",
          stripe_account_id: stripeAccountId,
          stripe_status: "pending",
          is_verified: false,
          is_default: true,
        });
      }
    }

    // Create account link for onboarding
    const accountLink = await stripe.accountLinks.create({
      account: stripeAccountId,
      refresh_url: `${process.env.NEXT_PUBLIC_BASE_URL}/account/payout?refresh=true`,
      return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/account/payout?success=true`,
      type: "account_onboarding",
    });

    return NextResponse.json({
      url: accountLink.url,
      stripe_account_id: stripeAccountId,
    });
  } catch (error: any) {
    console.error("[POST /api/account/payout/setup-intent] error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
