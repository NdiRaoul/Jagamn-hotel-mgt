import { supabaseAdmin } from "@/lib/supabase-server";

export interface StaffProfile {
  id: string;
  auth_user_id: string;
  full_name: string;
  email: string;
  role: string;
  status: string;
  avatar_url: string | null;
  staff_code: string | null;
  phone: string | null;
  department: string | null;
  position: string | null;
  salary: number;
  hire_date: string | null;
  created_at: string;
  updated_at: string;
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
  leave_type?: {
    name: string;
    code: string;
    color: string;
  };
}

export interface LeaveBalance {
  leave_type_id: string;
  leave_type_name: string;
  leave_type_code: string;
  year: number;
  accrued: number;
  used: number;
  remaining: number;
}

export interface PayoutAccount {
  id: string;
  staff_id: string;
  method: string;
  provider: string | null;
  account_number: string | null;
  account_last4: string | null;
  account_holder_name: string | null;
  stripe_account_id: string | null;
  stripe_status: string | null;
  is_verified: boolean;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export async function getStaffProfile(
  staffId: string,
): Promise<StaffProfile | null> {
  const { data, error } = await supabaseAdmin
    .from("staff")
    .select("*")
    .eq("id", staffId)
    .single();

  if (error) return null;
  return data as StaffProfile;
}

export async function updateStaffProfile(
  staffId: string,
  updates: { phone?: string; avatar_url?: string },
): Promise<StaffProfile | null> {
  const { data, error } = await supabaseAdmin
    .from("staff")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", staffId)
    .select()
    .single();

  if (error) throw error;
  return data as StaffProfile;
}

export async function getLeaveRequests(
  staffId: string,
): Promise<LeaveRequest[]> {
  const { data, error } = await supabaseAdmin
    .from("leave_requests")
    .select(
      `
      *,
      leave_type:leave_type_id(name,code,color)
    `,
    )
    .eq("staff_id", staffId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data || []) as LeaveRequest[];
}

export async function getLeaveBalances(
  staffId: string,
): Promise<LeaveBalance[]> {
  const currentYear = new Date().getFullYear();

  const { data, error } = await supabaseAdmin
    .from("leave_balances")
    .select(
      `
      *,
      leave_type:leave_type_id(name,code)
    `,
    )
    .eq("staff_id", staffId)
    .eq("year", currentYear);

  if (error) throw error;

  return (data || []).map((b: any) => ({
    leave_type_id: b.leave_type_id,
    leave_type_name: b.leave_type?.name || "Unknown",
    leave_type_code: b.leave_type?.code || "",
    year: b.year,
    accrued: b.accrued,
    used: b.used,
    remaining: b.accrued - b.used,
  }));
}

export async function createLeaveRequest(
  staffId: string,
  leaveTypeId: string,
  startDate: string,
  endDate: string,
  reason: string | null,
  supportingDoc: string | null,
): Promise<LeaveRequest> {
  // Calculate days (simple calculation - can be enhanced)
  const start = new Date(startDate);
  const end = new Date(endDate);
  const days =
    Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  const { data, error } = await supabaseAdmin
    .from("leave_requests")
    .insert({
      staff_id: staffId,
      leave_type_id: leaveTypeId,
      start_date: startDate,
      end_date: endDate,
      days,
      reason,
      supporting_doc: supportingDoc,
      status: "pending",
    })
    .select(
      `
      *,
      leave_type:leave_type_id(name,code,color)
    `,
    )
    .single();

  if (error) throw error;
  return data as LeaveRequest;
}

export async function cancelLeaveRequest(
  staffId: string,
  requestId: string,
): Promise<boolean> {
  // Only allow canceling own pending requests
  const { data: request } = await supabaseAdmin
    .from("leave_requests")
    .select("*")
    .eq("id", requestId)
    .eq("staff_id", staffId)
    .eq("status", "pending")
    .single();

  if (!request) {
    throw new Error("Request not found or cannot be cancelled");
  }

  const { error } = await supabaseAdmin
    .from("leave_requests")
    .delete()
    .eq("id", requestId);

  if (error) throw error;
  return true;
}

export async function getPayoutAccounts(
  staffId: string,
): Promise<PayoutAccount[]> {
  const { data, error } = await supabaseAdmin
    .from("staff_payout_accounts")
    .select("*")
    .eq("staff_id", staffId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data || []) as PayoutAccount[];
}

export async function createPayoutAccount(
  staffId: string,
  method: string,
  details: {
    provider?: string;
    account_number?: string;
    account_holder_name?: string;
  },
): Promise<PayoutAccount> {
  // Check if this is the first account - make it default
  const { data: existing } = await supabaseAdmin
    .from("staff_payout_accounts")
    .select("id")
    .eq("staff_id", staffId);

  const isFirst = !existing || existing.length === 0;

  const { data, error } = await supabaseAdmin
    .from("staff_payout_accounts")
    .insert({
      staff_id: staffId,
      method,
      provider: details.provider || null,
      account_number: details.account_number || null,
      account_last4: details.account_number
        ? details.account_number.slice(-4)
        : null,
      account_holder_name: details.account_holder_name || null,
      is_verified: method !== "stripe", // Manual methods are auto-verified
      is_default: isFirst,
    })
    .select()
    .single();

  if (error) throw error;
  return data as PayoutAccount;
}

export async function setDefaultPayoutAccount(
  staffId: string,
  accountId: string,
): Promise<boolean> {
  // Unset all defaults for this staff
  await supabaseAdmin
    .from("staff_payout_accounts")
    .update({ is_default: false })
    .eq("staff_id", staffId);

  // Set new default
  const { error } = await supabaseAdmin
    .from("staff_payout_accounts")
    .update({ is_default: true })
    .eq("id", accountId)
    .eq("staff_id", staffId);

  if (error) throw error;
  return true;
}

export async function deletePayoutAccount(
  staffId: string,
  accountId: string,
): Promise<boolean> {
  const { error } = await supabaseAdmin
    .from("staff_payout_accounts")
    .delete()
    .eq("id", accountId)
    .eq("staff_id", staffId);

  if (error) throw error;
  return true;
}

export interface Payslip {
  id: string;
  run_id: string;
  staff_id: string;
  gross_minor: number;
  deductions_minor: number;
  net_minor: number;
  payment_status: string;
  payment_method: string | null;
  payment_ref: string | null;
  paid_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  run?: {
    period_label: string;
    period_start: string;
    period_end: string;
    status: string;
  };
}

export async function getStaffPayslips(staffId: string): Promise<Payslip[]> {
  const { data, error } = await supabaseAdmin
    .from("payroll_items")
    .select(
      `
      *,
      run:run_id(period_label,period_start,period_end,status)
    `,
    )
    .eq("staff_id", staffId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data || []) as Payslip[];
}
