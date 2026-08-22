import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

const PLATFORM_DIR = path.resolve(__dirname, "../../src/modules/platform");
const FORBIDDEN_IMPORT_PATTERNS = [
  "@/modules/procurement",
  "@/modules/financial",
  "@/modules/invoicing",
  "@/modules/quality",
  "@/modules/marketplace",
  "@/lib/prisma",
  "@/generated/prisma",
];

function collectTsFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectTsFiles(full));
    } else if (entry.name.endsWith(".ts") && !entry.name.endsWith(".test.ts")) {
      files.push(full);
    }
  }
  return files;
}

describe("VS-0 platform module boundaries", () => {
  const files = collectTsFiles(PLATFORM_DIR);

  it("platform module exists with source files", () => {
    expect(files.length).toBeGreaterThan(0);
  });

  for (const file of files) {
    const rel = path.relative(path.resolve(__dirname, "../.."), file);
    it(`${rel} must not import legacy domain modules or prisma`, () => {
      const content = fs.readFileSync(file, "utf8");
      for (const pattern of FORBIDDEN_IMPORT_PATTERNS) {
        expect(content, `Forbidden import ${pattern} in ${rel}`).not.toContain(
          pattern
        );
      }
    });
  }
});

describe("VS-0 platform schema ownership", () => {
  it("platform prisma schema is isolated under prisma/platform/", () => {
    const schemaPath = path.resolve(
      __dirname,
      "../../prisma/platform/schema.prisma"
    );
    expect(fs.existsSync(schemaPath)).toBe(true);
    const content = fs.readFileSync(schemaPath, "utf8");
    expect(content).toContain('schemas  = ["platform"]');
    expect(content).not.toContain('schemas  = ["public"');
  });

  it("legacy schema.prisma is not modified for platform models", () => {
    const legacySchema = path.resolve(__dirname, "../../prisma/schema.prisma");
    const content = fs.readFileSync(legacySchema, "utf8");
    expect(content).not.toContain("TenantScopedSecret");
    expect(content).not.toContain('@@schema("platform")');
  });
});
