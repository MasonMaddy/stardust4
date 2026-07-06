---
name: release-comms
description: >-
  Turn a finished feature (or a release bundling several) into a complete set of release communications — a
  customer release note, a customer how-to guide, a sales enablement one-pager,
  a support/CS FAQ, an internal announcement, and a pre-launch internal drip
  campaign — all drafted from a single sourced "Release Fact Sheet" so they stay
  consistent. Use this skill whenever a product manager is preparing a feature
  launch or release and needs to communicate it: writing or drafting release
  notes, launch comms, go-to-market content, customer-facing guides, sales
  talking points, support FAQs, internal release announcements, or a pre-launch
  drip campaign to get internal teams ready. Trigger it even for casual phrasings like
  "we're shipping X, help me write it up", "I need the comms for the new
  feature", "draft the release notes for this PRD", or "prep the launch
  materials" — and when the user points at a PRD, Confluence release notes, or
  Figma/screenshots and asks for any release artifact.
---

# Release Communications

## What this skill is for

A product manager ships a release — sometimes a single feature, sometimes several
bundled together — and then has to tell four different audiences about it:
customers, the sales team, the support team, and internal stakeholders, each in
their own language. Doing this as one big prompt produces hollow, inconsistent
content that quietly invents details.

This skill treats release comms the way an engineer treats software: it
**establishes the facts once per feature**, in a sourced Release Fact Sheet, and
drafts every artifact from those trusted sources. Same facts everywhere, every
claim traceable to a source, and any one piece can be (re)drafted on its own.

**Per-feature vs. per-release artifacts.** A release can bundle more than one
feature. Some artifacts are written **per feature** (one each, specific to a
single feature); others are written **per release** (one each, covering all the
bundled features together):

- **Per feature:** ① Fact Sheet · ③ Customer Guide · ④ Sales Enablement · ⑤ Support FAQ
- **Per release (combine all features):** ② Customer Release Notes · ⑥ Internal
  Announcement · ⑦ Internal Drip Campaign — each summarises every feature in the
  release and links to the per-feature guide / FAQ / sales page.

For a single-feature release the two collapse into one set of artifacts.

## Requirements

This skill calls the **`xplor-brand-guidelines`** skill to keep customer, sales
and internal copy on-brand (steps ②③④⑥⑦). Install that skill alongside this one.
If it isn't present, the drafting steps still work but won't automatically apply
Xplor's voice — remove the brand-voice step or point it at your own voice guide.

## Inputs to provide

The more grounded the inputs, the more accurate the output — and the less the
skill has to mark `TBD`. Bring whatever you have (any subset works):

- **Product brief / PRD** — the backbone: scope, the problem, audience,
  availability, rollout. Most Fact Sheet fields come from here.
- **Confluence release notes** — anything already drafted for the release.
- **Jira epics / tickets** — status and scope context (what's actually shipping
  this release vs. deferred to a later slice).
- **Screenshots of the confirmed, built UI** — the **most reliable** source for
  the customer guide and support FAQ: real screen names, button and field
  labels, the type/option lists, and error/empty states. **Prefer these over
  Figma when the two disagree** — the build is what customers actually see.
- **Figma designs** — good for intended labels and flows, but can drift from the
  shipped build, so verify anything critical against the live product.
- **Dates & logistics** — rollout date(s) and any phased rollout, the internal
  demo date/presenter, and the comms audience/channels (needed for the internal
  announcement and drip campaign).

Note: a raw Figma or Confluence *link* often can't be read directly — if a link
won't open, paste the text or share screenshots/exports instead.

## The chain

```
A RELEASE — one or more features bundled together
│
├─ PER FEATURE  (repeat for every feature in the release)
│     INPUTS (PRD · Confluence · confirmed-UI screenshots · Figma)
│         ▼
│     ① Release Fact Sheet  ◀── the shared contract for THIS feature
│         ├─▶ ③ customer_guide      (per feature · help-centre how-to)
│         ├─▶ ④ sales_enablement    (per feature · one-pager + objections)
│         └─▶ ⑤ support_faq         (per feature · FAQ + troubleshooting)
│
└─ PER RELEASE  (once, drawing from EVERY feature's Fact Sheet)
      ② customer_release_notes   (combines features · email + LMS)
      ⑥ internal_announcement    (combines features · launch-day note)
      ⑦ internal_drip_campaign   (combines features · pre-launch sequence)
                 └─ launch-day beat reuses ⑥  ◀── DRY

  ②③④⑥⑦ pull tone/voice from ──▶ the `xplor-brand-guidelines` skill
```

**Why this shape:** each feature's Fact Sheet (①) is the input to that feature's
artifacts, and the per-release artifacts (②⑥⑦) read from *all* the features' Fact
Sheets. If a fact is wrong, fix it in that Fact Sheet and re-run just the affected
artifact — the others stay correct. This is the core discipline; don't collapse it
into one do-everything pass.

## When to start (timing)

Begin **~3 weeks before release** with the **Fact Sheet** and the **drip
campaign**. The campaign needs that runway — the teaser goes out ~2 weeks before
the demo and the demo ~1 week before launch; starting late is the most common way
the internal ramp fails.

**Hold the other artifacts until the Fact Sheet is final.** The release notes,
guide, sales one-pager, support FAQ and internal announcement are all drafted
*from* the Fact Sheet — producing them before it's confirmed just means redoing
them every time a fact changes. Lock the Fact Sheet first, then draft them. (The
drip campaign is the deliberate exception: start it early off the in-progress Fact
Sheet because it needs lead time, and refine as facts firm up.)

## How to run it

