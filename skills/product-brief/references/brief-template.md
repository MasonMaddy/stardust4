# Xplor product brief template

The structure to follow, captured from the Xplor brief template (Confluence space `PRODUCT`,
page `16127688797`). Reproduce these sections; fill from the research report and discovery
initiative. Keep placeholders only where genuinely unknown, and flag them.

> Source of truth is the Confluence template — if it changes, re-pull it. The published example to
> match for tone/depth: *(PES) Nutrition Menus* (page `15004368928`).

---

## Header table
| Field | Notes |
|---|---|
| Platform | which product area |
| Team | which team(s) will build this |
| Target release | optional |
| Document status | Draft · In review · Ready-for-release |
| Document owner / PM | |
| Designer | |
| Tech lead | |
| QA | |
| Design / flow / canvas links | Figma / Miro |
| Epic | link to the delivery epic(s) |
| Additional links | research report, discovery initiative |

## 🚀 Background
The north star — the problem or opportunity to work towards. **No solutions here.** Pull the
evidence (Canny votes, support themes, interview findings) from the research report.

## 🎯 Opportunity Assessment
- **Business Objective** — what business objective this addresses.
- **Key Results** — how we'll know we succeeded (measurable).
- **Customer Problem** — the problem this solves for customers.
- **Hypothesis** — what we believe will change if we solve it.
- **Target Market** — which customer segment(s).

## 👪 Project Definition
### Problem Statement (first person)
- **I am an…** user/stakeholder
- **I'm trying to…** job to be done
- **But…** problem/barrier
- **Because…** root cause
- **Which makes me feel…** emotion
- **And makes me do…** current workaround
- **This is costing us…** quantified problem

### Business Goals
High-level intended results of this feature.

## 🔍 Requirements Gathering & Discovery
- **Research resources & supporting data** — table of Resource · Link (link the research report,
  Canny posts, interview reports, support escalations).
- **Constraints / Risks** — table across the four risk types: **Value** (will they choose it?),
  **Usability** (can they use it?), **Feasibility** (can we build it?), **Viability** (does it work
  for the business?) — each with details, level, mitigation.
- **Cross-Functional Requirements** — which surfaces are impacted (checklist): Office (PHP),
  Playground Web (Elixir), Playground App (Mobile), Home App (Mobile), Home Web (Elixir), Hub, QK,
  Discover, MWL, Kickback (Elixir). Elaborate on each ticked item.
- **Notifications Required** · **Provider-level functionality** · **Feature flags/toggles** ·
  **Reporting Functionality Required** · **Google Analytics tagging**.

## 💻 Experience Hierarchy
- **User Stories** — table: Requirement · User Story (*As a [user] I want to [x] so that [y]*) ·
  Importance (+ Notes).
- **Acceptance Criteria** — table: **Given · When · Then**.
- **Open Questions** — table: Question · Answer · Date Answered.
- **Out of Scope** — what this brief explicitly does not cover.

## Decision log
Table: Decision · Why · Date · Participants. Keep it alive as decisions are made; strike through
rescinded decisions rather than deleting them.

## 🚢 Release Documentation
- **Support Articles Required** — does Xplor need docs/guides/videos to support this feature?

---

## Stardust appendix (repo-side additions — not part of the Confluence template)

The Xplor template above is org-owned; reproduce it exactly. This appendix travels with the brief
(after the template sections) and captures what this pipeline additionally requires:

- **Personas & surfaces** — named persona(s) from `context/personas.md` and the surface(s) the
  work lands on (Office / Playground Web / Playground App / Home / Hub). The Problem Statement's
  "I am an…" should be one of these personas.
- **Jurisdiction** — AU / NZ / both; note any AU–NZ behavioural differences the requirements must
  honour (`context/sector-compliance.md`).
- **Cross-product dependencies** — QikKids/Discover-fed data this feature consumes (with the
  missing-field behaviour), and Office↔PES hand-offs (from the checklist in
  `context/product-map.md`). Complements the Cross-Functional Requirements checklist above by
  saying *what the dependency is*, not just which box is ticked.
- **States & edge cases** — the error/empty/system states known at brief time, so
  `flow-prototype` inherits them instead of rediscovering them.
