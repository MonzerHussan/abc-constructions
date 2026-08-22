import { prisma } from "@/lib/prisma";
import type {
  ActivationDimensionDef,
  PortalActivation,
  PortalActivationDimension,
  DurationData,
} from "@/modules/portal/types/portal-home.types";

function clampPercent(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}

export function computeProfileScore(profile: {
  companySize: string | null;
  annualVolume: string | null;
  businessActivity: string | null;
  relevantCategories: string[];
  subcategories: string[];
}): number {
  if (!profile) return 0;
  let score = 0;
  if (profile.companySize) score += 15;
  if (profile.annualVolume) score += 10;
  if (profile.businessActivity) score += 10;
  score += Math.min(35, profile.relevantCategories.length * 5);
  score += Math.min(30, profile.subcategories.length * 5);
  return clampPercent(score);
}

/**
 * Computes the activation score from REAL data (profile, verification,
 * survey readiness, first operational signal). Never uses fake numbers.
 */
export class ActivationScoreService {
  async compute(
    userId: string,
    organizationId: string | null,
    dimensionDefs: ActivationDimensionDef[]
  ): Promise<{ activation: PortalActivation; data: DurationData }> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { isVerified: true },
    });
    const profile = await prisma.profile.findFirst({
      where: { userId },
      select: {
        companySize: true,
        annualVolume: true,
        businessActivity: true,
        relevantCategories: true,
        subcategories: true,
        surveyData: true,
      },
    });
    const verification = await prisma.verification.findFirst({
      where: { userId },
      orderBy: { submittedAt: "desc" },
      select: { status: true },
    });

    const userOrg = organizationId;
    const operationalCounts = userOrg
      ? await Promise.all([
          prisma.rFQ.count({ where: { organizationId: userOrg } }),
          prisma.project.count({ where: { organizationId: userOrg } }),
        ])
      : [0, 0];
    const hasOperational = operationalCounts[0] + operationalCounts[1] > 0;

    const profileScore = profile ? computeProfileScore(profile) : 0;
    const verificationRank: DurationData["verificationRank"] = user?.isVerified
      ? "verified"
      : verification?.status === "VERIFIED"
        ? "verified"
        : verification && !["REJECTED"].includes(verification.status)
          ? "submitted"
          : "none";
    const surveyDone = !!(profile && profile.surveyData);

    const data: DurationData = {
      profile: !!profile,
      profileScore,
      isVerified: user?.isVerified ?? false,
      verificationRank,
      surveyDone,
      hasOperational,
    };

    const raw: Record<string, number> = {
      profile: profileScore,
      verification:
        verificationRank === "verified" ? 100 : verificationRank === "submitted" ? 50 : 0,
      readiness: surveyDone ? 100 : 0,
      operational: hasOperational ? 100 : 0,
    };

    const dimensions: PortalActivationDimension[] = dimensionDefs.map((def) => ({
      id: def.id,
      percent: clampPercent(raw[def.id] ?? 0),
      labelKey: def.labelKey,
      nextStepKey: def.nextStepKey ?? def.labelKey,
    }));

    const overall =
      dimensions.length > 0
        ? clampPercent(dimensions.reduce((sum, d) => sum + d.percent, 0) / dimensions.length)
        : 0;

    return { activation: { overall, dimensions }, data };
  }
}

export const activationScoreService = new ActivationScoreService();