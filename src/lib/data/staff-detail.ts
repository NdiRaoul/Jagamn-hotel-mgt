import { supabaseAdmin } from "@/lib/supabase-server";
import type { Staff } from "@/types/database";

export async function getStaffById(id: string): Promise<Staff | null> {
  const { data, error } = await supabaseAdmin
    .from("staff")
    .select(
      `
      *,
      department:departments(name),
      position:positions(title)
    `,
    )
    .eq("id", id)
    .single();

  if (error || !data) {
    console.error("Error fetching staff:", error);
    return null;
  }

  return {
    ...data,
    department: data.department?.name || null,
    position: data.position?.title || null,
  } as Staff;
}
