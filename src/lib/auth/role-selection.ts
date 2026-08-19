import { UserRole } from "@/generated/prisma/enums";
import {
  PLATFORM_ACCOUNT_TYPES,
  platformAccountTypeToUserRole,
  isPlatformAccountType,
  type PlatformAccountType,
} from "@/lib/account-types";

export const GOOGLE_ONBOARDING_CALLBACK = "/projects/ABC/onboarding?source=google";

/** Roles allowed during self-registration / set-role (the 9 platform account types). */
export const SELF_REGISTRATION_ROLE_VALUES = PLATFORM_ACCOUNT_TYPES.map((t) => t.role) as [
  UserRole,
  ...UserRole[],
];

export type SelfRegistrationRole = (typeof SELF_REGISTRATION_ROLE_VALUES)[number];

export function isSelfRegistrationRole(role: string): role is SelfRegistrationRole {
  return (SELF_REGISTRATION_ROLE_VALUES as readonly string[]).includes(role);
}

/** OAuth-only users must explicitly confirm account type before platform access. */
export function needsRoleSelection(user: {
  roleConfirmed?: boolean | null;
  password?: string | null;
}): boolean {
  if (user.roleConfirmed === true) return false;
  if (user.roleConfirmed === false) return true;
  return !user.password;
}

export const ONBOARDING_ACCOUNT_TO_USER_ROLE: Record<PlatformAccountType, UserRole> =
  Object.fromEntries(
    PLATFORM_ACCOUNT_TYPES.map((t) => [t.id, t.role]),
  ) as Record<PlatformAccountType, UserRole>;

export function onboardingAccountTypeToRole(accountType: string): UserRole | null {
  if (!isPlatformAccountType(accountType)) return null;
  return platformAccountTypeToUserRole(accountType);
}
