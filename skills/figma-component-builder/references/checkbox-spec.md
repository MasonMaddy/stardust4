# Checkbox — Component Specification

**Source of truth:** [Figma node 806:540057](https://www.figma.com/design/a7JnfZ0Nd8df1TBPaMQ5Tj/Stardust-Components?node-id=806-540057)  
**Status:** Published (v1.0.0)  
**Related:** Label and helper text are composed **outside** this control — see form field patterns. Radio Button is a separate component.

---

## Overview

Checkboxes let users select one or more independent options, or toggle a single setting on/off. The Figma set is **control-only** (18×18 visual box inside a 44×44 hit area). Focus uses a **circular halo** pattern — intentionally separate from Button’s inner-border + glow treatment.

Motion and Vue implementation should follow the [Vuetify Checkbox](https://vuetifyjs.com/en/components/checkboxes/) / [`VSelectionControl`](https://github.com/vuetifyjs/vuetify/tree/master/packages/vuetify/src/components/VCheckbox/) model: native `<input type="checkbox">`, visually hidden; circular `:hover` / `:active` overlay on the 44×44 wrapper; `:focus-visible` ring; `indeterminate` clears on next user toggle.

---

## Figma component description

Copy into the Checkbox component set description in Figma:

```
Checkboxes let users select one or more options from a set independently of each other.
Use when: multiple options can be selected simultaneously, or to toggle a single option on/off.
Don't use when: only one option can be selected from a set — use Radio Button instead. For lists exceeding 10 options, use Multi-select instead.
Note: Always meets 44px minimum touch target via the hit-area wrapper. Labels are composed in parent layouts — not part of this component.
```

---

## Variant matrix

**18 variants** = 3 types × 6 states

| Figma property | Values | Default | Code prop |
|---|---|---|---|
| `type` | `checked`, `unchecked`, `intermediate` | `unchecked` | `checked` + `indeterminate` booleans |
| `state` | `default`, `hover`, `focused`, `pressed`, `disabled`, `error` | `default` | CSS pseudo-states / props |

> **Naming note:** Figma uses `intermediate`; engineering and a11y APIs use **`indeterminate`** (HTML `indeterminate` property, ARIA `aria-checked="mixed"`).

> **Engineering note:** Map Figma `state` to `:hover`, `:focus-visible`, `:active`, `[disabled]`, and an `error` / `invalid` prop. Do not render the Figma `focused` variant on hover or click — keyboard/switch access only.

---

## Anatomy

| Part | Layer name | Size | Notes |
|---|---|---|---|
| Hit-area wrapper | auto-layout frame | **44×44px** | Fixed on all variants; centres the box |
| Box / Icon | `Icon` | **18×18px** | Checked & intermediate use composite SVG assets; unchecked is a bordered frame |
| Padding | — | `spacing/stack-gap/default` (8px) | Between wrapper edge and box |

There is **no label slot** in this component set. Pair with adjacent text in a parent row (`display: flex; gap: spacing/stack-gap/default`).

---

## Layout & sizing

| Property | Token | Value |
|---|---|---|
| Touch target | — | **44×44px** fixed |
| Visual box | — | **18×18px** |
| Box radius | `radius/sm` | 4px |
| Wrapper padding | `spacing/stack-gap/default` | 8px |
| Wrapper shape (interactive states) | `radius/full` | Circular halo |
| Check / dash icon | — | White (`colour/text/text-inverse`), baked into SVG |

---

## Focus ring (checkbox-specific)

Unlike Button, checkbox focus is a **circular halo** on the 44×44 wrapper:

| Property | Token |
|---|---|
| Background | `colour/feedback/success/subtle` |
| Border | 2px `colour/action/pressed` |
| Shape | `radius/full` |

Unchecked focus also darkens the box border to `colour/text/text-primary` (2px).

---

## State specifications by type

### Shared — hover overlay (44×44 wrapper)

| Type | Wrapper background |
|---|---|
| `checked`, `intermediate` | `colour/surface/cyan` |
| `unchecked` | `colour/surface/grey` |

Unchecked hover also sets box border to `colour/text/text-primary`.

### Shared — pressed overlay (44×44 wrapper)

| Type | Wrapper background |
|---|---|
| `checked`, `intermediate` | `colour/feedback/success/default` |
| `unchecked` | `colour/text/text-secondary` |

Unchecked pressed keeps box border `colour/text/text-primary`.

---

### `unchecked`

| State | Box fill | Box border | Wrapper |
|---|---|---|---|
| default | transparent / `surface/default` | 2px `colour/border/strong` | none |
| hover | — | 2px `colour/text/text-primary` | `surface/grey` circle |
| focused | — | 2px `colour/text/text-primary` | success/subtle circle + 2px `action/pressed` border |
| pressed | — | 2px `colour/text/text-primary` | `text/secondary` circle |
| disabled | — | 2px `colour/text/text-disabled` | none |
| error | — | 2px `colour/border/error` | none |

---

### `checked`

| State | Box | Wrapper |
|---|---|---|
| default | `action/primary` fill + white check (SVG) | none |
| hover | unchanged | `surface/cyan` circle |
| focused | unchanged | success/subtle circle + 2px `action/pressed` border |
| pressed | unchanged | `feedback/success/default` circle |
| disabled | grey fill + muted check (SVG) | none |
| error | `feedback/error/default` fill + white check (SVG) | none |

---

### `intermediate` (indeterminate)

Same interaction tokens as `checked`; box shows a white horizontal dash instead of a check.

| State | Box | Wrapper |
|---|---|---|
| default | `action/primary` fill + white dash (SVG) | none |
| hover | unchanged | `surface/cyan` circle |
| focused | unchanged | success/subtle circle + 2px `action/pressed` border |
| pressed | unchanged | `feedback/success/default` circle |
| disabled | grey fill + muted dash (SVG) | none |
| error | `feedback/error/default` fill + white dash (SVG) | none |

---

## Motion & interaction (engineering)

Follow Vuetify `VSelectionControl` behaviour:

| Behaviour | Implementation |
|---|---|
| Hover wash | `::before` pseudo on 44×44 input area; fade in `colour/surface/cyan` or `surface/grey`; ~150ms ease |
| Press wash | `::before` on `:active`; `feedback/success/default` or `text/secondary`; same duration |
| Focus ring | `:focus-visible` only — circular border + subtle fill; never on `:focus` from mouse click |
| Check transition | Optional scale/fade on icon when toggling (Vuetify uses opacity on icon) |
| Indeterminate | Setting `indeterminate=true` shows dash; **first user click clears indeterminate** and sets checked state |
| Reduced motion | `@media (prefers-reduced-motion: reduce)` — disable overlay transitions |

Reference: [Vuetify Checkbox docs](https://vuetifyjs.com/en/components/checkboxes/), [`VCheckboxBtn.tsx`](https://github.com/vuetifyjs/vuetify/blob/master/packages/vuetify/src/components/VCheckbox/VCheckboxBtn.tsx), [`VSelectionControl.sass`](https://github.com/vuetifyjs/vuetify/blob/master/packages/vuetify/src/components/VSelectionControl/VSelectionControl.sass).

---

## Usage guidelines

### Use when
- Multiple options can be selected from a list
- Toggling a single boolean setting (e.g. “Remember me”)
- “Select all” with partial selection (`indeterminate`)

### Don't use when
- Only one option from a set → **Radio Button**
- More than ~10 options → **Multi-select**
- Immediate action without persistence → **Button** or **Toggle**

### Label composition (parent layout)
```
[Checkbox 44×44] [Label text]     ← gap: spacing/stack-gap/default
[Checkbox 44×44] [Label + helper text below]
```
Use `<label>` wrapping both control and text, or `aria-labelledby` when structure requires separation.

---

## Engineering interface

```typescript
interface CheckboxProps {
  /** Controlled checked state */
  modelValue?: boolean;
  /** Partial selection (select-all parent) */
  indeterminate?: boolean;
  /** Disables interaction */
  disabled?: boolean;
  /** Validation / form error */
  error?: boolean;
  /** Accessible name when no visible label */
  ariaLabel?: string;
  /** id for label association */
  id?: string;
  name?: string;
  value?: string;
}
```

Vue (Vuetify-aligned):

```vue
<!-- VCheckboxBtn pattern: control + external label slot -->
<VCheckbox v-model="checked" :indeterminate="partial" label="Option A" />
```

---

## Accessibility

| Requirement | Detail |
|---|---|
| Native input | Always render `<input type="checkbox">`; visually hide, do not remove from tab order |
| Label | Visible label or `aria-label` / `aria-labelledby` required |
| Indeterminate | `element.indeterminate = true` + `aria-checked="mixed"` |
| Error | `aria-invalid="true"` + link to error message via `aria-describedby` |
| Focus | Visible `:focus-visible` ring — circular halo per spec |
| Touch target | 44×44pt minimum — wrapper size, not 18px box |
| Disabled | `disabled` attribute; no pointer events |
| Group | Use `fieldset` + `legend` for related checkbox groups |

---

## Acceptance criteria

- [ ] All 18 Figma variants render correctly
- [ ] 44×44 hit area on every state; 18×18 box centred
- [ ] Hover, focus, pressed, disabled, error match token matrix
- [ ] Focus uses circular halo — not Button glow pattern
- [ ] `indeterminate` supported; clears on user toggle
- [ ] Native checkbox + label association in eng implementation
- [ ] `:focus-visible` only for focus ring
- [ ] `prefers-reduced-motion` respected

---

## Changelog

| Version | Date | Change |
|---|---|---|
| 1.0.0 | 2026-06-03 | Initial spec — 18 variants, 44×44 touch target, error state, Vuetify motion reference |
