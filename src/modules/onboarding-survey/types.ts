import type { OnboardingAnswerType, PlatformAccountType } from "@/generated/prisma/client";
import type { ShowIfRule } from "@/lib/onboarding/survey-show-if";

export interface SurveyQuestionOption {
  labelEn: string;
  labelAr: string;
  labelUr?: string;
  value: string;
}

export interface PublicSurveyQuestionOption {
  value: string;
  label: string;
}

export interface PublicSurveyQuestion {
  id: string;
  code: string;
  questionText: string;
  answerType: OnboardingAnswerType;
  options: PublicSurveyQuestionOption[];
  sortOrder: number;
  isRequired: boolean;
  showIf: ShowIfRule | null;
  metadata: Record<string, unknown> | null;
}

export interface PublicSectionContent {
  title: string | null;
  body: string | null;
  imageUrl: string | null;
  videoUrl: string | null;
  posterUrl: string | null;
  linkUrl: string | null;
}

export interface PublicSurveySection {
  id: string;
  code: string;
  title: string;
  description: string | null;
  sortOrder: number;
  showIf: ShowIfRule | null;
  questions: PublicSurveyQuestion[];
  content: PublicSectionContent | null;
}

export interface PublicSurveyTemplate {
  accountType: PlatformAccountType;
  name: string;
  version: number;
  sections: PublicSurveySection[];
}

export interface SurveyProgressPayload {
  accountType: PlatformAccountType;
  currentSectionCode: string | null;
  answers: Record<string, unknown>;
  skippedSections: string[];
  completedSections: string[];
  isComplete: boolean;
}
