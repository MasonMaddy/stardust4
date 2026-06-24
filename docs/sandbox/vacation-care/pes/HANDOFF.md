# Vacation Care — PES (Simplify Bookings) — Developer Handoff

> **Build from this, not from Figma.** The runnable prototype is the source of truth for
> pixels; this spec is the contract for behaviour, states, tokens, redlines, a11y, and
> acceptance. Pixel-exact values: open the deep-link and inspect in the browser.

<!-- GENERATED from handoff.source.json by scripts/build-handoff.mjs — do not edit by hand. -->

| | |
|---|---|
| **Status** | In review |
| **Version** | 0.1 — 2026-06-25 |
| **Approved direction** | Dark mobile (`v=0`) |
| **Prototype** | [`index.html`](index.html) |
| **Devices** | phone |
| **Platforms** | ios · android |
| **Owner** | Sam · **Eng:** David |
| **Agent export** | [`handover/manifest.json`](handover/manifest.json) |

## 0. At a glance

Parent-facing mobile flow to request/book a Vacation Care space for a child. Dark iOS-style app: New Booking → pick child → pick session → pick dates → review → request confirmed. 'Done' = a parent can request a space (waitlisted) or book a priced session across one or more dates and reach a confirmation. Counterpart to the Office desktop flow.

## 1. Scope & flow map

| ID | Screen | Purpose | Prototype |
|---|---|---|---|
| S1 | New Booking | Assemble a booking: child, booking type, session, then dates. | [open](index.html?v=0&step=booking&device=phone) |
| S2 | Select Child | Choose the child the booking is for. | [open](index.html?v=0&step=selectChild&device=phone) |
| S3 | Select Session | Choose the session type to book. | [open](index.html?v=0&step=selectSession&device=phone) |
| S4 | Select date(s) | Pick one or more dates for the session. | [open](index.html?v=0&step=selectDates&device=phone) |
| S5 | Review request | Review the assembled booking before confirming. | [open](index.html?v=0&step=review&device=phone) |
| S6 | Request confirmed | Confirm the request was submitted. | [open](index.html?v=0&step=confirmed&device=phone) |

**Route map**

```
entries: new-booking
S1 --(tap:child)--> S2
S2 --(select:child)--> S1
S1 --(tap:session)--> S3
S3 --(select:session)--> S1
S1 --(tap:dates)--> S4
S4 --(save)--> S1
S1 --(review)--> S5
S5 --(confirm)--> S6
S6 --(done)--> S1
exits: request-confirmed
```

**Out of scope**

- Real availability / pricing data and payment
- Recurring (weekly) booking builder beyond the Casual/Recurring toggle
- Auth, child/account management, notifications delivery
- Android-specific visual polish (built iOS-first)

## 2. Global foundations

| Component | DS ver | Status | Variants | Notes |
|---|---|---|---|---|
| `pes-status-bar` | — | build | — | iOS status bar (9:41 + signal/wifi/battery) |
| `pes-nav-header` | — | build | back, large+close, large+back, large | top nav: centred title + back, or large title with close/back |
| `pes-field` | — | build | — | tappable select field (label + value/placeholder + chevron) — dark equivalent of ds-input select |
| `pes-calendar` | — | build | default, selected | Sun-start month grid; available/waitlist/disabled day states + legend |
| `pes-list-row` | — | build | child, session | child (avatar+name+service) and grouped session (name/price + time) rows |
| `pes-alert` | — | build | — | teal-outline informational alert (cyan-500) |
| `pes-cta` | — | build | enabled, disabled | full-width bottom button; orange-600 enabled, grey disabled |
| `pes-status-pill` | — | build | available, waitlist | orange = available, purple-550 = waitlist only |

## 3. Screen specs

### S1 · New Booking

**Prototype:** [open the live screen](index.html?v=0&step=booking&device=phone) · `&bare=1` for chrome-free
**Purpose:** Assemble a booking: child, booking type, session, then dates. **Entry:** Tap 'New Booking' (cold start) **Exit:** Each field opens a picker (S2/S3/S4); Review → S5 when complete

**Layout (top → bottom)**

1. Large header 'New Booking' + close (X)
2. Field: Child's name → Select child
3. Booking type: Casual / Recurring (tappable) with helper line
4. Field: Session(s) → Select session
5. Field: Dates → Select dates (appears once a session is chosen)
6. Pinned bottom CTA 'Review' (disabled until child + session + dates)

**Copy** (verbatim — ship exactly this)

| Element | Text |
|---|---|
| Title | New Booking |
| Labels | Child's name / Booking type / Session(s) / Dates |
| Booking type | Casual — For one-off sessions |
| CTA | Review |

**Redlines** (spec-level — exact pixels in the prototype)

