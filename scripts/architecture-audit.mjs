import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const srcDir = path.join(root, 'src');
const modulesDir = path.join(srcDir, 'modules');
const apiDir = path.join(srcDir, 'app', 'api');

function getAllFiles(dir, ext = '.ts') {
  const files = [];
  if (!fs.existsSync(dir)) return files;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules' && entry.name !== '.next' && entry.name !== '__tests__' && entry.name !== 'generated') {
      files.push(...getAllFiles(full, ext));
    } else if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx'))) {
      files.push(full);
    }
  }
  return files;
}

function readFile(f) {
  try { return fs.readFileSync(f, 'utf-8'); } catch { return ''; }
}

function rel(p) {
  return path.relative(root, p).replace(/\\/g, '/');
}

const moduleNames = fs.readdirSync(modulesDir).filter(f => fs.statSync(path.join(modulesDir, f)).isDirectory());

// Find modules that have actual implementation (not just empty directories)
function moduleHasContent(modName) {
  const modPath = path.join(modulesDir, modName);
  const files = getAllFiles(modPath);
  return files.some(f => !f.endsWith('index.ts') && !f.includes('__tests__'));
}

const report = [];
let passed = 0, failed = 0, warnings = 0;

function add(name, ok, details) {
  if (details === undefined) details = [];
  if (!Array.isArray(details)) details = [details];
  report.push({ name, ok, details });
  if (ok === true) passed++;
  else if (ok === false) failed++;
  else warnings++;
}

function print(name, ok, details) {
  const icon = ok === true ? '✅' : ok === false ? '❌' : '⬜';
  let msg = `  ${icon} ${name}`;
  console.log(msg);
  if (details && details.length > 0 && ok === false) {
    for (const d of details) {
      console.log(`     ${d}`);
    }
  }
}

console.log(`
╔══════════════════════════════════════════════════════════╗
║         ARCHITECTURE VALIDATION REPORT                    ║
║         ABC Constructions - Construction OS              ║
╚══════════════════════════════════════════════════════════╝
`);

// ===== 1. v1 API Routes must not use Prisma directly =====
const routeFiles = getAllFiles(apiDir).filter(f => f.endsWith('route.ts'));
const v1PrismaViolations = [];
for (const f of routeFiles) {
  if (!f.includes('api\\v1') && !f.includes('api/v1')) continue;
  if (f.includes('health')) continue;
  const content = readFile(f);
  if (content.includes('prisma.')) {
    v1PrismaViolations.push(rel(f));
  }
}
print(
  'v1 API Routes must not use Prisma directly (should delegate to Services)',
  v1PrismaViolations.length === 0,
  v1PrismaViolations
);
add('v1 API Routes use Prisma directly', v1PrismaViolations.length === 0, v1PrismaViolations);

// ===== 2. No JSX/React in Service files =====
const serviceFiles = getAllFiles(modulesDir).filter(f => f.includes('services'));
const jsxViolations = [];
for (const f of serviceFiles) {
  const content = readFile(f);
  if (content.includes('React') || content.includes('jsx')) {
    jsxViolations.push(rel(f));
  }
}
print(
  'Service files must not contain JSX or React imports',
  jsxViolations.length === 0,
  jsxViolations
);
add('Service files contain JSX/React', jsxViolations.length === 0, jsxViolations);

// ===== 3. Cross-module imports bypassing index.ts =====
const allSrcFiles = getAllFiles(srcDir);
const crossViolations = new Set();
for (const f of allSrcFiles) {
  if (f.includes('node_modules') || f.includes('generated')) continue;
  const content = readFile(f);
  const importingFile = rel(f);
  for (const mod of moduleNames) {
    if (mod === 'shared' || mod === 'core') continue;
    const regex = new RegExp(`from ['"]@/modules/${mod}/(services|validators|events|dto)/`, 'g');
    let m;
    while ((m = regex.exec(content)) !== null) {
      if (!importingFile.includes(`modules/${mod}/`)) {
        crossViolations.add(`${importingFile} imports from ${mod}/${m[1]} (bypasses index.ts)`);
      }
    }
  }
}
print(
  'Cross-module imports must go through index.ts (not internal paths)',
  crossViolations.size === 0,
  [...crossViolations]
);
add('Cross-module bypass violations', crossViolations.size === 0, [...crossViolations]);

// ===== 4. No `any` type =====
const anyViolations = [];
for (const f of allSrcFiles) {
  if (f.includes('node_modules') || f.includes('generated') || f.includes('.next')) continue;
  const content = readFile(f);
  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/:\s*any\b/.test(line) || /\bas\s+any\b/.test(line)) {
      const tr = line.trim();
      if (!tr.startsWith('//') && !tr.includes('prisma')) {
        anyViolations.push(`${rel(f)}:${i + 1}: ${tr.substring(0, 120)}`);
      }
    }
  }
}
print(
  'No usage of `any` type',
  anyViolations.length === 0,
  anyViolations.slice(0, 20)
);
add('`any` type violations', anyViolations.length === 0, anyViolations);

