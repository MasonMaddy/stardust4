# Step ⑦ — Internal Drip Campaign (pre-launch readiness sequence)

## Why this exists
Internal teams keep saying they "didn't know" a release was coming. A single
launch-day announcement arrives too late to build readiness. This artifact fixes
that with a **timed sequence of touchpoints** before launch — each one designed
to raise awareness and pull people toward the live demo, so that by launch day
the relevant teams already know what's shipping and have had a chance to ask
questions.

The goal is **engagement, not just information.** Every beat has a clear, low-
effort call to action, and the sequence builds toward the PM-led demo as the
main engagement moment.

## What it's for
Produce a scheduled set of internal comms, anchored to the rollout date, that
ramp internal teams up to the release. The campaign covers the **whole release**;
if it bundles several features, one campaign ramps teams on all of them together
(the demo walks through each).

## What it needs
The Release Fact Sheet(s) — specifically the **Launch logistics** (rollout date
T-0, demo date/time + presenter, internal channels). The Fact Sheet doesn't have
to be final to start: **begin the drip campaign ~3 weeks before release** so the
teaser can land ~2 weeks out — it's the one artifact you start early, then refine
as facts firm up. Brand voice from `xplor-brand-guidelines` (internal tone —
energising but honest, not hypey). The launch-day beat reuses the Internal
Announcement (⑥) — don't rewrite it.

**Default audience:** send to **education@xplortechnologies.com** (the whole Xplor
Education distribution list) unless the Fact Sheet specifies otherwise.

## What it gives back
A campaign plan plus ready-to-send copy for each beat:

| Beat | Timing | Purpose | Call to action |
|---|---|---|---|
| 1. Teaser | T–2 weeks | "Something's coming, here's why it matters" | Save the demo date |
| 2. Demo invite | T–1 week | Drive attendance at the live demo | RSVP + bring questions |
| 3. Demo-day nudge | Demo morning | Last-call reminder | Join the demo |
| 4. Launch note | T–0 | "It's live" — reuses ⑥ | Use the team resources |
| 5. Post-launch (optional) | T+1 week | Reinforce + capture questions | Where to send feedback |

(Beats 1, 2, and 4 are the backbone; 3 and 5 are optional boosters — include
them if the user wants higher engagement.)

## How to draft
1. Read the Launch logistics from the Fact Sheet. If the demo date/time,
   presenter, or rollout date is `TBD`, flag it — the schedule can't be anchored
   without them.
2. Compute each beat's send date relative to T-0 (state actual dates if the
   rollout date is known; otherwise use "T–2 weeks" style placeholders and note
   the dependency).
3. Write each beat short and skimmable, with one clear CTA. The teaser sells the
   *why*; the invite sells the *demo*; the launch note hands each team their
   resource (reuse ⑥).
4. Make the demo the centrepiece: tell people what they'll see, why it's worth
   their time, and to bring questions for the PM. If the release bundles several
   features, the demo and teaser should cover each one.
5. If the rollout is phased, say so in the readiness and launch beats — so teams,
   especially support, expect a staged rollout rather than instant availability
   for everyone.
6. Apply Xplor internal brand voice.

## Done when
- Every beat has a send date (or a clearly-flagged placeholder tied to T-0).
- Each beat has exactly one clear call to action.
- The demo invite includes date/time, presenter, where to join, and the
  "bring questions" prompt.
- The launch-day beat reuses the Internal Announcement (⑥), not a fresh rewrite.
- Beats reference real channels from the Fact Sheet (email, Slack, all-hands).
- Emails are addressed to **education@xplortechnologies.com** (unless the Fact Sheet specifies otherwise).
- The campaign is started **~3 weeks out** (teaser ~2 weeks before the demo).

## Not its job
Customer-facing content. Inventing a demo date — if logistics aren't in the
Fact Sheet, flag it rather than guessing. This step assumes the demo is PM-led;
it doesn't run the demo.

## Boosting engagement (optional levers)
If the user's core problem is low awareness, suggest (don't force) any of:
- **Multi-channel:** pair each email with a short Slack/Teams post — people miss
  email.
- **Make it personal:** address the teaser to the specific teams affected
  ("Sales — this changes your X pitch").
- **A hook in the teaser:** one surprising stat or before/after that earns
  curiosity.
- **Lightweight interaction:** a one-question poll or "reply with your top
  question" to make the demo feel co-owned.
- **Calendar hold** attached to the demo invite so it doesn't get lost.

## Template
```markdown
# Internal Drip Campaign — <release>
**To:** education@xplortechnologies.com   ·   Anchored to launch (T-0): <rollout date>   ·   Demo: <date/time>, <presenter>

## Beat 1 — Teaser (T–2 weeks, <date>) · <channel>
**Subject:** <curiosity + why-it-matters>
<2–3 sentences: what's coming and why teams should care>
**👉 <CTA: Save the date — demo on {demo date}>**

## Beat 2 — Demo invite (T–1 week, <date>) · <channel>
**Subject:** <RSVP for the {feature} demo>
<What you'll see · why it's worth your time · who it's for>
**📅 Demo:** <date/time> · <presenter> · <join link>
**👉 RSVP and bring your questions.**

## Beat 3 — Demo-day nudge (morning of, optional) · <channel>
<One-line reminder + join link.>

## Beat 4 — Launch note (T–0, <date>) · <channel>
> Reuses the Internal Announcement (⑥). Insert it here.

## Beat 5 — Post-launch (T+1 week, optional) · <channel>
<Quick reinforce + "send questions/feedback to <owner>">
```

## Golden example
A teaser two weeks out names the affected teams and the benefit, the invite has
a real calendar-able demo slot with the presenter and a "bring questions"
prompt, and the launch beat slots in ⑥ verbatim — one coherent ramp, not five
disconnected emails.

## Adversarial cases
- **Demo already held or imminent:** drop the pre-demo teaser and invite — lead
  with a widely-shared recap (with the recording) and a T-1 readiness beat, then
  the launch note. The demo becomes the start of awareness, not the midpoint.
- **Demo date is TBD:** produce the copy but flag every date as blocked on
  logistics; don't fabricate a schedule.
- **Short runway (<2 weeks to launch):** compress sensibly — combine teaser and
  invite into one beat and say so, rather than back-dating an impossible send.
- **No internal channel specified:** default to email but flag that multi-channel
  would lift engagement (the whole point of the campaign).
