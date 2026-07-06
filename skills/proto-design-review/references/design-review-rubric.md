# Prototype design review — full rubric

The exhaustive rubric behind `proto-design-review`. The skill summarises this; read this file for
the complete list when reviewing. Findings reference these items.

## Severity definitions

- **Blocker** — would embarrass the team in front of a stakeholder or mislead engineering: a
  broken hard rule (hex, `ds-*` re-declaration, token typo), an unusable state for the named
  persona (unreachable action, dead end, illegible text), a missing required state, or a wrong
  surface assumption (provider feature built service-level; shared-device flow that leaks a
  previous user). Must be fixed before capture/publish.
- **Should-fix** — a real craft or fit problem a senior designer wouldn't let through (off-rhythm
  spacing, inconsistent direction theming, weak hierarchy), but the prototype still communicates.
- **Nit** — polish. Optional.

Every finding states: `severity` · **where** (direction/step or `file:line`) · the **rule/standard**
broken · a **concrete fix**. No vague findings. Say what's working well, too — a review that only
lists faults teaches nothing about what to keep.

---

## Lens 1 — Visual craft & hierarchy (Reviewer A)

- [ ] **One focal point per screen.** Each step has a clear primary action and reading order;
      competing CTAs or three equal-weight elements → Should-fix.
- [ ] **Spacing rhythm.** Gaps step through the token scale consistently (section > group > item);
      arbitrary one-off values that break the rhythm → Should-fix.
- [ ] **Type hierarchy.** Title/subtitle/body/caption map to consistent token sizes/weights across
      screens; a screen that invents its own scale → Should-fix.
- [ ] **Alignment and optical balance.** Content blocks align to a consistent grid; centred
      screens (`center` flag) are genuinely balanced, not lopsided. (Should-fix)
- [ ] **Legibility.** Text over imagery/washes still meets contrast (check the `dark` treatments);
      truncation and wrapping behave at realistic content lengths. (Blocker if illegible)
- [ ] **Motion serves the flow.** Transitions guide attention (enter/exit make spatial sense) and
      use motion tokens; decorative motion that delays task completion on a reactive surface →
      Should-fix. Reduced-motion respected. (Should-fix)
- [ ] **Empty/edge content looks designed** — error and empty states get the same craft as the
      happy path, not default-styled leftovers. (Should-fix)

## Lens 2 — Persona & platform fit (Reviewer B — walk it as the named persona)

Judge against the surface's section of `context/design-ethos.md`:

- [ ] **The persona can complete the core task without instructions.** Walk it cold, as them.
      Any step where the persona would stall (jargon, ambiguous icon, hidden affordance relative
      to their tech comfort) → finding; a dead end → Blocker.
- [ ] **Playground App flows: "put the device down."** Count the taps/inputs to complete the
      compliance task; every input that could be inferred or defaulted is a finding. Interruption
      tolerance: abandon the flow mid-task, return — is progress preserved? Identity: is "acting
      as" visible and is user-switching fast? Previous user's data leaking on a shared device →
      Blocker.
- [ ] **Office flows: right altitude.** If the feature has a provider dimension (per
      `design-ethos.md` §BMS), the prototype either shows the provider view or explicitly scopes
      it out; bulk/destructive actions have confirm/undo and visible state. Provider question
      silently ignored → Blocker.
- [ ] **Home flows: one-handed, ring-aware, trustworthy.** Primary actions in thumb reach on
      phone; delegated-access context (whose child, which permission) explicit where relevant;
      the same fact consistent across screens (Martin's bar). (Should-fix; Blocker for
      wrong-child/permission ambiguity)
- [ ] **Hub flows: zero learning curve + kiosk discipline.** First-time-user walkable (Jeff);
      idle-reset/session-end behaviour designed; no previous family's data visible. (Blocker for
      data leakage or dead ends a staff member must rescue)
- [ ] **Touch targets ≥ 44px** on all interactive elements at the target device size; larger for
      Hub/kiosk. (Should-fix; Blocker if a primary action is realistically mis-tappable)
- [ ] **Copy fits the persona.** Reading level, tone, and terminology match (no system jargon for
      Sandra/Jeff; no patronising over-explanation for Priya/Angela). (Should-fix)
- [ ] **Compliance moments carry their duty.** Where the flow logs a regulated record
      (sign-in/out, sleep checks), attribution (who/when) is visible and the confirmation states
      exist (`context/sector-compliance.md`). (Blocker if a regulated record can be logged
      ambiguously)

## Lens 3 — Direction & system fit (Reviewer A)

- [ ] **Each direction is coherent end-to-end.** Its visual language (shell, dark treatment,
      accents) holds on *every* step — including the error gallery — not just the first screen.
      A direction themed only at the entry → Should-fix (the "don't theme only the first screen"
      rule).
- [ ] **Directions are meaningfully distinct.** Each explores a different idea (layout, tone,
      emphasis), not the same screen with a recoloured button; if two have converged, say so —
      recommend merging. (Should-fix)
