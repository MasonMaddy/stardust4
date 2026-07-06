# Step ③ — Customer Guide (help-centre how-to)

## What it's for
A help-centre article that teaches a customer how to use the feature, end to
end. This is the "how", where the release note (②) is the "what/why". **One guide
per feature** — keep it specific to a single feature, even when the release
bundles several.

## What it needs
The confirmed Release Fact Sheet. Brand voice from `xplor-brand-guidelines`.

## What it gives back
A structured how-to article: what it is, who can use it, step-by-step
instructions, and a short troubleshooting section.

## How to draft
1. Open with one sentence on what the feature does and who it's for.
2. **Break the feature into its distinct tasks** (e.g. add, edit, share, export)
   and give each its own short section with numbered steps — one action per step,
   in the order the customer performs them. (For a single-task feature, one steps
   section is fine.)
3. **Use the labels from the confirmed, built UI** (real screenshots), exactly as
   they appear. If you only have Figma, treat its labels as provisional and flag
   them for verification against the live product.
4. Add a brief "Troubleshooting" list for the obvious snags.
5. Keep it task-focused and scannable; cover only what's available today; apply
   Xplor brand voice.

## Done when
- Steps are numbered, in order, one action each.
- UI labels match the actual product (from the inputs) — not invented.
- Availability/prerequisites stated (so a customer who can't see it understands
  why).
- Each distinct task has its own section.
- Troubleshooting covers at least the top 1–2 likely issues.
- Covers only what's available today — no "coming soon" / roadmap content.

## Not its job
Selling the feature (that's ②/④) or internal detail. **Documenting features that
aren't available yet** — cover only what's live today, with no "coming soon" /
roadmap section. Don't speculate about UI you haven't seen — if a screen isn't in
the inputs, flag it rather than guess.

## Template
```markdown
# How to use <feature>

<One sentence: what it does and who it's for.>

**Before you start:** <plan/region/prerequisite, if any>

## <Task 1 — e.g. "Add a document">
1. <Action — exact UI label>
2. <Action>

## <Task 2 — e.g. "Share it with the team">
1. <Action>
2. <Action>

(One section per task. For a single-task feature, one section is fine.)

## Troubleshooting
- **<Symptom>** — <cause and fix>
- **<Symptom>** — <cause and fix>
```

## Golden example
Each step names a real button/menu from the screenshots; prerequisites note the
plan/region so a customer who can't find the feature understands why.

## Adversarial cases
- **Only screenshots, no written flow:** derive steps from what's visible; mark
  any inferred step as needing PM confirmation.
- **Feature is on by default:** say so — don't invent an "enable" step.
