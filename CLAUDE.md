# Stardust Design System — agent orientation

Read this first, every session. It is the contract for working in this repo. For full
detail see `README.md`; this file is the short, enforceable version.

**What this is:** the documentation site and component workshop for Stardust, the Xplor
design system. A **no-build** static site (plain HTML/CSS/JS) published via GitHub Pages
from `docs/` on `main` → https://masonmaddy.github.io/stardust4/. There is no bundler,
framework, or compile step — files are served as-is.

**Becoming a product + design system:** beyond the design system itself, the repo now hosts an
*upstream product pipeline* of skills (`product-research` → `research-accuracy-review` →
`product-brief`) that help PMs turn
raw signal into research, briefs, and Jira/Confluence artifacts, feeding the existing prototyping
track. These skills mostly write to **Atlassian, not the repo**.

**Operating principle (front and centre):** AI automates the *manual* parts of product and design
work — gathering, collating, drafting, decomposing — to free people for what is irreducibly
human: creativity, judgement, and direct customer contact. Every skill keeps a human in the loop
and checks in at each step. AI never replaces the creative or customer-facing act; it clears the
path to it.

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
  `check-architecture.mjs`, `build-tokens-json.mjs --check`, `build-component-api.mjs --check`,
  `build-changelog.mjs --check`, `build-handoff.mjs --check`.

## Three contribution tracks

Work here falls into three tracks held to **different bars** — the differentiator is each
track's relationship to the source of truth. Two layers: **DS core** (the `ds-*` components +
`--sd-*` tokens — the system itself) and **DS consumers** (pages and prototypes built *on* the
core). Consumers reference the core and **must never inline-redefine a `ds-*` rule or a token**
(the architecture guard enforces this). If a page or prototype exposes a gap in the system,
that's a signal to open a **Track 1 (core)** change — not to patch around it locally.

| Track | Layer | Branch | Skills (in order) | Review bar |
|---|---|---|---|---|
| **1. Component** | core | `component/` | component-review → figma-component-builder → component-sandbox → sandbox-review → ds-component-doc (+ ds-token-pipeline, ds-component-api) | **Highest** — code-owner review required (CODEOWNERS), changelog row, full CI |
| **2. Page / content** | consumer | `page/` | ds-page-author, ds-site-setup | Medium — CI + a content read; self-merge |
| **3. Prototype + handover** | consumer | `proto/` | flow-prototype → dev-handoff | Lightest — on-token + CI; self-merge, moves fast |

Repo/process changes (CI, docs, governance) use `chore/`. The bars are enforced, not just
suggested: `.github/CODEOWNERS` requires a peer approval on any PR touching the DS core, while
consumer PRs self-merge once `checks` is green. The Figma-audit skills (`component-checker`,
`figma-component-review`, `figma-component-uplift`, `apollo-comparison`) are cross-cutting
support, not a track of their own.

**Upstream product pipeline (new).** `product-research` (with its `research-accuracy-review`
fact-check pass) and `product-brief` sit *before* design.
They mostly write to Atlassian (Confluence/Jira), not the repo — so branch+PR / CODEOWNERS govern
*building* these skills (use the `product/` branch prefix), not *running* them. See README
"Product pipeline".

## Task → skill map

The router for the tracks above. Component work follows a four-phase pipeline; do the phases in
order.

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
| Author a narrative site page (About / Foundations / Playbook / Resources) | — | `ds-page-author` |
| Prototype a multi-screen **user flow / journey** from a PRD / Figma / handoff — runnable, on tokens, across visual directions | — | `flow-prototype` (`docs/sandbox/`) |
| Hand an approved prototype to **devs** as a build spec (spec sheet + published handoff page, not a Figma file) | — | `dev-handoff` (`docs/sandbox/`) |
| Audit a Figma file / frames against the design system ("is this on-system?") | — | `component-checker` |
| Audit a Figma component (read-only) | — | `figma-component-review` |
| Audit **and** write fixes back to Figma | — | `figma-component-uplift` |
| Compare a component to Apollo (only when "Apollo" is named; read-only reference) | — | `apollo-comparison` |
| Gather + synthesise product research into a report (stakeholder idea, Canny, interviews) → Confluence; optionally open a discovery backlog card | — | `product-research` |
| Fact-check / QA a finished research report — verify every data point exists in Canny, no hallucinations, accurate + unbiased; append *Research accuracy findings* | — | `research-accuracy-review` |
| Turn research / a discovery initiative (Jira `XR`) into an Xplor product brief (Confluence) + slice into Jira epics | — | `product-brief` |

`nav.js` is the single source of truth for nav links; `ds-site-setup` owns it and the index
component grid. Adding a component to the site is a `ds-site-setup` task, not an ad-hoc edit.

## Subagents

Subagents you spawn load this file automatically — **except** the built-in `Explore` and
`Plan` agents, which skip `CLAUDE.md` for speed. When delegating to `Explore` or `Plan` in
this repo, restate the relevant hard rules in the task prompt (or tell them to read
`./CLAUDE.md` first), since they won't have it otherwise. All other agent types already do.

## Git & deploy

- **`main` is branch-protected — you cannot push to it directly.** Work on a short-lived
  branch and open a PR; the `checks` CI job must pass before merge. **Merging a PR to `main`
  is a production deploy** to GitHub Pages. See README "Collaborating" for the full flow.
- Start every session from the latest `main`, then branch:
  `git checkout main && git pull --rebase && git checkout -b <you>/<what>`. Commit small,
  push the branch, open the PR.
- Confirm review expectations with the repo owner for system-wide or refactor-scale changes
  (required approvals may be 0, but big changesets still warrant a look before merge).
- The architecture guard exists because the CSS-extraction has been silently reverted twice
  by concurrent sessions sharing the working tree — **one active session per working tree**
  (use `git worktree` for parallel work), re-verify working-tree state before you commit,
  and commit small.
