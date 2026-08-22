import { prisma } from "@/lib/prisma";
import type {
  NextBestAction,
  NbaRuleDef,
  DurationData,
} from "@/modules/portal/types/portal-home.types";

/**
 * Next Best Action — evaluates rules in priority order (1 = most urgent)
 * and returns only the rules that currently trigger. Phase 1 leaves
 * `supplier_match` off because recommendations feed is empty.
 */
export class NextBestActionService {
  async evaluate(
    userId: string,
    organizationId: string | null,
    ruleDefs: NbaRuleDef[],
    activationData: DurationData,
    recommendationCount = 0
  ): Promise<NextBestAction[]> {
    const actions: NextBestAction[] = [];

    // Default data used when there is no organization yet (counts stay 0).
    const orgId = organizationId ?? "__none__";

    const counters = organizationId
      ? await this.countPerRule(userId, orgId)
      : { pendingRfqs: 0, rfqCount: 0 };

    for (let i = 0; i < ruleDefs.length; i++) {
      const rule = ruleDefs[i];
      const priority = i + 1;
      let count = 0;
      let triggered = false;

      switch (rule.id) {
        case "pending_rfqs":
          triggered = counters.pendingRfqs > 0;
          count = counters.pendingRfqs;
          break;
        case "profile_incomplete":
          triggered = activationData.profileScore < 80;
          count = activatedCount(activationData.profileScore);
          break;
        case "verification_pending":
          triggered = activationData.verificationRank !== "verified";
          count = 1;
          break;
        case "no_first_rfq":
          triggered = counters.rfqCount === 0;
          count = 1;
          break;
        case "supplier_match":
          triggered = recommendationCount > 0 || !!rule.comingSoon;
          count = recommendationCount || (rule.comingSoon ? 0 : 0);
          if (triggered && count === 0 && rule.comingSoon) {
            // comingSoon placeholders are surfaced but not counted as real.
            triggered = false;
          }
          break;
        default:
          triggered = false;
      }

      if (triggered) {
        actions.push({
          priority,
          titleKey: rule.titleKey,
          count,
          href: rule.href,
          comingSoon: rule.comingSoon,
        });
      }
    }

    return actions;
  }

  private async countPerRule(
    userId: string,
    organizationId: string
  ): Promise<{ pendingRfqs: number; rfqCount: number }> {
    // RFQs awaiting a response: sent/open RFQs from the org that received no quotation.
    const awaiting = await prisma.rFQ.count({
      where: {
        organizationId,
        status: { in: ["SENT", "OPEN"] },
        quotations: { none: {} },
      },
    });
    const rfqCount = await prisma.rFQ.count({
      where: { organizationId, createdById: userId },
    });
    return { pendingRfqs: awaiting, rfqCount };
  }
}

function activatedCount(score: number): number {
  return score < 80 ? 1 : 0;
}

export const nextBestActionService = new NextBestActionService();