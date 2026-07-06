# Stardust Design System — agent orientation

Read this first, every session. It is the contract for working in this repo. For full
detail see `README.md`; this file is the short, enforceable version.

**What this is:** the documentation site and component workshop for Stardust, the Xplor
design system. A **no-build** static site (plain HTML/CSS/JS) published via GitHub Pages
from `docs/` on `main` → https://masonmaddy.github.io/stardust4/. There is no bundler,
framework, or compile step — files are served as-is.

**A product + design system:** beyond the design system itself, the repo hosts an *upstream
product pipeline* of skills (`product-research` → `research-accuracy-review` →
`discovery-backlog-card` → `product-brief` → `brief-review`) that help PMs turn raw signal into
research, briefs, and Jira/Confluence artifacts, feeding the prototyping track. These skills
mostly write to **Atlassian, not the repo**.

**Operating principle (front and centre):** AI automates the *manual* parts of product and design
work — gathering, collating, drafting, decomposing — to free people for what is irreducibly
human: creativity, judgement, and direct customer contact. Every skill keeps a human in the loop
and checks in at each step. AI never replaces the creative or customer-facing act; it clears the
path to it. When the design system can't serve a need, don't patch around it: route reusable
gaps to Track 1, and hand genuinely novel design moments to the human ("get creative in Figma").

## Product snapshot

Xplor Education software, two spaces. Depth lives in **`context/`** — load `context/README.md`
before any product-facing work (research, brief, prototype, handoff, review) and follow its
routing table. Canonical persona source: `context/personas.md` (its human rendering is
`docs/foundations/personas.html` — edit the markdown first, mirror the page in the same PR).

| Surface | Who | Ethos in one line |
|---|---|---|
| **Office** (BMS, web) | Sandra (service admin) · Priya (provider admin) | Two altitudes — always ask "does this need the provider level?" |
| **Playground Web** | Educators, practice leads | Proactive: sit down and work (EYLF docs, planning) |
| **Playground App** | Educators, **shared in-room device** | Reactive compliance: minimum taps, put the device down |
| **Home** (iOS/Android) | Parents + guardians/grandparents/pickups | Nurture it — trust, one-handed, delegated access |
| **Hub** (entry kiosk) | Whoever drops off | Zero learning curve, kiosk-clean sessions |

QikKids + Discover (NZ) feed data into Playground/Home — design never happens in them, but every
PES design answers the cross-product checklist in `context/product-map.md`. AU and NZ differ
materially on compliance and funding (`context/sector-compliance.md`) — never conflate them.

## How we think

- **Persona-first.** The unit of work is a named persona's task on a named surface — never "a
  screen". If you can't name who it's for and where they'd feel it, you're not ready to build.
- **Evidence over adjectives.** Claims trace to sources; unsourced claims are hypotheses and say
  so; metrics have baselines, targets, and an observable surface.
