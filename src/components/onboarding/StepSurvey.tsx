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
import type { SurveyCategory } from "@/lib/data/survey-categories";
import {
  fetchOnboardingSurveyCategories,
  getSubcategoriesForCategories,
  staticSurveyCategories,
} from "@/lib/onboarding/survey-config-client";
import type { OnboardingSurvey } from "@/lib/onboarding/types";

interface StepSurveyProps {
  survey: OnboardingSurvey;
  onChange: (survey: OnboardingSurvey) => void;
  errors: Record<string, string>;
}

export function StepSurvey({ survey, onChange, errors }: StepSurveyProps) {
  const { t, language, dir } = useLanguage();
  const [categories, setCategories] = useState<SurveyCategory[]>(staticSurveyCategories);

  useEffect(() => {
    let cancelled = false;
    fetchOnboardingSurveyCategories().then((loaded) => {
      if (!cancelled && loaded.length > 0) setCategories(loaded);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const getSubcategoriesByCategoryId = (categoryId: string) =>
    getSubcategoriesForCategories(categories, categoryId);

  const handleSelectSingle = (
    field: "hasProjects" | "budgetRange" | "urgency",
    value: string
  ) => {
    onChange({ ...survey, [field]: value as OnboardingSurvey[typeof field] });
  };

  const handleToggleCategory = (categoryId: string) => {
    const isSelected = survey.selectedCategories.includes(categoryId);
    const updatedCategories = isSelected
      ? survey.selectedCategories.filter((id) => id !== categoryId)
      : [...survey.selectedCategories, categoryId];

    // Remove any subcategories that belong to a deselected category.
    const updatedSubcategories = isSelected
      ? survey.subcategories.filter(
          (subId) =>
            !getSubcategoriesByCategoryId(categoryId).some((s) => s.id === subId)
        )
      : survey.subcategories;

    onChange({
      ...survey,
      selectedCategories: updatedCategories,
      subcategories: updatedSubcategories,
      // Keep legacy lookingFor in sync with selected main categories for any
      // downstream consumers that still read it.
      lookingFor: updatedCategories,
    });
  };

  const handleToggleSubcategory = (categoryId: string, subcategoryId: string) => {
    const isSelected = survey.subcategories.includes(subcategoryId);
    const updatedSubcategories = isSelected
      ? survey.subcategories.filter((id) => id !== subcategoryId)
      : [...survey.subcategories, subcategoryId];

    // Ensure the parent category is selected when a subcategory is chosen.
    const updatedCategories = survey.selectedCategories.includes(categoryId)
      ? survey.selectedCategories
      : [...survey.selectedCategories, categoryId];

    onChange({
      ...survey,
      selectedCategories: updatedCategories,
      subcategories: updatedSubcategories,
      lookingFor: updatedCategories,
    });
  };

  const labelFor = (
    category?: { labelAr: string; labelEn: string },
    subcategory?: { labelAr: string; labelEn: string }
  ) => {
    const item = subcategory ?? category;
    if (!item) return "";
    if (language === "ar") return item.labelAr;
    if (language === "ur") return item.labelAr; // Urdu uses Arabic labels for construction terms
    return item.labelEn;
  };

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-bold text-primary-500 mb-2">
          {t("obSurveyTitle")}
        </h3>
        <p className="text-surface-600">{t("obSurveySubtitle")}</p>
      </div>

      {/* Main categories */}
      <div>
        <label className="block text-sm font-medium text-surface-700 mb-3">
          {t("obSurveyCategoriesTitle")} *
        </label>
        <p className="text-xs text-surface-500 mb-3">
          {t("obSurveyCategoriesSubtitle")}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {categories.map((category) => {
            const isSelected = survey.selectedCategories.includes(category.id);
            return (
              <button
                key={category.id}
                onClick={() => handleToggleCategory(category.id)}
                className={`px-4 py-3 rounded-xl border text-sm font-medium transition-colors text-start ${
                  isSelected
                    ? "border-secondary-500 bg-secondary-50 text-secondary-700"
                    : "border-surface-300 text-surface-700 hover:border-secondary-300"
                }`}
              >
                {labelFor(category)}
              </button>
            );
          })}
        </div>
        {errors.selectedCategories && (
          <p className="text-red-500 text-sm mt-2">{t("obRequired")}</p>
        )}
      </div>

      {/* Dynamic subcategories */}
      {survey.selectedCategories.length > 0 && (
        <div className="border-t border-surface-200 pt-6">
          <label className="block text-sm font-medium text-surface-700 mb-3">
            {t("obSurveySubcategoriesTitle")} *
          </label>
          <p className="text-xs text-surface-500 mb-4">
            {t("obSurveySubcategoriesSubtitle")}
          </p>
          <div className="space-y-6">
            {survey.selectedCategories.map((categoryId) => {
              const category = categories.find((c) => c.id === categoryId);
              if (!category) return null;
              const subcategories = getSubcategoriesByCategoryId(categoryId);

              return (
                <div
                  key={categoryId}
                  className="p-4 rounded-xl border border-surface-200 bg-surface-50"
                >
                  <h4 className="text-sm font-bold text-primary-500 mb-3">
                    {labelFor(category)}
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {subcategories.map((sub) => {
                      const isSelected = survey.subcategories.includes(sub.id);
                      return (
                        <button
                          key={sub.id}
                          onClick={() =>
                            handleToggleSubcategory(categoryId, sub.id)
                          }
                          className={`px-3 py-2 rounded-lg border text-xs font-medium transition-colors text-start ${
                            isSelected
                              ? "border-secondary-500 bg-secondary-50 text-secondary-700"
                              : "border-surface-300 text-surface-700 hover:border-secondary-300 bg-white"
                          }`}
                        >
                          {labelFor(undefined, sub)}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
          {errors.subcategories && (
            <p className="text-red-500 text-sm mt-3">{t("obRequired")}</p>
          )}
        </div>
      )}

      {/* Has projects */}
      <div className="border-t border-surface-200 pt-6">
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
                    ? "border-secondary-500 bg-secondary-50 text-secondary-700"
                    : "border-surface-300 text-surface-700 hover:border-secondary-300"
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
                    ? "border-secondary-500 bg-secondary-50 text-secondary-700"
                    : "border-surface-300 text-surface-700 hover:border-secondary-300"
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
                    ? "border-secondary-500 bg-secondary-50 text-secondary-700"
                    : "border-surface-300 text-surface-700 hover:border-secondary-300"
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
        <p className="text-xs text-surface-500 mb-2">
          {t("obSelectAllThatApply")}
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {locationOptions.map((option) => {
            const isSelected = survey.projectLocations.includes(option.id);
            return (
              <button
                key={option.id}
                onClick={() => {
                  const updated = isSelected
                    ? survey.projectLocations.filter((id) => id !== option.id)
                    : [...survey.projectLocations, option.id];
                  onChange({ ...survey, projectLocations: updated });
                }}
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
      </div>
    </div>
  );
}

export default StepSurvey;
