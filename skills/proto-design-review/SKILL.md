---
name: proto-design-review
description: >
  Use this skill to review a FLOW PROTOTYPE's design quality before it is captured, published, or
  handed to engineering — an independent second product designer reviewing someone else's
  prototype in docs/sandbox/. It judges what the technical verify loop can't: visual hierarchy and
  craft, direction consistency, persona fit and platform conventions (shared-device Playground,
  provider-level Office, kiosk Hub, one-handed Home), state coverage, and design-system fit — with
  a "System gaps" triage that routes reusable gaps to Track 1 and tells the user when to get
  creative in Figma. Triggers: "design-review this prototype", "second designer pass", "is this
  flow well designed", "critique the prototype", "review the flow design", "is this ready to
  publish/hand off". Runs automatically as flow-prototype's design review gate. NOT for
  component-level WIPs (`sandbox-review`), specs (`handoff-review`), or briefs (`brief-review`).
---

# proto-design-review

The **second designer**. `flow-prototype`'s verify loop proves a prototype *works* — console
clean, tokens resolve, DOM asserts. Nothing there judges whether it's *well designed*. This skill
reviews like a senior product designer who didn't build it: craft, coherence, and whether the
right persona can actually live in it — then hands back a severity-ranked report and a verdict.

**Where this sits:**
`flow-prototype (build + verify) → ` **proto-design-review** ` → capture / publish → dev-handoff`

**Operating principle (non-negotiable):** AI does the exhaustive part — walking every screen in
every direction, checking every state against the matrix — so the human keeps the creative
judgement. When the design system can't serve a need, this skill doesn't patch around it: it
routes the gap to Track 1 or **hands the creative moment to the user** (see System gaps).

**Default behaviour: report, then offer to fix.** Never capture a deck or open the publish PR
with an open Blocker.

The full rubric and report template live in `references/design-review-rubric.md` — read it first.

## Step 1 — Identify the flow and gather inputs

1. Locate the prototype: `docs/sandbox/<flow>/` (`index.html`, `<flow>.jsx`, `helpers.jsx`).
   Flows often carry several iterations (a multi-direction comparison board, `version-0.x/`
   folders, device variants) — **resolve the canonical one** via `handoff.source.json`'s
   `prototypeBase` if present, else the nav.js label, and state the choice in the report header.
   Enumerate its directions (`VARIANT_META` — post-lock prototypes have one; the
   direction-distinctiveness item then doesn't apply), scenarios, and steps (including the `e-*`
   error-gallery steps).
2. Read the **intent truth**: the PRD/brief behind it (including the Stardust appendix if it came
   through `product-brief`) and its error/system-states matrix.
