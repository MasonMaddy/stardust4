---
name: component-sandbox
description: >
  Use this skill when the user wants to build or open the component sandbox, test a
  component in isolation, iterate on interaction design, or compare a WIP component
  against the existing component library. Triggers include: "build the sandbox",
  "let's test this in the sandbox", "add [component] to the sandbox", "open the sandbox",
  "let's try it out", "I want to see all the states", "let's iterate on the interaction".
  This is Phase 3 of the component workshop workflow.
---

# Component Sandbox Skill

This is **Phase 3** of the component workshop workflow:

```
Review → Spec → Sandbox → Build
```

The sandbox is a single shared HTML file that shows the WIP component in all states
alongside the existing component library for comparison. It is a development artifact —
fully interactive, served locally, iterated until the design is approved — and is then
used as the source of truth for the Build phase.

---

## Sandbox infrastructure

**Location:** `docs/sandbox/`

```
docs/sandbox/
  index.html    ← single shared sandbox (all components)
  sandbox.css   ← sandbox-specific layout only
```

The sandbox links to the same shared assets as all other pages:
- `../assets/css/main.css` — site chrome, token pills, state card patterns
- `../assets/css/tokens.css` — all `--sd-*` Stardust token CSS variables
- `../assets/css/components/*.css` — shared per-component CSS files: one `<link>` per
  built component in the library. No inline copies of built-component CSS.
- `../assets/js/nav.js` — nav injection (Sandbox link is registered here)

**No site sidebar nav** — the sandbox is full-width to maximise demo space.

---

## `index.html` structure

```html
<body>
  <!-- No site-nav div — sandbox is standalone, full-width -->
  <div class="sb-header">
    <div class="sb-header__title">Stardust Sandbox</div>
    <div class="sb-header__wip-label">WIP: [Component Name]</div>
  </div>

  <!-- ① WIP COMPONENT — always at top, replaced each sandbox session -->
  <section class="sb-wip" id="wip">
    <div class="sb-section-label">
      <span class="sb-badge sb-badge--wip">WIP</span>
      <h2>[Component Name]</h2>
      <p class="sb-section-meta">Variant count · All states · [date]</p>
    </div>

    <!-- State grid: default, hover, focused, pressed, disabled, error -->
    <!-- Variant matrix: type × shape/size cross-product -->
    <!-- Edge cases: long text, empty, etc. -->
    <!-- All using var(--sd-*) token vars — no hardcoded hex -->
    <!-- Interactive where applicable; .is-demo-- classes for static previews -->
  </section>

  <!-- ② COMPONENT LIBRARY — existing components for comparison -->
  <section class="sb-library" id="library">
    <div class="sb-section-label">
      <h2>Component Library</h2>
      <p class="sb-section-meta">Live components — reference for style + interaction</p>
    </div>

    <!-- One .sb-component block per built component -->
    <!-- Styles come from the linked ../assets/css/components/*.css files — no inline copies -->
    <div class="sb-component" id="lib-button">
      <h3>Button</h3>
      <!-- Key states shown: default, hover, focus, disabled, all types -->
    </div>
    <!-- ... repeat for Avatar, Checkbox, etc. -->
  </section>

  <script src="../assets/js/nav.js"></script>
  <!-- Component-specific interaction JS (if needed) inline below -->
</body>
```

---

## What to do

### Step 1 — Check if sandbox exists

Check if `docs/sandbox/index.html` exists. If it doesn't exist yet, create it from
the template above with an empty WIP section and the library populated with all
existing built components (Button, Avatar, Checkbox).

### Step 2 — Generate the WIP section

For the component being sandboxed:

1. Read the spec from `skills/figma-component-builder/references/[component]-spec.md`
   and any review decisions from `[component]-review.md` if available
2. Pull Figma design context if a node ID is known: `get_design_context`
3. Generate HTML/CSS for:
   - **State grid** — all states shown side-by-side with labels (default, hover, focused,
     pressed, disabled, error). Use `.is-demo--[state]` classes for non-interactive states.
     For interactive components (inputs, buttons), use real hover/focus/active.
   - **Variant matrix** — cross-product table of type × shape/size (if multiple variants)
   - **Scale row** — if multiple sizes exist, show them aligned by baseline
   - **Edge cases** — at minimum: long text, empty/no-content state
4. All demo CSS uses `var(--sd-*)` token variables. Never hardcode hex. Font weights
   use `--sd-font-weight-*`; durations and easings use `--sd-motion-duration-*` /
   `--sd-motion-easing-*` — never raw values.
