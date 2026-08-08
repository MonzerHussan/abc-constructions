import {
  SurveyConfig,
  SurveyQuestion,
  SurveyConfigDraft,
  buildSeedSurveyConfig,
} from "@/lib/admin/survey-config";

/**
 * SurveyManager API client.
 *
 * عقد الـ API موثَّق بالكامل في `docs/api/survey-config-contract.md` — هذا هو
 * المصدر الوحيد لشكل البيانات. المبرمج 6 يبني الـ endpoints وفق ذلك العقد،
 * وهذا الملف يستهلكها من واجهة الويب.
 *
 * ملاحظة (Fallback): حتى يُبنى الـ API، تعمل الواجهة على نسخة محلية من
 * البيانات الحالية (`survey-categories.ts`) عبر `buildSeedSurveyConfig`.
 * أي طلب يفشل يرجع إلى النسخة المحلية دون كسر الواجهة، وتُعرَض شارة
 * "وضع محلي" للمسؤول حتى يكتمل الـ backend.
 */

const API_BASE = "/api/v1/survey-config";

const jsonHeaders = { "Content-Type": "application/json" };

async function request<T>(url: string, init?: RequestInit): Promise<T | null> {
  try {
    const res = await fetch(url, {
      credentials: "same-origin",
      ...init,
    });
    if (!res.ok) return null;
    const json = await res.json();
    // دعم غلافين: مباشر ({ categories }) أو مغلّف ({ data: {...} })
    return (json?.data ?? json) as T;
  } catch {
    return null;
  }
}

export async function fetchSurveyConfig(): Promise<{
  config: SurveyConfig;
  isRemote: boolean;
}> {
  const remote = await request<SurveyConfig>(API_BASE, { method: "GET" });
  if (remote?.categories?.length) {
    return { config: remote, isRemote: true };
  }
  return { config: buildSeedSurveyConfig(), isRemote: false };
}

export async function saveSurveyConfig(
  config: SurveyConfig,
): Promise<boolean> {
  const ok = await request<{ ok: boolean }>(API_BASE, {
    method: "PUT",
    headers: jsonHeaders,
    body: JSON.stringify(config),
  });
  return ok !== null;
}

export async function createQuestion(
  payload: SurveyConfigDraft & { type: SurveyQuestion["type"]; parentId: string | null },
): Promise<SurveyQuestion | null> {
  return request<SurveyQuestion>(API_BASE, {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify(payload),
  });
}

export async function updateQuestion(
  id: string,
  payload: Partial<SurveyConfigDraft> & { isActive?: boolean },
): Promise<SurveyQuestion | null> {
  return request<SurveyQuestion>(`${API_BASE}/${id}`, {
    method: "PATCH",
    headers: jsonHeaders,
    body: JSON.stringify(payload),
  });
}

export async function reorderQuestions(
  orderedIds: string[],
): Promise<boolean> {
  const ok = await request<{ ok: boolean }>(`${API_BASE}/reorder`, {
    method: "PUT",
    headers: jsonHeaders,
    body: JSON.stringify({ orderedIds }),
  });
  return ok !== null;
}

/**
 * Analytics for the onboarding survey.
 *
 * المصدر: المبرمج 6 يبني `GET /api/v1/survey-config/analytics` ليحسب
 * توزيع الفئات من `Profile.relevantCategories`/`subcategories` ومعدل
 * الإكمال من المستخدمين المسجلين مقابل من أكمل الاستبيان.
 */
export interface SurveyAnalytics {
  totalUsers: number;
  totalCompleted: number;
  completionRate: number;
  averageCategoriesPerUser: number;
  totalSubcategoriesSelected: number;
  categoryDistribution: {
    id: string;
    labelAr: string;
    labelEn: string;
    count: number;
    percentage: number;
  }[];
  topSubcategories: {
    id: string;
    labelAr: string;
    labelEn: string;
    count: number;
  }[];
  updatedAt: string | null;
}

export async function fetchSurveyAnalytics(): Promise<{
  analytics: SurveyAnalytics;
  isRemote: boolean;
}> {
  const remote = await request<SurveyAnalytics>(`${API_BASE}/analytics`, {
    method: "GET",
  });
  if (remote?.categoryDistribution) {
    return { analytics: remote, isRemote: true };
  }
  return {
    analytics: {
      totalUsers: 0,
      totalCompleted: 0,
      completionRate: 0,
      averageCategoriesPerUser: 0,
      totalSubcategoriesSelected: 0,
      categoryDistribution: [],
      topSubcategories: [],
      updatedAt: null,
    },
    isRemote: false,
  };
}
