---
name: screens-to-figma
description: >
  Use this skill to author screens or flows INTO Figma as native, editable frames via the Figma
  Plugin API (`use_figma`) — turning a built prototype, a set of screens, or code into a Figma
  design file. Triggers: "write these screens to Figma", "push the prototype into Figma",
  "recreate these in a Figma file", "mirror this flow into Figma", "build this design in Figma",
  "code to design", or whenever the user wants what they built in the browser to exist as real
  Figma layers (not flat screenshots). Use it for going code/prototype → Figma. Do NOT use it to
  READ a design out of Figma (that's `get_design_context`), to audit a Figma file's system
  alignment (`component-checker`), or to capture a live web page as a one-off screenshot
  (`generate_figma_design`). Reach for it whenever the deliverable is editable Figma frames
  authored from a design you already have in code.
---

# Screens to Figma

Authors screens/flows into a Figma file as **native, editable frames** — auto-layout, real text,
vector icons, gradients — via the `use_figma` Plugin API. The output is a Figma board a designer
can edit, organised by flow, on the correct token *values*.

The hard part isn't the design — it's the Plugin API's sharp edges. This skill front-loads a
**ready-to-paste helper library** and the **gotchas** so you don't rediscover them the slow way.

## Before you write anything

1. **Load `figma-use` guidance if available.** The MCP marks it mandatory before `use_figma`.
   Prefer the `/figma-use` skill; otherwise read the `skill://figma/figma-use/SKILL.md` MCP
   resource. **If neither is reachable** (no resource reader, not a registered skill), proceed
   anyway but lean harder on visual verification (below) — that's the safety net the guidance
   would otherwise provide. Say so to the user.
2. **Confirm the target** (an outward-facing write): a **new file** (`create_new_file`, returns a
   `fileKey`) is the safe default — it can't clutter an existing working file. Writing into an
   existing file needs the user's nod. `create_new_file` needs a `planKey` from `whoami`.
3. **Have the token values to hand.** Inline the real `--sd-*` hex values (from
   `docs/assets/css/tokens.css`) as JS constants — Figma authoring uses concrete values, and
   binding to published variables/components is a *later* alignment step, not this one.

## Workflow

### 1 — Paste the helper library, build one screen, verify

Each `use_figma` call is a **fresh JS scope** — variables don't persist between calls (though the
*nodes* you create do persist in the file). So every call re-pastes the helper block from
`references/plugin-api-helpers.md`. Start by building **one representative screen** (one that
exercises gradients, a sheet, icons, text, a button) and screenshot it before mass-producing —
the same "validate the pattern once" discipline that saves twenty broken frames.

### 2 — Build flow by flow, one row per call

Lay screens out as **390×800 device frames in labelled rows, one row per flow**, left-to-right in
flow order. Build a row (or a few screens) per call — the 50k-char code limit and reliability both
favour batches over one giant call. Append to the page; position with `frame.x` / `frame.y`.

### 3 — Verify each batch visually

This is non-negotiable, and doubly so if you couldn't load `figma-use`: after each call,
screenshot the result and look. `use_figma` returns no value, so get node ids via `get_metadata`
(on the page, then drill in), then `get_screenshot(nodeId)` and inspect the PNG. Fix in the next
call. The gotchas in `references/gotchas.md` are the failures this catches — read them first.

### 4 — Report

Give the file URL, the row/flow layout, the screen count, and an honest note on fidelity (native
frames; icons are vector approximations unless you imported the real icon library; token *values*
match live but aren't *bound* to variables — `component-checker` audits that gap).

## The two references — read both before building

- `references/plugin-api-helpers.md` — the **foundation kit**: font loading, token map, and
  builders (`tx`, `icon`/`svgIcon`, `fr`, `screen`/`hero`/`sheet`, `btn`, `field`, gradient,
  shadow). Paste it at the top of each `use_figma` call and build screens on top.
- `references/gotchas.md` — the Plugin API failures that cost real debug cycles
  (absolute-positioning order, icon recolour + rescale, font style names, gradient transform,
  `currentPage`, no return value). Read first; they're cheap to avoid and expensive to hit.

## Guardrails

- **Native frames, not images.** The whole point is editable layers. If the user only wants
  pixels, that's a screenshot, not this skill.
- **Don't touch token values' correctness.** Match the live `--sd-*` hex exactly so rebinding to
  variables later is a no-op visually.
- **Verify visually; don't assume.** Especially without `figma-use` loaded — the screenshot is
  your proof the frame isn't a stack of grey squares.
- **Read-only on existing files unless told otherwise.** Default to a new file.
