// Verifies that every SVG referenced by the icon-browser data arrays in icons.html
// actually exists on disk. check-links only scans HTML href/src attributes, so these
// filenames — which live in JS string arrays (`file: 'search.svg'`) — are invisible
// to it. A typo'd filename passes every other check and the tile just silently hides
// at runtime via the <img> onerror handler. This closes that gap.
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const PAGE = 'docs/components/icons.html';
const ICONS_ROOT = 'docs/assets/icons';

// Each browser array maps to a subdirectory of docs/assets/icons/.
// Mirrors the set→folder logic in the page's buildTile/buildPictoTile.
const ARRAYS = [
  { name: 'OUTLINE_ICONS', dir: 'outline' },
  { name: 'COLOUR_ICONS', dir: 'colour' },
  { name: 'PICTOGRAM_ICONS', dir: 'pictograms' },
];

const html = readFileSync(PAGE, 'utf8');
let failures = 0;
let checked = 0;

for (const { name, dir } of ARRAYS) {
  // Grab the array literal body: `var NAME = [ ... ];`
  const block = new RegExp(`var\\s+${name}\\s*=\\s*\\[([\\s\\S]*?)\\];`).exec(html);
  if (!block) {
    // PICTOGRAM_ICONS may legitimately be absent on older revisions; the others must exist.
    if (name === 'PICTOGRAM_ICONS') continue;
    failures++;
    console.error(`${PAGE}: expected icon array ${name} not found`);
    continue;
  }
  const files = [...block[1].matchAll(/file:\s*'([^']+)'/g)].map((m) => m[1]);
  if (files.length === 0) {
    failures++;
    console.error(`${PAGE}: ${name} has no file entries — parser drift?`);
    continue;
  }
  for (const file of files) {
    checked++;
    const target = join(ICONS_ROOT, dir, file);
    if (!existsSync(target)) {
      failures++;
      console.error(`${PAGE}: ${name} references ${dir}/${file} → ${target} does not exist`);
    }
  }
}

if (failures > 0) {
  console.error(`\ncheck-icon-assets: ${failures} problem(s) of ${checked} references checked.`);
  process.exit(1);
}
console.log(`check-icon-assets: OK — ${checked} icon-browser SVG references all exist on disk.`);
