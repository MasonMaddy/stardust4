---
name: ds-component-doc
description: >
  Use this skill to generate a design system component documentation page for the
  Stardust docs site. Triggers include: "document this component", "create a
  component doc page", "add this to the design system", "build it out", "we're happy
  — build it", "build the component page", or any request to produce structured
  documentation for a UI component. Also triggers when a designer pastes component
  details, states, or token references and asks for a doc page. Use this skill even
  if the user just says "doc this button" or "add the card component to the DS" —
  this is the right skill to turn component details into a living HTML documentation
  page engineers can add code to.
---

# Design System — Component Documentation Skill

This is **Phase 4** of the component workshop workflow:

```
Review → Spec → Sandbox → Build ← you are here
```

This skill generates a site-integrated HTML documentation page for a single design system
component. The output is a living doc — designers populate the spec side, engineers
drop in their code snippets and notes as they build. It is NOT a Figma frame or a
PDF. It is a page that lives in `docs/components/` inside the stardust4 repo and is
served by GitHub Pages at `https://masonmaddy.github.io/stardust4/`.

**Preferred input source (sandbox-first approach):**
If the component has been through the Sandbox phase (Phase 3), use the approved WIP
section from `docs/sandbox/index.html` as the source for the demo CSS and HTML.
This ensures the final page matches exactly what was iterated and approved in the sandbox.
At Build, extract the approved WIP component CSS into the shared file
`docs/assets/css/components/[name].css` and replace the sandbox's inline copy with a
`<link>` to that file — the sandbox and the doc page then share one source of truth.
After generating the page, move the sandbox WIP section to the library section.

**Fallback:** If no sandbox exists, generate demo CSS/HTML from the spec and Figma data
(original behaviour).

Each page follows the Xplor Design System documentation standard. Nothing ships
without meeting it. Read `references/doc-standard.md` before generating any output.

---

## Output format

Pages are **site-integrated** — they link to shared assets, NOT self-contained.
Each HTML file must:

1. Link to `../assets/css/main.css` (site chrome, layout, shared UI classes)
2. Link to `../assets/css/tokens.css` (all `--sd-` Stardust token CSS vars)
3. Link to `../assets/css/components/[name].css` immediately after `tokens.css` — the
   shared per-component CSS file. If the component composes other components, link the
   dependencies' files first (e.g. `input.html` links `button.css` then `input.css`;
   `title-block.html` links `avatar.css`, `pill.css`, then `title-block.css`)
4. Include `<div id="site-nav"></div>` as the first element inside `<body>`
5. Use a `.page-layout` wrapper with a `.sidebar` and `.main-content`
6. Include `<script src="../assets/js/nav.js"></script>` before `</body>`
7. Use the inline `<style>` block for page-chrome/demo-layout styles ONLY (state cards,
   preview grids) — component CSS lives in the shared `components/[name].css` file

**Do NOT embed full CSS blocks or recreate shared layout styles inline.**
**Do NOT inline component CSS in the doc page — it goes in `docs/assets/css/components/[name].css`
with the standard header comment (see `docs/assets/css/components/toggle.css` for the format).**
**Do NOT hardcode any colour hex values in demo preview CSS — always use `var(--sd-*)` token variables.**
**Font-weight and motion values must use the `--sd-font-weight-*` and
`--sd-motion-duration-*` / `--sd-motion-easing-*` tokens — never raw numbers.**

Output paths:
- `docs/components/[component-name-kebab].html`
- `docs/assets/css/components/[component-name-kebab].css`
Example: `docs/components/badge.html` + `docs/assets/css/components/badge.css`

After generating, remind the user to:
- Add one entry to `COMPONENT_LINKS` in `docs/assets/js/nav.js`
- Add one component card to the grid in `docs/index.html`

---

## Token values — Stardust (Legacy, live in Figma)

The primary action colour in the Stardust system is **teal** (`#00776B`), not coral.
Coral (`#FF5A35`) is the Xplor corporate brand used in site chrome only.

Key semantic tokens (from the `mapped` Figma collection):
- `colour/action/primary` → `--sd-colour-action-primary` = `#00776B`
- `colour/action/hover` → `--sd-colour-action-hover` = `#008480`
- `colour/action/pressed` → `--sd-colour-action-pressed` = `#004B40`
- `colour/action/disabled` → `--sd-colour-action-disabled` = `#F6F6F6`
- `colour/action/foreground` → `--sd-colour-action-foreground` = `#FFFFFF`
- `colour/accent/subtle` → `--sd-colour-accent-subtle` = `#F3F1FF` (purple/50)
- `colour/text/text-primary` → `--sd-colour-text-primary` = `#252525`
- `colour/text/text-inverse` → `--sd-colour-text-inverse` = `#FFFFFF`
- `colour/text/text-disabled` → `--sd-colour-text-disabled` = `#BDBDBD`
- `colour/border/focus` → `--sd-colour-border-focus` = `#00776B`
- `colour/border/default` → `--sd-colour-border-default` = `#D0C7E5` (purple/200)

