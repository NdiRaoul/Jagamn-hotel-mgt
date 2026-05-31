  createSupabaseServerClient,
  supabaseAdmin,
} from "@/lib/supabase-server";
import { checkSessionActivity } from "./session-timeout";

export interface StaffSession {
  id: string;
  auth_user_id: string;
  email: string;
  full_name: string;
  role: string;
  status: string;
  department: string | null;
  position: string | null;
  must_reset_pw: boolean;
}

/**
 * Get the current staff session from auth cookies
 * Returns null if not authenticated or not active staff
 */
export async function getStaffSession(): Promise<StaffSession | null> {
  try {
    const supabase = await createSupabaseServerClient();

    // Check idle timeout
    const isActive = await checkSessionActivity();
    if (!isActive) {
      return null;
    }

    // Get the authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return null;
    }

    // Get staff record
    const { data: staff, error: staffError } = await supabaseAdmin
      .from("staff")
      .select(
        "id, auth_user_id, email, full_name, role, status, department, position, must_reset_pw",
      )
      .eq("auth_user_id", user.id)
      .eq("status", "active")
      .single();

    if (staffError || !staff) {
      return null;
    }

    return staff as StaffSession;
  } catch (error) {
    console.error("Staff session error:", error);
    return null;
  }
}
