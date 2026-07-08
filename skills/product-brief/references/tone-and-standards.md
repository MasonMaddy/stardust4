# Tone & standards for product briefs

The quality bar a brief must clear before it ships. Provenance: originally derived from the
*(PES) Nutrition Menus* brief (page `15004368928`); rewritten 2026-07 as the standing senior-PM
standard for this pipeline. Adjust only with the product team's agreement — `brief-review`
enforces this bar.

## Voice

- **Concise and evidence-led.** Short paragraphs. Lead with the point, then support it.
- **Quantify wherever possible.** "237 votes since 2019", "reduce average time to create a
  nutrition event" — numbers beat adjectives. If a number doesn't exist, say so; don't decorate.
- **Customer-first framing.** State the customer problem in the customer's terms — anchored to a
  named persona and surface — before any solution appears.
- **Plain language.** Write for an engineer, a designer, and a stakeholder to all understand it on
  first read. Spell out sector terms (CCS, EYLF) on first use.

## The senior-PM bar

A brief is ready when it can survive these six questions from a skeptical principal PM:

1. **Is it problem-first?** The Background and Problem Statement describe a problem someone has,
   not a solution someone wants. Solutioning before the Experience Hierarchy is a defect.
   "Stakeholder asked for X" is a trigger, not a problem.
2. **Does every claim trace?** Every factual claim cites the research report, a customer signal,
   or a logged decision. Every requirement traces to one of those. **No orphan requirements** —
   if you can't say where a requirement came from, it goes to Open Questions, not Requirements.
3. **Are the metrics falsifiable?** Key Results are measurable, have a baseline (or say "baseline
   unknown — measure first"), a target, and a surface where they'll be observed. "Improve the
   experience" is not a metric. The hypothesis must be killable: name what result would disprove it.
4. **Are the non-goals explicit?** Out of Scope names the tempting adjacent work this brief
   deliberately excludes — and why. An empty Out of Scope section means scope wasn't thought about.
5. **Are the risks honest?** Value / Usability / Feasibility / Viability each get a real
   assessment with a mitigation — including the uncomfortable ones (e.g. "we don't know if
   provider admins will configure this"). A risk table with only "low" entries is a smell.
6. **Who is this for, exactly?** Persona(s) named from `context/personas.md`, surface(s) named,
   jurisdiction stated (AU/NZ/both), cross-product dependencies identified. "Educators" is not a
   target market; "Emily logging sleep checks on a shared iPad" is.

## Working standards

- **Acceptance criteria are Given / When / Then** and testable — a QA engineer could execute them
  as written.
- **The decision log is kept alive** — what was decided, why, when, who was present; strike
  through (don't delete) rescinded decisions so history stays legible.
- **Open questions have owners and dates.** An unowned question is a risk, not a question.
- **Cross-functional impact is honestly assessed** — which surfaces, what effort — not glossed.
  Provider-level functionality gets an explicit yes/no with reasoning, never silence.
- The brief **links out** to its research report and discovery initiative; provenance is one
  click away. Cite the report — never restate it.

## What to avoid

- Solutioning in the Background.
- Vague metrics ("improve experience") or unfalsifiable hypotheses.
- Inventing requirements or metrics to fill a section — leave a flagged placeholder instead.
- Conflating AU and NZ regulatory/funding claims (see `context/sector-compliance.md`).
- A states/error story deferred entirely to design — capture known states and edge cases in
  Acceptance Criteria or a *States & edge cases* subsection so `flow-prototype` doesn't rediscover
  them.
