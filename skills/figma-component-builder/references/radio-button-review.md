# Radio Button — Review Decision Log

**Date:** 2026-06-04  
**Figma node:** [824:152112](https://www.figma.com/design/a7JnfZ0Nd8df1TBPaMQ5Tj/Stardust-Components?node-id=824-152112)  
**MD3 reference:** https://m3.material.io/components/radio-button/specs · /guidelines  
**Checkbox precedent:** checkbox-spec.md v1.1.0

---

## Decision Log

| # | Topic | Decision | Notes |
|---|---|---|---|
| 1 | Touch target 44px (vs MD3 48dp) | **Keep** | System-wide 44px standard, consistent with Checkbox |
| 2 | Glyph as image assets vs inline SVG | **Adapt** | 20px size correct; Phase 4 web must use inline SVG with live token colours |
| 3 | Border-radius inconsistency on touch target | **Align** | ✅ Updated in Figma — all states now use `radius/full` token |
| 4 | Inner padding `spacing/stack-gap/loose` (12px) | **Keep** | Correct; document in spec |
| 5 | Missing hover state | **Adapt** | Deferred to Phase 4; tokens: unselected hover → `colour/surface/grey`, selected hover → `colour/surface/cyan` |
| 6 | Focus halo uses raw `colour/grey/400` (#e2e2e2) | **Align** | ✅ Updated in Figma — focused → `colour/focus/secondary`, selected-focused → `colour/focus/primary` |
| 7 | Missing pressed state | **Adapt** | Create pressed variant using Stardust tokens aligned with MD3: unselected pressed → `colour/text/text-secondary`, selected pressed → `colour/feedback/success/default` |
| 8 | No selection transition | **Align** | MD3 motion tokens — dot scale 100ms Standard in, 100ms Standard Accelerate out; state layer 200ms in / 150ms out |
| 9 | No press squeeze | **Adapt** | `scale(0.85)` on glyph at 75ms — matches Checkbox; not in MD3 but established Stardust pattern |
| 10 | No `prefers-reduced-motion` | **Align** | All transitions off; states change instantly |
| 11 | Roving tabindex / keyboard not specified | **Align** | Tab enters/exits group; Arrow keys move + select; Space selects; Enter does nothing |
| 12 | Deselection behaviour not documented | **Align** | Clicking selected radio has no effect; group always has one active selection |
| 13 | Group label requirements not specified | **Align** | `<fieldset>` + `<legend>` or `role="radiogroup"` + `aria-labelledby`; usage guidelines |
| 14 | Glyph colour baked in assets | **Adapt** | Phase 4 SVG token bindings: selected fill → `colour/action/primary`, unselected ring → `colour/border/strong`, disabled → `colour/text/text-disabled` |
| 15 | Focus halo binds raw primitive | **Align** | ✅ Fixed via Decision 6 — same action |
| 16 | Hover/pressed halo tokens not defined | **Adapt** | All reuse Checkbox tokens; no new tokens needed |
| 17 | `hover`/`pressed` Figma variants missing | **Adapt** | Add to Figma in Phase 4 using Stardust tokens following MD3 guidelines |
| 18 | ARIA role/group semantics not documented | **Align** | Native `<input type="radio">`, `aria-checked`, `aria-disabled`, `role="radiogroup"` |
| 19 | Focus indicator may not meet WCAG 2.4.11 | **Align** | Use `colour/focus/primary`/`colour/focus/secondary` consistently; flag for token lead review |
| 20 | Disabled via asset not tokens | **Align** | Phase 4: `colour/text/text-disabled` on ring stroke, `pointer-events: none`, `aria-disabled="true"` |

---

## Figma updates made (before Phase 2)
- [x] Decision 3: All five states now use `radius/full` token on touch target
- [x] Decision 6: `focused` → `colour/focus/secondary` (#BDBDBD); `selected-focused` → `colour/focus/primary` (#7BCAC5)

## Phase 4 Figma work (deferred)
- [ ] Add `hover` + `selected-hover` states (Decision 5/17)
- [ ] Add `pressed` + `selected-pressed` states (Decision 7/17)