- [ ] **On-system fidelity.** `ds-*` components used as built (correct variants, states, focus
      behaviour); visual rhythm consistent with the component library; brand correctness (teal
      actions, coral = chrome only). (Blocker for re-implemented `ds-*` behaviour or brand
      violations)
- [ ] **Token semantics.** Semantic tokens over primitives; action/feedback/surface/border/text
      tokens used for their purpose. (Should-fix)
- [ ] **A11y baseline** (shared with `sandbox-review` Lens 2): visible focus, keyboard/AT
      operability of the harness's interactive elements, contrast on every direction's palette.
      (Blocker for focus/contrast failures)

## Lens 4 — State & journey coverage (both reviewers)

- [ ] **The census is covered.** Every state in the PRD/brief matrix (plus the compliance-driven
      states from `error-states.md`) exists as an `e-*` step or scenario branch — the Step 2
      census gap count is zero, or each gap is explicitly waived at the scope gate. (Blocker for
      missing required states)
- [ ] **Every state is reachable and returns.** Gallery tiles open their state; back/primary
      actions return; direction-switching re-themes without resetting. (Should-fix)
- [ ] **Realistic content.** Names, long names, empty lists, many-item lists — not just the demo's
      three tidy entries. (Should-fix)
- [ ] **Cross-surface hand-offs acknowledged.** Where the flow's data comes from or lands on
      another surface (`context/product-map.md` checklist), the prototype shows or notes the seam
      (e.g. "configured in Office"). (Nit/Should-fix)
- [ ] **Scenario entry points match reality** — cold start vs returning vs error entry, per the
      PRD's behavioural truth. (Should-fix)
- [ ] **Self-consistency / spec drift.** Gallery states match their in-flow equivalents (copy,
      actions); the handoff source's screens/states/metrics match what's actually built; the
      flow's own stated "done" metric is verifiably true of the flow (count the taps). (Should-fix;
      Blocker if the handoff promises a state that doesn't exist)
- [ ] **Re-auth parity.** Lock screens and re-entry paths carry the same protections as first
      auth (attempt limits, lockout, identity confirmation) — an unattended-device path must
      never be the weaker one. (Blocker on a shared-device surface)
- [ ] **Source hygiene for handoff-bound artifacts.** Stale header comments, dead code branches,
      and wrong export names mislead the devs who will read this file. (Nit; Should-fix if the
      docs contradict the running behaviour)
- [ ] **Network-dependent demo assets degrade.** Placeholder-image services and remote assets
      have fallbacks (initials, local assets) so the prototype demos offline. (Nit)

---

## System gaps triage (the living-system mechanism)

For every element the design system couldn't serve, classify:

| Class | Test | Route |
|---|---|---|
| **(a) Reusable pattern** | Would ≥2 other flows plausibly need it? | One-paragraph component proposal → **Track 1**: `component/<name>` branch, start `component-review`. Local stand-in stays, clearly marked. |
| **(b) Genuinely novel** | Is it exploratory/expressive — an illustration, signature moment, bespoke viz? | **Hand it to the human:** "get creative in Figma / your tool, validate, bring it back as a Track 1 candidate." Don't generate the creative answer. |
| **(c) Mis-use** | Does the system already cover it? | Name the existing component/token; the local re-implementation is a **Blocker**. |

An empty System gaps section must say "none found" explicitly — silence reads as "not checked".

---

## Report template

```markdown
## Prototype design review — [Flow] (design review gate)
Date: [YYYY-MM-DD] · Source: docs/sandbox/<flow>/ · Persona(s): [named] · Surface: [named]
Directions reviewed: [list] · Reviewers: A (design craft) + B (persona walkthrough)

**Verdict: SHIP-READY ✅ / CHANGES REQUIRED ❌**
Blockers: N · Should-fix: N · Nits: N

### Deterministic checks
| Check | Result |
|---|---|
| Hardcoded hex | ✅ none / ❌ N (file:line …) |
| Raw font-weights / motion values | … |
| --xp-* leaks | … |
| Unknown --sd-* names | … |
| html-validate / check-architecture | … |
| State-coverage census | ✅ matrix covered / ❌ N missing: … |
| Direction × screen census | N directions × M steps; gaps: … |

### What's working well
- …

### Blockers
1. **[title]** · [direction/step or file:line] · _rule_ — finding. **Fix:** [concrete change].

### Should-fix
…

### Nits
…

### System gaps
- (a) Reusable: … → Track 1 proposal: …
- (b) Novel: … → creative exploration recommended: …
- (c) Mis-use: … → use `ds-…`
(or "none found")

### Coverage statement
Reviewed: [directions × steps × states, devices]. Not reviewed: [what and why].
```

Verdict rule: **any Blocker → CHANGES REQUIRED.** Only a clean Blocker list is SHIP-READY.
