---
name: component-checker
description: >
  Use this skill to audit a Figma file, page, or frame against Mason's Stardust
  design system and confirm everything aligns. Triggers include: "check this
  file against the design system", "is this on-system", "audit these screens",
  "are these components linked to Stardust", "do these use the right tokens",
  "component checker", "check token alignment", "is this button the real
  Stardust button", "scan this Figma for off-system stuff", or any request to
  verify that a design uses the central library components and the mapped token
  collection. This skill does NOT build or document components (that's the
  Review → Spec → Sandbox → Build workshop) — it READS a target file and reports
  what is and isn't aligned, with concrete fixes. Use it whenever a designer
  hands over screens and asks whether they're built correctly on the system.
---

# Component Checker Skill

Audits a target Figma file against the **Stardust design system** and reports every
place it drifts off-system. It is a read-only compliance scanner — it does not modify
the target file or build anything. It answers one question:

> Is everything in this file (a) an instance of a component from the central Stardust
> library, and (b) bound to the correct `mapped` tokens — matching what's live on
> Mason's site?

## The three sources of truth

| What | Source | Used for |
|---|---|---|
| **Central component library** | Figma file `a7JnfZ0Nd8df1TBPaMQ5Tj` (Stardust Components) | Every UI element must be an instance of a main component from here |
| **Tokens (`mapped` collection)** | `references/token-rules.md` (mirrors the live file) | Every colour / spacing / radius / type must bind to a `mapped` variable |
| **Live build** | `docs/` in the stardust4 repo + `https://masonmaddy.github.io/stardust4/` | Final values must match what ships |

The central library file key — **`a7JnfZ0Nd8df1TBPaMQ5Tj`** — is the anchor. A button
in any file must be an instance of `Stardust/Button` from this file, not a local copy,
a detached frame, or a redraw.

Read `references/token-rules.md` and `references/component-registry.md` before auditing.

---

## Workflow

### Step 1 — Scope the audit

Get a node-specific Figma URL from the user (must include `node-id`). Determine:
- **fileKey** and **nodeId** from the URL.
- Is the target the central library itself, or a *consuming* file (screens, a playground)?
  The checker is for **consuming files** — files that should be using the library.

If no `node-id` is supplied, ask for a link to the specific page/frame to check.

### Step 2 — Map the structure

Call `get_metadata` on the target node. This returns the node tree with types
(`instance`, `frame`, `text`, `rectangle`, …), names, positions and sizes. Build a
flat inventory of every leaf and container. This is the worklist.

> Heuristic: `instance` nodes are candidate library components. `frame` / `rectangle`
> / `text` / `ellipse` nodes that *look like* a known component (a button-shaped
> rounded-rectangle + text) are prime suspects for **detached / hand-built** elements.

### Step 3 — Provenance check (is it a real Stardust component?)

For each element that should be a component (see the registry in
`references/component-registry.md`):

1. Confirm it is an `instance`, not a hand-built frame/rectangle/text cluster.
2. Confirm its **main component lives in `a7JnfZ0Nd8df1TBPaMQ5Tj`**. Use
   `get_code_connect_map` and `get_libraries` to see linked libraries; use
   `search_design_system` to find the canonical component the element *should* map to.
3. Confirm the **variant / properties** are valid for that component (compare against
   the component's `-spec.md` listed in the registry).

Flag: detached elements, local components, instances whose main component is NOT the
central file, and instances using variants that don't exist in the spec.

### Step 4 — Token-binding check

For each node, call `get_variable_defs` to see which variables its fills, strokes,
spacing, radius, and text styles are bound to. Then apply `references/token-rules.md`:

- ✅ Bound to a **`mapped`** semantic variable (`colour/action/primary`, `spacing/component/md`, `radius/lg`, a published text style) → pass.
- 🟠 Bound directly to a **`base`** primitive (`colour/cyan/700`, `spacing/4`) → major: should use the semantic alias.
- 🔴 **Raw / detached value** (hard-coded hex, unbound number) → critical.
- 🔴 **Greenfield value** (coral `#FF5A35`, navy `#1A2B4A`, neutral ramp) → critical: that's the unapproved future-state palette, not live Stardust (teal `#00776B`).

### Step 5 — Live-alignment check

For confirmed-on-system elements, spot-check that resolved values match the live build:
compare to `docs/assets/css/tokens.css` (token values) and
`docs/assets/css/components/[name].css` (component values). Note any element that is a
correct library instance but whose value diverges from what ships.

### Step 6 — Report

Produce the audit using `references/report-template.md`. Lead with a one-line verdict
and a pass/fail count, then a severity-ranked findings table, then per-element detail
with the **exact fix** for each (which component to swap to, which token to rebind).
Never silently skip a node — if coverage was capped, say so.

---

## Severity model

| | Meaning | Examples |
|---|---|---|
| 🔴 **Critical** | Off-system; will not inherit library updates | Detached/hand-built element, instance from a non-central file, raw hex, greenfield-palette value |
| 🟠 **Major** | On-system but wrong | Bound to `base` primitive not `mapped` semantic, invalid variant, dimension mismatch vs spec |
| 🟡 **Minor** | Cosmetic / hygiene | Layer naming, missing optional prop, value drift within tolerance from live |

## Guardrails

- **Read-only.** Never edit the target Figma file or push changes. Output is a report.
- **Don't guess provenance.** If `get_libraries` / Code Connect can't confirm a main
  component is in `a7JnfZ0Nd8df1TBPaMQ5Tj`, report it as *unverified*, not *passing*.
- **Legacy, not greenfield.** The live system is Legacy Stardust (teal `#00776B`). Treat
  the greenfield coral/navy architecture as a violation unless the user says a migration
  is approved.
- Distinguish what you verified via MCP from what you inferred visually.
