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

Score each section as one of:
- ✅ **Pass** — meets the standard
- ⚠️ **Warning** — partially meets standard, minor fix needed
- ❌ **Fail** — does not meet standard, must be fixed before publishing

---

### 1. Naming & Structure
- [ ] Component name uses Title Case
- [ ] Variant property names are consistent with existing components (`State`, `Size`, `Variant`, `Has Label`, etc.)
- [ ] Variant values use lowercase (`default`, `hover`, `focused` — not `Enabled`, `Focus`, `Hover`)
- [ ] Layer names are descriptive (`label`, `icon`, `container` — not `Frame 3`, `Group 12`)

### 2. Variant Completeness
Compare against `component-catalogue.md` for this component type.
- [ ] All required variant properties are present
- [ ] All required states are present for this component type
- [ ] No missing size variants
- [ ] No orphaned or unreachable variant combinations

### 3. Token Compliance
This is the most critical section.
- [ ] No raw hex colour values — all colours reference variables
- [ ] No hardcoded spacing numbers — padding/gap use `spacing/*` semantic tokens (or `spacing/N` primitives only if no semantic exists)
- [ ] No hardcoded border radius — references `radius/*` from `base`
- [ ] Typography uses published Figma text styles (Label SM, Body MD, etc.) — not manual font settings
- [ ] Colours use **`Color/*`** semantic tokens from `value` — not `colour/*` primitives
- [ ] No greenfield token names (`color/action/default`, `color/text/primary`, etc.)
- [ ] No broken variable references (⚠️ or "?" indicators in Figma)

### 4. Auto Layout
- [ ] Auto layout is applied to all frames — no manual pinning
- [ ] Padding values use token variables (not fixed numbers)
- [ ] Gap between elements uses token variables
- [ ] Resize behaviour is intentionally set (hug / fill / fixed) on all elements
- [ ] No unintended fixed sizes that would break at different content lengths

### 5. Mobile-first Sizing
- [ ] Interactive components meet 44px minimum touch target height (outer container, not just visual glyph)
- [ ] Text is minimum 14px (`font/font-size/sm` / Label SM) for interactive components — not `tiny` (9px)
- [ ] Touch targets are not too dense or overlapping

### 6. Component Description
- [ ] Description is written in Figma (not blank)
- [ ] Description follows the standard format: what it is, when to use, when not to use
- [ ] Description is accurate to how the component actually behaves

### 7. Edge Case Resilience
- [ ] Long text has been tested and doesn't break layout
- [ ] Optional elements (icons, labels) have been tested absent
- [ ] Component works at its smallest and largest size
- [ ] Empty/loading states handled if applicable

### 8. Internal Cleanliness
- [ ] No detached component instances inside (all icons/elements are live instances)
- [ ] No hidden frames that shouldn't be there
- [ ] No leftover test content or placeholder text in published variant
- [ ] Component is in the correct page/section of the library file

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
