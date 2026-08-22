import { describe, it, expect } from "vitest";
import { nextBestActionService } from "@/modules/portal/services/NextBestActionService";
import { contractorPortalConfig } from "@/modules/portal/config/personas/contractor.config";
import type { DurationData } from "@/modules/portal/types/portal-home.types";

const noOrgData: DurationData = {
  profile: false,
  profileScore: 0,
  isVerified: false,
  verificationRank: "none",
  surveyDone: false,
  hasOperational: false,
};

const healthyData: DurationData = {
  profile: true,
  profileScore: 95,
  isVerified: true,
  verificationRank: "verified",
  surveyDone: true,
  hasOperational: true,
};

describe("NextBestActionService (no org → no DB)", () => {
  it("returns the urgent rules when the contractor is not activated", async () => {
    const actions = await nextBestActionService.evaluate(
      "user-1",
      null,
      contractorPortalConfig.nbaRules,
      noOrgData,
    );

    const priorities = actions.map((a) => a.priority);
    // profile_incomplete, verification_pending, no_first_rfq are the triggers.
    expect(actions.length).toBeGreaterThanOrEqual(3);
    expect(priorities[0]).toBeLessThan(priorities[priorities.length - 1]);
  });

  it("returns no actions for an activated contractor without pending work", async () => {
    const actions = await nextBestActionService.evaluate(
      "user-1",
      null,
      contractorPortalConfig.nbaRules,
      healthyData,
    );
    expect(actions.some((a) => a.titleKey.includes("profile"))).toBe(false);
    expect(actions.some((a) => a.titleKey.includes("verification"))).toBe(false);
  });

  it("respects priority order (1 = most urgent)", async () => {
    const actions = await nextBestActionService.evaluate(
      "user-1",
      null,
      contractorPortalConfig.nbaRules,
      noOrgData,
    );
    for (let i = 1; i < actions.length; i++) {
      expect(actions[i].priority).toBeGreaterThan(actions[i - 1].priority);
    }
  });
});