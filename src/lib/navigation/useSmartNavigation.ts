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

export interface UseSmartNavigationResult {
  isLoading: boolean;
  isOnboarded: boolean | null;
  roleConfirmed: boolean | null;
  role: UserRole | null;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useSmartNavigation(): UseSmartNavigationResult {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [isOnboarded, setIsOnboarded] = useState<boolean | null>(null);
  const [roleConfirmed, setRoleConfirmed] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isAuthenticated = status === "authenticated";
  const sessionRoleConfirmed = (session?.user as { roleConfirmed?: boolean } | undefined)?.roleConfirmed;
  const isLoading =
    status === "loading" ||
    (isAuthenticated && (isOnboarded === null || roleConfirmed === null));
  const role = (session?.user as { role?: UserRole } | undefined)?.role ?? null;

  const check = async () => {
    if (!isAuthenticated) {
      setIsOnboarded(null);
      setRoleConfirmed(null);
      return;
    }
    try {
      const data = await fetchEntityRegistryMe();
      setIsOnboarded(data.isOnboarded);
      setRoleConfirmed(data.roleConfirmed ?? sessionRoleConfirmed ?? false);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setIsOnboarded(false);
      setRoleConfirmed(sessionRoleConfirmed ?? false);
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
      const loginUrl = new URL("/projects/ABC/auth/login", window.location.origin);
      loginUrl.searchParams.set("callbackUrl", pathname);
      router.replace(loginUrl.toString());
      return;
    }

    // 2. Authenticated but role not confirmed or not onboarded → onboarding only.
    const confirmed = roleConfirmed ?? false;
    if (
      isOnboarded === false ||
      !confirmed
    ) {
      if (shouldRedirectToOnboarding(pathname, isAuthenticated, isOnboarded ?? false, confirmed)) {
        router.replace(ONBOARDING_PATH);
        return;
      }
    }

    // 3. Authenticated, role confirmed, and onboarded reaching auth/onboarding pages → role dashboard.
    if (isOnboarded === true && confirmed && shouldRedirectToDashboard(pathname, isAuthenticated, isOnboarded)) {
      const destination = getRoleDefaultRoute(role);
      router.replace(destination);
      return;
    }
  }, [isLoading, isAuthenticated, isOnboarded, roleConfirmed, pathname, role, router]);

  return {
    isLoading,
    isOnboarded,
    roleConfirmed,
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
