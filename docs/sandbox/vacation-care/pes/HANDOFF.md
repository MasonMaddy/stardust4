# Vacation Care — PES (mobile booking) — Developer Handoff

> **Build from this, not from Figma.** The runnable prototype is the source of truth for
> pixels; this spec is the contract for behaviour, states, tokens, redlines, a11y, and
> acceptance. Pixel-exact values: open the deep-link and inspect in the browser.

<!-- GENERATED from handoff.source.json by scripts/build-handoff.mjs — do not edit by hand. -->

| | |
|---|---|
| **Status** | In review |
| **Version** | 0.2 — 2026-06-25 |
| **Approved direction** | Dark mobile (`v=0`) |
| **Prototype** | [`index.html`](index.html) |
| **Devices** | phone |
| **Platforms** | ios · android |
| **Owner** | Sam · **Eng:** David |
| **Agent export** | [`handover/manifest.json`](handover/manifest.json) |

## 0. At a glance

Parent-facing mobile flow to book Vacation Care sessions for a child. Dark iOS-style app reproduced from the Vacation Care Figma 'Mobile Booking Workflow'. Bookings landing (month calendar + holiday-program banner) → New Vacation Care Booking → pick child → multi-select sessions (by date, some waitlist-only) → Review Booking (line items + promo + price breakdown) → booking detail (cosmic hero). 'Done' = a parent can assemble and confirm a multi-session vacation-care booking and view its detail. Counterpart to the Office desktop flow.

## 1. Scope & flow map

| ID | Screen | Purpose | Prototype |
|---|---|---|---|
| S1 | Bookings | Landing: see the month's bookings and start a new one. | [open](index.html?v=0&step=bookings&device=phone) |
| S2 | New Vacation Care Booking | Assemble a booking: child, booking type, sessions. | [open](index.html?v=0&step=form&device=phone) |
| S3 | Select Child | Choose the child the booking is for. | [open](index.html?v=0&step=selectChild&device=phone) |
| S4 | Select Session | Multi-select vacation-care sessions across dates. | [open](index.html?v=0&step=selectSession&device=phone) |
| S5 | Review Booking | Review line items, apply promo, see totals. | [open](index.html?v=0&step=review&device=phone) |
| S6 | Booking detail | View a (requested/confirmed) booking's detail. | [open](index.html?v=0&step=detail&device=phone) |

**Route map**

```
entries: bookings
S1 --(new)--> S2
S1 --(tap:booking-card)--> S6
S2 --(tap:child)--> S3
S3 --(select:child)--> S2
S2 --(tap:sessions)--> S4
S4 --(save)--> S2
S2 --(review)--> S5
S5 --(confirm)--> S6
S6 --(cancel)--> S1
exits: booking-detail
```

**Out of scope**

- Real availability / pricing / promo validation and payment
- Recurring (weekly) booking builder beyond the Casual/Recurring toggle
- The Care / Sign In / Finance / Account tabs (Bookings tab only)
- Auth, notifications, withdraw/cancel back-end

## 2. Global foundations

| Component | DS ver | Status | Variants | Notes |
|---|---|---|---|---|
| `pes-status-bar` | — | build | — | iOS status bar |
| `pes-tab-bar` | — | build | — | bottom tab nav: Care / Bookings / Sign In / Finance / Account |
| `pes-banner` | — | build | — | teal holiday-program banner (cyan-500) with dismiss |
| `pes-month-calendar` | — | build | — | Sun-start month grid; today filled orange; orange dots mark days with bookings |
| `pes-field` | — | build | chevron, clearable | tappable select field; Session(s) shows count + clear-X |
| `pes-session-row` | — | build | available, waitlist | checkbox multi-select row grouped by date; waitlist-only purple pill |
| `pes-line-item` | — | build | — | review line item: date + activity + room + fee, removable |
| `pes-promo` | — | build | applied | teal promo-code field + Remove |
| `pes-alert` | — | build | — | teal-outline informational alert |
| `pes-cosmic-hero` | — | build | — | starfield + teal-planet hero on the booking detail |
| `pes-cta` | — | build | enabled, disabled, ghost | orange-600 primary; orange-outline ghost (Cancel Booking) |

## 3. Screen specs

### S1 · Bookings

**Prototype:** [open the live screen](index.html?v=0&step=bookings&device=phone) · `&bare=1` for chrome-free
**Purpose:** Landing: see the month's bookings and start a new one. **Entry:** App open (Bookings tab) **Exit:** New → S2; tap a booking card → S6

**Layout (top → bottom)**

1. Header: 'Bookings' + '＋ New'
2. Teal banner: 'July Holiday Program Now Open' (dismissible)
3. Month calendar (July 2026, Sun-start): today filled orange, orange dots on days with bookings
4. Bottom: a booking card (Vacation Care Booking • Joey · Little Bugs ELC · times)
5. Bottom tab bar: Care / Bookings / Sign In / Finance / Account

**Copy** (verbatim — ship exactly this)

| Element | Text |
|---|---|
| Title | Bookings |
| New | New |
| Banner | July Holiday Program Now Open |

