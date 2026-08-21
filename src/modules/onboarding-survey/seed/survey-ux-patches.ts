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
};

export async function applySurveyUxPatches(): Promise<SurveyUxPatchResult> {
  let sectionsDeactivated = 0;
  let questionsPatched = 0;
  let questionsMultiEnabled = 0;

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

  return { sectionsDeactivated, questionsPatched, questionsMultiEnabled };
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
