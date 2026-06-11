# Title Block — Review Decision Log

**Source:** Figma node [3777:480](https://www.figma.com/design/a7JnfZ0Nd8df1TBPaMQ5Tj/Stardust-Components?node-id=3777-480)
**Date:** 2026-06-11

---

## Decision log

| # | Topic | Decision | Rationale |
|---|---|---|---|
| 1 | Avatar sizing | **Adapted** | Max 64×64px, scales down. Avatar is `max-width: 64px; max-height: 64px` within the flex container. It does not stretch upward beyond 64px but can be smaller in constrained layouts. |
| 2 | titleWeight naming | **Adapted** | Renamed from Figma's "bold"/"medium" to token names: `semibold` (Inter SemiBold 600) and `medium` (Inter Medium 500). Both at 20px/24px lh. Avoids confusion with CSS `font-weight: 700`. |
| 3 | Avatar–content gap | **Aligned** | 12px = `spacing/stack-gap/loose`. Fixed, no variation. |
| 4 | Content column gap | **Aligned** | 4px = `spacing/stack-gap/tight` between title, subtitle, pills. Fixed. |
| 5 | Pill count | **Adapted** | Dynamic array prop (`pills: string[]`) or slot instead of Figma's boolean `showPill`. Any number of pills rendered. `showPill` becomes `pills.length > 0`. |
| 6 | Pill style | **Aligned** | Uses existing `ds-pill--sm ds-pill--green ds-pill--minimal` classes. No new styles needed. |
| 7 | Show booleans | **Aligned** | `showAvatar`, `showTitle`, `showSubtitle` all independently controllable. |
| 8 | Title overflow | **Adapted** | `white-space: nowrap; overflow: hidden; text-overflow: ellipsis`. Truncates when placed in a width-constrained parent. Hug-width by default (no truncation until constrained). |
| 9 | Component page | **Own page** | `docs/components/title-block.html`. Full 10-section page. |
| 10 | No interactive states | **Kept** | Non-interactive display component. Parent handles click/hover if needed. |
