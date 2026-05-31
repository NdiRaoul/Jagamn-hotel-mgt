import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import { getStaffSession } from "@/lib/auth/staff-session";
import { getSuppliers } from "@/lib/data/procurement";

const ALLOWED_ROLES = ["owner", "admin", "manager", "storekeeper"];

async function requireRole(request: NextRequest) {
  const session = await getStaffSession();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (
    session.status !== "active" ||
    !ALLOWED_ROLES.includes(session.role)
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return session;
}

export async function GET(request: NextRequest) {
  const session = await requireRole(request);
  if (session instanceof NextResponse) return session;
  try {
    const suppliers = await getSuppliers();
    return NextResponse.json({ suppliers });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch suppliers" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  const session = await requireRole(request);
  if (session instanceof NextResponse) return session;

  const body = await request.json().catch(() => ({}));
  const { name, category, contact, email, phone } = body as Record<
    string,
    unknown
  >;

  if (!name)
    return NextResponse.json({ error: "name is required" }, { status: 400 });

  const { data, error } = await supabaseAdmin
    .from("suppliers")
    .insert({
      name: String(name),
      category: typeof category === "string" ? category : null,
      contact: typeof contact === "string" ? contact : null,
      email: typeof email === "string" ? email : null,
      phone: typeof phone === "string" ? phone : null,
      is_active: true,
    })
    .select()
    .maybeSingle();

  if (error)
    return NextResponse.json(
      { error: "Failed to create supplier" },
      { status: 500 },
    );
  return NextResponse.json({ supplier: data });
}
