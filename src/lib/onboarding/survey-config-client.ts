import type { SurveyCategory, SurveySubcategory } from "@/lib/data/survey-categories";
import {
  surveyCategories as staticSurveyCategories,
  getSubcategoriesByCategoryId as staticGetSubcategories,
} from "@/lib/data/survey-categories";

interface SurveyConfigWire {
  categories: Array<{
    id: string;
    labelEn: string;
    labelAr: string;
    isActive: boolean;
  }>;
  subcategories: Array<{
    id: string;
    parentId: string | null;
    labelEn: string;
    labelAr: string;
    isActive: boolean;
  }>;
}

function wireToSurveyCategories(config: SurveyConfigWire): SurveyCategory[] {
  const subsByParent = new Map<string, SurveySubcategory[]>();
  for (const sub of config.subcategories) {
    if (!sub.parentId) continue;
    const list = subsByParent.get(sub.parentId) ?? [];
    list.push({ id: sub.id, labelEn: sub.labelEn, labelAr: sub.labelAr });
    subsByParent.set(sub.parentId, list);
  }

  return config.categories.map((cat) => ({
    id: cat.id,
    labelEn: cat.labelEn,
    labelAr: cat.labelAr,
    subcategories: subsByParent.get(cat.id) ?? [],
  }));
}

export async function fetchOnboardingSurveyCategories(): Promise<SurveyCategory[]> {
  try {
    const res = await fetch("/api/v1/survey-config/public", {
      credentials: "same-origin",
      cache: "no-store",
    });
    if (!res.ok) return staticSurveyCategories;

    const envelope = (await res.json()) as {
      success?: boolean;
      data?: SurveyConfigWire;
    };
    if (!envelope.success || !envelope.data?.categories?.length) {
      return staticSurveyCategories;
    }

    return wireToSurveyCategories(envelope.data);
  } catch {
    return staticSurveyCategories;
  }
}

/** Domain areas (materials, electrical, plumbing…) — second level in onboarding survey. */
export async function fetchSurveyDomainCategories(): Promise<SurveySubcategory[]> {
  try {
    const res = await fetch("/api/v1/survey-config/public", {
      credentials: "same-origin",
      cache: "no-store",
    });
    if (!res.ok) return surveyDomainCategoriesStatic();

    const envelope = (await res.json()) as {
      success?: boolean;
      data?: SurveyConfigWire;
    };
    const cats = envelope.data?.categories;
    if (!envelope.success || !cats?.length) {
      return surveyDomainCategoriesStatic();
    }

    return cats
      .filter((c) => c.isActive)
      .map((c) => ({ id: c.id, labelEn: c.labelEn, labelAr: c.labelAr }));
  } catch {
    return surveyDomainCategoriesStatic();
  }
}

function surveyDomainCategoriesStatic(): SurveySubcategory[] {
  return staticSurveyCategories.map((c) => ({
    id: c.id,
    labelEn: c.labelEn,
    labelAr: c.labelAr,
  }));
}

export function getSubcategoriesForCategories(
  categories: SurveyCategory[],
  categoryId: string
): SurveySubcategory[] {
  return categories.find((c) => c.id === categoryId)?.subcategories ?? staticGetSubcategories(categoryId);
}

export { staticSurveyCategories };
