---
name: apollo-comparison
description: >
  Use this skill ONLY when the user explicitly names Apollo and asks to compare a Stardust
  component against it. Triggers: "compare [component] to Apollo", "check [component]
  against Apollo", "Apollo review of [component]", "how does our [component] line up with
  Apollo", "is [component] in line with Apollo". Apollo is Xplor's global design system,
  used here as a REFERENCE only. This skill is strictly READ-ONLY — it produces a
  comparison report in conversation and never edits the repo or changes any tokens. Do NOT
  invoke it as part of any other workflow, phase, or build step, and do not invoke it
  unless the user says "Apollo".
---

# Apollo Comparison Skill — reference cross-check (read-only)

A cross-reference that audits a Stardust component against its Apollo counterpart to see
where Stardust aligns with the patterns Apollo establishes, and where it diverges by
design. Apollo is Xplor's global design system — a mature, well-crafted system built by the
central Apollo team. Here it is a **reference**, not the authority.

## Two hard constraints — do not break these

1. **Read-only.** Never use Edit/Write, never create or modify any file, never change a
   token or style. The only output is a report in the conversation. Figma MCP *read* calls
   are fine (they don't touch the repo). If asked to apply a change, decline and point the
   user to `component-review` (MD3) or the normal build flow.
2. **Explicit invocation only.** Run only when the user names Apollo. Never as part of the
   Review → Spec → Sandbox → Build pipeline or the `sandbox-review` gate.

## Priority ladder (apply to every finding)

```
Stardust standards  →  platform-native (iOS HIG / Material 3)  →  Apollo (reference)
```

Apollo never overrides Stardust, iOS, or MD3. A divergence from Apollo is something to
**consider**, not a defect to fix. Stardust's own tokens, styling, and product direction
win by default — this skill exists to inform, not to realign.

## Scope

**In scope** — pattern/standard alignment on:
- **Anatomy & variants** — structure, parts, and the set of variants/types each defines.
- **States & interaction** — state model (hover/focus/pressed/disabled/selected/error…)
  and interaction behaviour.
- **Accessibility patterns** — roles, keyboard model, focus handling, labelling
  conventions.

**Out of scope (by design — do not flag as issues):**
- **Tokens, colour, type, spacing values, and overall visual styling.** Stardust keeps its
  own. Note visual differences only as "expected — out of scope," never as findings.
- **API / prop naming conventions.**

## Tone — respect the Apollo team's work

The language must honour the people who built Apollo. Always:
- Describe Apollo as mature and well-crafted; frame divergences as differences of
  **platform and product context** — Apollo is web-focused; Stardust serves Xplor
  Education, which builds differently — not as shortcomings in Apollo.
- When Apollo's iOS/Android libraries predate current platform guidance, say so
  **factually and neutrally** ("Apollo's native libraries predate current iOS/Material
  guidance, so HIG/MD3 take precedence here"), never as criticism.
- Use neutral verdicts: **Aligned**, **Divergent by design**, **Worth considering**.
  Never "non-compliant", "wrong", "behind", or "outdated component."

## What to do

### Step 1 — Identify the component on both sides
- Stardust side: read `docs/components/[name].html` and
  `docs/assets/css/components/[name].css` for the current anatomy/variants/states.
- Apollo side: find the matching component using `references/apollo-sources.md`. If Apollo
  has **no equivalent**, say so plainly — that is a valid, common outcome — and stop.

### Step 2 — Pull Apollo reference data (Figma)
Use the Figma MCP read tools (see `references/apollo-sources.md` for file + node IDs):
1. `get_metadata` on the relevant Apollo file/page to locate the component node.
2. `get_design_context` and `get_screenshot` on that node for structure and states.

Source weighting: **Apollo Web + Foundation are the current reference.** Apollo iOS/Android
are dated — include them, but defer to **iOS HIG / Material 3** for native patterns and
flag the staleness respectfully. If a Figma node can't be accessed, or web guidelines live
only in the (browser-only) Storybook, **say what you couldn't reach and ask the user for a
screenshot or node ID — never invent Apollo's behaviour.**

### Step 3 — Compare across the in-scope dimensions
For each dimension, compare Apollo's approach to Stardust's, applying the priority ladder.
Tag each finding with the **platform** it applies to (Web / iOS / Android / All), so
web-centric Apollo patterns aren't mistaken for universal standards.

### Step 4 — Produce the report (conversation only)
Use the template below. Lead with what aligns, then what diverges by design, then anything
genuinely worth considering — framed as advisory, never mandatory. End by reminding the
user this is reference-only and no changes were made.

```markdown
## Apollo Comparison — [Component]
Reference only · Stardust + iOS/MD3 take precedence · no changes made
Apollo sources checked: [Web / Foundation / iOS / Android] — [any not accessible]

**Summary:** [1–2 sentences — overall how Stardust lines up with Apollo's patterns.]

### Aligned
- [dimension] · [platform] — Stardust and Apollo take the same approach: [detail].

### Divergent by design
- [dimension] · [platform] — Apollo: [approach]. Stardust: [approach].
  Reason this is fine: [platform/product context; priority ladder].

### Worth considering (advisory only)
- [dimension] · [platform] — Apollo does [X]; Stardust could consider [Y] because [reason].
  Not required — Stardust/iOS/MD3 remain the standard.

### Apollo has no equivalent / not assessed
- [note any component or platform not covered, and why.]
```

## Reference files
- `references/apollo-sources.md` — Apollo Figma files, node IDs, access notes, and the
  per-component node map.
- `docs/components/[name].html`, `docs/assets/css/components/[name].css` — the Stardust
  component under review.
