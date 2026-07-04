// Verifies that every relative href/src in the docs HTML resolves to a real file,
// and that every nav link built by nav.js (BASE_PATH + '/...' literals) resolves
// under docs/ (GitHub Pages serves docs/ as the web root, so /stardust4/x → docs/x).
// External URLs, anchors, and mailto: are out of scope.
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

// nav.js hrefs: match BASE_PATH + '/path' literals (single-quoted, hardcoded by
// design — see the SECURITY header in nav.js). Commented-out examples are skipped.
const NAV_FILE = join(ROOT, 'assets', 'js', 'nav.js');
const navSrc = readFileSync(NAV_FILE, 'utf8')
  .split('\n')
  .filter((line) => !/^\s*(\/\/|\/\*|\*)/.test(line))
  .join('\n');
let navChecked = 0;
for (const match of navSrc.matchAll(/BASE_PATH\s*\+\s*'([^']+)'/g)) {
  const url = match[1].split('#')[0].split('?')[0];
  // A trailing slash is a directory link — it must contain an index.html.
  const target = resolve(ROOT, '.' + (url.endsWith('/') ? url + 'index.html' : url));
  navChecked++;
  if (!existsSync(target)) {
    failures++;
    console.error(`${NAV_FILE}: broken nav link "${match[1]}" → ${target.split(sep).join('/')}`);
  }
}
checked += navChecked;

if (failures > 0) {
  console.error(`\ncheck-links: ${failures} broken link(s) of ${checked} checked.`);
  process.exit(1);
}
console.log(`check-links: OK — ${checked} relative links resolve (incl. ${navChecked} nav.js links).`);
