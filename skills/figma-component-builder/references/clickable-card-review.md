# Review Decision Log — Clickable Card (ds-card)

Date: 2026-06-12
Figma source: Stardust Components (`a7JnfZ0Nd8df1TBPaMQ5Tj`) node `4776:3152` — component set "ClickableCard", 12 variants (`type = icon | text | buttons | radio | checkbox | switch` × `state = Default | selected`)
Review mode: Stardust compliance (MD3 referenced for state layers)

| # | Topic | Decision | Notes |
|---|---|---|---|
| 1 | Selected state vs focus treatment | **Adapt** | Selected = 2px `action/primary` border, **no halo**; halo stays reserved for `:focus-visible`. Figma selected variants restyled to match (done 2026-06-12). |
| 2 | Nested interactive controls | **Adapt** | Selection family (radio/checkbox/switch) + icon: the **card is the single control** (`role="radio"`/`"checkbox"`/`"switch"` or link) — inner glyph `aria-hidden`, visual classes only, one tab stop, full-card hit area. Buttons/text types: card is a **non-interactive container**; inner controls are the interactive elements. |
| 3 | `selected` scope | **Adapt** | Selected exists only for radio/checkbox/switch. Dropped for icon/text/buttons (rename to `active` later if current-page nav needs it). Figma: switch-off-while-selected fixed (knob on, rail active). Removing the icon/text/buttons selected variants in Figma deferred — may break instances; flagged for design cleanup. |
| 4 | Pills inside the card | **Align (to DS)** | Pills are the **ds-pill green minimal variant**, nested inside ds-title-block exactly as that component defines them. No cyan pill variant. The Figma cyan pill styling inside ClickableCard's TitleBlock instance is drift to fix in Figma. |
| 5 | Title/subtitle typography | **Align** | Card reuses **ds-title-block as-is** (title medium 500, subtitle 14px medium text-secondary, green minimal pills). Card-local 20px title / 12px primary subtitle in Figma is drift to fix. |
| 6 | Interaction states | **Adapt** | Web defines hover (`surface-grey` tint, flat — no elevation), `:focus-visible` (standard halo: `border/focus` + success-subtle ring), pressed (deeper tint `grey-300`), disabled (standard disabled treatment). Added to Figma as `state` variants for the clickable family (done 2026-06-12). |
| 7 | Component reuse | **Align** | Compose existing DS pieces only: `ds-avatar --square --image` (64px), `ds-title-block`, `ds-pill`, `ds-btn --ghost --icon-only` (buttons row), visual classes of `ds-radio`/`ds-checkbox`/`ds-toggle` (selection glyphs), `chevron-right.svg` at 16px (not the 25px one-off). |
| 8 | Naming | **Adapt** | `ds-card` base + `--clickable` (icon/link family) and `--selectable` (radio/checkbox/switch family) modifiers. Plain `ds-card` container falls out for free. Figma rename optional. |

## Changes required for Spec phase

- [ ] Container spec: `surface/default`, 1px `border/default`, `radius/lg`, `spacing/5` (20px) padding, flex row space-between, `stack-gap/loose` (12px) internal gap; fluid width (411px is instance-specific)
- [ ] Selected (selectable family only): 2px `action/primary` border, no halo; compensate border-width change so layout doesn't shift (border-box + padding adjust or pre-allocated 2px transparent border)
- [ ] States: hover/pressed tints, `:focus-visible` halo, disabled
- [ ] Semantics per D2: single-control pattern vs container pattern; `aria-labelledby` wiring from card control to title
- [ ] Trailing slot spec per type, reusing DS components (D7)
- [ ] Keyboard: Space/Enter toggles selectable cards; switch follows `role="switch"` conventions
- [ ] No new tokens required
- [ ] Figma cleanup (design follow-ups): TitleBlock drift inside ClickableCard (D4/D5), remove icon/text/buttons selected variants (D3)
