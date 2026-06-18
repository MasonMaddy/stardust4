---
name: sandbox-review
description: >
  Use this skill to review a newly built or updated sandbox WIP component against
  Stardust token, architecture, accessibility, and design standards BEFORE it is built
  into the design system. Acts as an independent senior engineer + senior designer
  reviewing the implementation. Triggers include: "review the sandbox", "review the WIP",
  "is this ready to build", "QA the component", "check the sandbox standards", "senior
  review of the component", "check this before we add it to the DS", "are there any
  issues with the WIP". This is Phase 3.5 — the quality gate between Sandbox (Phase 3)
  and Build (Phase 4). Also run automatically at the sandbox approval handoff, before
  Build, even if not explicitly asked.
---

# Sandbox Review Skill — Phase 3.5 quality gate

```
Review → Spec → Sandbox → [Sandbox Review ← you are here] → Build
```

The Sandbox (Phase 3) produces a WIP component inline in `docs/sandbox/index.html`. CI
does **not** lint the sandbox — only built `components/*.css` and doc pages — so token,
architecture, a11y, and design problems stay invisible until Build, where they're caught
by hand. This skill is the gate that catches them first.

It reviews like **two senior reviewers who did not build the component**: a senior
engineer (tokens, architecture, accessibility) and a senior designer (visual consistency,
state design, spec fidelity). Independence is the point — run them as subagents so they
review with fresh eyes, not anchored on the build conversation.

**Default behaviour: report, then offer to fix.** Produce the report and verdict; ask
before applying any change. Never proceed to Build with an open Blocker.

The full rubric and report template live in `references/review-checklist.md` — read it
before reviewing.

---

## Step 1 — Identify the WIP component and gather inputs

1. Read `docs/sandbox/index.html`; find the WIP component (the `<section class="sb-wip">`
   and the `sb-header__wip-label`). Note its name and the inline `<style>` block(s) that
   hold its CSS.
2. Locate, if they exist:
   - Spec: `skills/figma-component-builder/references/[component]-spec.md`
   - Decision log: `skills/figma-component-builder/references/[component]-review.md`
3. Load `docs/assets/css/tokens.css` (to validate token names) and the sibling
   `docs/assets/css/components/*.css` (for consistency comparison).
4. If a Figma node ID is in the spec, the designer lens may pull `get_design_context` /
   `get_screenshot` to check fidelity.

If no WIP section is present, say so and stop — there's nothing to review.

## Step 2 — Deterministic pre-checks (run first; exact, not judgment)

These are pass/fail. Run them and capture line numbers before spawning reviewers, so the
subagents start from facts. Scope to the WIP/inline styles, not the library section.

```bash
# Hardcoded hex (excluding token definitions, which live in tokens.css, not here)
grep -niE '#[0-9a-f]{3,6}\b' docs/sandbox/index.html

# Raw font-weights (should be --sd-font-weight-*)
grep -niE 'font-weight:\s*(400|500|600|700|800|900|bold|normal)' docs/sandbox/index.html

# Raw motion values (should be --sd-motion-*)
grep -niE '(transition|animation)[^;]*((0?\.[0-9]+|[0-9]+)m?s|ease[-a-z]*|cubic-bezier)' docs/sandbox/index.html

# Chrome variables leaking into the sandbox component
grep -nE '\-\-xp-' docs/sandbox/index.html

# HTML validity (pre-empts the html-validate CI step)
npx --yes html-validate@8 docs/sandbox/index.html
```

For every `--sd-*` the WIP references, confirm it is defined in `tokens.css` (flag any
that aren't — typos and invented names are Blockers). Record each hit as
`file:line` for the report.

## Step 3 — Spawn the two reviewers (independent, parallel)

Launch **two subagents in one message** so they run concurrently. Each gets: the WIP HTML
+ CSS, the deterministic findings from Step 2, the spec + decision log (if any), the
relevant token names, and `references/review-checklist.md`. Subagents auto-load
`CLAUDE.md`, so they already know the hard rules — but restate the lens and the
"return structured findings" contract explicitly.

**Reviewer A — Senior Engineer.** Prompt them to review Lens 1 (Tokens & architecture)
and Lens 2 (Accessibility) from the checklist, plus the relevant parts of Lens 4. Tell
them: *"You are a senior design-system engineer reviewing this WIP before it is extracted
into the library. Be adversarial — assume there are problems and find them. You did not
write this code."* Require output as a findings list, each: `severity` · `file:line` ·
rule · concrete fix.

**Reviewer B — Senior Designer.** Prompt them to review Lens 3 (Design consistency) and
Lens 4 (Spec & states coverage). Tell them: *"You are a senior product designer reviewing
this WIP against the existing Stardust library and the approved spec before it ships to
the design system. Flag anything that breaks visual or interaction consistency."* Same
structured-findings output contract.

Give each reviewer the checklist severity definitions so their tags are consistent.

## Step 4 — Synthesise one report

Merge the deterministic results and both reviewers' findings. Deduplicate (engineer and
designer may both flag tokens). Order by severity. Produce the report using the template
in `references/review-checklist.md`.

**Verdict rule: any Blocker → CHANGES REQUIRED. A clean Blocker list → READY TO BUILD.**
State the counts. Don't soften a Blocker into a suggestion.

## Step 5 — Offer to fix

Present the report, then ask whether to apply fixes. Default to fixing **Blockers and
Should-fix** items; leave Nits to the user unless they say otherwise.

When applying fixes:
1. Edit the WIP section / inline styles in `docs/sandbox/index.html` (and
   `docs/sandbox/sandbox.css` only if the issue is sandbox layout, not component style).
2. **Re-run the Step 2 deterministic checks** to confirm the fixes landed and introduced
   no new violations.
3. Re-state the verdict. Only when it is READY TO BUILD, tell the user they can proceed:
   *"say 'build it' to run Phase 4."*

Do not run the Build phase yourself — this skill gates it, it doesn't perform it.

---

## When this runs

- **Explicitly** — any trigger phrase above ("review the WIP", "is this ready to build").
- **Automatically** — at the Sandbox approval handoff (`component-sandbox` Step 7) and at
  the start of Build (`ds-component-doc`): before extracting WIP CSS into the library, run
  this gate. If it returns CHANGES REQUIRED, surface the report and stop before Build.

## Reference files

- `references/review-checklist.md` — full 4-lens rubric, severity definitions, report
  template. Read before reviewing.
- `docs/sandbox/index.html` — the WIP under review.
- `docs/assets/css/tokens.css` — token-name source of truth.
- `docs/assets/css/components/*.css` — sibling components for consistency comparison.
- `skills/figma-component-builder/references/[component]-spec.md` / `[component]-review.md`
  — spec and decision log to check fidelity against.
