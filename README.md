# Stardust Design System

Documentation site and component workshop for **Stardust**, the Xplor design system. Published via GitHub Pages from the `docs/` folder on `main`: https://masonmaddy.github.io/stardust4/

## What's here

```
docs/
├── index.html                 Landing page
├── components/                Component doc pages (11 components)
├── tokens/                    Token reference pages (colour, typography, spacing, radius, motion)
├── sandbox/                   Development sandbox — WIP iteration + component library reference
└── assets/
    ├── css/
    │   ├── tokens.css         Design tokens as CSS custom properties (--sd-*) — synced from Figma
    │   ├── components/        Per-component CSS — the single source of truth for ds-* styles
    │   └── main.css           Site chrome only (--xp-* vars; not part of the design system)
    ├── js/nav.js              Site navigation (single source of truth for nav links)
    └── icons/                 SVG icon library (outline + colour sets, downloaded from Figma)
skills/                        Claude Code skills encoding the component workshop workflow
scripts/                       Tooling (icon download, CI checks)
```

## Architecture

- **Tokens** (`tokens.css`) are two-tier: primitives (raw scales) → semantic (purpose-named aliases).
  Most are synced from the Figma *Stardust Components* file (`a7JnfZ0Nd8df1TBPaMQ5Tj`); a trailing
  **CSS-first** section (font weights, motion, z-index) is pending Figma variable creation and is
  preserved across syncs. CSS variable *names* are the stable contract — values may change on
  sync, names never do.
- **Component CSS** lives in `docs/assets/css/components/<name>.css`. Doc pages and the sandbox
  link these shared files; pages keep only page-chrome/demo styles inline. Composed components
  link their dependencies too (e.g. Title Block loads `avatar.css` + `pill.css`).
- **No build step.** The site is plain HTML/CSS/JS served as-is.

## Workflow

Component work follows a four-phase pipeline, encoded as Claude Code skills in `skills/`:

1. **Review** (`component-review`) — audit the Figma component, gap analysis, decision log
2. **Spec** (`figma-component-builder`) — extract/produce the component spec
3. **Sandbox** (`component-sandbox`) — iterate the implementation in `docs/sandbox/`
3.5. **Sandbox Review** (`sandbox-review`) — independent senior engineer + designer gate;
   audits the WIP for token/architecture/a11y/design standards before Build
4. **Build** (`ds-component-doc`) — extract approved CSS to `components/<name>.css` and produce the doc page

Supporting skills: `ds-token-pipeline` (token sync), `ds-site-setup` (site shell + nav),
`figma-component-review` / `figma-component-uplift` (Figma-side audits),
`apollo-comparison` (read-only cross-check against Xplor's global Apollo design system —
explicit-invoke only; Apollo is a reference, Stardust/iOS/MD3 take precedence).

## Conventions

- Never hardcode hex in component CSS — reference `--sd-*` tokens (CI enforces this for
  `components/*.css`).
- Font weights and motion use `--sd-font-weight-*` / `--sd-motion-*` tokens.
- `nav.js` builds DOM via `createElement`/`createTextNode` from hardcoded strings only — never
  `innerHTML` (see the header comment in that file).
- Component pages carry a changelog table; add a row for every change.

## Tokens for engineers (DTCG export)

The full token set is published in the W3C **DTCG format** at a stable URL:

```
https://masonmaddy.github.io/stardust4/tokens/stardust.tokens.json
```

- **Derived, never hand-edited**: generated from `tokens.css` by
  `node scripts/build-tokens-json.mjs`; CI fails if the two drift.
- **Consume it** with any DTCG-aware tool — e.g. Style Dictionary v4 turns it into
  Compose/Kotlin, Swift, or XML resources:
  ```js
  // style-dictionary.config.js (consumer side — not part of this repo)
  export default {
    source: ['stardust.tokens.json'],
    platforms: {
      android: { transformGroup: 'android', buildPath: 'src/main/res/values/',
                 files: [{ destination: 'stardust.xml', format: 'android/resources' }] },
    },
  };
  ```
- **Sync chain**: Figma → tokens.css (Claude re-sync) → `build-tokens-json.mjs` →
  committed JSON → consumers re-fetch on release. Pin a commit SHA or vendor the file
  if you need reproducible builds.
- **It IS a committed source file** — `docs/tokens/stardust.tokens.json` in this repo.
  The Pages URL above is just that file served verbatim (GitHub Pages publishes the
  `docs/` folder; nothing is generated at serve time). Three ways to consume it:
  | Need | Use |
  |---|---|
  | Always-latest (CI regenerates on merge) | The Pages URL above |
  | Reproducible builds (pinned version) | `https://raw.githubusercontent.com/MasonMaddy/stardust4/<commit-sha>/docs/tokens/stardust.tokens.json` |
  | Offline / vendored | Commit a copy into your repo and diff against the URL on upgrade |

## Tooling

- `node scripts/download-colour-icons.mjs` — refresh the colour icon set from Figma
  (requires a `FIGMA_TOKEN` env var; never commit tokens).
- `node scripts/lint-hex.mjs` — fail on hardcoded hex in shared component CSS (runs in CI).
- `node scripts/check-links.mjs` — verify internal links/assets resolve (runs in CI).
