---
name: flow-prototype
description: >
  Use this skill when the user wants to prototype a multi-screen USER FLOW or JOURNEY
  (not a single component) — turning a PRD / Figma flow / design handoff into a runnable,
  interactive prototype wired to the real Stardust tokens, across one or several visual
  directions, in one harness you can click through and screenshot. Triggers include: "prototype
  this sign-in flow", "build a runnable prototype of [flow]", "build a prototype from this handoff",
  "stand up these screens", "make this flow runnable", "wire this design to our tokens", "explore
  directions for this flow", "show me variations of this onboarding/checkout/login", "build a flow
  comparison board", "turn these screens into a clickable prototype", "build out the rest of these
  screens/flows". Reach for it even when the user doesn't say "prototype" but is clearly asking to
  see a flow working in the browser. It is the journey-level sibling of `component-sandbox` (single
  component); for narrative doc pages use `ds-page-author`.
---

# Flow Prototype Skill

Build a **runnable, multi-direction prototype of a user flow** in the Stardust sandbox.
Where `component-sandbox` shows one component in all states, this shows a whole **journey**
(e.g. service login → educator → PIN → room → hub) rendered in several **visual directions**
side-by-side, on the real `--sd-*` tokens, in one harness you can click through and screenshot.

It is a development artifact — fully interactive, served locally, iterated until the design
is approved, then optionally captured to a PNG deck and/or published via GitHub Pages.

```
Orient → Scope → Scaffold → Build flow → Verify loop → Device + motion → Design review → Capture → Publish
```

---

## Orient on the inputs (first)

**Ground in product context before anything else.** Read `context/README.md` and follow its
routing table — typically `context/product-map.md`, `context/personas.md`, and the
`context/design-ethos.md` section for the target surface. Write down, in one line each: the
**persona(s)** this flow serves, the **surface** it lands on, and the **binding platform
conventions** (shared in-room device? provider-level view? kiosk? one-handed phone?). A prototype
that ignores its surface's ethos is off-spec even if every token resolves — this line is what the
design review gate will judge it against. If the flow touches sign-in/out, sleep/nappy checks,
ratios, or funding, also skim `context/sector-compliance.md` for the states the regulation implies.

Then, before any code, read everything the handoff ships — the **PRD/README** (intent, copy, states),
the **reference code** (the behavioural truth: state machine, transitions), and the **Figma flow**.
Build a flat list of *every screen and every state*: happy path + bootstrap/landing + branches +
the **edge/empty/error matrix** (a PRD usually enumerates these in an "error & system states"
table — mine it; it becomes the error-states gallery below). Then **map the design's tokens onto
Stardust** — confirm each colour/radius/spacing resolves to a real `--sd-*` var, and note any
net-new values that have no token yet. Keep the original handoff **pristine** (archive it
elsewhere) so it stays a clean reference. The PRD is the intent truth; the reference code is the
behavioural truth — when they conflict, surface it rather than guessing.

## Scope gate (before a large build)

Confirm scope before mass-producing: which **devices** (phone only, or phone + tablet), which
**directions**, and how much of the **state matrix**. Also confirm the product framing from
Orient: **which surface and persona(s)** — and the abstraction check: for **Office** flows, is
this the *service-level* view, the *provider-level* view, or both (a provider admin configuring
what service admins use is a different screen set)? For **Playground**, is this the *web*
(proactive, sit-and-work) or *app* (reactive, shared-device) experience? One `AskUserQuestion`
here prevents building the wrong surface across every direction. Then build slice-by-slice (see
the verify loop).

---

## Infrastructure

- **Location:** `docs/sandbox/<flow-name>/` (e.g. `docs/sandbox/playground-signin/`).
- **No build step.** Plain HTML + `text/babel` React (React 18 + Babel standalone from CDN).
  Files are served as-is by the `stardust-site` launch config (`python3 -m http.server 8011`).
