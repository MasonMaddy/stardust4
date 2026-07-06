---
name: handoff-review
description: >
  Use this skill to QA a DEVELOPER HANDOFF package (handoff.source.json + generated HANDOFF.md /
  handoff.html / handover/*.json) before it is published to engineering — an independent review by
  a receiving-engineer lens ("could I build this without a single question?") and a delivery/QA
  lens (acceptance-criteria completeness, state coverage, platform matrix, cross-system
  dependencies). Triggers: "review the handoff", "QA the spec", "is this handoff ready",
  "spec review", "would engineering be blocked by this", "check the handover package". Runs
  automatically as dev-handoff's step 5.5 review gate. NOT for authoring handoffs (`dev-handoff`),
  reviewing prototypes (`proto-design-review`), or briefs (`brief-review`).
---

# handoff-review

The **receiving engineer's pass** over a handoff package. `dev-handoff` authored the spec; this
skill reads it the way the build team will — hunting for the ambiguity, the missing state, the
undeclared data source that becomes next sprint's "quick question" thread. A handoff is done when
an engineer (or build agent) can go from `manifest.json` to a working build **without asking a
single question**.

**Where this sits:**
`flow-prototype → proto-design-review → dev-handoff → ` **handoff-review** ` → publish → engineering`

**Operating principle (non-negotiable):** AI does the exhaustive part — validating the schema,
walking every deep-link, cross-counting screens — so humans keep the judgement. This skill
**verifies; it does not author.** Fixes go into `handoff.source.json` and are regenerated — never
into generated files.

**Default behaviour: report, then offer to fix.** Never publish with an open Blocker.

## Step 1 — Orient and gather inputs

1. Locate the package: `docs/sandbox/<flow>/handoff.source.json` + generated `HANDOFF.md`,
   `handoff.html`, `handover/`.
2. Read the **prototype** it specs (`docs/sandbox/<flow>/`) — the spec is judged against the
   running truth, not in a vacuum. Note the approved direction (`direction.v`).
3. Read the upstream **PRD/brief** (states matrix, acceptance criteria) and, from `context/`:
   `product-map.md` (cross-product dependency checklist) and `personas.md` (whose task this is).
   If the PRD isn't in the repo (research drafts publish to Confluence and are gitignored), the
   sanctioned fallback is the prototype's own truth: its `e-*` error gallery + the flow's brief
   (`variants-brief.md` or equivalent) — and say so in the integrity statement.
4. Check `proto-design-review` ran on the prototype (its report or the flow-prototype
   conversation). An unreviewed prototype doesn't block a spec review, but note it.

## Step 2 — Deterministic pre-checks (exact, not judgment)

```bash
# Real schema validation (replaces "validate mentally")
npx --yes ajv-cli@5 validate -s skills/dev-handoff/references/handoff.schema.json \
  -d docs/sandbox/<flow>/handoff.source.json

# Generated artifacts in sync with the source
node scripts/build-handoff.mjs --check

# Links + HTML validity on the published page
node scripts/check-links.mjs
npx --yes html-validate@8 docs/sandbox/<flow>/handoff.html
```

- **Token existence:** every token named in the source (`tokens`, `screens[].tokens`) exists in
  `docs/assets/css/tokens.css`; the generator's `tokenGaps` output is empty or each gap has an
  `openQuestions` row.
- **Screen-count parity:** steps in the prototype harness vs `screens[]` entries in the source —
  report the diff (unspecced screens, or spec entries with no prototype state).
- **Deep-link spot-check:** open a sample of screen/state deep-links live (`preview_*`) and
  confirm each lands where the spec says. Record which were actually clicked. **No live server?**
  The sanctioned static fallback: verify every deep-link's `step` id resolves to a handler in the
  prototype source and the URL is well-formed — and the integrity statement must say "statically
  verified, not clicked". Also check deep-links cover **every declared device** (a spec declaring
  `ipad` whose links are all `device=phone` is a finding).
- **Acceptance shape:** every `acceptance[].assert`-style criterion is machine-checkable (names a
  selector/condition), not prose ("validation works"). Count offenders.

## Step 3 — Spawn the two reviewers (independent, parallel)

Launch **two subagents in one message**. Each gets: the source JSON, `HANDOFF.md`, the pre-check
facts, the PRD states matrix, the relevant `context/` files, and
`references/handoff-review-checklist.md`. Restate the lens and findings contract
(`severity` · `where` (screen id / section) · rule · concrete fix).

**Reviewer A — Senior front-end engineer receiving this spec.** *"You are the engineer who must
build this next sprint without access to the designer. Read the spec as the enemy of your
estimate: list every question you would have to ask."* Hunts: ambiguous measurements, unspecified
interactions (focus order, keyboard, loading timing), missing responsive/motion notes, undeclared
data sources, copy that can't be shipped verbatim, component status (reuse/extend/build) that
doesn't match reality.

**Reviewer B — Delivery/QA lead.** *"You must write the test plan and call this done. What can't
you verify?"* Hunts: acceptance-criteria completeness per screen (every behaviour has an
assertion), error/empty/loading states specced (not just happy path), platform matrix honesty
(iOS+Android deltas for Home flows; shared-device notes for Playground), **cross-system
dependency check** — QikKids/Discover-fed data named in `dependencies` with missing-data
behaviour, NZ variants flagged where the flow is jurisdiction-sensitive
(`context/product-map.md`, `context/sector-compliance.md`).

## Step 4 — Synthesise one report

Merge; dedupe; order by severity (definitions in the checklist). **Verdict rule: any Blocker →
CHANGES REQUIRED; a clean Blocker list → READY TO HAND OFF.** End with an **integrity statement**:
deep-links actually clicked vs total, screens read in full vs skimmed, what couldn't be verified.

## Step 5 — Offer to fix, then re-verify

Fixes go in **`handoff.source.json` only**, then `node scripts/build-handoff.mjs` regenerates and
Step 2 re-runs. Bump the source `version` + changelog row (the authoring rule). Restate the
verdict; only READY TO HAND OFF proceeds to `dev-handoff` step 6 (nav link + PR).

## When this runs

- **Automatically** — `dev-handoff` step 5.5, before publish (default-on).
- **Explicitly** — any trigger phrase, against any existing handoff package (including published
  ones — findings then feed a version bump).

## Hard rules

- **Never edit generated files.** Source → regenerate, always.
- **Machine-checkable or it isn't acceptance.** Prose ACs are findings.
- **Every consumed field has a missing-data story** — especially integration-fed ones.
- **Honest link coverage** — say exactly which deep-links were clicked; "all links work" after
  clicking three of thirty is a false report.
- **No invented findings** — "0 Blockers, ship it" is a valid outcome.
- Prototype design is `proto-design-review`; authoring is `dev-handoff`; component docs are
  `ds-component-doc`.

## Reference files

- `references/handoff-review-checklist.md` — the 2-lens checklist, severity definitions, report
  template.
- `../dev-handoff/references/handoff.schema.json` — the schema ajv validates against.
- `../dev-handoff/SKILL.md` — the authoring contract this reviews.
- `context/product-map.md` · `context/personas.md` · `context/sector-compliance.md` — dependency
  checklist, persona naming, jurisdiction facts.
