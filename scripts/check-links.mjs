// Verifies that every relative href/src in the docs HTML resolves to a real file.
// External URLs, anchors, mailto:, and runtime-generated nav links (absolute
// /stardust4/... paths built by nav.js) are out of scope.
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join, dirname, resolve, sep } from 'node:path';

const ROOT = 'docs';

function* htmlFiles(dir) {
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) yield* htmlFiles(path);
    else if (entry.endsWith('.html')) yield path;
  }
}

// (?<![:\w-]) skips framework bindings like :src="..." in code examples.
const ATTR = /(?<![:\w-])(?:href|src)\s*=\s*"([^"]+)"/g;
let failures = 0;
let checked = 0;

for (const file of htmlFiles(ROOT)) {
  const html = readFileSync(file, 'utf8');
  for (const match of html.matchAll(ATTR)) {
    const url = match[1];
    if (
      /^(https?:|mailto:|data:|#|\/)/.test(url) || // external, anchor, or absolute (runtime base path)
      url === ''
    ) {
      continue;
    }
    const target = resolve(dirname(file), url.split('#')[0].split('?')[0]);
    checked++;
    if (!existsSync(target)) {
      failures++;
      console.error(`${file}: broken link "${url}" → ${target.split(sep).join('/')}`);
    }
  }
}

if (failures > 0) {
  console.error(`\ncheck-links: ${failures} broken link(s) of ${checked} checked.`);
  process.exit(1);
}
console.log(`check-links: OK — ${checked} relative links resolve.`);
