"use client";

import { Card } from "@/components/ui/card";
import { useLanguage } from "@/lib/LanguageContext";
import type { TranslationKey } from "@/lib/translations";
import { accountTypeOptions } from "@/lib/data/onboarding-options";
import type { OnboardingProfile } from "@/lib/onboarding/types";
import { Building2, HardHat, Wrench, FileText, Landmark } from "lucide-react";

interface StepAccountTypeProps {
  profile: OnboardingProfile;
  onChange: (profile: OnboardingProfile) => void;
  errors: Record<string, string>;
}

const iconMap: Record<string, typeof Building2> = {
  Building2,
  HardHat,
  Wrench,
  FileText,
  Landmark,
};

export function StepAccountType({ profile, onChange, errors }: StepAccountTypeProps) {
  const { t, dir } = useLanguage();

  const handleTypeSelect = (type: string) => {
    onChange({ ...profile, accountType: type as OnboardingProfile["accountType"] });
  };

  const handleChange = (field: keyof OnboardingProfile, value: string) => {
    onChange({ ...profile, [field]: value });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-primary-500 mb-4">
          {t("obSelectAccountType")}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {accountTypeOptions.map((option) => {
            const IconComponent = option.icon;
            const isSelected = profile.accountType === option.id;
            return (
              <Card
                key={option.id}
                className={`p-5 cursor-pointer transition-all ${
                  isSelected
                    ? "border-secondary-500 ring-2 ring-secondary-500 bg-secondary-50/50"
                    : "hover:border-secondary-300"
                }`}
                onClick={() => handleTypeSelect(option.id)}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      isSelected ? "bg-secondary-500 text-white" : "bg-surface-100 text-surface-600"
                    }`}
                  >
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-primary-500">
                      {t(option.key as TranslationKey)}
                    </h4>
                    <p className="text-sm text-surface-500 mt-1">
                      {t(option.descKey as TranslationKey)}
                    </p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
        {errors.accountType && (
          <p className="text-red-500 text-sm mt-2">{t("obRequired")}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-surface-700 mb-1">
            {t("obCompanyName")} *
          </label>
          <input
            type="text"
            value={profile.companyName}
            onChange={(e) => handleChange("companyName", e.target.value)}
            className="w-full px-4 py-2.5 border border-surface-300 rounded-xl focus:ring-2 focus:ring-secondary-500 focus:border-secondary-500 outline-none"
            dir={dir}
          />
          {errors.companyName && (
            <p className="text-red-500 text-sm mt-1">{t(errors.companyName as TranslationKey)}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-surface-700 mb-1">
            {t("obFullName")} *
          </label>
          <input
            type="text"
            value={profile.fullName}
            onChange={(e) => handleChange("fullName", e.target.value)}
            className="w-full px-4 py-2.5 border border-surface-300 rounded-xl focus:ring-2 focus:ring-secondary-500 focus:border-secondary-500 outline-none"
            dir={dir}
          />
          {errors.fullName && (
            <p className="text-red-500 text-sm mt-1">{t(errors.fullName as TranslationKey)}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-surface-700 mb-1">
            {t("obPhone")} *
          </label>
          <input
            type="tel"
            value={profile.phone}
            onChange={(e) => handleChange("phone", e.target.value)}
            className="w-full px-4 py-2.5 border border-surface-300 rounded-xl focus:ring-2 focus:ring-secondary-500 focus:border-secondary-500 outline-none"
            dir="ltr"
          />
          {errors.phone && (
            <p className="text-red-500 text-sm mt-1">{t(errors.phone as TranslationKey)}</p>
          )}
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-surface-700 mb-1">
            {t("obEmail")} *
          </label>
          <input
            type="email"
            value={profile.email}
            onChange={(e) => handleChange("email", e.target.value)}
            className="w-full px-4 py-2.5 border border-surface-300 rounded-xl focus:ring-2 focus:ring-secondary-500 focus:border-secondary-500 outline-none"
            dir="ltr"
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{t(errors.email as TranslationKey)}</p>
          )}
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-surface-700 mb-1">
            {t("obCommercialRegistration")} ({t("obOptional")})
          </label>
          <input
            type="text"
            value={profile.commercialRegistration || ""}
            onChange={(e) => handleChange("commercialRegistration", e.target.value)}
            className="w-full px-4 py-2.5 border border-surface-300 rounded-xl focus:ring-2 focus:ring-secondary-500 focus:border-secondary-500 outline-none"
            dir={dir}
          />
        </div>
      </div>
    </div>
  );
}

export default StepAccountType;
