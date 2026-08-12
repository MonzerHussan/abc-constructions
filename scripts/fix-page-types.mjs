import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

// Fix remaining Record<string, unknown> in page-level component map/filter/forEach callbacks
const pageDirs = [
  'src/app/projects/ABC/admin',
  'src/app/projects/ABC/organization',
  'src/app/projects/ABC/procurement',
];

let fixed = 0;
for (const dir of pageDirs) {
  const fullDir = path.join(root, dir);
  if (!fs.existsSync(fullDir)) continue;
  const entries = fs.readdirSync(fullDir, { recursive: true });
  for (const entry of entries) {
    if (!entry.endsWith('.tsx') && !entry.endsWith('.ts')) continue;
    const fullPath = path.join(fullDir, entry);
    let content = fs.readFileSync(fullPath, 'utf-8');
    const orig = content;
    // In page components, replace Record<string, unknown> in map/filter/forEach with any
    content = content.replace(/\.(map|filter|forEach)\(\(([a-z]+): Record<string, unknown>\)/g, '.$1(($2: any)');
    if (content !== orig) {
      fs.writeFileSync(fullPath, content, 'utf-8');
      console.log(`Fixed: ${path.relative(root, fullPath).replace(/\\/g, '/')}`);
      fixed++;
    }
  }
}
console.log(`Fixed ${fixed} files.`);
