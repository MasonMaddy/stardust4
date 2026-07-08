# Discovery backlog card template (Jira `XR` Initiative)

A "discovery backlog card" is a Jira **Initiative** in the **`XR` (Xplor Roadmap)** project, set to
status **In discovery**. It holds an opportunity whose research/discovery is not yet complete, and
links out to its research report (and, later, its Confluence brief). Model: **XR-83**.

It is a **one-screen snapshot**, shaped by the Product Vision Canvas (`vision-canvas.md`) and Pirate
Metrics (`pirate-metrics.md`). Confirm the project key + issue type via `atlassian-write.md` before
any write, and follow the draft→review→approve→write gate.

> **Succinctness contract:** every field below is **1–2 lines or a few bullets**. If a field wants
> to grow, that depth belongs in the linked research report or the brief — **link, don't dump**.
> The card's job is to let someone scan it in a minute and know what this is, who it's for, why it
> matters, and what we still need to learn.

---

## Snapshot

**Summary** — the opportunity in one line. *(→ becomes the Jira issue summary.)*

**Status** — In discovery · **Effort** — rough size if known (S / M / L).

**Links** — Research report ↗ · related cards ↗ · Brief (added later, once `product-brief` exists).

### Vision Canvas

- **Vision** — what changes when this ships (outcome-level, light on solution).
- **Customer / user problem** — the product-agnostic problem; what's better for customers after.
- **Business opportunity** — how Xplor benefits; the business goal.
- **Hypotheses** — "We believe that…" (what's preventing the vision / what will solve the problem).
- **Constraints & dependencies** — time · budget · regulatory · stakeholder · technical.

### Success metrics (Pirate / AARRR)

Only the stages this opportunity moves. One headline each; mark the rest *n/a this phase*. Targets
and instrumentation live in the brief.

| Stage | Goal | Signal | Metric |
|---|---|---|---|
| Acquisition | … | … | … |
| Adoption | … | … | … |
| Retention | … | … | … |
| Referral | … | … | … |
| Revenue | … | … | … |

*(Delete or mark `n/a this phase` the rows that don't apply — keep the table honest, not padded.)*

### Discovery

- **Who is affected** — Primary · Secondary · Future · Out of scope. Cite named personas from
  `context/personas.md` with their surface(s) — not generic role words.
- **Jurisdiction** — AU / NZ / both; does discovery include NZ (Discover-fed) services?
- **Cross-product dependencies** — any QikKids/Discover-fed data or Office↔PES hand-offs this
  touches (see the checklist in `context/product-map.md`), or "none identified".
- **Key unknowns / discovery questions** — the discovery checklist; **each with an owner**. These
  map directly from the research report's *Open questions / gaps* section.
- **Out of scope (this phase)** — explicit exclusions.

---

## Jira mapping

- **Summary field** → the Jira issue **summary** (one line).
- **Everything below Summary** → the Jira issue **description** (keep the headings above).
- **projectKey** `XR` · **issueTypeName** `Initiative` · **status** `In discovery`.
- Create via `createJiraIssue`; gate + IDs in `atlassian-write.md`.

## Lifecycle

1. Created in `XR` (Initiative, *In discovery*) — standalone, or handed off from `product-research`.
2. Filled out over time — re-run `discovery-backlog-card` to append findings, flow charts, maps,
   interview notes; answer the key unknowns and assign owners.
3. When the discovery questions are answered → hand off to `product-brief`, which produces the
   Confluence brief and links it back here.

## Cross-linking

Always link the initiative ↔ the research report so they find each other, and later the
initiative ↔ the brief. Any node should lead to the others.
