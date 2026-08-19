"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Card, CardBody } from "@/components/ui/card";
import { useLanguage } from "@/lib/LanguageContext";
import { StepIndicator } from "./StepIndicator";
import { StepAccountType } from "./StepAccountType";
import { StepDocuments } from "./StepDocuments";
import { StepSurvey } from "./StepSurvey";
import { submitOnboarding, syncUserRoleFromProfile } from "@/lib/onboarding/api";
import { getRoleDefaultRoute, type UserRole } from "@/lib/navigation/types";
import type {
  OnboardingState,
  OnboardingProfile,
  OnboardingDocument,
  OnboardingSurvey,
} from "@/lib/onboarding/types";
import { PlatformAccountType } from "@/lib/account-types";
import { requiresOrganizationName, isPlatformAccountType } from "@/lib/account-types";

const initialState: OnboardingState = {
  step: 1,
  profile: {
    accountType: "",
    fullName: "",
    email: "",
    phone: "",
    companyName: "",
    commercialRegistration: "",
  },
  documents: [
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
  ],
  survey: {
    accountType: "",
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

const steps = ["obStep1", "obStep2", "obStep3"];

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePhone(phone: string): boolean {
  return /^[\+\d\s\-\(\)]{8,}$/.test(phone);
}

export function OnboardingWizard() {
  const { t, dir } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, update: updateSession } = useSession();
  const [state, setState] = useState<OnboardingState>(initialState);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState<{ trackingId: string } | null>(null);
  const [stepBusy, setStepBusy] = useState(false);

  const googleSource =
    searchParams.get("source") === "google" ||
    searchParams.get("source") === "role-required";
  const roleConfirmed = (session?.user as { roleConfirmed?: boolean } | undefined)?.roleConfirmed;
  const emailVerified = (session?.user as { isEmailVerified?: boolean } | undefined)?.isEmailVerified;
  const mustConfirmRole = roleConfirmed === false;

  useEffect(() => {
    if (!session?.user) return;
    setState((prev) => ({
      ...prev,
      profile: {
        ...prev.profile,
        fullName: prev.profile.fullName || session.user?.name || "",
        email: prev.profile.email || session.user?.email || "",
        phone: prev.profile.phone || (session.user as { phone?: string }).phone || "",
      },
    }));
  }, [session]);

  useEffect(() => {
    if (mustConfirmRole && state.step > 1) {
      setState((prev) => ({ ...prev, step: 1 }));
    }
  }, [mustConfirmRole, state.step]);

  const updateProfile = useCallback((profile: OnboardingProfile) => {
    setState((prev) => ({
      ...prev,
      profile,
      survey:
        profile.accountType !== prev.profile.accountType
          ? {
              ...prev.survey,
              accountType: profile.accountType,
              subcategories: [],
              selectedCategories: profile.accountType ? [profile.accountType] : [],
              lookingFor: profile.accountType ? [profile.accountType] : [],
            }
          : prev.survey,
    }));
  }, []);

  const updateDocuments = useCallback((documents: OnboardingDocument[]) => {
    setState((prev) => ({ ...prev, documents }));
  }, []);

  const updateSurvey = useCallback((survey: OnboardingSurvey) => {
    setState((prev) => ({ ...prev, survey }));
  }, []);

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      const { profile } = state;
      if (!isPlatformAccountType(profile.accountType)) newErrors.accountType = "obRequired";
      if (!profile.fullName.trim()) newErrors.fullName = "obRequired";
      const needsCompany =
        isPlatformAccountType(profile.accountType) &&
        requiresOrganizationName(profile.accountType as PlatformAccountType);
      if (needsCompany && !profile.companyName.trim()) newErrors.companyName = "obRequired";
      if (!profile.email.trim()) {
        newErrors.email = "obRequired";
      } else if (!validateEmail(profile.email)) {
        newErrors.email = "obInvalidEmail";
      }
      if (!profile.phone.trim()) {
        newErrors.phone = "obRequired";
      } else if (!validatePhone(profile.phone)) {
        newErrors.phone = "obInvalidPhone";
      }
    }

    if (step === 2) {
      const uploadedCount = state.documents.filter(
        (doc) => doc.status === "uploaded"
      ).length;
      if (uploadedCount === 0) newErrors.documents = "obDocRequired";
    }

    if (step === 3) {
      const { survey } = state;
      if (survey.subcategories.length === 0) newErrors.subcategories = "obRequired";
      if (!survey.hasProjects) newErrors.hasProjects = "obRequired";
      if (!survey.budgetRange) newErrors.budgetRange = "obRequired";
      if (!survey.urgency) newErrors.urgency = "obRequired";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = async () => {
    if (!validateStep(state.step)) return;

    if (mustConfirmRole && state.step > 1) {
      setState((prev) => ({ ...prev, step: 1, error: t("obGoogleRoleRequired") }));
      return;
    }

    if (state.step === 1) {
      setStepBusy(true);
      setState((prev) => ({ ...prev, error: null }));
      try {
        await syncUserRoleFromProfile(state.profile);
        await updateSession?.();
        setState((prev) => ({ ...prev, step: prev.step + 1, error: null }));
        setErrors({});
      } catch (err) {
        setState((prev) => ({
          ...prev,
          error: err instanceof Error ? err.message : "Failed to save account type",
        }));
      } finally {
        setStepBusy(false);
      }
      return;
    }

    setState((prev) => ({ ...prev, step: prev.step + 1, error: null }));
  };

  const handleBack = () => {
    if (mustConfirmRole && state.step <= 1) return;
    setState((prev) => ({ ...prev, step: prev.step - 1, error: null }));
    setErrors({});
  };

  const handleSubmit = async () => {
    if (!validateStep(3)) return;

    setState((prev) => ({ ...prev, isSubmitting: true, error: null }));

    try {
      const response = await submitOnboarding(state);
      if (response.success && response.trackingId) {
        setSuccess({ trackingId: response.trackingId });
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

  if (success) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardBody className="p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-10 h-10 text-green-600"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-primary-500 mb-2">
            {t("obSuccessTitle")}
          </h2>
          <p className="text-surface-600 mb-4">
            {t("obSuccessMessage")}
          </p>
          <p className="text-lg font-bold text-secondary-600 mb-6">
            {success.trackingId}
          </p>
          <button
            onClick={() => {
              const role = (session?.user as { role?: UserRole } | undefined)?.role ?? null;
              router.push(getRoleDefaultRoute(role));
            }}
            className="px-8 py-3 bg-secondary-500 text-white rounded-xl font-bold hover:bg-secondary-600 transition-colors"
          >
            {t("obSuccessCta")}
          </button>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {(googleSource || mustConfirmRole) && state.step === 1 && (
        <div className="mb-4 space-y-2">
          <div className="rounded-none border border-secondary-200 bg-secondary-50 px-4 py-3 text-sm text-secondary-900">
            {t("obGoogleRoleRequired")}
          </div>
          <div className="rounded-none border border-surface-200 bg-white px-4 py-3 text-xs text-surface-700 space-y-1">
            <p>
              {emailVerified ? t("obEmailVerifiedGoogle") : t("obEmailVerifyHint")}
            </p>
            <p>{t("obPhoneVerifyHint")}</p>
          </div>
        </div>
      )}

      <div className="mb-8">
        <StepIndicator steps={steps} current={state.step} />
      </div>

      <Card className="overflow-hidden">
        <CardBody className="p-6 md:p-8">
          {state.step === 1 && (
            <StepAccountType
              profile={state.profile}
              onChange={updateProfile}
              errors={errors}
              emailVerified={emailVerified}
              forceRoleSelection={mustConfirmRole || googleSource}
            />
          )}
          {state.step === 2 && (
            <StepDocuments
              documents={state.documents}
              onChange={updateDocuments}
              errors={errors}
            />
          )}
          {state.step === 3 && (
            <StepSurvey
              survey={state.survey}
              accountType={state.profile.accountType}
              onChange={updateSurvey}
              errors={errors}
            />
          )}

          {state.error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
              {state.error}
            </div>
          )}

          <div className="mt-8 flex items-center justify-between gap-4">
            <button
              onClick={handleBack}
              disabled={state.step === 1 || (mustConfirmRole && state.step === 1)}
              className="px-6 py-2.5 border border-surface-300 text-surface-700 rounded-xl font-medium hover:bg-surface-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t("obBack")}
            </button>

            {state.step < 3 ? (
              <button
                onClick={handleNext}
                disabled={stepBusy}
                className="px-8 py-2.5 bg-secondary-500 text-white rounded-xl font-bold hover:bg-secondary-600 transition-colors disabled:opacity-70"
              >
                {stepBusy ? t("obSubmitting") : t("obNext")}
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={state.isSubmitting}
                className="px-8 py-2.5 bg-secondary-500 text-white rounded-xl font-bold hover:bg-secondary-600 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {state.isSubmitting ? t("obSubmitting") : t("obSubmit")}
              </button>
            )}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

export default OnboardingWizard;