Full token list is in `docs/assets/css/tokens.css`.

---

## Workflow

### Step 1 — Gather component information

Before asking anything, check what the user has already provided in the conversation.
Extract everything you can from context first.

You need the following to generate a complete doc page. Ask only for what's missing:

**Always required:**
- Component name (canonical — this becomes the file name and code reference)
- What the component is and what problem it solves (1–2 sentences)
- All variants (e.g. Solid/Ghost/Minimal, sm/md/lg)
- All states (default, hover, pressed, focused, disabled — plus any component-specific ones)
- Token references for key visual properties (background, text, border, radius, spacing)

**Ask if not provided:**
- Is there a parent/child relationship? (e.g. ButtonGroup contains Button)
- Are there any platform-specific behaviours? (iOS vs Android vs Web)
- Any known accessibility requirements beyond the standard baseline?
- Any motion or animation on this component?
- Figma node ID for the component set (enables live Figma data pull)

Never ask more than 3–4 questions at once. If the user says "just generate it with
placeholders" — do that and mark gaps with `<!-- TODO: [what's needed] -->` and
`.todo` callout blocks visible on the rendered page.

### Step 2 — Pull from Figma (if node ID available)

If a Figma node ID is provided, use the Figma MCP tools:
1. `get_design_context` on the component's child node — retrieves structure and layout values
2. `get_variable_defs` on the component set node — retrieves all bound variable names and resolved values
3. `get_screenshot` on the component set — visual reference for the variant grid

Use this data to populate token references and variant dimensions accurately.

### Step 3 — Generate the component CSS file and the HTML doc page

Read `references/doc-standard.md` for the full 10-section documentation standard.
Read `references/html-template.md` for the base HTML structure that uses shared assets.

**Create or update the shared component CSS file first:**
`docs/assets/css/components/[name].css` — the component's full CSS (from the approved
sandbox WIP, or generated from spec), with the standard header comment (see
`docs/assets/css/components/toggle.css` for the format). All values reference
`--sd-` tokens, including `--sd-font-weight-*` and `--sd-motion-*`.

The page must follow this exact `<head>` structure:
```html
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>[Component] — Stardust Design System</title>
  <link rel="stylesheet" href="../assets/css/main.css">
  <link rel="stylesheet" href="../assets/css/tokens.css">
  <!-- Composed dependencies first (if any), then this component's shared CSS -->
  <link rel="stylesheet" href="../assets/css/components/[name].css">
  <style>
    /* Demo-only styles: page-chrome/demo-layout — use var(--sd-*) token vars, no hardcoded hex.
       Component CSS lives in ../assets/css/components/[name].css — do not inline it here. */
  </style>
</head>
```

And this `<body>` structure:
```html
<body>
  <div id="site-nav"></div>
  <div class="page-layout">
    <aside class="sidebar" aria-label="On this page">
      <!-- in-page section nav -->
    </aside>
    <main class="main-content">
      <!-- 10-section content -->
    </main>
  </div>
  <script src="../assets/js/nav.js"></script>
</body>
```

### Step 4 — Output and handoff

Present both files: the shared component CSS (`docs/assets/css/components/[name].css`)
and the HTML doc page (`docs/components/[name].html`).
Then give the user:
- A summary of what's complete and what's TODO
- The two-line update needed in `docs/assets/js/nav.js` (one new object in `COMPONENT_LINKS`)
- The component card HTML to add to `docs/index.html`
- Reminder: engineers open the file in VS Code, fill in the Engineering section, and PR to main

---

## Tone and behaviour

- The doc is written for two audiences: designers reading the spec, engineers building
  from it. Write usage guidelines and accessibility notes for designers. Write the
  engineering section scaffold clearly for engineers to complete.
- Be precise about states and tokens. Vague entries like "uses brand colour" are not
  acceptable — always reference the token name and its CSS variable.
- If a token isn't known, use `[token: colour/action/primary]` format so it's findable.
- Mark every incomplete section visibly with `.todo` blocks so nothing gets missed.
- Never invent variant names or states. If unsure, use a TODO comment.
- CSS in both files must reference `var(--sd-*)` — never hardcode hex values, raw
  font weights, or raw motion values. This is enforced so previews update automatically
  when tokens change.
- Keep the split clean: component CSS lives only in `docs/assets/css/components/[name].css`;
  the doc page's inline `<style>` block holds page-chrome/demo-layout styles only.

---

## Reference files

- `references/doc-standard.md` — The full 10-section documentation standard.
  Read this before generating any output.
- `references/html-template.md` — The base HTML structure using shared assets.
  Copy this structure for every new doc page.
