import type { NextRequest } from "next/server";
import { ONBOARDING_PATH } from "@/lib/navigation/types";
import { isAbcPlatformPath, isRoleSelectionApiAllowed } from "@/lib/auth/role-gate";

/** Pages reachable while authenticated but not yet onboarded. */
export const PRE_ONBOARDING_PAGE_PATHS = [
  /** Homepage — browse-only; transactional routes stay gated until onboarding completes */
  "/projects/ABC",
  ONBOARDING_PATH,
  "/projects/ABC/auth/forgot-password",
  "/projects/ABC/auth/reset-password",
] as const;

/** Extra read-only APIs needed during onboarding (role-selection APIs are included). */
const PRE_ONBOARDING_EXTRA_API_PREFIXES = [
  "/api/homepage",
  "/api/v1/account-types/subcategories/public",
  "/api/v1/survey-config/public",
  "/api/v1/users/me",
  "/api/v1/onboarding/side-content",
  "/api/v1/onboarding/survey",
  "/api/v1/entity-registry/survey",
  "/api/v1/contact-verification",
  "/api/upload",
] as const;

export function isPreOnboardingPageAllowed(pathname: string): boolean {
  return PRE_ONBOARDING_PAGE_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}

export function isPreOnboardingApiAllowed(pathname: string): boolean {
  if (isRoleSelectionApiAllowed(pathname)) return true;

  const normalized = pathname.startsWith("/projects/ABC/api/")
    ? pathname.slice("/projects/ABC".length)
    : pathname;

  return PRE_ONBOARDING_EXTRA_API_PREFIXES.some(
    (prefix) => normalized === prefix || normalized.startsWith(`${prefix}/`),
  );
}

export async function fetchUserOnboardedStatus(request: NextRequest): Promise<boolean> {
  try {
    const res = await fetch(new URL("/api/v1/entity-registry/me", request.url), {
      headers: { cookie: request.headers.get("cookie") ?? "" },
      cache: "no-store",
      signal: AbortSignal.timeout(8_000),
    });
    if (!res.ok) return false;
    const json = (await res.json()) as { data?: { isOnboarded?: boolean } };
    return json.data?.isOnboarded === true;
  } catch {
    return false;
  }
}

export { ONBOARDING_PATH, isAbcPlatformPath };
