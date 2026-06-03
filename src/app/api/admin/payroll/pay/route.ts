import { NextRequest, NextResponse } from "next/server";
import { getStaffSession } from "@/lib/auth/staff-session";
import { supabaseAdmin } from "@/lib/supabase-server";
import { notify } from "@/lib/data/notifications";
import { formatMoneyMinor } from "@/lib/currency";

const ALLOWED_ROLES = ["owner", "admin", "manager"];
const ALLOWED_METHODS = ["cash", "bank", "mtn_momo", "orange_money", "manual"];

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

// POST /api/admin/payroll/pay — record payment for one or more payroll items.
//
// Payment is recorded manually (cash / bank / mobile money). The previous
// Stripe Connect payout-account integration was removed; salaries are settled
// outside the app and marked paid here with the method and date used.
export async function POST(request: NextRequest) {
  const auth = await requireAuthorized();
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const body = await request.json();
    const { itemIds, payment_date, payment_method, payment_ref } = body;

    if (!itemIds || !Array.isArray(itemIds) || itemIds.length === 0) {
      return NextResponse.json(
        { error: "itemIds array is required" },
        { status: 400 },
      );
    }

    const method =
      typeof payment_method === "string" &&
      ALLOWED_METHODS.includes(payment_method)
        ? payment_method
        : "manual";
    const paymentDate = payment_date || new Date().toISOString();

    const results: Array<{
      itemId: string;
      success: boolean;
      error?: string;
      paymentRef?: string;
    }> = [];

    for (const itemId of itemIds) {
      try {
        const { data: item, error: itemError } = await supabaseAdmin
          .from("payroll_items")
          .select(`*, staff:staff_id(id, full_name, email)`)
          .eq("id", itemId)
          .single();

        if (itemError || !item) {
          results.push({ itemId, success: false, error: "Item not found" });
          continue;
        }

        if (item.payment_status === "paid") {
          results.push({ itemId, success: false, error: "Already paid" });
          continue;
        }

        const paymentRef =
          (typeof payment_ref === "string" && payment_ref.trim()) ||
          `${method}_${Date.now()}`;

        const { error: updateError } = await supabaseAdmin
          .from("payroll_items")
          .update({
            payment_status: "paid",
            payment_method: method,
            payment_ref: paymentRef,
            paid_at: paymentDate,
            updated_at: new Date().toISOString(),
          })
          .eq("id", itemId);

        if (updateError) throw updateError;

        await supabaseAdmin.from("audit_log").insert({
          actor_id: auth.session.auth_user_id,
          actor_role: auth.session.role,
          action: "payroll.item_paid",
          target_type: "payroll_item",
          target_id: itemId,
          payload: {
            staff_id: item.staff_id,
            amount_minor: item.net_minor,
            payment_method: method,
            payment_ref: paymentRef,
          },
          ip: request.headers.get("x-forwarded-for") || "unknown",
        });

        await notify({
          staffId: item.staff_id,
          type: "payroll",
          title: "You've been paid",
          body: `${formatMoneyMinor(item.net_minor)} paid via ${method.replace(/_/g, " ")}.`,
        });

        results.push({ itemId, success: true, paymentRef });
      } catch (error: unknown) {
        console.error(`[Pay item ${itemId}] error:`, error);
        const errorMessage =
          error instanceof Error ? error.message : "Payment processing failed";
        results.push({ itemId, success: false, error: errorMessage });
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
  } catch (error: unknown) {
    console.error("[POST /api/admin/payroll/pay] error:", error);
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
