import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

const MODULES_DIR = path.resolve(__dirname, '../../src/modules');

const moduleNames = [
  'core', 'platform', 'procurement', 'tenders', 'marketplace', 'projects', 'jobs',
  'delivery', 'training', 'research', 'crm', 'social', 'notification',
  'workflow', 'rules', 'analytics', 'search', 'storage', 'ai', 'quality', 'financial', 'invoicing',
  'supplier-network', 'product-catalog', 'inventory',
];

// Directories inside a module that are considered internal implementation and
// must only be reached through the module's public `index.ts` (ADR-005).
const INTERNAL_DIRS = [
  'services',
  'validators',
  'events',
  'dto',
  'workflow',
  'state-machines',
];

// Documented cross-domain Prisma reads. These are known debt items (TD-02).
// Any new cross-domain access NOT listed here must fail the architecture gate.
// Key format: `<moduleName>:<prisma client model name>`.
const KNOWN_CROSS_DOMAIN_PRISMA: string[] = [
  // invoicing reads procurement/quality documents to perform 3-way match (TD-02)
  'invoicing:purchaseOrder',
  'invoicing:delivery',
  'invoicing:inspection',
  // financial reads purchase orders to validate reservation input (TD-02)
  'financial:purchaseOrder',
  // inventory reads catalog/supplier records when listing stock (TD-02-family)
  'inventory:supplierProductOffering',
  'inventory:supplierProfile',
];

// Modules that are architecturally allowed to read from any underlying domain.
const CROSS_READ_ALLOWED_MODULES = new Set<string>(['marketplace']);

// Ownership map: Prisma client model name → owning module (ADR-002/ADR-021).
const MODEL_OWNER: Record<string, string> = {
  auditLog: 'core',
  organization: 'core',
  role: 'core',
  rolePermission: 'core',
  user: 'core',
  userOrganization: 'core',
  paymentRelease: 'financial',
  paymentReservation: 'financial',
  inventoryImport: 'inventory',
  inventoryTransaction: 'inventory',
  stockItem: 'inventory',
  warehouse: 'inventory',
  invoice: 'invoicing',
  invoiceItem: 'invoicing',
  invoiceMatch: 'invoicing',
  favoriteProduct: 'marketplace',
  favoriteSupplier: 'marketplace',
  materialCategory: 'marketplace',
  productReview: 'marketplace',
  supplierReview: 'marketplace',
  approvalHistory: 'procurement',
  approvalRequest: 'procurement',
  award: 'procurement',
  delivery: 'procurement',
  deliveryItem: 'procurement',
  evaluationCriterion: 'procurement',
  evaluationScore: 'procurement',
  pOItem: 'procurement',
  purchaseOrder: 'procurement',
  purchaseRequest: 'procurement',
  purchaseRequestItem: 'procurement',
  quotation: 'procurement',
  quotationEvaluation: 'procurement',
  quotationItem: 'procurement',
  rFQ: 'procurement',
  rFQItem: 'procurement',
  rFQSupplier: 'procurement',
  productDataSheet: 'product-catalog',
  productImage: 'product-catalog',
  productMaster: 'product-catalog',
  productSafetySheet: 'product-catalog',
  productSpecification: 'product-catalog',
  productVariant: 'product-catalog',
  supplierProductOffering: 'product-catalog',
  unitOfMeasure: 'product-catalog',
  acceptanceCertificate: 'quality',
  inspection: 'quality',
  inspectionAttachment: 'quality',
  inspectionItem: 'quality',
  nCR: 'quality',
  supplierBanking: 'supplier-network',
  supplierCapability: 'supplier-network',
  supplierCertification: 'supplier-network',
  supplierDocument: 'supplier-network',
  supplierProfile: 'supplier-network',
  supplierRating: 'supplier-network',
  supplierRelationship: 'supplier-network',
};

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

// Collect every `prisma.<model>` access (Prisma client property name) per file.
function getPrismaModels(filePath: string): string[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const models: string[] = [];
  const regex = /\bprisma\.([A-Za-z][A-Za-z0-9]*)/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    models.push(match[1]);
  }
  return models;
}