3. Read the **product truth** from `context/`: `personas.md` (the named persona(s)),
   `design-ethos.md` (the target surface's section — this is the standard for Lens 2), and
   `product-map.md` if cross-surface hand-offs are in play. If the flow touches compliance,
   skim `context/sector-compliance.md`.
4. Load `docs/assets/css/tokens.css` and the linked `ds-*` component CSS for the fit checks.

If the prototype names no persona or surface (no Orient notes, none in the PRD), that's your
first finding — the review can still run, but against an assumed persona you must name.

## Step 2 — Deterministic pre-checks (exact, not judgment)

Run these first and record `file:line` results, so the reviewers start from facts. Scope to
`docs/sandbox/<flow>/`:

```bash
# Hardcoded hex outside tokens.css (flag for judgment — demo chrome may pass, screen UI may not)
grep -rniE '#[0-9a-f]{3,6}\b' docs/sandbox/<flow>/ --include='*.html' --include='*.jsx'

# Raw font-weights / raw motion values (should be --sd-font-weight-* / --sd-motion-*)
grep -rniE 'font-weight:\s*(400|500|600|700|800|900|bold|normal)' docs/sandbox/<flow>/
grep -rniE '(transition|animation)[^;]*((0?\.[0-9]+|[0-9]+)m?s|cubic-bezier)' docs/sandbox/<flow>/

# Chrome variables leaking into the prototype
grep -rnE '\-\-xp-' docs/sandbox/<flow>/

# HTML validity + architecture (no ds-* re-declarations)
npx --yes html-validate@8 docs/sandbox/<flow>/index.html
node scripts/check-architecture.mjs
```

The hex/motion greps **always fire on prototypes** — triage hits in this order: asset SVGs
(brand marks, illustrations) → harness/device-frame chrome → **in-screen UI** (the only class
that's usually a finding). A motion literal the token scale *can't express* is a System-gaps
candidate, not a violation.

- **Token resolution:** every `var(--sd-*)` referenced in the flow resolves in `tokens.css`.
- **State-coverage census:** list the states the PRD matrix requires vs the `e-*` steps +
  scenario branches the harness actually implements. If a `handoff.source.json` exists, census
  **both** its `stateMatrix` and its `screens[].states` — they can disagree, and each gap counts.
  Report the gap count — this is a count, not an opinion.
- **Direction × screen census:** directions × steps = the review surface; note any step that
  only renders in some directions.

## Step 3 — Spawn the two reviewers (independent, parallel)

Launch **two subagents in one message**. Each gets: the flow folder paths, the pre-check facts,
the PRD/states matrix, the relevant `context/` files, and `references/design-review-rubric.md`.
Restate the lens and the structured-findings contract (`severity` · `where` (direction/step or
file:line) · rule · concrete fix). Where a live server is available, reviewers should verify
claims against the running prototype (`preview_*`, URL-addressable states); otherwise from source.

**Reviewer A — Second senior product designer.** *"You are a senior product designer reviewing a
colleague's prototype before it ships to stakeholders. You did not build it. Be adversarial —
assume there are craft problems and find them."* Lenses 1 (Visual craft & hierarchy), 3
(Direction & system fit), and the design half of Lens 4. Judge against the surface's section of
`context/design-ethos.md`.

**Reviewer B — Persona walkthrough reviewer.** *"You are [named persona] — walk this flow as
them, on their device, in their context. Then step out and report as a UX reviewer."* Default
benchmark personas per surface (from `context/personas.md`): Playground App → **Emily** ("put the
device down"); Home → **James** (mainstream) with **Jeff** for accessibility; Hub → **Jeff**
(zero learning curve); Office → **Sandra** (guided) and **Priya** (provider altitude). Lens 2
(Persona & platform fit) and Lens 4 (State & journey coverage): interruption tolerance on a
shared device, provider-level altitude on Office, kiosk idle/reset on Hub, one-handed reach on
Home, touch targets, jargon, dead ends, and the error-gallery walked state by state.

## Step 4 — Synthesise one report + the System gaps triage

Merge pre-checks and both reviewers' findings; dedupe; order by severity (Blocker / Should-fix /
Nit — definitions in the rubric). Then write the **System gaps** section — every place the design
system couldn't serve the flow, triaged three ways:

- **(a) Reusable pattern** — the flow needed something generic (a stepper, a segmented control, an
  empty-state pattern) that other flows will need too. Draft a one-paragraph component proposal
  and route it to **Track 1**: *"open a `component/<name>` branch and start with
  `component-review`."* The prototype may keep a clearly-marked local stand-in meanwhile.
- **(b) Genuinely novel** — the need is real but exploratory (an illustration, a bespoke
  visualisation, a signature moment). **Tell the user to get creative:** *"the system can't answer
  this yet — this is a design moment, not a token lookup. Explore it in Figma (or your tool of
  choice), validate the direction, and bring the result back as a Track 1 candidate."* AI clears
  the path here; it doesn't do the creating.
- **(c) Mis-use** — the system already covers it; name the component/token the flow should use
  instead. Local re-implementations of existing `ds-*` behaviour are Blockers (the architecture
  rule), not gaps.

**Verdict rule: any Blocker → CHANGES REQUIRED; a clean Blocker list → SHIP-READY.** Don't soften
a Blocker into a suggestion. End with a **coverage statement**: which directions × screens ×
states were actually reviewed, and what wasn't ("reviewed 3 directions × 7 steps on phone; tablet
landscape not walked") — per the honesty rule, never imply more coverage than happened.

## Step 5 — Offer to fix, then re-verify

Present the report; ask before changing anything. Default to fixing Blockers and Should-fix
items; leave Nits unless told otherwise. After fixes: **re-run Step 2** and re-verify affected
screens in the browser (`flow-prototype`'s verify loop), then restate the verdict. Only at
SHIP-READY should `flow-prototype` proceed to capture/publish — this skill gates, it doesn't
publish.

## When this runs

- **Automatically** — `flow-prototype`'s design review gate (after the verify loop, before
  capture/publish; default-on).
- **Explicitly** — any trigger phrase, against any existing `docs/sandbox/<flow>/`.

## Hard rules

- **Independent eyes.** Reviewers run as subagents that did not build the prototype; don't let
  the build conversation anchor them.
- **Named persona or named assumption.** A review "for users" is not a review.
- **No invented findings** — a clean report ("0 Blockers") is a valid outcome; say what's working
  too, not just what's broken.
- **Never patch a DS gap silently.** Gaps route to Track 1 or to the user's creativity — local
  inline `ds-*` re-declarations are Blockers.
- **Honest coverage, always.** State exactly what was and wasn't walked.
- Component WIPs are `sandbox-review`; handoff packages are `handoff-review`; briefs are
  `brief-review`.

## Reference files

- `references/design-review-rubric.md` — the 4-lens rubric, severity definitions, System-gaps
  triage, report template.
- `context/design-ethos.md` · `context/personas.md` · `context/product-map.md` ·
  `context/sector-compliance.md` — the standards the review judges against.
- `../flow-prototype/references/error-states.md` — the state-gallery pattern (Lens 4).
- `../flow-prototype/references/conventions.md` — the harness architecture being reviewed.
- `../sandbox-review/references/review-checklist.md` — the component-level sibling rubric (token
  and a11y items apply here too).
