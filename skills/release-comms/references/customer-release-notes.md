# Step ② — Customer Release Notes (email + LMS variants)

## What it's for
Announce the release to customers in two delivery formats: an **email** and an
**LMS-embedded** version (shorter, lives inside the product/learning management
system). Same facts, two wrappers. A release may bundle **several features** — the
release notes cover them all, with a short benefit-led blurb per feature (each
linking that feature's guide).

## What it needs
The confirmed Release Fact Sheet for **every feature in the release**. Brand voice
from `xplor-brand-guidelines`.

## What it gives back
Two drafts:
1. **Email** — subject line, preview text, body, single clear call to action.
2. **LMS embed** — a tighter version (no email chrome) for in-product display.

## How to draft
1. Lead with the customer benefit (the problem it solves), not the mechanics.
2. **If the release bundles several features**, give each its own short
   benefit-led blurb (2–3 sentences) under a clear subheading, each linking that
   feature's guide. Open with a one-line wrapper that frames the release; don't
   merge distinct features into one blurry paragraph.
3. State what's new in plain language; link to the customer guide (③) for the
   how-to rather than explaining every step inline.
4. Be explicit about who gets it and when — and **state whether it goes live on a
   single date or rolls out in phases over several days** — scoped by region (and
   by feature, if availability differs between them).
5. Apply Xplor brand voice via the `xplor-brand-guidelines` skill.

## Done when
- Subject line and preview text are present (email variant).
- Benefit-led opening, not feature-led.
- Availability + date are stated and match the Fact Sheet, including **whether it
  goes live on a set day or is phased over multiple days**.
- Exactly one primary call to action.
- LMS variant is self-contained (no "click the button below" email-isms).
- If the release bundles several features, each has its own short blurb and links its own guide.

## Not its job
Step-by-step instructions (that's the customer guide ③). Internal detail,
roadmap, or codenames (never in customer-facing copy).

## Template
```markdown
### Email
**Subject:** <benefit-led, <50 chars>
**Preview:** <one line that earns the open>

<Opening: the benefit / problem solved>
<What's new, in 2–3 sentences>
<Who it's for + when — a single go-live date, OR "rolling out over the next few days" if phased (by region if different)>

**<Primary CTA, e.g. "See how it works">** → <link to customer guide>

### LMS embed
<Headline>
<2–3 sentence what's-new + benefit>
<Where to learn more — in-product link>
```

**Multiple features:** in both formats, after a one-line opening that frames the
release, repeat the what's-new block (plus its CTA in the email) once per feature
under its own subheading — each linking that feature's guide.

## Golden example
Subject reads as a benefit ("Never lose a draft again"), body is three tight
sentences, one CTA to the guide, availability matches the Fact Sheet.

## Adversarial cases
- **Region-limited release:** don't imply global availability; scope the claim.
- **No date confirmed yet:** don't invent one — say "rolling out soon" only if
  the Fact Sheet supports it, otherwise flag the `TBD`.
- **Phased / gradual rollout:** say so honestly ("rolling out to everyone over
  the coming days") rather than implying every customer has it on day one.
