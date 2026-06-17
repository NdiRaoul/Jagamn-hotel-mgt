import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  createSupabaseServerClient,
  supabaseAdmin,
  ensureBucket,
} from "@/lib/supabase-server";

const storage = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

// POST /api/account/guest-avatar — upload a guest avatar to users.avatar_url
export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
        { error: "File size must be less than 2MB" },
        { status: 400 },
      );
    }

    await ensureBucket("avatars");
    const fileName = `guest-${user.id}-${Date.now()}.${file.name.split(".").pop()}`;
    const { error: uploadError } = await storage.storage
      .from("avatars")
      .upload(fileName, file, { cacheControl: "3600", upsert: false });

    if (uploadError) throw uploadError;

    const {
      data: { publicUrl },
    } = storage.storage.from("avatars").getPublicUrl(fileName);

    const { error: updateError } = await supabaseAdmin
      .from("users")
      .update({ avatar_url: publicUrl, updated_at: new Date().toISOString() })
      .eq("auth_user_id", user.id);

    if (updateError) throw updateError;

    return NextResponse.json({ avatar_url: publicUrl });
  } catch (error: unknown) {
    console.error("[POST /api/account/guest-avatar] error:", error);
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
