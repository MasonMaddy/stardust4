# Pill — Review Decision Log

**Date:** 2026-06-10
**Figma node:** [1:13590](https://www.figma.com/design/a7JnfZ0Nd8df1TBPaMQ5Tj/Stardust-Components?node-id=1-13590)
**Review rounds:** 2 (initial 2026-06-05, re-review after Figma updates 2026-06-10)

---

## Changes made in Figma between reviews

| Change | Status |
|---|---|
| Size naming: `Small`/`medium`/`large` → `sm`/`md`/`lg` | ✅ Done |
| Orange minimal token: `colour/orange/50` (primitive) → `colour/surface/orange` (semantic) | ✅ Done — new token needs adding to tokens.css |
| Removed `checkbox` and `radio` boolean props | ✅ Done |
| Trailing icon: `Clear-cross-fill` → `Flag-fill` | ✅ Done — fundamental semantic change |

---

## Decision log

| # | Topic | Decision | Notes |
|---|---|---|---|
| 1 | Orange minimal primitive token | ✅ Resolved | `colour/surface/orange` (#FEF2E0) — semantic token created; must be added to tokens.css |
| 2 | Size naming inconsistency | ✅ Resolved | `sm` / `md` / `lg` — fixed in Figma |
| 3 | Colour names vs semantic naming | **Keep** | Green/Orange/Purple/Grey remain as colour-based names |
| 4 | Missing interactive states | **N/A** | Pill is non-interactive; no hover/focus/pressed states needed |
| 5 | Dismiss touch target below minimum | ✅ Resolved | Flag icon is decorative — no touch target requirement |
| 6 | Embedded Checkbox/Radio components | ✅ Resolved | Removed entirely from the component |
| 7 | Grey solid uses `colour/surface/inverse` | **Keep** | Intentional dark neutral variant |
| 8 | Usage — status/information vs priority framing | **Adapt** | Pill is a non-interactive status/information label. A separate interactive pill component handles filtering/selection scenarios |
| 9 | ARIA role and dismiss label | ✅ Resolved | No interactive elements; pill is presentational. Flag icon is `aria-hidden="true"` |
| 10 | Motion spec | **None needed** | Component is non-interactive; no animation required |

---

## New item: `colour/surface/orange` token

Must be added to `docs/assets/css/tokens.css` in the Surface section:
```css
--sd-colour-surface-orange: var(--sd-colour-orange-50); /* #FEF2E0 */
```

And a swatch added to `docs/tokens/colour.html`.
