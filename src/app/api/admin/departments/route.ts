import { NextRequest, NextResponse } from "next/server";
import { createSupabaseRouteHandlerClient } from "@/lib/supabase-server";
import { getDepartments, createDepartment } from "@/lib/data/org";

export async function GET() {
  try {
    const departments = await getDepartments();
    return NextResponse.json({ departments });
  } catch (error) {
    console.error("Get departments error:", error);
    return NextResponse.json(
      { error: "Failed to fetch departments" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createSupabaseRouteHandlerClient();
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
    const { name } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Department name is required" },
        { status: 400 },
      );
    }

    const department = await createDepartment(name);
    return NextResponse.json({ department }, { status: 201 });
  } catch (error) {
    console.error("Create department error:", error);
    return NextResponse.json(
      { error: "Failed to create department" },
      { status: 500 },
    );
  }
}
