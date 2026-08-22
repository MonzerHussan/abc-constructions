import type { PlatformAccountType } from '@/lib/account-types';
import type { PublicSurveyTemplate, SurveyProgressPayload } from '@/modules/onboarding-survey';

export type SurveyFetchResult<T> =
  | { ok: true; data: T }
  | { ok: false; status: number; message: string };

export async function fetchSurveyTemplate(
  accountType: PlatformAccountType,
  lang: string,
): Promise<SurveyFetchResult<PublicSurveyTemplate>> {
  const res = await fetch(
    `/api/v1/onboarding/survey/template?accountType=${encodeURIComponent(accountType)}&lang=${encodeURIComponent(lang)}`,
    { credentials: 'same-origin', cache: 'no-store' },
  );
  const json = (await res.json().catch(() => ({}))) as {
    success?: boolean;
    data?: PublicSurveyTemplate;
    error?: { message?: string };
    message?: string;
  };
  if (!res.ok) {
    return {
      ok: false,
      status: res.status,
      message: json.error?.message ?? json.message ?? `HTTP ${res.status}`,
    };
  }
  if (!json.data) {
    return { ok: false, status: res.status, message: 'Survey template missing in response' };
  }
  return { ok: true, data: json.data };
}

export async function fetchSurveyProgress(): Promise<SurveyProgressPayload | null> {
  const res = await fetch('/api/v1/onboarding/survey/progress', {
    credentials: 'same-origin',
    cache: 'no-store',
  });
  if (!res.ok) return null;
  const json = (await res.json()) as { success?: boolean; data?: SurveyProgressPayload | null };
  return json.data ?? null;
}

export async function saveSurveyProgress(payload: {
  accountType: PlatformAccountType;
  currentSectionCode?: string | null;
  answers: Record<string, unknown>;
  skippedSections?: string[];
  completedSections?: string[];
  isComplete?: boolean;
}): Promise<SurveyProgressPayload | null> {
  const res = await fetch('/api/v1/onboarding/survey/progress', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
    body: JSON.stringify(payload),
  });
  if (!res.ok) return null;
  const json = (await res.json()) as { success?: boolean; data?: SurveyProgressPayload };
  return json.data ?? null;
}

export async function saveSurveyDataToProfile(surveyData: Record<string, unknown>): Promise<boolean> {
  const res = await fetch('/api/v1/entity-registry/survey/survey-data', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
    body: JSON.stringify({ surveyData }),
  });
  return res.ok;
}
