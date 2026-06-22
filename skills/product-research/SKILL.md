---
name: product-research
description: >
  Use this skill when a product manager or designer needs to gather, collate, and synthesise
  product RESEARCH into a structured research report. Sources can be a stakeholder idea, Canny
  feature requests, customer interviews / conversations, support themes, or existing
  Jira/Confluence context. Triggers: "write up this research", "synthesise these interviews",
  "collate this feedback", "I have an idea from a stakeholder", "pull our Canny requests into a
  report", "create a discovery backlog card", "what does the evidence say so far". Produces a
  research report published to Confluence, and optionally a discovery backlog card in Jira when
  more discovery work is still needed. This skill is UPSTREAM of `product-brief`. It does NOT
  write a PRD / product brief (that is `product-brief`) and it does NOT build any UI.
---

# product-research

Turns scattered inputs into one synthesised, evidence-backed **research report** (a Confluence
page) — the artifact the `product-brief` skill consumes. When discovery is incomplete, it can
instead (or also) open a **discovery backlog card** in Jira to hold the open questions while the
work continues.

**Where this sits:**
`sources → ` **product-research** ` → research report (Confluence) → product-brief → flow-prototype`

**Operating principle (non-negotiable):** AI does the manual gathering, collating, and drafting;
the human owns the judgement, the customer relationships, and the final word. This skill keeps a
person in the loop at every gate and **never writes to Confluence or Jira without explicit
approval.** See `references/atlassian-write.md`.

## 1. Orient — collect the sources

Before writing anything, build a list of every input the user has. Use
`references/source-intake-checklist.md` to make sure each source type is captured properly:

- **Stakeholder idea** — who, the problem as *they* framed it, why now.
- **Canny feature requests** — pull via the Canny MCP read tools (read-only). See
  `references/canny-intake.md`.
- **Customer interviews / conversations** — paste notes/transcripts; capture verbatim quotes.
- **Existing Jira / Confluence context** — search for prior discovery, related epics, duplicates
  (read-only; use the Atlassian MCP search/fetch tools).

If a source is missing or thin, say so — do not invent evidence. A claim with no source is a
hypothesis, and must be labelled as one.

## 2. Choose how to co-author

Ask the user once, up front, with `AskUserQuestion`:

- **Guided** — you prompt section by section and the user writes the copy in their own words.
  Best when the report carries their voice / a customer's voice.
- **Drafted** — you draft each section from the sources and the user reviews and edits.

Either way the human reviews and approves before anything is published.

## 3. Scope gate

Confirm before synthesising (one `AskUserQuestion` round):

- What's the **problem or opportunity**, in one sentence?
- **Who** is it for (segment / persona)?
- What **decision** will this report inform (build / don't / needs more discovery)?
- Is this **research-complete**, or does it need a **discovery backlog card** (Section 6)?

## 4. Synthesise the report

Follow `references/research-report-template.md` exactly. The spine:

1. **Summary** — problem/opportunity + what the evidence suggests, in 3–5 lines.
2. **Background & trigger** — where this came from.
3. **Sources & evidence** — every source listed; each insight cited back to a source.
4. **Customer voice** — verbatim quotes, attributed by segment (never invent quotes).
5. **Themes & insights** — patterns across sources.
6. **Hypotheses** — clearly separated from evidence.
7. **Open questions / gaps** — what we still don't know.
8. **Recommendation & next step** — e.g. proceed to `product-brief`, or open discovery card.

Keep it **succinct** — synthesise, don't transcribe. Evidence over adjectives.

## 5. Review → Approve → Publish to Confluence

1. Present the full draft in the conversation.
2. The user reviews and edits until they approve.
3. **Only then** publish, following the gate in `references/atlassian-write.md`
   (`createConfluencePage` into the agreed research space). Report the page URL back.

## 6. Branch — discovery backlog card (Jira)

When the scope gate marks the work **research-incomplete**, create a discovery backlog card to
hold the open questions while discovery continues:

- Draft the card from `references/discovery-card-template.md`, review, approve, then
  `createJiraIssue` into the discovery backlog project (gate in `references/atlassian-write.md`).
- **Cross-link** the card and the research page so they find each other.
- The card is a living doc — re-run this skill to add flow charts, maps, or new interview notes
  over time. When discovery is done, hand off to `product-brief`.

## Hard rules

- **Never write to Jira/Confluence without explicit approval.** Draft → review → approve → write.
- **Read-only by default** for Canny and for Atlassian *search/fetch* — those are for gathering.
- **No invented evidence or quotes.** Cite every insight; label hypotheses as hypotheses.
- **Never commit or echo secrets or PII.** The Canny key lives in the environment (see README
  setup); strip personal identifiers from customer quotes unless the user explicitly keeps them.
- **Succinct beats exhaustive.** A report nobody reads has no value.
- This skill stops at the research report / discovery card. Writing the brief is `product-brief`.

## Reference files

- `references/research-report-template.md` — the report structure (the contract).
- `references/source-intake-checklist.md` — what to capture per source type.
- `references/canny-intake.md` — pulling feature requests via the Canny MCP (read-only).
- `references/atlassian-write.md` — the shared draft→approve→write gate + target IDs.
- `references/discovery-card-template.md` — Jira discovery backlog card format.
