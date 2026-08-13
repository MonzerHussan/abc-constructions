"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { OnboardingWizard } from "@/components/onboarding/OnboardingWizard";
import { useLanguage } from "@/lib/LanguageContext";

export default function OnboardingPage() {
  const { t } = useLanguage();
  const { data: session, status } = useSession();
  const router = useRouter();

  // Admins skip the onboarding survey and go straight to the dashboard
  useEffect(() => {
    if (status === "authenticated") {
      const role = (session?.user as { role?: string } | undefined)?.role;
      if (role === "ADMIN" || role === "SUPER_ADMIN") {
        router.replace("/projects/ABC/admin");
      }
    }
  }, [status, session, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-surface-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-secondary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

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
