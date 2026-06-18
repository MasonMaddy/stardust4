# Stardust Design System — agent orientation

Read this first, every session. It is the contract for working in this repo. For full
detail see `README.md`; this file is the short, enforceable version.

**What this is:** the documentation site and component workshop for Stardust, the Xplor
design system. A **no-build** static site (plain HTML/CSS/JS) published via GitHub Pages
from `docs/` on `main` → https://masonmaddy.github.io/stardust4/. There is no bundler,
framework, or compile step — files are served as-is.

## Orient before you act

1. Skim `README.md` (architecture, conventions, token chain).
2. Identify the task type and load the matching skill (table below) — don't freehand work
   a skill already encodes.
3. Touching a component? Read its CSS in `docs/assets/css/components/<name>.css` first.

## Hard rules (CI enforces these — a violation fails the build)

- **No hardcoded hex in shared component CSS.** Reference `--sd-*` tokens only.
  (`scripts/lint-hex.mjs`)
- **Component CSS is the single source of truth.** Doc pages must `<link>` the shared file
  from `docs/assets/css/components/`; never re-declare a `ds-*` rule inline on a page.
  Composed components must also link their dependencies. (`scripts/check-architecture.mjs`)
- **Tokens stay in sync.** After editing `tokens.css`, run `node scripts/build-tokens-json.mjs`
  to regenerate `docs/tokens/stardust.tokens.json`; CI fails if they drift. Never hand-edit
  the JSON. Token CSS variable *names* are the stable contract — values may change on a
  Figma re-sync, names never do.
- **`nav.js` builds DOM with `createElement`/`createTextNode` from hardcoded strings only —
  never `innerHTML`.** (See the header comment in that file.) CI syntax-checks it.
- **Every component doc page carries a changelog table — add a row for every change.**
- **Internal links/assets must resolve** (`scripts/check-links.mjs`) and **HTML must validate**
  (`html-validate`). Give every `<button>` a `type`.

## Architecture quick reference

- **Tokens** (`docs/assets/css/tokens.css`) are two-tier: primitives → semantic aliases.
  Mostly synced from Figma; a trailing CSS-first section (font weights, motion, z-index) is
  preserved across syncs.
- **Component CSS** lives in `docs/assets/css/components/<name>.css`. Pages keep only
  page-chrome/demo styles inline.
- `main.css` is **site chrome only** (`--xp-*` vars) — not part of the design system. Don't
  confuse `--xp-*` (chrome) with `--sd-*` (design tokens).
- **Run all CI checks locally before pushing:** `lint-hex.mjs`, `check-links.mjs`,
  `check-architecture.mjs`, `build-tokens-json.mjs --check`, `build-component-api.mjs --check`.

## Task → skill map

Component work follows a four-phase pipeline; do the phases in order.

| You're asked to… | Phase | Skill |
|---|---|---|
| Review/audit a component vs Material Design 3, gap analysis | 1 Review | `component-review` |
| Write up / extract a component spec | 2 Spec | `figma-component-builder` |
| Iterate an implementation, test states in isolation | 3 Sandbox | `component-sandbox` (`docs/sandbox/`) |
| Review/QA a WIP before building ("is this ready?") | 3.5 Gate | `sandbox-review` |
| Extract approved CSS + produce the doc page | 4 Build | `ds-component-doc` |
| Sync tokens, add/change a token, token reference pages | — | `ds-token-pipeline` |
| Generate the machine-readable component export (`api/*.json`, `llms.txt`) for AI/non-web consumers | — | `ds-component-api` |
| Site shell, nav additions, index grid, re-sync tokens.css | — | `ds-site-setup` |
| Audit a Figma component (read-only) | — | `figma-component-review` |
| Audit **and** write fixes back to Figma | — | `figma-component-uplift` |
| Compare a component to Apollo (only when "Apollo" is named; read-only reference) | — | `apollo-comparison` |

`nav.js` is the single source of truth for nav links; `ds-site-setup` owns it and the index
component grid. Adding a component to the site is a `ds-site-setup` task, not an ad-hoc edit.

## Subagents

Subagents you spawn load this file automatically — **except** the built-in `Explore` and
`Plan` agents, which skip `CLAUDE.md` for speed. When delegating to `Explore` or `Plan` in
this repo, restate the relevant hard rules in the task prompt (or tell them to read
`./CLAUDE.md` first), since they won't have it otherwise. All other agent types already do.

## Git & deploy

- `main` deploys live to GitHub Pages — **a push to `main` is a production deploy.**
- Confirm the deploy model and review expectations with the repo owner before pushing
  system-wide or refactor-scale changes; small component/sandbox edits are routine.
- The architecture guard exists because the CSS-extraction has been silently reverted twice
  by concurrent sessions sharing the working tree — re-verify working-tree state before you
  commit, and commit small.
