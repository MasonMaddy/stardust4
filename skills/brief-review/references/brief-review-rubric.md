# Brief review — full rubric

The exhaustive rubric behind the `brief-review` skill. The skill summarises this; read this file
for the complete list when reviewing. Findings reference these items.

## Severity definitions

- **Blocker** — the brief cannot safely drive delivery: no provenance, untraceable requirements,
  unfalsifiable success criteria, a wrong regulatory/product claim, or a missing answer the build
  team cannot proceed without. Must be fixed before publish. Not negotiable.
- **Should-fix** — a real quality problem a principal PM would not let through, but the brief
  wouldn't actively mislead delivery. Fix unless there's a stated reason.
- **Nit** — polish or style. Optional.

Every finding states: `severity` · **section** · the **standard broken** (cite the rubric item or
`tone-and-standards.md` rule) · a **concrete fix**. No vague findings.

**Pre-check failures map to severities too:** a missing template section or absent Stardust
appendix → Should-fix (Blocker if it removes an answer the team can't proceed without, e.g. no
jurisdiction on a compliance-touching brief); an unflagged placeholder → Should-fix; broken links
→ Should-fix; **no links at all** → route to the Lens 2 provenance item (usually a Blocker).

---

## Lens 1 — Problem & framing (Principal PM)

- [ ] **Problem-first.** Background and Problem Statement describe a customer problem, not a
      solution request. Solutioning before the Experience Hierarchy → Should-fix; a Background
      that is *only* a solution ("build X because stakeholder asked") → Blocker.
- [ ] **The Problem Statement is a real persona's.** "I am an…" maps to a named persona in
      `context/personas.md`, on a named surface, and the pain rings true for that persona (a
      provider-admin pain attributed to a room educator → Blocker: wrong problem).
- [ ] **Target Market is specific.** Segment + jurisdiction, not "our customers". (Should-fix)
- [ ] **The "why now" is stated** — trigger, cost of doing nothing, or window. (Should-fix)

## Lens 2 — Evidence & traceability (Principal PM)

- [ ] **Provenance exists** — the brief links a research report and/or discovery initiative.
      Neither → Blocker.
