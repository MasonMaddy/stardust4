# Flow-prototype conventions (cheat-sheet)

The architecture the harness template encodes. Keep these patterns when you extend it.

## Files
- `index.html` — chrome CSS, mounts `window.FlowApp`, scaler `fit()` + `ResizeObserver`, `?bare=1` mode.
- `helpers.jsx` — shared primitives (`Field`, `Btn`, `Link`, `Row`, `Spinner`), tokens
  (`TEAL`/`LINK`/`HERO_GRAD`/`IMMERSIVE`/`D_FILL`/`D_BORDER`/`D_SUBTLE`), `screenBase`.
- `flow.jsx` — `DIRECTIONS`, `VARIANT_META`, `SCENARIOS`, data, shells, `buildStep()`, `Splash`, `FlowApp`.

All three are classic `text/babel` scripts sharing one global scope — **don't redeclare a top-level
`const` across files** (e.g. `useState`). Keep distinct prefixes if you add a second device's components.

## Directions & shells
- A **direction** = a visual treatment of the same flow, driven by a `VARIANT_META[n]` entry:
  `{ kind: 'panel'|'hero'|'card'|'immersive', align, bg, dark, heroH }`.
- Each `kind` has a **shell** (`PanelShell`, `HeroShell`, …) that renders the chrome (brand, header,
  nav, content area, footer) and themes the shared content. Add a shell per new kind; route in `Shell()`.

## One shared step builder
`buildStep(step, ctx)` returns `{ title, subtitle, nav, onNav, children, footer, center? }`. Write each
screen's content **once**; the shell themes it. `ctx` carries flow state + setters + transition handlers.

## The `dark` flag
For a full-bleed dark direction (`meta.dark`), pass `dark` to every primitive — they switch to
translucent fills (`D_FILL`/`D_BORDER`/`D_SUBTLE`), white text, and inverted buttons. Defaults off, so
light directions are unaffected. (CSS gotcha: never set `borderLeft: undefined` to "clear" — React wipes
the border and leaves a gap; conditionally spread the key instead.)

## Scenario state machine
`SCENARIOS` + `goScenario(sc)` set the **entry step** and reset state per launch. Branch routing
(e.g. cold-start vs returning) lives in the harness transitions (`signIn`, `selectContinue`, the PIN
effect), **not** scattered in screens. Each bottom ghost button launches one scenario. An
**error-states gallery** is just another scenario whose entry step lists every `e-*` state and routes
each through the same `buildStep`/shell path — see `error-states.md`.

## Launch splash
`launch()` bumps `splashId` and shows `<Splash>`; keyed by `splashId` so it remounts/replays on every
scenario launch and direction switch. Skipped in `?bare=1`. ~1s (matches a typical loading delay).

## `center` flag
Sparse screens (PIN, confirm/done) pass `center: true` so the shell vertically centres the whole
brand+header+content group **above** a pinned footer — avoids a lopsided gap. Don't just center the inner
content (header stays pinned → disconnected look); center the group.

## Capture params (URL-addressable)
`?v=<dir>&step=<step>&device=phone|ipad&orient=portrait|landscape&bare=1`
`bare=1` hides chrome + skips splash; reduced-motion freezes animated scenes. See `capture.mjs`.

## Fidelity (repo hard rules)
Real `--sd-*` tokens only — no hardcoded hex where a token exists. Harness chrome links the real `ds-*`
component CSS. `main` is branch-protected — merge a PR to deploy live (GitHub Pages); no direct pushes.

## Desktop hover vs focus glow
`ds-btn` / `ds-selection-pill` currently apply the same outside box-shadow *glow* on both `:hover` and
`:focus-visible`. On desktop that glow reads as a keyboard-focus (tabbing) affordance, not a mouse-hover
one — showing it on hover looks wrong. In a desktop prototype, suppress it on hover while keeping it for
keyboard focus (the CI architecture/hex guards only scan `docs/components/*.html` and
`docs/assets/css/components/*.css`, so a sandbox-local override is safe):
```css
.ds-btn:hover:not(:focus-visible),
.ds-selection-pill:hover:not(:focus-visible) { box-shadow: none; }
```
This is really a button/selection-pill component quirk worth raising as design-system feedback, not just
a per-prototype patch.