- **Files:** `index.html` (chrome + mounts the app), `helpers.jsx` (shared primitives), and
  `<flow>.jsx` (the flow state machine + harness). Start from the template (next section).
- **Served at:** `http://localhost:8011/docs/sandbox/<flow-name>/`.

## Start from the template

A flow-agnostic harness skeleton lives in `references/harness-template/`. Copy it into the new
folder and rename:

```
cp -R skills/flow-prototype/references/harness-template docs/sandbox/<flow-name>
mv docs/sandbox/<flow-name>/flow.jsx docs/sandbox/<flow-name>/<flow-name>.jsx   # optional rename
```

The template already wires up: the 3-zone chrome, a phone↔tablet + orientation toggle, scenario
launchers, the launch splash, a shared step-builder, two example directions (a light **panel** and a
teal **hero** shell), and the `?…&bare=1` capture params. Replace the example data/steps with the real flow.

Read `references/conventions.md` for the architecture cheat-sheet (shells, the `dark` flag, the
scenario state machine, splash, capture params) before extending it.

---

## Hard rules (same as the rest of the repo)

- **Real tokens only.** Screens use `--sd-*` custom properties (and the harness chrome links the
  real `ds-*` component CSS from `docs/assets/css/components/`). **No hardcoded hex** anywhere a
  token exists — `--xp-*` chrome vars are not design tokens.
- **Link shared component CSS, never re-declare `ds-*` rules** inline on the page.
- The prototype is a sandbox artifact; it is **not** a component doc page and does not need a
  changelog table. But it lives under `docs/`, so **merging to `main` deploys it live** (GitHub Pages).

---

## Architecture (what the template encodes)

- **Harness chrome, three zones + bottom:**
  - **left rail** = direction switcher (Stardust `ds-card--selectable` + `ds-radio`), plus a
    **Device** toggle (Phone / Tablet `ds-selection-pill`s) and, for tablet, a **Layout**
    (Vertical / Horizontal) toggle.
  - **center** = the device frame (phone 390×800; tablet 834×1194 / landscape 1194×834).
  - **right rail** = a reference card (demo credentials / notes).
  - **bottom** = **scenario launchers** (`ds-btn--ghost`) — each opens a flow from its start.
- **Directions** are visual treatments of the *same* flow. Each is driven by a `VARIANT_META`
  entry (`kind: panel | hero | card | immersive`, plus `align`/`bg`/`dark`).
- **One shared step-content builder** (`buildStep(step, ctx)`) returns
  `{ title, subtitle, nav, onNav, children, footer, center? }` for each step. It is themed by the
  per-direction **shell** — so you write each screen's content once, not once per direction.
- **`dark` flag** threads a translucent-on-teal treatment through the shared primitives for any
  full-bleed dark direction (`D_FILL`/`D_BORDER`/`D_SUBTLE`). Defaults off so light directions are
  untouched.
- **Scenario state machine:** a `scenario` state + a `goScenario(sc)` launcher decide the entry
  screen and the branch routing (e.g. cold-start vs returning user). Transitions live in the
  harness, not scattered in the screens.
- **Launch splash** (`launch()` → `splashId++`): replays on every scenario launch / direction
  switch. Keyed by `splashId` so it remounts; skipped in `?bare=1` capture mode.
- **`center` step flag:** sparse screens (PIN, confirm) pass `center: true` so the shell vertically
  centres the whole brand+header+content group above a pinned footer — no lopsided gaps.
- **URL-addressable** for deterministic capture: `?v=<dir>&step=<step>&device=phone|ipad&orient=portrait|landscape&bare=1`.
- **Error & empty states = their own scenario.** Don't contrive triggers in the happy path — add a
  scenario whose entry step is a neutral **gallery** listing every error/empty/blocking state; each
  tile opens that state as an `e-*` step handled by the *same* `buildStep`/shell path, so it
  **re-themes across every direction** for free. Share an `Alert` (inline banner) + a `StatePanel`
  (centred blocking/empty) primitive, both `dark`-aware; blocking panels pass a `noBrand` flag so
  the shell skips the emblem (no logo above the error icon). See `references/error-states.md`.