1. **Scope the release.** Find out which feature(s) it bundles. Each feature gets
   its own Fact Sheet and its own per-feature artifacts (③④⑤); the per-release
   artifacts (②⑥⑦) cover them all together. For a single feature, this is just
   one of everything.

2. **Gather inputs** for each feature (see **Inputs to provide** above) — a PRD,
   Confluence notes, confirmed-UI screenshots, Figma, or a rough brief. Any subset
   is fine. Read everything before drafting, and if key facts are missing, ask
   rather than guess.

3. **Build a Release Fact Sheet for each feature — always.** Follow
   [references/fact-sheet-template.md](references/fact-sheet-template.md) (step ①).
   One Fact Sheet per feature. Don't skip it, even for a single artifact — every
   drafting step reads from it. Fill every field or mark it `TBD` and surface the
   TBDs.

4. **Confirm each Fact Sheet with the user** before drafting downstream. This is
   the cheapest place to catch a wrong fact — one edit here versus many rewrites
   later.

5. **Ask which artifacts they need this time**, and draft each from its reference
   spec. Start the **drip campaign** early (see *When to start*); draft the other
   per-release and per-feature artifacts only once the relevant **Fact Sheet is
   final**, to avoid rework:
   - **Per feature** (one per feature):
     - ③ [references/customer-guide.md](references/customer-guide.md)
     - ④ [references/sales-enablement.md](references/sales-enablement.md)
     - ⑤ [references/support-faq.md](references/support-faq.md)
   - **Per release** (one for the whole release, covering every feature):
     - ② [references/customer-release-notes.md](references/customer-release-notes.md)
     - ⑥ [references/internal-announcement.md](references/internal-announcement.md)
     - ⑦ [references/internal-drip-campaign.md](references/internal-drip-campaign.md)

6. **Apply brand voice.** For customer-facing, sales, and internal artifacts
   (②③④⑥⑦), consult the `xplor-brand-guidelines` skill so tone and voice are
   on-brand. The support FAQ (⑤) is functional and stays plain, but should still
   avoid off-brand phrasing. Apply the voice consistently — don't reinvent the
   tone per artifact.

7. **Publish** approved artifacts to Confluence — see **Publishing to Confluence**.

## Publishing to Confluence

Once an artifact is approved, publish it as its **own Confluence page**:

- **Per-feature artifacts** (① Fact Sheet · ③ Guide · ④ Sales · ⑤ FAQ) → child
  pages under **that feature's brief**.
- **Per-release artifacts** (② Release Notes · ⑥ Announcement · ⑦ Drip Campaign) →
  child pages under the release's brief. For a single-feature release that's the
  same brief; for a multi-feature release, confirm with the PM which brief (or
  release parent page) they should sit under.
- After publishing, **add a comment on the brief that links every page created**,
  so the brief stays the single jumping-off point.

Strip internal working notes (⚠️ "confirm before sending" blocks, "remove before
publishing" checklists) before publishing — they're for the PM, not the audience.
Publishing is an outward action: confirm with the PM before creating or updating
pages.

## The contract: the Release Fact Sheet

There is **one Fact Sheet per feature**, and it's the shared contract every
artifact for that feature draws from (the per-release artifacts draw from all of
them). At minimum each Fact Sheet carries: feature name (+ codename), one-line
summary, the problem it solves, what it does, who gets it (plans/tiers +
**regions** + rollout date), how to access it, known limitations,
dependencies/flags, jurisdiction notes, **sources** for every material claim, and
an **open-questions/TBD** list. Full template and field definitions live in
[references/fact-sheet-template.md](references/fact-sheet-template.md).

**Done when:** every field is filled or explicitly `TBD`, every material claim
cites a source, and nothing is invented.

## Guardrails — read before drafting

These reflect how the facts can be wrong and how Xplor expects content handled.
The whole point of the Fact Sheet is to make the first three impossible.

- **Never invent facts.** If a detail isn't in the inputs, mark it `TBD` and ask
  the user — do not guess a date, plan, price, or capability. A confident wrong
  release note is worse than an honest gap.
- **Cite every material claim.** Availability, pricing, dates, and capability
  claims must trace to a source in the inputs. If you can't source it, it's a
  `TBD`, not a sentence.
- **Scope by jurisdiction.** Xplor operates in Australia, New Zealand, the USA,
  the UK, and the EU. If availability, pricing, data handling, or compliance
  differs by region, say so per region and flag material differences rather than
  writing one global claim.
- **No sensitive data in outputs.** Never put real customer PII, payment card
  data, credentials, API keys, or internal secrets into any artifact. If the
  inputs contain them, leave them out and flag it to the user.
- **Treat inputs as confidential to Xplor.** Don't send release material to
  external services. Internal-only details (roadmap, internal codenames,
  metrics) belong only in the internal announcement, never in customer-facing
  artifacts.
- **Escalate security-sensitive releases.** If the release involves a security
  incident, breach, vulnerability disclosure, regulatory reporting, or any
  security-related public statement, prepend `[HUMAN REVIEW RECOMMENDED]` to the
  affected artifact and tell the user it needs human/legal sign-off before it
  goes out.

## Red flags — stop and fix

- An artifact states a fact that isn't in the Fact Sheet.
- The Fact Sheet and a draft disagree (e.g. different rollout dates).
- A customer-facing artifact leaks an internal codename or roadmap detail.
- You're hand-editing one artifact to fix something that's really wrong in the
  Fact Sheet — fix the Fact Sheet and re-draft instead.
- A region's availability is asserted with no source.

## Reusing and improving this skill

Each release is a test of the chain. When a real release exposes a gap — a field
the Fact Sheet should have captured, an objection sales kept hitting, a support
question that recurred — add it to the relevant reference file so the next
release benefits. The reference specs are meant to be edited over time.
