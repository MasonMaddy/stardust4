# Figma Component Audit Rubric

> **Shared reference.** This is the canonical rubric used by both `figma-component-review`
> (read-only audit) and `figma-component-uplift` (audit + write-back, Phase 3). Edit it
> here — do not re-inline it in either SKILL.md.

## Scoring

Score every section as one of:

- ✅ **Pass** — meets the standard
- ⚠️ **Warning** — partially meets the standard, minor fix needed
- ❌ **Fail** — does not meet the standard, must be fixed before publishing

If you cannot verify a section (no data available), mark it **Unverified** and say
exactly what you'd need to check it.

---

### 1. Naming & Structure
- [ ] Component name uses Title Case
- [ ] Variant property names are consistent with existing components (`State`, `Size`, `Variant`, `Has Icon`, `Has Label`, etc.)
- [ ] Variant/state values are lowercase (`default`, `hover`, `focused`, `pressed`, `disabled` — not `Enabled`, `Focus`, `Hover`)
- [ ] Layer names are semantic and descriptive (`container`, `label`, `icon` — not `Frame 3`, `Group 12`, `Rectangle 47`)

### 2. Variant Completeness
Compare against the `figma-component-builder` skill's `references/component-catalogue.md` for this component type.
- [ ] All required variant properties are present
- [ ] All required states are present for this component type
- [ ] No missing size variants
- [ ] No orphaned or unreachable variant combinations

### 3. Token Compliance ← most critical section
- [ ] No raw hex colour values — every fill and stroke references a variable (common offenders: `#00776B`, `#fce8ed`, `#f9d2dc`)
- [ ] Colours use **`Color/*`** semantic tokens from the `value` collection — no primitives (`colour/*`, `base` collection) bound directly where a semantic equivalent exists
- [ ] No greenfield token names (`color/action/*`, `color/surface/*`, `color/text/*`, `color/neutral/*`, `space/component/*`)
- [ ] No hardcoded spacing numbers — padding/gap use `spacing/*` semantic tokens (or `spacing/N` primitives only if no semantic exists)
- [ ] No hardcoded border radius — references `radius/*` from `base` (acceptable — there is no semantic radius tier)
- [ ] Typography uses published Figma text styles (Label SM, Body MD, etc.) — not manual font settings
- [ ] No broken variable references (⚠️ or "?" indicators in Figma)

### 4. Auto Layout
- [ ] Auto layout is applied to all frames — no manual pinning
- [ ] Padding values use token variables (not fixed numbers)
- [ ] Gap between elements uses token variables
- [ ] Resize behaviour is intentionally set (hug / fill / fixed) on all elements
- [ ] No unintended fixed sizes that would break at different content lengths

### 5. Mobile-first Sizing
- [ ] Interactive components meet 44px minimum touch target height (outer container at default state — not just the visual glyph)
- [ ] Text is minimum 14px (`font/font-size/sm` / Label SM) for interactive components — not `tiny` (9px)
- [ ] Touch targets are not too dense or overlapping

### 6. Component Description
- [ ] Description is written in the Figma component panel (not blank, not just page-level copy)
- [ ] Description follows the standard format: what it is / when to use / when not to use / note
- [ ] Description is accurate to how the component actually behaves

### 7. Edge Case Resilience
- [ ] Long text has been tested and doesn't break layout
- [ ] Optional elements (icons, labels) have been tested absent
- [ ] Component works at its smallest and largest size
- [ ] Empty/loading states handled if applicable

### 8. Internal Cleanliness
- [ ] No detached component instances inside — icons/elements are live instances, not detached vectors or rasterised images
- [ ] No hidden frames that shouldn't be there
- [ ] No leftover test content or placeholder text in published variants
- [ ] Component is in the correct page/section of the library file

---

## Fix guidance

For every ⚠️ and ❌ finding, name the **exact legacy token** to use — e.g. replace
`#00776B` or `colour/cyan/700` with `Color/primary`, replace `colour/grey/1000` with
`Color/border`. See the `figma-component-builder` skill's `references/token-cheatsheet.md`
for the full primitive → semantic mappings.
