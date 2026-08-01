import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

const SHARED_WORKFLOW_DIR = path.resolve(__dirname, '../../src/modules/shared/workflow');
const PROCUREMENT_DIR = path.resolve(__dirname, '../../src/modules/procurement');
const PROCUREMENT_WORKFLOW_DIR = path.join(PROCUREMENT_DIR, 'workflow');

const domainModules = [
  'core', 'procurement', 'tenders', 'marketplace', 'projects', 'jobs',
  'delivery', 'training', 'research', 'crm', 'social', 'notification',
  'rules', 'analytics', 'search', 'storage', 'ai', 'quality', 'financial', 'invoicing',
  'supplier-network', 'product-catalog', 'inventory',
];

function getTsFiles(dir: string): string[] {
  const files: string[] = [];
  if (!fs.existsSync(dir)) return files;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...getTsFiles(fullPath));
    } else if (
      entry.isFile() &&
      (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx')) &&
      !entry.name.endsWith('.test.ts')
    ) {
      files.push(fullPath);
    }
  }
  return files;
}

function getImports(filePath: string): string[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const imports: string[] = [];
  const regex = /from\s+['"]([^'"]+)['"]/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    imports.push(match[1]);
  }
  return imports;
}

describe('Architecture: W-7 Workflow Boundaries', () => {
  it('shared/workflow must NOT import any domain module', () => {
    const files = getTsFiles(SHARED_WORKFLOW_DIR);
    const violations: string[] = [];
    for (const file of files) {
      const imports = getImports(file);
      for (const imp of imports) {
        for (const mod of domainModules) {
          if (imp.includes(`/modules/${mod}/`) || imp.includes(`@/modules/${mod}/`)) {
            violations.push(`${path.relative(SHARED_WORKFLOW_DIR, file)} imports from domain ${mod}: ${imp}`);
          }
        }
      }
    }
    expect(violations).toEqual([]);
  });

  it('shared/workflow must not access prisma (no persistence coupling)', () => {
    const files = getTsFiles(SHARED_WORKFLOW_DIR);
    const violations: string[] = [];
    for (const file of files) {
      const content = fs.readFileSync(file, 'utf-8');
      if (/\bprisma\./.test(content)) {
        violations.push(`${path.relative(SHARED_WORKFLOW_DIR, file)} accesses prisma`);
      }
      if (/from\s+['"]@\/lib\/prisma['"]/.test(content)) {
        violations.push(`${path.relative(SHARED_WORKFLOW_DIR, file)} imports @/lib/prisma`);
      }
    }
    expect(violations).toEqual([]);
  });

  it('procurement/workflow/state-machines and guards must only use shared/workflow, never import shared/workflow into other domains', () => {
    const files = getTsFiles(PROCUREMENT_WORKFLOW_DIR);
    const violations: string[] = [];
    for (const file of files) {
      const imports = getImports(file);
      for (const imp of imports) {
        if (imp.includes('@/modules/shared/workflow') || imp.includes('/shared/workflow')) continue;
        for (const mod of domainModules) {
          if (mod === 'procurement') continue;
          if (imp.includes(`/modules/${mod}/`) || imp.includes(`@/modules/${mod}/`)) {
            violations.push(`${path.relative(PROCUREMENT_DIR, file)} imports from non-shared domain ${mod}: ${imp}`);
          }
        }
      }
    }
    expect(violations).toEqual([]);
  });
});
