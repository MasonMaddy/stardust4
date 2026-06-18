// Aggregates every component's changelog into one reverse-chronological feed for the
// site-wide "About → Changelog" page. Consumes the per-component manifests that
// build-component-api.mjs already produces (docs/api/<name>.json) — it does NOT re-parse
// the doc HTML.
//
//   node scripts/build-changelog.mjs           # regenerate the file
//   node scripts/build-changelog.mjs --check    # CI: fail if the file is stale
//
// Output: docs/about/changelog.json (committed; consumed by docs/about/changelog.html).
// NB: written to docs/about/, NOT docs/api/, because build-component-api.mjs wipes and
// recreates docs/api/ on every run (orphan cleanup) and would delete it.
// Output is deterministic (no timestamps) so --check is meaningful.
import { readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const API_DIR = 'docs/api';
const OUT_PATH = 'docs/about/changelog.json';
const SITE_BASE = 'https://masonmaddy.github.io/stardust4/';

// Parse component manifests (skip index.json and anything without a changelog array).
const files = readdirSync(API_DIR).filter((f) => f.endsWith('.json') && f !== 'index.json');
const entries = [];
for (const file of files) {
  const manifest = JSON.parse(readFileSync(join(API_DIR, file), 'utf8'));
  if (!Array.isArray(manifest.changelog)) continue;
  for (const row of manifest.changelog) {
    entries.push({
      date: row.date || '',
      version: row.version || '',
      component: manifest.name,
      title: manifest.title,
      author: row.author || null, // optional — some pages have no Author column
      change: row.change || '',
      docUrl: manifest.docUrl,
    });
  }
}
if (entries.length < 10) throw new Error(`Suspiciously few changelog entries: ${entries.length}`);

// Deterministic ordering: newest date first, then component A→Z, then version high→low.
const versionParts = (v) => v.split('.').map((n) => parseInt(n, 10) || 0);
function versionDesc(a, b) {
  const pa = versionParts(a), pb = versionParts(b);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const d = (pb[i] || 0) - (pa[i] || 0);
    if (d !== 0) return d;
  }
  return 0;
}
entries.sort((a, b) =>
  b.date.localeCompare(a.date) ||
  a.component.localeCompare(b.component) ||
  versionDesc(a.version, b.version)
);

const json = JSON.stringify({
  $description:
    'Stardust Design System site-wide changelog — aggregated from per-component manifests ' +
    '(docs/api/*.json). Do not edit by hand; regenerate with `node scripts/build-changelog.mjs`.',
  source: `${SITE_BASE}api/index.json`,
  entries,
}, null, 2) + '\n';

if (process.argv.includes('--check')) {
  const current = existsSync(OUT_PATH) ? readFileSync(OUT_PATH, 'utf8') : '';
  if (current !== json) {
    console.error(
      `check-changelog: ${OUT_PATH} is out of date with the component manifests.\n` +
      'Run: node scripts/build-changelog.mjs  and commit the result.'
    );
    process.exit(1);
  }
  console.log(`check-changelog: OK — ${entries.length} entries from ${files.length} manifests.`);
} else {
  writeFileSync(OUT_PATH, json);
  console.log(`Wrote ${OUT_PATH} (${entries.length} entries from ${files.length} manifests).`);
}
