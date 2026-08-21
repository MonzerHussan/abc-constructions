/**
 * Applies abc-survey-seed.json (v3 delta) onto existing onboarding survey templates.
 * Run after base templates exist: npm run survey:apply-seed
 */
import { readFileSync } from "fs";
import { join } from "path";
import { prisma } from "@/lib/prisma";
import type { PlatformAccountType } from "@/lib/account-types";
import { isPlatformAccountType } from "@/lib/account-types";
import type { Prisma, OnboardingAnswerType } from "@/generated/prisma/client";
import type { ShowIfRule } from "@/lib/onboarding/survey-show-if";
import type { SeedOption } from "./individual-template";

const DEFAULT_SEED_PATH = join(
  process.cwd(),
  "docs/pilot-validation/abc-survey-seed.json",
);

type SeedJsonOption = {
  value: string;
  labelAr: string;
  labelEn: string;
  order?: number;
};

type SeedJsonScale = {
  min: number;
  max: number;
  minLabelAr?: string;
  maxLabelAr?: string;
  minLabelEn?: string;
  maxLabelEn?: string;
};

type SeedJsonQuestion = {
  code: string;
  accountTypes: string[];
  sectionCode: string;
  sectionTitleAr: string;
  sectionTitleEn: string;
  sectionOrder: number;
  questionOrder: number;
  textAr: string;
  textEn: string;
  answerType: OnboardingAnswerType;
  required: boolean;
  showIf: ShowIfRule | null;
  options: SeedJsonOption[] | null;
  scale: SeedJsonScale | null;
  note?: string;
};

type SeedJsonEdit =
  | { op: "FIX_TEXT"; accountType: string; code: string; textAr?: string; textEn?: string; sectionTitleAr?: string }
  | { op: "RECODE"; accountType: string; sectionCode: string; from: string; to: string }
  | {
      op: "DELETE";
      accountType: string;
      code: string;
      then?: {
        op: "SET_SECTION_SHOWIF";
        accountType: string;
        sectionCode: string;
        showIf: ShowIfRule;
      };
    }
  | { op: "SET_OPTIONAL"; targets: [string, string][] }
  | { op: "SET_QUESTION_SHOWIF"; codeAllTypes: string; showIf: ShowIfRule }
  | { op: "SET_SECTION_SHOWIF"; accountType: string; sectionCode: string; showIf: ShowIfRule }
  | { op: "REBUILD_SECTIONS"; accountType: string; remove: string[]; replaceWith?: string[] };

type SeedJsonEditLoose = SeedJsonEdit | { op: string; [key: string]: unknown };

export type ApplySurveySeedResult = {
  seedVersion: string;
  questionsUpserted: number;
  editsApplied: number;
  editsSkipped: string[];
  sectionsDeactivated: number;
};

function loadSeed(filePath = DEFAULT_SEED_PATH) {
  const raw = readFileSync(filePath, "utf-8");
  return JSON.parse(raw) as {
    version: string;
    newQuestions: SeedJsonQuestion[];
    editsToExistingQuestions?: SeedJsonEditLoose[];
  };
}

function toOptions(q: SeedJsonQuestion): SeedOption[] | undefined {
  if (q.options?.length) {
    return [...q.options]
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      .map((o) => ({ value: o.value, labelEn: o.labelEn, labelAr: o.labelAr }));
  }
  if (q.scale && q.answerType === "LINEAR_SCALE") {
    const opts: SeedOption[] = [];
    for (let i = q.scale.min; i <= q.scale.max; i++) {
      opts.push({ value: String(i), labelEn: String(i), labelAr: String(i) });
    }
    return opts;
  }
  return undefined;
}

function toMetadata(q: SeedJsonQuestion): Record<string, unknown> | undefined {
  const meta: Record<string, unknown> = {};
  if (q.scale) meta.scale = q.scale;
  if (q.note) meta.note = q.note;
  return Object.keys(meta).length ? meta : undefined;
}

