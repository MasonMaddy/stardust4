# Button — Component Specification

**Source of truth:** [Figma node 1:6036](https://www.figma.com/design/a7JnfZ0Nd8df1TBPaMQ5Tj/Stardust-Components?node-id=1-6036)  
**Status:** Published (v1.1.0)  
**Related component:** FAB / icon-only actions live in a separate **Icon Button** component — not this set.

---

## Overview

Buttons trigger immediate actions. Stardust Button supports four visual types, five interactive states, optional leading/trailing icons, and two width modes. There is a single fixed height (48px). Loading feedback is handled by a separate animation pattern — not a Button variant.

---

## Figma component description

Copy into the Button component set description in Figma:

```
Triggers an immediate action in a flow (submit, save, confirm, delete).
Use when: the user needs to commit to or dismiss an action; pair Solid for primary, Ghost or Minimal for secondary, Destructive for irreversible actions (with confirmation).
Don't use when: navigating inline within content (use a link), filtering (use Chip/Toggle), or floating persistent actions (use Icon Button / FAB).
Note: One Solid button per view. Destructive requires confirmation. Loading uses a separate animation — not a Button state. Icon-only actions use Icon Button.
```

---

## Variant matrix

**40 variants** = 4 types × 5 states × 2 width modes

| Figma property | Values | Default | Code prop |
|---|---|---|---|
| `type` | `solid`, `ghost`, `minimal`, `destructive` | `solid` | `type` |
| `state` | `default`, `hover`, `focus`, `pressed`, `disabled` | `default` | CSS pseudo-states / `isDisabled` |
| `size` | `hug`, `full width` | `hug` | `fullWidth: boolean` |

**Boolean instance properties** (not variant axes):

| Figma property | Default | Code prop |
|---|---|---|
| `text` | `true` | label always shown when true |
| `leadIcon` | `false` | `iconPosition: 'leading'` or slot |
| `trailIcon` | `false` | `iconPosition: 'trailing'` or slot |

> **Engineering note:** Map Figma `state` variants to CSS `:hover`, `:focus-visible`, `:active`, and `[disabled]`. Do not render the Figma `focus` variant on hover or click — keyboard/switch access only.

---

## Anatomy

| Part | Layer name | Required | Notes |
|---|---|---|---|
| Container | auto-layout frame | Yes | 48px height, horizontal auto-layout, centered |
| Label | text | Conditional | Required when `text=true`. Uses **Header/Body/Medium** text style |
| Lead Icon | `Lead Icon` | No | 16×16 icon instance. Off by default |
| Trail Icon | `Trail Icon` | No | 16×16 icon instance. Off by default |

---

## Layout & sizing

| Property | Token | Value |
|---|---|---|
| Height | `spacing/12 (48px)` | 48px fixed |
| Padding horizontal | `spacing/component/md` | 16px |
| Padding vertical | `spacing/component/sm` | 8px |
| Icon–label gap | `spacing/stack-gap/default` | 8px (solid, ghost, destructive) |
| Icon–label gap (minimal) | `spacing/2 (8px)` | 8px |
| Border radius | `radius/lg` | 16px (all types) |
| Icon size | — | 16×16 |
| Typography | **Header/Body/Medium** | Inter Medium 16/20 (`font/font-size/base`, `font/weight/medium`) |
| Width `hug` | — | Hugs content |
| Width `full width` | — | Fills container (335px in Figma preview) |

---

## State specifications by type

### Focus ring (shared pattern)

Focus is **not** a CSS outline. It combines:

1. **Inner border** — 2px where applicable (see per-type)
2. **Outer glow** — drop shadow: blur 1px, spread `spacing/1 (4px)`

| Type | Glow colour token |
|---|---|
| solid, ghost, minimal | `colour/feedback/success/subtle` (#DFF2F1) |
| destructive | `colour/surface/red` (#FBDAE3) |

---

### Solid (`type=solid`)

| State | Background | Border | Text / icons | Other |
|---|---|---|---|---|
| default | `colour/action/primary` | — | `colour/text/text-inverse` | — |
| hover | `colour/action/hover` | 1px `colour/action/hover` | `colour/text/text-inverse` | — |
| focus | `colour/action/hover` | 2px `colour/action/pressed` | `colour/text/text-inverse` | success/subtle glow |
| pressed | `colour/action/pressed` | — | `colour/text/text-inverse` | — |
| disabled | `colour/action/disabled` | — | `colour/text/text-disabled` | — |

---

### Ghost (`type=ghost`)

| State | Background | Border | Text / icons | Other |
|---|---|---|---|---|
| default | transparent | 1px `colour/action/primary` | `colour/action/primary` | — |
| hover | `colour/feedback/success/subtle` | 1px `colour/action/hover` | `colour/action/hover` | — |
| focus | `colour/feedback/success/subtle` | 2px `colour/action/pressed` | `colour/action/hover` | success/subtle glow |
| pressed | `colour/feedback/success/subtle` | 1px `colour/action/pressed` | `colour/action/pressed` | — |
| disabled | transparent | 1px `colour/text/text-disabled` | `colour/text/text-disabled` | — |

---

### Minimal (`type=minimal`)

| State | Background | Border | Text / icons | Other |
|---|---|---|---|---|
| default | transparent | — | `colour/action/primary` | — |
| hover | `colour/surface/cyan` | — | `colour/action/hover` | same hex as success/subtle |
| focus | transparent | 1px `colour/action/pressed` | `colour/action/pressed` | no outer glow in Figma |
| pressed | transparent | — | `colour/action/pressed` | — |
| disabled | transparent | — | `colour/text/text-disabled` | — |

---

### Destructive (`type=destructive`)

| State | Background | Border | Text / icons | Other |
|---|---|---|---|---|
| default | `colour/feedback/error/default` | — | `colour/text/text-inverse` | — |
| hover | `colour/feedback/error/default` | — | `colour/text/text-inverse` | surface/red glow |
| focus | `colour/feedback/error/default` | 2px `colour/action/foreground` | `colour/text/text-inverse` | surface/red glow |
| pressed | `colour/feedback/error/subtle` | 2px `colour/action/foreground` | `colour/text/text-inverse` | surface/red glow |
| disabled | `colour/text/text-disabled` | — | `colour/text/text-inverse` | — |

---

## Usage guidelines

### Use when
- Triggering an immediate action (Submit, Save, Create, Delete)
- Primary or secondary CTA on a form, modal, or card
- Confirming or dismissing a dialog

### Don't use when
- Inline navigation within body copy → use a **link**
- Secondary filter/toggle actions → use **Chip** or **Toggle**
- More than one **Solid** button in a view
- Destructive action without a confirmation step
- Icon-only or floating action → use **Icon Button** (separate component)
- Showing in-progress submission → overlay a **loading animation** on the existing button; do not swap to a loading variant

### Content
- Sentence case labels ("Save changes", not "Save Changes")
- Verb + noun where space allows
- Max ~4 words

### Layout
- Minimum touch target: 48×48px (met by default height)
- Pair at most 2 buttons: primary left, secondary right
- Gap between paired buttons: `spacing/stack-gap/default` (8px)
- `full width` acceptable for primary mobile CTAs

---

## Engineering interface

```typescript
type ButtonType = 'solid' | 'ghost' | 'minimal' | 'destructive';

interface ButtonProps {
  /** Visual type */
  type?: ButtonType;
  /** Stretch to container width */
  fullWidth?: boolean;
  /** Disables interaction */
  isDisabled?: boolean;
  /** Show leading icon slot */
  leadIcon?: boolean;
  /** Show trailing icon slot */
  trailIcon?: boolean;
  /** Button label */
  label?: string;
  /** Required when label is hidden and an icon is shown */
  accessibilityLabel?: string;
  onPress?: () => void;
}
```

**Out of scope for v1.1:** `size` (sm/md/lg), `style` (fab), `isLoading`, `iconPosition` enum (use boolean slots instead).

### Motion (implementation layer — not Figma variants)

| Trigger | Property | Duration | Notes |
|---|---|---|---|
| Hover | background, border, color | 150ms ease | Pointer devices only |
| Press | background, border, color | 80ms ease | Optional `scale(0.98)` — code enhancement, not in Figma static variants |
| Focus ring | box-shadow | instant | `:focus-visible` only — never on click |
| Reduced motion | all | instant | Respect `prefers-reduced-motion` / system setting |

### Loading pattern

When an action is in progress: keep the button in its current type/state visually, disable interaction, and show a loading animation (spinner overlay or label replacement). Do not add a `loading` variant to the component set.

---

## Accessibility

| Requirement | Detail |
|---|---|
| Touch target | 48×48px minimum ✓ |
| Contrast (solid default) | White on #00776B = 4.65:1 ✓ AA |
| Contrast (ghost/minimal label) | #00776B on white = 4.65:1 ✓ AA |
| Disabled | Low contrast intentional — WCAG 1.4.3 exempts disabled controls |
| Keyboard | Tab to focus, Space/Enter to activate. Focus ring on `:focus-visible` only |
| Disabled behaviour | `disabled` / `aria-disabled`, removed from tab order, no pointer events |
| Screen reader | Native `<button>` (web). `accessibilityLabel` when label text is absent |

---

## Acceptance criteria

- [ ] All 4 types render correctly on web, iOS, Android
- [ ] All 5 states visually distinct per type (via pseudo-states + disabled prop)
- [ ] Focus glow matches token spec; appears on keyboard focus only
- [ ] `fullWidth` stretches to container; default hugs content
- [ ] Icons off by default; 16px when enabled
- [ ] 48px height on all types including minimal
- [ ] `radius/lg` on all types
- [ ] Ghost uses 1px border (default/hover/pressed/disabled), 2px on focus
- [ ] Destructive disabled uses `text-disabled` fill
- [ ] No loading variant — loading animation documented separately
- [ ] FAB / icon-only documented as Icon Button, not Button
- [ ] Token values match Section tables above

---

## Changelog

| Version | Date | Change |
|---|---|---|
| 1.1.0 | 2026-06-02 | Aligned to Figma: renamed properties, added hover + destructive, fixed focus/height/radius, removed FAB/size/loading from scope |
| 1.0.0 | 2026-06-02 | Initial WIP spec (superseded) |

---

## Open questions / best-practice flags

These are intentional Figma decisions worth confirming — not blockers for the spec:

1. **Minimal focus has no outer glow** — unlike solid/ghost/destructive. Confirm this is deliberate for the lighter visual weight.
2. **Destructive disabled background** uses `colour/text/text-disabled` (#BDBDBD) rather than `colour/action/disabled`. Differs from solid disabled — confirm before engineering tokens are finalised.
3. **Hover variants in Figma may carry focus shadow layers** — implementation must apply glow on `:focus-visible` only, not `:hover`.
4. **`colour/surface/cyan` vs `colour/feedback/success/subtle`** — same hex (#DFF2F1) used under two names for minimal hover vs ghost hover. Consider aliasing in the token library.
5. **Single typography size (16px)** — no sm/lg tier for Button v1.1. If density variants are needed later, add a new size axis in a future version.
6. **Icon Button component** — not yet specced; needed for FAB and icon-only actions referenced in usage guidelines.
