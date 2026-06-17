// ── Staff management RBAC policy ─────────────────────────────────────────────
// Single source of truth for who may create staff, assign roles, and set
// salaries. Enforced server-side in the staff API routes and mirrored in the
// UI for affordance only.
//
// Rules:
//   • Only the owner (superadmin) may create or assign the elevated roles
//     (owner / admin / manager). An admin cannot create another admin, and a
//     manager cannot create another manager.
//   • Admins and managers may create/manage operational staff (reception,
//     kitchen, storekeeper, …) and set their salaries.
//   • Salary of an elevated role (admin/manager) may only be set by the owner.
//   • Nobody may change their own salary.
//   • The owner may promote any staff member to any role (e.g. reception → admin).

/** Roles allowed to manage other staff at all. */
export const STAFF_MANAGER_ROLES = ["owner", "admin", "manager"] as const;

/** Roles that only the owner may grant or modify. */
export const OWNER_ONLY_ROLES = ["owner", "admin", "manager"] as const;

export function canManageStaff(actorRole: string): boolean {
  return (STAFF_MANAGER_ROLES as readonly string[]).includes(actorRole);
}

/** May `actorRole` assign/create the given `targetRole`? */
export function canAssignRole(actorRole: string, targetRole: string): boolean {
  if ((OWNER_ONLY_ROLES as readonly string[]).includes(targetRole)) {
    return actorRole === "owner";
  }
  return canManageStaff(actorRole);
}

/**
 * May `actorRole` modify the staff record of someone whose CURRENT role is
 * `targetExistingRole`? Admins/managers cannot touch elevated-role records;
 * only the owner can.
 */
export function canModifyStaff(
  actorRole: string,
  targetExistingRole: string,
): boolean {
  if ((OWNER_ONLY_ROLES as readonly string[]).includes(targetExistingRole)) {
    return actorRole === "owner";
  }
  return canManageStaff(actorRole);
}

/** May `actorRole` set a salary on a record with effective role `targetRole`? */
export function canSetSalary(
  actorRole: string,
  opts: { targetRole: string; isSelf: boolean },
): boolean {
  if (opts.isSelf) return false;
  if ((OWNER_ONLY_ROLES as readonly string[]).includes(opts.targetRole)) {
    return actorRole === "owner";
  }
  return canManageStaff(actorRole);
}

/** Roles a given actor is permitted to choose in the create/edit UI. */
export function assignableRolesFor(actorRole: string): string[] {
  const operational = ["reception", "kitchen", "storekeeper"];
  if (actorRole === "owner") {
    return ["admin", "manager", ...operational];
  }
  if (actorRole === "admin" || actorRole === "manager") {
    return operational;
  }
  return [];
}
