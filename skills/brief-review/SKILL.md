---
name: brief-review
description: >
  Use this skill to critique a PRODUCT BRIEF before it is published — an independent senior review
  of a draft (local .md) or an existing Confluence brief. It acts as a principal PM plus an
  engineering/design lens reviewing someone else's brief: problem-first framing, evidence
  traceability, falsifiable metrics, honest risks, slicing sanity, persona/jurisdiction/dependency
  coverage. Triggers: "review this brief", "critique the PRD", "is this brief ready to publish",
  "QA the product brief", "senior review of the brief". Runs automatically inside `product-brief`
  (Section 3.5) before publish. It APPENDS findings and never rewrites the brief; it does NOT
  author briefs (`product-brief`), fact-check research reports (`research-accuracy-review`), or
  review prototypes (`proto-design-review`).
---

# brief-review

An independent **senior-PM critique pass** over a product brief, before it becomes the contract
everything downstream builds against. The author (`product-brief`, AI- or human-drafted) did the
writing; this skill checks the brief would survive a skeptical principal PM and a delivery-minded
engineer — then appends a *Brief review findings* section so the verdict travels with the brief.

**Where this sits:**
`product-research → [discovery-backlog-card] → product-brief → ` **brief-review** ` → publish → flow-prototype`

**Operating principle (non-negotiable):** AI does the manual re-checking — tracing every
requirement, opening every link, recounting every claim — so the human keeps judgement and the
final call. This skill **verifies; it does not author.** It never silently edits the brief and
never publishes anything without approval.

## Step 1 — Orient and gather inputs

1. Locate the brief: the local draft (`session-notes/…-brief.md` or wherever `product-brief` wrote
   it), or an existing Confluence page (read-only via the Atlassian fetch tool).
2. Read it in full, plus its **upstream sources**: the research report it cites (including any
   *Research accuracy findings*) and the discovery initiative (Jira `XR`). You cannot judge
   traceability without the sources.
3. Load the standards: `../product-brief/references/tone-and-standards.md` (the bar),
   `references/brief-review-rubric.md` (the method), `../product-brief/references/slicing-guide.md`
   (for the slicing lens), and from `context/`: `personas.md`, `product-map.md` (+
   `sector-compliance.md` if the brief touches compliance/funding/ratios).

If there is no research report and no initiative behind the brief, that is itself a headline
finding — a brief with no provenance is a Blocker, not a style issue.

## Step 2 — Deterministic pre-checks (exact, not judgment)

Run these first and record results, so the reviewers start from facts:

- **Template completeness** — every section of
  `../product-brief/references/brief-template.md` (including the Stardust appendix) is present;
  list any missing headings.
- **Zero placeholders** — no unfilled `<…>`, "TBD", "TODO", or template boilerplate left standing
  unflagged. A *flagged* placeholder ("open question, owner: X") passes; a silent one fails.
- **Metrics shape** — every Key Result has a baseline (or an explicit "baseline unknown — measure
  first") and a target. Record the ones that don't.
- **Links resolve** — open every Jira/Confluence/Canny link (read-only). Record any that 404 or
  point somewhere else. **A brief with no links at all** routes to the Lens 2 provenance item.
- **Persona named and real** — the persona(s) are **named** (a role word like "admins" doesn't
  pass) and exist in `context/personas.md`.
- **Jurisdiction stated** — AU / NZ / both appears in the Stardust appendix.

## Step 3 — Spawn the two reviewers (independent, parallel)

Launch **two subagents in one message** so they run concurrently. Each gets: the brief, the
pre-check results, the upstream report's summary + findings section (or a note that **no report
exists** — the reviewers then treat every claim as unverified), the rubric, and the relevant
`context/` files. Restate the lens and the structured-findings contract explicitly.

**Reviewer A — Principal PM.** *"You are a principal product manager reviewing a brief you did
not write, deciding whether it should be allowed to drive delivery. Be adversarial — assume there
are problems and find them."* Lenses 1–3 of the rubric: problem-first framing, evidence chain
(score claims on the ✅ 🟡 ⚠️ ❌ 🚫 🎭 scale from
`../research-accuracy-review/references/accuracy-review-checklist.md`), metrics falsifiability,
non-goals, risk honesty, scope discipline.

**Reviewer B — Engineering lead + design lens.** *"You are the tech lead and design partner who
will be handed this brief. Could your team start without a meeting to re-explain it?"* Lenses 4–5:
feasibility red flags, slicing sanity against the slicing guide, cross-product dependencies
(QikKids/Discover data named with fallback behaviour), provider-level question answered,
compliance touchpoints correctly scoped AU vs NZ, states/edge-cases coverage for `flow-prototype`.

Findings format for both: `severity (Blocker / Should-fix / Nit)` · location (section) · the
standard broken · a concrete fix.

## Step 4 — Synthesise one report

Merge pre-checks and both reviewers' findings; dedupe; order by severity. Use the report template
in `references/brief-review-rubric.md`.

**Verdict rule: any Blocker → CHANGES REQUIRED; a clean Blocker list → READY TO PUBLISH.** Don't
soften a Blocker into a suggestion. End with an **integrity statement**: what you checked, what
you couldn't (e.g. links you couldn't open, claims with no reachable source), and your
recommendation.

## Step 5 — Review → Approve → Append (never silently edit)

1. Present the findings in the conversation; the user decides which to act on.
2. The author (or the user) fixes the brief — **this skill does not rewrite the brief body.** If
   asked to apply fixes, apply the agreed ones, then **re-run Step 2** to confirm nothing regressed.
3. On approval, **append** the findings as a *Brief review findings* section to the local draft
   (or, for a published brief, to the Confluence page via the gate in
   `../product-research/references/atlassian-write.md` — append only).
4. Restate the verdict. Only when it is READY TO PUBLISH should `product-brief` Section 4 proceed.

## When this runs

- **Automatically** — `product-brief` Section 3.5, before any publish (default-on; the user may
  explicitly decline).
- **Explicitly** — any trigger phrase, against a draft or an already-published Confluence brief.

## Hard rules

- **Verify, don't author.** Append findings; never rewrite, reword, or "improve" the brief body.
- **Read the sources, not just the brief.** Traceability is judged against the actual research
  report, not the brief's summary of it.
- **Read-only on Jira/Confluence/Canny**; the only write is the approved, appended findings
  section.
- **No invented findings to seem thorough** — if the brief is good, say so; "0 Blockers" is a
  valid, useful result.
- **No PII or secrets** in findings.
- Authoring is `product-brief`; research fact-checking is `research-accuracy-review`; prototype
  review is `proto-design-review`.

## Reference files

- `references/brief-review-rubric.md` — the 5-lens rubric, severity definitions, report template.
- `../product-brief/references/tone-and-standards.md` — the quality bar being enforced.
- `../product-brief/references/brief-template.md` — required structure (incl. Stardust appendix).
- `../product-brief/references/slicing-guide.md` — the slicing lens.
- `../research-accuracy-review/references/accuracy-review-checklist.md` — the claim-verdict scale.
- `context/personas.md` · `context/product-map.md` · `context/sector-compliance.md` — grounding.
