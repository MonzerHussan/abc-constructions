"use client";

import { useLanguage } from "@/lib/LanguageContext";
import type { TranslationKey } from "@/lib/translations";
import {
  lookingForOptions,
  budgetRangeOptions,
  hasProjectsOptions,
  urgencyOptions,
  locationOptions,
} from "@/lib/data/onboarding-options";
import type { OnboardingSurvey } from "@/lib/onboarding/types";

interface StepSurveyProps {
  survey: OnboardingSurvey;
  onChange: (survey: OnboardingSurvey) => void;
  errors: Record<string, string>;
}

export function StepSurvey({ survey, onChange, errors }: StepSurveyProps) {
  const { t, dir } = useLanguage();

  const handleToggleArray = (field: keyof OnboardingSurvey, value: string) => {
    const current = (survey[field] as string[]) || [];
    const updated = current.includes(value)
      ? current.filter((item) => item !== value)
      : [...current, value];
    onChange({ ...survey, [field]: updated });
  };

  const handleSelectSingle = (
    field: "hasProjects" | "budgetRange" | "urgency",
    value: string
  ) => {
    onChange({ ...survey, [field]: value as OnboardingSurvey[typeof field] });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-surface-900 mb-2">
          {t("obSurveyTitle")}
        </h3>
        <p className="text-surface-600 mb-6">{t("obSurveySubtitle")}</p>
      </div>

      {/* What are you looking for */}
      <div>
        <label className="block text-sm font-medium text-surface-700 mb-3">
          {t("obLookingFor")} *
        </label>
        <p className="text-xs text-surface-500 mb-2">{t("obSelectAllThatApply")}</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {lookingForOptions.map((option) => {
            const isSelected = survey.lookingFor.includes(option.id);
            return (
              <button
                key={option.id}
                onClick={() => handleToggleArray("lookingFor", option.id)}
                className={`px-4 py-3 rounded-xl border text-sm font-medium transition-colors text-start ${
                  isSelected
                    ? "border-amber-500 bg-amber-50 text-amber-700"
                    : "border-surface-300 text-surface-700 hover:border-amber-300"
                }`}
              >
                {t(option.key as TranslationKey)}
              </button>
            );
          })}
        </div>
        {errors.lookingFor && (
          <p className="text-red-500 text-sm mt-2">{t("obRequired")}</p>
        )}
      </div>

      {/* Has projects */}
      <div>
        <label className="block text-sm font-medium text-surface-700 mb-3">
          {t("obHasProjects")} *
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {hasProjectsOptions.map((option) => {
            const isSelected = survey.hasProjects === option.id;
            return (
              <button
                key={option.id}
                onClick={() => handleSelectSingle("hasProjects", option.id)}
                className={`px-4 py-3 rounded-xl border text-sm font-medium transition-colors text-start ${
                  isSelected
                    ? "border-amber-500 bg-amber-50 text-amber-700"
                    : "border-surface-300 text-surface-700 hover:border-amber-300"
                }`}
              >
                {t(option.key as TranslationKey)}
              </button>
            );
          })}
        </div>
        {errors.hasProjects && (
          <p className="text-red-500 text-sm mt-2">{t("obRequired")}</p>
        )}
      </div>

      {/* Budget range */}
      <div>
        <label className="block text-sm font-medium text-surface-700 mb-3">
          {t("obBudgetRange")} *
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {budgetRangeOptions.map((option) => {
            const isSelected = survey.budgetRange === option.id;
            return (
              <button
                key={option.id}
                onClick={() => handleSelectSingle("budgetRange", option.id)}
                className={`px-4 py-3 rounded-xl border text-sm font-medium transition-colors text-start ${
                  isSelected
                    ? "border-amber-500 bg-amber-50 text-amber-700"
                    : "border-surface-300 text-surface-700 hover:border-amber-300"
                }`}
              >
                {t(option.key as TranslationKey)}
              </button>
            );
          })}
        </div>
        {errors.budgetRange && (
          <p className="text-red-500 text-sm mt-2">{t("obRequired")}</p>
        )}
      </div>

      {/* Urgency */}
      <div>
        <label className="block text-sm font-medium text-surface-700 mb-3">
          {t("obUrgency")} *
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {urgencyOptions.map((option) => {
            const isSelected = survey.urgency === option.id;
            return (
              <button
                key={option.id}
                onClick={() => handleSelectSingle("urgency", option.id)}
                className={`px-4 py-3 rounded-xl border text-sm font-medium transition-colors text-start ${
                  isSelected
                    ? "border-amber-500 bg-amber-50 text-amber-700"
                    : "border-surface-300 text-surface-700 hover:border-amber-300"
                }`}
              >
                {t(option.key as TranslationKey)}
              </button>
            );
          })}
        </div>
        {errors.urgency && (
          <p className="text-red-500 text-sm mt-2">{t("obRequired")}</p>
        )}
      </div>

      {/* Project locations */}
      <div>
        <label className="block text-sm font-medium text-surface-700 mb-3">
          {t("obProjectLocations")} ({t("obOptional")})
        </label>
        <p className="text-xs text-surface-500 mb-2">{t("obSelectAllThatApply")}</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {locationOptions.map((option) => {
            const isSelected = survey.projectLocations.includes(option.id);
            return (
              <button
                key={option.id}
                onClick={() => handleToggleArray("projectLocations", option.id)}
                className={`px-4 py-3 rounded-xl border text-sm font-medium transition-colors text-start ${
                  isSelected
                    ? "border-amber-500 bg-amber-50 text-amber-700"
                    : "border-surface-300 text-surface-700 hover:border-amber-300"
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

export default StepSurvey;
