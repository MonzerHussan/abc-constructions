import type { OnboardingAnswerType } from "@/generated/prisma/client";

/**
 * QuestionBank API client — binds the admin Question Bank UI to
 * `/api/v1/entity-registry/survey/questions` (CRUD).
 *
 * Wire shapes follow the response envelope used across the app:
 *  - list → `{ data: { items, total, page, limit } }`
 *  - create/update → `{ data: Question }`
 */

export interface SurveyQuestionOption {
  label: string;
  value?: string;
}

export interface SurveyQuestion {
  id: string;
  category: string;
  questionText: string;
  answerType: OnboardingAnswerType;
  options: SurveyQuestionOption[] | null;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SurveyQuestionDraft {
  category: string;
  questionText: string;
  answerType: OnboardingAnswerType;
  options?: SurveyQuestionOption[];
  order?: number;
  isActive?: boolean;
}

const API_BASE = "/api/v1/entity-registry/survey/questions";

async function request<T>(url: string, init?: RequestInit): Promise<T | null> {
  try {
    const res = await fetch(url, {
      credentials: "same-origin",
      ...init,
    });
    if (!res.ok) return null;
    const json = await res.json();
    return (json?.data ?? json) as T;
  } catch {
    return null;
  }
}

export async function listSurveyQuestions(params?: {
  page?: number;
  limit?: number;
  category?: string;
  answerType?: string;
  isActive?: boolean;
}): Promise<{ items: SurveyQuestion[]; total: number; page: number; limit: number } | null> {
  const query = new URLSearchParams();
  if (params?.page) query.set("page", String(params.page));
  if (params?.limit) query.set("limit", String(params.limit));
  if (params?.category) query.set("category", params.category);
  if (params?.answerType) query.set("answerType", params.answerType);
  if (params?.isActive !== undefined) query.set("isActive", String(params.isActive));
  const qs = query.toString();
  const res = await fetch(qs ? `${API_BASE}?${qs}` : API_BASE, {
    method: "GET",
    credentials: "same-origin",
  });
  if (!res.ok) return null;
  const json = await res.json();
  const pagination = (json?.pagination ?? undefined) as
    | { page: number; limit: number; total: number }
    | undefined;
  const items = (json?.data ?? json) as SurveyQuestion[];
  if (!Array.isArray(items)) return null;
  return {
    items,
    total: pagination?.total ?? items.length,
    page: pagination?.page ?? params?.page ?? 1,
    limit: pagination?.limit ?? params?.limit ?? items.length,
  };
}

export async function createQuestion(
  payload: SurveyQuestionDraft,
): Promise<SurveyQuestion | null> {
  return request<SurveyQuestion>(API_BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function updateQuestion(
  id: string,
  payload: Partial<SurveyQuestionDraft>,
): Promise<SurveyQuestion | null> {
  return request<SurveyQuestion>(`${API_BASE}/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function deleteQuestion(id: string): Promise<boolean> {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: "DELETE",
    credentials: "same-origin",
  });
  return res.ok;
}