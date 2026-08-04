/**
 * Smart Navigation Router — role-based landing page mapping.
 *
 * Each user role is mapped to the most relevant existing primary page.
 * These mappings are additive; dedicated dashboards can be introduced later.
 */

export type UserRole =
  | "OWNER"
  | "CONSULTANT"
  | "CONTRACTOR"
  | "SUBCONTRACTOR"
  | "WORKSHOP"
  | "FREELANCER"
  | "SUPPLIER"
  | "TRADER"
  | "ADMIN"
  | "SUPER_ADMIN";

export interface EntityRegistryMe {
  isOnboarded: boolean;
  profile: Record<string, unknown> | null;
  entity: Record<string, unknown> | null;
}

export interface SmartNavigationState {
  isAuthenticated: boolean;
  role: UserRole | null;
  isOnboarded: boolean;
  isLoading: boolean;
  error: string | null;
}

export const ROLE_DEFAULT_ROUTE: Record<UserRole, string> = {
  OWNER: "/projects",
  CONSULTANT: "/projects",
  CONTRACTOR: "/projects",
  SUBCONTRACTOR: "/projects",
  WORKSHOP: "/projects",
  FREELANCER: "/jobs",
  SUPPLIER: "/marketplace",
  TRADER: "/marketplace",
  ADMIN: "/admin",
  SUPER_ADMIN: "/admin",
};

export const PUBLIC_PATHS = [
  "/",
  "/auth/login",
  "/auth/register",
  "/auth/forgot-password",
  "/auth/reset-password",
  "/api/v1/health",
  "/api/auth",
];

export const ONBOARDING_PATH = "/onboarding";

export function getRoleDefaultRoute(role: UserRole | null): string {
  if (!role) return "/";
  return ROLE_DEFAULT_ROUTE[role] ?? "/";
}

export function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export function shouldRedirectToOnboarding(
  pathname: string,
  isAuthenticated: boolean,
  isOnboarded: boolean
): boolean {
  return isAuthenticated && !isOnboarded && pathname !== ONBOARDING_PATH && !isPublicPath(pathname);
}

export function shouldRedirectToDashboard(
  pathname: string,
  isAuthenticated: boolean,
  isOnboarded: boolean
): boolean {
  return (
    isAuthenticated &&
    isOnboarded &&
    (pathname === "/auth/login" || pathname === "/auth/register" || pathname === ONBOARDING_PATH)
  );
}

export function shouldRedirectToLogin(
  pathname: string,
  isAuthenticated: boolean
): boolean {
  return !isAuthenticated && !isPublicPath(pathname) && !pathname.startsWith("/api/");
}
