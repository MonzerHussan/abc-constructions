"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useLanguage } from "@/lib/LanguageContext";
import { getRoleDefaultRoute, type UserRole } from "@/lib/navigation/types";
import { toOnboardingAccountType, isIndividualAccountType } from "@/lib/onboarding/account-type-map";
import { StepIndicator } from "./StepIndicator";
import { StepProfileReview } from "./StepProfileReview";
import { StepIdentityVerification } from "./StepIdentityVerification";
import { DynamicSurveyStep } from "./DynamicSurveyStep";
import { fetchUserMe, submitOnboarding } from "@/lib/onboarding/api";
import { saveSurveyDataToProfile } from "@/lib/onboarding/survey-client";
import {
  buildOnboardingProfileFromSources,
  clearRegistrationPrefill,
  loadRegistrationPrefill,
} from "@/lib/onboarding/prefill-from-registration";
import type {
  OnboardingState,
  OnboardingProfile,
  OnboardingDocument,
} from "@/lib/onboarding/types";
import type { PublicSectionContent } from "@/modules/onboarding-survey";
import { isPlatformAccountType } from "@/lib/account-types";
import AuthPanelLogo from "@/components/homepage/AuthPanelLogo";
import {
  AUTH_PANEL_HEADER_SUBTITLE,
  AUTH_PANEL_HEADER_TITLE,
} from "@/components/homepage/auth-panel-styles";

const defaultDocuments: OnboardingDocument[] = [
  {
    id: "default-commercial",
    type: "commercialRegistration",
    file: null,
    name: "",
    status: "pending",
    progress: 0,
  },
  {
    id: "default-national",
    type: "nationalId",
    file: null,
    name: "",
    status: "pending",
    progress: 0,
  },
];

const initialState: OnboardingState = {
  step: 1,
  profile: {
    accountType: "",
    platformAccountType: "",
    fullName: "",
    email: "",
    phone: "",
    companyName: "",
    companyType: "",
    jobTitle: "",
    companyDescription: "",
    country: "",
    countryCode: "AE",
    city: "",
    address: "",
    commercialRegistration: "",
    requestIdentityVerification: false,
  },
  documents: defaultDocuments,
  survey: {
    lookingFor: [],
    selectedCategories: [],
    subcategories: [],
    hasProjects: "",
    budgetRange: "",
    projectLocations: [],
    urgency: "",
  },
  isSubmitting: false,
  error: null,
};

const steps = ["obReviewTitle", "obIdentityStep", "obStep3"];

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePhone(phone: string): boolean {
  return /^[\+\d\s\-\(\)]{8,}$/.test(phone);
}

interface OnboardingWizardProps {
  onSectionContentChange?: (content: PublicSectionContent | null) => void;
}

