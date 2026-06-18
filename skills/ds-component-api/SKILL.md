---
name: ds-component-api
description: >
  Use this skill to generate, maintain, or troubleshoot the machine-readable
  component API export — the structured files that let AI agents and non-web
  consumers read Stardust components WITHOUT parsing the demo-heavy doc HTML.
  Triggers include: "make the docs AI-readable", "generate the component
  manifests", "build the llms.txt", "export component metadata", "the api/*.json
  is out of date", "add a structured export for agents", or any request about
  consuming components as data rather than rendered pages. This skill owns
  `scripts/build-component-api.mjs` and its outputs (`docs/api/*.json`,
  `docs/llms.txt`). It is the component-side analogue of the DTCG token export
  owned by `ds-token-pipeline`.
---

# Design System — Component API Export Skill

The doc pages (`docs/components/*.html`) are authored for humans: demo-heavy,
large, and expensive for an agent to parse. This skill maintains a **derived,
committed, machine-readable projection** of every component so agents read facts,
not markup. It mirrors the token export pattern exactly: sources stay the single
source of truth; the export is regenerated and CI fails if it drifts.

**Never hand-edit the outputs.** They are generated. To change them, change the
source (component CSS or doc page) and regenerate.

## Outputs

| File | What it is |
|---|---|
| `docs/api/<name>.json` | One manifest per `ds-*` component (full detail) |
| `docs/api/index.json` | Catalogue: name, title, version, rootClass, links |
| `docs/llms.txt` | Flat [llmstxt.org](https://llmstxt.org) entry point — point agents here first. Published at `https://masonmaddy.github.io/stardust4/llms.txt` |

## Sources & the extraction contract

Two sources, split by what each can be trusted for:

- **Component CSS** (`docs/assets/css/components/<name>.css`) — the *structural*
  backbone. Uniform across all components, so it reliably yields: `rootClass`,
  `classes`, `elements` (BEM `__`), `modifiers` (BEM `--`), `states` (CSS
  pseudo-classes), `stateHooks` (`.is-*`, demo helpers excluded), `tokensUsed`.
- **Doc page** (`docs/components/<name>.html`) — the *semantic* layer:
  `title`, `sections` outline, `dependencies` (other components' CSS the page
  links), `changelog` (+ derived `version`), and `props` **if present**.

Robustness rules baked into the generator — keep them if you extend it:

- **Universal facts are asserted and fail loudly.** Missing `<h1>` title or
  `id="changelog"` section → the build errors, rather than silently emitting
  empty fields. A page restructure should break the export, not corrupt it.
- **Optional facts degrade gracefully.** The "Figma ↔ code mapping" props table
  exists on only a few pages; it is emitted when found, omitted otherwise.
- **Tables are parsed from their `<thead>`.** Changelogs vary (3-col vs 4-col
  with Author) and use three different table classes — anchor on the section
  `id`, drive columns off the header. Don't hardcode column positions.
- **Output is deterministic.** No timestamps — that is what makes `--check`
  meaningful. Don't add a generated-at date.
- `icons.html` is exempt (icon browser, not a `ds-*` component), matching
  `check-architecture.mjs`.

## Workflow

### Regenerate (after any component CSS or doc-page change)

```
node scripts/build-component-api.mjs
```

Then commit the regenerated `docs/api/*` and `docs/llms.txt` alongside your
source change — same discipline as `build-tokens-json.mjs`.

### Verify (CI runs this; run it locally before pushing)

```
node scripts/build-component-api.mjs --check
```

Fails if any output is stale **or** orphaned (an `api/*.json` for a component
that no longer exists). Wired into `.github/workflows/ci.yml`.

### Adding a component

No skill action needed — the generator discovers components from
`docs/components/*.html`. Just regenerate after the new page lands (this is the
last step of a `ds-component-doc` Build, after the page and shared CSS exist).

### Troubleshooting

- **`--check` fails in CI but the page looks fine** → someone edited a doc page
  or CSS without regenerating. Run the generator and commit the result.
- **Generator throws on a page** → that page diverged from the doc-page template
  (missing title or changelog section). Fix the page to match the template;
  don't loosen the assertion unless the template itself changed.
- **A field is empty/wrong** → check whether the fact lives in CSS or HTML per
  the contract above, and whether that page's markup matches its peers.

## Manifest schema (`api/<name>.json`)

```jsonc
{
  "name": "button",                     // file stem
  "title": "Button",                    // <h1> page title
  "version": "1.3.0",                   // latest changelog row
  "rootClass": ".ds-btn",               // most-referenced .ds-* block in the CSS
  "stylesheet": "assets/css/components/button.css",
  "docUrl": "https://masonmaddy.github.io/stardust4/components/button.html",
  "dependencies": [],                   // other components this page composes
  "classes": [".ds-btn", ".ds-btn--solid", "..."],
  "elements": ["icon", "spinner"],      // BEM __elements
  "modifiers": ["solid", "ghost", "..."],// BEM --modifiers
  "states": ["hover", "focus", "disabled", "active"], // CSS pseudo-classes
  "stateHooks": [],                     // .is-* hooks (demo helpers excluded)
  "tokensUsed": ["--sd-radius-lg", "..."],// every --sd-* the CSS consumes
  "sections": [{ "id": "anatomy", "title": "Anatomy" }, "..."],
  "changelog": [{ "version": "1.3.0", "date": "...", "author": "...", "change": "..." }],
  "props": [ /* OPTIONAL — Figma↔code matrix, header-keyed */ ]
}
```

## Relationship to other skills

- `ds-component-doc` (Build) produces/updates the doc page → run this skill's
  generator as the final Build step so the export tracks the page.
- `ds-token-pipeline` owns the parallel token export (`stardust.tokens.json`);
  `tokensUsed` here references those token names, giving agents a component →
  token dependency graph across the two exports.
- `ds-site-setup` owns nav + the index grid; this skill does not touch nav.
