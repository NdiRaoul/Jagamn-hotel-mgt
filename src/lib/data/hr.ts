import { supabaseAdmin } from "@/lib/supabase-server";

export interface LeaveType {
  id: string;
  name: string;
  code: string;
  color: string;
  max_days: number;
  is_active: boolean;
  created_at: string;
}

export interface LeaveRequest {
  id: string;
  staff_id: string;
  leave_type_id: string | null;
  start_date: string;
  end_date: string;
  days: number;
  reason: string | null;
  supporting_doc: string | null;
  status: string;
  decided_by: string | null;
  decided_at: string | null;
  manager_notes: string | null;
  created_at: string;
  updated_at: string;
  staff?: {
    full_name: string;
    email: string;
    role: string;
    staff_code: string | null;
  };
  leave_types?: {
    name: string;
    code: string;
    color: string;
  };
}

export interface LeaveBalance {
  id: string;
  staff_id: string;
  leave_type_id: string;
  year: number;
  accrued: number;
  used: number;
  created_at: string;
  updated_at: string;
}

export interface Deduction {
  id: string;
  staff_id: string;
  category: string;
  reason_type: string | null;
  amount_minor: number;
  reason: string | null;
  applied_on: string;
  created_by: string | null;
  created_at: string;
  staff?: {
    full_name: string;
    email: string;
    department: string | null;
    staff_code: string | null;
  };
}

export async function getLeaveTypes(): Promise<LeaveType[]> {
  const { data, error } = await supabaseAdmin
    .from("leave_types")
    .select("*")
    .eq("is_active", true)
    .order("name", { ascending: true });

  if (error) {
    console.error("[getLeaveTypes]", error.message);
    return [];
  }
  return (data || []) as LeaveType[];
}

export async function getLeaveRequests(filters?: {
  status?: string;
  staffId?: string;
}): Promise<LeaveRequest[]> {
  let query = supabaseAdmin
    .from("leave_requests")
    .select(
      `
      *,
      staff:staff_id(full_name,email,role,staff_code),
      leave_types:leave_type_id(name,code,color)
    `,
    )
    .order("created_at", { ascending: false });

  if (filters?.status && filters.status !== "all") {
    query = query.eq("status", filters.status);
  }

  if (filters?.staffId) {
    query = query.eq("staff_id", filters.staffId);
  }

  const { data, error } = await query;
  if (error) {
    console.error("[getLeaveRequests]", error.message);
    return [];
  }

  return (data || []) as LeaveRequest[];
}

export async function getLeaveBalance(
  staffId: string,
  leaveTypeId: string,
  year: number,
): Promise<LeaveBalance | null> {
  const { data, error } = await supabaseAdmin
    .from("leave_balances")
    .select("*")
    .eq("staff_id", staffId)
    .eq("leave_type_id", leaveTypeId)
    .eq("year", year)
    .single();

  if (error) return null;
  return data as LeaveBalance;
}

export async function getDeductions(filters?: {
  staffId?: string;
  category?: string;
  dateFrom?: string;
  dateTo?: string;
}): Promise<Deduction[]> {
  let query = supabaseAdmin
    .from("staff_deductions")
    .select(
      `
      *,
      staff:staff_id(full_name,email,department,staff_code)
    `,
    )
    .order("applied_on", { ascending: false });

  if (filters?.staffId) {
    query = query.eq("staff_id", filters.staffId);
  }

  if (filters?.category) {
    query = query.eq("category", filters.category);
  }

  if (filters?.dateFrom) {
    query = query.gte("applied_on", filters.dateFrom);
  }

  if (filters?.dateTo) {
    query = query.lte("applied_on", filters.dateTo);
  }

  const { data, error } = await query.limit(100);
  if (error) {
    console.error("[getDeductions]", error.message);
    return [];
  }

  return (data || []) as Deduction[];
}
