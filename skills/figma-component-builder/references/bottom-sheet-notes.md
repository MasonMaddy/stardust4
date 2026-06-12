# Bottom Sheet — Exploration Notes (pre-review)

Date: 2026-06-12
Status: sandbox exploration approved in principle; formal Figma review pending (Mason has a design)
Sandbox: `docs/sandbox/index.html` → "WIP — Bottom Sheet"

## Native platform findings

Neither platform ships a dedicated multi-select bottom sheet — both provide a sheet **container**
plus list primitives; selection (single and multi) is always composed:

- **iOS** (UISheetPresentationController / SwiftUI `presentationDetents`): medium/large detents,
  optional grabber (~36×5pt), ~10pt top radius, dimmed background. Pickers are single-select;
  multi-select is a composed List with checkmarks, usually Cancel/Done in a header. On iPad,
  sheets become form sheets/popovers.
- **Android M3** (ModalBottomSheet): 28dp top radius, 32×4dp drag handle, ~32% scrim,
  max sheet width **640dp**. Selection = composed checkbox/radio list items.
- Source caveat: m3.material.io and the Apple HIG pages are JS-rendered and could not be
  fetched; values above are from training knowledge — spot-check against the Figma references.

## Stardust proposal (sandbox v3)

- Sheet container: `surface/default`, `radius/lg` top corners, grey-500 grabber (36×4),
  `z-modal` overlay, scrim rgba(0,0,0,0.4) — **scrim token gap flagged**.
- Rows: slim selectable **ds-cards** — title-only Title Blocks (no avatar/subtitle), title at
  `font/font-size/sm` 14px, padding 10px/12px. Whole-card control semantics per Card review D2.
- Single-select: radio cards. Two dismiss flavours demoed: auto-close on pick (instant, low
  risk) vs Confirm CTA (consequential choices).
- Multi-select: checkbox cards + header Clear + **Apply (n)** full-width ds-btn with live count.
- Motion: slide-up at `motion/duration/slow` + `easing/standard`; reduced-motion disables.
- Dismiss: scrim tap, Escape, X close button. Focus moves to sheet on open, returns to
  trigger on close. Full focus trap + drag-to-dismiss are Build-phase concerns.

## Pattern guidance (agreed direction — for the doc page)

| Situation | Use | Why |
|---|---|---|
| Native iOS/Android app | Platform sheet container with DS-styled content | Free detents, drag physics, a11y, keyboard avoidance |
| Date/time on mobile | Native OS pickers | Per the Input spec |
| Mobile web / PWA / webview | Stardust sheet | No native container exists |
| Tablet | Sheet centred, max-width 640px — or prefer a dialog | M3 640dp cap; iPad uses form sheets/popovers |
| Desktop web | No sheet — dropdown (Phase 2 Select) or dialog | Sheets are a thumb-reach pattern |
| Single-select, instant, low risk | Auto-close on pick, no header buttons | Fewest taps |
| Single-select with consequences | Confirm CTA + X close | Review before commit |
| Multi-select | Apply (n) CTA + Clear + X close | Batch commit, live count |
| X close button | Required with a CTA; optional on instant sheets | Visible, focusable dismiss; distinct from Confirm |

## Open items for the formal review

- [ ] Compare against Mason's Figma design (node TBC)
- [ ] Scrim colour token (e.g. `colour/scrim` @ 40%) — Figma variable + tokens.css
- [ ] Detents/heights: fixed ~75% max in the demo; do we need medium/large detents on web?
- [ ] Drag-to-dismiss on web: worth the complexity vs scrim/X/Escape?
- [ ] Sheet title style: currently 20px medium — confirm against Figma
- [ ] Keyboard avoidance for sheets containing inputs (combobox case, Input Phase 3)
