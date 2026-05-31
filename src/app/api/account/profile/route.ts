import { NextRequest, NextResponse } from "next/server";
import { getStaffSession } from "@/lib/auth/staff-session";
import { getStaffProfile, updateStaffProfile } from "@/lib/data/self-service";

// GET /api/account/profile - Return own profile
export async function GET(_request: NextRequest) {
  const session = await getStaffSession();
  if (!session || session.status !== "active") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const profile = await getStaffProfile(session.id);
    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }
    return NextResponse.json({ profile });
  } catch (error: any) {
    console.error("[GET /api/account/profile] error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH /api/account/profile - Update own profile
export async function PATCH(request: NextRequest) {
  const session = await getStaffSession();
  if (!session || session.status !== "active") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { phone, avatar_url } = body;

    const updates: any = {};
    if (phone !== undefined) updates.phone = phone;
    if (avatar_url !== undefined) updates.avatar_url = avatar_url;

    const profile = await updateStaffProfile(session.id, updates);

    return NextResponse.json({ profile });
  } catch (error: any) {
    console.error("[PATCH /api/account/profile] error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
