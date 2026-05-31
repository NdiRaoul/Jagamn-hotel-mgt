import { supabaseAdmin } from "@/lib/supabase-server";

export interface Department {
  id: string;
  name: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export interface Position {
  id: string;
  title: string;
  department_id: string | null;
  default_role: string | null;
  is_active: boolean;
  created_at: string;
}

export async function getDepartments(): Promise<Department[]> {
  const { data, error } = await supabaseAdmin
    .from("departments")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return (data || []) as Department[];
}

export async function getPositions(): Promise<Position[]> {
  const { data, error } = await supabaseAdmin
    .from("positions")
    .select("*")
    .eq("is_active", true)
    .order("title", { ascending: true });

  if (error) throw error;
  return (data || []) as Position[];
}

export async function createDepartment(name: string): Promise<Department> {
  const { data, error } = await supabaseAdmin
    .from("departments")
    .insert({ name, is_active: true, sort_order: 0 })
    .select()
    .single();

  if (error) throw error;
  return data as Department;
}

export async function createPosition(
  title: string,
  departmentId?: string,
  defaultRole?: string,
): Promise<Position> {
  const { data, error } = await supabaseAdmin
    .from("positions")
    .insert({
      title,
      department_id: departmentId || null,
      default_role: defaultRole || null,
      is_active: true,
    })
    .select()
    .single();

  if (error) throw error;
  return data as Position;
}
