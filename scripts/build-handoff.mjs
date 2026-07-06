// Developer-handoff generator (skill: dev-handoff).
// One source of truth per flow — docs/sandbox/<flow>/handoff.source.json — generates every
// downstream artifact so the human page, the spec, and the agent export never drift:
//
//   docs/sandbox/<flow>/HANDOFF.md            human spec (Markdown)
//   docs/sandbox/<flow>/handoff.html          published page (site chrome)
//   docs/sandbox/<flow>/handover/             agent-readable export:
//     manifest.json                           screens, components→screens, tokens, routes
//     screens/<screen-id>.json                per-screen spec (states, copy, redlines, a11y, acceptance)
//     flows/<flow-id>.json                    transitions, entry/exit points
//     acceptance-criteria.json                flat, agent-checkable assertions
//     platform-deltas.json                    web / iOS / Android differences
//
//   node scripts/build-handoff.mjs            # regenerate for every flow with a handoff.source.json
//   node scripts/build-handoff.mjs --check    # CI: fail if any generated file is stale/orphaned
//
// No deps. Deterministic output (derived purely from the source; version/date come FROM the
// source, never the clock) so --check is meaningful. The prototype is the redline: every
// screen/state carries a deep-link into the live prototype rather than re-drawing pixels.
import { readdirSync, readFileSync, writeFileSync, existsSync, mkdirSync, rmSync, statSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';

const SANDBOX_DIR = 'docs/sandbox';
const TOKENS_CSS = 'docs/assets/css/tokens.css';
const CHECK = process.argv.includes('--check');

// ---------- helpers ----------------------------------------------------------
const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const attr = (s) => esc(s).replace(/"/g, '&quot;'); // for HTML attribute values
const j = (obj) => JSON.stringify(obj, null, 2) + '\n';

// Token name → value map, parsed from tokens.css. Used to resolve referenced tokens and to
// auto-flag net-new values that have no token yet (the "flag gaps" rule, mechanised).
function loadTokens() {
  const map = {};
  if (!existsSync(TOKENS_CSS)) return map;
  const css = readFileSync(TOKENS_CSS, 'utf8');
  const re = /(--sd-[a-z0-9-]+)\s*:\s*([^;]+);/gi;
  let m;
  while ((m = re.exec(css))) map[m[1]] = m[2].trim();
  return map;
}

// Build the prototype deep-link for a step. The source supplies the prototype base + direction.
function deepLink(src, step, device = 'phone') {
  const v = src.direction && src.direction.v != null ? src.direction.v : 0;
  return `${src.prototypeBase || 'index.html'}?v=${v}&step=${step}&device=${device}`;
}

function resolveTokens(names, tokenMap) {
  const used = [], gaps = [];
  for (const n of names || []) {
    if (tokenMap[n] != null) used.push({ name: n, value: tokenMap[n] });
    else gaps.push(n);
  }
  return { used, gaps };
}

function required(src, file) {
  for (const k of ['flow', 'title', 'version', 'date', 'screens']) {
    if (src[k] == null) throw new Error(`${file}: missing required field "${k}"`);
  }
  if (!Array.isArray(src.screens) || src.screens.length === 0) {
    throw new Error(`${file}: "screens" must be a non-empty array`);
  }
}

// ---------- export builders (agent-readable JSON) ----------------------------
function buildManifest(src, tokenMap) {
  const flowTokens = new Set(src.tokens || []);
  src.screens.forEach((s) => (s.tokens || []).forEach((t) => flowTokens.add(t)));
  const { used, gaps } = resolveTokens([...flowTokens], tokenMap);

  // component → which screens it appears on
  const compScreens = {};
  src.screens.forEach((s) => (s.components || []).forEach((c) => {
    (compScreens[c] = compScreens[c] || []).push(s.id);
  }));
  const components = (src.components || []).map((c) => ({
    name: c.name, dsVersion: c.dsVersion || null, status: c.status || 'reuse',
    variants: c.variants || [], notes: c.notes || null, screens: compScreens[c.name] || [],
  }));
  // components referenced by screens but absent from the manifest list — flag them
  const declared = new Set((src.components || []).map((c) => c.name));
  const undeclared = Object.keys(compScreens).filter((c) => !declared.has(c)).sort();

  return {
    $description: `Stardust developer-handoff manifest for "${src.title}". Generated from ` +
      `handoff.source.json by scripts/build-handoff.mjs — do not edit by hand.`,
    flow: src.flow, title: src.title, status: src.status || 'Draft',
    version: src.version, date: src.date,
    direction: src.direction || null,
    devices: src.devices || ['phone'], platforms: src.platforms || ['web'],
    owner: src.owner || null, engContact: src.engContact || null,
    dependencies: src.dependencies || [],
    prototype: { base: src.prototypeBase || 'index.html', direction: src.direction || null },
    screens: src.screens.map((s) => ({
      id: s.id, name: s.name, route: deepLink(src, s.step),
      platforms: s.platforms || src.platforms || ['web'],
      components: s.components || [], tokens: s.tokens || [],
      states: s.states || [], figma: s.figma || null, spec: `screens/${s.id}.json`,
    })),
    components, undeclaredComponents: undeclared,
    tokens: used, tokenGaps: gaps,
    flows: src.flowsGraph ? [{ id: src.flowsGraph.id, spec: `flows/${src.flowsGraph.id}.json` }] : [],
    acceptanceCount: src.screens.reduce((n, s) => n + (s.acceptance || []).length, 0),
    generatedBy: 'scripts/build-handoff.mjs',
  };
}

function buildScreen(src, s) {
  return {
    $description: `Per-screen handoff spec for "${s.name}" (${s.id}) in flow "${src.flow}". ` +
      `Generated by scripts/build-handoff.mjs — do not edit by hand.`,
    id: s.id, name: s.name, flow: src.flow,
    route: deepLink(src, s.step), routeBare: deepLink(src, s.step) + '&bare=1',
    purpose: s.purpose || null, entry: s.entry || null, exit: s.exit || null,
    platforms: s.platforms || src.platforms || ['web'], figma: s.figma || null,
    layout: s.layout || [], copy: s.copy || [],
    components: s.components || [], tokens: s.tokens || [],
    redlines: s.redlines || [], behaviour: s.behaviour || [], states: s.states || [],
    a11y: s.a11y || [],
    acceptance: (s.acceptance || []).map((a, i) => ({
      id: a.id || `${s.id}-AC${i + 1}`, text: a.text, assert: a.assert || null, screen: s.id,
    })),
  };
}

function buildFlow(src) {
  const g = src.flowsGraph;
  if (!g) return null;
  return {
    $description: `Flow graph for "${src.flow}". Generated by scripts/build-handoff.mjs.`,
    id: g.id, entries: g.entries || [], exits: g.exits || [],
    screenOrder: src.screens.map((s) => s.id),
    transitions: g.transitions || [],
  };
}

function buildAcceptance(src) {
  const items = [];
  src.screens.forEach((s) => (s.acceptance || []).forEach((a, i) => items.push({
    id: a.id || `${s.id}-AC${i + 1}`, screen: s.id, text: a.text, assert: a.assert || null,
  })));
  return {
    $description: `Flat, agent-checkable acceptance criteria for "${src.title}". ` +
      `Generated by scripts/build-handoff.mjs.`,
    flow: src.flow, version: src.version, count: items.length, criteria: items,
  };
}

function buildPlatformDeltas(src) {
  return {
    $description: `Platform implementation deltas for "${src.title}". Generated by scripts/build-handoff.mjs.`,
    flow: src.flow, platforms: src.platforms || ['web'], deltas: src.platformDeltas || [],
  };
}

// ---------- Markdown ---------------------------------------------------------
function buildMarkdown(src, tokenMap) {
  const L = [];
  const link = (step, label = 'open', device = 'phone') => `[${label}](${deepLink(src, step, device)})`;
  L.push(`# ${src.title} — Developer Handoff`, '');
  L.push('> **Build from this, not from Figma.** The runnable prototype is the source of truth for');
  L.push('> pixels; this spec is the contract for behaviour, states, tokens, redlines, a11y, and');
  L.push('> acceptance. Pixel-exact values: open the deep-link and inspect in the browser.', '');
  L.push('<!-- GENERATED from handoff.source.json by scripts/build-handoff.mjs — do not edit by hand. -->', '');
  L.push('| | |', '|---|---|');
  L.push(`| **Status** | ${src.status || 'Draft'} |`);
  L.push(`| **Version** | ${src.version} — ${src.date} |`);
  if (src.direction) L.push(`| **Approved direction** | ${src.direction.name} (\`v=${src.direction.v}\`) |`);
  L.push(`| **Prototype** | [\`${src.prototypeBase || 'index.html'}\`](${src.prototypeBase || 'index.html'}) |`);
  L.push(`| **Devices** | ${(src.devices || ['phone']).join(' · ')} |`);
  L.push(`| **Platforms** | ${(src.platforms || ['web']).join(' · ')} |`);
  if (src.owner) L.push(`| **Owner** | ${src.owner}${src.engContact ? ` · **Eng:** ${src.engContact}` : ''} |`);
  L.push(`| **Agent export** | [\`handover/manifest.json\`](handover/manifest.json) |`, '');
  if (src.summary) L.push('## 0. At a glance', '', src.summary, '');

  L.push('## 1. Scope & flow map', '');
  L.push('| ID | Screen | Purpose | Prototype |', '|---|---|---|---|');
  src.screens.forEach((s) => L.push(`| ${s.id} | ${s.name} | ${s.purpose || ''} | ${link(s.step)} |`));
  L.push('');
  if (src.flowsGraph) {
    L.push('**Route map**', '', '```');
    L.push(`entries: ${(src.flowsGraph.entries || []).join(', ')}`);
    (src.flowsGraph.transitions || []).forEach((t) => L.push(`${t.from} --(${t.on})--> ${t.to}`));
    L.push(`exits: ${(src.flowsGraph.exits || []).join(', ')}`, '```', '');
  }
  if (src.outOfScope && src.outOfScope.length) {
    L.push('**Out of scope**', '', ...src.outOfScope.map((x) => `- ${x}`), '');
  }
  if (src.dependencies && src.dependencies.length) {
    L.push('**Cross-system dependencies** (QikKids / Discover / cross-surface feeds)', '',
      '| System | Data | Direction | Missing-data behaviour | Notes |', '|---|---|---|---|---|');
    src.dependencies.forEach((d) => L.push(
      `| ${d.system} | ${d.data} | ${d.direction || 'inbound'} | ${d.missingBehaviour || '—'} | ${d.notes || ''} |`));
    L.push('');
  }

  L.push('## 2. Global foundations', '');
  if (src.components && src.components.length) {
    L.push('| Component | DS ver | Status | Variants | Notes |', '|---|---|---|---|---|');
    src.components.forEach((c) => L.push(
      `| \`${c.name}\` | ${c.dsVersion || '—'} | ${c.status || 'reuse'} | ${(c.variants || []).join(', ') || '—'} | ${c.notes || ''} |`));
    L.push('');
  }
  const { gaps } = resolveTokens(
    [...new Set([...(src.tokens || []), ...src.screens.flatMap((s) => s.tokens || [])])], tokenMap);
  if (gaps.length) {
    L.push('> ⚠️ **Token gaps** — referenced but not found in `tokens.css` (decide before build): ' +
      gaps.map((g) => `\`${g}\``).join(', '), '');
  }

  L.push('## 3. Screen specs', '');
  src.screens.forEach((s) => {
    L.push(`### ${s.id} · ${s.name}`, '');
    L.push(`**Prototype:** ${link(s.step, 'open the live screen')} · \`&bare=1\` for chrome-free`);
    L.push(`**Purpose:** ${s.purpose || '—'} **Entry:** ${s.entry || '—'} **Exit:** ${s.exit || '—'}`, '');
    if (s.layout && s.layout.length) L.push('**Layout (top → bottom)**', '', ...s.layout.map((x, i) => `${i + 1}. ${x}`), '');
    if (s.copy && s.copy.length) {
      L.push('**Copy** (verbatim — ship exactly this)', '', '| Element | Text |', '|---|---|');
      s.copy.forEach((c) => L.push(`| ${c.element} | ${c.text} |`));
      L.push('');
    }
    if (s.redlines && s.redlines.length) {
      L.push('**Redlines** (spec-level — exact pixels in the prototype)', '', '| Element | Spec |', '|---|---|');
      s.redlines.forEach((r) => L.push(`| ${r.element} | ${r.spec} |`));
      L.push('');
    }
    if (s.behaviour && s.behaviour.length) L.push('**Interaction & behaviour**', '', ...s.behaviour.map((x) => `- ${x}`), '');
    if (s.states && s.states.length) L.push(`**States:** ${s.states.join(' · ')}`, '');
    if (s.a11y && s.a11y.length) L.push('**Accessibility**', '', ...s.a11y.map((x) => `- ${x}`), '');
    if (s.acceptance && s.acceptance.length) {
      L.push('**Acceptance criteria** (testable)', '');
      s.acceptance.forEach((a, i) => L.push(`- [ ] (${a.id || `${s.id}-AC${i + 1}`}) ${a.text}`));
      L.push('');
    }
  });

  if (src.stateMatrix && src.stateMatrix.length) {
    L.push('## 4. State & edge matrix', '');
    L.push('| State | Trigger | Screen(s) | UI | Copy | Recovery | Prototype |', '|---|---|---|---|---|---|---|');
    src.stateMatrix.forEach((e) => L.push(
      `| \`${e.id}\` | ${e.trigger} | ${(e.screens || []).join(', ')} | ${e.ui} | ${e.copy || ''} | ${e.recovery || ''} | ${link(e.step)} |`));
    L.push('');
  }
  if (src.platformDeltas && src.platformDeltas.length) {
    L.push('## 5. Platform deltas', '');
    const plats = src.platforms || ['web'];
    L.push('| Area | ' + plats.join(' | ') + ' |', '|---' + '|---'.repeat(plats.length) + '|');
    src.platformDeltas.forEach((d) => L.push('| ' + d.area + ' | ' + plats.map((p) => d[p] || '—').join(' | ') + ' |'));
    L.push('');
  }
  if (src.openQuestions && src.openQuestions.length) {
    L.push('## 6. Open questions', '', '| Question | Owner | Due | Status |', '|---|---|---|---|');
    src.openQuestions.forEach((q) => L.push(`| ${q.q} | ${q.owner || '—'} | ${q.due || '—'} | ${q.status || 'open'} |`));
    L.push('');
  }
  L.push('## 7. Changelog', '', '| Version | Date | Change |', '|---|---|---|');
  (src.changelog || [{ version: src.version, date: src.date, change: 'Initial handoff.' }])
    .forEach((c) => L.push(`| ${c.version} | ${c.date} | ${c.change} |`));
  L.push('');
  return L.join('\n');
}

// ---------- HTML page (two-deep site chrome) ---------------------------------
function buildHtml(src, tokenMap) {
  const dl = (step, device = 'phone') => attr(deepLink(src, step, device));
  const rows = (arr, fn) => arr.map(fn).join('\n');
  const screensToc = src.screens.map((s) => `          <li><a href="#${attr(s.id)}">${esc(s.id)} · ${esc(s.name)}</a></li>`).join('\n');

  const screenSections = src.screens.map((s) => `
        <section class="section scroll-spy-target" id="${attr(s.id)}">
          <h2>${esc(s.id)} · ${esc(s.name)}</h2>
          <p><a class="ho-deeplink" href="${dl(s.step)}">▶ open the live screen</a></p>
          <p>${esc(s.purpose || '')} <span class="ho-meta">Entry: ${esc(s.entry || '—')} · Exit: ${esc(s.exit || '—')}</span></p>
          ${(s.copy && s.copy.length) ? `<table class="ds-table" aria-label="${attr(s.name)} copy">
            <thead><tr><th>Element</th><th>Text</th></tr></thead>
            <tbody>${rows(s.copy, (c) => `<tr><td>${esc(c.element)}</td><td>${esc(c.text)}</td></tr>`)}</tbody>
          </table>` : ''}
          ${(s.redlines && s.redlines.length) ? `<table class="ds-table" aria-label="${attr(s.name)} redlines">
            <thead><tr><th>Element</th><th>Spec</th></tr></thead>
            <tbody>${rows(s.redlines, (r) => `<tr><td>${esc(r.element)}</td><td>${esc(r.spec)}</td></tr>`)}</tbody>
          </table>` : ''}
          ${(s.behaviour && s.behaviour.length) ? `<h3>Interaction &amp; behaviour</h3><ul>${rows(s.behaviour, (b) => `<li>${esc(b)}</li>`)}</ul>` : ''}
          ${(s.acceptance && s.acceptance.length) ? `<h3>Acceptance criteria</h3><ul>${rows(s.acceptance, (a, i) => `<li>${esc(a.text)}</li>`)}</ul>` : ''}
        </section>`).join('\n');

  const stateSection = (src.stateMatrix && src.stateMatrix.length) ? `
        <section class="section scroll-spy-target" id="states">
          <h2>State &amp; edge matrix</h2>
          <table class="ds-table" aria-label="State and edge matrix">
            <thead><tr><th>State</th><th>Trigger</th><th>UI</th><th>Copy</th><th>Recovery</th><th>Prototype</th></tr></thead>
            <tbody>${rows(src.stateMatrix, (e) => `<tr><td><code>${esc(e.id)}</code></td><td>${esc(e.trigger)}</td><td>${esc(e.ui)}</td><td>${esc(e.copy || '')}</td><td>${esc(e.recovery || '')}</td><td class="ho-deeplink"><a href="${dl(e.step)}">open</a></td></tr>`)}</tbody>
          </table>
        </section>` : '';

  const plats = src.platforms || ['web'];
  const deltaSection = (src.platformDeltas && src.platformDeltas.length) ? `
        <section class="section scroll-spy-target" id="platform-deltas">
          <h2>Platform deltas</h2>
          <table class="ds-table" aria-label="Platform deltas">
            <thead><tr><th>Area</th>${plats.map((p) => `<th>${esc(p)}</th>`).join('')}</tr></thead>
            <tbody>${rows(src.platformDeltas, (d) => `<tr><td>${esc(d.area)}</td>${plats.map((p) => `<td>${esc(d[p] || '—')}</td>`).join('')}</tr>`)}</tbody>
          </table>
        </section>` : '';

  const depsSection = (src.dependencies && src.dependencies.length) ? `
        <section class="section scroll-spy-target" id="dependencies">
          <h2>Cross-system dependencies</h2>
          <table class="ds-table" aria-label="Cross-system dependencies">
            <thead><tr><th>System</th><th>Data</th><th>Direction</th><th>Missing-data behaviour</th><th>Notes</th></tr></thead>
            <tbody>${rows(src.dependencies, (d) => `<tr><td>${esc(d.system)}</td><td>${esc(d.data)}</td><td>${esc(d.direction || 'inbound')}</td><td>${esc(d.missingBehaviour || '—')}</td><td>${esc(d.notes || '')}</td></tr>`)}</tbody>
          </table>
        </section>` : '';

  const oqSection = (src.openQuestions && src.openQuestions.length) ? `
        <section class="section scroll-spy-target" id="open-questions">
          <h2>Open questions</h2>
          <table class="ds-table" aria-label="Open questions">
            <thead><tr><th>Question</th><th>Owner</th><th>Due</th><th>Status</th></tr></thead>
            <tbody>${rows(src.openQuestions, (q) => `<tr><td>${esc(q.q)}</td><td>${esc(q.owner || '—')}</td><td>${esc(q.due || '—')}</td><td>${esc(q.status || 'open')}</td></tr>`)}</tbody>
          </table>
        </section>` : '';

  const changelog = src.changelog || [{ version: src.version, date: src.date, change: 'Initial handoff.' }];

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(src.title)} — Developer Handoff — Stardust</title>
  <!-- GENERATED from handoff.source.json by scripts/build-handoff.mjs — do not edit by hand. -->
  <link rel="stylesheet" href="../../assets/css/main.css">
  <link rel="stylesheet" href="../../assets/css/tokens.css">
  <style>
    /* handoff.html only. No ds-* rules; --sd-* tokens only. */
    .ho-cta { display: inline-flex; align-items: center; gap: var(--sd-spacing-2);
      padding: var(--sd-spacing-3) var(--sd-spacing-5); background: var(--sd-colour-action-primary);
      color: var(--sd-colour-action-foreground); border-radius: var(--sd-radius-lg);
      text-decoration: none; font-weight: 600; }
    .ho-meta { color: var(--sd-colour-text-secondary); font-size: var(--sd-font-size-sm); }
    .ho-deeplink { font-size: var(--sd-font-size-sm); }
  </style>
</head>
<body>

  <div id="site-nav"></div>
  <div class="site-content">
    <div class="page-layout">

      <main class="main-content">

        <div class="page-header scroll-spy-target" id="overview">
          <p class="page-header__eyebrow">Workshop · Handoff</p>
          <h1 class="page-header__title">${esc(src.title)} — Developer Handoff</h1>
          <p>Build from this spec, not from Figma. The runnable prototype is the source of truth
             for pixels; this page is the contract for behaviour, states, tokens, redlines,
             accessibility, and acceptance.</p>
          <p class="ho-meta">Status: ${esc(src.status || 'Draft')} · Version ${esc(src.version)} (${esc(src.date)})${src.direction ? ` · Direction: ${esc(src.direction.name)}` : ''} · Spec: <a href="HANDOFF.md">HANDOFF.md</a> · Agent export: <a href="handover/manifest.json">manifest.json</a></p>
          <p><a class="ho-cta" href="${attr((src.prototypeBase || 'index.html') + (src.direction ? `?v=${src.direction.v}` : ''))}">▶ Open the prototype</a></p>
        </div>

        <section class="section scroll-spy-target" id="flow-map">
          <h2>Scope &amp; flow map</h2>
          <table class="ds-table" aria-label="Screen inventory">
            <thead><tr><th>ID</th><th>Screen</th><th>Purpose</th><th>Prototype</th></tr></thead>
            <tbody>${rows(src.screens, (s) => `<tr><td>${esc(s.id)}</td><td>${esc(s.name)}</td><td>${esc(s.purpose || '')}</td><td class="ho-deeplink"><a href="${dl(s.step)}">open</a></td></tr>`)}</tbody>
          </table>
        </section>
${screenSections}
${stateSection}
${deltaSection}
${depsSection}
${oqSection}
        <section class="section scroll-spy-target" id="changelog">
          <h2>Changelog</h2>
          <table class="ds-table" aria-label="Changelog">
            <thead><tr><th>Version</th><th>Date</th><th>Change</th></tr></thead>
            <tbody>${rows(changelog, (c) => `<tr><td>${esc(c.version)}</td><td>${esc(c.date)}</td><td>${esc(c.change)}</td></tr>`)}</tbody>
          </table>
        </section>

      </main>

      <aside class="page-toc" aria-label="On this page">
        <p class="page-toc__title">On this page</p>
        <ul class="page-toc__nav">
          <li><a href="#overview">Overview</a></li>
          <li><a href="#flow-map">Scope &amp; flow map</a></li>
${screensToc}
${src.stateMatrix && src.stateMatrix.length ? '          <li><a href="#states">State &amp; edge matrix</a></li>' : ''}
${src.platformDeltas && src.platformDeltas.length ? '          <li><a href="#platform-deltas">Platform deltas</a></li>' : ''}
${src.dependencies && src.dependencies.length ? '          <li><a href="#dependencies">Cross-system dependencies</a></li>' : ''}
${src.openQuestions && src.openQuestions.length ? '          <li><a href="#open-questions">Open questions</a></li>' : ''}
          <li><a href="#changelog">Changelog</a></li>
        </ul>
      </aside>

    </div><!-- /.page-layout -->
  </div><!-- /.site-content -->

  <script src="../../assets/js/nav.js"></script>
</body>
</html>
`;
}

// ---------- assemble all files for one flow ----------------------------------
function filesForFlow(dir, src, tokenMap) {
  const files = {}; // path -> content
  files[join(dir, 'HANDOFF.md')] = buildMarkdown(src, tokenMap);
  files[join(dir, 'handoff.html')] = buildHtml(src, tokenMap);
  const ho = join(dir, 'handover');
  files[join(ho, 'manifest.json')] = j(buildManifest(src, tokenMap));
  src.screens.forEach((s) => { files[join(ho, 'screens', `${s.id}.json`)] = j(buildScreen(src, s)); });
  const flow = buildFlow(src);
  if (flow) files[join(ho, 'flows', `${flow.id}.json`)] = j(flow);
  files[join(ho, 'acceptance-criteria.json')] = j(buildAcceptance(src));
  files[join(ho, 'platform-deltas.json')] = j(buildPlatformDeltas(src));
  return files;
}

// list every generated file currently on disk for a flow (to detect orphans in --check)
function existingHandoffFiles(dir) {
  const out = [];
  for (const f of ['HANDOFF.md', 'handoff.html']) if (existsSync(join(dir, f))) out.push(join(dir, f));
  const ho = join(dir, 'handover');
  const walk = (d) => { if (!existsSync(d)) return;
    for (const e of readdirSync(d)) { const p = join(d, e);
      statSync(p).isDirectory() ? walk(p) : out.push(p); } };
  walk(ho);
  return out;
}

// ---------- main -------------------------------------------------------------
const tokenMap = loadTokens();
const flows = existsSync(SANDBOX_DIR)
  ? readdirSync(SANDBOX_DIR).filter((d) => existsSync(join(SANDBOX_DIR, d, 'handoff.source.json')))
  : [];

let totalFiles = 0, stale = [];
for (const flow of flows) {
  const dir = join(SANDBOX_DIR, flow);
  const srcPath = join(dir, 'handoff.source.json');
  let src;
  try { src = JSON.parse(readFileSync(srcPath, 'utf8')); }
  catch (e) { throw new Error(`${srcPath}: invalid JSON — ${e.message}`); }
  required(src, srcPath);
  const files = filesForFlow(dir, src, tokenMap);
  totalFiles += Object.keys(files).length;

  if (CHECK) {
    for (const [p, content] of Object.entries(files)) {
      const cur = existsSync(p) ? readFileSync(p, 'utf8') : null;
      if (cur !== content) stale.push(p);
    }
    const expected = new Set(Object.keys(files));
    for (const p of existingHandoffFiles(dir)) if (!expected.has(p)) stale.push(`${p} (orphan)`);
  } else {
    rmSync(join(dir, 'handover'), { recursive: true, force: true }); // orphan cleanup
    for (const [p, content] of Object.entries(files)) {
      mkdirSync(dirname(p), { recursive: true });
      writeFileSync(p, content);
    }
  }
}

if (CHECK) {
  if (stale.length) {
    console.error('build-handoff: out of date —\n  ' + stale.join('\n  ') +
      '\nRun: node scripts/build-handoff.mjs  and commit the result.');
    process.exit(1);
  }
  console.log(`build-handoff: OK — ${flows.length} flow(s), ${totalFiles} generated file(s) in sync.`);
} else {
  console.log(`build-handoff: wrote ${totalFiles} file(s) across ${flows.length} flow(s).`);
}