5. WIP component CSS goes in an inline `<style>` block at the top of the WIP section
   (or in a `<style>` block in `<head>` if it doesn't conflict with existing styles).
   This inline block is **temporary** — at Build it is extracted to
   `docs/assets/css/components/[name].css` and the sandbox copy replaced with a `<link>`.
   If the WIP component composes existing built components (e.g. input uses button),
   link their shared `components/*.css` files — never copy their CSS inline.

### Step 3 — Insert WIP section

Replace the `<section class="sb-wip">` in `docs/sandbox/index.html` with the
newly generated content. If the file is being created fresh, also populate the
`sb-library` section with the existing components.

### Step 4 — Ensure library is current

For each existing built component (`docs/components/*.html`), verify the library
section in the sandbox has a representative demo, and that the component's shared
CSS file (`../assets/css/components/[name].css`) is linked in the sandbox `<head>`.
If a component is in the library but its sandbox demo is outdated, update it.

### Step 5 — Start local server and provide URL

```bash
python3 -m http.server 8080 --directory docs/
```

Tell the user: **http://localhost:8080/sandbox/** — open this to interact with the sandbox.

### Step 6 — Iterate

The user will request changes. Each change request:
1. Edit `docs/sandbox/index.html` (and/or `docs/sandbox/sandbox.css`)
2. The local server reloads automatically on save
3. Repeat until the user approves the design

### Step 7 — Approval handoff

When the user says they're happy (or "ready to build", "let's move to build"):
0. **Run the Phase 3.5 gate first** — invoke the `sandbox-review` skill on the WIP before
   extracting anything. If it returns CHANGES REQUIRED, surface the report and resolve the
   Blockers before continuing. Do not extract CSS into the library with an open Blocker.
1. Confirm the WIP section code will be used as the source for the Build phase
2. Extract the approved WIP component CSS to `docs/assets/css/components/[name].css`
   (standard header comment — see existing files for the format) and replace the
   sandbox's inline copy with a `<link>` to the shared file
3. Move the WIP section content to the library section (mark as `status: stable`)
4. Clear the WIP section header to "None"
5. Tell the user to trigger the Build phase: "say 'build it' or 'add to the design system'"

---

## `sandbox.css` — what to include

Sandbox-specific layout only. No token colours (those come from `tokens.css`).

```css
/* Full-width, no sidebar offset */
body { margin: 0; padding: 0; font-family: var(--sd-font-family); }

/* Header */
.sb-header { background: var(--sd-colour-text-primary); color: white;
  padding: 12px 32px; display: flex; align-items: center; gap: 16px; }
.sb-header__title { font-weight: 700; font-size: 1rem; }
.sb-header__wip-label { font-size: 0.75rem; opacity: 0.7; }

/* Section layout */
.sb-wip, .sb-library { padding: 40px 32px; }
.sb-wip { background: var(--sd-colour-surface-default); border-bottom: 4px solid var(--sd-colour-action-primary); }
.sb-library { background: var(--sd-colour-surface-grey); }

/* Section labels */
.sb-section-label { margin-bottom: 32px; }
.sb-section-label h2 { margin: 0 0 4px; }
.sb-section-meta { font-size: var(--sd-font-size-sm); color: var(--sd-colour-text-secondary); margin: 0; }

/* WIP badge */
.sb-badge { display: inline-block; padding: 2px 8px; border-radius: var(--sd-radius-full);
  font-size: 0.65rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em;
  margin-bottom: 8px; }
.sb-badge--wip { background: var(--sd-colour-feedback-warning-subtle);
  color: var(--sd-colour-feedback-warning-default); }
.sb-badge--stable { background: var(--sd-colour-feedback-success-subtle);
  color: var(--sd-colour-feedback-success-default); }

/* Library component groups */
.sb-component { margin-bottom: 48px; padding-bottom: 48px;
  border-bottom: 1px solid var(--sd-colour-border-default); }
.sb-component:last-child { border-bottom: none; }
.sb-component h3 { margin: 0 0 20px; font-size: var(--sd-font-size-base); }

/* State grid — horizontal strip of states */
.sb-state-grid { display: flex; gap: 24px; flex-wrap: wrap; align-items: flex-start; }
.sb-state-item { display: flex; flex-direction: column; align-items: center; gap: 8px; }
.sb-state-item__canvas { min-width: 80px; display: flex; justify-content: center; }
.sb-state-item__label { font-size: 0.65rem; text-transform: uppercase; letter-spacing: 0.07em;
  color: var(--sd-colour-text-secondary); font-weight: 700; }
```

---

## Reference files

- `docs/sandbox/index.html` — the sandbox (create if not exists)
- `docs/sandbox/sandbox.css` — sandbox layout styles (create if not exists)
- `docs/assets/css/tokens.css` — all `--sd-*` token vars
- `docs/assets/css/main.css` — shared site chrome
- `docs/assets/css/components/*.css` — shared per-component CSS (linked, never copied)
- `skills/figma-component-builder/references/[component]-spec.md` — spec source
- `skills/figma-component-builder/references/[component]-review.md` — review decisions
