import { NextRequest, NextResponse } from "next/server";
import { getStaffSession } from "@/lib/auth/staff-session";
import { supabaseAdmin } from "@/lib/supabase-server";
import Stripe from "stripe";

const ALLOWED_ROLES = ["owner", "admin", "manager"];

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-04-22.dahlia" as Stripe.LatestApiVersion,
});

async function requireAuthorized() {
  const session = await getStaffSession();
  if (!session || session.status !== "active") {
    return { error: "Unauthorized", status: 401 };
  }
  if (!ALLOWED_ROLES.includes(session.role)) {
    return { error: "Forbidden", status: 403 };
  }
  return { session };
}

// POST /api/admin/payroll/pay - Pay one or more payroll items
export async function POST(request: NextRequest) {
  const auth = await requireAuthorized();
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const body = await request.json();
    const { itemIds, payment_date } = body;

    if (!itemIds || !Array.isArray(itemIds) || itemIds.length === 0) {
      return NextResponse.json(
        { error: "itemIds array is required" },
        { status: 400 },
      );
    }

    const paymentDate = payment_date || new Date().toISOString();
    const results: any[] = [];

    // Process each item
    for (const itemId of itemIds) {
      try {
        // Get item with staff and payout account
        const { data: item, error: itemError } = await supabaseAdmin
          .from("payroll_items")
          .select(
            `
            *,
            staff:staff_id(id, full_name, email)
          `,
          )
          .eq("id", itemId)
          .single();

        if (itemError || !item) {
          results.push({ itemId, success: false, error: "Item not found" });
          continue;
        }

        // Check if already paid
        if (item.payment_status === "paid") {
          results.push({ itemId, success: false, error: "Already paid" });
          continue;
        }

        // Get default payout account
        const { data: accounts, error: accountError } = await supabaseAdmin
          .from("staff_payout_accounts")
          .select("*")
          .eq("staff_id", item.staff_id)
          .eq("is_default", true)
          .limit(1);

        if (accountError || !accounts || accounts.length === 0) {
          results.push({
            itemId,
            success: false,
            error: "No default payout account",
          });
          continue;
        }

        const account = accounts[0];
        let paymentStatus = "paid";
        let paymentMethod = account.method;
        let paymentRef = null;

        // Process payment based on method
        if (account.method === "stripe" && account.stripe_account_id) {
          // Stripe Connect transfer
          try {
            // XAF is zero-decimal in Stripe - send whole franc amount
            const amountXaf = Math.round(item.net_minor / 100);

            const transfer = await stripe.transfers.create(
              {
                amount: amountXaf,
                currency: "xaf",
                destination: account.stripe_account_id,
                description: `Payroll payment for ${item.staff.full_name}`,
                metadata: {
                  payroll_item_id: itemId,
                  staff_id: item.staff_id,
                  idempotency_key: item.idempotency_key || itemId,
                },
              },
              {
                idempotencyKey: item.idempotency_key || itemId,
              },
            );

            paymentStatus = "processing";
            paymentRef = transfer.id;
          } catch (stripeError: any) {
            console.error("[Stripe transfer error]", stripeError);
            results.push({
              itemId,
              success: false,
              error: stripeError.message,
            });
            continue;
          }
        } else if (
          account.method === "mtn_momo" ||
          account.method === "orange_money"
        ) {
          // MoMo/Orange Money - mark as paid (manual or via Fapshi API if available)
          paymentStatus = "paid";
          paymentMethod = account.method;
          paymentRef = `${account.method}_${Date.now()}`;
        } else if (account.method === "bank") {
          // Bank transfer - mark as paid (manual)
          paymentStatus = "paid";
          paymentMethod = "bank";
          paymentRef = `bank_${Date.now()}`;
        } else {
          results.push({
            itemId,
            success: false,
            error: "Unsupported payment method",
          });
          continue;
        }

        // Update payroll item
        const { error: updateError } = await supabaseAdmin
          .from("payroll_items")
          .update({
            payment_status: paymentStatus,
            payment_method: paymentMethod,
            payment_ref: paymentRef,
            paid_at: paymentStatus === "paid" ? paymentDate : null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", itemId);

        if (updateError) throw updateError;

        // Audit log
        await supabaseAdmin.from("audit_log").insert({
          actor_id: auth.session.auth_user_id,
          actor_role: auth.session.role,
          action: "payroll.item_paid",
          target_type: "payroll_item",
          target_id: itemId,
          payload: {
            staff_id: item.staff_id,
            amount_minor: item.net_minor,
            payment_method: paymentMethod,
            payment_ref: paymentRef,
          },
          ip: request.headers.get("x-forwarded-for") || "unknown",
        });

        // TODO: Send notification to staff (Prompt I)
        // await notify({ staffId: item.staff_id, type: 'payroll', title: `You've been paid ${formatMoneyMinor(item.net_minor)}` });

        results.push({ itemId, success: true, paymentRef });
      } catch (error: any) {
        console.error(`[Pay item ${itemId}] error:`, error);
        results.push({ itemId, success: false, error: error.message });
      }
    }

    const successCount = results.filter((r) => r.success).length;
    return NextResponse.json({
      success: successCount > 0,
      processed: results.length,
      succeeded: successCount,
      failed: results.length - successCount,
      results,
    });
  } catch (error: any) {
    console.error("[POST /api/admin/payroll/pay] error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
