#!/usr/bin/env npx tsx
/**
 * Apply prisma migrate + survey seeds using production env file.
 * Usage: npx tsx scripts/apply-seeds-production.ts
 */
import { readFileSync, existsSync, writeFileSync } from "fs";
import { join } from "path";
import { execSync } from "child_process";

const root = process.cwd();
const envPath = join(root, ".env.production.local");
const migrateEnvPath = join(root, ".env.migrate");

function parseEnvValue(raw: string): string {
  let val = raw.trim();
  if (
    (val.startsWith('"') && val.endsWith('"')) ||
    (val.startsWith("'") && val.endsWith("'"))
  ) {
    val = val.slice(1, -1);
  }
  val = val.replace(/^\uFEFF/, "").trim();
  val = val.replace(/^prisma\+/, "");
  if (val.startsWith("postgres://")) {
    val = `postgresql://${val.slice("postgres://".length)}`;
  }
  return val;
}

function loadDbUrl(): string {
  // Ignore inherited shell env (vercel env pull / env run may leave placeholder refs).
  delete process.env.DATABASE_URL;
  delete process.env.DIRECT_URL;

  const envFiles = [join(root, ".env"), envPath];
  let directUrl: string | undefined;
  let databaseUrl: string | undefined;

  for (const file of envFiles) {
    if (!existsSync(file)) continue;
    for (const raw of readFileSync(file, "utf8").split(/\r?\n/)) {
      const line = raw.trim();
      if (!line || line.startsWith("#")) continue;
      const eq = line.indexOf("=");
      if (eq < 1) continue;
      const key = line.slice(0, eq).trim();
      const val = parseEnvValue(line.slice(eq + 1));
      if (key === "DIRECT_URL" && val.length > 20) directUrl = val;
      if (key === "DATABASE_URL" && val.length > 20) databaseUrl = val;
    }
    if (directUrl || databaseUrl) break;
  }

  const url = directUrl ?? databaseUrl;
  if (!url) {
    console.error("DATABASE_URL/DIRECT_URL not found in .env.production.local or .env");
    process.exit(1);
  }
  if (!/^postgresql:\/\//.test(url)) {
    const preview = url.slice(0, 12).replace(/[^\x20-\x7E]/g, "?");
    console.error(`Database URL must use postgresql:// (len=${url.length}, start="${preview}")`);
    process.exit(1);
  }
  return url;
}

const dbUrl = loadDbUrl();
writeFileSync(migrateEnvPath, `DATABASE_URL=${dbUrl}\n`, "utf8");

const env = { ...process.env, DATABASE_URL: dbUrl };

console.log("Running prisma migrate deploy...");
execSync("npx prisma migrate deploy", { stdio: "inherit", env });

console.log("Applying survey seeds...");
execSync("npx tsx scripts/apply-survey-seed.ts --all", { stdio: "inherit", env });

console.log("Done.");
