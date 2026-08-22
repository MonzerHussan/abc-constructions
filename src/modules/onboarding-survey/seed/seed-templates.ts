import { prisma } from '@/lib/prisma';
import { PLATFORM_ACCOUNT_TYPE_IDS } from '@/lib/account-types';
import type { PlatformAccountType } from '@/lib/account-types';
import type { Prisma } from '@/generated/prisma/client';
import { individualSections } from './individual-template';
import { contractorSections } from './contractor-template';
import { subcontractorSections } from './subcontractor-template';
import { ownerSections } from './owner-template';
import { consultantSections } from './consultant-template';
import { supplierSections } from './supplier-template';
import { traderSections } from './trader-template';
import { companySections } from './company-template';
import { entitySections } from './entity-template';
import type { SeedSection } from './individual-template';

const TEMPLATE_NAMES: Record<PlatformAccountType, { en: string; ar: string }> = {
  OWNER: { en: 'Owner / Developer Survey', ar: 'استبيان المالك / المطور' },
  CONSULTANT: { en: 'Consultant Survey', ar: 'استبيان الاستشاري' },
  CONTRACTOR: { en: 'Main Contractor Survey', ar: 'استبيان المقاول الرئيسي' },
  SUBCONTRACTOR: { en: 'Subcontractor Survey', ar: 'استبيان المقاول الفرعي' },
  SUPPLIER: { en: 'Supplier Survey', ar: 'استبيان المورد' },
  TRADER: { en: 'Trader Survey', ar: 'استبيان التاجر' },
  INDIVIDUAL: { en: 'Individual Survey', ar: 'استبيان الأفراد' },
  COMPANY: { en: 'PM & Maintenance Survey', ar: 'استبيان الصيانة وإدارة المرافق' },
  ENTITY: { en: 'Government Entity Survey', ar: 'استبيان الجهة الحكومية' },
};

const TEMPLATE_BUILDERS: Record<PlatformAccountType, () => SeedSection[]> = {
  OWNER: ownerSections,
  CONSULTANT: consultantSections,
  CONTRACTOR: contractorSections,
  SUBCONTRACTOR: subcontractorSections,
  SUPPLIER: supplierSections,
  TRADER: traderSections,
  INDIVIDUAL: individualSections,
  COMPANY: companySections,
  ENTITY: entitySections,
};

async function upsertTemplate(
  accountType: PlatformAccountType,
  sections: SeedSection[],
): Promise<void> {
  const names = TEMPLATE_NAMES[accountType];
  const template = await prisma.onboardingSurveyTemplate.upsert({
    where: { accountType },
    create: {
      accountType,
      nameEn: names.en,
      nameAr: names.ar,
      version: 2,
      isActive: true,
    },
    update: {
      nameEn: names.en,
      nameAr: names.ar,
      version: 2,
    },
  });

  for (const section of sections) {
    const sectionRow = await prisma.onboardingSurveySection.upsert({
      where: { templateId_code: { templateId: template.id, code: section.code } },
      create: {
        templateId: template.id,
        code: section.code,
        titleEn: section.titleEn,
        titleAr: section.titleAr,
        descriptionEn: section.descriptionEn ?? null,
        descriptionAr: section.descriptionAr ?? null,
        sortOrder: section.sortOrder,
        showIf: (section.showIf as Prisma.InputJsonValue) ?? undefined,
        isActive: true,
      },
      update: {
        titleEn: section.titleEn,
        titleAr: section.titleAr,
        descriptionEn: section.descriptionEn ?? null,
        descriptionAr: section.descriptionAr ?? null,
        sortOrder: section.sortOrder,
        showIf: (section.showIf as Prisma.InputJsonValue) ?? undefined,
      },
    });

    for (const q of section.questions) {
      await prisma.onboardingSurveyQuestion.upsert({
        where: { sectionId_code: { sectionId: sectionRow.id, code: q.code } },
        create: {
          sectionId: sectionRow.id,
          code: q.code,
          questionTextEn: q.questionTextEn,
          questionTextAr: q.questionTextAr,
          answerType: q.answerType,
          options: (q.options as Prisma.InputJsonValue) ?? undefined,
          sortOrder: q.sortOrder,
          isRequired: q.isRequired ?? true,
          showIf: (q.showIf as Prisma.InputJsonValue) ?? undefined,
          metadata: (q.metadata as Prisma.InputJsonValue) ?? undefined,
          isActive: true,
        },
        update: {
          questionTextEn: q.questionTextEn,
          questionTextAr: q.questionTextAr,
          answerType: q.answerType,
          options: (q.options as Prisma.InputJsonValue) ?? undefined,
          sortOrder: q.sortOrder,
          isRequired: q.isRequired ?? true,
          showIf: (q.showIf as Prisma.InputJsonValue) ?? undefined,
          metadata: (q.metadata as Prisma.InputJsonValue) ?? undefined,
        },
      });
    }
  }

  const activeCodes = sections.map((s) => s.code);
  await prisma.onboardingSurveySection.updateMany({
    where: { templateId: template.id, code: { notIn: activeCodes } },
    data: { isActive: false },
  });
}

/** Seeds missing templates only (first run). */
export async function ensureOnboardingSurveyTemplatesSeeded(): Promise<void> {
  for (const accountType of PLATFORM_ACCOUNT_TYPE_IDS) {
    const hasTemplate = await prisma.onboardingSurveyTemplate.findUnique({
      where: { accountType },
    });
    if (hasTemplate) continue;
    await upsertTemplate(accountType, TEMPLATE_BUILDERS[accountType]());
  }
}

/** Upserts all 9 templates — use to refresh skeleton → full templates. */
export async function reseedAllSurveyTemplates(): Promise<void> {
  for (const accountType of PLATFORM_ACCOUNT_TYPE_IDS) {
    await upsertTemplate(accountType, TEMPLATE_BUILDERS[accountType]());
  }
}

export async function reseedIndividualTemplate(): Promise<void> {
  await upsertTemplate('INDIVIDUAL', individualSections());
}

export async function reseedSurveyTemplate(accountType: PlatformAccountType): Promise<void> {
  await upsertTemplate(accountType, TEMPLATE_BUILDERS[accountType]());
}
