# Step ① — Release Fact Sheet (the shared contract)

This is the single source of truth for the whole chain. Every other artifact is
drafted from this and only this. Build it first, confirm it with the user, then
draft downstream.

## What it's for
Capture every fact about a feature, once, with a source for each — so that no
downstream artifact has to guess and they all stay consistent. **Write one Fact
Sheet per feature** — if a release bundles several features, build one for each.

## Why this exists (when there's already a product brief)
The product brief is the granular source of truth — every requirement, edge case
and build detail. That's more than most people need. The Fact Sheet is the
shareable, digestible layer on top: a trustworthy overview someone can read
*without* wading through the full build. It's especially useful for
**customer-facing teams** (sales, support, customer success) who want a solid
grasp of what's changing before they talk to customers — and it's the single
source every release artifact below is drafted from.

## What it needs (inputs)
Any mix of: a PRD / feature spec, Confluence release notes, Figma, confirmed-UI
screenshots, or a rough brief from the PM (see **Inputs to provide** in SKILL.md
for what each adds). **Confirmed-UI screenshots are the most reliable source for
exact labels — prefer them over Figma when the two disagree.** Read all of it
before filling the sheet.

## What it gives back (the fixed shape)
A completed Fact Sheet using the template below. Every field is either filled or
explicitly marked `TBD`. Every material claim (availability, dates, pricing,
capabilities) has a source.

## How to build it
1. Read every input provided.
2. Fill each field from the inputs. When a field isn't covered, write
   `TBD — <what's missing>` rather than guessing.
3. For each material claim, note where it came from in **Sources**.
4. List every `TBD` in **Open questions** and ask the user to resolve them.
5. If the customer-facing name isn't final, record the working name in **Value
   Details** and add "confirm final name" to **Open questions**. Don't add a
   separate naming-options / brainstorm section to the Fact Sheet — keep name
   exploration in the conversation, not in the artifact.

## Done when
- Every field is filled or marked `TBD`.
- Every availability / date / pricing / capability claim cites a source.
- Nothing is invented.

## Not its job
Writing any customer- or audience-facing copy. This step only establishes
facts. Tone, framing, and audience translation happen in the drafting steps.

---

## TEMPLATE — copy and fill

```markdown
# Release Fact Sheet — <Feature name>

**Status:** Draft | Confirmed
**Compiled by:** <PM name>   **Date:** <date>

## Value Details
- Feature name (customer-facing): <name>
- Tagline (optional): <one short benefit line, e.g. "Stay audit-ready. Never miss an expiry.">
- Internal codename / flag: <codename or flag>   ← internal only, never customer-facing
- Release version / milestone: <if applicable>

## Summary
- One line: <what it is, in one sentence>
- The problem it solves / why it matters: <the user pain, plainly>

## What it does
- <capability 1>
- <capability 2>
- <capability 3>

## Who gets it
- Plans / tiers: <e.g. all paid plans / Pro and above>
- Regions: <AU / NZ / US / UK / EU — list explicitly; note any differences>
- Rollout: <date or phased schedule>   ← anchors the drip campaign timeline

## How to access / enable
- <on by default, or the steps to turn it on>

## Not included (out of scope for this release)
- <what it deliberately does NOT do, known gaps>

## Dependencies / flags / prerequisites
- <feature flags, prerequisite settings, integrations needed>

## Jurisdiction notes
- <any AU/NZ/US/UK/EU differences in availability, pricing, data handling,
  or compliance — or "no material differences">

## Launch logistics (for internal comms & drip campaign)
- Rollout date (T-0): <date>
- Internal live demo: <date/time> · presenter: <PM name> · where: <link/room>
- Channels for internal comms: <e.g. email, Slack #channel, all-hands>

## Sources
- <claim → source, e.g. "Available on Pro+ → PRD §3 / Confluence 'Availability'">
- <Figma / screenshot references>

## Open questions / TBD
- [ ] <gap the PM needs to confirm>
- [ ] <gap the PM needs to confirm>
```

---

## Golden example (what good looks like)
A sheet where "Available on Pro and above in AU/NZ from 30 June; EU follows in
Q3 (pending data-residency review)" is backed by a cited PRD line, and the EU
delay is flagged rather than glossed.

## Adversarial cases (must handle gracefully)
- **Rough brief only:** most fields end up `TBD`; the sheet's value is the
  question list it hands back to the PM.
- **Figma/screenshots only:** describe observable capabilities; mark anything
  not visible (plans, dates, regions) as `TBD`.
- **Inputs contain PII or secrets:** leave them out of the sheet entirely and
  flag to the user.
- **Sources disagree** (PRD says one date, Confluence another): record both,
  flag the conflict in Open questions — do not silently pick one.
- **Spec vs. live product differ** (e.g. the PRD says 5 MB but the shipped UI
  says 10 MB): for customer-facing facts, use what the product actually does —
  confirmed screenshots win — and log the mismatch as an open question for
  engineering rather than documenting the spec value.
