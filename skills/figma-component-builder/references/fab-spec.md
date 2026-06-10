# FAB — Component Specification

**Source of truth:** [Figma node 5088:15241](https://www.figma.com/design/a7JnfZ0Nd8df1TBPaMQ5Tj/Stardust-Components?node-id=5088-15241)
**Status:** WIP (v1.0.0)
**Review log:** `fab-review.md`

---

## Overview

A circular icon action button with four types, four sizes, and six states. The `xl` size supports an optional text label (Extended FAB pattern). All sizes are interactive — use the `accessibilityLabel` prop whenever the label is not visible.

**Naming note:** Stardust FAB covers what MD3 calls both "Icon Button" (sm/md/lg, compact circular) and "FAB / Extended FAB" (xl, prominent with optional text). The component is named FAB because the xl size represents the classic Floating Action Button use case.

---

## Variant matrix

**4 properties → variable total variants**

| Property | Values | Default | Notes |
|---|---|---|---|
| `type` | `default`, `secondary`, `tertiary`, `inverse` | `default` | Colour theme |
| `size` | `sm`, `md`, `lg`, `xl` | `xl` | See sizing table |
| `state` | `default`, `hover`, `focus`, `pressed`, `disabled`, `filled` | `default` | `filled` = formerly `inverse` state — saturated rendering for use on coloured backgrounds |
| `showText` | `true`, `false` | `false` | `xl` only. When `true`, renders as Extended FAB with icon + label. |

---

## Anatomy

| Part | Notes |
|---|---|
| Container | `radius/full`, height per size, padding per size, colour per type × state |
| Icon slot | Circular, `currentColor` fill. sm=12px, md=20px, lg=22px, xl=28px. Always `aria-hidden="true"`. |
| Label text (xl only) | 20px/24px lh, Inter Medium. Visible only when `showText=true`. 8px gap from icon. |

---

## Sizing

| Size | Container | Padding | Icon | Gap | Typography | Use case |
|---|---|---|---|---|---|---|
| `sm` | 24×24px | 6px | 12px | — | — | Inline compact actions, chip accessories |
| `md` | 32×32px | 6px | 20px | — | — | List row actions, card quick actions |
| `lg` | 44×44px | 11px | 22px | — | — | Primary contextual actions, matches button tap target |
| `xl` | hug×56px | 14px | 28px | 8px | 20px/24px Inter Medium | Prominent page-level actions, Extended FAB with label |

**Radius:** `radius/full` (9999px) — fully circular on all sizes and states.

**xl height:** 14 (pad) + 28 (icon) + 14 (pad) = 56px. Width hugs icon + optional text.

---

## Colour and token matrix

### Type: default (teal)

| State | Background | Border | Icon colour | Text colour |
|---|---|---|---|---|
| default | `colour/surface/cyan` #DFF2F1 | transparent | `colour/action/primary` #00776B | `colour/action/primary` |
| hover | `colour/focus/primary` #7BCAC5 | transparent | `colour/action/primary` | `colour/action/primary` |
| focus | `colour/focus/primary` #7BCAC5 | 2px `colour/action/pressed` #004B40 | `colour/action/primary` | `colour/action/primary` |
| pressed | `colour/action/hover` #008480 | transparent | `colour/text/text-inverse` white | `colour/text/text-inverse` |
| disabled | `colour/action/disabled` #F6F6F6 | transparent | `colour/text/text-disabled` #BDBDBD | `colour/text/text-disabled` |
| filled | `colour/action/primary` #00776B | transparent | `colour/text/text-inverse` white | `colour/text/text-inverse` |

### Type: secondary (purple)

| State | Background | Border | Icon colour | Text colour |
|---|---|---|---|---|
| default | `colour/surface/purple` #F3F1FF | transparent | `colour/accent/secondary` #8068BA | `colour/accent/secondary` |
| hover | `colour/border/default` #D0C7E5 | transparent | `colour/accent/secondary` | `colour/accent/secondary` |
| focus | `colour/border/default` #D0C7E5 | 2px `colour/accent/secondary` #8068BA | `colour/accent/secondary` | `colour/accent/secondary` |
| pressed | `colour/accent/secondary` #8068BA | transparent | `colour/text/text-inverse` white | `colour/text/text-inverse` |
| disabled | `colour/action/disabled` #F6F6F6 | transparent | `colour/text/text-disabled` | `colour/text/text-disabled` |
| filled | `colour/accent/secondary` #8068BA | transparent | `colour/text/text-inverse` white | `colour/text/text-inverse` |

### Type: tertiary (orange)

| State | Background | Border | Icon colour | Text colour |
|---|---|---|---|---|
| default | `colour/surface/orange` #FEF2E0 | transparent | `colour/feedback/warning/default` #EC7702 | `colour/feedback/warning/default` |
| hover | `colour/feedback/warning/subtle` #FEF2E0 | transparent | `colour/feedback/warning/default` | `colour/feedback/warning/default` |
| focus | `colour/feedback/warning/subtle` #FEF2E0 | 2px `colour/feedback/warning/default` #EC7702 | `colour/feedback/warning/default` | `colour/feedback/warning/default` |
| pressed | `colour/feedback/warning/default` #EC7702 | transparent | `colour/text/text-inverse` white | `colour/text/text-inverse` |
| disabled | `colour/action/disabled` #F6F6F6 | transparent | `colour/text/text-disabled` | `colour/text/text-disabled` |
| filled | `colour/feedback/warning/default` #EC7702 | transparent | `colour/text/text-inverse` white | `colour/text/text-inverse` |

**Note:** tertiary `default` and `hover` backgrounds share the same hex (#FEF2E0). The hover is differentiated by state-awareness (cursor change) and the focus state adds the 2px border.

### Type: inverse (grey/dark)

| State | Background | Border | Icon colour | Text colour |
|---|---|---|---|---|
| default | `colour/surface/grey` #F6F6F6 | transparent | `colour/text/text-primary` #252525 | `colour/text/text-primary` |
| hover | `colour/text/text-disabled` #BDBDBD | transparent | `colour/text/text-primary` | `colour/text/text-primary` |
| focus | `colour/text/text-disabled` #BDBDBD | 2px `colour/text/text-primary` #252525 | `colour/text/text-primary` | `colour/text/text-primary` |
| pressed | `colour/surface/inverse` #121212 | transparent | `colour/text/text-inverse` white | `colour/text/text-inverse` |
| disabled | `colour/action/disabled` #F6F6F6 | transparent | `colour/text/text-disabled` | `colour/text/text-disabled` |
| filled | `colour/surface/inverse` #121212 | transparent | `colour/text/text-inverse` white | `colour/text/text-inverse` |

---

## Token note: `colour/focus/primary`

Figma uses the token name `colour/focus/default` for the FAB hover background. In the Stardust token system this is implemented as `--sd-colour-focus-primary` (#7BCAC5). Same value, different name. Always use `--sd-colour-focus-primary` in code.

---

## Focus state

Focus is applied via `:focus-visible` only — never `:hover` or `:active`.

```css
.ds-fab:focus { outline: none; }
.ds-fab:focus-visible {
  /* bg and border-color are set by type modifiers */
  border-width: 2px;
}
```

Border colour per type on focus-visible:
- default: `--sd-colour-action-pressed` (#004B40)
- secondary: `--sd-colour-accent-secondary` (#8068BA)
- tertiary: `--sd-colour-feedback-warning-default` (#EC7702)
- inverse: `--sd-colour-text-primary` (#252525)

No `box-shadow`. No elevation.

---

## Accessibility

| Requirement | Implementation |
|---|---|
| Icon-only (sm/md/lg, xl without label) | Must have `aria-label` or `aria-labelledby` on the button element |
| xl with `showText=true` | Visible text label satisfies the accessible name requirement |
| Icon slot | `aria-hidden="true"` — decorative |
| Disabled state | Render with `disabled` attribute or `aria-disabled="true"` + `pointer-events: none` |
| Focus indicator | 2px border on `:focus-visible`; no `outline: none` without replacement |
| Minimum tap target | sm=24px is below the 44×44px WCAG recommendation — only use sm in desktop-only contexts |

---

## Engineering interface

```typescript
type FabType  = 'default' | 'secondary' | 'tertiary' | 'inverse';
type FabSize  = 'sm' | 'md' | 'lg' | 'xl';
type FabState = 'default' | 'hover' | 'focus' | 'pressed' | 'disabled' | 'filled';

interface FabProps {
  type?:               FabType;    // default: 'default'
  size?:               FabSize;    // default: 'xl'
  isDisabled?:         boolean;
  /** xl only — shows text label alongside icon (Extended FAB) */
  showText?:           boolean;
  /** label text when showText=true */
  text?:               string;
  /** Required when showText=false — provides accessible name */
  accessibilityLabel?: string;
  /** Icon element — any icon from iconOutline or iconColoured */
  icon?:               ReactNode;
  onPress?:            () => void;
}
```

---

## Acceptance criteria

- [ ] All 4 types × 4 sizes × 6 states render correctly (sm/md/lg icon-only; xl icon-only and Extended FAB)
- [ ] Sizes: sm=24px, md=32px, lg=44px, xl=56px height
- [ ] `radius/full` (9999px) on all variants
- [ ] Icon sizes: sm=12px, md=20px, lg=22px, xl=28px — `aria-hidden="true"`
- [ ] `colour/focus/primary` (#7BCAC5) used as hover background for default type
- [ ] Focus: 2px solid border, type-specific colour, `:focus-visible` only, no box-shadow
- [ ] Pressed: full saturated token per type, white icon/text
- [ ] Disabled: `colour/action/disabled` bg, `colour/text/text-disabled` icon/text, all types identical
- [ ] Filled state: fully saturated bg per type, white icon/text
- [ ] xl `showText=true`: icon + 8px gap + 20px/24px Inter Medium label, width hugs content
- [ ] Icon-only variants (all sizes + xl without text): `accessibilityLabel` required
- [ ] sm size: document as desktop-only due to 24px touch target below WCAG recommendation

---

## Changelog

| Version | Date | Change |
|---|---|---|
| 1.0.0 | 2026-06-10 | Initial spec. 4 types × 4 sizes × 6 states. xl size added with optional text (Extended FAB). md size corrected to 32px (grid-aligned). `inverse` state renamed to `filled`. Focus upgraded to 2px border. Token name `colour/focus/default` → `colour/focus/primary`. |
