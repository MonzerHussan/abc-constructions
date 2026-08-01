import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const srcDir = path.join(root, 'src');

function fixFile(f) {
  let content = fs.readFileSync(f, 'utf-8');
  let modified = false;
  const orig = content;

  // Fix `const where: any = {}` -> `const where: Record<string, unknown> = {}`
  content = content.replace(/const\s+where\s*:\s*any\s*=\s*\{\}/g, 'const where: Record<string, unknown> = {}');

  // Fix `(v: any)` in filter/map -> `(v: Record<string, unknown>)` in admin page types
  content = content.replace(/\.filter\(\(([a-z]+):\s*any\)/g, (m, v) => `.filter((${v}: Record<string, unknown>)`);
  content = content.replace(/\.forEach\(\(([a-z]+):\s*any\)/g, (m, v) => `.forEach((${v}: Record<string, unknown>)`);
  // Careful with icon: any -> avoid fixing since it may need React import
  // Fix `as any).role` -> `as { id: string; role: string }).role`
  content = content.replace(/\(u as any\)\.role/g, '(u as { id: string; role: string }).role');
  // Fix `(session.user as any).id` -> `(session.user as { id: string }).id`
  content = content.replace(/\(\s*session\.user\s+as\s+any\s*\)\.id/g, '(session.user as { id: string }).id');

  // Fix `.map((d: any)` -> `.map((d: Record<string, unknown>)`
  content = content.replace(/\.map\(\(([a-z]+):\s*any\)/g, (m, v) => `.map((${v}: Record<string, unknown>)`);

  if (content !== orig) {
    fs.writeFileSync(f, content, 'utf-8');
    return true;
  }
  return false;
}

function getAllFiles(dir) {
  const files = [];
  if (!fs.existsSync(dir)) return files;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules' && entry.name !== '.next' && entry.name !== 'generated') {
      files.push(...getAllFiles(full));
    } else if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx'))) {
      files.push(full);
    }
  }
  return files;
}

let fixed = 0;
for (const f of getAllFiles(srcDir)) {
  if (fixFile(f)) {
    console.log(`Fixed: ${path.relative(root, f).replace(/\\/g, '/')}`);
    fixed++;
  }
}
console.log(`\nFixed ${fixed} files.`);
