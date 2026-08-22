"use client";

import { useState } from "react";
import { useLanguage } from "@/lib/LanguageContext";
import type { OnboardingProfile } from "@/lib/onboarding/types";
import { StepContactVerification } from "./StepContactVerification";
import { StepDocuments } from "./StepDocuments";
import type { OnboardingDocument } from "@/lib/onboarding/types";

interface StepIdentityVerificationProps {
  profile: OnboardingProfile;
  onProfileChange: (profile: OnboardingProfile) => void;
  documents: OnboardingDocument[];
  onDocumentsChange: (documents: OnboardingDocument[]) => void;
  errors: Record<string, string>;
}

export function StepIdentityVerification({
  profile,
  onProfileChange,
  documents,
  onDocumentsChange,
  errors,
}: StepIdentityVerificationProps) {
  const { t } = useLanguage();
  const [contactVerified, setContactVerified] = useState({
    emailVerified: false,
    phoneVerified: false,
  });

  const canUploadDocs = contactVerified.emailVerified && contactVerified.phoneVerified;

  return (
    <div className="space-y-3">
      <StepContactVerification onStatusChange={setContactVerified} />

      <label
        className={`flex items-start gap-2 rounded-none border border-surface-200 bg-surface-50/40 px-3 py-2.5 ${
          canUploadDocs ? "cursor-pointer" : "cursor-not-allowed opacity-60"
        }`}
      >
        <input
          type="checkbox"
          checked={profile.requestIdentityVerification}
          disabled={!canUploadDocs}
          onChange={(e) =>
            onProfileChange({ ...profile, requestIdentityVerification: e.target.checked })
          }
          className="mt-0.5 h-3.5 w-3.5 rounded-none border-surface-300 text-secondary-500 focus:ring-secondary-500 disabled:opacity-50"
        />
        <span className="text-xs font-medium text-surface-700">{t("identityVerification")}</span>
      </label>

      {profile.requestIdentityVerification && canUploadDocs && (
        <StepDocuments documents={documents} onChange={onDocumentsChange} errors={errors} />
      )}

      {profile.requestIdentityVerification && !canUploadDocs && (
        <p className="text-[10px] text-danger-600">{t("obVerifyRequiredForDocs")}</p>
      )}
    </div>
  );
}
