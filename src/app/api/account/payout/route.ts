import { NextRequest, NextResponse } from "next/server";
import { getStaffSession } from "@/lib/auth/staff-session";
import {
  getPayoutAccounts,
  createPayoutAccount,
  setDefaultPayoutAccount,
  deletePayoutAccount,
} from "@/lib/data/self-service";

// GET /api/account/payout - Get own payout accounts
export async function GET(request: NextRequest) {
  const session = await getStaffSession();
  if (!session || session.status !== "active") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const accounts = await getPayoutAccounts(session.id);
    return NextResponse.json({ accounts });
  } catch (error: any) {
    console.error("[GET /api/account/payout] error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/account/payout - Create payout account
export async function POST(request: NextRequest) {
  const session = await getStaffSession();
  if (!session || session.status !== "active") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { method, provider, account_number, account_holder_name } = body;

    if (!method) {
      return NextResponse.json(
        { error: "method is required" },
        { status: 400 },
      );
    }

    if (!["stripe", "mtn_momo", "orange_money", "bank"].includes(method)) {
      return NextResponse.json(
        {
          error:
            "Invalid method. Must be stripe, mtn_momo, orange_money, or bank",
        },
        { status: 400 },
      );
    }

    // For non-Stripe methods, require account details
    if (method !== "stripe" && !account_number) {
      return NextResponse.json(
        { error: "account_number is required for this method" },
        { status: 400 },
      );
    }

    const account = await createPayoutAccount(session.id, method, {
      provider,
      account_number,
      account_holder_name,
    });

    return NextResponse.json({ account }, { status: 201 });
  } catch (error: any) {
    console.error("[POST /api/account/payout] error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH /api/account/payout - Set default payout account
export async function PATCH(request: NextRequest) {
  const session = await getStaffSession();
  if (!session || session.status !== "active") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { account_id } = body;

    if (!account_id) {
      return NextResponse.json(
        { error: "account_id is required" },
        { status: 400 },
      );
    }

    await setDefaultPayoutAccount(session.id, account_id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[PATCH /api/account/payout] error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/account/payout - Delete payout account
export async function DELETE(request: NextRequest) {
  const session = await getStaffSession();
  if (!session || session.status !== "active") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get("id");

    if (!accountId) {
      return NextResponse.json(
        { error: "id query parameter is required" },
        { status: 400 },
      );
    }

    await deletePayoutAccount(session.id, accountId);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[DELETE /api/account/payout] error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
