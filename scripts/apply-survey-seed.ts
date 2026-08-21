#!/usr/bin/env npx tsx
/**
 * Apply survey seed JSON files to the database.
 *
 * Usage:
 *   npm run survey:apply-all-seeds
 *   npx tsx scripts/apply-survey-seed.ts --all
 *   npx tsx scripts/apply-survey-seed.ts [path-to-json]
 */
import { applyAllSurveySeeds, applySurveySeed } from "../src/modules/onboarding-survey/seed/apply-survey-seed";
import { reseedAllSurveyTemplates } from "../src/modules/onboarding-survey/seed/seed-templates";

async function main() {
  const args = process.argv.slice(2);
  const reseedFirst = !args.includes("--no-reseed");

  if (reseedFirst) {
    console.log("Reseeding base templates...");
    await reseedAllSurveyTemplates();
  }

  if (args.includes("--all") || args.length === 0) {
    const results = await applyAllSurveySeeds();
    console.log(JSON.stringify(results, null, 2));
    return;
  }

  const filePath = args.find((a) => !a.startsWith("--"));
  const result = await applySurveySeed(filePath);
  console.log(JSON.stringify(result, null, 2));
  if (result.editsSkipped.length) {
    console.warn("\nSkipped edits (manual follow-up):");
    for (const s of result.editsSkipped) console.warn(`  - ${s}`);
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    const { prisma } = await import("../src/lib/prisma");
    await prisma.$disconnect();
  });
