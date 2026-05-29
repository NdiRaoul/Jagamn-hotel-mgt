import { supabaseAdmin } from "@/lib/supabase-server";
import type { Staff } from "@/types/database";

export type NewStaffInput = Omit<Staff, "id" | "created_at" | "updated_at">;

export interface StaffFilters {
  query?: string;
  role?: string;
  status?: string;
  department?: string;
  hireFrom?: string;
  hireTo?: string;
  sort?: "name" | "hire_date" | "created_at";
}

export async function getStaff(filters?: StaffFilters): Promise<Staff[]> {
  let request = supabaseAdmin
    .from("staff")
    .select(
      "id,auth_user_id,full_name,email,role,status,avatar_url,must_reset_pw,staff_code,phone,department,position,salary,hire_date,created_at,updated_at",
    );

  if (filters?.query) {
    const q = filters.query.trim().toLowerCase();
    request = request.or(
      `full_name.ilike.%${q}%,email.ilike.%${q}%,role.ilike.%${q}%,department.ilike.%${q}%,position.ilike.%${q}%,staff_code.ilike.%${q}%`,
    );
  }

  if (filters?.role) request = request.eq("role", filters.role);
  if (filters?.status) request = request.eq("status", filters.status);
  if (filters?.department)
    request = request.eq("department", filters.department);
  if (filters?.hireFrom) request = request.gte("hire_date", filters.hireFrom);
  if (filters?.hireTo) request = request.lte("hire_date", filters.hireTo);

  const sortCol =
    filters?.sort === "hire_date"
      ? "hire_date"
      : filters?.sort === "name"
        ? "full_name"
        : "created_at";
  request = request.order(sortCol, { ascending: filters?.sort === "name" });

  const { data, error } = await request;
  if (error) throw error;
  return data as Staff[];
}

export async function getStaffByAuthUserId(
  authUserId: string,
): Promise<Staff | null> {
  const { data, error } = await supabaseAdmin
    .from("staff")
    .select(
      "id,auth_user_id,full_name,email,role,status,avatar_url,must_reset_pw,staff_code,phone,department,position,salary,hire_date,created_at,updated_at",
    )
    .eq("auth_user_id", authUserId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data as Staff | null;
}

export async function getStaffByEmail(email: string): Promise<Staff | null> {
  const { data, error } = await supabaseAdmin
    .from("staff")
    .select(
      "id,auth_user_id,full_name,email,role,status,avatar_url,must_reset_pw,staff_code,phone,department,position,salary,hire_date,created_at,updated_at",
    )
    .eq("email", email)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data as Staff | null;
}

export async function getStaffById(id: string): Promise<Staff | null> {
  const { data, error } = await supabaseAdmin
    .from("staff")
    .select(
      "id,auth_user_id,full_name,email,role,status,avatar_url,must_reset_pw,staff_code,phone,department,position,salary,hire_date,created_at,updated_at",
    )
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data as Staff | null;
}

export async function createStaff(staff: NewStaffInput): Promise<Staff> {
  const { data, error } = await supabaseAdmin
    .from("staff")
    .insert(staff)
    .select()
    .maybeSingle();

  if (error || !data) {
    throw error ?? new Error("Failed to create staff row");
  }

  return data as Staff;
}

export async function updateStaff(
  id: string,
  payload: Partial<Omit<Staff, "id" | "created_at" | "updated_at">>,
): Promise<Staff> {
  const { data, error } = await supabaseAdmin
    .from("staff")
    .update(payload)
    .eq("id", id)
    .select()
    .maybeSingle();

  if (error || !data) {
    throw error ?? new Error("Failed to update staff row");
  }

  return data as Staff;
}

export async function setStaffStatus(
  id: string,
  status: string,
): Promise<Staff> {
  return updateStaff(id, { status });
}

export async function deactivateStaff(id: string): Promise<Staff> {
  return setStaffStatus(id, "removed");
}

export async function deleteStaff(id: string): Promise<void> {
  const { error } = await supabaseAdmin.from("staff").delete().eq("id", id);
  if (error) {
    throw error;
  }
}
