// Fails if any hardcoded hex colour appears in the shared component CSS.
// docs/assets/css/components/*.css must reference --sd- tokens only;
// tokens.css is the single place hex values are allowed to live.
// Hex inside comments is allowed (token files annotate resolved values).
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const DIR = 'docs/assets/css/components';
const HEX = /#[0-9a-fA-F]{3,8}\b/g;

let failures = 0;

for (const file of readdirSync(DIR).filter((f) => f.endsWith('.css'))) {
  const path = join(DIR, file);
  // Strip comments before scanning so annotated hex (e.g. "/* #00776B */") passes.
  const css = readFileSync(path, 'utf8').replace(/\/\*[\s\S]*?\*\//g, (m) =>
    m.replace(/[^\n]/g, ' ')
  );
  for (const [lineNo, line] of css.split('\n').entries()) {
    const matches = line.match(HEX);
    if (matches) {
      failures++;
      console.error(`${path}:${lineNo + 1}: hardcoded hex ${matches.join(', ')} — use a --sd- token`);
    }
  }
}

if (failures > 0) {
  console.error(`\nlint-hex: ${failures} violation(s).`);
  process.exit(1);
}
console.log('lint-hex: OK — no hardcoded hex in shared component CSS.');
