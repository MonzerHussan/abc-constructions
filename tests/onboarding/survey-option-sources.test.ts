import { describe, expect, it } from "vitest";
import {
  allowsMultipleAnswers,
  nationalsQuestionText,
  regionsByCountryOptions,
} from "@/lib/onboarding/survey-option-sources";

describe("survey-option-sources", () => {
  it("returns UAE cities for AE registration country", () => {
    const opts = regionsByCountryOptions("AE", "ar");
    expect(opts.some((o) => o.label.includes("دبي"))).toBe(true);
    expect(opts.some((o) => o.label.includes("الرياض"))).toBe(false);
  });

  it("returns Saudi cities for SA", () => {
    const opts = regionsByCountryOptions("SA", "en");
    expect(opts.some((o) => o.label === "Riyadh")).toBe(true);
  });

  it("localizes nationals question by country", () => {
    expect(nationalsQuestionText("SA", "ar")).toContain("السعوديين");
    expect(nationalsQuestionText("AE", "ar")).toContain("الإمارات");
  });

  it("detects multi-select for region questions", () => {
    expect(
      allowsMultipleAnswers("SINGLE_CHOICE", "المناطق الرئيسية للعمل", {
        optionSource: "REGIONS_BY_COUNTRY",
      }),
    ).toBe(true);
  });
});
