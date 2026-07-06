---
name: component-review
description: >
  Use this skill when the user wants to review a component, compare a Figma component
  against Material Design 3, audit interaction design, or understand what changes are
  needed before building or updating. Triggers include: "let's review [component]",
  "how does [component] compare to MD3", "review my [component] against material design",
  "audit the [component]", "what would I need to change to align with MD3", "compare
  [component] to material design". This is Phase 1 of the component workshop workflow.
---

# Component Review Skill

This is **Phase 1** of the component workshop workflow:

```
Review → Spec → Sandbox → Build
```

Use this skill to produce a structured gap analysis and decision log before any spec
is written or sandbox is built. The output of this skill feeds directly into the Spec phase.

---

## Workflow overview

The four-phase workflow is triggered by natural language — Claude detects the phase:

| User says… | Phase | Skill |
|---|---|---|
| "review", "compare to MD3", "audit" | 1 — Review | **This skill** |
| "spec", "write up the spec", "spec it" | 2 — Spec | `figma-component-builder` (spec extraction mode) |
| "sandbox", "test it", "build the sandbox" | 3 — Sandbox | `component-sandbox` |
| "build it", "add to the design system", "we're happy" | 4 — Build | `ds-component-doc` |
| Component name only, no other context | Ask which phase | — |

---

## What to do

### Step 1 — Identify the component and review mode

Determine from context:
- **Component name**: what Figma component are we reviewing?
- **Surface context**: if the component is surface-specific (a kiosk control, a shared-device
  pattern, an admin bulk-action), note the surface ethos from `context/design-ethos.md` — it can
  justify a **Keep/Adapt** decision where MD3 assumes a personal device.
- **Review type**: Figma-only compliance check, or MD3 comparison?
  - If the user mentions "material design", "MD3", or "align" → MD3 comparison mode
  - Otherwise → Stardust spec compliance mode

### Step 2 — Pull the Figma component

If a Figma node ID is available (in a spec file at `skills/figma-component-builder/references/[component]-spec.md`
or provided by the user), use the Figma MCP tools:

1. `get_metadata` on the component's page node — lists all variant nodes
2. `get_design_context` on the component set node — retrieves structure, layout, tokens, screenshot

If no node ID is available, ask the user to provide the Figma URL or node ID.

### Step 3a — MD3 comparison (if requested)

Auto-fetch the MD3 specs and guidelines:

```
https://m3.material.io/components/[component-kebab-name]/specs
https://m3.material.io/components/[component-kebab-name]/guidelines
```

Use `WebFetch` for both URLs. If the pages are JS-rendered and return minimal content,
use your training knowledge of MD3 specifications for that component type and note
that the live page could not be fetched.

Summarise the MD3 approach covering:
- Visual specifications (size, radius, spacing, colour roles)
- State layer approach (hover, focus, pressed, disabled)
- Motion / animation (easing curves, durations)
- Interaction behaviour (keyboard, touch)
- Accessibility requirements

### Step 3b — Gap analysis

Compare the Figma component (or current Stardust spec) against MD3 (or Stardust standards).

For each difference found, create a **decision item** in this format:

```markdown
### Decision [N]: [Short title]

**Current (Figma/Stardust):** [describe current approach]
**Reference (MD3/Standard):** [describe the reference approach]
**Impact:** [Visual / Motion / Interaction / Token / None]
**Recommendation:** [Keep / Align / Adapt]
**Reason:** [1-2 sentences explaining the recommendation, considering Stardust's design language]
```

Present all decisions, then ask the user to confirm each one:
- **Keep** — retain the Stardust approach, don't align to MD3
- **Align** — adopt the MD3 approach as-is
- **Adapt** — adopt a modified version (user specifies the adaptation)

Wait for explicit confirmation before recording decisions. Do not assume.

### Step 4 — Output the decision log

Once all decisions are confirmed, produce a **decision log** summary:

```markdown
## Review Decision Log — [Component Name]
Date: [YYYY-MM-DD]
MD3 reference: [URL if applicable]

| # | Topic | Decision | Notes |
|---|---|---|---|
| 1 | [title] | Keep / Align / Adapt | [any user notes] |
| 2 | ... | ... | ... |

## Changes required for Spec phase
- [ ] [Specific change 1 needed in the spec]
- [ ] [Specific change 2...]
- [ ] [Any new tokens required]
- [ ] [Any Figma component updates needed]
```

Offer to save this as `skills/figma-component-builder/references/[component]-review.md`
and to proceed to the Spec phase.

---

## Tone

Be analytical and direct. Present evidence from both sides before making a recommendation.
Never change a design decision unilaterally — always get explicit confirmation.
Keep Stardust's identity in mind: not every MD3 choice is right for this system.
When MD3 and Stardust diverge by design (e.g. colour token approach, touch targets),
note it and default to **Keep** unless the user requests alignment.

---

## Reference files

- `skills/figma-component-builder/references/component-spec.md` — Stardust page template standard
- `skills/figma-component-builder/references/token-cheatsheet.md` — legacy token name mappings
- `skills/figma-component-builder/references/[component]-spec.md` — existing spec if built