- **The quality bar is a review gate, not a feeling.** "Would a principal PM/designer sign this?"
  — if unsure, run the matching review skill (they're default-on in their pipelines). Working
  and well-designed are different properties; verify both.
- **Push back when the inputs are wrong:** a solution-first brief (find the problem first), an
  Office design that ignores the provider level, a Playground App flow that keeps educators on
  the device, an off-system local patch (Track 1 instead), an unverifiable claim, AU/NZ
  conflation. Saying "this isn't ready" politely is part of the job.
- **Honesty about coverage.** Report what you actually verified — "spot-checked 2 of 7" beats
  implying all 7. Every review ends with a coverage/integrity statement.

## Orient before you act

1. Skim `README.md` (architecture, conventions, token chain).
2. Identify the task type and load the matching skill (table below) — don't freehand work
   a skill already encodes.
3. Product-facing work? Load `context/README.md` and follow its routing table.
4. Touching a component? Read its CSS in `docs/assets/css/components/<name>.css` first.

## Hard rules (CI enforces these — a violation fails the build)

- **No hardcoded hex in shared component CSS.** Reference `--sd-*` tokens only.
  (`scripts/lint-hex.mjs`)
- **Component CSS is the single source of truth.** Doc pages must `<link>` the shared file
  from `docs/assets/css/components/`; never re-declare a `ds-*` rule inline on a page.
  Composed components must also link their dependencies. (`scripts/check-architecture.mjs`)
- **Tokens stay in sync.** After editing `tokens.css`, run `node scripts/build-tokens-json.mjs`
  to regenerate `docs/tokens/stardust.tokens.json`; CI fails if they drift. Never hand-edit
  the JSON. Token CSS variable *names* are the stable contract — values may change on a
  Figma re-sync, names never do. Every `var(--sd-*)` a component references must resolve to a
  defined token (`scripts/check-token-refs.mjs`).
- **`nav.js` builds DOM with `createElement`/`createTextNode` from hardcoded strings only —
  never `innerHTML`.** (See the header comment in that file.) CI syntax-checks it.
- **Every component doc page carries a changelog table — add a row for every change.**
- **Internal links/assets must resolve** (`scripts/check-links.mjs`) and **HTML must validate**
  (`html-validate`). Give every `<button>` a `type`. Icon-browser SVG references (the JS arrays
  in `icons.html`) must exist on disk (`scripts/check-icon-assets.mjs`).
- **No confidential drafts in git.** This repo is **public**. Product-pipeline research drafts
  (`session-notes/`, `*-research-report.md`) carry customer voice — they are gitignored and CI
  fails if any are committed; they publish to Confluence, never to git. Secret scanning
  (gitleaks) runs on every PR. Never commit `.env` or `.mcp.json`.

## Architecture quick reference

- **Tokens** (`docs/assets/css/tokens.css`) are two-tier: primitives → semantic aliases.
  Mostly synced from Figma; a trailing CSS-first section (font weights, motion, z-index) is
  preserved across syncs.
- **Component CSS** lives in `docs/assets/css/components/<name>.css`. Pages keep only
  page-chrome/demo styles inline.
- `main.css` is **site chrome only** (`--xp-*` vars) — not part of the design system. Don't
  confuse `--xp-*` (chrome) with `--sd-*` (design tokens).
- **Run all CI checks locally before pushing:** `lint-hex.mjs`, `check-token-refs.mjs`,
  `check-links.mjs`, `check-icon-assets.mjs`, `check-architecture.mjs`, `check-skill-refs.mjs`,
  `build-tokens-json.mjs --check`, `build-component-api.mjs --check`,
  `build-changelog.mjs --check`, `build-handoff.mjs --check`. (Secret scanning + the
  confidential-drafts guard run in CI only.)

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
| **2. Page / content** | consumer | `page/` | ds-page-author, ds-site-setup | Medium — CI + a content read; self-merge (Foundations pages + nav.js need a code-owner approval) |
| **3. Prototype + handover** | consumer | `proto/` | flow-prototype → proto-design-review → dev-handoff → handoff-review | Lightest — on-token + CI + design/spec gates; self-merge, moves fast |

Repo/process changes (CI, docs, governance) use `chore/`. The bars are enforced, not just
suggested: `.github/CODEOWNERS` requires a peer approval on any PR touching anything that
**defines or guards the system** — DS core (shared CSS, component doc pages, tokens, exports),
Foundations pages, shared site JS, the process layer (`skills/`, `CLAUDE.md`, `context/`), and
the guardrails (`scripts/`, `.github/`) — while artifact PRs (prototypes, handoffs, briefs,
sandbox, non-Foundations content) self-merge once `checks` is green. The Figma-audit skills (`component-checker`,
`figma-component-review`, `figma-component-uplift`, `apollo-comparison`) are cross-cutting
support, not a track of their own.

**Upstream product pipeline.** `product-research` (with its `research-accuracy-review`
fact-check pass) → `discovery-backlog-card` → `product-brief` (with its `brief-review` critique
gate) sit *before* design. They mostly write to Atlassian (Confluence/Jira), not the repo — so
branch+PR / CODEOWNERS govern *building* these skills (use the `product/` branch prefix), not
*running* them. See README "Product pipeline".

**Review gates are default-on.** Every pipeline has an independent adversarial review before its
artifact ships: `sandbox-review` (component WIPs), `proto-design-review` (flow prototypes),
`handoff-review` (dev handoffs), `brief-review` (briefs), `research-accuracy-review` (research).
Skipping one requires the user to decline explicitly. Never ship past an open Blocker.

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
| **Design-review a flow prototype** ("second designer") — craft, persona walkthrough, System-gaps triage; gates flow-prototype before capture/publish | Gate | `proto-design-review` |
| Hand an approved prototype to **devs** as a build spec (spec sheet + published handoff page, not a Figma file) | — | `dev-handoff` (`docs/sandbox/`) |
| **QA a handoff package** — receiving-engineer + delivery/QA lenses, schema validation; gates dev-handoff before publish | Gate | `handoff-review` |
| Audit a Figma file / frames against the design system ("is this on-system?") | — | `component-checker` |
| Audit a Figma component (read-only) | — | `figma-component-review` |
| Audit **and** write fixes back to Figma | — | `figma-component-uplift` |
| Compare a component to Apollo (only when "Apollo" is named; read-only reference) | — | `apollo-comparison` |
| Gather + synthesise product research into a report (stakeholder idea, Canny, interviews) → Confluence; hand off to `discovery-backlog-card` when discovery is incomplete | — | `product-research` |
| Fact-check / QA a finished research report — verify every data point exists in Canny, no hallucinations, accurate + unbiased; append *Research accuracy findings* | — | `research-accuracy-review` |
| Turn a research report / opportunity into a short discovery backlog card (Jira `XR` Initiative, *In discovery*) — a vision-canvas snapshot with AARRR success metrics, linking out to the report/brief. Runs standalone or after research | — | `discovery-backlog-card` |
| Turn research / a discovery initiative (Jira `XR`) into an Xplor product brief (Confluence) + slice into Jira epics | — | `product-brief` |
| **Critique a product brief** — principal-PM + eng lenses, evidence traceability, slicing sanity; gates product-brief before publish | Gate | `brief-review` |
| Turn a finished feature — or a release bundling several — into the full set of launch comms (Fact Sheet, customer release notes, customer guide, sales one-pager, support FAQ, internal announcement, pre-launch drip campaign), each drafted from a per-feature Fact Sheet → Confluence | — | `release-comms` |

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