---

## The verify loop (do this for every slice)

Use the `preview_*` tools, never a manual "please check":

1. `preview_start` the `stardust-site` config if no server is running (port 8011).
2. After an edit, navigate to the exact state via URL (`preview_eval` → `window.location.href = …`)
   — more reliable than clicking, especially for a specific direction/step.
3. `preview_console_logs` (level `error`) — must be clean.
4. `preview_eval` to assert DOM facts (computed styles, text, element counts) and
   `preview_screenshot` to confirm appearance. **Read the DOM for precise values; don't trust a
   screenshot for colours/spacing.**
5. For **timed interactions** (loading delays, splash, auto-submit), run a single `async` IIFE in
   `preview_eval` that clicks, `await`s a `setTimeout`, then reads — synchronous reads after a click
   return stale pre-render state, and tool-call latency exceeds short timers.
6. Driving the keypad/list: query fresh each click; add a small `await` between clicks (rapid
   synchronous clicks can drop).

Caveat: after *many* screenshots in one session the image API may start rejecting inline images
regardless of size — fall back to DOM assertions via `preview_eval`.

---

## Design review gate (before capture / publish)

When the flow is built and the verify loop is clean, run the **`proto-design-review`** skill — an
independent second-designer pass (visual craft + a persona walkthrough) with deterministic
pre-checks, a severity-ranked report, and a **System gaps** triage that routes design-system gaps
to Track 1 or flags where the user should get creative in Figma. This gate is **default-on**: run
it before capturing a deck or opening the publish PR; skip only if the user explicitly declines.
**Never open the publish PR with an open Blocker.** The technical verify loop above checks that
the prototype *works*; this gate checks that it's *well designed* — they are not the same thing.

---

## Capture a deck (optional)

`references/capture.mjs` is a headless-Chrome (puppeteer-core + installed Google Chrome) export.
It drives the `?…&bare=1` URL states and writes folder-per-direction PNGs.

```
mkdir -p /tmp/<flow>-cap && cd /tmp/<flow>-cap && npm init -y >/dev/null && npm i puppeteer-core@23
# edit capture.mjs: BASE url, DIRECTIONS, STEPS, GROUPS (phone / tablet vertical / tablet horizontal)
node /path/to/capture.mjs
cd ~/Downloads && zip -rX <flow>-screens.zip <flow>-screens -x "*.DS_Store"   # zip -rX, NOT ditto (no ._ cruft)
```

`bare=1` hides the harness chrome + skips the splash; reduced-motion is emulated so animated scenes
freeze. Phone PNGs are 780×1600, tablet portrait 1668×2388, landscape 2388×1668 (all @2× DPR,
transparent rounded corners). Remove the `/tmp` tooling when done. **Re-run after any visual change.**

## Publish

`main` is branch-protected — work on a branch and open a PR (direct pushes are blocked).
**Merging the PR is a production deploy** to GitHub Pages. Publish only after the design review
gate returns SHIP-READY (or the user explicitly waives it). Commit the prototype folder **only**
(don't sweep in unrelated working-tree changes), rebase onto the latest `main` if the remote moved,
push the branch, then open the PR. Merge once the `checks` CI job is green.

---

## Working style

Go slow, confirm scope before large builds, and verify each slice in the browser before moving on.
Build the shared step-builder + shells first, then layer directions, then motion/device variants,
then capture. Match each direction's own visual language end-to-end (don't theme only the first screen).

Validate a new technique (a gradient, an SVG-icon approach, a new shell) on **one** element and
screenshot it before mass-producing — a bug caught once beats it copied across every direction.
Share proof (a screenshot or DOM assertion), never "please check". Be honest about coverage: if you
spot-checked 2 of 7 near-identical screens, say so — don't imply you verified all of them.
