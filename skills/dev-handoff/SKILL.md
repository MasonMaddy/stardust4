---
name: dev-handoff
description: >
  Use this skill to turn an approved prototype (or set of screens) into a DEVELOPER HANDOFF
  that engineers — and build AGENTS — build from instead of a Figma file. From one source file
  it generates three synced artifacts: a human spec (`HANDOFF.md`), a published handoff page on
  the Stardust site (`handoff.html`), and a machine-readable agent export (`handover/*.json`:
  manifest, per-screen specs, flow graph, agent-checkable acceptance criteria, platform deltas).
  The runnable prototype stays the source of truth for pixels; the handoff carries everything a
  screenshot can't — behaviour, states, tokens, redlines, a11y, acceptance. Triggers include:
  "hand this off to devs", "spec this out for engineering", "build/dev handoff", "spec sheet for
  this flow", "redline this prototype", "what do the developers need to build this", "agent-readable
  spec", "turn this prototype into a structured export". Reach for it whenever a `flow-prototype`
  is approved and needs to cross to engineering. It is the downstream sibling of `flow-prototype`.
  NOT for authoring designs into Figma, NOT a component doc page (`ds-component-doc`), NOT the
  component-level API export (`ds-component-api`).
---

# Dev Handoff Skill

Turn an approved prototype into a **developer handoff package** engineers and build agents work
from **instead of a Figma file**. The prototype is already runnable, on real `--sd-*` tokens, and
URL-addressable — so the handoff doesn't redraw it. It **deep-links every screen and state to the
exact live prototype state** and adds the contract pixels can't carry.

**One source, generated outputs, zero drift.** You author **one file** —
`docs/sandbox/<flow>/handoff.source.json` — and `scripts/build-handoff.mjs` generates everything
else. Never hand-edit the generated files; a CI `--check` step fails the build if they drift.

```
docs/sandbox/<flow>/
  handoff.source.json      ← YOU AUTHOR THIS (the only editable handoff file)
  HANDOFF.md               ← generated: human spec
  handoff.html             ← generated: published page (site chrome)
  handover/                ← generated: agent-readable export
    manifest.json            screens · components→screens · resolved tokens · routes · tokenGaps
    screens/<id>.json        per-screen: copy · layout · redlines · behaviour · states · a11y · acceptance
    flows/<id>.json          entry/exit points · transitions (the state graph)
    acceptance-criteria.json flat, agent-checkable assertions
    platform-deltas.json     web / iOS / Android differences
```

**The prototype is the redline.** Pixel-exact values live in the running prototype (open the
deep-link, inspect in the browser). The source captures *spec-level* measurements (target heights,
spacing tokens, hit targets) — it never duplicates pixels.

**Why this works for an agent.** The export gives a build agent the three things prose can't:
**component identity** (`ds-btn` + DS version + variants, mapped to the screens it appears on),
a **machine-readable state graph** (`flows/*.json` — wire navigation/conditionals without
guessing), and **acceptance criteria as assertions** (`assert` strings the agent checks its own
output against). A DS-aware agent can go from `manifest.json` to a working build with minimal ambiguity.

```
Orient on the prototype → Scope → Author handoff.source.json → Generate → Verify → Review gate → Publish
```

---

## 1 — Orient on the prototype (first)

Name the **platform(s)** and **persona(s)** the build is for up front — from the prototype's own
Orient notes or `context/personas.md` + `context/product-map.md` — and check the cross-product
dependency list in `context/product-map.md`: any QikKids/Discover-fed data this flow consumes
belongs in the source's `dependencies` array with its missing-data behaviour.

Read the prototype you're handing off before authoring anything:

- **The flow** — `docs/sandbox/<flow>/`. Click every scenario, every direction, and the
  **error-states gallery** (`flow-prototype` puts every edge/empty/blocking state there).
- **The approved direction.** A handoff specs **one** direction — confirm the winning
  `VARIANT_META` index; that's the `direction.v` used to build every deep-link.
- **The behavioural truth** — the prototype's state machine (`buildStep`, `SCENARIOS`,
  transitions, validation, timing). This becomes `behaviour`, `states`, and `flowsGraph`.
- **Tokens & components** — which `--sd-*` and `ds-*` each screen uses. The generator resolves
  tokens against `tokens.css` and **auto-flags gaps** (`tokenGaps`) and **undeclared components**
  — but list the components you know about with their DS version and status (reuse/extend/build).
- **The PRD** — mine the "error & system states" matrix for `stateMatrix`, and pull
  **acceptance criteria** from it (phrase each as a testable `assert`).

Capture each screen's prototype **step** id — the generator turns it into
`?v=<dir>&step=<step>&device=…` deep-links (append `&bare=1` for chrome-free).

## 2 — Scope the handoff

One `AskUserQuestion` if unclear: which **direction** is approved, which **devices/platforms** are
in scope, and how much of the **state matrix** ships in v1. Don't spec screens the team hasn't
committed to.

---

## 3 — Author `handoff.source.json`

Copy `references/handoff.source.example.json` to `docs/sandbox/<flow>/handoff.source.json` and
edit it. **It is the only handoff file you edit.** `references/handoff.schema.json` is the full
field reference — **validate against it for real**, not mentally:

