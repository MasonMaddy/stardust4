# Toggle — Review Decision Log
Source: Figma node 1:7963 (named "Switch" in Figma)
Date: 2026-06-10

---

## Decision log

| # | Topic | Decision | Rationale |
|---|---|---|---|
| 1 | Rail slim 12px | **Keep** | Slim iOS-style rail is deliberate Stardust aesthetic, not MD3-style chunky. |
| 2 | Rail=cyan-500 vs knob=cyan-700 on-state | **Keep** | Intentional depth effect: lighter rail (#01A39D) recedes, darker knob (#00776B) sits on top. |
| 3 | Fixed 22px knob (no size change) | **Keep** | Simpler animation, consistent with slim aesthetic. |
| 4 | No built-in touch target | **Adapt** | Add 44×44px minimum touch area via padding/wrapper on the toggle element, consistent with Checkbox. |
| 5 | Focus = 2px border on knob | **Keep** | Border on knob is clear for a round control. Box-shadow glow used on Button/Selection Pill would be lost around the thin rail. |
| 6 | Ripple state layer (29px) | **Adapt** | Implement as `::before` pseudo-element on the knob wrapper. Colours: hover=`feedback/success/subtle` 70%, pressed=`text/text-disabled` 70%, default=`text/text-disabled` 40%. |
| 7 | Knob slide animation | **Adapt** | 200ms `cubic-bezier(0.2,0,0,1)` (MD3 Standard). `transform: translateX(16px)` for off→on. Rail background-color transitions simultaneously. |
| 8 | Rail colour transition | **Align** | `background-color` included in transition property alongside knob transform. |
| 9 | Disabled on/off identical | **Keep** | Both states use `action/disabled` rail and `surface/grey` (70%) knob. Matches MD3 convention. |
| 10 | Label always external | **Keep** | Toggle renders without an attached label. Parent layout associates a `<label>` via `for`/`id`. Component renders as `role="switch"` with `aria-checked`. |
