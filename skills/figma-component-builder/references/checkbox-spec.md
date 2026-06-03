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
| `type` | `checked`, `unchecked`, `indeterminate` | `unchecked` | `checked` + `indeterminate` booleans |
| `state` | `default`, `hover`, `focused`, `pressed`, `disabled`, `error` | `default` | CSS pseudo-states / props |

> **Naming — resolved:** Canonical name is **`indeterminate`** across engineering, documentation, and Figma (Figma layer updated from `intermediate`). Matches HTML `indeterminate` property and `aria-checked="mixed"`.

> **Engineering note:** Map Figma `state` to `:hover`, `:focus-visible`, `:active`, `[disabled]`, and an `error` / `invalid` prop. Do not render the Figma `focused` variant on hover or click — keyboard/switch access only.

---

## Anatomy

| Part | Layer name | Size | Notes |
|---|---|---|---|
| Hit-area wrapper | auto-layout frame | **44×44px** | Fixed on all variants; centres the box |
| Box / Icon | `Icon` | **18×18px** | Checked & indeterminate use composite SVG assets; unchecked is a bordered frame |
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

Unlike Button, checkbox focus is a **circular solid halo** on the 44×44 wrapper — no border ring. Colour varies by checked state:

| Type | Halo token | Hex |
|---|---|---|
| `checked`, `indeterminate` | `colour/focus/primary` | #7BCAC5 |
| `unchecked` | `colour/focus/secondary` | #BDBDBD |

Unchecked focus also darkens the box border to `colour/text/text-primary` (2px).

> These are the two new focus tokens added in v1.1.0. The previous approach (feedback/success/subtle fill + action/pressed border) has been replaced.

---

## State specifications by type

### Shared — hover overlay (44×44 wrapper)

| Type | Wrapper background |
|---|---|
| `checked`, `indeterminate` | `colour/surface/cyan` |
| `unchecked` | `colour/surface/grey` |

Unchecked hover also sets box border to `colour/text/text-primary`.

### Shared — pressed overlay (44×44 wrapper)

| Type | Wrapper background |
|---|---|
| `checked`, `indeterminate` | `colour/feedback/success/default` |
| `unchecked` | `colour/text/text-secondary` |

Unchecked pressed keeps box border `colour/text/text-primary`.

---

### `unchecked`

| State | Box fill | Box border | Wrapper |
|---|---|---|---|
| default | transparent / `surface/default` | 2px `colour/border/strong` | none |
| hover | — | 2px `colour/text/text-primary` | `surface/grey` circle |
| focused | — | 2px `colour/text/text-primary` | `colour/focus/secondary` (#BDBDBD) circle — solid, no border |
| pressed | — | 2px `colour/text/text-primary` | `text/secondary` circle |
| disabled | — | 2px `colour/text/text-disabled` | none |
| error | — | 2px `colour/border/error` | none |

---

### `checked`

| State | Box | Wrapper |
|---|---|---|
| default | `action/primary` fill + white check (SVG) | none |
| hover | unchanged | `surface/cyan` circle |
| focused | unchanged | `colour/focus/primary` (#7BCAC5) circle — solid, no border |
| pressed | unchanged | `feedback/success/default` circle |
| disabled | grey fill + muted check (SVG) | none |
| error | `feedback/error/default` fill + white check (SVG) | none |

---

### `indeterminate`

Same interaction tokens as `checked`; box shows a white horizontal dash instead of a check.

| State | Box | Wrapper |
|---|---|---|
| default | `action/primary` fill + white dash (SVG) | none |
| hover | unchanged | `surface/cyan` circle |
| focused | unchanged | `colour/focus/primary` (#7BCAC5) circle — solid, no border |
| pressed | unchanged | `feedback/success/default` circle |
| disabled | grey fill + muted dash (SVG) | none |
| error | `feedback/error/default` fill + white dash (SVG) | none |

---

## Motion & interaction (engineering)

Motion follows [Material Design 3 checkbox guidelines](https://m3.material.io/components/checkbox/specs), applied to Stardust tokens.

### MD3 easing tokens

| Token | Curve | Use |
|---|---|---|
| Standard | `cubic-bezier(0.2, 0, 0, 1)` | General movement, box fill |
| Standard Accelerate | `cubic-bezier(0.3, 0, 1, 1)` | State layer exit (fast, crisp) |
| Emphasized Decelerate | `cubic-bezier(0.05, 0.7, 0.1, 1.0)` | Check/dash draw — starts fast, settles naturally |

### MD3 duration tokens

| Token | Value | Use |
|---|---|---|
| short-2 | 100ms | Box fill / border transitions |
| short-3 | 150ms | State layer exit; check/dash draw |
| medium-1 | 200ms | State layer enter |

### State layer (halo)

Rendered via `::before` pseudo-element so it animates independently of the 18px box.

| Behaviour | Implementation |
|---|---|
| Scale origin | Starts at `scale(0)` — ripple from centre point |
| Enter | 200ms (medium-1), Standard `cubic-bezier(0.2, 0, 0, 1)` |
| Exit | 150ms (short-3), Standard Accelerate `cubic-bezier(0.3, 0, 1, 1)` — faster dismissal |
| Asymmetry | Achieved via CSS cascade: enter `transition` on active-state rules, exit `transition` on default rule |
| Opacity | Not animated — scale alone controls visibility |
| Static demos | `transition: none` — reference variant grid shows states instantly |

### Box

| Behaviour | Implementation |
|---|---|
| Fill / border | 100ms (short-2), Standard easing |
| Press feedback | `scale(0.85)` on `:active`, 75ms Standard — tactile confirmation |

### Check mark draw

| Behaviour | Implementation |
|---|---|
| Technique | `stroke-dashoffset` from path length → 0 |
| Duration | 150ms (short-3) |
| Delay | 50ms (box fill starts first at 100ms; draw overlaps and completes at 200ms total) |
| Easing | Emphasized Decelerate — fast initial stroke, natural settle at end |

### Dash (indeterminate) draw

Same technique as check; 120ms, 30ms delay.

### Indeterminate behaviour

Setting `indeterminate=true` shows dash. **First user click clears indeterminate** and sets checked state — same as Vuetify `VCheckboxBtn`.

### Reduced motion

`@media (prefers-reduced-motion: reduce)` — all transitions and animations disabled. State layer appears at full scale instantly; press squeeze removed. States remain visually distinct without motion.

Reference: [MD3 Checkbox specs](https://m3.material.io/components/checkbox/specs) · [MD3 Checkbox guidelines](https://m3.material.io/components/checkbox/guidelines) · [Vuetify VCheckboxBtn](https://github.com/vuetifyjs/vuetify/blob/master/packages/vuetify/src/components/VCheckbox/VCheckboxBtn.tsx)

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
| 1.1.0 | 2026-06-04 | Focus tokens updated: `colour/focus/primary` (#7BCAC5) / `colour/focus/secondary` (#BDBDBD) replace old feedback/success/subtle + action/pressed approach. Motion section rewritten to MD3 spec (Standard / Standard Accelerate / Emphasized Decelerate easing, short-2/3 + medium-1 durations, asymmetric state layer, press squeeze, check draw). Naming: intermediate → indeterminate. Disabled visual tokens documented. |
| 1.0.0 | 2026-06-03 | Initial spec — 18 variants, 44×44 touch target, error state, Vuetify motion reference |
