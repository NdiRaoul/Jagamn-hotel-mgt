import { NextRequest, NextResponse } from "next/server";
import { createSupabaseRouteHandlerClient } from "@/lib/supabase-server";
import { getPositions, createPosition } from "@/lib/data/org";

export async function GET() {
  try {
    const positions = await getPositions();
    return NextResponse.json({ positions });
  } catch (error) {
    console.error("Get positions error:", error);
    return NextResponse.json(
      { error: "Failed to fetch positions" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = createSupabaseRouteHandlerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin/manager/owner
    const { data: staff } = await supabase
      .from("staff")
      .select("role")
      .eq("auth_user_id", user.id)
      .single();

    if (!staff || !["owner", "admin", "manager"].includes(staff.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { title, department_id, default_role } = body;

    if (!title) {
      return NextResponse.json(
        { error: "Position title is required" },
        { status: 400 },
      );
    }

    const position = await createPosition(title, department_id, default_role);
    return NextResponse.json({ position }, { status: 201 });
  } catch (error) {
    console.error("Create position error:", error);
    return NextResponse.json(
      { error: "Failed to create position" },
      { status: 500 },
    );
  }
}
