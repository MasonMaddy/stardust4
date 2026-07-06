# Step ⑥ — Internal Announcement (launch-day release note)

## What it's for
The launch-day message to internal teams: the release is live, here's what
shipped, who it affects, and where to send questions. A release may bundle
**several features** — cover each one briefly. This is the **final beat** the drip
campaign (⑦) builds toward — write it here, reuse it there.

## What it needs
The confirmed Release Fact Sheet for **every feature in the release**. Brand voice
from `xplor-brand-guidelines` (internal tone — human and clear, not
marketing-glossy).

## What it gives back
A concise internal release note suitable for email or Slack/Teams: what shipped,
why it matters, who's affected, links to the customer guide / sales / support
artifacts, and the point of contact.

## How to draft
1. Lead with what shipped and why it matters to the business/customer.
2. **If several features shipped**, give each a short "what it is + why it
   matters" block with its own per-team links, under one release headline.
3. Say who it affects internally (which teams need to do what).
4. Link the other artifacts (guide ③, sales ④, support FAQ ⑤) — per feature — so
   each team has the right resource; don't repeat their content here.
5. Name the owner and where questions go.

## Done when
- States what's live + the rollout/region facts (matching the Fact Sheet),
  including whether it goes live on a set day or is phased over multiple days.
- Tells each relevant team what they need to know or do.
- Links to each feature's customer guide, sales one-pager, and support FAQ.
- If the release bundles several features, each is covered with its own block + links.
- Names a point of contact.

## Not its job
Customer marketing tone, or re-explaining the how-to. Internal codenames/roadmap
are fine here (internal only) but never copy this content into customer-facing
artifacts.

## Template
```markdown
# 🚀 <Feature> is live — <date>

**What it is:** <one line + why it matters>
**Who gets it:** <plans/regions/date>

**What your team needs to know**
- Sales → <one line> · one-pager: <link>
- Support → <one line> · FAQ: <link>
- Everyone → customer guide: <link>

**Questions?** <PM/owner + channel>
```

**Multiple features:** title it "🚀 <Release name> is live — <date>", then one
short block per feature (what it is · who gets it · that feature's per-team
links), followed by a single Questions/owner line for the whole release.

## Golden example
Three sentences of substance, a per-team line with the right link each, and a
named owner — readable in 20 seconds.

## Adversarial cases
- **Phased rollout:** state the phase honestly ("AU/NZ today, EU in Q3"), don't
  imply everyone has it.
- **Security-relevant release:** prepend `[HUMAN REVIEW RECOMMENDED]` and route
  for sign-off before sending.
