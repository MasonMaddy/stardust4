// Generates the machine-readable component API export from the existing
// component sources — for AI agents and non-web consumers that should NOT
// have to parse the demo-heavy doc HTML.
//
//   node scripts/build-component-api.mjs           # regenerate the files
//   node scripts/build-component-api.mjs --check    # CI: fail if any are stale
//
// Outputs (all DERIVED — never hand-edit; regenerate and commit):
//   docs/api/<name>.json   one manifest per ds-* component
//   docs/api/index.json    catalogue of all components
//   docs/llms.txt          flat llmstxt.org-style entry point for agents
//
// Sources of truth (unchanged):
//   docs/assets/css/components/<name>.css   structural facts (classes,
//       modifiers, elements, states, tokens consumed) — uniform across all
//       components, so this is the reliable backbone of each manifest.
//   docs/components/<name>.html             semantic facts (title, section
//       outline, props matrix where present, changelog, dependencies).
//
// The HTML extraction is deliberately defensive: universal facts (page title,
// changelog) are ASSERTED and fail the build if missing — a page restructure
// should break loudly, not silently emit empty fields. Optional facts (the
// "Figma ↔ code mapping" props table, present on only a few pages) are emitted
// when found and omitted otherwise.
import { readdirSync, readFileSync, writeFileSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import { join, basename } from 'node:path';

const PAGES_DIR = 'docs/components';
const CSS_DIR = 'docs/assets/css/components';
const OUT_DIR = 'docs/api';
const LLMS_PATH = 'docs/llms.txt';
const SITE_BASE = 'https://masonmaddy.github.io/stardust4/';
// icons.html is an icon browser, not a ds-* component page (matches check-architecture.mjs)
const EXEMPT = new Set(['icons.html']);

const check = process.argv.includes('--check');

// ── small HTML helpers ──
const stripTags = (s) => s.replace(/<[^>]+>/g, '');
const decode = (s) =>
  s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
   .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&mdash;/g, '—');
const text = (s) => decode(stripTags(s)).replace(/\s+/g, ' ').trim();

