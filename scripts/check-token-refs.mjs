// Verifies that every --sd-* token referenced via var() in shared component CSS
// is actually DEFINED in tokens.css. lint-hex stops new hardcoded hex; this is the
// other half of the contract — token *names* are the stable API (CLAUDE.md), so a
// Figma re-sync that renames or drops a token must not leave a dead var() behind.
// A dangling var() is still valid CSS, so nothing else would catch it: the colour
// just silently falls back to nothing.
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const TOKENS = 'docs/assets/css/tokens.css';
const COMPONENTS_DIR = 'docs/assets/css/components';

// Collect defined token names: lines like `  --sd-colour-action-primary: #00776B;`
const tokensCss = readFileSync(TOKENS, 'utf8');
const defined = new Set();
for (const m of tokensCss.matchAll(/(?:^|[;{]|\*\/)\s*(--sd-[a-z0-9-]+)\s*:/gm)) {
  defined.add(m[1]);
}

if (defined.size === 0) {
  console.error(`check-token-refs: found no --sd-* definitions in ${TOKENS} — wrong path or format?`);
  process.exit(1);
}

let failures = 0;
let checked = 0;

for (const file of readdirSync(COMPONENTS_DIR).filter((f) => f.endsWith('.css'))) {
  const path = join(COMPONENTS_DIR, file);
  // Strip comments so an annotated token name in a comment isn't treated as a ref.
  const css = readFileSync(path, 'utf8').replace(/\/\*[\s\S]*?\*\//g, (c) =>
    c.replace(/[^\n]/g, ' ')
  );
  css.split('\n').forEach((line, i) => {
    for (const m of line.matchAll(/var\(\s*(--sd-[a-z0-9-]+)/g)) {
      checked++;
      if (!defined.has(m[1])) {
        failures++;
        console.error(`${path}:${i + 1}: references ${m[1]} which is not defined in ${TOKENS}`);
      }
    }
  });
}

if (failures > 0) {
  console.error(`\ncheck-token-refs: ${failures} dangling token reference(s) of ${checked} checked.`);
  process.exit(1);
}
console.log(`check-token-refs: OK — ${checked} --sd-* references all resolve (${defined.size} tokens defined).`);
