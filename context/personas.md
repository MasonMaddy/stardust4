# Personas — canonical source

The composite research personas Xplor Education designs for. **This file is the canonical source;
`docs/foundations/personas.html` is the human-readable rendering — edit here first and mirror the
page in the same PR.** Composite, not real: names and details are illustrative stand-ins for
research themes, never identifiable customers (public repo).

Use them to name who a piece of work is for before designing it. Every prototype, research report,
and brief should cite at least one persona by name.

## Office / BMS — the admins

### Sandra — Service Administrator
- **Surfaces:** Office (daily); configures the Hub kiosk.
- **Who:** Runs a single service — the daily, weekly, monthly ins and outs. Typically older,
  less tech-savvy, long tenure. Knows every family by name; her closeness to children and parents
  is the job's heart.
- **Goals:** Keep the service running smoothly — enrolments, bookings, attendance, fees — and stay
  available to families.
- **Frustrations:** Software that assumes fluency; multi-step flows with no obvious next action;
  fear of clicking the wrong thing in systems of record.
- **Design implications:** Guided, forgiving flows with clear next steps and undo; plain language
  over system jargon; her data entry has compliance and billing consequences, so confirm before
  destructive actions and make state visible.

### Priya — Provider Administrator
- **Surfaces:** Office (daily), at provider level across many services.
- **Who:** Area manager / head-office admin presiding over a portfolio of services. Confident
  operator, data-driven, time-poor.
- **Goals:** Calibrate how *all* her services operate — enrolment forms, fee schedules, room
  setups — run large reports, act in bulk, and set services up for success.
- **Frustrations:** Being forced to repeat a task per-service; reports that can't aggregate across
  services; single-service assumptions baked into features.
- **Design implications:** Every Office feature must answer "what does this look like at provider
  level?" — bulk actions, cross-service defaults with per-service overrides, and reporting that
  aggregates. If a design only shows the single-service view, it's half-finished.

## PES — the educators and practice leads

### Angela Smith — Pedagogy & Practice Lead · Gold Coast, QLD
- **Surfaces:** Playground Web (primarily); reviews across the provider.
- **Who:** Thirty years in education, expert in pedagogy. Mentors educators and builds curriculums.
- **Goals:** Track programming and planning across the provider; collaborate with peers; lift
  practice quality.
- **Frustrations:** No easy provider-wide view of programming; collaboration happens outside the
  tools.
- **Design implications:** Cross-service visibility of learning documentation; artefacts she can
  share and discuss; respect her expertise — she needs depth, not hand-holding.

### Claire Yu — Educator (Diploma of ECEC) · Geelong, VIC
- **Surfaces:** Playground App (compliance, daily) + Playground Web (documentation).
- **Who:** Early-career, keen to learn and embrace new tools — but finds them intimidating without
  clear guidance.
- **Goals:** Less time on admin, more confidence using the tools well.
- **Frustrations:** Features she suspects she's using wrong; time lost to duplicate data entry.
- **Design implications:** Guidance in the flow (empty states that teach, sensible defaults);
  automate data entry wherever a value can be inferred; never punish exploration.

### Emily — Educator (Diploma of ECEC) · Hobart, TAS
- **Surfaces:** Playground App + Playground Web.
- **Who:** Creative, hands-on educator — teaching is her creative outlet. Wary of technology that
  gets between her and the children.
- **Goals:** Do the required documentation and compliance with minimum friction, then put the
  device down.
- **Frustrations:** Tools that demand attention during care moments; documentation that feels like
  form-filling instead of storytelling.
- **Design implications:** The benchmark persona for "put the device down" (see
  `design-ethos.md` §Playground App): fastest possible capture, batch/later options, and learning
  documentation that leaves room for her voice.

## PES — the families (Home / Hub)

### James — Experienced Parent · Sydney, NSW
- **Surfaces:** Home; Hub at drop-off.
- **Who:** Stay-at-home parent, time-poor, not especially tech-savvy. Values smooth processes and a
  little free time.
- **Goals:** Book, pay, and stay informed with zero fuss.
- **Frustrations:** Anything fiddly — multi-screen tasks, re-entering known details.
- **Design implications:** The mainstream Home benchmark: core tasks (booking, paying, sign-in)
  must be completable quickly on a phone, one-handed, without instructions.

### Riley — Neighbour, Friend & Parent · Sydney, NSW
- **Surfaces:** Home (often on someone else's behalf); Hub at pick-up.
- **Who:** Stay-at-home parent who helps the people around them — often the authorised contact
  picking up another family's child rather than the primary decision-maker.
- **Goals:** Get tasks done for others quickly and correctly.
- **Frustrations:** Products that assume the user is the child's parent/account owner.
- **Design implications:** Design for delegated access: authorised-contact roles, clarity about
  which child/family context is active, and safe limits on what a non-parent can see and do.

### Jeff — Grandparent · Sydney, NSW
- **Surfaces:** Home (view/receive); Hub at drop-off and pick-up.
- **Who:** Retired, helps the family with childcare. Low confidence with technology.
- **Goals:** Reassurance that his grandchild is safe and well cared for; complete pick-up/drop-off
  without needing help.
- **Frustrations:** Small touch targets, ambiguous icons, flows that assume app fluency.
- **Design implications:** The accessibility benchmark for family surfaces: large type and targets,
  literal labels, one thing per screen; the Hub must be usable by someone who has never seen it.

### Martin — New Parent · Melbourne, VIC
- **Surfaces:** Home (heavy use — first child, checks everything).
- **Who:** Works in tech, understands childcare deeply, curious how educators use technology.
- **Goals:** A coherent, trustworthy picture of his child's day; clear guidance on how processes
  work.
- **Frustrations:** Information that doesn't line up between screens or channels; opaque processes.
- **Design implications:** The consistency benchmark: the same fact (a sleep, a booking, a balance)
  must agree everywhere it appears; explain system behaviour rather than hiding it.
