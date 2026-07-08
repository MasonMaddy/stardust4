---
name: figma-component-uplift
description: "Use this skill when a designer wants to audit AND fix a Figma component in one flow. Combines the builder spec, a live Figma audit, a gap analysis, a confirm step, and automatic Figma writes. Triggers: 'audit and fix [component]', 'full uplift on [component]', 'review and fix [component]', 'run the full loop on [component]', or any request to both review a component and apply changes to Figma."
---

# Figma Component Uplift

This skill runs the full loop: generate the ideal spec → pull the real component from Figma → find the gaps → confirm → write fixes directly to Figma.

Do not skip phases. Do not merge the confirm step into the write step. Always wait for explicit confirmation before calling `use_figma`.

---

## What you need before starting

1. **Component name** — to run the builder brief
2. **Figma node URL** — with `node-id` in the URL so the MCP can pull it
   - If not provided, ask. Do not guess a node ID.
3. **File key** — extracted from the Figma URL

---

## Phase 1 — Generate the Ideal Spec (Builder)

Read these reference files before anything else:

- `../figma-component-builder/references/token-architecture.md`
- `../figma-component-builder/references/token-cheatsheet.md`
- `../figma-component-builder/references/component-spec.md`
- `../figma-component-builder/references/component-catalogue.md`

From those files, construct the ideal spec for this component:

- Required variant properties and values (lowercase state values: `default`, `hover`, `focused`, `pressed`, `disabled`)
- Correct token for every visual property (colour, spacing, radius, typography)
- Required states for this component type
- Auto layout structure
- Mobile-first sizing requirements (44px minimum touch target)
- Layer naming expectations

This spec is your **baseline**. Everything in Phase 3 is measured against it.

Do not output the full builder brief to the user at this stage — summarise it in one short paragraph. Save the detail for the gap analysis.

---

## Phase 2 — Pull the Real Component from Figma

Use the Figma MCP to get the live component data. Run both calls in parallel:

- `get_design_context` — returns component structure, fills, layout, layer names, variant properties
- `get_variable_defs` — returns all variable bindings and their resolved values

Extract from the response:

- Variant property names and their current values
- All fill and stroke colours — note whether each is a raw hex, a primitive (`colour/*`, `base` collection), or a semantic token (`Color/*`, `value` collection)
- Spacing and radius values — note whether hardcoded or variable-bound
- Typography — note whether using published text styles or manual font settings
- Layer names — note any generic names (`Frame 3`, `Group 12`, `Rectangle 47`)
- Touch target size — outer container height at default state
- Whether a component description exists

If the MCP returns "nothing selected", tell the user:
> "Open the Figma desktop app, navigate to the [component] main component, click to select it, then come back."

Do not proceed to Phase 3 until you have real data.

---

## Phase 3 — Gap Analysis

Compare Phase 1 (ideal) against Phase 2 (real). Work through every rubric section, scoring each item ✅ **Pass** / ⚠️ **Warning** / ❌ **Fail**.

### Rubric sections

The full rubric — every checklist item, plus scoring semantics — lives in
`../figma-component-review/references/audit-rubric.md` (shared with the
`figma-component-review` skill). **Read it and score every section against the
Phase 1 spec:**

1. **Naming & Structure**
2. **Variant Completeness**
3. **Token Compliance** ← most critical
4. **Auto Layout**
5. **Mobile-first Sizing**
6. **Component Description**
7. **Edge Case Resilience** — usually not verifiable from MCP data alone; mark **Unverified** unless the designer confirms testing
8. **Internal Cleanliness**

---

## Phase 4 — Review Report

Output the review using this format:

---

### Component Uplift: [Component Name]

**Overall status:** ✅ Ready / ⚠️ Minor fixes / ❌ Not ready

**Summary**
One paragraph: what's strong, what needs work, overall signal.

---

**Findings**

For every ⚠️ and ❌:
- Section it came from
- What exactly is wrong
- How to fix it — include the **exact legacy token name** (e.g. replace `colour/grey/1000` with `Color/border`)
- Whether it's **auto-fixable** (Claude writes it) or **manual** (you do it in Figma)

Label each finding:
- `[AUTO]` — safe to write programmatically via use_figma
- `[MANUAL]` — structural change, requires designer in Figma
- `[TOKEN MISSING]` — fix requires adding a token to `tier-2-semantic.tokens.json` first

**What's working well**
2–3 specific things done correctly.

---

## Phase 5 — Confirm Before Writing

After the review report, output the confirm block. Do not write to Figma yet.

```
---
## Ready to apply — confirm?

**Auto-fixes (Claude will write these to Figma):**
- [ ] [list each AUTO fix with the exact change]

**Skipped — token missing from file:**
- [ ] [list each TOKEN MISSING fix and what token needs adding first]

**Manual — you do these in Figma:**
- [ ] [list each MANUAL fix]

Reply "apply" to write the auto-fixes now, or tell me what to skip.
---
```

Wait for the user to reply. Do not proceed until they confirm.

---

## Phase 6 — Write to Figma

Only run this phase after explicit confirmation.

Before calling `use_figma`, load the figma-use guidance:
- Prefer the `/figma-use` skill if available
- Otherwise read `skill://figma/figma-use/SKILL.md` via MCP resource

### Safe changes to automate

These are always safe to apply programmatically:

| Change | How |
|---|---|
| Rename variant property values | Rename child component node names (e.g. `State=Enabled` → `State=default`) |
| Bind fill colour to semantic variable | `figma.variables.setBoundVariableForPaint(fill, 'color', variable)` |
| Bind stroke colour to semantic variable | Same pattern on stroke paint |
| Bind `cornerRadius` to radius variable | `node.setBoundVariable('cornerRadius', variable)` |
| Bind spacing to semantic variable | `node.setBoundVariable('paddingLeft', variable)` etc. |
| Write component description | `componentSet.description = '...'` |

### Changes to never automate

Do not write these via `use_figma` — flag as MANUAL:

- Adding new variant properties (risks breaking existing instances)
- Restructuring property axes (e.g. splitting a combined `type` property)
- Adding new layers to existing variants (e.g. adding a label layer)
- Adding a touch target wrapper frame
- Detaching and re-attaching icon instances

### Execution rules

Work incrementally — one logical group per `use_figma` call:

1. **Discover** — get pages, find the component set node ID, check which variables exist in the file
2. **Rename** — apply all variant name changes
3. **Token bindings** — apply fill, stroke, radius, spacing fixes
4. **Description** — set component description
5. **Screenshot** — take an inline screenshot to verify

Return node IDs from every call. If a `use_figma` call errors, stop, read the error, fix, retry — do not proceed to the next step on a broken state.

### After writing

Take a screenshot of the component set and output:

```
## Done — changes applied

[screenshot]

**Applied:**
- [list what was changed]

**Still to do manually:**
- [list what wasn't touched]

**Token gaps to add before next pass:**
- [list any TOKEN MISSING items with the token name and which tier-2 file to update]
```

---

## Tone

Direct and specific. Name the exact node, exact token, exact property. Never say "consider updating" — say what to update and with what value.

If you cannot verify a section (no data from MCP), mark it **Unverified** and say exactly what you'd need to check it.
