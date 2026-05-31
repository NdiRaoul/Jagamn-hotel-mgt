import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import { getStaffSession } from "@/lib/auth/staff-session";

export async function GET(request: NextRequest) {
  const session = await getStaffSession();
  if (!session || session.status !== "active") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const booking_id = searchParams.get("booking_id");

  if (!booking_id) {
    return NextResponse.json({ error: "booking_id required" }, { status: 400 });
  }

  try {
    const { data: entries, error: entriesError } = await supabaseAdmin
      .from("folio_entries")
      .select("*")
      .eq("booking_id", booking_id)
      .order("created_at", { ascending: true });

    if (entriesError) throw entriesError;

    const { data: balance, error: balanceError } = await supabaseAdmin
      .from("booking_folio_balance")
      .select("*")
      .eq("booking_id", booking_id)
      .single();

    if (balanceError && balanceError.code !== "PGRST116") throw balanceError;

    return NextResponse.json({
      entries: entries || [],
      balance: balance || { balance_minor: 0, paid_minor: 0 },
    });
  } catch (error: any) {
    console.error("[GET /api/reception/folio]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await getStaffSession();
  if (!session || session.status !== "active") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { booking_id, amount_minor, category, description } = body;

    if (!booking_id || !amount_minor || !category) {
      return NextResponse.json(
        { error: "booking_id, amount_minor, category are required" },
        { status: 400 }
      );
    }

    const { data: entry, error } = await supabaseAdmin
      .from("folio_entries")
      .insert({
        booking_id,
        entry_type: "charge",
        category,
        description: description || `Charge: ${category}`,
        amount_minor,
        created_by: session.auth_user_id,
      })
      .select()
      .single();

    if (error) throw error;

    // Audit Log
    await supabaseAdmin.from("audit_log").insert({
      actor_id: session.auth_user_id,
      actor_role: session.role,
      action: "reception.folio_charge",
      target_type: "booking",
      target_id: booking_id,
      payload: { amount_minor, category, description },
      ip: request.headers.get("x-forwarded-for") || "unknown",
    });

    return NextResponse.json({ entry }, { status: 201 });
  } catch (error: any) {
    console.error("[POST /api/reception/folio]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
