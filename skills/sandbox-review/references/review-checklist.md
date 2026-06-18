# Sandbox Review — full checklist

The exhaustive rubric behind the `sandbox-review` skill. The skill summarises this;
read this file for the complete list when reviewing. Findings reference these items.

## Severity definitions

- **Blocker** — must be fixed before Build. Breaks a hard rule (CI would fail), an
  accessibility baseline, or a documented spec/decision-log requirement. Not negotiable.
- **Should-fix** — a real quality or consistency problem that a senior reviewer would
  not let through, but not a hard-rule violation. Fix unless there's a stated reason.
- **Nit** — polish, minor inconsistency, or a suggestion. Optional.

Every finding states: `severity` · `file:line` · the **rule/standard** it breaks · a
**concrete fix** (the exact token, attribute, or change). No vague findings.

---

## Lens 1 — Tokens & architecture (Senior Engineer)

Most of these are CI-enforced on `components/*.css` but **not** on the sandbox's inline
WIP CSS — so they are invisible until Build. Catch them here.

- [ ] **No hardcoded hex** in WIP CSS — every colour is `var(--sd-colour-*)`. (Blocker —
      `lint-hex.mjs` will fail at Build.) Demo-only scaffolding colours (swatch
      backgrounds illustrating a token) are tolerated only if clearly demo chrome, not
      component style; flag as Should-fix to confirm intent.
- [ ] **No raw font-weights** — uses `--sd-font-weight-{regular|medium|semibold|bold}`,
      never `400`/`500`/`600`/`700`. (Blocker)
- [ ] **No raw motion values** — durations/easings use
      `--sd-motion-duration-{fast|base|slow}` / `--sd-motion-easing-{default|standard}`,
      never `0.2s`/`ease-in-out`/cubic-bezier literals. (Blocker)
- [ ] **Every `--sd-*` referenced actually exists** in `tokens.css` (no typos, no invented
      names). (Blocker)
- [ ] **No `--xp-*` chrome variables** in component CSS — those are site chrome only.
      (Blocker)
- [ ] **Uses semantic tokens, not primitives** — e.g. `--sd-colour-action-primary`, not a
      raw teal primitive, where a semantic alias exists. (Should-fix)
- [ ] **Right token for the right purpose** — action vs accent vs feedback vs surface vs
      border vs text are not interchangeable. (Should-fix)
- [ ] **Extractable** — WIP component CSS is a self-contained block that can move to
      `docs/assets/css/components/[name].css` cleanly, with no dependency on sandbox demo
      selectors. (Blocker — Build depends on this.)
- [ ] **Composition links, never copies** — if the WIP composes built components, it
      links their `components/*.css` rather than re-declaring their `ds-*` rules.
      (Blocker — `check-architecture.mjs` will fail.)
- [ ] **Class naming** follows the `ds-*` / sibling convention; no leaked demo class names
      in component-level CSS. (Should-fix)
- [ ] **HTML validity** — every `<button>` has a `type`; semantic elements used; no
      duplicate IDs. (Blocker — `html-validate` will fail.)
- [ ] **No `innerHTML` / unsafe DOM** in any demo JS — build DOM safely (matches the
      `nav.js` rule). (Should-fix; Blocker if it handles any non-literal input.)

## Lens 2 — Accessibility (Senior Engineer)

- [ ] **Visible focus** — `:focus-visible` present on every interactive element, using
      `--sd-colour-border-focus`; never `outline: none` without a replacement. (Blocker)
- [ ] **Keyboard operable** — tab order works; activation on Enter/Space; no
      mouse-only interactions. (Blocker for interactive components)
- [ ] **ARIA / semantics** — correct roles, `aria-*` where native semantics are
      insufficient; labels associated (`for`/`aria-labelledby`); state communicated
      (`aria-checked`, `aria-disabled`, `aria-expanded`). (Blocker)
- [ ] **Contrast** — text and essential UI meet WCAG AA (4.5:1 text, 3:1 large/UI).
      Check the actual token values being used. (Blocker if failing)
- [ ] **Touch target** ≥ 44×44px (≤ 48px ideal) for interactive controls. (Should-fix)
- [ ] **Reduced motion** — any animation respects `@media (prefers-reduced-motion: reduce)`.
      (Should-fix)
- [ ] **Disabled semantics** — disabled controls are not focusable / are conveyed to AT,
      not merely greyed visually. (Should-fix)

## Lens 3 — Design consistency (Senior Designer)

- [ ] **Visual rhythm matches the library** — spacing, radius, and type scales use the
      same token steps as existing components; no off-scale values. (Should-fix)
- [ ] **State design is correct & complete** — hover/pressed/focus/disabled deltas follow
      the system pattern (e.g. action-hover/action-pressed for buttons), and read as a
      coherent family with sibling components. (Should-fix; Blocker if a required state is
      visually identical to another.)
- [ ] **Brand correctness** — primary action is teal (`--sd-colour-action-primary`),
      not coral; coral (`--xp-*`) is site chrome only. (Blocker)
- [ ] **Elevation / borders / surfaces** consistent with peers. (Nit/Should-fix)
- [ ] **Motion feels consistent** — same duration/easing tokens as comparable components.
      (Nit/Should-fix)
- [ ] **Variant matrix is visually coherent** — the type × size/shape cross-product reads
      as one system, no orphan styling. (Should-fix)
- [ ] **Figma fidelity (if node ID available)** — pull `get_design_context` /
      `get_screenshot` and compare the WIP to the source design; flag drift. (Should-fix)

## Lens 4 — Spec & states coverage (both)

- [ ] **Matches the spec** at `skills/figma-component-builder/references/[component]-spec.md`
      — every documented variant/state/token is present. (Blocker for omissions)
- [ ] **Honours the decision log** at `[component]-review.md` — every "Align/Adapt"
      decision is reflected; no reverted "Keep" decisions. (Blocker)
- [ ] **All states present** in the state grid: default, hover, focused, pressed, disabled,
      and any component-specific (error, selected, indeterminate…). (Blocker)
- [ ] **Variant matrix complete** — full cross-product, not a subset. (Should-fix)
- [ ] **Edge cases shown** — at minimum long text and empty/no-content; plus overflow,
      wrapping, RTL where relevant. (Should-fix)
- [ ] **Scale row** present if multiple sizes exist, aligned by baseline. (Nit)

---

## Report template

```markdown
## Sandbox Review — [Component] (Phase 3.5 gate)
Date: [YYYY-MM-DD]  ·  Source: docs/sandbox/index.html (WIP section)

**Verdict: READY TO BUILD ✅  /  CHANGES REQUIRED ❌**
Blockers: N · Should-fix: N · Nits: N

### Deterministic checks
| Check | Result |
|---|---|
| Hardcoded hex in WIP | ✅ none / ❌ N (lines …) |
| Raw font-weights | … |
| Raw motion values | … |
| Unknown --sd-* names | … |
| --xp-* leaks | … |
| html-validate | … |

### Blockers
1. **[title]** · `file:line` · _rule_ — finding. **Fix:** [concrete change].

### Should-fix
…

### Nits
…
```

Verdict rule: **any Blocker → CHANGES REQUIRED.** Only a clean Blocker list is Ready.
