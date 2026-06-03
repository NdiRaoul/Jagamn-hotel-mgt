import { supabaseAdmin } from "@/lib/supabase-server";

export interface SystemAlert {
  id: string;
  alert_type: string;
  priority: string;
  title: string;
  description: string | null;
  module: string | null;
  status: string;
  assigned_to: string | null;
  resolved_by: string | null;
  resolved_at: string | null;
  resolution_notes: string | null;
  metadata: any;
  created_at: string;
  updated_at: string;
  assigned_staff?: {
    full_name: string;
    email: string;
  };
  resolved_staff?: {
    full_name: string;
    email: string;
  };
}

export async function getSystemAlerts(status?: string): Promise<SystemAlert[]> {
  let query = supabaseAdmin
    .from("system_alerts")
    .select(
      `
      *,
      assigned_staff:assigned_to(full_name, email),
      resolved_staff:resolved_by(full_name, email)
    `,
    )
    .order("created_at", { ascending: false });

  if (status && status !== "all") {
    query = query.eq("status", status);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching alerts:", error);
    return [];
  }

  return (data || []) as SystemAlert[];
}

export async function getAlertStats() {
  const { data, error } = await supabaseAdmin
    .from("system_alerts")
    .select("status, priority");

  if (error) {
    console.error("Error fetching alert stats:", error);
    return { urgent: 0, pending: 0, resolved: 0 };
  }

  const urgent =
    data?.filter((a) => a.priority === "critical" && a.status === "pending")
      .length || 0;
  const pending = data?.filter((a) => a.status === "pending").length || 0;
  const resolved = data?.filter((a) => a.status === "resolved").length || 0;

  return { urgent, pending, resolved };
}

export async function createAlert(
  alertType: string,
  priority: string,
  title: string,
  description: string | null,
  module: string | null,
  metadata?: any,
): Promise<SystemAlert | null> {
  const { data, error } = await supabaseAdmin
    .from("system_alerts")
    .insert({
      alert_type: alertType,
      priority,
      title,
      description,
      module,
      metadata: metadata || null,
      status: "pending",
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating alert:", error);
    return null;
  }

  return data as SystemAlert;
}

export async function updateAlertStatus(
  alertId: string,
  status: string,
  resolvedBy?: string,
  resolutionNotes?: string,
): Promise<boolean> {
  const updateData: any = {
    status,
    updated_at: new Date().toISOString(),
  };

  if (status === "resolved") {
    updateData.resolved_at = new Date().toISOString();
    if (resolvedBy) updateData.resolved_by = resolvedBy;
    if (resolutionNotes) updateData.resolution_notes = resolutionNotes;
  }

  const { error } = await supabaseAdmin
    .from("system_alerts")
    .update(updateData)
    .eq("id", alertId);

  if (error) {
    console.error("Error updating alert:", error);
    return false;
  }

  return true;
}

export async function assignAlert(
  alertId: string,
  assignedTo: string,
): Promise<boolean> {
  const { error } = await supabaseAdmin
    .from("system_alerts")
    .update({
      assigned_to: assignedTo,
      status: "in_progress",
      updated_at: new Date().toISOString(),
    })
    .eq("id", alertId);

  if (error) {
    console.error("Error assigning alert:", error);
    return false;
  }

  return true;
}
