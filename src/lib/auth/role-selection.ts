import { UserRole } from "@/generated/prisma/client";

export const GOOGLE_ONBOARDING_CALLBACK = "/projects/ABC/onboarding?source=google";

export const SELF_REGISTRATION_ROLE_VALUES = [
  UserRole.OWNER,
  UserRole.CONSULTANT,
  UserRole.CONTRACTOR,
  UserRole.SUBCONTRACTOR,
  UserRole.WORKSHOP,
  UserRole.FREELANCER,
  UserRole.SUPPLIER,
  UserRole.TRADER,
] as const;

export type SelfRegistrationRole = (typeof SELF_REGISTRATION_ROLE_VALUES)[number];

export function isSelfRegistrationRole(role: string): role is SelfRegistrationRole {
  return (SELF_REGISTRATION_ROLE_VALUES as readonly string[]).includes(role);
}

/** OAuth-only users must explicitly confirm role before platform access. */
export function needsRoleSelection(user: {
  roleConfirmed?: boolean | null;
  password?: string | null;
}): boolean {
  if (user.roleConfirmed === true) return false;
  if (user.roleConfirmed === false) return true;
  // Fallback when DB column not migrated yet: Google/OAuth users without password.
  return !user.password;
}

export const ONBOARDING_ACCOUNT_TO_USER_ROLE: Record<string, UserRole> = {
  supplier: UserRole.SUPPLIER,
  mainContractor: UserRole.CONTRACTOR,
  subcontractor: UserRole.SUBCONTRACTOR,
  consultant: UserRole.CONSULTANT,
  clientInvestor: UserRole.OWNER,
};
