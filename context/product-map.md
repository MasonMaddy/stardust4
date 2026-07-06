# Product map — the Xplor Education suite

What each product is, who uses it, and how data flows between them. Load this before any
product-facing work; pair it with `personas.md` and the relevant section of `design-ethos.md`.

## The two spaces

**BMS — Business Management Software.** Where childcare services are administered. One product:

- **Office** (web) — the admin surface. Enrolments, bookings, fees, rooms, reporting, family and
  child records, CCS/session management. Two distinct altitudes of user:
  - **Service admin** — runs a single service day to day (see *Sandra* in `personas.md`).
  - **Provider admin** — presides over many services from area management or head office: bulk
    actions, large reports, and *configuring how services operate* (enrolment forms, fee schedules,
    room setups) (see *Priya*). **Most Office features need the provider-level abstraction
    considered** — a level above the single-service view.

**PES — People Engagement Software.** Where educators and families live. Three surfaces:

- **Playground Web** (web) — the educator's *proactive* space: EYLF learning documentation
  (observations, learning stories), programming and planning, some reporting. Educators sit down
  and spend time here.
- **Playground App** (iOS/Android app on a **shared, in-room device**) — the educator's *reactive*
  space: compliance tasks first — signing children in/out of rooms, nappy checks, sleep checks,
  headcounts. Partial feature overlap with Playground Web, no parity (uplift is gradual). Logged in
  per educator, but the device belongs to the room and is passed between staff.
- **Home** (iOS/Android, personal device) — the family surface: bookings first, then messaging and
  notices from the service, learning documentation (photos, videos, stories), health data (sleeps,
  meals, nappies), payments, statements. Used by parents *and* the ring around them — guardians,
  grandparents, authorised pick-up contacts. Families don't pay for Home, so it has historically
  been under-invested — but parent word-of-mouth is a real driver of service adoption, so the
  parent experience deserves deliberate care.

**Hub** — an iPad kiosk in the service entryway. Parents self-serve child sign-in/out at drop-off
via QR code or manual entry, without needing a staff member. Configured and managed by admins.

## Integrations that feed the suite

- **QikKids** (acquired competitor, AU) and **Discover** (acquired, NZ) are BMSs in their own
  right. **No design work happens in them** — but both feed data down into Playground and Home.
  Anything built for PES may be consuming QikKids- or Discover-originated data.
- The integrations are mature and usually seamless, but every PES design should sanity-check the
  cross-product dependencies below.
- **NZ nuance:** Discover services are New Zealand services — different curriculum, funding, and
  regulatory context (see `sector-compliance.md`).

## The customer journey

```
Waitlist → Enrolment → Attendance (long day care / OSHC / vacation care)
        → Bookings · Payments · Compliance · Learning documentation
```

- **Admins (Office)** own intake and management: waitlists, enrolments, bookings, fees, records.
- **Educators (Playground)** own the day-to-day: compliance events, learning documentation.
- **Families (Home / Hub)** book, pay, sign in/out, and receive everything the service shares.

A feature usually cuts across surfaces: e.g. an enrolment form is *configured* by a provider admin
(Office), *completed* by a parent (Home or web), and its output shapes what educators see
(Playground). Name every surface a flow touches before designing it.

## Cross-product dependency checklist

Run through this for any PES feature (and any Office feature that feeds PES):

1. **Data origin** — could the data this feature consumes originate in QikKids or Discover rather
   than Office? If so, what's the behaviour when a field they don't supply is missing?
2. **NZ / Discover** — does this feature behave differently for NZ services (curriculum terms,
   funding attestation, ratio rules)? Check `sector-compliance.md` §NZ.
3. **Provider altitude** — for Office work: does a provider admin need to do this in bulk, across
   services, or configure it per-service? Designing only the single-service view is usually half
   the feature.
4. **Surface hand-offs** — where does this flow's data surface next (Office ↔ Playground ↔ Home ↔
   Hub)? Does each receiving surface get what it needs?
5. **Shared vs personal device** — anything landing on Playground App runs on a shared in-room
   device; anything on Home runs on a personal one. Session, privacy, and notification design
   differ accordingly (see `design-ethos.md`).
