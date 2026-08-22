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
  | "INDIVIDUAL"
  | "COMPANY"
  | "ENTITY"
  | "ADMIN"
  | "SUPER_ADMIN"
  | "CONTENT_ADMIN"
  | "FINANCE_ADMIN";

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
  OWNER: "/projects/ABC/projects",
  CONSULTANT: "/projects/ABC/projects",
CONTRACTOR: "/projects/ABC/contractor",
  SUBCONTRACTOR: "/projects/ABC/projects",
  WORKSHOP: "/projects/ABC/projects",
  FREELANCER: "/projects/ABC/jobs",
  SUPPLIER: "/projects/ABC/marketplace",
  TRADER: "/projects/ABC/marketplace",
  INDIVIDUAL: "/projects/ABC/projects",
  COMPANY: "/projects/ABC/projects",
  ENTITY: "/projects/ABC/projects",
  ADMIN: "/projects/ABC/admin",
  SUPER_ADMIN: "/projects/ABC/admin",
  CONTENT_ADMIN: "/projects/ABC/admin",
  FINANCE_ADMIN: "/projects/ABC/admin",
};

export const PUBLIC_PATHS = [
  "/",
  "/projects/ABC/auth/forgot-password",
  "/projects/ABC/auth/reset-password",
  "/api/v1/health",
  "/api/auth",
];

export const ONBOARDING_PATH = "/projects/ABC/onboarding";

export function getRoleDefaultRoute(role: UserRole | null): string {
  if (!role) return "/";
  return ROLE_DEFAULT_ROUTE[role] ?? "/";
}

export function isPublicPath(pathname: string): boolean {
  if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`))) return true;

  // Company-wide public pages: /projects and any /projects/<slug> listing of
  // company products. The entire /projects/ABC subtree belongs to the
  // (protected) ABC platform and must never match this public prefix.
  if (pathname === "/projects" || pathname.startsWith("/projects/")) {
    return !(pathname === "/projects/ABC" || pathname.startsWith("/projects/ABC/"));
  }

  return false;
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
  isOnboarded: boolean,
  search = ""
): boolean {
  const onHomepageAuth =
    pathname === "/projects/ABC" &&
    (search.includes("login=1") || search.includes("register=1"));

  return (
    isAuthenticated &&
    isOnboarded &&
    (onHomepageAuth || pathname === ONBOARDING_PATH)
  );
}

export function shouldRedirectToLogin(
  pathname: string,
  isAuthenticated: boolean
): boolean {
  return (
    !isAuthenticated &&
    !isPublicPath(pathname) &&
    !pathname.startsWith("/api/") &&
    pathname !== "/projects/ABC"
  );
}
