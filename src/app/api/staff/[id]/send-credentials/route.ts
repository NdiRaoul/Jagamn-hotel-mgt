import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import { getStaffSession } from "@/lib/auth/staff-session";
import { getStaffById } from "@/lib/data/staff";
import { resend } from "@/lib/resend";

const ADMIN_ROLES = ["owner", "admin"];

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getStaffSession();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (
    session.status !== "active" ||
    !ADMIN_ROLES.includes(session.role)
  )
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const existing = await getStaffById(id);
  if (!existing)
    return NextResponse.json({ error: "Staff not found" }, { status: 404 });

  const body = await request.json().catch(() => ({}));
  const { tempPassword } = body as { tempPassword?: string };

  const loginUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/staff-login`;

  const html = `
    <div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;padding:40px;background:#f8f9fa;">
      <div style="background:#00152A;padding:32px;border-radius:12px;text-align:center;margin-bottom:32px;">
        <h1 style="color:#BA722E;margin:0;font-size:28px;">Jagamn Palace</h1>
        <p style="color:#94a3b8;margin:8px 0 0;font-size:12px;letter-spacing:0.2em;text-transform:uppercase;">Staff Portal Access</p>
      </div>
      <h2 style="color:#00152A;">Welcome, ${existing.full_name}</h2>
      <p style="color:#64748b;">Your staff portal credentials have been set up. Please log in and change your password on first access.</p>
      <div style="background:white;border:1px solid #e2e8f0;border-radius:8px;padding:24px;margin:24px 0;">
        <p style="margin:0 0 8px;font-size:12px;color:#94a3b8;text-transform:uppercase;letter-spacing:0.1em;">Login URL</p>
        <p style="margin:0 0 16px;font-weight:bold;color:#00152A;">${loginUrl}</p>
        <p style="margin:0 0 8px;font-size:12px;color:#94a3b8;text-transform:uppercase;letter-spacing:0.1em;">Email</p>
        <p style="margin:0 0 16px;font-weight:bold;color:#00152A;">${existing.email}</p>
        ${
          tempPassword
            ? `
        <p style="margin:0 0 8px;font-size:12px;color:#94a3b8;text-transform:uppercase;letter-spacing:0.1em;">Temporary Password</p>
        <p style="margin:0;font-family:monospace;font-size:18px;font-weight:bold;color:#BA722E;background:#fff7ed;padding:12px;border-radius:6px;">${tempPassword}</p>
        `
            : ""
        }
      </div>
      <p style="color:#94a3b8;font-size:12px;">If you did not expect this email, please contact your administrator immediately.</p>
    </div>
  `;

  try {
    await resend.emails.send({
      from: "Jagamn Palace <noreply@jagamnpalace.com>",
      to: [existing.email],
      subject: "Your Jagamn Palace Staff Portal Credentials",
      html,
    });
  } catch (err) {
    console.error("[send-credentials] email error:", err);
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 },
    );
  }

  await supabaseAdmin.from("audit_log").insert({
    actor_id: session.auth_user_id,
    actor_role: session.role,
    action: "staff.send_credentials",
    target_type: "staff",
    target_id: id,
    payload: { email: existing.email },
    ip: request.headers.get("x-forwarded-for") || "unknown",
  });

  return NextResponse.json({ success: true });
}
