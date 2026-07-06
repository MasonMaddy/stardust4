# Step ⑤ — Support / CS FAQ (FAQ + troubleshooting + escalation)

## What it's for
Equip the support/CS team to handle tickets about the feature: common
questions, troubleshooting steps, known issues, and a clear escalation path.
**One FAQ per feature** — specific to a single feature, even when the release
bundles several.

## What it needs
The confirmed Release Fact Sheet. (This artifact is functional — keep it plain
and accurate rather than stylised. Still avoid off-brand or dismissive
phrasing.)

## What it gives back
A support reference: Q&A pairs, a troubleshooting checklist, known issues, and
who/where to escalate.

## How to draft
1. Anticipate the tickets: "why can't I see it?", "why can't I see it yet?" (for a
   phased rollout), "how do I turn it on?", "is it on my plan?", "it's not working".
2. Give support-actionable answers — what to check, in order.
3. List known issues/limitations straight from the Fact Sheet's not-included /
   out-of-scope list.
4. State the escalation path explicitly (who owns it, where bugs go).

## Done when
- Top 5 likely questions answered with checkable steps.
- "Why can't I see it?" answered against plan/region/flag gating — and, for a
  phased rollout, against the staged app rollout (with the expected completion window).
- Known issues match the Fact Sheet's limitations.
- Escalation path named (team/channel/owner).

## Not its job
Marketing language or selling. Don't reassure with invented fixes — if there's
no known fix, say "escalate" rather than guessing.

## Template
```markdown
# Support FAQ — <feature>

## FAQs
- **Q: <question>** — A: <answer + what to check>
- **Q: Why can't a customer see it?** — A: Check plan (<>), region (<>), flag (<>).
- **Q: Why can't they see it yet? (phased rollout)** — A: <if staged, the update may not have reached them yet; expected complete by <date>>
- **Q: How do they enable it?** — A: <steps or "on by default">

## Troubleshooting checklist
1. <check>
2. <check>

## Known issues
- <from the Fact Sheet's limitations>

## Escalation
- Bugs → <where>   ·   Owner → <PM/team>
```

## Golden example
"Why can't I see it?" lists the exact gating checks (plan, region, flag) in
order; known issues mirror the Fact Sheet; escalation names a real owner.

## Adversarial cases
- **No known fix for a limitation:** route to escalation, don't fabricate a
  workaround.
- **Customer reports something not in scope:** point to what the feature
  deliberately doesn't do (the not-included list) rather than implying it's a bug.
- **Phased / gradual rollout:** if the feature rolls out over several days, tell
  support it's the staged rollout — not a fault — and give the expected
  completion window, so they don't raise bugs or over-promise immediacy.
