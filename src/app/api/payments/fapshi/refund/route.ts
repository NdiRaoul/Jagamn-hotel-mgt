import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { transId, refundAmountUsd } = await request.json();

  const res = await fetch(`${process.env.FAPSHI_BASE_URL}/refund`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apiuser: process.env.FAPSHI_API_USER || "",
      apikey: process.env.FAPSHI_API_KEY || "",
    },
    body: JSON.stringify({
      transId,
      amount: Math.round(refundAmountUsd * 615),
    }),
  });

  const data = await res.json();
  if (!res.ok)
    return NextResponse.json({ error: data.message }, { status: res.status });
  return NextResponse.json(data);
}
