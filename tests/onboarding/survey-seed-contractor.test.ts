import { describe, it, expect, vi, beforeEach } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    onboardingSurveyTemplate: {
      findUnique: vi.fn(),
      updateMany: vi.fn(),
    },
    onboardingSurveySection: {
      upsert: vi.fn(),
      updateMany: vi.fn(),
    },
    onboardingSurveyQuestion: {
      upsert: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
    },
  },
}));

import { prisma } from "@/lib/prisma";
import { applySurveySeed } from "@/modules/onboarding-survey/seed/apply-survey-seed";

const coveragePath = join(
  process.cwd(),
  "docs/pilot-validation/coverage-gaps-seed.json",
);

describe("coverage-gaps seed — contractor TRUST_PAYMENTS", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(prisma.onboardingSurveyTemplate.findUnique).mockResolvedValue({
      id: "tpl-contractor",
      accountType: "CONTRACTOR",
      nameEn: "Main Contractor Survey",
      nameAr: "استبيان المقاول",
      version: 2,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    vi.mocked(prisma.onboardingSurveySection.upsert).mockImplementation(async ({ create }) => ({
      id: `sec-${create.code}`,
      templateId: create.templateId,
      code: create.code,
      titleEn: create.titleEn,
      titleAr: create.titleAr,
      titleUr: null,
      descriptionEn: null,
      descriptionAr: null,
      descriptionUr: null,
      sortOrder: create.sortOrder,
      isActive: true,
      showIf: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));
    vi.mocked(prisma.onboardingSurveyQuestion.upsert).mockResolvedValue({} as never);
    vi.mocked(prisma.onboardingSurveyTemplate.updateMany).mockResolvedValue({ count: 9 });
  });

  it("includes CNT-TP1..TP6 for CONTRACTOR in seed file", () => {
    const seed = JSON.parse(readFileSync(coveragePath, "utf-8"));
    const contractorTrust = seed.newQuestions.filter(
      (q: { code: string; accountTypes: string[]; sectionCode: string }) =>
        q.accountTypes.includes("CONTRACTOR") && q.sectionCode === "TRUST_PAYMENTS",
    );
    const codes = contractorTrust.map((q: { code: string }) => q.code);
    expect(codes).toContain("CNT-TP1");
    expect(codes).toContain("CNT-TP4");
    expect(codes).toContain("CNT-TP5");
    expect(contractorTrust.length).toBeGreaterThanOrEqual(5);
  });

  it("applySurveySeed upserts contractor trust questions", async () => {
    const result = await applySurveySeed(coveragePath);
    expect(result.questionsUpserted).toBeGreaterThan(0);

    const upsertCalls = vi.mocked(prisma.onboardingSurveyQuestion.upsert).mock.calls;
    const trustUpserts = upsertCalls.filter((call) => {
      const data = call[0]?.create as { code?: string } | undefined;
      return data?.code?.startsWith("CNT-TP");
    });
    expect(trustUpserts.length).toBeGreaterThanOrEqual(5);

    const sectionUpserts = vi.mocked(prisma.onboardingSurveySection.upsert).mock.calls;
    expect(
      sectionUpserts.some((call) => call[0]?.create?.code === "TRUST_PAYMENTS"),
    ).toBe(true);
  });
});
