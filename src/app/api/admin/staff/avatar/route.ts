import { NextRequest, NextResponse } from "next/server";
import { getStaffSession } from "@/lib/auth/staff-session";
import { supabaseAdmin, ensureBucket } from "@/lib/supabase-server";

const ALLOWED_ROLES = ["owner", "admin", "manager"];

// POST /api/admin/staff/avatar  (multipart, field "avatar")
// Uploads a staff photo to the "avatars" storage bucket and returns its public
// URL. Used by the create/edit staff flows where there is no self-session id to
// key on — the returned URL is then persisted via the staff create/update call.
export async function POST(request: NextRequest) {
  const session = await getStaffSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.status !== "active" || !ALLOWED_ROLES.includes(session.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("avatar") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "File must be an image" },
        { status: 400 },
      );
    }
    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Image must be less than 2MB" },
        { status: 400 },
      );
    }

    await ensureBucket("avatars");

    const ext = file.name.split(".").pop() || "jpg";
    const fileName = `staff-${session.id}-${Date.now()}.${ext}`;
    const { error: uploadError } = await supabaseAdmin.storage
      .from("avatars")
      .upload(fileName, file, { cacheControl: "3600", upsert: false });
    if (uploadError) throw uploadError;

    const {
      data: { publicUrl },
    } = supabaseAdmin.storage.from("avatars").getPublicUrl(fileName);

    return NextResponse.json({ avatar_url: publicUrl });
  } catch (error: unknown) {
    console.error("[POST /api/admin/staff/avatar] error:", error);
    const message =
      error instanceof Error ? error.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
