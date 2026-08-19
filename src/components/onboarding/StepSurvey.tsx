"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/lib/LanguageContext";
import type { TranslationKey } from "@/lib/translations";
import {
  budgetRangeOptions,
  hasProjectsOptions,
  urgencyOptions,
  locationOptions,
} from "@/lib/data/onboarding-options";
import {
  fetchAccountSubcategories,
  type AccountSubcategoryItem,
} from "@/lib/onboarding/account-subcategories-client";
import type { OnboardingSurvey } from "@/lib/onboarding/types";
import { PlatformAccountType } from "@/lib/account-types";
import { Loader2 } from "lucide-react";

interface StepSurveyProps {
  survey: OnboardingSurvey;
  accountType: PlatformAccountType | "";
  onChange: (survey: OnboardingSurvey) => void;
  errors: Record<string, string>;
}

export function StepSurvey({ survey, accountType, onChange, errors }: StepSurveyProps) {
  const { t, language } = useLanguage();
  const [subcategories, setSubcategories] = useState<AccountSubcategoryItem[]>([]);
  const [loadingSubs, setLoadingSubs] = useState(false);

  useEffect(() => {
    if (!accountType) {
      setSubcategories([]);
      return;
    }
    let cancelled = false;
    setLoadingSubs(true);
    fetchAccountSubcategories(accountType as PlatformAccountType).then((items) => {
      if (!cancelled) {
        setSubcategories(items);
        setLoadingSubs(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [accountType]);

  const handleSelectSingle = (
    field: "hasProjects" | "budgetRange" | "urgency",
    value: string,
  ) => {
    onChange({ ...survey, [field]: value as OnboardingSurvey[typeof field] });
  };

  const handleToggleSubcategory = (subcategoryId: string) => {
    const isSelected = survey.subcategories.includes(subcategoryId);
    const updated = isSelected
      ? survey.subcategories.filter((id) => id !== subcategoryId)
      : [...survey.subcategories, subcategoryId];

    onChange({
      ...survey,
      accountType: accountType as PlatformAccountType,
      subcategories: updated,
      selectedCategories: accountType ? [accountType] : [],
      lookingFor: accountType ? [accountType] : [],
    });
  };

  const labelFor = (item: AccountSubcategoryItem) => {
    if (language === "ar" || language === "ur") return item.labelAr;
    return item.labelEn;
  };

  if (!accountType) {
    return (
      <p className="text-surface-600 text-sm">{t("obSurveySelectAccountTypeFirst")}</p>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-bold text-primary-500 mb-2">{t("obSurveyTitle")}</h3>
        <p className="text-surface-600">{t("obSurveyAccountSubcategoriesSubtitle")}</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-surface-700 mb-3">
          {t("obSurveySubcategoriesTitle")} *
        </label>
        {loadingSubs ? (
          <div className="flex items-center gap-2 text-surface-500 text-sm py-4">
            <Loader2 className="w-4 h-4 animate-spin" />
            {t("loading")}
          </div>
        ) : subcategories.length === 0 ? (
          <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
            {t("obSurveyNoSubcategoriesAdmin")}
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {subcategories.map((sub) => {
              const isSelected = survey.subcategories.includes(sub.id);
              return (
                <button
                  key={sub.id}
                  type="button"
                  onClick={() => handleToggleSubcategory(sub.id)}
                  className={`px-3 py-2 rounded-lg border text-xs font-medium transition-colors text-start ${
                    isSelected
                      ? "border-secondary-500 bg-secondary-50 text-secondary-700"
                      : "border-surface-300 text-surface-700 hover:border-secondary-300 bg-white"
                  }`}
                >
                  {labelFor(sub)}
                </button>
              );
            })}
          </div>
        )}
        {errors.subcategories && (
          <p className="text-red-500 text-sm mt-3">{t("obRequired")}</p>
        )}
      </div>

      <div className="border-t border-surface-200 pt-6">
        <label className="block text-sm font-medium text-surface-700 mb-3">{t("obHasProjects")} *</label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {hasProjectsOptions.map((option) => {
            const isSelected = survey.hasProjects === option.id;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => handleSelectSingle("hasProjects", option.id)}
                className={`px-4 py-3 rounded-xl border text-sm font-medium transition-colors text-start ${
                  isSelected
                    ? "border-secondary-500 bg-secondary-50 text-secondary-700"
                    : "border-surface-300 text-surface-700 hover:border-secondary-300"
                }`}
              >
                {t(option.key as TranslationKey)}
              </button>
            );
          })}
        </div>
        {errors.hasProjects && <p className="text-red-500 text-sm mt-2">{t("obRequired")}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-surface-700 mb-3">{t("obBudgetRange")} *</label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {budgetRangeOptions.map((option) => {
            const isSelected = survey.budgetRange === option.id;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => handleSelectSingle("budgetRange", option.id)}
                className={`px-4 py-3 rounded-xl border text-sm font-medium transition-colors text-start ${
                  isSelected
                    ? "border-secondary-500 bg-secondary-50 text-secondary-700"
                    : "border-surface-300 text-surface-700 hover:border-secondary-300"
                }`}
              >
                {t(option.key as TranslationKey)}
              </button>
            );
          })}
        </div>
        {errors.budgetRange && <p className="text-red-500 text-sm mt-2">{t("obRequired")}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-surface-700 mb-3">{t("obUrgency")} *</label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {urgencyOptions.map((option) => {
            const isSelected = survey.urgency === option.id;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => handleSelectSingle("urgency", option.id)}
                className={`px-4 py-3 rounded-xl border text-sm font-medium transition-colors text-start ${
                  isSelected
                    ? "border-secondary-500 bg-secondary-50 text-secondary-700"
                    : "border-surface-300 text-surface-700 hover:border-secondary-300"
                }`}
              >
                {t(option.key as TranslationKey)}
              </button>
            );
          })}
        </div>
        {errors.urgency && <p className="text-red-500 text-sm mt-2">{t("obRequired")}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-surface-700 mb-3">{t("obProjectLocations")}</label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {locationOptions.map((option) => {
            const isSelected = survey.projectLocations.includes(option.id);
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => {
                  const updated = isSelected
                    ? survey.projectLocations.filter((id) => id !== option.id)
                    : [...survey.projectLocations, option.id];
                  onChange({ ...survey, projectLocations: updated });
                }}
                className={`px-3 py-2 rounded-lg border text-xs font-medium transition-colors ${
                  isSelected
                    ? "border-secondary-500 bg-secondary-50 text-secondary-700"
                    : "border-surface-300 text-surface-700 hover:border-secondary-300"
                }`}
              >
                {t(option.key as TranslationKey)}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
