# Selection Pill — Review Decision Log

**Date:** 2026-06-10
**Figma node:** [5118:5101](https://www.figma.com/design/a7JnfZ0Nd8df1TBPaMQ5Tj/Stardust-Components?node-id=5118-5101)

---

## Decision log

| # | Topic | Decision | Rationale |
|---|---|---|---|
| 1 | Height 44px | **Keep** | Touch-safe. Consistent with Button and FAB lg. |
| 2 | Leading icon | **Adapt** | Updated in Figma: `leadingIcon` is now a boolean prop. Decorative, `aria-hidden="true"`. |
| 3 | Hover/focus border pattern | **Align** | Hover = 1px border + glow, Focus = 2px border + glow. Matches Button exactly. |
| 4 | Selected = `surface/green` bg | **Align** | Token exists. 2px `action/primary` border on selected. |
| 5 | Three right-side controls | **Adapt** | Replaced `fab/radioButton/checkbox` boolean trio with a single `selectionType: 'none' \| 'dismiss' \| 'radio' \| 'checkbox'` prop. Prevents invalid combinations. |
| 6 | FAB state tracks pill state | **Align** | FAB bg: default=`surface/cyan`, hover=`focus/primary`, selected=`action/hover`, disabled=`text/text-disabled`, focus=same as hover. Dark FAB on selected confirmed intentional. |
| 7 | Whole pill is tap target | **Align** | Radio and checkbox indicators are `aria-hidden="true"` decorators. State conveyed by `aria-pressed` on the pill element. Dismiss FAB (`selectionType='dismiss'`) is a separate nested `<button>`. |
| 8 | Glow on hover | **Align** | Box-shadow `0 0 1px 4px feedback/success/subtle` on hover AND focus, matching Button. |
| 9 | Separate page | **Keep** | `docs/components/selection-pill.html`. Links back to `pill.html`. |
| 10 | Name | **Keep** | "Selection Pill". Clear, consistent with existing "Pill" naming. |
