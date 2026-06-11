---
name: ds-token-pipeline
description: >
  Use this skill to set up, document, or troubleshoot the Xplor design token pipeline —
  from Figma Variables to code. Triggers include: "set up the token pipeline", "export
  tokens from Figma", "add a new token", "update a token value", "generate a token
  reference page", "create the token index", "something is out of sync between Figma
  and code", "write up the token handoff doc", or any request involving design tokens,
  Style Dictionary, DTCG format, or the Figma → GitHub → code workflow. Also triggers
  when an engineer asks how to consume Xplor tokens in Vue, Tailwind, or React Native,
  or when a designer asks how to name or organise tokens. Use this skill even if the
  request is as simple as "how do I add a new colour token" — this skill owns the
  full token workflow end to end.
---

# Design System — Token Pipeline & Engineering Handoff Skill

This skill covers two related outputs:

1. **Token documentation pages** — standalone HTML reference pages for the full
   token set (one per category: colour, typography, spacing, radius, motion)
2. **Pipeline setup and troubleshooting** — instructions and scaffolding for the
   Figma → DTCG JSON → Style Dictionary → platform output workflow

Read `references/token-architecture.md` before generating any token output.
Read `references/pipeline-setup.md` for Style Dictionary config and CI/CD setup.
Read `references/html-token-template.md` for the token reference page HTML structure.

---

## Workflow — Token documentation page

### Step 1 — Identify which token category

Token categories and their file outputs:

| Category | Doc file | Style Dictionary output |
|---|---|---|
| Colour | `tokens-colour.html` | CSS vars + Tailwind `@theme` + RN `colors.ts` |
| Typography | `tokens-typography.html` | CSS vars + Tailwind + RN `typography.ts` |
| Spacing | `tokens-spacing.html` | CSS vars + Tailwind + RN `spacing.ts` |
| Radius | `tokens-radius.html` | CSS vars + Tailwind + RN `radius.ts` |
| Shadow | `tokens-shadow.html` | CSS vars + RN `shadows.ts` |
| Motion | `tokens-motion.html` | CSS vars + RN `motion.ts` |

If the user asks for all categories — generate them separately, one file per category.

### Step 1b — Correct brand reference

The **Stardust** primary colour is teal `#00776B` (token: `colour/action/primary`).
Coral (`#FF5A35`) is the Xplor corporate brand used for the documentation site's
navigation chrome only (CSS prefix `--xp-`). Never use coral in component token tables
or token page swatches.

The live Figma file is `a7JnfZ0Nd8df1TBPaMQ5Tj`. All token values should be sourced
from the `base` and `mapped` variable collections in that file. See `references/token-architecture.md`
for the clarification note on greenfield vs legacy Stardust values.

### Step 1c — tokens.css: CSS-first section and known Figma divergence (CRITICAL)

`docs/assets/css/tokens.css` ends with a trailing **"TIER 2 — CSS-FIRST TOKENS"** section
(font weights `--sd-font-weight-*`, motion `--sd-motion-duration-*` / `--sd-motion-easing-*`,
z-index `--sd-z-*`). These tokens are CSS-first — they are NOT synced from Figma; their
matching Figma variables have not been created yet.

- On any re-sync or regeneration of `tokens.css`, **PRESERVE the trailing CSS-FIRST
  section verbatim**. Regeneration replaces only the Figma-synced sections above it.
- Fold a CSS-first token into the synced section only once its Figma variable exists.
- **Known divergence:** `--sd-colour-focus-secondary` was darkened to grey-800 `#838383`
  in `tokens.css` for WCAG 2.4.11 (focus appearance), while the Figma variable
  `colour/focus/secondary` still resolves to grey-600 `#BDBDBD`. On the next sync,
  update the Figma variable first — never silently revert `tokens.css` to the Figma value.

