import { prisma } from '@/lib/prisma';
import { evaluateShowIf } from '@/lib/onboarding/survey-show-if';
import type { PlatformAccountType } from '@/lib/account-types';
import type {
  PublicSurveyTemplate,
  PublicSurveySection,
  PublicSurveyQuestion,
  PublicSectionContent,
  SurveyQuestionOption,
  SurveyProgressPayload,
} from '../types';
import type { ShowIfRule } from '@/lib/onboarding/survey-show-if';
import type { Prisma } from '@/generated/prisma/client';

type Lang = 'ar' | 'en' | 'ur';

function pickLang<T extends Record<string, string | null | undefined>>(
  lang: Lang,
  en: string,
  ar: string,
  ur?: string | null,
): string {
  if (lang === 'ar') return ar;
  if (lang === 'ur') return ur ?? en;
  return en;
}

function parseOptions(raw: unknown, lang: Lang): SurveyQuestionOption[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((item) => {
    const o = item as Record<string, string>;
    return {
      value: o.value ?? '',
      labelEn: o.labelEn ?? o.label ?? o.value ?? '',
      labelAr: o.labelAr ?? o.label ?? o.labelEn ?? o.value ?? '',
      labelUr: o.labelUr,
    };
  }).map((o) => ({
    ...o,
    labelEn: o.labelEn,
    labelAr: o.labelAr,
    labelUr: o.labelUr,
  }));
}

function optionLabel(opt: SurveyQuestionOption, lang: Lang): string {
  if (lang === 'ar') return opt.labelAr;
  if (lang === 'ur') return opt.labelUr ?? opt.labelEn;
  return opt.labelEn;
}

export class OnboardingSurveyService {
  async getTemplate(accountType: PlatformAccountType, lang: Lang = 'ar'): Promise<PublicSurveyTemplate | null> {
    const template = await prisma.onboardingSurveyTemplate.findUnique({
      where: { accountType, isActive: true },
      include: {
        sections: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
          include: {
            questions: {
              where: { isActive: true },
              orderBy: { sortOrder: 'asc' },
            },
            content: true,
          },
        },
      },
    });

    if (!template) return null;

    const sections: PublicSurveySection[] = template.sections.map((section) => {
      const content: PublicSectionContent | null =
        section.content && section.content.isActive
          ? {
              title: pickLang(lang, section.content.titleEn ?? '', section.content.titleAr ?? '', section.content.titleUr),
              body: pickLang(lang, section.content.bodyEn ?? '', section.content.bodyAr ?? '', section.content.bodyUr),
              imageUrl: section.content.imageUrl,
              videoUrl: section.content.videoUrl,
              posterUrl: section.content.posterUrl,
              linkUrl: section.content.linkUrl,
            }
          : null;

      const questions: PublicSurveyQuestion[] = section.questions.map((q) => {
        const opts = parseOptions(q.options, lang);
        return {
          id: q.id,
          code: q.code,
          questionText: pickLang(lang, q.questionTextEn, q.questionTextAr, q.questionTextUr),
          answerType: q.answerType,
          options: opts.map((o) => ({
            value: o.value,
            label: optionLabel(o, lang),
          })),
          sortOrder: q.sortOrder,
          isRequired: q.isRequired,
          showIf: (q.showIf as ShowIfRule | null) ?? null,
          metadata: (q.metadata as Record<string, unknown> | null) ?? null,
        };
      });

      return {
        id: section.id,
        code: section.code,
        title: pickLang(lang, section.titleEn, section.titleAr, section.titleUr),
        description: pickLang(lang, section.descriptionEn ?? '', section.descriptionAr ?? '', section.descriptionUr) || null,
        sortOrder: section.sortOrder,
        showIf: (section.showIf as ShowIfRule | null) ?? null,
        questions,
        content,
      };
    });

    return {
      accountType: template.accountType,
      name: pickLang(lang, template.nameEn, template.nameAr),
      version: template.version,
      sections,
    };
  }

  filterVisibleSections(
    sections: PublicSurveySection[],
    answers: Record<string, unknown>,
    skippedSections: string[],
  ): PublicSurveySection[] {
    return sections.filter((section) => {
      if (skippedSections.includes(section.code)) return false;
      return evaluateShowIf(section.showIf, answers);
    });
  }

  filterVisibleQuestions(
    questions: PublicSurveyQuestion[],
    answers: Record<string, unknown>,
  ): PublicSurveyQuestion[] {
    return questions.filter((q) => evaluateShowIf(q.showIf, answers));
  }

  async getProgress(userId: string): Promise<SurveyProgressPayload | null> {
    const row = await prisma.onboardingSurveyProgress.findUnique({ where: { userId } });
    if (!row) return null;
    return {
      accountType: row.accountType,
      currentSectionCode: row.currentSectionCode,
      answers: (row.answers as Record<string, unknown>) ?? {},
      skippedSections: row.skippedSections,
      completedSections: row.completedSections,
      isComplete: row.isComplete,
    };
  }

  async saveProgress(
    userId: string,
    payload: {
      accountType: PlatformAccountType;
      currentSectionCode?: string | null;
      answers: Record<string, unknown>;
      skippedSections?: string[];
      completedSections?: string[];
      isComplete?: boolean;
    },
  ): Promise<SurveyProgressPayload> {
    const row = await prisma.onboardingSurveyProgress.upsert({
      where: { userId },
      create: {
        userId,
        accountType: payload.accountType,
        currentSectionCode: payload.currentSectionCode ?? null,
        answers: payload.answers as Prisma.JsonObject,
        skippedSections: payload.skippedSections ?? [],
        completedSections: payload.completedSections ?? [],
        isComplete: payload.isComplete ?? false,
      },
      update: {
        accountType: payload.accountType,
        currentSectionCode: payload.currentSectionCode ?? null,
        answers: payload.answers as Prisma.JsonObject,
        skippedSections: payload.skippedSections,
        completedSections: payload.completedSections,
        isComplete: payload.isComplete,
      },
    });

    return {
      accountType: row.accountType,
      currentSectionCode: row.currentSectionCode,
      answers: (row.answers as Record<string, unknown>) ?? {},
      skippedSections: row.skippedSections,
      completedSections: row.completedSections,
      isComplete: row.isComplete,
    };
  }

  async upsertSectionContent(
    sectionId: string,
    data: {
      titleEn?: string | null;
      titleAr?: string | null;
      titleUr?: string | null;
      bodyEn?: string | null;
      bodyAr?: string | null;
      bodyUr?: string | null;
      imageUrl?: string | null;
      videoUrl?: string | null;
      posterUrl?: string | null;
      linkUrl?: string | null;
      isActive?: boolean;
    },
  ) {
    return prisma.onboardingSectionContent.upsert({
      where: { sectionId },
      create: { sectionId, ...data },
      update: data,
    });
  }

  async listTemplatesForAdmin() {
    return prisma.onboardingSurveyTemplate.findMany({
      include: {
        sections: {
          orderBy: { sortOrder: 'asc' },
          include: { content: true, _count: { select: { questions: true } } },
        },
      },
      orderBy: { accountType: 'asc' },
    });
  }
}

export const onboardingSurveyService = new OnboardingSurveyService();
