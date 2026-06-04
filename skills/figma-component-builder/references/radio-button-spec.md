# Radio Button — Component Specification

**Source of truth:** [Figma node 824:152112](https://www.figma.com/design/a7JnfZ0Nd8df1TBPaMQ5Tj/Stardust-Components?node-id=824-152112)  
**Status:** Published (v1.0.0) — hover/pressed states deferred to Phase 4  
**Review log:** `radio-button-review.md`  
**Related:** Checkbox (shared token set, motion spec, and focus token patterns)

---

## Overview

Radio buttons let users select **exactly one** option from a visible set. Use when choices are mutually exclusive and all options must remain visible (settings, payment method, shipping speed). This component is the **control only** (glyph + 44×44px touch target) — labels are composed in the parent layout.

---

## Figma component description

```
Radio buttons let users select exactly one option from a set.
Use when: choices are mutually exclusive and every option should stay visible.
Don't use when: users can pick more than one option (use Checkbox) or the list is long (use Select).
Note: Control-only component — pair with a Label in the parent layout. States: default, selected, disabled,
focused, selected-focused. Hover and pressed deferred to Phase 4 (web).
```

---

## Variant matrix

**1 property × 5 current values** (4 more values added in Phase 4)

| Figma property | Values (current) | Phase 4 additions | Default |
|---|---|---|---|
| `state` | `default`, `selected`, `disabled`, `focused`, `selected-focused` | `hover`, `selected-hover`, `pressed`, `selected-pressed` | `default` |

> No `size` variant — fixed 20px glyph in 44×44px touch target.  
> No `label` variant — label is external in parent layout.

---

## Anatomy

| Part | Layer name | Size | Notes |
|---|---|---|---|
| Touch-target wrapper | root `div` | **44×44px** | Outer tap/click target; centres glyph; carries halo background in interactive states |
| Glyph | `glyph` (`div` + `img`) | **20×20px** | Radio circle — currently a baked image asset; Phase 4 web replaces with inline SVG |
| Inner padding | — | 12px all sides | `spacing/stack-gap/loose` token; produces (44−20)/2 = 12px centering |

**There is no label slot.** Pair with a separate label element in the consuming layout.

---

## Layout & sizing

| Property | Token | Value |
|---|---|---|
| Touch target | — | 44×44px fixed |
| Glyph | — | 20×20px |
| Inner padding | `spacing/stack-gap/loose` | 12px all sides |
| Touch target radius | `radius/full` | 9999px — circular halo |

---

## State specifications

### Touch target halo colours

| State | Halo background | Notes |
|---|---|---|
| `default` | none / transparent | — |
| `selected` | none / transparent | — |
| `disabled` | none / transparent | — |
| `focused` | `colour/focus/secondary` (#BDBDBD) | Unselected keyboard focus |
| `selected-focused` | `colour/focus/primary` (#7BCAC5) | Selected keyboard focus |
| `hover` *(Phase 4)* | `colour/surface/grey` | Unselected hover |
| `selected-hover` *(Phase 4)* | `colour/surface/cyan` | Selected hover |
| `pressed` *(Phase 4)* | `colour/text/text-secondary` | Unselected press |
| `selected-pressed` *(Phase 4)* | `colour/feedback/success/default` | Selected press |

### Glyph appearance

| State | Glyph | Token (Phase 4 SVG) |
|---|---|---|
| `default` | Empty ring, dark border | Ring stroke → `colour/border/strong` |
| `selected` | Filled teal, white centre dot | Fill → `colour/action/primary`; dot → `colour/text/text-inverse` |
| `disabled` | Empty ring, grey/muted border | Ring stroke → `colour/text/text-disabled`; `pointer-events: none` |
| `focused` | Same as `default` | Ring stroke → `colour/border/strong` |
| `selected-focused` | Same as `selected` | Fill → `colour/action/primary`; dot → `colour/text/text-inverse` |

---

## Focus ring (radio-specific)

Matches the Checkbox focus pattern — solid circular halo on the 44×44 touch target, no border ring.

| State | Halo token | Hex |
|---|---|---|
| `focused` (unselected) | `colour/focus/secondary` | #BDBDBD |
| `selected-focused` | `colour/focus/primary` | #7BCAC5 |

> These are the same two tokens introduced in Checkbox v1.1.0.

---

## Motion & interaction

Follows the same MD3 motion spec as Checkbox v1.1.0.

### MD3 easing tokens

| Token | Curve | Use |
|---|---|---|
| Standard | `cubic-bezier(0.2, 0, 0, 1)` | Selection, state layer enter, halo show |
| Standard Accelerate | `cubic-bezier(0.3, 0, 1, 1)` | Deselection, state layer exit, halo hide |
| Emphasized Decelerate | `cubic-bezier(0.05, 0.7, 0.1, 1.0)` | (Reserved for path draw — not applicable to radio) |

### MD3 duration tokens

| Token | Value | Use |
|---|---|---|
| short-2 | 100ms | Inner dot scale — selection/deselection |
| short-3 | 150ms | State layer exit |
| medium-1 | 200ms | State layer enter |

### Selection animation (glyph)

| Event | Animation | Duration | Easing |
|---|---|---|---|
| Selecting (→ selected) | Inner dot scales `0 → 1` | 100ms (short-2) | Standard |
| Deselecting (→ default) | Inner dot scales `1 → 0` | 100ms (short-2) | Standard Accelerate |

### State layer (halo) animation

| Direction | Duration | Easing |
|---|---|---|
| Enter (show halo) | 200ms (medium-1) | Standard — `cubic-bezier(0.2, 0, 0, 1)` |
| Exit (hide halo) | 150ms (short-3) | Standard Accelerate — `cubic-bezier(0.3, 0, 1, 1)` |

Halo scales from `scale(0)` → `scale(1)` on enter; `scale(1)` → `scale(0)` on exit. Asymmetric timing via CSS cascade trick (same as Checkbox).

### Press feedback

`scale(0.85)` on the glyph at 75ms Standard on `:active`. Established Stardust pattern from Checkbox; not in MD3 but required for cross-component consistency.

### Reduced motion

`@media (prefers-reduced-motion: reduce)` — all transitions and animations disabled; state changes happen instantly; halo appears at full scale immediately.

---

## Interaction behaviour

### Selection

- Clicking an unselected radio selects it and deselects the previously selected option.
- **Clicking a selected radio has no effect** — one option always remains selected.
- Optionally, one option may be in an unset state as an initial state only (not user-reachable via interaction).

### Keyboard (roving tabindex — ARIA radiogroup pattern)

| Key | Behaviour |
|---|---|
| `Tab` / `Shift+Tab` | Move focus to/from the radio group as a whole |
| `↑` / `←` | Move focus to previous option AND select it |
| `↓` / `→` | Move focus to next option AND select it |
| `Space` | Select the focused option (if not already selected) |
| `Enter` | Does nothing (radio buttons are not activated with Enter) |

> Arrow keys both move focus AND change selection simultaneously — this is the ARIA radiogroup contract.

### Group requirements

- Always used in groups of **two or more** options.
- Every group **must have a visible label** — implement via `<fieldset>` + `<legend>` or `role="radiogroup"` + `aria-labelledby`.
- One option should be pre-selected by default where a sensible default exists.

---

## Usage guidelines

### Use when
- Choices are **mutually exclusive** and all options should remain visible
- Typical contexts: settings pages, payment method selection, shipping speed, sort order
- "Select all that apply" is **not** this component (use Checkbox)

### Don't use when
- Users can select more than one option → **Checkbox**
- More than ~6–8 options → **Select / Dropdown**
- Immediate action without persistence → **Button**
- Only one option is presented → a single radio button is never correct

### Label composition

```
[Radio 44×44] [Label text]             ← gap: spacing/stack-gap/default (8px)
[Radio 44×44] [Label + helper text]    ← helper below label, linked via aria-describedby
```

Use a `<label>` wrapping both control and text, or `aria-labelledby` when structure requires separation. The radio component itself has no `hasLabel` variant — label is always external.

---

## Token references

| Element | State | Token | CSS var | Value |
|---|---|---|---|---|
| Glyph fill (selected) | selected, selected-focused, selected-hover, selected-pressed | `colour/action/primary` | `--sd-colour-action-primary` | #00776B |
| Glyph ring stroke (unselected) | default, focused, hover | `colour/border/strong` | `--sd-colour-border-strong` | #838383 |
| Glyph ring (disabled) | disabled | `colour/text/text-disabled` | `--sd-colour-text-disabled` | #BDBDBD |
| White centre dot | selected states | `colour/text/text-inverse` | `--sd-colour-text-inverse` | #FFFFFF |
| Halo (focused, unselected) | focused | `colour/focus/secondary` | `--sd-colour-focus-secondary` | #BDBDBD |
| Halo (focused, selected) | selected-focused | `colour/focus/primary` | `--sd-colour-focus-primary` | #7BCAC5 |
| Halo (hover, unselected) | hover *(Phase 4)* | `colour/surface/grey` | `--sd-colour-surface-grey` | #F6F6F6 |
| Halo (hover, selected) | selected-hover *(Phase 4)* | `colour/surface/cyan` | `--sd-colour-surface-cyan` | #DFF2F1 |
| Halo (pressed, unselected) | pressed *(Phase 4)* | `colour/text/text-secondary` | `--sd-colour-text-secondary` | #838383 |
| Halo (pressed, selected) | selected-pressed *(Phase 4)* | `colour/feedback/success/default` | `--sd-colour-feedback-success-default` | #01A39D |
| Touch target padding | all | `spacing/stack-gap/loose` | `--sd-spacing-stack-gap-loose` | 12px |
| Touch target radius | all | `radius/full` | `--sd-radius-full` | 9999px |
| Glyph size | all | — | — | 20×20px |
| Touch target size | all | — | — | 44×44px |

---

## Accessibility

| Requirement | Implementation |
|---|---|
| Native control | Always use `<input type="radio">` — visually hidden, not removed |
| Label | Visible label via `<label>` wrap, or `aria-label` / `aria-labelledby` |
| Group role | `<fieldset>` + `<legend>` or `role="radiogroup"` + `aria-labelledby` |
| aria-checked | `aria-checked="true"` when selected, `"false"` when not |
| Disabled | `disabled` attribute + `aria-disabled="true"`; no pointer events |
| Focus ring | Visible `:focus-visible` circular halo — `colour/focus/secondary`/`colour/focus/primary` |
| Touch target | 44×44px minimum — the 44px wrapper, not the 20px glyph |
| Contrast (focus) | `colour/focus/secondary` (#BDBDBD) achieves ~2.0:1 on white — below WCAG 2.4.11 3:1 minimum. **[HUMAN REVIEW RECOMMENDED]** Flag for design token lead to evaluate darkening this token system-wide. |
| Reduced motion | All animation disabled; states change instantly |
| Keyboard | Roving tabindex — Arrow keys move + select simultaneously; Tab enters/exits group |

---

## Engineering interface

```typescript
interface RadioButtonProps {
  /** Controlled selected state */
  checked?: boolean;
  /** Disables interaction */
  disabled?: boolean;
  /** Accessible name — required when no visible label */
  ariaLabel?: string;
  /** Associates with visible label element */
  ariaLabelledBy?: string;
  /** Links to helper or error text */
  ariaDescribedBy?: string;
  /** Form field name — required for native radio group behaviour */
  name: string;
  /** Value submitted with form when selected */
  value: string;
  /** Change handler */
  onChange?: (value: string) => void;
}

interface RadioGroupProps {
  /** The name shared by all radios in this group */
  name: string;
  /** Currently selected value */
  value?: string;
  /** Group-level change handler */
  onChange?: (value: string) => void;
  /** Disables all options in the group */
  disabled?: boolean;
  /** Accessible label for the group (maps to fieldset legend) */
  label: string;
}
```

---

## Acceptance criteria

- [ ] All 5 current Figma states render correctly (default, selected, disabled, focused, selected-focused)
- [ ] 44×44px touch target on every state; 20px glyph centred
- [ ] Focus halo uses `colour/focus/secondary` for focused, `colour/focus/primary` for selected-focused
- [ ] Focus ring appears on `:focus-visible` only — never on mouse click
- [ ] Selection animation: inner dot scales `0 → 1` at 100ms Standard on select; `1 → 0` at 100ms Standard Accelerate on deselect
- [ ] State layer enter 200ms Standard, exit 150ms Standard Accelerate — scales from `scale(0)`
- [ ] Press feedback: glyph scales to `0.85` at 75ms Standard on `:active`
- [ ] Roving tabindex: Arrow keys move focus AND select; Tab enters/exits group; Enter does nothing
- [ ] Clicking a selected radio has no effect
- [ ] Group requires `<fieldset>` + `<legend>` or `role="radiogroup"` + `aria-labelledby`
- [ ] Native `<input type="radio">` — visually hidden, not removed
- [ ] Disabled: no pointer events, `aria-disabled="true"`, grey ring via token
- [ ] `prefers-reduced-motion`: all transitions disabled, instant state changes
- [ ] Phase 4: hover/selected-hover/pressed/selected-pressed states added to Figma and implemented using documented tokens
- [ ] Phase 4: glyph implemented as inline SVG with live `colour/action/primary` and `colour/border/strong` token bindings

---

## Changelog

| Version | Date | Change |
|---|---|---|
| 1.0.0 | 2026-06-04 | Initial spec — 5 Figma states, MD3-aligned motion, focus tokens from Checkbox v1.1.0, full keyboard/ARIA contract, Phase 4 hover/pressed tokens documented. |