- [ ] **Every factual claim traces.** Spot-check each claim against the actual research report
      (not the brief's own restatement). Score with the accuracy scale: ✅ Verified · 🟡 Partly ·
      ⚠️ Unverified · ❌ Inaccurate · 🚫 Hallucinated · 🎭 Biased framing. Any ❌/🚫 → Blocker;
      ⚠️ on a load-bearing claim → Blocker; 🎭 → Should-fix minimum. With no source reachable, a
      claim stays ⚠️ (you can't prove 🚫) — the Blocker outcome is the same; note the ambiguity.
- [ ] **Suspicious precision.** A too-clean number ("84%") with no source is a fabrication tell —
      treat as ⚠️ load-bearing until traced. (Blocker until sourced or removed)
- [ ] **Internal self-consistency.** The brief doesn't contradict itself — e.g. "Open Questions:
      none" while the header carries TBDs, or a Target Market the Problem Statement doesn't match.
      (Should-fix)
- [ ] **No orphan requirements.** Every user story/requirement traces to research, a customer
      signal, or a logged decision. Orphans → Blocker (move to Open Questions instead).
- [ ] **Research accuracy findings honoured** — if the upstream report's findings section flagged
      corrections, the brief doesn't repeat the uncorrected claims. (Blocker)
- [ ] **Votes framed as demand signal**, not proof of value/willingness-to-pay. (Should-fix)

## Lens 3 — Metrics, scope & risk (Principal PM)

- [ ] **Key Results are falsifiable** — measurable, baseline (or explicit "unknown — measure
      first"), target, and an observable surface. Decorative metrics → Blocker.
- [ ] **The hypothesis is killable** — what result would disprove it is inferable or stated.
      (Should-fix)
- [ ] **Out of Scope is real** — names tempting adjacent work and why it's excluded. Empty or
      boilerplate → Should-fix.
- [ ] **Risks are honest** — Value/Usability/Feasibility/Viability each assessed with a real
      mitigation; an all-"low" risk table → Should-fix (interrogate it).
- [ ] **Open questions have owners and dates.** (Should-fix)
- [ ] **Decision log present and alive** — decisions carry why/when/who. (Should-fix)

## Lens 4 — Buildability (Eng lead)

- [ ] **A team could start** — user stories + acceptance criteria are complete enough that the
      first slice needs no re-explaining meeting. List the questions an engineer would have to ask;
      each is a finding.
- [ ] **Acceptance criteria are Given/When/Then and testable** as written. (Should-fix; Blocker if
      ACs are missing for the core stories.)
- [ ] **Slices follow the slicing guide** *(only if slices/epics exist or are linked via the Epic
      header field — a draft brief pre-slicing is "not yet assessable", recorded in the integrity
      statement, not passed)* — releasable, thin-vertical, lever-moving, small; the first slice
      proves the hypothesis. A foundation-only slice one → Should-fix.
- [ ] **Destructive-action safety on systems of record** — if the brief proposes bulk or
      destructive admin actions with billing/compliance consequences, the requirements include
      confirm / undo / audit-trail behaviour per `context/design-ethos.md` §BMS. (Should-fix;
      Blocker if a bulk write to compliance-bearing records has no safety story at all.)
- [ ] **Integration-fed data gets its own spike/dependency epic** (QikKids/Discover), not buried
      in a feature slice. (Should-fix)
- [ ] **Feasibility red flags surfaced** — anything the brief assumes trivially buildable that
      plainly isn't (cross-surface real-time sync, bulk migrations, new notification channels).
      (Should-fix; Blocker if the whole plan hinges on it unexamined.)

## Lens 5 — Product & platform coverage (Eng lead + design lens)

- [ ] **Surfaces named and consistent with `context/product-map.md`** — the feature lands where
      the brief says it does; Cross-Functional Requirements ticks match the narrative. (Blocker if
      contradictory.)
- [ ] **Provider-level question answered** — for anything touching Office: does Priya need bulk /
      cross-service / configuration behaviour? Explicit yes/no with reasoning; silence → Blocker
      for Office-touching briefs, per `context/design-ethos.md` §BMS.
- [ ] **Cross-product dependencies concrete** — QikKids/Discover-fed fields named with
      missing-field behaviour; "none identified" is acceptable if stated. (Should-fix)
- [ ] **Jurisdiction scoped** — AU/NZ/both stated; compliance/funding claims match
      `context/sector-compliance.md` and are not conflated across jurisdictions. Wrong or
      conflated regulatory claim → Blocker.
- [ ] **Compliance side-effects of the action itself** — does what the feature *does* create a
      compliance risk the brief ignores (e.g. a bulk room move that could breach per-state ratios
      or capacity; attendance edits that alter CCS session data)? Check against
      `context/sector-compliance.md`. (Blocker if unexamined on a compliance-bearing action.)
- [ ] **Downstream surface hand-off** — where does this feature's data surface next
      (Office ↔ Playground ↔ Home ↔ Hub — checklist item 4 in `context/product-map.md`)? Each
      receiving surface acknowledged or explicitly ruled out. (Should-fix)
- [ ] **States & edge cases captured** — known error/empty/system states appear in ACs or the
      Stardust appendix so `flow-prototype` inherits them. (Should-fix)
- [ ] **Notifications / feature flags / reporting / analytics** sections answered, not skipped.
      (Should-fix)

---

## Report template

```markdown
## Brief review findings — [Brief title]
Reviewer: brief-review · Date: [YYYY-MM-DD] · Brief: [path / URL] · Sources read: [report, XR-n]

**Verdict: READY TO PUBLISH ✅ / CHANGES REQUIRED ❌**
Blockers: N · Should-fix: N · Nits: N

### Deterministic pre-checks
| Check | Result |
|---|---|
| Template sections complete (incl. Stardust appendix) | ✅ / ❌ missing: … |
| Unflagged placeholders | ✅ none / ❌ N (…) |
| Metrics have baseline + target | ✅ / ❌ … |
| Links resolve | ✅ N/N / ❌ broken: … / ⚠️ none present (→ Lens 2 provenance) |
| Persona(s) **named** (not just a role) & in context/personas.md | ✅ / ❌ |
| Jurisdiction stated | ✅ / ❌ |

### Blockers
1. **[title]** · [section] · _standard_ — finding. **Fix:** [concrete change].

### Should-fix
…

### Nits
…

### Integrity statement
- **Checked:** [claims traced against the report; links opened; slices assessed].
- **Could not verify:** [what and why].
- **Recommendation:** [publish / fix Blockers #… first / return to product-research].
```

Verdict rule: **any Blocker → CHANGES REQUIRED.** Only a clean Blocker list is Ready.
