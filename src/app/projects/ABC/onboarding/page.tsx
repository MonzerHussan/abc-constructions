"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { LogOut, Building2, User } from "lucide-react";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import AbcLogo from "@/components/AbcLogo";
import { OnboardingWizard } from "@/components/onboarding/OnboardingWizard";
import { OnboardingSidePanel } from "@/components/onboarding/OnboardingSidePanel";
import { useLanguage } from "@/lib/LanguageContext";
import { userRoleToPlatformAccountType, type PlatformAccountType } from "@/lib/account-types";
import { isIndividualAccountType } from "@/lib/onboarding/account-type-map";
import { fetchUserMe } from "@/lib/onboarding/api";
import {
  buildOnboardingProfileFromSources,
  loadRegistrationPrefill,
} from "@/lib/onboarding/prefill-from-registration";
import { isPlatformAdminRole, getAdminLandingPath } from "@/lib/auth/platform-admin";
import type { UserRole } from "@/lib/navigation/types";
import { isUsableMediaUrl } from "@/lib/utils";
import { HEADER_LOGOUT_BUTTON } from "@/lib/header-control-styles";
import type { PublicSectionContent } from "@/modules/onboarding-survey";

function headerDisplayName(
  isIndividual: boolean,
  companyName: string,
  personalName: string,
): string {
  if (isIndividual) return personalName;
  return companyName || personalName;
}

export default function OnboardingPage() {
  const { t, dir } = useLanguage();
  const { data: session, status } = useSession();
  const router = useRouter();
  const role = (session?.user as { role?: UserRole } | undefined)?.role ?? null;
  const platformAccountType = userRoleToPlatformAccountType(role ?? "") ?? "";
  const isIndividual = isIndividualAccountType(platformAccountType as PlatformAccountType);
  const [sectionContent, setSectionContent] = useState<PublicSectionContent | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [displayImageUrl, setDisplayImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (status === "authenticated" && isPlatformAdminRole(role)) {
      router.replace(getAdminLandingPath(role));
    }
  }, [status, role, router]);

  useEffect(() => {
    if (status !== "authenticated") return;
    const prefill = loadRegistrationPrefill();
    const personalName = session?.user?.name || session?.user?.email || "";
    const bootstrap = buildOnboardingProfileFromSources({
      prefill,
      sessionName: session?.user?.name,
      sessionEmail: session?.user?.email,
      sessionRole: role,
    });
    setDisplayName(
      headerDisplayName(isIndividual, bootstrap.companyName, bootstrap.fullName || personalName),
    );
    setDisplayImageUrl(isIndividual ? bootstrap.avatarUrl ?? null : bootstrap.companyLogoUrl ?? null);

    let cancelled = false;
    (async () => {
      try {
        const user = await fetchUserMe();
        if (cancelled) return;
        const profile = buildOnboardingProfileFromSources({
          user,
          prefill,
          sessionName: session?.user?.name,
          sessionEmail: session?.user?.email,
          sessionRole: role,
        });
        setDisplayName(
          headerDisplayName(isIndividual, profile.companyName, profile.fullName || personalName),
        );
        setDisplayImageUrl(isIndividual ? profile.avatarUrl ?? null : profile.companyLogoUrl ?? null);
      } catch {
        /* bootstrap values already shown */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [status, session, role, isIndividual]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-surface-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-secondary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div dir={dir} className="min-h-screen bg-surface-100">
      <header className="sticky top-0 z-30 flex items-center justify-between gap-3 bg-white/95 backdrop-blur border-b border-surface-200 px-4 py-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="relative w-8 h-8 rounded-none border border-surface-200 bg-surface-50 overflow-hidden shrink-0">
            {isUsableMediaUrl(displayImageUrl) ? (
              <Image src={displayImageUrl!} alt="" fill className="object-cover" unoptimized />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-surface-400">
                {isIndividual ? <User className="w-4 h-4" /> : <Building2 className="w-4 h-4" />}
              </div>
            )}
          </div>
          <p className="text-sm font-semibold text-surface-800 truncate">
            {t("obWelcomeUser")}
            {displayName ? `، ${displayName}` : ""}
          </p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <Link
            href="/projects/ABC"
            className="flex items-center rounded-none p-1 hover:bg-surface-100 transition-colors"
            aria-label={t("home")}
            title={t("home")}
          >
            <AbcLogo background="light" width={72} height={28} className="h-7 w-auto object-contain" />
          </Link>
          <LanguageSwitcher />
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/projects/ABC" })}
            className={HEADER_LOGOUT_BUTTON}
            aria-label={t("logout")}
            title={t("logout")}
          >
            <LogOut className="w-3.5 h-3.5 shrink-0" />
            {t("logout")}
          </button>
        </div>
      </header>

      <div className="grid min-h-[calc(100vh-49px)] lg:grid-cols-2">
        <main className="order-1 flex items-start justify-center p-3 sm:p-4 lg:p-6">
          <div className="w-full max-w-xl">
            <OnboardingWizard onSectionContentChange={setSectionContent} />
          </div>
        </main>
        <aside className="order-2">
          <OnboardingSidePanel accountType={platformAccountType} sectionContent={sectionContent} />
        </aside>
      </div>
    </div>
  );
}
