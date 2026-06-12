# Clickable Card (ds-card) — Component Specification

**Source of truth:** [Figma node 4776:3152](https://www.figma.com/design/a7JnfZ0Nd8df1TBPaMQ5Tj/Stardust-Components?node-id=4776-3152) — 28 variants (6 types × Default/selected, + hover/focus/pressed/disabled for the clickable family, added 2026-06-12)
**Status:** WIP (v0.1.0 — Phase 2 spec)
**Review log:** `clickable-card-review.md`

---

## Overview

A full-width row card: **Title Block (avatar + title + subtitle + pills) on the left, a swappable
trailing slot on the right**. Despite the Figma name, it covers **two interaction families plus a
plain container**:

| Family | Figma `type` | Card behaviour |
|---|---|---|
| **Clickable** (`ds-card--clickable`) | `icon` | The whole card is a single link/button; chevron-right affordance |
| **Selectable** (`ds-card--selectable`) | `radio`, `checkbox`, `switch` | The whole card is a single form control; the glyph is visual-only |
| **Container** (plain `ds-card`) | `text`, `buttons` | The card is NOT interactive; the inner text action / buttons are |

Composes existing components only (review D7): `ds-avatar --square --image` (64px), `ds-title-block`
(as specified in `title-block-spec.md` — including `ds-pill--sm --green --minimal` pills),
`ds-btn --ghost --icon-only` (buttons row), and the **visual classes** of `ds-radio` / `ds-checkbox` /
`ds-toggle` for the selection glyphs.

---

## Variant matrix

| Property | Values | Default | Notes |
|---|---|---|---|
| `variant` | `clickable`, `radio`, `checkbox`, `switch`, `container` | `container` | Drives semantics (below). Figma `text`/`buttons` types are `container` with different trailing content |
| `selected` | `true`, `false` | `false` | **Selectable family only** (review D3). Not valid for clickable/container |
| `disabled` | `true`, `false` | `false` | Clickable + selectable families |
| `trailing` | slot | per variant | chevron (clickable) · glyph (selectable, rendered by the component) · free content (container) |
| Title Block props | — | — | `title`, `subtitle`, `pills[]`, `avatar` pass through to `ds-title-block` |

---

## Anatomy

| # | Part | Notes |
|---|---|---|
| 1 | **Container** | flex row · `justify-content: space-between` · `align-items: center` · padding `spacing/5` (20px) · `radius/lg` (16px) · `surface/default` · 1px `border/default` · fluid width |
| 2 | **Title Block slot** | `ds-title-block` exactly per its own spec (review D5 — no card-local typography). `min-width: 0` for truncation |
| 3 | **Trailing slot** | gap to content `stack-gap/loose` (12px) · `flex-shrink: 0` · content per variant |

Trailing slot contents:
- `clickable` — `chevron-right.svg` at **16px**, `text-secondary` (not the Figma 25px one-off — review D7)
- `radio` / `checkbox` — 24px glyph using `ds-radio`/`ds-checkbox` visual classes, `aria-hidden`
- `switch` — 40×24 `ds-toggle` visuals, `aria-hidden`
- `container` — any content; reference patterns: minimal text action (14px medium `action/primary`) or a row of `ds-btn ds-btn--ghost ds-btn--icon-only` (48px) with `stack-gap/default` (8px) gap

---

## States (review D1 + D6)

| State | Treatment |
|---|---|
| Default | `surface/default` bg · 1px `border/default` |
| Hover (clickable + selectable) | bg `surface/grey` — flat, no elevation |
| Focus (`:focus-visible`) | 1px `border/focus` + standard halo `0 0 1px 4px feedback/success/subtle` |
| Pressed | bg `grey/300` (primitive — see open questions) |
| **Selected** (selectable only) | **2px `action/primary` border + `surface/cyan` fill + `action/primary` title, NO halo** — matches the multi-select dropdown selected-row pattern. Hover/pressed while selected → `surface-cyan-hover` |
| Disabled | content colours → `text-disabled`, glyph disabled treatment, `cursor: not-allowed`. (Figma parity variants use 0.6 opacity shorthand) |

**No layout shift on select:** default keeps its 1px `border/default`; selected sets
`border-color: action/primary` plus `box-shadow: inset 0 0 0 1px action/primary` to thicken to a
visual 2px without changing box size. (Flat inset shadow — not elevation.)

---

## Semantics & keyboard (review D2)

| Variant | Element & ARIA | Keyboard |
|---|---|---|
| `clickable` | Single `<a>` (navigation) or `<button>` (action). Whole card is the hit area, one tab stop. Chevron `aria-hidden` | Enter (+ Space for button) |
| `radio` | Card div `role="radio"` `aria-checked` `tabindex` per roving-tabindex group inside `role="radiogroup"`; glyph `aria-hidden` | Arrows move+select within group, Space selects |
| `checkbox` | Card div `role="checkbox"` `aria-checked` `tabindex="0"`; glyph `aria-hidden` | Space toggles |
| `switch` | Card div `role="switch"` `aria-checked` `tabindex="0"`; toggle visuals `aria-hidden` | Space (and Enter) toggles, takes effect immediately |
| `container` | Plain `<div>` — no role, not focusable. Inner buttons/links are the interactive elements | Inner controls' native behaviour |

- Card control name comes from the title: `aria-labelledby` → title element id; subtitle via `aria-describedby` if needed.
- Never nest interactive elements inside the clickable/selectable card (invalid HTML, broken SR output).
- Touch target: the whole card (≥104px tall at default content) — far exceeds 44px.

---

## Token references

| Part | Property | Token | Value |
|---|---|---|---|
| Container | padding | `spacing/5` | 20px |
| Container | radius | `radius/lg` | 16px |
| Container | bg | `colour/surface/default` | #FFFFFF |
| Container | border | `colour/border/default` | #D0C7E5 |
| Container | content↔trailing gap | `spacing/stack-gap/loose` | 12px |
| Hover | bg | `colour/surface/grey` | #F6F6F6 |
| Pressed | bg | `colour/grey/300` (primitive) | #F1F1F1 |
| Focus | border | `colour/border/focus` | #00776B |
| Focus | halo | `colour/feedback/success/subtle` spread `spacing/1` | #DFF2F1 / 4px |
| Selected | border | `colour/action/primary` | #00776B |
| Selected | bg | `colour/surface/cyan` | #DFF2F1 |
| Selected | title | `colour/action/primary` | #00776B |
| Selected hover/pressed | bg | `colour/surface/cyan-hover` | #AFDEDC |
| Disabled | text/glyph | `colour/text/text-disabled` | #BDBDBD |
| Chevron | colour | `colour/text/text-secondary` | #838383 |
| Motion | bg/border transitions | `--sd-motion-duration-base` / `--sd-motion-easing-default` | 150ms |
| Buttons row | gap | `spacing/stack-gap/default` | 8px |

No new tokens required.

---

## Figma deltas applied 2026-06-12

- All 6 `state=selected` variants restyled: 2px `action/primary` border, halo removed (D1)
- `Switch` component set: missing `State=on, variant=Default` created; card `switch+selected` now shows ON (D3)
- 16 new variants: `state = hover | focus | pressed | disabled` × `type = icon | radio | checkbox | switch` (D6)

## Figma follow-ups (design)

- [ ] TitleBlock instance inside ClickableCard has drifted typography (subtitle 12px vs spec 14px Subtitle/Regular) — align to the Title Block component (D4/D5)
- [ ] Remove the now-deprecated `selected` variants for `type = icon | text | buttons` once instances are migrated (D3)
- [ ] Switch set has a stray case-duplicate value `State=Off` alongside `off` — merge
- [ ] Chevron drawn at 25px — swap to standard 16px icon

## Open questions

1. Pressed bg uses the `grey/300` primitive — consider a semantic alias (e.g. `surface/grey-pressed`) alongside `surface-cyan-hover`.
1b. On a selected card the `ds-pill --green --minimal` pills (surface/cyan bg) sit on the
    surface/cyan card fill — the pill shape disappears, only its text reads. Options: accept
    (dropdown rows never carried pills), switch selected-card pills to the solid green variant,
    or give pills a border on cyan surfaces. Visible in the sandbox — needs a design call.
2. Does navigation need an `active`/current-page treatment to replace the dropped `selected` on clickable cards?
3. Radio-card group: roving tabindex vs all-tabbable — spec says roving (matches ds-radio).
