import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseAdmin } from "@/lib/supabase-server";
import { isEventProcessed, markEventProcessed } from "@/lib/redis/webhook";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-05-27.dahlia",
});

const WEBHOOK_SECRET = process.env.STRIPE_CONNECT_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get("stripe-signature");

    if (!signature) {
      return NextResponse.json(
        { error: "Missing stripe-signature header" },
        { status: 400 },
      );
    }

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, WEBHOOK_SECRET);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      console.error(
        "[Stripe Connect webhook] signature verification failed:",
        message,
      );
      return NextResponse.json(
        { error: `Webhook signature verification failed: ${message}` },
        { status: 400 },
      );
    }

    // Check for duplicate
    const isDuplicate = await isEventProcessed("stripe_connect", event.id);
    if (isDuplicate) {
      console.log(
        `[Stripe Connect webhook] Duplicate event ${event.id}, skipping`,
      );
      return NextResponse.json({ received: true, duplicate: true });
    }

    console.log(`[Stripe Connect webhook] Processing event: ${event.type}`);

    // Handle different event types
    switch (event.type) {
      case "account.updated": {
        const account = event.data.object as Stripe.Account;

        // Update staff_payout_accounts
        const { data: payoutAccount } = await supabaseAdmin
          .from("staff_payout_accounts")
          .select("*")
          .eq("stripe_account_id", account.id)
          .single();

        if (payoutAccount) {
          const isVerified =
            account.charges_enabled &&
            account.payouts_enabled &&
            account.details_submitted;

          await supabaseAdmin
            .from("staff_payout_accounts")
            .update({
              is_verified: isVerified,
              stripe_status: isVerified ? "active" : "pending",
              updated_at: new Date().toISOString(),
            })
            .eq("id", payoutAccount.id);

          console.log(
            `[Stripe Connect webhook] Updated account ${account.id}, verified: ${isVerified}`,
          );
        }
        break;
      }

      case "payout.paid": {
        const payout = event.data.object as Stripe.Payout;

        // Find payroll items with this payout reference
        const { data: items } = await supabaseAdmin
          .from("payroll_items")
          .select("*")
          .eq("payment_ref", payout.id);

        if (items && items.length > 0) {
          for (const item of items) {
            await supabaseAdmin
              .from("payroll_items")
              .update({
                payment_status: "paid",
                paid_at: new Date(payout.arrival_date * 1000).toISOString(),
                updated_at: new Date().toISOString(),
              })
              .eq("id", item.id);
          }

          console.log(
            `[Stripe Connect webhook] Marked ${items.length} items as paid for payout ${payout.id}`,
          );
        }
        break;
      }

      case "payout.failed": {
        const payout = event.data.object as Stripe.Payout;

        // Find payroll items with this payout reference
        const { data: items } = await supabaseAdmin
          .from("payroll_items")
          .select("*")
          .eq("payment_ref", payout.id);

        if (items && items.length > 0) {
          for (const item of items) {
            await supabaseAdmin
              .from("payroll_items")
              .update({
                payment_status: "failed",
                updated_at: new Date().toISOString(),
              })
              .eq("id", item.id);
          }

          console.log(
            `[Stripe Connect webhook] Marked ${items.length} items as failed for payout ${payout.id}`,
          );
        }
        break;
      }

      case "transfer.created":
      case "transfer.updated": {
        const transfer = event.data.object as Stripe.Transfer;

        // Update payroll item if metadata contains payroll_item_id
        if (transfer.metadata?.payroll_item_id) {
          const updates: {
            payment_ref: string;
            updated_at: string;
            payment_status?: string;
          } = {
            payment_ref: transfer.id,
            updated_at: new Date().toISOString(),
          };

          // If transfer is paid, mark item as processing
          if (transfer.reversed === false) {
            updates.payment_status = "processing";
          }

          await supabaseAdmin
            .from("payroll_items")
            .update(updates)
            .eq("id", transfer.metadata.payroll_item_id);

          console.log(
            `[Stripe Connect webhook] Updated payroll item ${transfer.metadata.payroll_item_id} for transfer ${transfer.id}`,
          );
        }
        break;
      }

      default:
        console.log(
          `[Stripe Connect webhook] Unhandled event type: ${event.type}`,
        );
    }

    // Mark as processed
    await markEventProcessed("stripe_connect", event.id);

    return NextResponse.json({ received: true });
  } catch (error: unknown) {
    console.error("[Stripe Connect webhook] error:", error);
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
