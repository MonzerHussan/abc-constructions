import { describe, it, expect } from "vitest";
import { contractorPortalConfig } from "@/modules/portal/config/personas/contractor.config";
import { getDefaultCapabilitiesForPersona } from "@/modules/portal/config/capability-map";
import { computeProfileScore } from "@/modules/portal/services/ActivationScoreService";

describe("contractor portal config", () => {
  it("defines the CONTRACTOR persona with demand template", () => {
    expect(contractorPortalConfig.persona).toBe("CONTRACTOR");
    expect(contractorPortalConfig.template).toBe("demand");
    expect(contractorPortalConfig.route).toBe("/projects/ABC/contractor");
  });

  it("has the required content blocks", () => {
    expect(contractorPortalConfig.activationDimensions).toHaveLength(4);
    expect(contractorPortalConfig.kpiSlots).toHaveLength(4);
    expect(contractorPortalConfig.quickActions).toHaveLength(4);
    expect(contractorPortalConfig.nbaRules).toHaveLength(5);
    expect(contractorPortalConfig.navLinks).toHaveLength(4);
    expect(contractorPortalConfig.defaultCapabilities).toEqual([
      "PROCUREMENT",
      "TENDERING",
      "PROJECTS",
      "MARKETPLACE",
    ]);
  });

  it("maps CONTRACTOR to its persona defaults", () => {
    const caps = getDefaultCapabilitiesForPersona("CONTRACTOR");
    expect(caps).toContain("PROCUREMENT");
  });
});

describe("computeProfileScore", () => {
  it("returns 0 for an empty profile", () => {
    expect(computeProfileScore({ companySize: null, annualVolume: null, businessActivity: null, relevantCategories: [], subcategories: [] })).toBe(0);
  });

  it("returns a capped 0..100 score for a filled profile", () => {
    const score = computeProfileScore({
      companySize: "51-200",
      annualVolume: "500k",
      businessActivity: "Contracting",
      relevantCategories: ["a", "b", "c"],
      subcategories: ["x", "y"],
    });
    expect(score).toBeGreaterThan(0);
    expect(score).toBeLessThanOrEqual(100);
  });
});