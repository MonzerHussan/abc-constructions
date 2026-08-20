"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";
import type { TranslationKey } from "@/lib/translations";
import {
  AUTH_PANEL_CHOICE_CLS,
  AUTH_PANEL_HEADER_SUBTITLE,
  AUTH_PANEL_HEADER_TITLE,
  AUTH_PANEL_LABEL_CLS,
} from "@/components/homepage/auth-panel-styles";
import {
  budgetRangeOptions,
  hasProjectsOptions,
  urgencyOptions,
  locationOptions,
} from "@/lib/data/onboarding-options";
import {
  fetchAccountSubcategories,
  type AccountSubcategoryOption,
} from "@/lib/onboarding/account-subcategories-client";
import { fetchSurveyDomainCategories } from "@/lib/onboarding/survey-config-client";
import type { OnboardingSurvey } from "@/lib/onboarding/types";

interface StepSurveyProps {
  platformAccountType: string;
  survey: OnboardingSurvey;
  onChange: (survey: OnboardingSurvey) => void;
  errors: Record<string, string>;
}

const choiceBtnBase =
  "px-2.5 py-2 rounded-none border text-[11px] font-medium transition-colors text-start";

type LabelledItem = { id: string; labelEn: string; labelAr: string };

export function StepSurvey({
  platformAccountType,
  survey,
  onChange,
  errors,
}: StepSurveyProps) {
  const { t, language } = useLanguage();
  const [mainCategories, setMainCategories] = useState<AccountSubcategoryOption[]>([]);
  const [domainCategories, setDomainCategories] = useState<LabelledItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const [main, domain] = await Promise.all([
        fetchAccountSubcategories(platformAccountType),
        fetchSurveyDomainCategories(),
      ]);
      if (cancelled) return;
      setMainCategories(main);
      setDomainCategories(domain);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [platformAccountType]);

  const handleSelectSingle = (
    field: "hasProjects" | "budgetRange" | "urgency",
    value: string,
  ) => {
    onChange({ ...survey, [field]: value as OnboardingSurvey[typeof field] });
  };

  const handleToggleMainCategory = (categoryId: string) => {
    const isSelected = survey.selectedCategories.includes(categoryId);
    const updatedCategories = isSelected
      ? survey.selectedCategories.filter((id) => id !== categoryId)
      : [...survey.selectedCategories, categoryId];

    onChange({
      ...survey,
      selectedCategories: updatedCategories,
      lookingFor: updatedCategories,
    });
  };

  const handleToggleDomainCategory = (domainId: string) => {
    const isSelected = survey.subcategories.includes(domainId);
    const updatedSubcategories = isSelected
      ? survey.subcategories.filter((id) => id !== domainId)
      : [...survey.subcategories, domainId];

    onChange({
      ...survey,
      subcategories: updatedSubcategories,
    });
  };

  const labelFor = (item: LabelledItem) => {
    if (language === "ar") return item.labelAr;
    if (language === "ur") return item.labelAr;
    return item.labelEn;
  };

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="w-5 h-5 animate-spin text-secondary-500" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div>
        <p className={AUTH_PANEL_HEADER_TITLE}>{t("obSurveyTitle")}</p>
        <p className={AUTH_PANEL_HEADER_SUBTITLE}>{t("obSurveySubtitle")}</p>
      </div>

      {/* Main: account-type subcategories (e.g. subcontractor specialty) */}
      <div>
        <label className={AUTH_PANEL_LABEL_CLS}>{t("obSurveyCategoriesTitle")} *</label>
        <p className="text-[10px] text-surface-500 mb-2">{t("obSurveyCategoriesSubtitle")}</p>
        {mainCategories.length === 0 ? (
          <p className="text-[10px] text-surface-500">{t("obSurveyNoMainCategories")}</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {mainCategories.map((category) => {
              const isSelected = survey.selectedCategories.includes(category.id);
              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => handleToggleMainCategory(category.id)}
                  className={`${choiceBtnBase} ${AUTH_PANEL_CHOICE_CLS(isSelected)}`}
                >
                  {labelFor(category)}
                </button>
              );
            })}
          </div>
        )}
        {errors.selectedCategories && (
          <p className="text-[10px] text-danger-600 mt-1">{t("obRequired")}</p>
        )}
      </div>

      {/* Sub: domain areas (materials, electrical, plumbing…) */}
      {survey.selectedCategories.length > 0 && (
        <div className="border-t border-surface-200 pt-3">
          <label className={AUTH_PANEL_LABEL_CLS}>{t("obSurveySubcategoriesTitle")} *</label>
          <p className="text-[10px] text-surface-500 mb-2">{t("obSurveySubcategoriesSubtitle")}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {domainCategories.map((domain) => {
              const isSelected = survey.subcategories.includes(domain.id);
              return (
                <button
                  key={domain.id}
                  type="button"
                  onClick={() => handleToggleDomainCategory(domain.id)}
                  className={`${choiceBtnBase} ${AUTH_PANEL_CHOICE_CLS(isSelected)}`}
                >
                  {labelFor(domain)}
                </button>
              );
            })}
          </div>
          {errors.subcategories && (
            <p className="text-[10px] text-danger-600 mt-1">{t("obRequired")}</p>
          )}
        </div>
      )}

      <div className="border-t border-surface-200 pt-3">
        <label className={AUTH_PANEL_LABEL_CLS}>{t("obHasProjects")} *</label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-1.5">
          {hasProjectsOptions.map((option) => {
            const isSelected = survey.hasProjects === option.id;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => handleSelectSingle("hasProjects", option.id)}
                className={`${choiceBtnBase} ${AUTH_PANEL_CHOICE_CLS(isSelected)}`}
              >
                {t(option.key as TranslationKey)}
              </button>
            );
          })}
        </div>
        {errors.hasProjects && (
          <p className="text-[10px] text-danger-600 mt-1">{t("obRequired")}</p>
        )}
      </div>

      <div>
        <label className={AUTH_PANEL_LABEL_CLS}>{t("obBudgetRange")} *</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1.5">
          {budgetRangeOptions.map((option) => {
            const isSelected = survey.budgetRange === option.id;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => handleSelectSingle("budgetRange", option.id)}
                className={`${choiceBtnBase} ${AUTH_PANEL_CHOICE_CLS(isSelected)}`}
              >
                {t(option.key as TranslationKey)}
              </button>
            );
          })}
        </div>
        {errors.budgetRange && (
          <p className="text-[10px] text-danger-600 mt-1">{t("obRequired")}</p>
        )}
      </div>

      <div>
        <label className={AUTH_PANEL_LABEL_CLS}>{t("obUrgency")} *</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-1.5">
          {urgencyOptions.map((option) => {
            const isSelected = survey.urgency === option.id;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => handleSelectSingle("urgency", option.id)}
                className={`${choiceBtnBase} ${AUTH_PANEL_CHOICE_CLS(isSelected)}`}
              >
                {t(option.key as TranslationKey)}
              </button>
            );
          })}
        </div>
        {errors.urgency && (
          <p className="text-[10px] text-danger-600 mt-1">{t("obRequired")}</p>
        )}
      </div>

      <div>
        <label className={AUTH_PANEL_LABEL_CLS}>
          {t("obProjectLocations")} ({t("obOptional")})
        </label>
        <p className="text-[10px] text-surface-500 mb-2">{t("obSelectAllThatApply")}</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
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
                className={`${choiceBtnBase} ${AUTH_PANEL_CHOICE_CLS(isSelected)}`}
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

export default StepSurvey;
