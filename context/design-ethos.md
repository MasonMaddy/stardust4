# Design ethos — what "good" means on each surface

Per-surface design principles and platform conventions. Load the section for the surface you're
designing, alongside `personas.md`. These are the questions a design must answer *before* it's
built — a prototype that ignores its surface's ethos is off-spec even if every token resolves.

**The operating principle behind all of it:** AI and software automate the manual — gathering,
collating, drafting, data entry — to free people for what is irreducibly human: creativity,
judgement, and direct contact with children and families. A design that adds screen time without
returning more human time is moving backwards.

## BMS / Office (web — Sandra, Priya)

- **Two altitudes, always.** Every feature must answer: *does this need the provider-level
  abstraction?* Priya configures across services (bulk actions, defaults, cross-service reports);
  Sandra operates within one. Designing only the single-service view is half the feature.
- **Configuration flows downhill.** What Priya sets (enrolment forms, fees, rooms) becomes
  Sandra's daily reality and ultimately shapes Playground and Home. Show the blast radius of
  configuration changes.
- **Systems of record deserve caution.** Admin actions have billing (CCS) and compliance
  consequences. Confirm destructive actions, make current state visible, provide undo where
  possible, and use plain language — Sandra should never fear a click.
- **Desktop-first, data-dense but guided.** Tables, filters, and bulk selection are native here —
  but pair density with clear next actions for less tech-savvy admins.

## Playground Web (educators — Angela, Claire, Emily)

- **The proactive surface.** Educators *sit down* here — to write learning stories, document
  against the EYLF, plan the month. It's acceptable, even right, to let them work: richer editing,
  more depth, more time on task.
- **Documentation is storytelling.** Learning documentation carries the educator's professional
  voice. Automate the scaffolding (child tagging, outcome linking, dates) — never the substance.
- **Plan → practice visibility.** Angela needs programming and planning visible across services;
  link documentation back to plans and frameworks so practice leads can see the thread.

## Playground App (educators — Claire, Emily; shared in-room device)

- **The reactive surface — "put the device down."** The design goal is minimum time-to-done for
  compliance tasks (room sign-in/out, nappy checks, sleep checks, headcounts): be notified, act,
  put the iPad down, return to the children. Count the taps; every one is time away from a child.
- **Shared device, personal accountability.** The device belongs to the room; educators sign in
  individually and hand it around. Design for fast user switching, an always-visible "acting as"
  identity (compliance records must attribute the right educator), and no personal data lingering
  across users. Assume interruption at any moment — half-done tasks must survive a hand-off.
- **Automate the input.** Prefer inference and defaults over typing: pre-filled times, room-based
  child lists, batch actions ("all sleeping children"), sensible follow-ups. Data entry is the tax,
  not the job.
- **Glanceable and interruptible.** Educators act mid-care. Big targets, one decision per screen,
  progress that survives being abandoned for ten minutes.

## Home (families — James, Riley, Jeff, Martin; personal iOS/Android)

- **Nurture the neglected surface.** Families don't pay for Home, so it has historically been
  under-loved — but parents recommending the app is how services choose the platform. Treat parent
  experience as a first-class outcome, not an afterthought.
- **Bookings are the anchor; trust is the product.** Most sessions start with a booking task, but
  the emotional job is reassurance: my child is safe, cared for, and thriving. Health data, photos,
  and messages should read as a coherent, trustworthy picture (Martin's consistency bar: the same
  fact agrees everywhere it appears).
- **Design for the ring, not just the parent.** Guardians, grandparents, and authorised pick-up
  contacts use Home with delegated access (Riley, Jeff). Be explicit about whose child and which
  permission context is active; keep what a non-parent can see and do safe and obvious.
- **One-handed, interruption-friendly, jargon-free.** Time-poor parents on phones (James); low
  tech confidence in the ring (Jeff). Core tasks completable in moments without instructions.

## Hub (kiosk iPad in the service entryway)

- **Zero-learning-curve.** Used at drop-off rush by whoever is dropping off — including someone
  seeing it for the first time (Jeff). QR-first with manual entry fallback; large type and targets;
  no app fluency assumed.
- **Kiosk discipline.** Shared and unattended: every session must end clean — auto-reset to the
  start screen after inactivity, never expose the previous family's details, no dead-ends a staff
  member has to rescue.
- **Admin-managed.** Sandra configures and troubleshoots the Hub; setup and failure states are
  Office concerns, not parent concerns.

## Compliance-touching flows (any surface)

Sign-in/out, sleep and nappy checks, ratios, attendance, CCS/funding data: these aren't just
features — they're records a regulator or auditor may read (see `sector-compliance.md`).
Accuracy, attribution (who logged it, when), and completeness beat speed; but the *experience* of
compliance should still follow the surface's ethos — streamlined capture on Playground App, clear
records in Office.
