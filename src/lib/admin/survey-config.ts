import { surveyCategories } from "@/lib/data/survey-categories";

/**
 * Survey question domain model for the admin SurveyManager.
 *
 * "الأسئلة" هنا تعني عناصر الاستبيان: الفئات الرئيسية (categories) وفئاتها
 * الفرعية (subcategories). كل عنصر قابل للترتيب والتفعيل/التعطيل والإضافة
 * والتعديل عبر الـ API — لا يُعدَّل في الكود.
 */

export type SurveyQuestionType = "category" | "subcategory";

export interface SurveyQuestion {
  id: string;
  parentId: string | null;
  type: SurveyQuestionType;
  labelEn: string;
  labelAr: string;
  sortOrder: number;
  isActive: boolean;
}

export interface SurveyConfig {
  categories: SurveyQuestion[];
  subcategories: SurveyQuestion[];
  updatedAt: string | null;
}

export interface SurveyConfigDraft {
  labelEn: string;
  labelAr: string;
}

/** توليد إعداد افتراضي من البيانات الحالية (fallback حتى يبني المبرمج 6 الـ API). */
export function buildSeedSurveyConfig(): SurveyConfig {
  const categories: SurveyQuestion[] = surveyCategories.map((c, i) => ({
    id: c.id,
    parentId: null,
    type: "category",
    labelEn: c.labelEn,
    labelAr: c.labelAr,
    sortOrder: i,
    isActive: true,
  }));

  const subcategories: SurveyQuestion[] = surveyCategories.flatMap((c) =>
    c.subcategories.map((s, i) => ({
      id: s.id,
      parentId: c.id,
      type: "subcategory",
      labelEn: s.labelEn,
      labelAr: s.labelAr,
      sortOrder: i,
      isActive: true,
    })),
  );

  return {
    categories,
    subcategories,
    updatedAt: null,
  };
}

export function getSubcategoriesForCategory(
  config: SurveyConfig,
  categoryId: string,
): SurveyQuestion[] {
  return config.subcategories
    .filter((s) => s.parentId === categoryId)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export function findQuestion(
  config: SurveyConfig,
  id: string,
): SurveyQuestion | undefined {
  return (
    config.categories.find((c) => c.id === id) ??
    config.subcategories.find((s) => s.id === id)
  );
}

export function sortByOrder<T extends { sortOrder: number }>(items: T[]): T[] {
  return [...items].sort((a, b) => a.sortOrder - b.sortOrder);
}
