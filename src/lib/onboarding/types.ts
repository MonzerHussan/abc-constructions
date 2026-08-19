import type { PlatformAccountType } from "@/lib/account-types";

export type OnboardingAccountType = PlatformAccountType | "";

export interface OnboardingProfile {
  accountType: OnboardingAccountType;
  fullName: string;
  email: string;
  phone: string;
  companyName: string;
  commercialRegistration?: string;
}

export interface OnboardingDocument {
  id: string;
  type: "commercialRegistration" | "nationalId" | "vatCertificate" | "license" | "other";
  file: File | null;
  name: string;
  url?: string;
  status: "pending" | "uploading" | "uploaded" | "error";
  progress: number;
}

export interface OnboardingSurvey {
  /** Account type at time of survey (mirrors profile.accountType). */
  accountType: OnboardingAccountType;
  /** Legacy — stores [accountType] for entity-registry relevantCategories. */
  lookingFor: string[];
  selectedCategories: string[];
  /** Admin-managed subcategories for the selected account type. */
  subcategories: string[];
  hasProjects: "yes" | "no" | "soon" | "";
  budgetRange: "small" | "medium" | "large" | "enterprise" | "";
  projectLocations: string[];
  urgency: "immediate" | "3months" | "6months" | "future" | "";
}

export interface OnboardingState {
  step: number;
  profile: OnboardingProfile;
  documents: OnboardingDocument[];
  survey: OnboardingSurvey;
  isSubmitting: boolean;
  error: string | null;
}

export interface OnboardingSubmission {
  profile: OnboardingProfile;
  documents: Omit<OnboardingDocument, "file">[];
  survey: OnboardingSurvey;
  submittedAt: string;
}

export interface OnboardingApiResponse {
  success: boolean;
  message?: string;
  trackingId?: string;
  errors?: Record<string, string>;
}