async function findQuestion(accountType: string, code: string) {
  return prisma.onboardingSurveyQuestion.findFirst({
    where: {
      code,
      section: { template: { accountType: accountType as PlatformAccountType } },
    },
    include: { section: { include: { template: true } } },
  });
}

async function upsertSeedQuestion(
  accountType: PlatformAccountType,
  q: SeedJsonQuestion,
): Promise<void> {
  const template = await prisma.onboardingSurveyTemplate.findUnique({
    where: { accountType },
  });
  if (!template) throw new Error(`Template missing for ${accountType}`);

  const section = await prisma.onboardingSurveySection.upsert({
    where: { templateId_code: { templateId: template.id, code: q.sectionCode } },
    create: {
      templateId: template.id,
      code: q.sectionCode,
      titleEn: q.sectionTitleEn,
      titleAr: q.sectionTitleAr,
      sortOrder: q.sectionOrder,
      isActive: true,
    },
    update: {
      titleEn: q.sectionTitleEn,
      titleAr: q.sectionTitleAr,
      sortOrder: q.sectionOrder,
      isActive: true,
    },
  });

  const options = toOptions(q);
  const metadata = toMetadata(q);

  await prisma.onboardingSurveyQuestion.upsert({
    where: { sectionId_code: { sectionId: section.id, code: q.code } },
    create: {
      sectionId: section.id,
      code: q.code,
      questionTextEn: q.textEn,
      questionTextAr: q.textAr,
      answerType: q.answerType,
      options: (options as Prisma.InputJsonValue) ?? undefined,
      sortOrder: q.questionOrder,
      isRequired: q.required,
      showIf: (q.showIf as Prisma.InputJsonValue) ?? undefined,
      metadata: (metadata as Prisma.InputJsonValue) ?? undefined,
      isActive: true,
    },
    update: {
      questionTextEn: q.textEn,
      questionTextAr: q.textAr,
      answerType: q.answerType,
      options: (options as Prisma.InputJsonValue) ?? undefined,
      sortOrder: q.questionOrder,
      isRequired: q.required,
      showIf: (q.showIf as Prisma.InputJsonValue) ?? undefined,
      metadata: (metadata as Prisma.InputJsonValue) ?? undefined,
      isActive: true,
    },
  });
}

