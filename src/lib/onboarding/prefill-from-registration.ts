import type { OnboardingProfile } from "@/lib/onboarding/types";
import type { UserMe } from "@/lib/onboarding/api";
import { userRoleToPlatformAccountType } from "@/lib/account-types";
import { toOnboardingAccountType } from "@/lib/onboarding/account-type-map";
import { resolveCityId, resolveCountryCode } from "@/lib/data/countries";
import type { UserRole } from "@/lib/navigation/types";

export const REGISTRATION_PREFILL_KEY = "abc:registrationProfile";

/** Snapshot written right after inline registration, before onboarding redirect. */
export interface RegistrationPrefill {
  name: string;
  email: string;
  phone: string;
  companyName: string;
  companyType: string;
  jobTitle: string;
  countryCode: string;
  city: string;
  role: string;
}

export function saveRegistrationPrefill(data: RegistrationPrefill): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(REGISTRATION_PREFILL_KEY, JSON.stringify(data));
  } catch {
    /* ignore quota / private mode */
  }
}

export function loadRegistrationPrefill(): RegistrationPrefill | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(REGISTRATION_PREFILL_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as RegistrationPrefill;
  } catch {
    return null;
  }
}

export function clearRegistrationPrefill(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(REGISTRATION_PREFILL_KEY);
  } catch {
    /* ignore */
  }
}

function coalesce(...values: Array<string | null | undefined>): string {
  for (const v of values) {
    if (v != null && String(v).trim() !== "") return String(v).trim();
  }
  return "";
}

/** Build onboarding profile from DB user + optional registration snapshot + session. */
export function buildOnboardingProfileFromSources(input: {
  user?: UserMe | null;
  prefill?: RegistrationPrefill | null;
  sessionName?: string | null;
  sessionEmail?: string | null;
  sessionRole?: UserRole | null;
}): OnboardingProfile {
  const { user, prefill, sessionName, sessionEmail, sessionRole } = input;
  const role = (user?.role ?? prefill?.role ?? sessionRole ?? "") as string;
  const platformAccountType = userRoleToPlatformAccountType(role) ?? "";
  const countryRaw = coalesce(user?.country, prefill?.countryCode);
  const countryCode = resolveCountryCode(countryRaw);
  const cityRaw = coalesce(user?.city, prefill?.city);
  const city = resolveCityId(countryCode, cityRaw) || cityRaw;

  return {
    accountType: toOnboardingAccountType(role),
    platformAccountType,
    fullName: coalesce(user?.name, prefill?.name, sessionName),
    email: coalesce(user?.email, prefill?.email, sessionEmail),
    phone: coalesce(user?.phone, prefill?.phone),
    companyName: coalesce(user?.companyName, prefill?.companyName),
    companyType: coalesce(user?.companyType, prefill?.companyType),
    companyDescription: "",
    jobTitle: coalesce(prefill?.jobTitle, user?.bio),
    countryCode,
    country: countryCode,
    city,
    address: user?.address ?? "",
    commercialRegistration: "",
    avatarUrl: user?.avatar ?? undefined,
    companyLogoUrl: user?.companyLogo ?? undefined,
    location: user?.location ?? undefined,
    requestIdentityVerification: false,
  };
}
