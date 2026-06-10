# FAB — Review Decision Log

**Source:** Figma node [5088:15241](https://www.figma.com/design/a7JnfZ0Nd8df1TBPaMQ5Tj/Stardust-Components?node-id=5088-15241)
**Date:** 2026-06-10

---

## Decision log

| # | Topic | Decision | Rationale |
|---|---|---|---|
| 1 | Size scale | **Adapted** — md updated to 32px (on our spacing/8 grid). sm=24, md=32, lg=44, xl=56 | xl height derives from 14px pad + 28px icon + 14px pad = 56px. All sizes now land on the 8px grid. |
| 2 | Icon sizes | **Adapted** to grid-aligned values: sm=12px, md=20px, lg=22px, xl=28px | Figma inset-1/4 pattern kept for sm/md/lg; xl is explicit 28px. Grid alignment takes priority. |
| 3 | Fully circular shape | **Aligned** — `radius/full` (9999px) on all sizes and states | Consistent with Stardust's pill/circular pattern; no per-size radius override needed. |
| 4 | Token name `colour/focus/default` | **Adapted** — map to our existing `--sd-colour-focus-primary` (#7BCAC5) | Same value, different name. No new token needed; always use `--sd-colour-focus-primary` in code. |
| 5 | Tertiary hover bg = same as default bg | **Kept** — `colour/feedback/warning/subtle` = `colour/surface/orange` (#FEF2E0); hover is visually distinct via state-awareness even if bg is same hex | Focus adds 2px border. Cursor change covers the hover differentiation requirement. Acceptable for now. |
| 6 | `inverse` state renamed | **Adapted** to `filled` — disambiguates from the `inverse` type | `state=filled` = the fully-saturated/dark rendering of each type used on coloured backgrounds. Naming clash with type=inverse would have caused confusion. |
| 7 | Focus indicator | **Adapted** — 2px solid border, type-specific colour. No box-shadow. No elevation. | Consistent with Stardust focus pattern established in Button. `:focus-visible` only. |
| 8 | No elevation/shadow | **Kept** — flat design, consistent with Stardust language | Stardust does not use drop shadows for interactive components. |
| 9 | Pressed = full saturated token | **Aligned** with Figma | Saturated background + white icon/text across all types. Provides clear pressed feedback. |
| 10 | FAB name retained | **Kept** — the xl size (56px, optional text) justifies the "FAB" name | sm/md/lg = compact circular actions; xl = true FAB/Extended FAB pattern. MD3 separates these; Stardust unifies under one component. |