async function applyEdit(
  edit: SeedJsonEdit,
  skipped: string[],
  stats: { sectionsDeactivated: number },
): Promise<boolean> {
  switch (edit.op) {
    case "FIX_TEXT": {
      if (edit.code === "__SECTION_CATALOG__") {
        const template = await prisma.onboardingSurveyTemplate.findUnique({
          where: { accountType: edit.accountType as PlatformAccountType },
        });
        if (!template || !edit.sectionTitleAr) return false;
        await prisma.onboardingSurveySection.updateMany({
          where: { templateId: template.id, code: "CATALOG" },
          data: { titleAr: edit.sectionTitleAr },
        });
        return true;
      }
      const row = await findQuestion(edit.accountType, edit.code);
      if (!row) {
        skipped.push(`FIX_TEXT ${edit.accountType}/${edit.code} not found`);
        return false;
      }
      await prisma.onboardingSurveyQuestion.update({
        where: { id: row.id },
        data: {
          ...(edit.textAr ? { questionTextAr: edit.textAr } : {}),
          ...(edit.textEn ? { questionTextEn: edit.textEn } : {}),
        },
      });
      return true;
    }
    case "RECODE": {
      const row = await prisma.onboardingSurveyQuestion.findFirst({
        where: {
          code: edit.from,
          section: {
            code: edit.sectionCode,
            template: { accountType: edit.accountType as PlatformAccountType },
          },
        },
      });
      if (!row) {
        skipped.push(`RECODE ${edit.accountType}/${edit.from} not found`);
        return false;
      }
      await prisma.onboardingSurveyQuestion.update({
        where: { id: row.id },
        data: { code: edit.to },
      });
      return true;
    }
    case "DELETE": {
      const row = await findQuestion(edit.accountType, edit.code);
      if (!row) {
        skipped.push(`DELETE ${edit.accountType}/${edit.code} not found`);
        return false;
      }
      await prisma.onboardingSurveyQuestion.update({
        where: { id: row.id },
        data: { isActive: false },
      });
      if (edit.then?.op === "SET_SECTION_SHOWIF") {
        const template = await prisma.onboardingSurveyTemplate.findUnique({
          where: { accountType: edit.then.accountType as PlatformAccountType },
        });
        if (template) {
          await prisma.onboardingSurveySection.updateMany({
            where: { templateId: template.id, code: edit.then.sectionCode },
            data: { showIf: edit.then.showIf as Prisma.InputJsonValue },
          });
        }
      }
      return true;
    }
    case "SET_OPTIONAL": {
      for (const [accountType, code] of edit.targets) {
        const row = await findQuestion(accountType, code);
        if (row) {
          await prisma.onboardingSurveyQuestion.update({
            where: { id: row.id },
            data: { isRequired: false },
          });
        }
      }
      return true;
    }
    case "SET_QUESTION_SHOWIF": {
      const rows = await prisma.onboardingSurveyQuestion.findMany({
        where: { code: edit.codeAllTypes, isActive: true },
      });
      for (const row of rows) {
        await prisma.onboardingSurveyQuestion.update({
          where: { id: row.id },
          data: { showIf: edit.showIf as Prisma.InputJsonValue },
        });
      }
      return rows.length > 0;
    }
    case "SET_SECTION_SHOWIF": {
      const template = await prisma.onboardingSurveyTemplate.findUnique({
        where: { accountType: edit.accountType as PlatformAccountType },
      });
      if (!template) return false;
      await prisma.onboardingSurveySection.updateMany({
        where: { templateId: template.id, code: edit.sectionCode },
        data: { showIf: edit.showIf as Prisma.InputJsonValue },
      });
      return true;
    }
    case "REBUILD_SECTIONS": {
      const template = await prisma.onboardingSurveyTemplate.findUnique({
        where: { accountType: edit.accountType as PlatformAccountType },
      });
      if (!template) return false;
      const result = await prisma.onboardingSurveySection.updateMany({
        where: { templateId: template.id, code: { in: edit.remove } },
        data: { isActive: false },
      });
      stats.sectionsDeactivated += result.count;
      return true;
    }
    default: {
      const loose = edit as SeedJsonEditLoose;
      skipped.push(`Unsupported op: ${loose.op}`);
      return false;
    }
  }
}

export async function applyAllSurveySeeds(): Promise<ApplySurveySeedResult[]> {
  const paths = [
    join(process.cwd(), "docs/pilot-validation/abc-survey-seed.json"),
    join(process.cwd(), "docs/pilot-validation/coverage-gaps-seed.json"),
  ];
  const results: ApplySurveySeedResult[] = [];
  for (const path of paths) {
    results.push(await applySurveySeed(path));
  }
  return results;
}

export async function applySurveySeed(filePath = DEFAULT_SEED_PATH): Promise<ApplySurveySeedResult> {
  const seed = loadSeed(filePath);
  let questionsUpserted = 0;
  let editsApplied = 0;
  const editsSkipped: string[] = [];
  const stats = { sectionsDeactivated: 0 };

  for (const q of seed.newQuestions) {
    for (const accountType of q.accountTypes) {
      if (!isPlatformAccountType(accountType)) continue;
      await upsertSeedQuestion(accountType, q);
      questionsUpserted++;
    }
  }

  for (const edit of seed.editsToExistingQuestions ?? []) {
    if (await applyEdit(edit as SeedJsonEdit, editsSkipped, stats)) editsApplied++;
  }

  // Bump template version marker
  await prisma.onboardingSurveyTemplate.updateMany({
    data: { version: 3 },
  });

  return {
    seedVersion: seed.version,
    questionsUpserted,
    editsApplied,
    editsSkipped,
    sectionsDeactivated: stats.sectionsDeactivated,
  };
}
