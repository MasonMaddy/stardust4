// Generates docs/tokens/stardust.tokens.json (W3C DTCG format) from
// docs/assets/css/tokens.css — tokens.css remains the single source of
// truth; the JSON is a derived, committed artifact for non-web consumers
// (Style Dictionary, Android/iOS codegen).
//
//   node scripts/build-tokens-json.mjs           # regenerate the file
//   node scripts/build-tokens-json.mjs --check   # CI: fail if file is stale
//
// Mapping: --sd-colour-cyan-700 → colour.cyan.700, var() references become
// DTCG aliases ("{colour.cyan.700}"), CSS types become DTCG $type values.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const CSS_PATH = 'docs/assets/css/tokens.css';
const OUT_PATH = 'docs/tokens/stardust.tokens.json';
const SCALES = ['purple', 'orange', 'cyan', 'green', 'grey', 'red'];
const SEMANTIC_COLOUR_GROUPS = ['action', 'accent', 'text', 'surface', 'border', 'focus', 'feedback'];

// CSS `ease` keyword as its spec-defined cubic-bezier
const EASE_KEYWORDS = { ease: [0.25, 0.1, 0.25, 1], linear: [0, 0, 1, 1] };

function varToPath(name) {
  // name: without the --sd- prefix
  if (name.startsWith('colour-')) {
    const rest = name.slice('colour-'.length);
    const [head, ...tail] = rest.split('-');
    if (SCALES.includes(head)) return ['colour', head, tail.join('-')];
    if (SEMANTIC_COLOUR_GROUPS.includes(head)) {
      if (head === 'feedback') {
        const [kind, ...variant] = tail;
        return ['colour', 'feedback', kind, variant.join('-')];
      }
      return ['colour', head, tail.join('-')];
    }
    throw new Error(`Unmapped colour token: ${name}`);
  }
  if (name.startsWith('spacing-')) {
    const rest = name.slice('spacing-'.length);
    if (/^\d+$/.test(rest)) return ['spacing', rest];
    if (rest.startsWith('component-')) return ['spacing', 'component', rest.slice('component-'.length)];
    if (rest.startsWith('stack-gap-')) return ['spacing', 'stack-gap', rest.slice('stack-gap-'.length)];
    if (rest.startsWith('page-margin-')) return ['spacing', 'page-margin', rest.slice('page-margin-'.length)];
    return ['spacing', rest]; // section-gap
  }
  if (name.startsWith('radius-')) return ['radius', name.slice('radius-'.length)];
  if (name.startsWith('font-size-')) return ['font', 'size', name.slice('font-size-'.length)];
  if (name.startsWith('line-height-')) return ['font', 'line-height', name.slice('line-height-'.length)];
  if (name.startsWith('font-weight-')) return ['font', 'weight', name.slice('font-weight-'.length)];
  if (name === 'font-family') return ['font', 'family', 'default'];
  if (name.startsWith('motion-duration-')) return ['motion', 'duration', name.slice('motion-duration-'.length)];
  if (name.startsWith('motion-easing-')) return ['motion', 'easing', name.slice('motion-easing-'.length)];
  if (name.startsWith('z-')) return ['z-index', name.slice('z-'.length)];
  throw new Error(`Unmapped token: ${name}`);
}

function tokenFor(name, rawValue) {
  const value = rawValue.trim();
  const aliasMatch = value.match(/^var\(--sd-([a-z0-9-]+)\)$/);
  if (aliasMatch) {
    const refPath = varToPath(aliasMatch[1]).join('.');
    // $type is inherited from the referenced token per DTCG aliasing
    return { $value: `{${refPath}}`, $type: inferType(name, value) };
  }
  return { $value: convertValue(name, value), $type: inferType(name, value) };
}

function inferType(name, value) {
  if (name.startsWith('colour-')) return 'color';
  if (name.startsWith('font-weight-')) return 'fontWeight';
  if (name === 'font-family') return 'fontFamily';
  if (name.startsWith('motion-duration-')) return 'duration';
  if (name.startsWith('motion-easing-')) return 'cubicBezier';
  if (name.startsWith('z-')) return 'number';
  return 'dimension'; // spacing, radius, font sizes, line heights
}

function convertValue(name, value) {
  if (name === 'font-family') {
    return value.split(',').map((f) => f.trim().replace(/^'(.*)'$/, '$1'));
  }
  if (name.startsWith('motion-easing-')) {
    const cb = value.match(/^cubic-bezier\(([^)]+)\)$/);
    if (cb) return cb[1].split(',').map(Number);
    if (EASE_KEYWORDS[value]) return EASE_KEYWORDS[value];
    throw new Error(`Unmapped easing: ${value}`);
  }
  if (name.startsWith('z-')) return Number(value);
  if (name.startsWith('font-weight-')) return Number(value);
  return value; // dimensions, durations, hex colours as-is
}

// ── parse tokens.css ──
const css = readFileSync(CSS_PATH, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
const decls = [...css.matchAll(/--sd-([a-z0-9-]+)\s*:\s*([^;]+);/g)];
if (decls.length < 100) throw new Error(`Suspiciously few tokens parsed: ${decls.length}`);

const root = {
  $description:
    'Stardust Design System tokens (W3C DTCG format). Derived from docs/assets/css/tokens.css — ' +
    'do not edit by hand; regenerate with `node scripts/build-tokens-json.mjs`. ' +
    'tokens.css is itself synced from the Figma Stardust Components file (a7JnfZ0Nd8df1TBPaMQ5Tj).',
};
for (const [, name, rawValue] of decls) {
  const path = varToPath(name);
  let node = root;
  for (const seg of path.slice(0, -1)) node = node[seg] ??= {};
  node[path[path.length - 1]] = tokenFor(name, rawValue);
}

const json = JSON.stringify(root, null, 2) + '\n';

if (process.argv.includes('--check')) {
  const current = existsSync(OUT_PATH) ? readFileSync(OUT_PATH, 'utf8') : '';
  if (current !== json) {
    console.error(
      `check-tokens-json: ${OUT_PATH} is out of date with tokens.css.\n` +
      'Run: node scripts/build-tokens-json.mjs  and commit the result.'
    );
    process.exit(1);
  }
  console.log(`check-tokens-json: OK — ${OUT_PATH} matches tokens.css (${decls.length} tokens).`);
} else {
  writeFileSync(OUT_PATH, json);
  console.log(`Wrote ${OUT_PATH} (${decls.length} tokens).`);
}
