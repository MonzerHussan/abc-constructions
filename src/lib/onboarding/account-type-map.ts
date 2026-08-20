import type { PlatformAccountType } from "@/lib/account-types";
import type { OnboardingAccountType } from "@/lib/onboarding/types";

/** Maps platform role / account type to legacy onboarding registry accountType. */
export function toOnboardingAccountType(
  roleOrType: string | null | undefined,
): OnboardingAccountType | "" {
  switch (roleOrType) {
    case "SUPPLIER":
    case "TRADER":
    case "supplier":
      return "supplier";
    case "CONTRACTOR":
    case "COMPANY":
    case "mainContractor":
      return "mainContractor";
    case "SUBCONTRACTOR":
    case "subcontractor":
      return "subcontractor";
    case "CONSULTANT":
    case "consultant":
      return "consultant";
    case "OWNER":
    case "ENTITY":
    case "INDIVIDUAL":
    case "clientInvestor":
      return "clientInvestor";
    default:
      return "";
  }
}

export function isIndividualAccountType(accountType: PlatformAccountType | null): boolean {
  return accountType === "INDIVIDUAL";
}
