import { supabaseAdmin } from "@/lib/supabase-server";

export interface PayrollRun {
  id: string;
  period_label: string;
  period_start: string;
  period_end: string;
  status: string;
  gross_total_minor: number;
  net_total_minor: number;
  generated_by: string | null;
  approved_by: string | null;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface PayrollItem {
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
  idempotency_key: string | null;
  created_at: string;
  updated_at: string;
  staff?: {
    full_name: string;
    email: string;
    role: string;
    department: string | null;
    avatar_url: string | null;
    staff_code: string | null;
  };
}

export async function getPayrollRuns(limit = 12): Promise<PayrollRun[]> {
  const { data, error } = await supabaseAdmin
    .from("payroll_runs")
    .select("*")
    .order("period_start", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data || []) as PayrollRun[];
}

export async function getPayrollRun(runId: string): Promise<PayrollRun | null> {
  const { data, error } = await supabaseAdmin
    .from("payroll_runs")
    .select("*")
    .eq("id", runId)
    .single();

  if (error) return null;
  return data as PayrollRun;
}

export async function getPayrollItems(runId: string): Promise<PayrollItem[]> {
  const { data, error } = await supabaseAdmin
    .from("payroll_items")
    .select(
      `
      *,
      staff:staff_id(full_name,email,role,department,avatar_url,staff_code)
    `,
    )
    .eq("run_id", runId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data || []) as PayrollItem[];
}

export async function createPayrollRun(
  periodLabel: string,
  periodStart: string,
  periodEnd: string,
  generatedBy: string,
): Promise<PayrollRun> {
  // Get all active staff
  const { data: staff, error: staffError } = await supabaseAdmin
    .from("staff")
    .select("id,salary")
    .eq("status", "active");

  if (staffError) throw staffError;

  // Get deductions for the period
  const { data: deductions, error: deductionsError } = await supabaseAdmin
    .from("staff_deductions")
    .select("staff_id,amount_minor")
    .gte("applied_date", periodStart)
    .lte("applied_date", periodEnd);

  if (deductionsError) throw deductionsError;

  // Define types for database results
  type StaffRecord = { id: string; salary: number | null };
  type DeductionRecord = { staff_id: string; amount_minor: number };

  // Group deductions by staff_id
  const deductionsByStaff = (deductions || []).reduce(
    (acc: Record<string, number>, d: DeductionRecord) => {
      acc[d.staff_id] = (acc[d.staff_id] || 0) + d.amount_minor;
      return acc;
    },
    {},
  );

  // Calculate totals
  let grossTotalMinor = 0;
  let netTotalMinor = 0;

  const items = (staff || []).map((s: StaffRecord) => {
    const annualSalary = s.salary || 0;
    const monthlyGross = Math.round((annualSalary / 12) * 100); // Convert to minor units
    const staffDeductions = deductionsByStaff[s.id] || 0;
    const monthlyNet = monthlyGross - staffDeductions;

    grossTotalMinor += monthlyGross;
    netTotalMinor += monthlyNet;

    return {
      staff_id: s.id,
      gross_minor: monthlyGross,
      deductions_minor: staffDeductions,
      net_minor: monthlyNet,
      payment_status: "unpaid",
      idempotency_key: `payroll_${periodLabel}_${s.id}`.replace(/\s+/g, "_"),
    };
  });

  // Create payroll run
  const { data: run, error: runError } = await supabaseAdmin
    .from("payroll_runs")
    .insert({
      period_label: periodLabel,
      period_start: periodStart,
      period_end: periodEnd,
      status: "draft",
      gross_total_minor: grossTotalMinor,
      net_total_minor: netTotalMinor,
      generated_by: generatedBy,
    })
    .select()
    .single();

  if (runError) throw runError;

  // Create payroll items
  const itemsWithRunId = items.map((item) => ({
    ...item,
    run_id: run.id,
  }));

  const { error: itemsError } = await supabaseAdmin
    .from("payroll_items")
    .insert(itemsWithRunId);

  if (itemsError) throw itemsError;

  return run as PayrollRun;
}
