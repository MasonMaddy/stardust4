---
name: product-research
description: >
  Use this skill when a product manager or designer needs to gather, collate, and synthesise
  product RESEARCH into a structured research report. Sources can be a stakeholder idea, Canny
  feature requests, customer interviews / conversations, support themes, or existing
  Jira/Confluence context. Triggers: "write up this research", "synthesise these interviews",
  "collate this feedback", "I have an idea from a stakeholder", "pull our Canny requests into a
  report", "what does the evidence say so far". Produces a research report published to Confluence.
  When discovery is incomplete it hands off to `discovery-backlog-card` (a separate skill) to open
  a Jira card. This skill is UPSTREAM of `product-brief`. It does NOT write a PRD / product brief
  (that is `product-brief`), does NOT create the discovery card itself (that is
  `discovery-backlog-card`), and does NOT build any UI.
---

# product-research

Turns scattered inputs into one synthesised, evidence-backed **research report** (a Confluence
page) — the artifact the `product-brief` skill consumes. When discovery is incomplete, it hands off
to the **`discovery-backlog-card`** skill, which opens a Jira card to hold the open questions while
the work continues.

**Where this sits:**
`sources → ` **product-research** ` → research report (local .md → Confluence) → [research-accuracy-review] → [discovery-backlog-card] → product-brief → flow-prototype`

**Operating principle (non-negotiable):** AI does the manual gathering, collating, and drafting;
the human owns the judgement, the customer relationships, and the final word. This skill keeps a
person in the loop at every gate and **never writes to Confluence or Jira without explicit
approval.** See `references/atlassian-write.md`.

## 1. Orient — collect the sources

**Ground in product context first.** Read `context/README.md` and follow its routing table —
typically `context/product-map.md` + `context/personas.md`. Map the incoming signal to a
**surface** (Office, Playground Web, Playground App, Home, Hub) and one or more **named
personas** before synthesising; if the signal touches compliance, ratios, sign-in/out, or
funding, also load `context/sector-compliance.md`. Research that can't name who it's for and
where they'd feel it isn't ready to synthesise.

Then build a list of every input the user has. Use
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
- **Who** is it for — cite named persona(s) from `context/personas.md` and the surface(s)?
- Which **jurisdiction** — AU, NZ, or both? (AU and NZ differ materially on curriculum, funding,
  and ratios — see `context/sector-compliance.md`; a report that conflates them misleads.)
- What **decision** will this report inform (build / don't / needs more discovery)?
- Is this **research-complete**, or does it need more discovery — i.e. a hand-off to
  `discovery-backlog-card` once the report is done (Section 7)?

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

**Compliance-adjacent findings get a sector check.** If a theme or hypothesis touches ratios,
attendance/sign-in, sleep/nappy checks, CCS/funding, or learning frameworks, sanity-check it
against `context/sector-compliance.md` (and cite the regulation, correctly scoped to AU or NZ) —
a research report that misstates the regulatory driver poisons everything downstream.

## 5. Write the report to a local Markdown file (always)

Before presenting, **write the full report to a local Markdown file in the repo working tree** so
the user can review it as a file, diff it, and hand it to the accuracy-review skill. This happens
for **every** report — it is the working draft; the Confluence page is generated from it later.

- Default path: `session-notes/<YYYY-MM-DD>-<slug>-research-report.md` (use today's date and a short
  kebab-case slug of the opportunity). Honour any path the user specifies instead.
- The file mirrors `references/research-report-template.md` exactly, including the metadata block.
- Keep the file **in sync** as the user edits — it stays the single source of truth for the draft
  until publish. Do **not** commit it (reports carry customer voice; `session-notes/` is scratch,
  not part of any PR).

## 6. Review → Approve → Publish to Confluence

1. Present the full draft in the conversation (and point to the local `.md`).
2. The user reviews and edits until they approve. **The accuracy pass is default-on:** offer to
   run `research-accuracy-review` against the `.md` before publish — it fact-checks every data
   point and appends a *Research accuracy findings* section. Skip it **only if the user explicitly
   declines**; an unreviewed report should say so in its metadata.
3. **Only then** publish, following the gate in `references/atlassian-write.md`
   (`createConfluencePage` into the agreed research space). Report the page URL back.

## 7. Hand off — discovery backlog card (`discovery-backlog-card`)

Once the report is approved (and published, if publishing), **offer the next step** with one
`AskUserQuestion`: *"Open a discovery backlog card now?"*

- **Yes** → run the **`discovery-backlog-card`** skill. It reads this report — the **Open
  questions / gaps** become the card's discovery checklist — and produces a short Jira `XR`
  Initiative (a vision-canvas snapshot) that links back to the report.
- **Not now** → stop here. `discovery-backlog-card` is directly invokable any time later.

Always offer this when the scope gate marked the work **research-incomplete**; it's optional when
the work is research-complete and headed straight to `product-brief`. This skill no longer creates
the card itself — `discovery-backlog-card` owns that.

## Hard rules

- **Never write to Jira/Confluence without explicit approval.** Draft → review → approve → write.
- **Read-only by default** for Canny and for Atlassian *search/fetch* — those are for gathering.
- **No invented evidence or quotes.** Cite every insight; label hypotheses as hypotheses.
- **Never commit or echo secrets or PII.** The Canny key lives in the environment (see README
  setup); strip personal identifiers from customer quotes unless the user explicitly keeps them.
- **Succinct beats exhaustive.** A report nobody reads has no value.
- **Always write the local `.md` draft (Section 5)** before presenting — never go straight to
  Confluence. Don't commit the draft; it carries customer voice.
- This skill stops at the research report. Creating the discovery card is `discovery-backlog-card`;
  writing the brief is `product-brief`; fact-checking the report is `research-accuracy-review`.

## Reference files

- `context/README.md` → `context/product-map.md`, `context/personas.md`,
  `context/sector-compliance.md` — product grounding (Section 1) and the sector check (Section 4).
- `references/research-report-template.md` — the report structure (the contract).
- `references/source-intake-checklist.md` — what to capture per source type.
- `references/canny-intake.md` — pulling feature requests via the Canny MCP (read-only).
- `references/atlassian-write.md` — the shared draft→approve→write gate + target IDs (also used by
  `discovery-backlog-card` and `product-brief`).
- `../discovery-backlog-card/SKILL.md` — opens the Jira discovery card from this report (Section 7).
- `../research-accuracy-review/SKILL.md` — the senior-UX-researcher fact-check pass that verifies
  the report's data points and appends *Research accuracy findings* (run before publish).
