"use client";

import Navbar from "@/components/Navbar";
import { OnboardingWizard } from "@/components/onboarding/OnboardingWizard";
import { useLanguage } from "@/lib/LanguageContext";

export default function OnboardingPage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-surface-50">
      <Navbar />

      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center mb-10">
          <h1 className="headline text-primary-500 mb-3">
            {t("obTitle")}
          </h1>
          <p className="text-surface-600 max-w-2xl mx-auto text-lg">
            {t("obSubtitle")}
          </p>
        </div>

        <OnboardingWizard />
      </div>
    </div>
  );
}
