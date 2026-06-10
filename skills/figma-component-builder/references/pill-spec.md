# Pill — Component Specification

**Source of truth:** [Figma node 1:13590](https://www.figma.com/design/a7JnfZ0Nd8df1TBPaMQ5Tj/Stardust-Components?node-id=1-13590)
**Status:** Published (v1.0.0)
**Review log:** `pill-review.md`
**Related:** Interactive Pill (separate component — handles filtering, selection, and dismiss scenarios)

---

## Overview

A **non-interactive status and information label** used to surface priority, status, or category metadata at a glance. Pills are purely presentational — they carry no tap/click action. The trailing icon (Flag) is decorative and non-interactive.

Use the **Interactive Pill** component (separate) for any scenario requiring hover, focus, press, dismiss, or selection behaviour.

---

## Figma component description

```
A non-interactive status and information label used to surface priority, status, or
category metadata at a glance alongside content items.
Use when: a content item needs a quick visual indicator — for example, to show urgency,
status (Active / Pending / Closed), content type, or importance level.
Don't use when: the user needs to interact with the pill (click, dismiss, or filter) —
use the Interactive Pill component instead.
Note: Fully non-interactive. Leading icon and trailing flag are decorative. Label text
is the sole content — keep it short (1–3 words).
```

---

## Variant matrix

**3 properties → 36 total variants** (4 colours × 3 types × 3 sizes)

| Property | Values | Default | Notes |
|---|---|---|---|
| `color` | `Green`, `Orange`, `Purple`, `Grey` | `Purple` | Colour-based names; semantic intent set by label text |
| `type` | `solid`, `ghost`, `minimal` | `solid` | Visual weight |
| `size` | `sm`, `md`, `lg` | `sm` | |
| `leadingIcon` | `true`, `false` | `true` | Optional decorative icon slot |
| `trailingIcon` | `true`, `false` | `true` | Optional Flag-fill icon — always decorative |

---

## Anatomy

| Part | Layer name | Notes |
|---|---|---|
| Container | root `div` | `radius/full`, height per size, horizontal padding per size |
| Leading icon slot | `Featured` | 16px (sm/md), 24px (lg) — decorative, `aria-hidden="true"` |
| Label text | text | `Caption/Regular` (sm/md), `Subtitle/Regular` (lg); colour per variant |
| Trailing flag icon | `Flag-fill` | 16px (sm/md), 24px (lg) — always decorative, `aria-hidden="true"` |

**No interactive elements.** The pill body, leading icon, and trailing flag are all non-interactive.

---

## Sizing

| Size | Height | H padding | V padding | Gap | Icon size | Typography |
|---|---|---|---|---|---|---|
| `sm` | 24px | `spacing/component/sm` (8px) | `spacing/stack-gap/tight` (4px) | 4px | 16px | Caption/Regular — `font/font-size/xs` (12px) |
| `md` | 32px | `spacing/3-(12px)` (12px) | `spacing/1-(4px)` (4px) | 4px | 16px | Caption/Regular — `font/font-size/xs` (12px) |
| `lg` | 44px | `spacing/3-(12px)` (12px) | `spacing/1-(4px)` (4px) | 4px | 24px | Subtitle/Regular — `font/font-size/sm` (14px) |

**Radius:** `radius/full` (9999px) — pill shape on all variants.

---

## Colour and token matrix

### Solid type

| Color | Container bg | Text | Leading icon | Trailing flag |
|---|---|---|---|---|
| Purple | `colour/accent/secondary` (#8068BA) | `colour/surface/default` (white) | white | white |
| Orange | `colour/feedback/error/default` (#D21D3E) | `colour/surface/default` (white) | white | white |
| Green | `colour/action/primary` (#00776B) | `colour/surface/default` (white) | white | white |
| Grey | `colour/surface/inverse` (#121212) | `colour/surface/default` (white) | white | white |

### Ghost type

| Color | Container bg | Border | Text | Leading icon | Trailing flag |
|---|---|---|---|---|---|
| Purple | `colour/surface/default` (white) | `colour/accent/secondary` | `colour/accent/secondary` (#8068BA) | purple-tinted | purple-tinted |
| Orange | `colour/surface/default` (white) | `colour/feedback/error/default` | `colour/feedback/error/default` (#D21D3E) | red-tinted | red-tinted |
| Green | `colour/surface/default` (white) | `colour/action/primary` | `colour/action/primary` (#00776B) | teal-tinted | teal-tinted |
| Grey | `colour/surface/default` (white) | `colour/text/text-disabled` | `colour/text/text-primary` (#252525) | grey-tinted | grey-tinted |

### Minimal type

| Color | Container bg | Text | Leading icon | Trailing flag |
|---|---|---|---|---|
| Purple | `colour/surface/purple` (#F3F1FF) | `colour/accent/secondary` (#8068BA) | purple-tinted | purple-tinted |
| Orange | `colour/surface/orange` (#FEF2E0) | `colour/feedback/error/default` (#D21D3E) | red-tinted | red-tinted |
| Green | `colour/surface/cyan` (#DFF2F1) | `colour/action/primary` (#00776B) | teal-tinted | teal-tinted |
| Grey | `colour/surface/grey` (#F6F6F6) | `colour/text/text-primary` (#252525) | grey-tinted | grey-tinted |

> **Token note:** `colour/surface/orange` is a new semantic token added in this component's v1.0.0 spec. It must be present in `tokens.css` as `--sd-colour-surface-orange: var(--sd-colour-orange-50); /* #FEF2E0 */`.

---

## Usage guidelines

### Use when
- A content item needs a quick, scannable visual indicator alongside a title or list row
- Surfacing status: `Active`, `Pending`, `Closed`, `Archived`
- Showing urgency or importance: `Urgent`, `High`, `Overdue`
- Indicating content type or category: `Report`, `Assessment`, `Medical`
- Providing contextual metadata that does not require user interaction

### Don't use when
- The user needs to click, dismiss, or filter using the pill → **Interactive Pill** component
- The pill needs to convey state changes in response to interaction
- More than 3 words are needed — use a badge or tag instead
- You need to convey information through colour alone (always pair with a label)

### Size selection

| Size | When to use |
|---|---|
| `sm` (24px) | Dense lists, table rows, compact data views |
| `md` (32px) | Standard cards, list items with breathing room |
| `lg` (44px) | Card headers, page headers, prominent status display |

### Colour selection

Colour communicates urgency and tone. Always pair with a descriptive label — colour must not be the sole indicator of meaning.

| Color | Suggested use |
|---|---|
| Purple | Default / neutral status, categories |
| Orange | High urgency, error states, overdue, critical |
| Green | Positive status, active, complete, healthy |
| Grey | Low priority, archived, inactive, secondary |

### Type selection

| Type | When to use |
|---|---|
| `solid` | High emphasis — primary status, most important indicator |
| `ghost` | Medium emphasis — secondary status, outlined for lighter layouts |
| `minimal` | Low emphasis — subtle tag in dense UI, soft background tint |

### Label text
- Keep to 1–3 words maximum
- Use title case: `Active`, `High Priority`, `Needs Review`
- Never use the pill to surface more than one concept — split into multiple pills if needed

---

## Token references

| Element | Token | CSS var | Value |
|---|---|---|---|
| Container radius | `radius/full` | `--sd-radius-full` | 9999px |
| sm height | — | — | 24px |
| md height | — | — | 32px |
| lg height | — | — | 44px |
| sm/md padding H | `spacing/component/sm` / `spacing/3-(12px)` | `--sd-spacing-...` | 8px / 12px |
| Gap (icon to text) | `spacing/stack-gap/tight` / `spacing/1-(4px)` | `--sd-spacing-...` | 4px |
| Purple solid bg | `colour/accent/secondary` | `--sd-colour-accent-secondary` | #8068BA |
| Orange solid bg | `colour/feedback/error/default` | `--sd-colour-feedback-error-default` | #D21D3E |
| Green solid bg | `colour/action/primary` | `--sd-colour-action-primary` | #00776B |
| Grey solid bg | `colour/surface/inverse` | `--sd-colour-surface-inverse` | #121212 |
| Solid text | `colour/surface/default` | `--sd-colour-surface-default` | #FFFFFF |
| Purple minimal bg | `colour/surface/purple` | `--sd-colour-surface-purple` | #F3F1FF |
| Orange minimal bg | `colour/surface/orange` *(new)* | `--sd-colour-surface-orange` | #FEF2E0 |
| Green minimal bg | `colour/surface/cyan` | `--sd-colour-surface-cyan` | #DFF2F1 |
| Grey minimal bg | `colour/surface/grey` | `--sd-colour-surface-grey` | #F6F6F6 |
| Ghost border (Grey) | `colour/text/text-disabled` | `--sd-colour-text-disabled` | #BDBDBD |
| Grey ghost/minimal text | `colour/text/text-primary` | `--sd-colour-text-primary` | #252525 |

---

## Accessibility

| Requirement | Implementation |
|---|---|
| Non-interactive | Render as `<span>` or `<div>` — never `<button>` or `<a>` |
| Label text | Always visible — pill text is the accessible content |
| Leading icon | `aria-hidden="true"` — decorative |
| Trailing flag icon | `aria-hidden="true"` — decorative |
| Colour alone | Never rely on colour as the sole indicator of meaning; pair with descriptive label text |
| Screen reader | Label text is read naturally; no ARIA role needed on the pill body |
| Colour contrast | Verify text contrast for all 36 variants meets WCAG 1.4.3 (4.5:1 for 12px text, 3:1 for 14px) |

---

## Engineering interface

```typescript
type PillColor = 'Green' | 'Orange' | 'Purple' | 'Grey';
type PillType  = 'solid' | 'ghost' | 'minimal';
type PillSize  = 'sm' | 'md' | 'lg';

interface PillProps {
  /** Colour variant */
  color?:          PillColor;      // default: 'Purple'
  /** Visual weight */
  type?:           PillType;       // default: 'solid'
  /** Size */
  size?:           PillSize;       // default: 'sm'
  /** Label text — keep to 1–3 words */
  text:            string;
  /** Show leading icon slot */
  leadingIcon?:    boolean;        // default: true
  /** Custom leading icon — defaults to Featured icon if not provided */
  leadIcon?:       ReactNode;
  /** Show trailing flag icon */
  trailingIcon?:   boolean;        // default: true
  /** Custom trailing icon — defaults to Flag-fill if not provided */
  trailIcon?:      ReactNode;
}
```

---

## Acceptance criteria

- [ ] All 36 variants (4 colours × 3 types × 3 sizes) render correctly
- [ ] `sm` = 24px height, `md` = 32px, `lg` = 44px
- [ ] `radius/full` applied — pill shape on all variants
- [ ] All token references match the colour matrix above
- [ ] `colour/surface/orange` token exists in `tokens.css`
- [ ] Leading icon and trailing flag render at 16px (sm/md) and 24px (lg)
- [ ] Both icons carry `aria-hidden="true"` — decorative only
- [ ] Pill body renders as `<span>` or non-interactive `<div>` — never `<button>` or `<a>`
- [ ] No hover, focus, or pressed styles applied — fully non-interactive
- [ ] Label text is readable at all sizes (verify WCAG 1.4.3 contrast)
- [ ] `font/font-size/xs` (12px) for sm/md; `font/font-size/sm` (14px) for lg

---

## Changelog

| Version | Date | Change |
|---|---|---|
| 1.0.0 | 2026-06-10 | Initial spec — non-interactive status/information label, 36 variants (4 colour × 3 type × 3 size), new `colour/surface/orange` token, trailing flag decorative. Interactive scenarios handled by separate Interactive Pill component. |
