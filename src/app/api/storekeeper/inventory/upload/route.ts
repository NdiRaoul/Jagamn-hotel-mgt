import { NextRequest, NextResponse } from "next/server";
import { getStaffSession } from "@/lib/auth/staff-session";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

const ROLES = ["owner", "admin", "manager", "storekeeper"];
const BUCKET = "inventory";

/**
 * POST /api/storekeeper/inventory/upload  (multipart form, field "image")
 * Uploads an item image to the "inventory" storage bucket and returns its URL.
 */
export async function POST(req: NextRequest) {
  const session = await getStaffSession();
  if (!session || session.status !== "active" || !ROLES.includes(session.role))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const formData = await req.formData();
    const file = formData.get("image") as File | null;
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "File must be an image" },
        { status: 400 },
      );
    }
    if (file.size > 4 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size must be less than 4MB" },
        { status: 400 },
      );
    }

    // Ensure the public bucket exists (idempotent — ignore "already exists").
    await supabase.storage
      .createBucket(BUCKET, { public: true })
      .catch(() => undefined);

    const ext = file.name.split(".").pop() || "jpg";
    const fileName = `${session.id}-${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(fileName, file, { cacheControl: "3600", upsert: false });
    if (uploadError) throw uploadError;

    const {
      data: { publicUrl },
    } = supabase.storage.from(BUCKET).getPublicUrl(fileName);

    return NextResponse.json({ image_url: publicUrl });
  } catch (error: unknown) {
    console.error("[POST /api/storekeeper/inventory/upload]", error);
    const message =
      error instanceof Error ? error.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
