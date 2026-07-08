---
name: figma-component-builder
description: "Use this skill whenever a designer says they are about to build a component in Figma, asks what they need to know to create a component, asks for a component brief or spec, or asks to be briefed on a component. Also use this skill in Spec extraction mode (Phase 2 of the component workshop workflow) when the user says 'create the spec', 'spec it out', or 'let's write up the spec' after a review session. Triggers include: I am about to create a component, give me the spec for a component, what do I need to know to build a component, help me build a component in Figma, brief me on a component, create the spec, spec it out. Always use this skill when a component name is mentioned alongside intent to build it or spec it."
---

# Figma Component Builder

This skill operates in **two modes**:

## Mode 1 — Build Brief (pre-design)
When a designer is about to open Figma and needs a complete build guide.
Trigger: "brief me on [component]", "what do I need to know to build [component]"

## Mode 2 — Spec Extraction (post-review, Phase 2 of the workshop workflow)
When a review has been completed and a spec document needs to be generated.
Trigger: "create the spec", "spec it out", "let's write up the spec"

```
Review → Spec ← you are here → Sandbox → Build
```

### Spec Extraction mode — what to do

1. Check for a review decision log at `skills/figma-component-builder/references/[component]-review.md`
2. Pull full Figma metadata: `get_metadata` + `get_design_context` on the component node
3. Generate `skills/figma-component-builder/references/[component]-spec.md` — the canonical spec
   using the decisions from the review log as the source of truth
4. The spec must cover all sections from `references/component-spec.md` (the template standard):
   anatomy, variants, states, tokens, motion, usage, accessibility, engineering interface
5. Also generate the pre-filled content sections that will be used in the Build phase:
   anatomy SVG description, variant matrix layout, state token table, motion spec table
6. Output: save the spec file and summarise what's been captured, then offer to proceed to
   the Sandbox phase

---

## Mode 1 — Build Brief

When a designer asks for a brief on how to build a specific component, your job is to give them a complete, actionable build guide — everything they need before they open Figma, so they don't have to stop and think once they start.

## What to do

1. **Read the reference files** relevant to this component:
   - `references/token-architecture.md` — always read this
   - `references/token-cheatsheet.md` — always read this (legacy token names for build briefs)
   - `references/component-spec.md` — always read this
   - `references/component-catalogue.md` — check for this component's specific variant requirements
   - `context/design-ethos.md` — only if the component is surface-specific (kiosk, shared device,
     provider-level admin); its conventions (touch targets, session behaviour) belong in the brief

2. **Identify the component** from the user's message. Match it to the catalogue if it exists there. If it doesn't exist in the catalogue, use the spec standard to infer what it needs.

3. **Generate the build brief** using the format below.

---

## Token system (must follow)

This library uses the **legacy Stardust uplift** token model:

| Tier | Figma collection | Use in components? | Example |
|---|---|---|---|
| Primitive | `base` | **No** | `colour/cyan/700`, `spacing/4`, `radius/m` |
| Semantic | `value` | **Yes** | `Color/primary`, `Color/text-primary`, `spacing/component-m` |
| Component | optional | **Yes** | `button/background/hover` → aliases `Color/primary-hover` |

**Rules for every build brief:**
- Colour and spacing on components → **`Color/*`** and **`spacing/*`** from the `value` collection
- Radius → **`radius/*`** from `base` (no semantic radius tier yet — primitive is acceptable)
- Typography → published **Figma text styles** (built from `font/font-size/*`, `font/weight/*`, `font/line-height/*`)
- **Never** use greenfield names: `color/action/default`, `color/neutral/*`, `color/text/primary`, `space/component/*`
- Pull specific tokens from `token-cheatsheet.md` for the component type

---

## Build Brief Format

Deliver the brief in this structure, using clear headings. Be specific and prescriptive — the designer should be able to follow this like a checklist.

---

### 🧱 [Component Name]

