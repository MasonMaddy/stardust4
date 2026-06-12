# Title Block — Component Specification

**Source of truth:** [Figma node 3777:480](https://www.figma.com/design/a7JnfZ0Nd8df1TBPaMQ5Tj/Stardust-Components?node-id=3777-480)
**Status:** WIP (v1.0.0)
**Review log:** `title-block-review.md`

---

## Overview

A horizontal layout block combining a square Avatar with a content column (title, subtitle, 0–N non-interactive pills). Used as a header pattern for profile cards, list items, and detail views. Fully **non-interactive** — no hover or pressed states.

Assembles existing components: [Avatar](../components/avatar.html) and [Pill](../components/pill.html).

---

## Variant matrix

| Property | Values | Default | Notes |
|---|---|---|---|
| `titleWeight` | `semibold`, `medium` | `medium` | `semibold`=Inter 600, `medium`=Inter 500; both 20px/24px lh |
| `showAvatar` | `true`, `false` | `true` | Shows square Avatar (max 64px) |
| `showTitle` | `true`, `false` | `true` | Shows title text |
| `showSubtitle` | `true`, `false` | `true` | Shows subtitle text |
| `pills` | `string[]` | `[]` | Array of pill label strings; empty = no pill row rendered |
| `title` | string | `'Title'` | Title text — truncates with ellipsis when container is width-constrained |
| `subtitle` | string | `'Subtitle'` | Subtitle text |

---

## Anatomy

| # | Part | Notes |
|---|---|---|
| 1 | **Container** | `display: inline-flex` · `align-items: center` · gap 12px |
| 2 | **Avatar slot** | Uses `ds-avatar` component · fixed square size via `--avatar-size` · `radius/m` for square shape |
| 3 | **Content column** | `display: flex; flex-direction: column` · gap 4px · `min-width: 0` (enables truncation) |
| 4 | **Title** | 20px / 24px lh · `semibold`=600 or `medium`=500 · `colour/text/text-primary` · ellipsis on overflow |
| 5 | **Subtitle** | 14px / 23px lh · Inter Regular 400 (Subtitle/Regular) · `colour/text/text-primary` · ellipsis on overflow |
| 6 | **Pills row** | `display: flex; gap: 4px; flex-wrap: wrap` · only rendered when `pills.length > 0` · uses `ds-pill--sm ds-pill--green ds-pill--minimal` |

---

## Layout

```
┌─────────────────────────────────────────────────────┐
│  [Avatar]  ←12px→  [Title (semibold or medium)]     │
│  max 64px           [Subtitle]                       │
│                     [Pill] [Pill] [Pill…]            │
└─────────────────────────────────────────────────────┘
```

- Container: `inline-flex`, width hugs content, no max-width on container itself
- Avatar: `ds-avatar ds-avatar--square` with `--avatar-size` set by the parent · `flex-shrink: 0`
- Content column: `min-width: 0` — critical for text-overflow: ellipsis to work
- Title + subtitle: `white-space: nowrap; overflow: hidden; text-overflow: ellipsis`
- Truncation: only activates when an ancestor constrains the width

---

## Token references

| Part | Property | Token | Value |
|---|---|---|---|
| Container | gap | `spacing/stack-gap/loose` | 12px |
| Content column | gap | `spacing/stack-gap/tight` | 4px |
| Avatar | size | — | Fixed square — set via `--avatar-size` on the `ds-avatar` element |
| Avatar | radius | `radius/m` | 8px |
| Title | font-size | `font/font-size/lg` | 20px |
| Title | line-height | — | 24px |
| Title (semibold) | font-weight | `font/weight/semibold` | 600 |
| Title (medium) | font-weight | `font/weight/medium` | 500 |
| Title | color | `colour/text/text-primary` | #252525 |
| Subtitle | font-size | `font/font-size/sm` | 14px |
| Subtitle | line-height | `font/line-height/sm` | 23px |
| Subtitle | font-weight | `font/weight/regular` | 400 — Subtitle/Regular style (changed from Subtitle/Medium 2026-06-12) |
| Subtitle | color | `colour/text/text-primary` | #252525 |
| Pills | style | `ds-pill--sm ds-pill--green ds-pill--minimal` | surface/cyan bg, action/primary text |
| Pills | gap | `spacing/stack-gap/tight` | 4px |

---

## CSS class structure

```
.ds-title-block              — root container (inline-flex, gap 12px)
.ds-title-block__avatar      — avatar wrapper (flex-shrink: 0, max 64px)
.ds-title-block__content     — content column (flex column, gap 4px, min-width: 0)
.ds-title-block__title       — title text (20px, margin:0, ellipsis, inherits weight from modifier)
.ds-title-block__title--semibold  — font-weight: 600
.ds-title-block__title--medium    — font-weight: 500
.ds-title-block__subtitle    — subtitle (14px/23px, Regular 400 — Subtitle/Regular, margin:0, ellipsis)
.ds-title-block__pills       — pills row (flex, gap 4px, flex-wrap: wrap)
```

---

## Accessibility

| Requirement | Implementation |
|---|---|
| Non-interactive | No role beyond semantic HTML — `<div>` container, `<p>` for text |
| Avatar alt text | Avatar image must have a descriptive `alt` attribute (e.g. child's name) |
| Pills | Non-interactive — `aria-hidden="true"` unless pill content is meaningful; use `ds-pill` (span, not button) |
| Truncation | If title may truncate, add `title="[full text]"` attribute for tooltip on hover |
| Parent context | If the Title Block is inside a clickable card, the card element carries the accessible name and role |

---

## Engineering interface

```typescript
interface TitleBlockProps {
  title?:       string;        // default: 'Title'
  subtitle?:    string;        // default: 'Subtitle'
  titleWeight?: 'semibold' | 'medium'; // default: 'semibold'
  showAvatar?:  boolean;       // default: true
  showTitle?:   boolean;       // default: true
  showSubtitle?: boolean;      // default: true
  /** Array of pill label strings. Empty array = no pills row. */
  pills?:       string[];      // default: []
  /** Slot for the Avatar component — accepts any Avatar variant */
  avatar?:      ReactNode;
}
```

---

## Acceptance criteria

- [ ] Container: `inline-flex`, `align-items: center`, gap 12px
- [ ] Avatar: uses `ds-avatar ds-avatar--square` · size set via `--avatar-size` · `flex-shrink: 0`
- [ ] Content column: `flex-direction: column`, gap 4px, `min-width: 0`
- [ ] Title semibold: 20px / 24px lh / Inter 600 / `colour/text/text-primary`
- [ ] Title medium: 20px / 24px lh / Inter 500 / `colour/text/text-primary` — **default weight**
- [ ] Title: `white-space: nowrap; overflow: hidden; text-overflow: ellipsis` — truncates in constrained parent
- [ ] Subtitle: 14px / 23px lh / Inter 400 Regular (Subtitle/Regular) / `colour/text/text-primary` / ellipsis
- [ ] Pills row: only rendered when `pills.length > 0`; uses `ds-pill--sm ds-pill--green ds-pill--minimal`; gap 4px; flex-wrap
- [ ] `showAvatar`, `showTitle`, `showSubtitle` independently toggleable
- [ ] No hover, focus, or pressed states on the component itself
- [ ] `min-width: 0` on content column enables text truncation without breaking flex layout
- [ ] `margin: 0` on title and subtitle `<p>` elements — overrides main.css `p { margin-bottom: 0.9rem }` (14.4px)

---

## Changelog

| Version | Date | Change |
|---|---|---|
| 1.0.2 | 2026-06-12 | Subtitle type style changed Subtitle/Medium → Subtitle/Regular (font-weight 500 → 400; 14px/23px unchanged). CSS, doc page and dependent Card references updated; Figma text style updated by Mason. |
| 1.0.1 | 2026-06-11 | titleWeight default changed semibold→medium. Subtitle updated: 12px Regular→14px Medium 500 (Subtitle/Medium style). Avatar size guide updated: title+subtitle → 56px (was 44px). |
| 1.0.0 | 2026-06-11 | Initial spec. Composite of Avatar + text content + Pills. `titleWeight` renamed from bold/medium to semibold/medium. Pills dynamic array. Avatar max 64px scales down. Truncation via ellipsis in constrained parent. |
