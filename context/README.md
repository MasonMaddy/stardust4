# context/ — agent-facing product knowledge

This directory is the **product depth layer** for agents working in this repo. `CLAUDE.md` is the
router (loaded every session); these files are loaded **on demand**, when a skill step names them;
skills hold the procedures. Together they encode how Xplor Education thinks about its products,
users, and sector — so output quality does not depend on which model is executing.

**Loading contract: never load all of context/. Load only the files your task needs**, using the
routing table below. Each file is budgeted to stay small (~120 lines) so loading two or three costs
less than one SKILL.md.

## Routing table

| You are… | Load |
|---|---|
| Prototyping or designing an **Office/BMS** flow | `product-map.md` + `personas.md` + `design-ethos.md` §BMS |
| Prototyping or designing a **Playground** flow (web or app) | `product-map.md` + `personas.md` + `design-ethos.md` §Playground |
| Prototyping or designing a **Home** (parent) flow | `product-map.md` + `personas.md` + `design-ethos.md` §Home |
| Designing anything involving the **Hub kiosk** | `design-ethos.md` §Hub + `personas.md` (family personas) |
| Doing **product research / a discovery card / a brief** | `product-map.md` + `personas.md`; add `sector-compliance.md` if the topic touches compliance, funding, or ratios |
| Reviewing a prototype, handoff, or brief (any review skill) | whatever the skill names — typically `design-ethos.md` + `personas.md` |
| Touching **sign-in/out, sleep/nappy checks, ratios, CCS/funding** | `sector-compliance.md` (always) |
| Unsure which surface a piece of work belongs to | `product-map.md` first — it maps features to surfaces |

## Files

- **`product-map.md`** — the product suite, who uses what, the customer journey, and the
  cross-product dependency checklist (QikKids / Discover / NZ).
- **`personas.md`** — the canonical persona set (9 personas across BMS and PES), each with design
  implications. `docs/foundations/personas.html` is the human-readable rendering of this file:
  **edit this file first, mirror the page in the same PR.**
- **`design-ethos.md`** — per-surface design ethos and platform conventions; what "good" means on
  each surface, and the questions every design must answer before it ships.
- **`sector-compliance.md`** — AU/NZ early-childhood sector grounding: regulation, curriculum
  frameworks, ratios, attendance records, funding. Marketing-level, externally sourced facts only.

## Rules for editing this directory

- This repo is **public**. Composite personas and marketing-level product facts only — never
  customer names, quotes, internal metrics, roadmap specifics, or Xplor's compliance posture.
- Keep each file under ~120 lines. If a file needs to grow past that, split it and add a routing
  row — don't let one file become a dumping ground.
- Facts in `sector-compliance.md` must carry a source. Regulations change: prefer updating a dated
  fact over deleting it, and note the check date.
- These files state what is true about the products and sector, not procedures. Procedure belongs
  in `skills/`; site content belongs in `docs/`.