// ===== 5. API Routes Inventory =====
console.log(`\n── API Routes Inventory ──`);
for (const f of routeFiles) {
  const content = readFile(f);
  const isV1 = f.includes('api\\v1') || f.includes('api/v1');
  const hasService = /import.*(?:Service|from.*modules\/)/.test(content);
  const hasPrisma = /\bprisma\./.test(content);
  let status;
  if (isV1 && hasService) status = '✅ v1 + Service';
  else if (isV1 && !hasPrisma) status = '✅ v1 (no prisma)';
  else if (isV1 && hasPrisma) status = '❌ v1 + Prisma direct';
  else if (!isV1 && hasPrisma) status = '⚠️ Old route + Prisma (expected)';
  else status = '❓ Unknown';
  console.log(`  ${status}  ${rel(f)}`);
}
add('API Routes Inventory', null, []);

// ===== 6. index.ts Public API =====
const contentModules = moduleNames.filter(m => moduleHasContent(m));
const missingIndex = [];
for (const mod of contentModules) {
  if (!fs.existsSync(path.join(modulesDir, mod, 'index.ts'))) {
    missingIndex.push(mod);
  }
}
print(
  `Modules with content must have index.ts (${contentModules.length} active modules)`,
  missingIndex.length === 0,
  missingIndex
);
add('Missing index.ts in active modules', missingIndex.length === 0, missingIndex);

// ===== 7. Circular dependencies check =====
const importGraph = {};
for (const mod of moduleNames) {
  importGraph[mod] = new Set();
  const files = getAllFiles(path.join(modulesDir, mod));
  for (const f of files) {
    if (f.includes('__tests__')) continue;
    const content = readFile(f);
    for (const other of moduleNames) {
      if (other === mod || other === 'shared') continue;
      if (content.includes(`from '@/modules/${other}`) || content.includes(`from "@/${other}`)) {
        importGraph[mod].add(other);
      }
    }
  }
}
const circularDeps = [];
const visited = new Set();
const recStack = new Set();
function hasCycle(node, path) {
  visited.add(node);
  recStack.add(node);
  for (const neighbor of importGraph[node]) {
    if (!visited.has(neighbor)) {
      if (hasCycle(neighbor, [...path, neighbor])) {
        return true;
      }
    } else if (recStack.has(neighbor)) {
      const cycle = [...path.slice(path.indexOf(neighbor)), neighbor];
      circularDeps.push(cycle.join(' → '));
      return true;
    }
  }
  recStack.delete(node);
  return false;
}
for (const mod of moduleNames) {
  if (!visited.has(mod)) {
    hasCycle(mod, [mod]);
  }
}
print(
  'No circular dependencies between modules',
  circularDeps.length === 0,
  circularDeps
);
add('Circular dependencies', circularDeps.length === 0, circularDeps);

// ===== Summary =====
console.log(`\n\n╔═══════════════════════════════════════════╗`);
console.log(`║           FINAL ASSESSMENT                ║`);
console.log(`╚═══════════════════════════════════════════╝`);

const checks = [
  { name: 'v1 Routes are Thin Controllers', ok: v1PrismaViolations.length === 0, weight: 15 },
  { name: 'Services have no JSX/React', ok: jsxViolations.length === 0, weight: 5 },
  { name: 'Module Isolation (no bypass imports)', ok: crossViolations.size === 0, weight: 20 },
  { name: 'No `any` type usage', ok: anyViolations.length === 0, weight: 15 },
  { name: 'Active modules have index.ts', ok: missingIndex.length === 0, weight: 10 },
  { name: 'No circular dependencies', ok: circularDeps.length === 0, weight: 15 },
];

let weightedScore = 0;
let totalWeight = 0;
for (const c of checks) {
  const score = c.ok ? 100 : 0;
  weightedScore += score * c.weight;
  totalWeight += c.weight;
}
const overallScore = Math.round(weightedScore / totalWeight);

for (const c of checks) {
  const icon = c.ok ? '✅' : '❌';
  console.log(`  ${icon} ${c.name}`);
}

console.log(`\n  ✅ Passed: ${passed}`);
console.log(`  ❌ Failed: ${failed}`);
console.log(`  ⬜ Warnings: ${warnings}`);
console.log(`  📊 **Architecture Readiness Score: ${overallScore}%**\n`);

if (overallScore >= 90) {
  console.log(`  ✅✅✅ READY FOR DOMAIN MIGRATION`);
} else if (overallScore >= 70) {
  console.log(`  ⚠️ NEARLY READY - fix violations first`);
} else {
  console.log(`  ❌ NOT READY - architecture violations must be fixed`);
}

if (failed > 0) process.exit(1);
