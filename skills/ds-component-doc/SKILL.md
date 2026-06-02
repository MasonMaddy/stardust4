---
name: ds-component-doc
description: >
  Use this skill to generate a design system component documentation page as a
  standalone HTML file. Triggers include: "document this component", "create a
  component doc page", "add this to the design system", "write up the spec for
  [component name]", "generate a handoff doc", or any request to produce structured
  documentation for a UI component. Also triggers when a designer pastes component
  details, states, or token references and asks for a doc page. Use this skill even
  if the user just says "doc this button" or "add the card component to the DS" —
  this is the right skill to turn component details into a living HTML documentation
  page engineers can add code to.
---

# Design System — Component Documentation Skill

This skill generates a standalone HTML documentation page for a single design system
component. The output is a living doc — designers populate the spec side, engineers
drop in their code snippets and notes as they build. It is NOT a Figma frame or a
PDF. It is a file that lives in the design system's `/docs` folder and is opened in
a browser.

Each page follows the Xplor Design System documentation standard. Nothing ships
without meeting it. Read `references/doc-standard.md` before generating any output.

---

## Workflow

### Step 1 — Gather component information

Before asking anything, check what the user has already provided in the conversation.
Extract everything you can from context first.

You need the following to generate a complete doc page. Ask only for what's missing:

**Always required:**
- Component name (canonical — this becomes the file name and code reference)
- What the component is and what problem it solves (1–2 sentences)
- All variants (e.g. primary/secondary/ghost, sm/md/lg)
- All states (default, hover, pressed, focused, disabled — plus any component-specific ones)
- Token references for key visual properties (background, text, border, radius, spacing)

**Ask if not provided:**
- Is there a parent/child relationship? (e.g. ButtonGroup contains Button)
- Are there any platform-specific behaviours? (iOS vs Android vs Web)
- Any known accessibility requirements beyond the standard baseline?
- Any motion or animation on this component?

Never ask more than 3–4 questions at once. If the user says "just generate it with
placeholders" — do that and mark gaps with `<!-- TODO: [what's needed] -->`.

### Step 2 — Generate the HTML doc page

Read `references/doc-standard.md` for the full documentation standard.
Read `references/html-template.md` for the base HTML structure and CSS to use.

The output is a single self-contained HTML file with:
- Xplor brand colours and typography baked in via CSS variables
- All documentation sections (see doc-standard.md)
- An "Engineering" section with placeholder code blocks engineers fill in
- A status badge (WIP / Beta / Stable / Deprecated)
- A changelog section at the bottom

File naming: `[component-name-kebab-case].html`
e.g. `button-primary.html`, `list-cell.html`, `modal.html`

### Step 3 — Output

Present the HTML file for download. Then give the user a short handoff note covering:
- What's complete in the doc
- What's marked as TODO and needs filling in
- What the engineer needs to add (code snippets, Storybook link, implementation notes)
- Where the file should live in the repo: `/design-system/docs/components/`

---

## Tone and behaviour

- The doc is written for two audiences: designers reading the spec, engineers building
  from it. Write usage guidelines and accessibility notes for designers. Write the
  engineering section scaffolding for engineers to complete.
- Be precise about states and tokens. Vague entries like "uses brand colour" are not
  acceptable — always reference the token name.
- If a token isn't known, use a placeholder in the format `[token: color.action.primary]`
  so it's findable and fixable.
- Mark every incomplete section visibly so nothing gets missed at handoff.
- Never invent variant names or states. If unsure, use a TODO comment.

---

## Reference files

- `references/doc-standard.md` — The full 10-section documentation standard.
  Read this before generating any output. Every component doc must meet this standard.
- `references/html-template.md` — The base HTML structure, CSS variables, and
  component layout. Copy this structure for every new doc page.
