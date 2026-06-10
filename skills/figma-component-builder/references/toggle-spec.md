# Toggle — Component Specification

**Source of truth:** [Figma node 1:7963](https://www.figma.com/design/a7JnfZ0Nd8df1TBPaMQ5Tj/Stardust-Components?node-id=1-7963)
**Figma component name:** Switch
**Status:** WIP (v1.0.0)
**Review log:** `toggle-review.md`

---

## Overview

A binary on/off toggle switch. A 40×24px visual control consisting of a slim 12px rail and a 22px circular knob that slides between off (left) and on (right). The label is **always external** — never embedded in this component. Associate a `<label>` in the parent layout via `for`/`id`.

---

## Variant matrix

| Property | Values | Default | Notes |
|---|---|---|---|
| `isOn` | `true`, `false` | `false` | Drives knob position and rail/knob colours |
| `isDisabled` | `true`, `false` | `false` | Disabled: grey rail, grey translucent knob, pointer-events none |

States (CSS pseudo-classes / modifiers):

| State | Trigger |
|---|---|
| default | base |
| hover | `:hover` |
| focus | `:focus-visible` |
| pressed | `:active` |
| disabled | `[disabled]` / `.ds-toggle--disabled` |

---

## Anatomy

| # | Part | Notes |
|---|---|---|
| 1 | **Touch target** | Min 44×44px area via padding or wrapper — visual footprint stays 40×24px |
| 2 | **Rail** | 36×12px · `radius/m` (8px) · slides colour off→on · transitions 200ms |
| 3 | **Ripple** | 29×29px circle · `radius/full` · `::before` on knob wrapper · semi-transparent state layer |
| 4 | **Thumb** | 22×22px · `radius/full` · slides 16px (off→on) · `transform: translateX` |

---

## Dimensions

| Property | Value | Notes |
|---|---|---|
| Component visual | 40×24px | |
| Touch target | ≥44×44px | Added via CSS padding on the root element |
| Rail | 36×12px | Centred in 40×24 container |
| Rail radius | `radius/m` (8px) | Fully rounded ends |
| Knob | 20×20px | `radius/full` |
| Knob travel | 16px | `translateX(0)` off → `translateX(16px)` on |
| Ripple | 29×29px | Centred on knob, `radius/full` |

---

## Tokens

### Rail

| State | Background |
|---|---|
| off (all active variants) | `colour/border/strong` #838383 |
| on (all active variants) | `colour/feedback/success/default` #01A39D |
| disabled (on or off) | `colour/action/disabled` #F6F6F6 |

### Knob (thumb)

| State | Background | Border |
|---|---|---|
| off default / hover / pressed | `colour/action/foreground` white | none |
| off focus | `colour/action/foreground` white | 2px `colour/action/primary` #00776B |
| on default / hover / pressed | `colour/action/primary` #00776B | none |
| on focus | `colour/action/primary` #00776B | 2px `colour/action/hover` #008480 |
| disabled (on or off) | `colour/surface/grey` #F6F6F6 | none |

Note on disabled knob: rendered at 70% opacity over the disabled rail — creates a subtle blended appearance.

### Ripple (::before pseudo-element on knob wrapper)

| State | Background | Opacity |
|---|---|---|
| default | `colour/text/text-disabled` #BDBDBD | 40% |
| hover | `colour/feedback/success/subtle` #DFF2F1 | 70% |
| pressed (:active) | `colour/text/text-disabled` #BDBDBD | 70% |
| focus | `colour/text/text-disabled` #BDBDBD | 40% |
| disabled | `colour/surface/grey` #F6F6F6 | 70% |

### Intentional depth — on-state rail vs knob

The on-state rail (`feedback/success/default` = cyan-500 #01A39D) is deliberately lighter than the on-state knob (`action/primary` = cyan-700 #00776B). The lighter rail recedes visually, the darker knob sits on top. Do not align these to the same token.

---

## Motion

| Property | Value |
|---|---|
| Easing | `cubic-bezier(0.2, 0, 0, 1)` — MD3 Standard |
| Duration | 200ms |
| Knob | `transform: translateX(0)` → `translateX(16px)` |
| Rail | `background-color` 200ms |
| Knob colour | `background-color` 200ms |
| Ripple | `opacity` and `background-color` 150ms ease |

```css
@media (prefers-reduced-motion: reduce) {
  .ds-toggle, .ds-toggle__thumb, .ds-toggle__rail { transition: none; }
}
```

---

## Focus state

- Off + focus: white knob with 2px `colour/action/primary` border
- On + focus: `action/primary` knob with 2px `colour/action/hover` border
- No `box-shadow` outer glow — the knob border is the sole focus indicator
- Applied via `:focus-visible` only — never `:hover` or `:active`

---

## Accessibility

| Requirement | Implementation |
|---|---|
| Role | `<button type="button" role="switch" aria-checked="false/true">` OR `<input type="checkbox" role="switch">` |
| Label | External — associate via `<label for="id">` in the parent layout. Never embedded. |
| Touch target | Root element min-height/min-width 44px via padding. Visual footprint stays 40×24px. |
| Focus indicator | 2px knob border on `:focus-visible` |
| Disabled | `disabled` attribute or `aria-disabled="true"` + `pointer-events: none` |
| Ripple parts | `aria-hidden="true"` or hidden from accessibility tree — purely decorative |

---

## CSS class structure

```
.ds-toggle              — root (touch target, positions rail/knob)
.ds-toggle--on          — on state modifier
.ds-toggle--disabled    — disabled modifier
.ds-toggle__rail        — track (36×12px)
.ds-toggle__knob-wrap   — knob + ripple host (slides with transform)
.ds-toggle__knob-wrap::before — ripple pseudo-element (29×29px)
.ds-toggle__thumb       — knob circle (22×22px)
```

---

## Engineering interface

```typescript
interface ToggleProps {
  isOn?:            boolean;   // default: false
  isDisabled?:      boolean;   // default: false
  /** Associates with external label — passed to aria-labelledby or id */
  id?:              string;
  onChange?:        (isOn: boolean) => void;
}
```

---

## Acceptance criteria

- [ ] Visual: 40×24px · rail 36×12px `radius/m` · knob 22×22px `radius/full`
- [ ] Touch target: ≥44×44px click/tap area (visual stays 40×24px)
- [ ] Off: grey rail (`border/strong`), white knob (`action/foreground`)
- [ ] On: cyan-500 rail (`feedback/success/default`), cyan-700 knob (`action/primary`)
- [ ] Knob travels 20px with 200ms `cubic-bezier(0.2,0,0,1)`; off center=7.5px, on center=27.5px within 40px container
- [ ] Rail background-color transitions simultaneously with knob
- [ ] Hover: `feedback/success/subtle` ripple at 70%
- [ ] Pressed: `text/text-disabled` ripple at 70%
- [ ] Focus off: white knob + 2px `action/primary` border, `:focus-visible` only
- [ ] Focus on: `action/primary` knob + 2px `action/hover` border
- [ ] Disabled: `action/disabled` rail, `surface/grey` knob at 70% — same for on and off
- [ ] `role="switch"` with `aria-checked="true/false"`
- [ ] No label in component — external label associated via `for`/`id`
- [ ] `prefers-reduced-motion` disables transitions
- [ ] Rail/knob depth: on-state rail (#01A39D) lighter than knob (#00776B) — intentional

---

## Changelog

| Version | Date | Change |
|---|---|---|
| 1.0.1 | 2026-06-10 | Knob resized 22→20px. Knob travel increased 16→20px; off-position knob center at 7.5px (extends 2.5px beyond rail left), on-position at 27.5px. More visual range relative to rail. |
| 1.0.0 | 2026-06-10 | Initial spec. 2 states (on/off) × 5 variants. Ripple as ::before. Knob travel 16px, 200ms MD3 Standard easing. Touch target 44px wrapper. Rail=cyan-500, knob=cyan-700 intentional depth. Focus via knob border only. |