| Element | Spec |
|---|---|
| Background | --sd-colour-grey-1200 (#121212) |
| Header / fields surface | --sd-colour-grey-1100 surface; field border --sd-colour-grey-1000 |
| Section labels | orange-500, 12px, 600 |
| Field height | 56px, radius 14 |
| CTA | 48px, radius 12; orange-600 enabled / grey-1050 disabled |

**Interaction & behaviour**

- Tapping Child's name → S2; Session(s) → S3; Dates → S4.
- Booking type toggles Casual ⇄ Recurring (helper text updates).
- Dates field appears only after a session is selected; changing the session clears dates.
- Review is enabled only when a child, a session, and ≥1 date are set.

**States:** empty (CTA disabled) · child set · session set (Dates field appears) · complete (CTA enabled)

**Accessibility**

- Fields and CTA are buttons with accessible names; ≥44px targets.
- Disabled CTA is conveyed by more than colour (it does not advance).

**Acceptance criteria** (testable)

- [ ] (S1-AC1) Review is disabled until child + session + ≥1 date.
- [ ] (S1-AC2) Dates field appears only after a session is chosen.
- [ ] (S1-AC3) Changing session clears selected dates.

### S2 · Select Child

**Prototype:** [open the live screen](index.html?v=0&step=selectChild&device=phone) · `&bare=1` for chrome-free
**Purpose:** Choose the child the booking is for. **Entry:** From S1 Child's name field **Exit:** Tap a child → S1 with child set; back → S1

**Layout (top → bottom)**

1. Top nav: back + 'Select Child'
2. List rows: avatar + name + service (Little Bugs)

**Copy** (verbatim — ship exactly this)

| Element | Text |
|---|---|
| Title | Select Child |
| Row | Gemma Santiago — Little Bugs |

**Redlines** (spec-level — exact pixels in the prototype)

| Element | Spec |
|---|---|
| Row | avatar 40px; name 16px; service grey-500 13px; divider grey-1100 |

**Interaction & behaviour**

- Tapping a child sets it and returns to S1.

**States:** default

**Accessibility**

- Rows are buttons with the child's name as accessible name.

**Acceptance criteria** (testable)

- [ ] (S2-AC1) Selecting a child returns to S1 with it set.

### S3 · Select Session

**Prototype:** [open the live screen](index.html?v=0&step=selectSession&device=phone) · `&bare=1` for chrome-free
**Purpose:** Choose the session type to book. **Entry:** From S1 Session(s) field **Exit:** Tap a session → S1 with session set

**Layout (top → bottom)**

1. Top nav: back + 'Select Session'
2. Grouped list: Before School Care / After School Care / Vacation Care / Other
3. Row: name + price (left), time range (right). 'Request a space' (Other) = waitlist, no time

**Copy** (verbatim — ship exactly this)

| Element | Text |
|---|---|
| Groups | BEFORE SCHOOL CARE / AFTER SCHOOL CARE / VACATION CARE / OTHER |
| Waitlist row | Request a space — Billing determined by admin |

**Redlines** (spec-level — exact pixels in the prototype)

| Element | Spec |
|---|---|
| Group header | grey-500, 12px, uppercase, 1px tracking |

**Interaction & behaviour**

- Tapping a session sets it (and its waitlist flag) and returns to S1.

**States:** default

**Accessibility**

- Group headers are non-interactive; rows are buttons.

**Acceptance criteria** (testable)

- [ ] (S3-AC1) 'Request a space' marks the booking as waitlist.

### S4 · Select date(s)

**Prototype:** [open the live screen](index.html?v=0&step=selectDates&device=phone) · `&bare=1` for chrome-free
**Purpose:** Pick one or more dates for the session. **Entry:** From S1 Dates field **Exit:** Save → S1 with dates set

**Layout (top → bottom)**

1. Top nav: back + 'Select date(s)'
2. Guidance line naming the session
3. January 2025 month grid (Sunday-start) + ‹ › month nav
4. Legend: Available (orange) · Waitlist Only (purple)
5. Pinned footer: 'N selected' + Save (disabled at 0)

**Copy** (verbatim — ship exactly this)

| Element | Text |
|---|---|
| Title | Select date(s) |
| Guidance | Select one or more dates you would like to book for {session} |
| Legend | Available / Waitlist Only |
| Footer | {n} selected · Save |

**Redlines** (spec-level — exact pixels in the prototype)

| Element | Spec |
|---|---|
| Day cell | 36px circle; selected available = orange-500, selected waitlist = purple-550 fill |
| Disabled/out-of-month day | grey-700, strikethrough, not tappable |

**Interaction & behaviour**

- Tapping an available/waitlist day toggles its selection; disabled days (weekends + blocked) and out-of-month days are not selectable.
- Selected available days fill orange; selected waitlist-only days fill purple.
- Save is enabled once ≥1 date is selected and returns to S1.

**States:** default (0 selected, Save disabled) · selecting · disabled days · available vs waitlist days

**Accessibility**

- Day buttons have the date as accessible name; disabled days are non-interactive.
- Available/waitlist distinction has the legend text, not colour alone.

**Acceptance criteria** (testable)

- [ ] (S4-AC1) Disabled and out-of-month days can't be selected.
- [ ] (S4-AC2) Save is disabled until ≥1 date selected.
- [ ] (S4-AC3) Selected day fill matches its kind.

### S5 · Review request

**Prototype:** [open the live screen](index.html?v=0&step=review&device=phone) · `&bare=1` for chrome-free
**Purpose:** Review the assembled booking before confirming. **Entry:** From S1 Review **Exit:** Confirm → S6; back → S1

**Layout (top → bottom)**

1. Large header 'Review request' + back
2. 'Your booking': CHILD, SESSION, dates (with Waitlist-only pill if applicable)
3. Teal alert (pricing applies to available dates only)
4. Price details: TOTAL
5. Pinned CTA 'Confirm'

**Copy** (verbatim — ship exactly this)

| Element | Text |
|---|---|
| Title | Review request |
| Alert | Pricing details only apply to available dates. Waitlisted bookings will have their pricing information attached if confirmed. |
| Total | TOTAL £0.00 (waitlist) / price × dates (available) |
| CTA | Confirm |

**Redlines** (spec-level — exact pixels in the prototype)

| Element | Spec |
|---|---|
| Summary row | grey-500 label (96px) + right-aligned white value |

**Interaction & behaviour**

- Waitlist sessions show the Waitlist-only pill and a £0.00 total.
- Priced sessions total = session price × number of dates.
- Confirm advances to S6.

**States:** waitlist (£0.00) · priced (price × dates)

**Accessibility**

- Back and Confirm are buttons; alert text contrast ≥ 4.5:1 on the dark surface.

**Acceptance criteria** (testable)

- [ ] (S5-AC1) Waitlist total is £0.00 and shows the pill.
- [ ] (S5-AC2) Priced total = price × dates.

### S6 · Request confirmed

**Prototype:** [open the live screen](index.html?v=0&step=confirmed&device=phone) · `&bare=1` for chrome-free
**Purpose:** Confirm the request was submitted. **Entry:** From S5 Confirm **Exit:** Done → resets to S1

**Layout (top → bottom)**

1. Large header 'Request confirmed'
2. Teal success check
3. Teal alert (email confirmation)
4. CHILD / SESSION / DATE(S) summary + Waitlist-only pill
5. Teal pricing alert; TOTAL FEE
6. Pinned CTA 'Done'

**Copy** (verbatim — ship exactly this)

| Element | Text |
|---|---|
| Title | Request confirmed |
| Alert | You will receive an email shortly for all confirmed booking details. |
| CTA | Done |

**Redlines** (spec-level — exact pixels in the prototype)

| Element | Spec |
|---|---|
| Success check | 56px cyan-500 circle, white tick |

**Interaction & behaviour**

- Done resets all state and returns to S1.

**States:** confirmed

**Accessibility**

- Success conveyed by the alert text, not the icon alone.

**Acceptance criteria** (testable)

- [ ] (S6-AC1) Done resets the flow.

## 4. State & edge matrix

| State | Trigger | Screen(s) | UI | Copy | Recovery | Prototype |
|---|---|---|---|---|---|---|
| `cta-disabled` | Booking incomplete | S1 | disabled CTA | Review | Complete child + session + dates | [open](index.html?v=0&step=booking&device=phone) |
| `dates-disabled` | Weekend / blocked / out-of-month day | S4 | strikethrough, non-interactive | — | Pick an open day | [open](index.html?v=0&step=selectDates&device=phone) |
| `waitlist` | 'Request a space' session | S4, S5, S6 | purple pill + purple date fill + £0.00 | Waitlist only | n/a | [open](index.html?v=0&step=review&device=phone) |

## 5. Platform deltas

| Area | ios | android |
|---|---|---|
| Status bar | system status bar | system status bar |
| Date picker | in-app month grid (no system picker) | in-app month grid |

## 6. Open questions

| Question | Owner | Due | Status |
|---|---|---|---|
| Recurring booking: full weekly-pattern builder is out of scope here — confirm its own flow. | Sam | 2026-07-02 | open |
| Where do available vs waitlist date states + pricing come from (service availability API)? | David | 2026-07-02 | open |
| Leading/trailing calendar cells render as '·' in the proto; Figma shows greyed adjacent-month dates — confirm desired. | Sam | 2026-07-02 | open |

## 7. Changelog

| Version | Date | Change |
|---|---|---|
| 0.1 | 2026-06-25 | Initial PES handoff (New Booking → child → session → dates → review → confirmed). |
