# Selection Pill — Component Specification

**Source of truth:** [Figma node 5118:5101](https://www.figma.com/design/a7JnfZ0Nd8df1TBPaMQ5Tj/Stardust-Components?node-id=5118-5101)
**Status:** WIP (v1.0.0)
**Review log:** `selection-pill-review.md`
**Related:** Non-interactive [Pill](../components/pill.html) — for static status/information labels

---

## Overview

An **interactive pill/chip** for filtering, tagging, and selection UI. Height 44px (`radius/full`), with an optional leading decorative icon, a text label, and an optional right-side selection indicator. The entire pill is the tap/click target.

This is the "Interactive Pill" referenced in the non-interactive Pill spec.

**Three selection modes via `selectionType`:**
- `none` — pill toggles with no right-side indicator (label + optional icon only)
- `dismiss` — pill is a removable tag; trailing FAB (24px ×) removes it
- `radio` — pill shows an unselected/selected radio indicator (single-select group)
- `checkbox` — pill shows an unchecked/checked checkbox indicator (multi-select)

---

## Variant matrix

| Property | Values | Default | Notes |
|---|---|---|---|
| `state` | `default`, `hover`, `focus`, `selected`, `disabled` | `default` | CSS pseudo-states + `aria-pressed` |
| `leadingIcon` | `true`, `false` | `true` | Decorative, `aria-hidden="true"` |
| `selectionType` | `none`, `dismiss`, `radio`, `checkbox` | `none` | Right-side indicator type |

---

## Anatomy

| # | Part | Notes |
|---|---|---|
| 1 | **Container** | `radius/full` · height 44px · `px: 12px` · `py: 4px` · `gap: 4px` · inline-flex |
| 2 | **Leading icon slot** | 24×24px · decorative · `aria-hidden="true"` · optional via `leadingIcon` boolean |
| 3 | **Label text** | 14px / 23px lh · Inter Regular · inherits `color` from container |
| 4 | **Selection indicator** | 24×24px · right-side · content depends on `selectionType` — see below |

**Indicator content per `selectionType`:**

| selectionType | Element | Accessibility |
|---|---|---|
| `none` | — (no indicator) | — |
| `dismiss` | sm FAB with × icon (24px) | Separate `<button aria-label="Remove [label]">` |
| `radio` | Radio button glyph (24px) | `aria-hidden="true"` — state on pill via `aria-pressed` |
| `checkbox` | Checkbox glyph (24px) | `aria-hidden="true"` — state on pill via `aria-pressed` |

---

## States

### Container tokens

| State | Background | Border | Text / Icon colour | Box-shadow |
|---|---|---|---|---|
| default | `colour/surface/default` white | 1px `colour/action/primary` | `colour/action/primary` | none |
| hover | `colour/surface/default` white | 1px `colour/action/primary` | `colour/action/primary` | `0 0 1px 4px colour/feedback/success/subtle` |
| focus | `colour/surface/default` white | **2px** `colour/action/primary` | `colour/action/primary` | `0 0 1px 4px colour/feedback/success/subtle` |
| selected | `colour/surface/green` #F1F8F2 | **2px** `colour/action/primary` | `colour/action/primary` | none |
| disabled | `colour/surface/default` white | **2px** `colour/text/text-disabled` | `colour/text/text-disabled` | none |

### Dismiss FAB tokens (selectionType='dismiss')

The FAB background tracks the pill's state. The × icon is always `aria-hidden="true"` on the FAB itself.

| Pill state | FAB background | FAB icon colour |
|---|---|---|
| default | `colour/surface/cyan` #DFF2F1 | `colour/action/primary` |
| hover | `colour/focus/primary` #7BCAC5 | `colour/action/primary` |
| focus | `colour/focus/primary` #7BCAC5 | `colour/action/primary` |
| selected | `colour/action/hover` #008480 | `colour/text/text-inverse` white |
| disabled | `colour/text/text-disabled` #BDBDBD | `colour/text/text-inverse` white |

### Radio / Checkbox indicator states

| Pill state | Radio | Checkbox |
|---|---|---|
| default / hover / focus | unselected | unchecked |
| selected | selected (filled dot) | checked (filled) |
| disabled | disabled (grey) | disabled (grey unchecked) |

---

## Focus & hover pattern

Matches the Button component exactly:

```css
/* Hover: glow only, 1px border unchanged */
.ds-selection-pill:hover {
  box-shadow: 0 0 1px var(--sd-spacing-1) var(--sd-colour-feedback-success-subtle);
}

/* Focus: 2px border upgrade + glow */
.ds-selection-pill:focus-visible {
  outline: none;
  border-width: 2px;
  box-shadow: 0 0 1px var(--sd-spacing-1) var(--sd-colour-feedback-success-subtle);
}
```

`--sd-spacing-1` = 4px (spread). `--sd-colour-feedback-success-subtle` = #DFF2F1.

---

## Accessibility

| Requirement | Implementation |
|---|---|
| Pill as tap target | Render container as `<button type="button" aria-pressed="false/true">` for toggle; or `role="option" aria-selected` in a listbox group |
| Leading icon | `aria-hidden="true"` — decorative |
| Radio / checkbox indicators | `aria-hidden="true"` — visual only; state on the pill element |
| Dismiss button | Separate `<button type="button" aria-label="Remove [label]">` INSIDE a non-`<button>` container (e.g. `<li>` or `<div>`) to avoid `<button>` inside `<button>` |
| Dismiss container | When `selectionType='dismiss'`, the outer container must NOT be `<button>` — use `<div role="option">` or `<li>` with role and keyboard handling |
| Disabled | `disabled` attribute or `aria-disabled="true"` + `pointer-events: none` |
| Focus indicator | 2px border on `:focus-visible`, glow via `box-shadow`. `outline: none` only when replaced. |
| Group semantics | Wrap multiple Selection Pills in `<div role="listbox" aria-multiselectable="true">` (multi) or `role="radiogroup"` (single) depending on `selectionType` |

**Button-inside-button rule:**
`selectionType='dismiss'` requires the outer wrapper to be a non-button element. Recommended pattern:

```html
<!-- dismiss pattern — outer is NOT a <button> -->
<li class="ds-selection-pill" role="option" aria-selected="false" tabindex="0">
  <span class="ds-selection-pill__icon" aria-hidden="true"><!-- icon --></span>
  <span class="ds-selection-pill__label">Filter label</span>
  <button type="button" class="ds-selection-pill__dismiss" aria-label="Remove Filter label">
    <!-- × icon, aria-hidden="true" -->
  </button>
</li>

<!-- radio / checkbox pattern — whole pill is the button -->
<button type="button" class="ds-selection-pill" aria-pressed="false">
  <span class="ds-selection-pill__icon" aria-hidden="true"><!-- icon --></span>
  <span class="ds-selection-pill__label">Filter label</span>
  <span class="ds-selection-pill__indicator" aria-hidden="true"><!-- radio/checkbox glyph --></span>
</button>
```

---

## Engineering interface

```typescript
type SelectionType = 'none' | 'dismiss' | 'radio' | 'checkbox';

interface SelectionPillProps {
  /** Display label */
  label:           string;
  /** Show leading decorative icon */
  leadingIcon?:    boolean;      // default: true
  /** Right-side indicator — determines interaction pattern */
  selectionType?:  SelectionType; // default: 'none'
  /** Whether the pill is in selected/pressed state */
  isSelected?:     boolean;
  isDisabled?:     boolean;
  /** Called when the pill is toggled (all selectionTypes) */
  onToggle?:       () => void;
  /** Called when the dismiss × is pressed (selectionType='dismiss' only) */
  onDismiss?:      () => void;
}
```

---

## CSS class structure

```
.ds-selection-pill         — container (base layout, border, radius, transitions)
.ds-selection-pill--selected  — selected state modifier
.ds-selection-pill--disabled  — disabled state modifier
.ds-selection-pill__icon   — leading icon wrapper (24×24px)
.ds-selection-pill__label  — text label
.ds-selection-pill__indicator — right-side radio/checkbox glyph wrapper (24×24px)
.ds-selection-pill__dismiss   — dismiss FAB button (24×24px)
```

---

## Acceptance criteria

- [ ] All 5 states render correctly: default, hover, focus, selected, disabled
- [ ] Height: 44px · `radius/full` · `px: 12px` · `py: 4px` · `gap: 4px`
- [ ] Leading icon: optional boolean, 24px, `aria-hidden="true"` when shown
- [ ] `selectionType='none'`: pill toggles with no right indicator
- [ ] `selectionType='radio'`: radio glyph shown, `aria-hidden`, state tracks `isSelected`
- [ ] `selectionType='checkbox'`: checkbox glyph shown, `aria-hidden`, state tracks `isSelected`
- [ ] `selectionType='dismiss'`: 24px FAB shown, FAB bg tracks pill state, separate `<button>` with `aria-label="Remove [label]"`
- [ ] Dismiss container is NOT `<button>` — uses `<li role="option">` or equivalent
- [ ] Hover: box-shadow glow, 1px border unchanged
- [ ] Focus: 2px border + box-shadow glow, `:focus-visible` only
- [ ] Selected: `surface/green` bg, 2px `action/primary` border, no glow
- [ ] Disabled: `surface/default` bg, 2px `text/text-disabled` border, `text/text-disabled` text, pointer-events none
- [ ] Glow: `0 0 1px 4px colour/feedback/success/subtle` — matches Button pattern
- [ ] Typography: 14px / 23px lh · Inter Regular (`font/font-size/sm` / `font/line-height/sm`)
- [ ] Group semantics: `role="listbox"` / `role="radiogroup"` documented

---

## Changelog

| Version | Date | Change |
|---|---|---|
| 1.0.0 | 2026-06-10 | Initial spec. 5 states, `leadingIcon` boolean, `selectionType` enum (none/dismiss/radio/checkbox). FAB state tracks pill state. Button-inside-button pattern documented for dismiss. Focus/hover glow aligns with Button. |
