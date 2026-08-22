import { prisma } from "@/lib/prisma";
import type { PlatformAccountType } from "@/lib/account-types";
import { PLATFORM_ACCOUNT_TYPE_IDS } from "@/lib/account-types";
import type { Prisma } from "@/generated/prisma/client";

const DUPLICATE_TRANSPORT_SECTIONS = [
  "FLEET",
  "TRANSPORT_GATE",
  "TRANSPORT_LOGISTICS",
];

const REGION_QUESTION_CODES = new Set([
  "K3",
  "T3",
  "L2",
  "Q3",
  "Q27",
  "G3",
  "TR_REGIONS",
  "TR7",
]);

const MULTI_QUESTION_PATTERN =
  /(المناطق|مناطق الخدمة|مناطق الت|ضمانات|تحديات|ميزات|مصادر|قنوات|أولويات|أي من|ما هي المناطق)/;

export type SurveyUxPatchResult = {
  sectionsDeactivated: number;
  questionsPatched: number;
  questionsMultiEnabled: number;
  catalogTextFixed: number;
  supplierSellSplit: number;
};

const CATALOG_TITLE_AR = "\u0627\u0644\u0643\u0627\u062A\u0627\u0644\u0648\u062C \u0648\u0627\u0644\u0631\u0642\u0645\u0646\u0629";
const CATALOG_QUESTION_AR =
  "\u0647\u0644 \u0644\u062F\u064A\u0643\u0645 \u0643\u062A\u0627\u0644\u0648\u062C \u0631\u0642\u0645\u064A \u0644\u0644\u0645\u0646\u062A\u062C\u0627\u062A\u061F";

const SUPPLIER_SELL_OPTIONS = [
  { value: "manufacturer", labelEn: "Manufacturer", labelAr: "مصنّع" },
  { value: "exclusive_agent", labelEn: "Exclusive agent", labelAr: "وكيل حصري" },
  { value: "authorized_dist", labelEn: "Authorized distributor", labelAr: "موزّع معتمد" },
  { value: "importer", labelEn: "Direct importer", labelAr: "مستورد مباشر" },
  { value: "stock_supplier", labelEn: "Stock-holding supplier", labelAr: "مورّد بمخزون" },
] as const;

