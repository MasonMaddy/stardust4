# Research report template

The structure the `product-research` skill produces. It is first written to a **local Markdown
file** (`session-notes/<YYYY-MM-DD>-<slug>-research-report.md` by default) for review, then
published to Confluence after approval. Keep it succinct — synthesise, don't transcribe. Every
insight cites a source; every guess is labelled a hypothesis.

> **Pending Mason's input (#4):** align the tone and the succinctness bar with Xplor's standards
> docs once provided. Until then, follow: evidence over adjectives, short sections, no filler.

---

## Page title
`Research — <problem/opportunity>` (keep it findable in Confluence search)

## Metadata block (top of page)
- **Status:** Draft · In review · Complete
- **Author:** <name>
- **Date:** <YYYY-MM-DD>
- **Decision this informs:** build / don't / needs more discovery
- **Related:** links to discovery card, prior research, related epics

## 1. Summary (3–5 lines)
The problem or opportunity, who it affects, and what the evidence suggests. A reader should get
the gist here without scrolling.

## 2. Background & trigger
Where this came from (stakeholder, Canny, support, interviews) and why it surfaced now.

## 3. Sources & evidence
A list of every source consulted, with type, date, and a one-line takeaway. This is the
provenance — insights below must trace back to a row here.

| # | Source | Type | Date | Takeaway |
|---|--------|------|------|----------|

## 4. Customer voice
Verbatim quotes, attributed by segment (not by named individual unless the user keeps the name).
**Never invent or paraphrase a quote into existence.** Strip PII by default.

## 5. Themes & insights
Patterns that appear across multiple sources. Lead with the strongest-supported. Note how many
sources back each theme (1 voice ≠ a pattern).

## 6. Hypotheses
What we *believe* but haven't confirmed — kept strictly separate from Section 5. Each hypothesis
should name what evidence would confirm or kill it.

## 7. Open questions / gaps
What we still don't know. These become the discovery backlog card's checklist if discovery isn't
complete.

## 8. Recommendation & next step
One of: proceed to `product-brief`; open/continue a discovery backlog card; or do not proceed
(with reasoning). State the single next action and owner.

## 9. Research accuracy findings
**Left empty by `product-research`.** Appended by `research-accuracy-review` after a senior-UX-
researcher fact-check pass — verdict + per-data-point findings table + integrity statement. See
`../../research-accuracy-review/references/findings-template.md`.