```
npx --yes ajv-cli@5 validate -s skills/dev-handoff/references/handoff.schema.json \
  -d docs/sandbox/<flow>/handoff.source.json
```

Key authoring rules:

- **`flow` must equal the folder name** under `docs/sandbox/`.
- **`version`/`date` come from the source, not the clock** — output is deterministic so `--check`
  is meaningful. Bump the version + add a `changelog` row on every change.
- **Copy is contract** — capture every string verbatim (`screens[].copy`); devs ship what's written.
- **Acceptance `assert` strings are the agent contract** — make them checkable
  ("`button[name=signin][disabled] while either field is empty`", not "validation works").
- **`step` per screen/state must resolve in the prototype** — it's how the dev/agent sees pixels.
- **Every screen declares its data story** — where its data comes from (including
  QikKids/Discover-fed fields via the `dependencies` array) and what it shows when that data is
  empty, loading, or errored. A screen spec with no empty/error behaviour is incomplete.
  **Always include the `dependencies` key** — an explicit `"dependencies": []` asserts "considered,
  none exist"; omitting it reads as "never considered" and `handoff-review` will flag it.
- **Figma is optional context** (`screens[].figma`), never required — the prototype is primary.

## 4 — Generate

```
node scripts/build-handoff.mjs           # regenerate all artifacts for every flow with a source
node scripts/build-handoff.mjs --check   # CI mode: fail if anything is stale or orphaned
```

The script wipes and recreates `handover/` each run (orphan cleanup) and overwrites `HANDOFF.md`
/ `handoff.html`. **Read the output:** it reports `tokenGaps`, `undeclaredComponents`, and
declared-but-unused components — fix those in the source (add the token to `tokens.css` via
`ds-token-pipeline`, or record the gap in `openQuestions`).

## 5 — Verify before presenting (these are the CI guards)

```
node scripts/build-handoff.mjs --check       # generated files in sync with the source
node scripts/check-links.mjs                  # every deep-link + asset path resolves
npx --yes html-validate@8 "docs/**/*.html"    # handoff.html validates (every <button> has a type)
node --check docs/assets/js/nav.js            # nav still parses after the link addition
```
Then **spot-check the deep-links live** with `preview_*`: open two or three screen/state URLs from
the generated page and confirm each lands on the state the spec describes. A handoff whose links
404 or land on the wrong screen is worse than none — be honest about which links you actually clicked.

## 5.5 — Review gate: run `handoff-review` (default-on)

Before publishing, run the **`handoff-review`** skill against the package — an independent pass by
a receiving-engineer lens ("could I build this without a single question?") and a delivery/QA lens
(AC completeness, state coverage, platform matrix, cross-system dependencies). Resolve any
Blockers before the nav link and PR. Skip only if the user explicitly declines.

## 6 — Publish

Add **one nav link** following `ds-site-setup`'s Phase B procedure — append a hardcoded object to
`SANDBOX_LINKS` in `docs/assets/js/nav.js` (Workshop section):
`{ label: '<Flow> — Handoff', href: BASE_PATH + '/sandbox/<flow>/handoff.html', status: 'dev' }`.
Hardcoded strings only, never `innerHTML`. nav.js is owned by `ds-site-setup`; this is the one
permitted single-link addition. Commit the source **and** the generated files together (CI checks
they match). `main` is branch-protected — commit on a branch and open a PR (direct pushes are
blocked); merging the PR is the live deploy.

---

## Hard rules

- **Never hand-edit generated files** (`HANDOFF.md`, `handoff.html`, `handover/*`). Edit the
  source and regenerate — CI `--check` enforces this.
- **Source is the single truth.** All three artifacts derive from it, so they can't drift.
- **Internal links/assets must resolve** (`check-links`) and **HTML must validate**
  (`html-validate`). Give every `<button>` a `type`; every TOC `#anchor` has a matching `id`
  (the generator handles this — don't break it by editing the HTML).
- **`--sd-*` tokens only** in the page's inline `<style>` — no hardcoded hex.
- Lives under `docs/`, so **merging to `main` deploys it live** (GitHub Pages).

## Reference files
- `references/handoff.source.example.json` — worked example (Playground sign-in). Copy per flow.
- `references/handoff.schema.json` — full field reference / JSON Schema for the source (validate
  with ajv, step 3). Includes the `dependencies` array for cross-system data feeds.
- `../handoff-review/SKILL.md` — the step 5.5 review gate.
- `context/product-map.md` · `context/personas.md` — platform/persona naming + the cross-product
  dependency checklist (step 1).
- `scripts/build-handoff.mjs` — the generator (owned here; CI runs it `--check`). Mirrors
  `build-component-api.mjs` conventions: no deps, deterministic, write / `--check`.

## Relationship to other skills

| Step | Skill |
|---|---|
| Build the runnable, multi-direction prototype | `flow-prototype` |
| **Spec it for engineering + agents (this skill)** | **`dev-handoff`** |
| Component doc page (anatomy, 10-section standard) | `ds-component-doc` |
| Component-level machine export (`api/*.json`, `llms.txt`) | `ds-component-api` |
| Add/change a token surfaced as a gap | `ds-token-pipeline` |
| Narrative site page | `ds-page-author` |

`dev-handoff` reuses `ds-page-author`'s page mechanics and `ds-site-setup`'s nav procedure; it
does not own the nav file or the site shell.