**Redlines** (spec-level — exact pixels in the prototype)

| Element | Spec |
|---|---|
| Today | 30px orange-500 filled circle |
| Booking dot | 5px orange-500 dot under the date |
| Banner | cyan-500 fill, radius 12 |

**Interaction & behaviour**

- ‘＋ New’ opens the New Vacation Care Booking form (S2).
- Tapping the booking card opens its detail (S6).
- Tab bar shows the Bookings tab active (other tabs out of scope).

**States:** default (July 2026)

**Accessibility**

- New, banner dismiss, and the booking card are buttons; tab items have labels.

**Acceptance criteria** (testable)

- [ ] (S1-AC1) ‘New’ opens the booking form.
- [ ] (S1-AC2) Today is the only filled calendar day; dots mark bookings.

### S2 · New Vacation Care Booking

**Prototype:** [open the live screen](index.html?v=0&step=form&device=phone) · `&bare=1` for chrome-free
**Purpose:** Assemble a booking: child, booking type, sessions. **Entry:** From S1 New **Exit:** Fields open S3/S4; Review → S5 when child + ≥1 session

**Layout (top → bottom)**

1. Large header 'New Vacation Care Booking' + close (X)
2. Child's name → Select child (shows name + service, e.g. Little Seeds OSHC)
3. Booking type: Casual / Recurring (tappable) + helper
4. Session(s) → shows 'N sessions selected' with a clear-X once chosen
5. Pinned CTA 'Review' (disabled until child + ≥1 session)

**Copy** (verbatim — ship exactly this)

| Element | Text |
|---|---|
| Title | New Vacation Care Booking |
| Booking type | Casual — For one-off sessions |
| Session(s) value | {n} sessions selected |
| CTA | Review |

**Redlines** (spec-level — exact pixels in the prototype)

| Element | Spec |
|---|---|
| Field | 56px, radius 14, border grey-1000; Session(s) trailing clear-X when set |

**Interaction & behaviour**

- Child's name → S3; Session(s) → S4.
- Booking type toggles Casual ⇄ Recurring.
- The Session(s) clear-X empties the selection.
- Review enabled only with a child and ≥1 session.

**States:** empty (CTA disabled) · child set · sessions set · complete (CTA enabled)

**Accessibility**

- Fields + CTA are operable controls with names; clear-X has an accessible label.

**Acceptance criteria** (testable)

- [ ] (S2-AC1) Review disabled until child + ≥1 session.
- [ ] (S2-AC2) Session(s) field shows the count and can be cleared.

### S3 · Select Child

**Prototype:** [open the live screen](index.html?v=0&step=selectChild&device=phone) · `&bare=1` for chrome-free
**Purpose:** Choose the child the booking is for. **Entry:** From S2 Child's name **Exit:** Tap a child → S2

**Layout (top → bottom)**

1. Top nav: back + 'Select Child'
2. Rows: avatar + name + service

**Copy** (verbatim — ship exactly this)

| Element | Text |
|---|---|
| Row | Gemma Santiago — Little Seeds OSHC |

**Redlines** (spec-level — exact pixels in the prototype)

| Element | Spec |
|---|---|
| Row | avatar 40px, name 16px, service grey-500 |

**Interaction & behaviour**

- Tapping a child sets it and returns to S2.

**States:** default

**Accessibility**

- Rows are buttons named by the child.

**Acceptance criteria** (testable)

- [ ] (S3-AC1) Selecting a child returns to S2 with it set.

### S4 · Select Session

**Prototype:** [open the live screen](index.html?v=0&step=selectSession&device=phone) · `&bare=1` for chrome-free
**Purpose:** Multi-select vacation-care sessions across dates. **Entry:** From S2 Session(s) **Exit:** Save → S2 with selection

**Layout (top → bottom)**

1. Top nav: back + 'Select Session'
2. Sessions grouped by date (MON, 17 MAY 2026 …)
3. Checkbox row: activity + '$fee · location' + time; waitlist-only sessions show a purple pill
4. Pinned footer: 'N selected' + Save (disabled at 0)

**Copy** (verbatim — ship exactly this)

| Element | Text |
|---|---|
| Date headers | MON, 17 MAY 2026 / TUES, 18 MAY 2026 … |
| Waitlist | Waitlist Only |
| Footer | {n} selected · Save |

**Redlines** (spec-level — exact pixels in the prototype)

| Element | Spec |
|---|---|
| Checkbox | 22px, radius 5; checked = orange-500 fill + white tick |
| Waitlist pill | purple-550 |

**Interaction & behaviour**

- Tapping a row toggles its checkbox; the footer count updates.
- Save (enabled with ≥1) writes the selection back to S2; the field shows the count.
- Opening the picker pre-checks the already-selected sessions.

**States:** 0 selected (Save disabled) · selecting · waitlist sessions present

**Accessibility**

- Rows are checkboxes (role/checked); waitlist status is text + colour.

**Acceptance criteria** (testable)

- [ ] (S4-AC1) Save disabled until ≥1 selected.
- [ ] (S4-AC2) Selection round-trips to S2.