describe('Architecture: Module Import Rules', () => {
  for (const moduleName of moduleNames) {
    if (moduleName === 'shared') continue;
    if (moduleName === 'core') continue;

    const moduleDir = path.join(MODULES_DIR, moduleName);
    if (!fs.existsSync(moduleDir)) continue;

    const files = getTsFiles(moduleDir);

    describe(`${moduleName} module`, () => {
      for (const otherModule of moduleNames) {
        if (otherModule === moduleName) continue;
        if (otherModule === 'shared') continue;

        it(`must not import from ${otherModule} module services`, () => {
          const violations: string[] = [];
          for (const file of files) {
            const imports = getImports(file);
            for (const imp of imports) {
              if (imp.includes(`/modules/${otherModule}/services/`)) {
                violations.push(`${path.relative(MODULES_DIR, file)} imports from ${otherModule} services: ${imp}`);
              }
              if (imp.includes(`@/modules/${otherModule}/services/`)) {
                violations.push(`${path.relative(MODULES_DIR, file)} imports from ${otherModule} services: ${imp}`);
              }
            }
          }
          expect(violations).toEqual([]);
        });
      }

      it(`must not deep-import internals of other modules (bypass index.ts)`, () => {
        const violations: string[] = [];
        for (const file of files) {
          const imports = getImports(file);
          for (const imp of imports) {
            for (const otherModule of moduleNames) {
              if (otherModule === moduleName || otherModule === 'shared') continue;
              for (const dir of INTERNAL_DIRS) {
                const rel = path.relative(MODULES_DIR, file);
                if (imp.includes(`/modules/${otherModule}/${dir}/`) || imp.includes(`@/modules/${otherModule}/${dir}/`)) {
                  violations.push(`${rel} deep-imports ${otherModule}/${dir}: ${imp}`);
                }
              }
            }
          }
        }
        expect(violations).toEqual([]);
      });

      it(`must not import from src/app/`, () => {
        const violations: string[] = [];
        for (const file of files) {
          const imports = getImports(file);
          for (const imp of imports) {
            if (imp.includes('@/app/') || imp.includes('/src/app/')) {
              violations.push(`${path.relative(MODULES_DIR, file)} imports from app: ${imp}`);
            }
          }
        }
        expect(violations).toEqual([]);
      });

      it(`must not access Prisma models owned by other domains (except documented allowlist)`, () => {
        const violations: string[] = [];
        for (const file of files) {
          const models = getPrismaModels(file);
          if (models.length === 0) continue;
          for (const model of models) {
            const owner = MODEL_OWNER[model];
            if (!owner || owner === moduleName) continue;
            if (CROSS_READ_ALLOWED_MODULES.has(moduleName)) continue;
            const key = `${moduleName}:${model}`;
            if (!KNOWN_CROSS_DOMAIN_PRISMA.includes(key)) {
              violations.push(`${path.relative(MODULES_DIR, file)} accesses prisma.${model} owned by ${owner} (not in allowlist)`);
            }
          }
        }
        expect(violations).toEqual([]);
      });
    });
  }

  describe('Core module', () => {
    const coreDir = path.join(MODULES_DIR, 'core');
    if (!fs.existsSync(coreDir)) return;

    it('must not import from any other domain module', () => {
      const files = getTsFiles(coreDir);
      const violations: string[] = [];
      for (const file of files) {
        const imports = getImports(file);
        for (const imp of imports) {
          for (const mod of moduleNames) {
            if (mod === 'core' || mod === 'shared') continue;
            if (imp.includes(`/modules/${mod}/`) || imp.includes(`@/modules/${mod}/`)) {
              violations.push(`${path.relative(MODULES_DIR, file)} imports from ${mod}: ${imp}`);
            }
          }
        }
      }
      expect(violations).toEqual([]);
    });
  });

  describe('Shared module', () => {
    const sharedDir = path.join(MODULES_DIR, 'shared');
    if (!fs.existsSync(sharedDir)) return;

    it('must not import from any domain module', () => {
      const files = getTsFiles(sharedDir);
      const violations: string[] = [];
      for (const file of files) {
        const imports = getImports(file);
        for (const imp of imports) {
          for (const mod of moduleNames) {
            if (mod === 'shared') continue;
            if (imp.includes(`/modules/${mod}/`) || imp.includes(`@/modules/${mod}/`)) {
              violations.push(`${path.relative(MODULES_DIR, file)} imports from ${mod}: ${imp}`);
            }
          }
        }
      }
      expect(violations).toEqual([]);
    });
  });
});
