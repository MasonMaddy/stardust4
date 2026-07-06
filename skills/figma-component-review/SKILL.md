---
name: figma-component-review
description: "Use this skill when a designer asks to review a completed Figma component, check if a component is healthy, audit a component for design system compliance, or verify a component meets standards. Triggers include: review this component, is this component healthy, check my component, audit a component, does this component meet standards, component review, is this ready to publish. Also trigger when a designer pastes component details, screenshots, or descriptions and asks if anything is missing or wrong. Always use this skill after a component is built and before it is published."
---

# Figma Component Review

When a designer asks you to review a component, your job is to act as a rigorous but constructive design system reviewer. You are checking for health, completeness, and standards compliance — not personal taste.

## What you need from the designer

Before reviewing, confirm you have enough information. Ask for any that's missing:

1. **Component name**
2. **Screenshot or description** of the component as built
3. **Variant properties** — what properties and values have been defined
4. **Token usage** — are they using variables, and which ones
5. **Platform target** — mobile, desktop, or both

If they only give you a name and screenshot, do your best and flag what you couldn't verify.

---

## How to review

Read these reference files before reviewing (paths relative to this skill):
- `../figma-component-builder/references/component-spec.md` — the compliance standard
- `../figma-component-builder/references/token-architecture.md` — token tier rules
- `../figma-component-builder/references/token-cheatsheet.md` — correct legacy token names + red flags
- `../figma-component-builder/references/component-catalogue.md` — expected spec for this component type

Then run through every section of the review rubric below.

---

## Token system (compliance standard)

This library uses the **legacy Stardust uplift** model:

| Tier | Collection | On components? | Examples |
|---|---|---|---|
| Primitive | `base` | **No** (except radius — no semantic tier) | `colour/cyan/700`, `spacing/4` |
| Semantic | `value` | **Yes** — required for colour & spacing | `Color/primary`, `spacing/component-m` |
| Component | optional | **Yes** | `button/background/hover` |

**Fail** if you find greenfield names: `color/action/*`, `color/surface/*`, `color/text/*`, `color/neutral/*`, `space/component/*`.

**Fail** if raw hex appears on any layer (common offenders: `#00776B`, `#fce8ed`, `#f9d2dc`).

**Warn** if legacy primitives (`colour/grey/*`, `colour/cyan/*`, `color/text-primary` old string format) are bound where a `Color/*` semantic token exists — see `token-cheatsheet.md` for mappings.

---

## Review Rubric

The full rubric — every checklist item, plus scoring semantics — lives in
`references/audit-rubric.md` (shared with the `figma-component-uplift` skill).
**Read it and work through every section.** Score each section
✅ **Pass** / ⚠️ **Warning** / ❌ **Fail**, or **Unverified** if you lack the data.

The eight sections, in order:

1. **Naming & Structure** — Title Case component name, consistent variant properties, lowercase state values, semantic layer names
2. **Variant Completeness** — all required properties, states, and sizes per `component-catalogue.md`; no orphaned combinations
3. **Token Compliance** ← most critical — no raw hex, `Color/*` semantics over primitives, no greenfield names, token-bound spacing/radius, published text styles, no broken references
4. **Auto Layout** — applied to all frames, token-bound padding/gap, intentional resize behaviour
5. **Mobile-first Sizing** — 44px minimum touch targets, 14px minimum text
6. **Component Description** — present in Figma, standard format, accurate
7. **Edge Case Resilience** — long text, absent optional elements, size extremes, empty/loading states
8. **Internal Cleanliness** — live instances, no hidden frames or test content, correct library location

---

## Output Format

Deliver the review as:

### Component Review: [Component Name]

**Overall status:** ✅ Ready to publish / ⚠️ Minor fixes needed / ❌ Not ready

---

**Summary**
One paragraph: what's good, what needs attention, overall quality signal.

---

**Issues found**

List every ⚠️ and ❌ finding with:
- The section it came from
- What specifically is wrong
- How to fix it — **give the exact legacy token name** (e.g. replace `#00776B` with `Color/primary`, replace `colour/cyan/700` with `Color/primary`)

If there are no issues, say so clearly.

---

**What's working well**
Call out 2–3 things done well. Positive reinforcement matters for consistency.

---

**Pre-publish checklist**
A tailored checklist of outstanding items before this component can be published.

---

## Tone

Be direct and specific. If something is wrong, say exactly what it is and how to fix it — including the correct `Color/*` or `spacing/*` token from `token-cheatsheet.md`. Don't soften findings to the point of being vague.

If you don't have enough information to assess a section, flag it as **Unverified** and tell the designer what you'd need to check it.
