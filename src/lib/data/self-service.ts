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

export interface PayslipDeductionLine {
  type: string;
  reason: string | null;
  amount_minor: number;
}

export interface Payslip {
  id: string;
  payroll_run_id: string;
  staff_id: string;
  base_salary_minor: number;
  deductions_minor: number;
  net_pay_minor: number;
  status: string; // payment status: unpaid | processing | paid | failed
  paid_at: string | null;
  run_period_start: string;
  run_period_end: string;
  run_status: string;
  deduction_lines: PayslipDeductionLine[];
}

export async function getStaffPayslips(staffId: string): Promise<Payslip[]> {
  const { data, error } = await supabaseAdmin
    .from("payroll_items")
    .select(
      `
      id, run_id, staff_id, gross_minor, deductions_minor, net_minor,
      payment_status, paid_at, created_at,
      run:run_id(period_label,period_start,period_end,status)
    `,
    )
    .eq("staff_id", staffId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  // Pull the staff member's itemised deductions once, then attach the ones
  // that fall within each payslip's pay period (so reasons + amounts show).
  const { data: deductions } = await supabaseAdmin
    .from("staff_deductions")
    .select("type, reason, amount_minor, applied_date")
    .eq("staff_id", staffId);

  return (data || []).map((row: any) => {
    const run = Array.isArray(row.run) ? row.run[0] : row.run;
    const start = run?.period_start ? new Date(run.period_start).getTime() : null;
    const end = run?.period_end ? new Date(run.period_end).getTime() : null;
    const lines: PayslipDeductionLine[] = (deductions || [])
      .filter((d: any) => {
        if (start === null || end === null || !d.applied_date) return false;
        const t = new Date(d.applied_date).getTime();
        return t >= start && t <= end;
      })
      .map((d: any) => ({
        type: d.type,
        reason: d.reason,
        amount_minor: d.amount_minor,
      }));

    return {
      id: row.id,
      payroll_run_id: row.run_id,
      staff_id: row.staff_id,
      base_salary_minor: row.gross_minor,
      deductions_minor: row.deductions_minor,
      net_pay_minor: row.net_minor,
      status: row.payment_status,
      paid_at: row.paid_at,
      run_period_start: run?.period_start ?? row.created_at,
      run_period_end: run?.period_end ?? row.created_at,
      run_status: run?.status ?? "draft",
      deduction_lines: lines,
    } as Payslip;
  });
}