export async function applySurveyUxPatches(): Promise<SurveyUxPatchResult> {
  let sectionsDeactivated = 0;
  let questionsPatched = 0;
  let questionsMultiEnabled = 0;
  let catalogTextFixed = 0;
  let supplierSellSplit = 0;

  const supplierTemplate = await prisma.onboardingSurveyTemplate.findUnique({
    where: { accountType: "SUPPLIER" },
  });
  if (supplierTemplate) {
    const catalogSection = await prisma.onboardingSurveySection.findFirst({
      where: { templateId: supplierTemplate.id, code: "CATALOG" },
    });
    if (catalogSection && catalogSection.titleAr.includes("alog")) {
      await prisma.onboardingSurveySection.update({
        where: { id: catalogSection.id },
        data: { titleAr: CATALOG_TITLE_AR },
      });
      catalogTextFixed++;
    }

    const s10 =
      catalogSection &&
      (await prisma.onboardingSurveyQuestion.findFirst({
        where: { sectionId: catalogSection.id, code: "S10" },
      }));
    if (s10 && /alog/i.test(s10.questionTextAr)) {
      await prisma.onboardingSurveyQuestion.update({
        where: { id: s10.id },
        data: { questionTextAr: CATALOG_QUESTION_AR },
      });
      catalogTextFixed++;
    }

    const sell02 = await prisma.onboardingSurveyQuestion.findFirst({
      where: {
        code: "SELL-02",
        isActive: true,
        section: { templateId: supplierTemplate.id },
      },
    });
    if (sell02) {
      await prisma.onboardingSurveyQuestion.update({
        where: { id: sell02.id },
        data: { isActive: false },
      });
      supplierSellSplit++;
    }

    const marketSection = await prisma.onboardingSurveySection.findFirst({
      where: { templateId: supplierTemplate.id, code: "MARKET_SELL" },
    });
    if (marketSection) {
      await prisma.onboardingSurveyQuestion.upsert({
        where: {
          sectionId_code: { sectionId: marketSection.id, code: "SUP-SELL-02" },
        },
        create: {
          sectionId: marketSection.id,
          code: "SUP-SELL-02",
          questionTextEn: "What is your supplier role in these materials?",
          questionTextAr: "ما طبيعة نشاطكم كمورّد في هذه المواد؟",
          answerType: "SINGLE_CHOICE",
          options: SUPPLIER_SELL_OPTIONS as unknown as Prisma.InputJsonValue,
          sortOrder: 2,
          isRequired: true,
          isActive: true,
        },
        update: {
          questionTextEn: "What is your supplier role in these materials?",
          questionTextAr: "ما طبيعة نشاطكم كمورّد في هذه المواد؟",
          options: SUPPLIER_SELL_OPTIONS as unknown as Prisma.InputJsonValue,
          isActive: true,
        },
      });
      supplierSellSplit++;
    }
  }

  for (const accountType of PLATFORM_ACCOUNT_TYPE_IDS) {
    const template = await prisma.onboardingSurveyTemplate.findUnique({
      where: { accountType },
    });
    if (!template) continue;

    const transport = await prisma.onboardingSurveySection.findFirst({
      where: { templateId: template.id, code: "TRANSPORT", isActive: true },
    });
    if (transport) {
      const result = await prisma.onboardingSurveySection.updateMany({
        where: {
          templateId: template.id,
          code: { in: DUPLICATE_TRANSPORT_SECTIONS },
        },
        data: { isActive: false },
      });
      sectionsDeactivated += result.count;
    }

    const fleetQuestions = await prisma.onboardingSurveyQuestion.findMany({
      where: {
        isActive: true,
        section: { templateId: template.id, code: { in: DUPLICATE_TRANSPORT_SECTIONS } },
      },
    });
    for (const q of fleetQuestions) {
      await prisma.onboardingSurveyQuestion.update({
        where: { id: q.id },
        data: { isActive: false },
      });
    }

    const questions = await prisma.onboardingSurveyQuestion.findMany({
      where: { isActive: true, section: { templateId: template.id } },
    });

    for (const q of questions) {
      const meta = (q.metadata as Record<string, unknown> | null) ?? {};
      let nextMeta: Record<string, unknown> | null = null;
      let nextType = q.answerType;
      let patched = false;

      if (REGION_QUESTION_CODES.has(q.code)) {
        nextMeta = { ...meta, optionSource: "REGIONS_BY_COUNTRY" };
        nextType = "MULTIPLE_CHOICE";
        patched = true;
      }

      if (q.code === "HC2") {
        nextMeta = {
          ...(nextMeta ?? meta),
          optionSource: "NATIONALS_PERCENT",
          compactNumeric: true,
        };
        patched = true;
      }

      if (
        q.answerType === "SINGLE_CHOICE" &&
        (REGION_QUESTION_CODES.has(q.code) ||
          MULTI_QUESTION_PATTERN.test(q.questionTextAr))
      ) {
        nextType = "MULTIPLE_CHOICE";
        questionsMultiEnabled++;
        patched = true;
      }

      if (/^[\d\s\-–%+./]+$/.test(q.questionTextAr.trim()) === false) {
        const opts = Array.isArray(q.options) ? q.options : [];
        const labels = opts.map((o) => {
          const row = o as { labelAr?: string; labelEn?: string };
          return row.labelAr ?? row.labelEn ?? "";
        });
        if (
          labels.length > 0 &&
          labels.every((l) => /^[\d\s\-–%+./]+$/.test(l.trim()))
        ) {
          nextMeta = { ...(nextMeta ?? meta), compactNumeric: true };
          patched = true;
        }
      }

      if (patched) {
        await prisma.onboardingSurveyQuestion.update({
          where: { id: q.id },
          data: {
            ...(nextMeta ? { metadata: nextMeta as Prisma.InputJsonValue } : {}),
            ...(nextType !== q.answerType ? { answerType: nextType } : {}),
            ...(REGION_QUESTION_CODES.has(q.code) ? { options: [] } : {}),
            ...(q.code === "HC2" ? { options: [] } : {}),
          },
        });
        questionsPatched++;
      }
    }
  }

  return { sectionsDeactivated, questionsPatched, questionsMultiEnabled, catalogTextFixed, supplierSellSplit };
}

/** Re-run template upsert orphans cleanup for one account type. */
export async function deactivateOrphanSections(
  templateId: string,
  activeSectionCodes: string[],
): Promise<number> {
  const result = await prisma.onboardingSurveySection.updateMany({
    where: {
      templateId,
      code: { notIn: activeSectionCodes },
    },
    data: { isActive: false },
  });
  return result.count;
}
