---
name: discovery-backlog-card
description: >
  Use this skill to create a short, sharp **discovery backlog card** — a Jira `XR` (Xplor Roadmap)
  Initiative, status *In discovery* — that captures an opportunity as a one-screen snapshot and
  links out to the bigger docs (research report, brief). The card is shaped by the **Product Vision
  Canvas** (vision, customer problem, business opportunity, hypotheses, constraints) and frames
  impact with **Pirate Metrics (AARRR)**. Triggers: "create a discovery backlog card", "open a
  discovery card", "make an XR initiative", "snapshot this opportunity", "start a vision canvas
  for…". Runs standalone, or takes a `product-research` report as input. It sits BETWEEN
  `product-research` (which writes the report) and `product-brief` (which writes the PRD) — it does
  NOT write the research report, the brief, or any UI.
---

# discovery-backlog-card

Turns an opportunity into a **one-screen snapshot** a stakeholder can scan to get the high-level
view — what changes, for whom, why it matters, and what we still need to learn — with links out to
the evidence. The artifact is a Jira **`XR` Initiative** (status *In discovery*). It is deliberately
**short**: the depth lives in the linked research report and, later, the brief.

**Where this sits:**
`product-research → ` **discovery-backlog-card** ` → (filled out over time) → product-brief → flow-prototype`

**Operating principle (non-negotiable):** AI does the manual gathering, collating, and drafting;
the human owns the judgement, the customer relationships, and the final word. This skill keeps a
person in the loop at every gate and **never writes to Jira or Confluence without explicit
approval.** See `../product-research/references/atlassian-write.md`.

## 1. Orient — find the input

A discovery card holds an opportunity whose research/discovery is **not yet complete**. Start from
whatever exists:

- **From a research report** (the common path) — if there's a `product-research` report (a local
  `.md` or a Confluence page), read it first. Its **Open questions / gaps** map straight onto the
  card's discovery checklist, its customer voice and evidence stay in the report (the card links to
  them), and the report's metadata already reserves a "links to discovery card" slot to cross-link.
- **Standalone** — if there's no report yet, gather the minimum with one `AskUserQuestion` round:
  the **opportunity** in a sentence, **who** it's for, and the **decision** it informs. Don't invent
  evidence; an unsupported claim is a hypothesis and goes in the Hypotheses field as one.

## 2. Think it through with the Vision Canvas

Before drafting, fill the **Product Vision Canvas** at outcome level (not solution detail). See
`references/vision-canvas.md` for the six dimensions and their prompts:

- **Vision** — what changes when this ships.
- **Customer / user problem** — the product-agnostic problem; what's better for customers after.
- **Business opportunity** — how Xplor benefits; the business goal.
- **Hypotheses** — "We believe that…" (what's preventing the vision; what will solve the problem).
- **Constraints** — time, budget, regulatory, stakeholder, technical.

The canvas is the *thinking frame*; the card surfaces a distilled 1–2 lines per dimension.

**Ground the target group in real personas:** "who is affected" cites named personas from
`context/personas.md` and their surface(s) (`context/product-map.md`) — "educators" is vague;
"Emily on Playground App; Angela for the provider view" is a target group. Ask whether discovery
covers **NZ** (Discover-fed services) — if the opportunity is jurisdiction-sensitive
(`context/sector-compliance.md`), say so in Constraints.

## 3. Frame impact with Pirate Metrics

Use **AARRR** (`references/pirate-metrics.md`) to make the impact concrete. Pick **only the stages
this opportunity actually moves** (Acquisition, Adoption, Retention, Referral, Revenue); for each,
capture one headline **Goal · Signal · Metric**. Mark the stages it doesn't move *n/a this phase* —
that honesty is part of the value. Targets and instrumentation belong in the brief, not here.

**Metrics must be observable on the named surface.** A metric nobody can measure where the change
lands is decoration — if the surface has no instrumentation story for the signal, either name a
proxy that *is* observable or record instrumentation as a key unknown with an owner.

## 4. Draft the card

Draft from `references/discovery-card-template.md` — the canvas-shaped snapshot. Honour the
**succinctness contract**: every field is 1–2 lines or a few bullets. If a field wants to grow,
that depth belongs in the linked research report or the brief — **link, don't dump**. Every entry
in **Key unknowns** carries an **owner**.

## 5. Review → Approve → Create in Jira

Follow the shared gate in `../product-research/references/atlassian-write.md` — **draft → review →
approve → write**, no exceptions:

1. Present the full card draft in the conversation; the user edits until they approve.
2. **Only then** `createJiraIssue` into project **`XR`**, issue type **Initiative**, status
   **In discovery** (confirm the project/issue-type and re-confirm before the first real write).
   Map the card's **Summary** → the Jira summary; the rest of the snapshot → the description.
3. **Cross-link** the card ↔ the research report (and any related cards) so each leads to the
   others. Report the issue key / URL back.

For dry runs, prefer a sandbox/test project — never pollute the real `XR` backlog.

## 6. Living doc → hand off to `product-brief`

The card is a living doc. Re-run this skill to append flow charts, maps, or new interview notes and
to answer the key unknowns (assigning owners). When the discovery questions are answered, hand off
to `product-brief`, which produces the Confluence brief and links it back onto this card.

## Hard rules

- **Snapshot, not essay.** Keep every field to 1–2 lines; push depth to the linked report/brief.
  **Link, don't dump.**
- **Every discovery question has an owner.** An unowned unknown never gets answered.
- **Human-in-the-loop.** Never write to Jira/Confluence without explicit approval (draft → review →
  approve → write).
- **No PII or secrets** in the card body; strip personal identifiers from any customer quote.
- **Standalone-safe.** Works without a prior report — just gather the minimum first, and label
  unsupported claims as hypotheses.
- This skill stops at the discovery card. Writing the research report is `product-research`; writing
  the brief and slicing epics is `product-brief`.

## Reference files

- `references/discovery-card-template.md` — the canvas-shaped snapshot (the card's structure).
- `references/vision-canvas.md` — the Product Vision Canvas: the six dimensions + prompts.
- `references/pirate-metrics.md` — AARRR (Goal · Signals · Metrics) for framing impact.
- `../product-research/references/atlassian-write.md` — the shared draft→approve→write gate + target
  IDs (`XR` / Initiative / *In discovery*, cloudId, `createJiraIssue` / `createIssueLink`).
- `../product-research/SKILL.md` — upstream: writes the research report this card links to.
- `../product-brief/SKILL.md` — downstream: turns the answered card into a brief + epics.