**Output paths for token pages:**
- Colour:     `docs/tokens/colour.html`
- Typography: `docs/tokens/typography.html`
- Spacing:    `docs/tokens/spacing.html`
- Radius:     `docs/tokens/radius.html`
- Shadow:     `docs/tokens/shadow.html`
- Motion:     `docs/tokens/motion.html` (exists — "Motion & Layering", linked in `nav.js` `TOKEN_LINKS`)

Token pages must use shared assets — NOT standalone self-contained HTML:
```html
<link rel="stylesheet" href="../assets/css/main.css">
<link rel="stylesheet" href="../assets/css/tokens.css">
<!-- body: <div id="site-nav"></div> + page-layout wrapper -->
<script src="../assets/js/nav.js"></script>
```

Display `--sd-` CSS variable names alongside Figma token names in all tables.
(CSS var naming convention: replace `/` with `-`, prefix with `--sd-`.)

### Step 2 — Gather token values

Extract token names and values from whatever the user provides:
- Pasted token list (JSON, table, or free text)
- A description of the design decisions (e.g. "8pt base grid, scale: 4 8 12 16 24 32 48")
- An existing Figma variable export

If no values are provided, generate a sensible default set based on Xplor's
known brand (coral `#FF5A35`, navy `#1A2B4A`) and ask the user to confirm
before generating the doc.

### Step 3 — Generate the HTML token reference page

Follow the structure in `references/html-token-template.md`.

The page shows:
- Every token in the category, in a visual table
- Primitive tokens and semantic tokens in separate sections
- Visual swatches for colour, scale bars for spacing, live previews for radius
- The DTCG JSON for each token (collapsible)
- The resolved value in CSS, Tailwind, and React Native formats

### Step 4 — Output

Present the HTML file. Then give the user:
- A summary of any gaps (missing semantic tokens, missing dark mode aliases, etc.)
- The DTCG JSON block for this category, ready to paste into the token file in GitHub
- A reminder of the naming conventions (from `references/token-architecture.md`)

---

## Workflow — Pipeline setup or troubleshooting

When the user asks about setting up the pipeline, exporting tokens, or why tokens
are out of sync, read `references/pipeline-setup.md` and respond with the relevant
section. Cover:

1. Figma Variables setup (collections, modes, naming)
2. Export via Tokens Studio → GitHub
3. Style Dictionary v4 config for the three platform targets
4. GitHub Actions automation
5. How engineers consume the output in Vue/Tailwind and React Native/NativeWind

For troubleshooting, always ask: "Is the issue in Figma, in the JSON, in Style
Dictionary transform, or in the consuming app?" — this narrows the fix quickly.

---

## Naming convention enforcement

Whenever a user proposes a new token name, validate it against these rules before
accepting it. If it fails, suggest the correct name.

**Rules:**
1. All lowercase, dot-separated. No camelCase, no underscores, no hyphens.
   ✓ `color.action.primary` ✗ `colorActionPrimary` ✗ `color-action-primary`
2. Semantic tokens never use brand or raw value names.
   ✓ `color.action.primary` ✗ `color.coral.500`
3. Scale values: t-shirt sizing for subjective dimensions, numeric for spacing.
   ✓ `radius.md` ✓ `spacing.4` ✗ `radius.medium` ✗ `spacing.medium`
4. Dark mode is a mode on the semantic layer, not a separate token name.
   ✓ `color.surface.default` (with light/dark modes) ✗ `color.surface.default-dark`
5. Component-scoped tokens are prefixed with the component name.
   ✓ `button.background.primary` ✗ `color.button-primary`

---

## Reference files

- `references/token-architecture.md` — The two-layer token model (primitive +
  semantic), category definitions, naming conventions, and DTCG format examples.
  Read this first.
- `references/pipeline-setup.md` — Step-by-step pipeline setup: Figma Variables,
  Tokens Studio, Style Dictionary v4 config, GitHub Actions, and platform consumption
  guides for Vue/Tailwind and React Native/NativeWind.
- `references/html-token-template.md` — The HTML structure for token reference pages.
  Copy this for every new category page.
