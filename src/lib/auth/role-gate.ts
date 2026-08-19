/**
 * Gatekeeping for OAuth users who have not confirmed account type (roleConfirmed=false).
 * Used by middleware (pages + APIs) and withAuth (API handlers).
 */

export const ROLE_SELECTION_PAGE_PATHS = [
  "/projects/ABC",
  "/projects/ABC/onboarding",
  "/projects/ABC/auth/login",
  "/projects/ABC/auth/register",
  "/projects/ABC/auth/forgot-password",
  "/projects/ABC/auth/reset-password",
] as const;

/** API prefixes/routes allowed before roleConfirmed */
export const ROLE_SELECTION_API_PREFIXES = [
  "/api/auth",
  "/api/upload",
  "/api/v1/entity-registry/me",
  "/api/v1/entity-registry/sync-entity-profile",
  "/api/v1/entity-registry/sync-supplier",
  "/api/v1/entity-registry/profiles",
  "/api/v1/entity-registry/survey",
  "/api/v1/entity-registry/survey-responses",
  "/api/v1/survey-config/public",
  "/api/v1/account-types/subcategories/public",
] as const;

export function isRoleSelectionPageAllowed(pathname: string): boolean {
  return (ROLE_SELECTION_PAGE_PATHS as readonly string[]).includes(pathname);
}

export function isRoleSelectionApiAllowed(pathname: string): boolean {
  const normalized = pathname.startsWith("/projects/ABC/api/")
    ? pathname.slice("/projects/ABC".length)
    : pathname;

  return ROLE_SELECTION_API_PREFIXES.some(
    (prefix) => normalized === prefix || normalized.startsWith(`${prefix}/`),
  );
}

export function isAbcPlatformPath(pathname: string): boolean {
  return pathname === "/projects/ABC" || pathname.startsWith("/projects/ABC/");
}

export const ROLE_NOT_CONFIRMED_CODE = "AUTH_ROLE_NOT_CONFIRMED";