**What it is**
One sentence describing the component and its purpose.

**Related components**
List any components this one depends on (must be built first) or that are closely related.

---

### Variant Properties

List every Figma variant property this component needs, and the values for each. Format as a table.

| Property | Values | Notes |
|---|---|---|
| ... | ... | ... |

Use lowercase state values: `default`, `hover`, `focused`, `pressed`, `disabled` — not `Enabled`, `Focus`, `Hover`.

Flag which combinations can be skipped (e.g. "loading state only applies to `primary` variant").

---

### Token References

List the specific tokens this component should use for each visual property. Use **legacy names only** from `token-cheatsheet.md`.

| Element | Property | Token |
|---|---|---|
| Container | Background (default) | `Color/primary` |
| Container | Background (hover) | `Color/primary-hover` |
| Label | Text | `Color/text-white` |
| Container | Padding H | `spacing/component-m` |
| Container | Gap | `spacing/stack-gap-default` |
| Container | Radius | `radius/m` |
| Label | Text style | Label MD (Figma text style) |

Do not leave token cells blank. If no semantic token exists, say so and recommend adding one to `value` before building.

---

### Auto Layout Setup

Describe the auto layout structure:
- Outer frame direction (horizontal / vertical)
- Padding (`spacing/component-*` token references)
- Gap between elements (`spacing/stack-gap-*` or `spacing/component-*`)
- Resize behaviour for each element (hug / fill / fixed)
- Min/max width or height constraints if applicable

---

### Layer Structure

Describe the expected layer hierarchy with layer names. This helps keep the component clean and reviewable.

```
[Component Name]
├── container (frame, auto layout)
│   ├── leading-icon (instance, optional)
│   ├── label (text)
│   └── trailing-icon (instance, optional)
```

---

### States to build

List each required state variant and describe what visually changes:

| State | What changes |
|---|---|
| default | Base appearance |
| hover | e.g. `Color/primary-hover` fill |
| focused | e.g. `Color/focus` border or `Color/background-cyan` halo |
| pressed | e.g. `Color/primary-pressed` fill |
| disabled | e.g. `Color/background-grey` + `Color/text-disabled` |
| error | e.g. `Color/border-error`, `Color/background-error-subtle` (if applicable) |

---

### Sizes

Describe each size variant with the specific token values for padding and typography:

| Size | Padding H | Padding V | Label style | Min height |
|---|---|---|---|---|
| sm | `spacing/component-sm` | `spacing/component-xs` | Label SM | 36px |
| md | `spacing/component-m` | `spacing/component-sm` | Label MD | 44px |
| lg | `spacing/component-l` | `spacing/component-m` | Label MD or Body MD | 52px |

---

### Mobile-first notes

Call out any specific mobile considerations:
- Minimum touch target (44px height required for all interactive components)
- Outer hit area can exceed visual size (e.g. checkbox halo at 44×44px)
- Thumb-reach considerations for navigation components
- Any behaviour differences on mobile vs desktop

---

### Edge cases to test

List content edge cases the designer should test before publishing:
- Long text / label overflow
- Missing optional elements (no icon, no label)
- Extreme sizes or content lengths
- RTL if applicable

---

### Common mistakes to avoid

Pull from `references/component-spec.md` and `references/token-cheatsheet.md`. Always flag:
- Binding `colour/*` primitives directly instead of `Color/*` semantic tokens
- Using greenfield token names from the abandoned rebuild
- Hardcoded hex (especially brand teal `#00776B` and error pinks)
- Detached icons instead of Icon component instances

---

### Checklist before publishing

End with the standard pre-publish checklist from component-spec.md, customised for this component.

---

## Tone

Be direct and practical. No fluff. The designer is about to open Figma — give them exact legacy token names, nothing more.

If a component isn't in the catalogue, use the spec standard, token-cheatsheet, and token architecture to construct the brief from first principles, and note that this component is not yet in the catalogue so it should be added after review.
