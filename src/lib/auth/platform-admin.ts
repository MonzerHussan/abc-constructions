import { getRoleDefaultRoute, type UserRole } from "@/lib/navigation/types";

/** Platform back-office roles (not end-user account types). */
export const PLATFORM_STAFF_ROLES = [
  "SUPER_ADMIN",
  "ADMIN",
  "CONTENT_ADMIN",
  "FINANCE_ADMIN",
] as const;

export type PlatformStaffRole = (typeof PLATFORM_STAFF_ROLES)[number];

export function isPlatformStaffRole(role: string | null | undefined): role is PlatformStaffRole {
  return !!role && (PLATFORM_STAFF_ROLES as readonly string[]).includes(role);
}

export function isPlatformAdminRole(role: string | null | undefined): boolean {
  return isPlatformStaffRole(role);
}

export function isSuperAdminRole(role: string | null | undefined): boolean {
  return role === "SUPER_ADMIN";
}

/** Which admin sidebar modules each staff role may access. */
const STAFF_MODULE_ACCESS: Record<PlatformStaffRole, string[] | "*"> = {
  SUPER_ADMIN: "*",
  ADMIN: "*",
  CONTENT_ADMIN: [
    "dashboard",
    "homepage",
    "content",
    "onboarding",
    "surveys",
    "support",
  ],
  FINANCE_ADMIN: ["dashboard", "finance", "procurement", "support"],
};

export function canAccessAdminModule(
  role: string | null | undefined,
  moduleKey: string,
): boolean {
  if (!isPlatformStaffRole(role)) return false;
  const access = STAFF_MODULE_ACCESS[role];
  if (access === "*") return true;
  return access.includes(moduleKey);
}

/** Admins skip onboarding and may access their role default route directly. */
export function getAdminLandingPath(role: UserRole | null): string {
  return getRoleDefaultRoute(role);
}