### S5 · Review Booking

**Prototype:** [open the live screen](index.html?v=0&step=review&device=phone) · `&bare=1` for chrome-free
**Purpose:** Review line items, apply promo, see totals. **Entry:** From S2 Review **Exit:** Confirm → S6; back → S2

**Layout (top → bottom)**

1. Large header 'Review Booking' + back
2. CHILD row
3. Per-session line items: date + activity + room + fee, each removable (X); waitlist items show the pill and no fee
4. Teal alert (pricing applies to confirmed dates)
5. Promo code (applied) + Remove
6. Price breakdown: Available • N sessions / Promo • 10% / TOTAL NOW
7. Pinned CTA 'Confirm'

**Copy** (verbatim — ship exactly this)

| Element | Text |
|---|---|
| Title | Review Booking |
| Promo | PROMOCODE10 — Promo code applied |
| Total | TOTAL NOW {available − 10%} |
| CTA | Confirm |

**Redlines** (spec-level — exact pixels in the prototype)

| Element | Spec |
|---|---|
| Line item | date header w/ calendar icon + remove-X; fee right-aligned; waitlist = purple pill, no fee |

**Interaction & behaviour**

- Removing a line item drops it from the booking and recomputes totals.
- Only non-waitlist (available) sessions count toward the subtotal.
- Promo applies a 10% discount to the available subtotal; TOTAL NOW = subtotal − discount.
- Confirm advances to the booking detail (S6).

**States:** with waitlist items · promo applied · item removed

**Accessibility**

- Remove and Confirm are buttons; alert + promo text contrast ≥ 4.5:1 on dark.

**Acceptance criteria** (testable)

- [ ] (S5-AC1) Subtotal counts available sessions only.
- [ ] (S5-AC2) TOTAL NOW = subtotal − 10%.
- [ ] (S5-AC3) Removing an item recomputes the total.

### S6 · Booking detail

**Prototype:** [open the live screen](index.html?v=0&step=detail&device=phone) · `&bare=1` for chrome-free
**Purpose:** View a (requested/confirmed) booking's detail. **Entry:** From S5 Confirm, or a booking card on S1 **Exit:** Cancel Booking → resets to S1

**Layout (top → bottom)**

1. Top nav: back + 'Booking request'
2. Cosmic hero (starfield + teal planet)
3. 'Vacation Care Booking' + Start/End times
4. CHILD / CENTRE / ACTIVITY / FEE / PHONE / COMMENT rows
5. Ghost CTA 'Cancel Booking' (orange outline)

**Copy** (verbatim — ship exactly this)

| Element | Text |
|---|---|
| Nav | Booking request |
| Heading | Vacation Care Booking |
| Times | Start 7:15am – End 6:00pm |
| CTA | Cancel Booking |

**Redlines** (spec-level — exact pixels in the prototype)

| Element | Spec |
|---|---|
| Hero | 150px; dark radial gradient + 78px teal-gradient planet + star dots |
| Cancel Booking | orange-500 outline ghost button |

**Interaction & behaviour**

- Cancel Booking resets the flow back to S1 (Bookings).

**States:** detail

**Accessibility**

- Detail rows are label/value pairs; Cancel Booking is a button.

**Acceptance criteria** (testable)

- [ ] (S6-AC1) Cancel Booking returns to S1.

## 4. State & edge matrix

| State | Trigger | Screen(s) | UI | Copy | Recovery | Prototype |
|---|---|---|---|---|---|---|
| `cta-disabled` | Booking incomplete | S2 | disabled CTA | Review | Add child + ≥1 session | [open](index.html?v=0&step=form&device=phone) |
| `waitlist` | Waitlist-only session | S4, S5 | purple pill; excluded from subtotal | Waitlist Only | n/a | [open](index.html?v=0&step=review&device=phone) |
| `save-disabled` | No sessions ticked | S4 | disabled Save | Save | Tick ≥1 session | [open](index.html?v=0&step=selectSession&device=phone) |

## 5. Platform deltas

| Area | ios | android |
|---|---|---|
| Status bar | system status bar | system status bar |
| Tab bar | bottom tab bar | bottom nav |

## 6. Open questions

| Question | Owner | Due | Status |
|---|---|---|---|
| Recurring booking: full weekly-pattern builder is out of scope here — confirm its own flow. | Sam | 2026-07-02 | open |
| Source of session availability / waitlist / pricing and promo validation (API). | David | 2026-07-02 | open |
| Booking detail covers request/confirmed; confirm the withdraw/cancel variants (teal 'Withdraw Request' card) are a separate state. | Sam | 2026-07-02 | open |

## 7. Changelog

| Version | Date | Change |
|---|---|---|
| 0.1 | 2026-06-25 | Initial PES handoff (generic Simplify Bookings flow — superseded). |
| 0.2 | 2026-06-25 | Rebuilt to the actual Vacation Care mobile screens: Bookings landing, New Vacation Care Booking, multi-select Select Session, Review Booking (line items + promo), booking detail (cosmic hero). |
