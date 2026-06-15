# Bottom Sheet (ds-sheet) — Component Specification

**Source of truth (web behaviour):** sandbox exploration approved 2026-06-12 (`bottom-sheet-notes.md`)
**Figma comparison:** PENDING — Mason has a Figma design not yet reviewed against this spec
**Status:** Built (v1.0.0) — web component; native platforms use platform containers

---

## Overview

A modal surface that slides up from the bottom edge for mobile selection and quick tasks.
**Web only**: native iOS/Android apps must use the platform sheet containers (see Platform
sections on the doc page). Composes existing DS pieces: rows are slim selectable **ds-cards**
(title-only Title Blocks), CTAs and the X close are **ds-btn**.

## Structure & classes

```
.ds-sheet-overlay (fixed, z-modal; .is-open shows)
  .ds-sheet__scrim          — colour/scrim (#00000066), click dismisses
  .ds-sheet                 — surface/default, radius/lg top corners, max-height 75%
    .ds-sheet__grabber      — 36×4 grey-500, decorative (aria-hidden)
    .ds-sheet__header       — title (20px medium) + optional actions (Clear, X close)
    .ds-sheet__search       — optional pinned search Input slot (combobox-in-sheet)
    .ds-sheet__empty        — no-results line for filtered lists
    .ds-sheet__list         — scrolling content; gap 8px; compact ds-card rows
    .ds-sheet__footer       — optional CTA bar (+ env(safe-area-inset-bottom))
.ds-sheet--centered         — tablet: capped at min(640px, 100%−32px), centred
```

Rows: `ds-card ds-card--selectable ds-card--compact` (card.css owns the dense metrics — 44px min-height touch floor, collapsed glyphs, 14px/20px type, content-adaptive height). bottom-sheet.css carries no row metric overrides.

## Behaviour

| Aspect | Spec |
|---|---|
| Open/close | `.is-open` on the overlay; slide-up at `motion/duration/slow` + `easing/standard`; reduced-motion disables |
| Dismiss | Scrim click, Escape, X close button (ds-btn minimal icon-only, clear-cross icon). Focus moves to the sheet on open and back to the trigger on close |
| X close rule | **Required** when the sheet has a confirm CTA; optional on instant (auto-close) sheets |
| Single-select, instant | Radio ds-cards, auto-close ~250ms after pick, no header actions |
| Single-select, consequential | Radio ds-cards + full-width Confirm ds-btn + X close |
| Multi-select | Checkbox ds-cards + full-width **Apply (n)** ds-btn with live count + X close |
| **Container** | Mixed-content body (compact cards + selection pills + section labels + any DS content). Header: `ds-sheet__title` + `ds-fab--md --default` close. Footer optional — 0, 1 or 2 `ds-btn` (ghost/solid) |
| Scroll dividers | MD3 pattern: 1px `border/default` under header / above footer **only while content is scrolled behind** (`.has-scroll-top` / `.has-scroll-bottom`, JS-synced from list scroll) |
| Tablet | `--centered` (M3 640dp cap). Beyond tablet, don't use a sheet — dialog or the Phase 2 Select dropdown |
| Heights | Fixed max 75% viewport. Web detents/drag-to-dismiss deliberately out of scope v1 |
| Keyboard avoidance | Sheets with inputs (combobox search) shrink above the on-screen keyboard — implementation via the `visualViewport` resize event (or `interactive-widget=resizes-content`); behaviour demoed with a simulated keyboard in the sandbox (2026-06-12) |
| Date/time | **Always native OS pickers on mobile** (decided 2026-06-12) — never a sheet. Desktop web date pattern to be added to the library later (Mason) |

## Tokens

scrim `colour/scrim` · surface `colour/surface/default` · radius `radius/lg` · grabber
`colour/grey/500` · z `z-index/modal` · dividers `colour/border/default` · motion
`motion/duration/slow|base` + `easing/standard|default` · title `font/size/lg` +
`font/weight/medium` · spacing `spacing/4`, `spacing/2`, `spacing/1`.

## Accessibility

- Overlay: `role="dialog"` `aria-modal="true"`, labelled by the sheet title (`aria-labelledby`)
- Grabber decorative (`aria-hidden`); drag is not a web affordance in v1
- Row semantics inherit the Card spec (whole-card radio/checkbox controls, roving tabindex for radio groups)
- Focus: to sheet on open, returned to trigger on close. **v1 gap: full focus trap** (Tab can
  escape the dialog) — acceptance item for engineering implementations
- Keyboard avoidance: target behaviour demoed (sandbox simulated keyboard, 2026-06-12); production implementation via `visualViewport` is an engineering acceptance item

## Platform rule (doc page has full iOS/Android sections)

| Context | Use |
|---|---|
| Native iOS | `UISheetPresentationController` / SwiftUI `presentationDetents` — DS-styled content inside. iPad: form sheet or popover, never a bottom sheet |
| Native Android | M3 `ModalBottomSheet` — DS-styled content inside. Tablet: 640dp cap (automatic) or modal side sheet |
| Mobile web / PWA / webview | This component |
| Desktop web | Never — dropdown (Select) or dialog |

## Open questions

1. Figma comparison still pending (Mason's design)
2. Web detents (medium/large) and drag-to-dismiss — v2 if product needs them
3. Full focus trap — engineering acceptance criterion, not in the demo JS
4. Pressed-tint semantic alias (`grey/300` primitive) — shared with Card

## Changelog

| Version | Date | Change |
|---|---|---|
| 1.3.0 | 2026-06-15 | Container variant added (mixed-content body, `ds-fab--md --default` close, optional footer). Clear button removed from multi-select. |
| 1.2.0 | 2026-06-12 | `__search` and `__empty` elements built from the Input Phase 3 sandbox (combobox-in-sheet). |
| 1.1.0 | 2026-06-12 | Rows moved to `ds-card--compact` (44px floor). Keyboard-avoidance behaviour demoed. Date/time confirmed always-native on mobile; desktop web pattern to follow (Mason). |
| 1.0.0 | 2026-06-12 | Initial build from sandbox exploration. Scrim token created (CSS/DTCG/Figma). MD3 scroll dividers, tablet centring, three dismiss patterns. |
