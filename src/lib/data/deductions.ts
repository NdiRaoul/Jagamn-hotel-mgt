import { supabaseAdmin } from "@/lib/supabase-server";

export interface StaffDeduction {
  id: string;
  staff_id: string;
  type: string;
  amount_minor: number;
  reason: string | null;
  applied_date: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  staff?: {
    full_name: string;
    staff_code: string | null;
    department: string | null;
    position: string | null;
    avatar_url: string | null;
  };
}

export async function getRecentDeductions(
  limit = 10,
): Promise<StaffDeduction[]> {
  const { data, error } = await supabaseAdmin
    .from("staff_deductions")
    .select(
      `
      *,
      staff:staff_id (
        full_name,
        staff_code,
        department,
        position,
        avatar_url
      )
    `,
    )
    .order("applied_date", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching deductions:", error);
    return [];
  }

  return (data || []) as StaffDeduction[];
}

export async function getMonthlyDeductionsTotal(): Promise<number> {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const { data, error } = await supabaseAdmin
    .from("staff_deductions")
    .select("amount_minor")
    .gte("applied_date", startOfMonth.toISOString());

  if (error) {
    console.error("Error fetching monthly total:", error);
    return 0;
  }

  return (data || []).reduce((sum, d) => sum + d.amount_minor, 0);
}

export async function getDeductionStats() {
  const { data, error } = await supabaseAdmin
    .from("staff_deductions")
    .select("id, type");

  if (error) {
    console.error("Error fetching deduction stats:", error);
    return { pending: 0, resolved: 0 };
  }

  // For now, we'll consider all deductions as resolved
  // You can add a status field later if needed
  return {
    pending: 0,
    resolved: data?.length || 0,
  };
}

export async function createDeduction(
  staffId: string,
  type: string,
  amountMinor: number,
  reason: string | null,
  createdBy: string,
): Promise<StaffDeduction | null> {
  const { data, error } = await supabaseAdmin
    .from("staff_deductions")
    .insert({
      staff_id: staffId,
      type,
      amount_minor: amountMinor,
      reason,
      created_by: createdBy,
    })
    .select(
      `
      *,
      staff:staff_id (
        full_name,
        staff_code,
        department,
        position,
        avatar_url
      )
    `,
    )
    .single();

  if (error) {
    console.error("Error creating deduction:", error);
    return null;
  }

  return data as StaffDeduction;
}
