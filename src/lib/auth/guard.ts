import { redirect } from "next/navigation";
import { getStaffSession } from "./staff-session";

/**
 * The home portal a staff role belongs to. Used to bounce a signed-in staffer
 * who hits a portal they don't own back to their own portal (mirrors the role
 * rules enforced centrally in src/proxy.ts).
 */
export function staffHome(role: string): string {
  switch (role) {
    case "owner":
      return "/superadmin";
    case "admin":
    case "manager":
      return "/admin";
    case "kitchen":
      return "/kitchen";
    case "storekeeper":
      return "/storekeeper";
    case "reception":
      return "/reception";
    default:
      return "/staff-login";
  }
}

/**
 * Server-side guard that enforces owner-only access.
 * Redirects an authenticated non-owner to their own portal.
 *
 * @returns Staff session if authorized
 */
export async function requireOwner() {
  const session = await getStaffSession();

  if (!session) {
    redirect("/staff-login?redirect=/superadmin");
  }

  if (session.status !== "active") {
    redirect("/staff-login");
  }

  if (session.role !== "owner") {
    redirect(staffHome(session.role));
  }

  return { staff: session };
}

/**
 * Server-side guard that enforces specific staff roles.
 * An authenticated staffer whose role isn't allowed is bounced to their own
 * portal rather than the generic root.
 */
export async function requireStaffRole(
  allowedRoles: string[],
  redirectPath = "/staff-login",
) {
  const session = await getStaffSession();

  if (!session || session.status !== "active") {
    redirect(redirectPath);
  }

  if (!allowedRoles.includes(session.role)) {
    redirect(staffHome(session.role));
  }

  return session;
}

/**
 * Server-side guard that enforces admin-tier access (admin, manager).
 * Redirects to /staff-login if not authenticated, or to the caller's own
 * portal if they're signed in but not admin-tier. The owner is confined to
 * /superadmin and is bounced there rather than allowed into /admin.
 *
 * @returns Staff session if authorized
 */
export async function requireAdminOrHigher() {
  const session = await getStaffSession();

  if (!session) {
    redirect("/staff-login");
  }

  if (session.status !== "active") {
    redirect("/staff-login");
  }

  if (!["admin", "manager"].includes(session.role)) {
    redirect(staffHome(session.role));
  }

  return { staff: session };
}
