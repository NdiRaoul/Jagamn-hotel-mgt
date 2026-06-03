import { redirect } from "next/navigation";
import { getStaffSession } from "./staff-session";

/**
 * Server-side guard that enforces owner-only access.
 * Redirects to /admin if the user is not an active owner.
 *
 * @returns Staff session if authorized
 * @throws Redirects to /admin if unauthorized
 */
export async function requireOwner() {
  const session = await getStaffSession();

  if (!session) {
    redirect("/staff-login?redirect=/superadmin");
  }

  if (session.status !== "active" || session.role !== "owner") {
    redirect("/admin");
  }

  return { staff: session };
}

/**
 * Server-side guard that enforces specific staff roles.
 * Redirects if unauthorized.
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
    redirect("/"); // fallback
  }

  return session;
}

/**
 * Server-side guard that enforces admin or higher access (admin, owner).
 * Redirects to /staff-login if not authenticated.
 *
 * @returns Staff session if authorized
 * @throws Redirects if unauthorized
 */
export async function requireAdminOrHigher() {
  const session = await getStaffSession();

  if (!session) {
    redirect("/staff-login");
  }

  if (session.status !== "active") {
    redirect("/staff-login");
  }

  if (!["admin", "owner"].includes(session.role)) {
    redirect("/");
  }

  return { staff: session };
}
