"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  type EntityRegistryMe,
  type UserRole,
  getRoleDefaultRoute,
  shouldRedirectToOnboarding,
  shouldRedirectToDashboard,
  shouldRedirectToLogin,
  isPublicPath,
  ONBOARDING_PATH,
} from "./types";
import { fetchEntityRegistryMe } from "./api";
import { platformLoginUrl } from "@/lib/homepage-auth-routes";
import { isPlatformAdminRole, getAdminLandingPath } from "@/lib/auth/platform-admin";

export interface UseSmartNavigationResult {
  isLoading: boolean;
  isOnboarded: boolean | null;
  role: UserRole | null;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useSmartNavigation(): UseSmartNavigationResult {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [isOnboarded, setIsOnboarded] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isAuthenticated = status === "authenticated";
  const isLoading = status === "loading" || (isAuthenticated && isOnboarded === null);
  const role = (session?.user as { role?: UserRole } | undefined)?.role ?? null;

  const check = async () => {
    if (!isAuthenticated) {
      setIsOnboarded(null);
      return;
    }
    try {
      const data = await fetchEntityRegistryMe();
      setIsOnboarded(data.isOnboarded);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      // Fail closed: assume not onboarded until we can verify.
      setIsOnboarded(false);
    }
  };

  useEffect(() => {
    check();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, pathname]);

  useEffect(() => {
    if (isLoading || !pathname) return;

    // 1. Unauthenticated users trying to reach a protected page → login.
    if (shouldRedirectToLogin(pathname, isAuthenticated)) {
      router.replace(platformLoginUrl(pathname));
      return;
    }

    // Admins skip onboarding entirely.
    if (isPlatformAdminRole(role)) {
      if (pathname === ONBOARDING_PATH) {
        router.replace(getAdminLandingPath(role));
      }
      return;
    }

    // 2. Authenticated but not onboarded → /onboarding (except public pages).
    if (isOnboarded === false && shouldRedirectToOnboarding(pathname, isAuthenticated, isOnboarded)) {
      router.replace(ONBOARDING_PATH);
      return;
    }

    // 3. Authenticated and onboarded reaching auth/onboarding pages → role dashboard.
    if (isOnboarded === true && shouldRedirectToDashboard(pathname, isAuthenticated, isOnboarded, typeof window !== "undefined" ? window.location.search : "")) {
      const destination = getRoleDefaultRoute(role);
      router.replace(destination);
      return;
    }
  }, [isLoading, isAuthenticated, isOnboarded, pathname, role, router]);

  return {
    isLoading,
    isOnboarded,
    role,
    error,
    refresh: check,
  };
}

/**
 * Returns true while the smart navigation router is still determining
 * authentication and onboarding state. Useful for showing a splash screen.
 */
export function useNavigationBooting(): boolean {
  const { isLoading } = useSmartNavigation();
  return isLoading;
}