// ── CSS extraction (the structural backbone) ──
function parseCss(css) {
  const body = css.replace(/\/\*[\s\S]*?\*\//g, '');

  // Every .ds-* selector chunk that appears anywhere in the file.
  const chunks = [...body.matchAll(/\.ds-[a-z0-9]+(?:[_-]{1,2}[a-z0-9-]+)*/g)].map((m) => m[0]);

  // Block = the .ds-xxx prefix before any __element or --modifier.
  const blockOf = (sel) => sel.match(/^\.ds-[a-z0-9]+/)[0];
  const freq = {};
  for (const c of chunks) freq[blockOf(c)] = (freq[blockOf(c)] ?? 0) + 1;
  // Root block: most-referenced; tie-break on the shortest (most general) name.
  const rootClass = Object.keys(freq).sort((a, b) => freq[b] - freq[a] || a.length - b.length)[0];
  if (!rootClass) throw new Error('no .ds-* block found');

  const root = rootClass.slice(1); // without the leading dot
  const uniq = (arr) => [...new Set(arr)].sort();

  const elements = uniq(
    chunks.filter((c) => c.startsWith(`.${root}__`)).map((c) => c.slice(root.length + 3).split('--')[0])
  );
  const modifiers = uniq(
    chunks.filter((c) => c.startsWith(`.${root}--`)).map((c) => c.slice(root.length + 3))
  );
  // States: CSS pseudo-classes used + .is-* state hooks.
  const pseudo = uniq(
    [...body.matchAll(/:((?:hover|focus|focus-visible|active|disabled|checked|invalid|required|placeholder-shown))/g)].map((m) => m[1])
  );
  // .is-demo--* are doc-page demo helpers, not real component state hooks — exclude.
  const stateHooks = uniq([...body.matchAll(/\.is-([a-z0-9-]+)/g)].map((m) => m[1]).filter((h) => !h.startsWith('demo')));

  const tokensUsed = uniq([...body.matchAll(/var\(\s*(--sd-[a-z0-9-]+)/g)].map((m) => m[1]));

  return { rootClass, classes: uniq(chunks), elements, modifiers, states: pseudo, stateHooks, tokensUsed };
}

// ── HTML extraction (the semantic layer) ──
function parsePage(html, name) {
  const titleMatch = html.match(/<h1 class="page-header__title">([\s\S]*?)<\/h1>/);
  if (!titleMatch) throw new Error(`${name}.html: no <h1 class="page-header__title"> found`);
  const title = text(titleMatch[1]);

  // Section outline: each <section ... id="x"> and its first <h2> title.
  const sections = [];
  for (const m of html.matchAll(/<section\b[^>]*\bid="([a-z0-9-]+)"[^>]*>([\s\S]*?)<h2\b[^>]*>([\s\S]*?)<\/h2>/g)) {
    sections.push({ id: m[1], title: text(m[3].replace(/<span[^>]*>[\s\S]*?<\/span>/g, '')) });
  }

  // Dependencies: other components' shared CSS linked by this page.
  const dependencies = [...html.matchAll(/assets\/css\/components\/([a-z0-9-]+)\.css/g)]
    .map((m) => m[1])
    .filter((dep) => dep !== name);

  // Props matrix — OPTIONAL ("Figma ↔ code mapping" table, only a few pages have it).
  let props = null;
  const propTable = html.match(/<table[^>]*aria-label="[^"]*props"[^>]*>([\s\S]*?)<\/table>/i);
  if (propTable) {
    props = parseTable(propTable[1]);
    if (!props.length) throw new Error(`${name}.html: props table present but parsed 0 rows — structure changed?`);
  }

  // Changelog — UNIVERSAL (every page has an id="changelog" section), but both
  // the table class (changelog-table / ds-table changelog / bare ds-table) AND
  // the column set vary (some pages have an Author column, some don't), so
  // anchor on the section id, take its first table, and drive off its <thead>.
  const clTable = html.match(/id="changelog"[\s\S]*?<table\b[^>]*>([\s\S]*?)<\/table>/);
  if (!clTable) throw new Error(`${name}.html: no id="changelog" section with a table found`);
  const changelog = parseTable(clTable[1]);
  if (!changelog.length) throw new Error(`${name}.html: changelog table parsed 0 rows`);
  if (!('version' in changelog[0])) throw new Error(`${name}.html: changelog has no Version column`);

  return { title, sections, dependencies, props, changelog, version: changelog[0].version };
}

// Parse an HTML table into [{header: cell, ...}] using its <thead> th's as keys.
// Handles 3- vs 4-column changelogs and the props matrix with one code path.
function parseTable(tableInner) {
  const head = tableInner.match(/<thead>([\s\S]*?)<\/thead>/);
  const keys = [...(head ? head[1] : '').matchAll(/<th\b[^>]*>([\s\S]*?)<\/th>/g)].map((m) => slugKey(text(m[1])));
  const body = tableInner.match(/<tbody>([\s\S]*?)<\/tbody>/);
  const rows = [];
  for (const row of (body ? body[1] : '').matchAll(/<tr>([\s\S]*?)<\/tr>/g)) {
    const cells = [...row[1].matchAll(/<td\b[^>]*>([\s\S]*?)<\/td>/g)].map((m) => text(m[1]));
    if (cells.length) rows.push(Object.fromEntries(keys.map((k, i) => [k, cells[i] ?? ''])));
  }
  return rows;
}

// "Figma property" -> "figmaProperty", "Code prop" -> "codeProp"
function slugKey(label) {
  const words = label.toLowerCase().replace(/[^a-z0-9 ]/g, '').trim().split(/\s+/);
  return words.map((w, i) => (i === 0 ? w : w[0].toUpperCase() + w.slice(1))).join('');
}

// ── build manifests ──
const files = readdirSync(PAGES_DIR).filter((f) => f.endsWith('.html') && !EXEMPT.has(f));
if (files.length < 10) throw new Error(`Suspiciously few component pages: ${files.length}`);

const manifests = {};
for (const file of files) {
  const name = basename(file, '.html');
  const cssPath = join(CSS_DIR, `${name}.css`);
  if (!existsSync(cssPath)) throw new Error(`${name}: missing ${cssPath}`);

  const css = parseCss(readFileSync(cssPath, 'utf8'));
  const page = parsePage(readFileSync(join(PAGES_DIR, file), 'utf8'), name);

  const manifest = {
    name,
    title: page.title,
    version: page.version,
    rootClass: css.rootClass,
    stylesheet: `assets/css/components/${name}.css`,
    docUrl: `${SITE_BASE}components/${name}.html`,
    dependencies: page.dependencies,
    classes: css.classes,
    elements: css.elements,
    modifiers: css.modifiers,
    states: css.states,
    stateHooks: css.stateHooks,
    tokensUsed: css.tokensUsed,
    sections: page.sections,
    changelog: page.changelog,
  };
  if (page.props) manifest.props = page.props;
  manifests[name] = manifest;
}

const names = Object.keys(manifests).sort();

// Surface props coverage so the gap stays visible — props tables exist on only a
// few pages and are backfilled opportunistically, not silently treated as "all done".
const withProps = names.filter((n) => manifests[n].props);
const coverage = `props matrix: ${withProps.length}/${names.length} components (${withProps.join(', ') || 'none'})`;

// Per-component files
const outFiles = {};
for (const name of names) {
  outFiles[join(OUT_DIR, `${name}.json`)] =
    JSON.stringify({ $description: 'Derived from component CSS + doc page — do not edit by hand; regenerate with `node scripts/build-component-api.mjs`.', ...manifests[name] }, null, 2) + '\n';
}

// Catalogue (no timestamps — output must be deterministic for --check)
const index = {
  $description:
    'Stardust Design System component API index. Derived from docs/components/*.html and ' +
    'docs/assets/css/components/*.css — do not edit by hand; regenerate with ' +
    '`node scripts/build-component-api.mjs`. Per-component detail lives in api/<name>.json.',
  components: names.map((name) => ({
    name,
    title: manifests[name].title,
    version: manifests[name].version,
    rootClass: manifests[name].rootClass,
    api: `api/${name}.json`,
    stylesheet: manifests[name].stylesheet,
    docUrl: manifests[name].docUrl,
  })),
};
outFiles[join(OUT_DIR, 'index.json')] = JSON.stringify(index, null, 2) + '\n';

// llms.txt — flat entry point (llmstxt.org convention)
const llms = [
  '# Stardust Design System',
  '',
  '> Xplor design system: tokens + components, documented as a no-build static site.',
  '> These machine-readable files are derived from the source CSS and doc pages — prefer',
  '> them over scraping the demo-heavy HTML. Regenerate with `node scripts/build-component-api.mjs`.',
  '',
  '## Components',
  '',
  ...names.map((n) => `- [${manifests[n].title}](${SITE_BASE}api/${n}.json): \`${manifests[n].rootClass}\` — v${manifests[n].version}. Docs: ${manifests[n].docUrl}`),
  '',
  '## Machine-readable',
  '',
  `- [Component index](${SITE_BASE}api/index.json): catalogue of all components`,
  `- [Design tokens (DTCG)](${SITE_BASE}tokens/stardust.tokens.json): full token set in W3C DTCG format`,
  '',
].join('\n');
outFiles[LLMS_PATH] = llms;

// ── write or check ──
if (check) {
  let stale = 0;
  for (const [path, content] of Object.entries(outFiles)) {
    const current = existsSync(path) ? readFileSync(path, 'utf8') : '';
    if (current !== content) { stale++; console.error(`check-component-api: stale — ${path}`); }
  }
  // Catch orphans: an api/*.json for a component that no longer exists.
  if (existsSync(OUT_DIR)) {
    const expected = new Set(Object.keys(outFiles).map((p) => basename(p)));
    for (const f of readdirSync(OUT_DIR).filter((f) => f.endsWith('.json'))) {
      if (!expected.has(f)) { stale++; console.error(`check-component-api: orphan — ${join(OUT_DIR, f)}`); }
    }
  }
  if (stale > 0) {
    console.error(`\ncheck-component-api: ${stale} file(s) out of date.\nRun: node scripts/build-component-api.mjs  and commit the result.`);
    process.exit(1);
  }
  console.log(`check-component-api: OK — ${names.length} components in sync.`);
  console.log(`  ${coverage}`);
} else {
  if (existsSync(OUT_DIR)) rmSync(OUT_DIR, { recursive: true, force: true }); // drop orphans
  mkdirSync(OUT_DIR, { recursive: true });
  for (const [path, content] of Object.entries(outFiles)) writeFileSync(path, content);
  console.log(`Wrote ${Object.keys(outFiles).length} files for ${names.length} components → ${OUT_DIR}/ and ${LLMS_PATH}.`);
  console.log(`  ${coverage}`);
}
