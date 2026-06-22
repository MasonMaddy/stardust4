---
name: product-brief
description: >
  Use this skill when a product manager needs to turn research and/or a discovery initiative into
  an Xplor PRODUCT BRIEF (Xplor's name for a PRD) and slice the initiative into deliverable epics.
  Triggers: "write the product brief", "draft the PRD", "turn this research into a brief", "break
  this initiative into slices/epics", "this discovery is done — let's define it". Produces a brief
  as a Confluence page (under Product Briefs, space PRODUCT) following the Xplor template, links it
  to its Jira initiative, then proposes slices and creates epics in the delivery project after an
  engineering check. UPSTREAM input is `product-research`; DOWNSTREAM consumer is `flow-prototype`.
  Does NOT do research synthesis (that's `product-research`) and does NOT build UI.
---

# product-brief

Turns a research report and/or a discovery initiative into an **Xplor product brief** (a Confluence
page following the Xplor template), links it to its Jira initiative, then decomposes the initiative
into **slices → epics** in the delivery project — with an engineering check before anything is
committed.

**Where this sits:**
`product-research → ` **product-brief** ` → flow-prototype → dev-handoff`

**Operating principle (non-negotiable):** AI drafts and decomposes; the human owns the decisions,
the engineering conversation, and the final word. Keep a person in the loop at every gate and
**never write to Confluence or Jira without explicit approval** (`references/atlassian-write.md`).

## 1. Orient — read the inputs

- The **research report** (Confluence) and/or the **discovery initiative** (Jira `XR` project,
  type *Initiative*, status *In discovery* — e.g. XR-83). Read both fully before drafting.
- If discovery is clearly incomplete (open key-unknowns with no answers), **stop and send the user
  back to `product-research`** to finish discovery. A brief built on thin discovery is a liability.

## 2. Choose how to co-author

Ask once, up front (`AskUserQuestion`):
- **Guided** — you prompt section by section; the user writes the copy in their words.
- **Drafted** — you draft each section from the research/initiative; the user reviews and edits.

## 3. Build the brief — follow the Xplor template exactly

Use `references/brief-template.md` (the captured Xplor template) section by section, and
`references/tone-and-standards.md` for voice and the quality bar. The spine:

1. **Header** (Platform, Team, owner/PM, Designer, Tech lead, links, status)
2. **🚀 Background** — the north star; problem/opportunity, no solutions yet
3. **🎯 Opportunity Assessment** — Business Objective · Key Results · Customer Problem · Hypothesis · Target Market
4. **👪 Project Definition** — the first-person Problem Statement (*I am an… I'm trying to… But… Because… Which makes me feel… And makes me do… This is costing us…*) + Business Goals
5. **🔍 Requirements Gathering & Discovery** — research resources (link the research report + Canny posts), Constraints/Risks (Value/Usability/Feasibility/Viability), Cross-Functional Requirements (the product checklist), notifications, provider-level, feature flags, reporting, analytics
6. **💻 Experience Hierarchy** — User Stories (Requirement · Story · Importance), Acceptance Criteria (**Given / When / Then**), Open Questions, Out of Scope
7. **Decision log** — Decision · Why · Date · Participants (keep this alive)
8. **🚢 Release Documentation** — support articles required

Pull evidence straight from the research report — don't restate it; cite it.

## 4. Review → Approve → Publish to Confluence

Present the full draft → user edits → explicit approval → only then `createConfluencePage` as a
**child of "Product Briefs"** (page `533823540`, space `PRODUCT`). Then **link** the brief on the
Jira initiative (and the initiative on the brief). See `references/atlassian-write.md`.

## 5. Slice the initiative → epics (with an engineering check)

1. Propose **slices** — small, independently releasable chunks that move the lever / create
   customer value early. Use `references/slicing-guide.md`.
2. **Human review of the slices** before any Jira write.
3. **Engineering check** — share the slices with the eng team; expect them to reshape. This is a
   loop, not a gate you force through.
4. On approval, `createJiraIssue` **epics** in the relevant **delivery project** (e.g. `PES` —
   confirm per initiative; epics do NOT go in `XR`), each linked to the brief, using
   `references/epic-template.md`. Adjust epics as engineering feedback lands.

## 6. Handoff to flow-prototype

The brief is the *intent truth* `flow-prototype` consumes. Before handing off, confirm the brief
carries what that skill needs: **intent, copy, the screen list, and the states + error/system
states**. The Xplor template has no dedicated error-states matrix — capture states in Acceptance
Criteria / Open Questions, or add a short **States & edge cases** subsection, so the prototype
handoff needs no rework.

## Hard rules

- **Never write to Jira/Confluence without explicit approval.** Draft → review → approve → write.
- **Brief = Confluence (PRODUCT, under Product Briefs); Initiative = `XR`; Epics = delivery project.**
  Confirm the delivery project per initiative — never guess.
- **Don't invent requirements or metrics.** Trace every requirement to research or a decision.
- **Slices are releasable** — if a slice can't ship value on its own, it's a task, not a slice.
- **No secrets or PII** in any page/issue body.
- Discovery-incomplete? Back to `product-research`. UI? That's `flow-prototype`.

## Reference files

- `references/brief-template.md` — the Xplor brief template (the contract).
- `references/tone-and-standards.md` — voice + the succinctness/quality bar.
- `references/slicing-guide.md` — initiative → slices → epics heuristics.
- `references/epic-template.md` — the epic structure for Jira.
- `../product-research/references/atlassian-write.md` — the shared draft→approve→write gate + target IDs.