export function OnboardingWizard(props: OnboardingWizardProps = {}) {
  const { onSectionContentChange } = props;
  const { t, dir } = useLanguage();
  const router = useRouter();
  const { data: session } = useSession();
  const role = (session?.user as { role?: UserRole } | undefined)?.role ?? null;
  const [state, setState] = useState<OnboardingState>(initialState);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState<{ trackingId: string; goVerification: boolean } | null>(null);
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const prefill = loadRegistrationPrefill();
    if (prefill || session?.user) {
      setState((prev) => ({
        ...prev,
        profile: buildOnboardingProfileFromSources({
          prefill,
          sessionName: session?.user?.name,
          sessionEmail: session?.user?.email,
          sessionRole: role,
        }),
      }));
    }
    (async () => {
      try {
        const user = await fetchUserMe();
        if (cancelled) return;
        setState((prev) => ({
          ...prev,
          profile: buildOnboardingProfileFromSources({
            user,
            prefill,
            sessionName: session?.user?.name,
            sessionEmail: session?.user?.email,
            sessionRole: role,
          }),
        }));
      } catch {
        /* prefill + session already applied above */
      } finally {
        if (!cancelled) setBooting(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [session, role]);

  const updateProfile = useCallback((profile: OnboardingProfile) => {
    setState((prev) => ({ ...prev, profile }));
  }, []);

  const updateDocuments = useCallback((documents: OnboardingDocument[]) => {
    setState((prev) => ({ ...prev, documents }));
  }, []);

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};
    const { profile } = state;

    if (step === 1) {
      if (!profile.fullName.trim()) newErrors.fullName = t("obRequired");
      if (!profile.email.trim()) {
        newErrors.email = t("obRequired");
      } else if (!validateEmail(profile.email)) {
        newErrors.email = t("obInvalidEmail");
      }
      if (!profile.phone.trim()) {
        newErrors.phone = t("obRequired");
      } else if (!validatePhone(profile.phone)) {
        newErrors.phone = t("obInvalidPhone");
      }
      if (
        !isIndividualAccountType(profile.platformAccountType || null) &&
        !profile.companyName.trim()
      ) {
        newErrors.companyName = t("obRequired");
      }
      if (!profile.companyType.trim()) {
        newErrors.companyType = t("regTypeRequired");
      }
    }

    if (step === 2 && profile.requestIdentityVerification) {
      const uploadedCount = state.documents.filter((doc) => doc.status === "uploaded").length;
      if (uploadedCount === 0) newErrors.documents = t("obDocRequired");
    }

    if (step === 3) {
      /* Dynamic survey validates per section inside DynamicSurveyStep */
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(state.step)) {
      setState((prev) => ({ ...prev, step: prev.step + 1, error: null }));
    }
  };

  const handleBack = () => {
    setState((prev) => ({ ...prev, step: prev.step - 1, error: null }));
    setErrors({});
  };

  const handleSurveyComplete = async (surveyAnswers: Record<string, unknown>) => {
    setState((prev) => ({ ...prev, isSubmitting: true, error: null }));
    try {
      const response = await submitOnboarding(state);
      if (response.success && response.trackingId) {
        await saveSurveyDataToProfile({
          accountType: state.profile.platformAccountType,
          answers: surveyAnswers,
          submittedAt: new Date().toISOString(),
        }).catch(() => undefined);
        clearRegistrationPrefill();
        setSuccess({
          trackingId: response.trackingId,
          goVerification: state.profile.requestIdentityVerification,
        });
      } else {
        setState((prev) => ({
          ...prev,
          isSubmitting: false,
          error: response.message || "Submission failed",
        }));
      }
    } catch (err) {
      setState((prev) => ({
        ...prev,
        isSubmitting: false,
        error: err instanceof Error ? err.message : "Unknown error",
      }));
    }
  };

  if (booting) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-8 h-8 border-4 border-secondary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (success) {
    const destination = success.goVerification
      ? "/projects/ABC/verification"
      : getRoleDefaultRoute(role);
    return (
      <div className="w-full overflow-hidden bg-white border border-surface-200 shadow-2xl p-6 text-center">
        <h2 className="text-lg font-bold text-primary-500 mb-2">{t("obSuccessTitle")}</h2>
        <p className="text-xs text-surface-600 mb-4">{t("obSuccessMessage")}</p>
        <p className="text-sm font-bold text-secondary-600 mb-6">{success.trackingId}</p>
        <button
          type="button"
          onClick={() => router.push(destination)}
          className="px-6 py-2.5 text-xs font-bold text-white bg-secondary-500 hover:bg-secondary-600"
        >
          {t("obSuccessCta")}
        </button>
      </div>
    );
  }

  return (
    <div dir={dir} className="w-full overflow-hidden bg-white border border-surface-200 shadow-2xl">
      <div className="flex items-center gap-2.5 border-b border-surface-100 px-3 py-2">
        <AuthPanelLogo alt={t("appName")} />
        <div className="min-w-0">
          <p className={AUTH_PANEL_HEADER_TITLE}>{t("obTitle")}</p>
          <p className={AUTH_PANEL_HEADER_SUBTITLE}>{t("obSubtitle")}</p>
        </div>
      </div>

      <div className="px-3 py-3 space-y-3">
        <StepIndicator steps={steps} current={state.step} />

        {state.step === 1 && (
          <StepProfileReview profile={state.profile} onChange={updateProfile} errors={errors} />
        )}
        {state.step === 2 && (
          <StepIdentityVerification
            profile={state.profile}
            onProfileChange={updateProfile}
            documents={state.documents}
            onDocumentsChange={updateDocuments}
            errors={errors}
          />
        )}
        {state.step === 3 && isPlatformAccountType(state.profile.platformAccountType) && (
          <>
            <p className="text-[10px] text-surface-500">{t("obSurveyAutoSaveHint")}</p>
            <DynamicSurveyStep
              platformAccountType={state.profile.platformAccountType}
              profile={state.profile}
              onSectionContentChange={onSectionContentChange}
              onComplete={handleSurveyComplete}
            />
          </>
        )}
        {state.step === 3 && !isPlatformAccountType(state.profile.platformAccountType) && (
          <p className="text-xs text-danger-600">{t("obSelectAccountType")}</p>
        )}

        {state.error && (
          <div className="bg-danger-50 text-danger-600 text-xs rounded-none px-3 py-2">{state.error}</div>
        )}

        {state.step < 3 && (
          <div className="flex items-center justify-between gap-2 pt-1">
            <button
              type="button"
              onClick={handleBack}
              disabled={state.step === 1}
              className="px-3 py-1.5 text-[11px] font-medium border border-surface-300 text-surface-700 hover:bg-surface-50 disabled:opacity-50"
            >
              {t("obBack")}
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="px-4 py-1.5 text-[11px] font-bold text-white bg-secondary-500 hover:bg-secondary-600"
            >
              {t("obNext")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default OnboardingWizard;
