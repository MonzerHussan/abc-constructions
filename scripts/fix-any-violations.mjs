import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const srcDir = path.join(root, 'src');

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

const allFiles = getAllFiles(srcDir);
let fixed = 0;

for (const f of allFiles) {
  let content = fs.readFileSync(f, 'utf-8');
  let modified = false;
  const orig = content;

  // Fix 1: (session.user as any)?.role -> proper inline cast
  content = content.replace(
    /\(\s*session\.user\s+as\s+any\s*\)\?\.role/g,
    '(session.user as { id: string; role: string }).role'
  );

  // Fix 2: (session.user as any).role -> proper cast
  content = content.replace(
    /\(\s*session\.user\s+as\s+any\s*\)\.role/g,
    '(session.user as { id: string; role: string }).role'
  );

  // Fix 3: catch (err: any) -> catch (err: unknown) -- only in page files
  if (f.includes('pages/') || f.includes('page.tsx') || f.includes('component')) {
    content = content.replace(/catch\s*\(\s*err\s*:\s*any\s*\)/g, 'catch (err: unknown)');
  }

  // Fix 4: (i: any) in reduce -> (i: Record<string, unknown>)
  content = content.replace(/\.reduce\(\([a-z]+:\s*number[^,]*,?\s*([a-z]+):\s*any\s*\)/g, (match, varName) => {
    return match.replace(`${varName}: any`, `${varName}: Record<string, unknown>`);
  });

  if (content !== orig) {
    fs.writeFileSync(f, content, 'utf-8');
    const relPath = path.relative(root, f).replace(/\\/g, '/');
    console.log(`Fixed: ${relPath}`);
    fixed++;
  }
}

console.log(`\nFixed ${fixed} files with type violations.`);
