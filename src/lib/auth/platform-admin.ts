import { getRoleDefaultRoute, type UserRole } from "@/lib/navigation/types";

export function isPlatformAdminRole(role: string | null | undefined): boolean {
  return role === "ADMIN" || role === "SUPER_ADMIN";
}

/** Admins skip onboarding and may access their role default route directly. */
export function getAdminLandingPath(role: UserRole | null): string {
  return getRoleDefaultRoute(role);
}
