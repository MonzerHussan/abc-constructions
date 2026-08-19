import type { OnboardingSurvey } from "./types";

const BUDGET_SCORES: Record<string, number> = {
  small: 35,
  medium: 55,
  large: 75,
  enterprise: 90,
};

const PROJECTS_SCORES: Record<string, number> = {
  yes: 85,
  soon: 60,
  no: 25,
};

const URGENCY_SCORES: Record<string, number> = {
  immediate: 90,
  "3months": 70,
  "6months": 50,
  future: 30,
};

export interface OnboardingLeadScores {
  strategicScore: number;
  engagementScore: number;
  commercialScore: number;
  conversionScore: number;
}

export function deriveLeadScoresFromSurvey(survey: OnboardingSurvey): OnboardingLeadScores {
  const strategicScore = BUDGET_SCORES[survey.budgetRange] ?? 40;
  const engagementScore = PROJECTS_SCORES[survey.hasProjects] ?? 40;
  const commercialScore = URGENCY_SCORES[survey.urgency] ?? 40;
  const subCount = survey.subcategories.length;
  const conversionScore = Math.min(95, 30 + subCount * 5);

  return { strategicScore, engagementScore, commercialScore, conversionScore };
}

export function buildSurveyDataPayload(survey: OnboardingSurvey): Record<string, unknown> {
  return {
    accountType: survey.accountType,
    selectedCategories: survey.accountType ? [survey.accountType] : survey.selectedCategories,
    subcategories: survey.subcategories,
    hasProjects: survey.hasProjects,
    budgetRange: survey.budgetRange,
    urgency: survey.urgency,
    projectLocations: survey.projectLocations,
    submittedAt: new Date().toISOString(),
  };
}
