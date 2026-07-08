# Handoff review — full checklist

The exhaustive checklist behind `handoff-review`. Findings reference these items.

## Severity definitions

- **Blocker** — the build team would be blocked or misled: schema/`--check` failure, a deep-link
  that 404s or lands wrong, an unspecced screen that exists in the prototype, a consumed data
  field with no source or missing-data behaviour, acceptance criteria absent for a core screen,
  or copy that isn't verbatim-shippable. Must be fixed before publish.
- **Should-fix** — would generate avoidable questions or weak testing, but not block the start.
- **Nit** — polish. Optional.

Every finding: `severity` · **where** (screen id / spec section) · rule · concrete fix. Fixes go
in `handoff.source.json`, never in generated files.

---

## Lens A — Receiving engineer ("could I build this without a single question?")

- [ ] **Layout unambiguous** — each screen's `layout` reads top-to-bottom without guessing;
      spec-level redlines (heights, spacing tokens, hit targets) present where a dev would
      otherwise measure pixels. (Should-fix; Blocker if a screen has neither layout nor a working
      deep-link)
- [ ] **Interactions specified** — tap/press results, disabled logic, validation triggers,
      loading/timing behaviour, focus/keyboard expectations for web. "It's in the prototype" is
      acceptable *only* with a deep-link to the exact state. (Should-fix)
- [ ] **Copy is verbatim** — every visible string in `copy`, no lorem, no "TBD label". (Blocker
      for missing core-screen copy)
- [ ] **Components honest** — each `components[]` entry's status (reuse/extend/build) matches
      reality (check the DS: an "extend" that's actually net-new misleads estimates);
      `undeclaredComponents` from the generator is empty or explained. (Should-fix; Blocker for a
      net-new component specced as "reuse")
- [ ] **Tokens resolved** — `tokenGaps` empty or each gap has an owner in `openQuestions`.
      (Blocker if a gap is silent)
- [ ] **Responsive/device story** — behaviour at each declared device (phone/tablet,
      orientation) stated where it differs. (Should-fix)
- [ ] **Motion specced** — durations/easings by token, what animates on enter/exit. (Nit unless
      the flow is motion-heavy)
- [ ] **Data sources declared** — every screen says where its data comes from; integration-fed
      fields appear in `dependencies` with `missingBehaviour`. **Absence must be an assertion:**
      a source with no `dependencies` key at all is a finding — require an explicit
      `"dependencies": []` plus a data-origin note, so "considered, none exist" is
      distinguishable from "never considered". (Blocker for consumed-but-undeclared integration
      data; Should-fix for a missing empty declaration)

## Lens B — Delivery/QA lead ("could I test this and call it done?")

- [ ] **Acceptance criteria per screen** — every behaviour the spec describes has a testable
      assertion; every assertion is machine-checkable: **subject + operator + expected value**
      ("`button[name=signin][disabled]` while either field is empty"), not prose ("validation
      works"). The flow's own "done" criterion from the summary must have an AC somewhere.
      (Blocker for core screens without ACs; Should-fix for prose ACs)
- [ ] **State matrix covered** — every error/empty/loading state from the PRD (and the
      prototype's `e-*` gallery) appears in `stateMatrix` with trigger, UI, copy, recovery, and a
      deep-link. Un-specced states that exist in the prototype → Blocker (the build will skip
      them).
- [ ] **Screen parity** — prototype steps ↔ `screens[]` one-to-one (or the diff is explained in
      `outOfScope`). (Blocker)
- [ ] **Non-step screens covered** — screens that aren't URL-addressable steps (launch splash,
      loading overlays, lock screens) escape the parity count; each is specced or explicitly
      scoped out. (Should-fix)
- [ ] **Platform matrix honest** — `platformDeltas` covers the declared platforms; Home flows
      state iOS/Android differences (or "none"); Playground App flows carry shared-device notes
      (user switching, interruption). (Should-fix; Blocker if a declared platform has no delta
      row and obviously differs)
- [ ] **Jurisdiction** — if the flow is compliance/funding-touching, AU vs NZ behaviour is stated
      or explicitly scoped out (`context/sector-compliance.md`). (Should-fix; Blocker if the flow
      ships to both and specs only one)
- [ ] **A11y carried through** — per-screen `a11y` entries exist (labels, focus, announcements),
      not just visual spec. (Should-fix)
- [ ] **Out of scope explicit** — what v1 deliberately excludes, so QA doesn't fail the build on
      non-goals. (Should-fix)
- [ ] **Version/changelog discipline** — `version`/`date`/`changelog` updated for this revision;
      deterministic (no clock values). (Should-fix)
- [ ] **Open questions owned** — each `openQuestions` row has a real owner; "owner: TBD" is
      itself a Should-fix. (Should-fix)
- [ ] **No disguised Blockers in open questions** — a question the build can't proceed without
      ("what does the button do?") is an unfinished spec, not an open question. (Blocker)

---

## Report template

```markdown
## Handoff review — [Flow] (step 5.5 gate)
Date: [YYYY-MM-DD] · Package: docs/sandbox/<flow>/ · Spec version: [vX.Y] · Direction: [name]

**Verdict: READY TO HAND OFF ✅ / CHANGES REQUIRED ❌**
Blockers: N · Should-fix: N · Nits: N

### Deterministic checks
| Check | Result |
|---|---|
| ajv schema validation | ✅ / ❌ … |
| build-handoff --check | ✅ / ❌ … |
| check-links / html-validate | ✅ / ❌ … |
| Token existence / tokenGaps | ✅ / ❌ … |
| Screen parity (prototype ↔ spec) | ✅ N/N / ❌ diff: … |
| Deep-links clicked | N of M — [which] |
| Machine-checkable ACs | N of M assertions checkable |

### Blockers
1. **[title]** · [screen/section] · _rule_ — finding. **Fix:** [source-level change].

### Should-fix
…

### Nits
…

### Integrity statement
- **Verified:** [what was actually clicked/validated/cross-counted].
- **Could not verify:** [what and why].
- **Recommendation:** [publish / fix #… and regenerate / return to dev-handoff step 3].
```

Verdict rule: **any Blocker → CHANGES REQUIRED.** Only a clean Blocker list is Ready.
