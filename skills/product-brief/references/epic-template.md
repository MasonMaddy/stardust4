# Epic template (Jira, delivery project)

Each slice becomes one epic in the relevant delivery project (e.g. `PES` — confirm per initiative;
**not** `XR`). Created only after the engineering check and explicit approval (see
`../product-research/references/atlassian-write.md`).

## Fields
- **Summary** — the slice in one line (verb-first, outcome-oriented).
- **Description:**
  - **Goal / value** — the customer or business value this slice ships, tied to a brief Key Result.
  - **Scope** — what's in this epic.
  - **Out of scope** — what's deliberately left to other slices.
  - **User stories** — the stories from the brief this epic covers.
  - **Acceptance criteria** — Given / When / Then, lifted/refined from the brief.
  - **Dependencies** — other epics/slices or systems this relies on.
  - **Cross-functional surfaces** — which platforms are touched (from the brief checklist).
- **Links:**
  - Link to the **brief** (Confluence).
  - Link to the **initiative** (`XR`).
  - Sequence links to sibling epics where order matters.
- **Labels / metadata** — match the team's conventions (e.g. the `PES` label pattern); confirm at
  run time rather than assuming.

## Rules
- Don't create epics until slices pass the engineering check.
- Keep epics releasable — an epic that can't ship value alone should be merged or re-sliced.
- Reflect engineering-driven changes back into the brief's decision log.
