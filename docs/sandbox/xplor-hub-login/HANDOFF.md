# Xplor Hub — Login flow — Developer Handoff

> **Build from this, not from Figma.** The runnable prototype is the source of truth for
> pixels; this spec is the contract for behaviour, states, tokens, redlines, a11y, and
> acceptance. Pixel-exact values: open the deep-link and inspect in the browser.

<!-- GENERATED from handoff.source.json by scripts/build-handoff.mjs — do not edit by hand. -->

| | |
|---|---|
| **Status** | Draft |
| **Version** | 0.1 — 2026-07-05 |
| **Approved direction** | Light theme (kiosk) (`v=0`) |
| **Prototype** | [`index.html`](index.html) |
| **Devices** | tablet |
| **Platforms** | web |
| **Owner** | Sam Weinhandl |
| **Agent export** | [`handover/manifest.json`](handover/manifest.json) |

## 0. At a glance

Landscape tablet kiosk (1103×768) login flow for the Xplor Hub at a childcare service. A shared Dashboard offers QR sign-in, email sign-in and a visitor log; one email login branches to parent/contact attendance (role select → child sign-in) or the educator shift screen, while the visitor journey runs without login. 'Done' = all three journeys are walkable end to end, including the no-shift empty state and the sign-in Required error. One approved direction: light theme.

## 1. Scope & flow map

| ID | Screen | Purpose | Prototype |
|---|---|---|---|
| S1 | Dashboard | Kiosk landing screen: QR sign-in with Xplor Home, email sign-in, or the visitor log. | [open](index.html?v=0&step=dashboard&device=phone) |
| S2 | Sign in | Email + password login for parents, contacts and educators. | [open](index.html?v=0&step=signin&device=phone) |
| S3 | Role select | After login, choose who is signing children in: parent or collection contact. | [open](index.html?v=0&step=role&device=phone) |
| S4 | Child select | Sign children in — booked sessions plus casual sign-in for children without a booking. | [open](index.html?v=0&step=child&device=phone) |
| S5 | Educator — start shift | Educator lands here after login to manage their shift: end it or resume it. | [open](index.html?v=0&step=educator&device=phone) |
| S6 | Educator — no shift (empty state) | Empty state when the logged-in educator has no shift configured in rostering. | [open](index.html?v=0&step=educator-noshift&device=phone) |
| S7 | Visitor log | Log of today's visitors: sign a new visitor in, or sign an existing one out. | [open](index.html?v=0&step=visitor&device=phone) |
| S8 | New visitor | Capture a new visitor's details and sign them in. | [open](index.html?v=0&step=newvisitor&device=phone) |

**Route map**

```
entries: dashboard
S1 --(parent+educator: tap 'Sign in with email')--> S2
S1 --(visitor: tap 'Visitor log')--> S7
S2 --(parent/contact: valid login (1s loading))--> S3
S2 --(educator: valid login (1s loading))--> S5
S2 --(educator: valid login, no rostered shift)--> S6
S2 --(login with empty field)--> S2
S2 --(back)--> S1
S3 --(tap role card (Parent / Collection Contact))--> S4
S3 --(back)--> S1
S4 --(tap 'Sign In' / 'Casual Session' (toast, stays))--> S4
S4 --(back)--> S3
S5 --(tap 'End Shift' or 'Resume Shift')--> S1
S5 --(back)--> S1
S6 --(back)--> S1
S7 --(tap 'Sign in' (New visitor))--> S8
S7 --(tap 'Sign out' (row removed + toast))--> S7
S7 --(back)--> S1
S8 --(tap 'Sign in')--> S7
S8 --(back)--> S7
exits: child-signed-in, shift-managed, visitor-logged
```

**Out of scope**

- Real authentication and account/role lookup (prototype uses sanitized demo credentials only)
- QR sign-in with Xplor Home (the QR tile is a decorative placeholder)
- Shift/roster data behind End Shift / Resume Shift (static demo times)
- Visitor record persistence (the visitor list resets when a journey relaunches)

## 2. Global foundations

| Component | DS ver | Status | Variants | Notes |
|---|---|---|---|---|
| `hub-shell` | — | build | eyebrow, back-link, centered | Kiosk screen chrome shared by every screen: 4px teal top strip, eyebrow (service label) or back-link, 48px title, top-right account avatar with presence dot; body scrolls, optional vertical centring for sparse screens. |
| `hub-panel` | — | build | — | White bordered panel container (radius 20, border-default) hosting each screen's card content. |
| `hub-action-card` | — | build | cyan-tile, solid-tile, danger-tile | Large tappable action card: 64px icon tile + title/sub + trailing chevron. Used for Sign in with email, Visitor log, New visitor, End Shift (danger), Resume Shift (solid teal). |
| `hub-person-card` | — | build | chevron, text-action | Role/child selection card: 64px photo (initials fallback), name, sub, status pill, trailing chevron or text action (Sign In / Casual Session). Rendered as a div with role=button so the trailing link can nest legally. |
| `hub-visitor-row` | — | build | — | Visitor list row: 48px initials tile, name, 'Signed in {time}', trailing Sign out text link. |
| `hub-field` | — | build | text, password, textarea | Outlined input with a notched floating label (matches the Figma InputTextSelect, Material-style). Differs from the shipped ds-input (outside label) — reconcile before build. |
| `ds-pill` | 2.1 | extend | minimal-cyan, minimal-orange | Session/status tag (Booked Session / Casual Session) mirrors ds-pill minimal at 24px in cyan and orange tones — reuse ds-pill rather than the prototype's inline pill. |
| `ds-btn` | 2.1 | extend | solid full-width, loading | Primary Login / Sign in button is a full-width 48px pill with a loading spinner + 'Signing in…' label — map to ds-btn--solid with a full-width variant. |

## 3. Screen specs

### S1 · Dashboard

**Prototype:** [open the live screen](index.html?v=0&step=dashboard&device=phone) · `&bare=1` for chrome-free
**Purpose:** Kiosk landing screen: QR sign-in with Xplor Home, email sign-in, or the visitor log. **Entry:** Every journey starts here (all three bottom launchers land on the Dashboard, behind the launch splash) **Exit:** → S2 via Sign in with email; → S7 via Visitor log

**Layout (top → bottom)**

1. Hub shell: 4px teal strip · eyebrow 'Little Bugs ELC' · 48px title · account avatar (top right)
2. Centred panel (max 800px): QR tile (196px, decorative placeholder) + 'Scan with Xplor Home' caption on the left
3. Right column: two stacked action cards — Sign in with email · Visitor log

**Copy** (verbatim — ship exactly this)

| Element | Text |
|---|---|
| Eyebrow | Little Bugs ELC |
| Title | Good Morning |
| QR caption | Scan with Xplor Home |
| Action card 1 | Sign in with email |
| Action card 1 — sub | Parents and educators |
| Action card 2 | Visitor log |
| Action card 2 — sub | Sign your name in or out |
| Splash | XPLOR |
| Splash — status | Getting things ready… |

**Redlines** (spec-level — exact pixels in the prototype)

| Element | Spec |
|---|---|
| Top strip | 4px, action-primary |
| Title | 48px/56px, weight 700, -0.02em |
| QR tile | 196px on a white 12px-radius card |
| Action-card icon tile | 64px square, --sd-radius-lg, surface-cyan fill / action-primary glyph |
| Avatar | 48px circle + 12px teal presence dot |

**Interaction & behaviour**

- The launch splash overlays this screen for ~950ms on every journey launch, then fades out.
- 'Sign in with email' opens the sign-in screen (S2) within the current journey (parent/contact or educator).
- 'Visitor log' switches to the visitor journey and opens the log (S7) — no login required.
- The QR tile is decorative in the prototype; real pairing with Xplor Home is out of scope.

**States:** default · splash (launch, ~950ms)

**Accessibility**

- Action cards are real <button type="button"> elements.
- The QR image is decorative — mark aria-hidden in build.
- Kiosk touch targets: both action cards exceed 48px height.

**Acceptance criteria** (testable)

- [ ] (S1-AC1) Sign in with email opens the sign-in screen.
- [ ] (S1-AC2) Visitor log opens the visitor journey without a login step.
- [ ] (S1-AC3) The splash replays on every journey launch and dismisses itself.

### S2 · Sign in

**Prototype:** [open the live screen](index.html?v=0&step=signin&device=phone) · `&bare=1` for chrome-free
**Purpose:** Email + password login for parents, contacts and educators. **Entry:** From the Dashboard (Sign in with email) **Exit:** → S3 (parent/contact journey) or S5 (educator journey) after a 1s loading state; back → S1

**Layout (top → bottom)**

1. Hub shell with back-link 'Dashboard'; title 'Good Morning'; body vertically centred
2. 464px login card: XPLOR wordmark · 'Little Bugs Login' · Forgot email? link · Email field · Forgot password? link · Password field (show/hide eye) · inline error slot · full-width Login button · helper paragraph

**Copy** (verbatim — ship exactly this)

| Element | Text |
|---|---|
| Back link | Dashboard |
| Title | Good Morning |
| Wordmark | XPLOR |
| Card title | Little Bugs Login |
| Link | Forgot email? |
| Email — label | Email |
| Email — placeholder | you@service.edu.au |
| Link | Forgot password? |
| Password — label | Password |
| Password — placeholder | Password |
| Inline error | Required |
| Button | Login |
| Button — loading | Signing in… |
| Helper | Your centre username is also used to login to Playground and can be found under Service Settings on Xplor Office. |
| Demo email (sanitized) | jessica.c@example.com |
| Demo password (sanitized) | demo-1234 |

**Redlines** (spec-level — exact pixels in the prototype)

| Element | Spec |
|---|---|
| Login card | 464px wide, 40px padding |
| Field | 56px height, 1.5px border (grey-500 → action-primary on focus, orange-900 when invalid), notched floating label |
| Login button | 48px full-width pill, action-primary |

**Interaction & behaviour**

- Both fields are pre-filled with the sanitized demo credentials (jessica.c@example.com / demo-1234).
- Login with either field empty shows the inline 'Required' error and paints the empty field's border + label in the danger colour; no navigation.
- Valid login shows the button loading state (spinner + 'Signing in…') for 1s, then routes to Role select (S3) — or to the Educator screen (S5) when the educator journey is active.
- The eye button toggles the password field between masked and plain text.
- The back link returns to the Dashboard and clears the error.

**States:** default (pre-filled) · error:required (empty field) · loading (1s) · password-visible

**Accessibility**

- The eye toggle needs an aria-label ('Show password' / 'Hide password') and pressed state.
- The inline 'Required' error must be associated with the invalid field (aria-describedby) and announced (role=alert).
- Error state must not rely on the red border alone — the error text stays.
- Never persist or log real credentials on a shared kiosk; demo values are placeholders only.

**Acceptance criteria** (testable)

- [ ] (S2-AC1) Empty email or password blocks login with the Required error.
- [ ] (S2-AC2) Valid login shows a ~1s loading state then routes by journey.
- [ ] (S2-AC3) The eye button toggles password visibility.

### S3 · Role select

**Prototype:** [open the live screen](index.html?v=0&step=role&device=phone) · `&bare=1` for chrome-free
**Purpose:** After login, choose who is signing children in: parent or collection contact. **Entry:** From a successful login on the parent/contact journey **Exit:** → S4 via either role card; back → S1

**Layout (top → bottom)**

1. Hub shell with back-link 'Dashboard'; title 'Attendance'
2. Section label 'Role select'
3. Two-column grid of person cards: Parent (Jessica Jones · James May) · Collection Contact (Samuel Weinhandl), each with a Casual Session pill and trailing chevron

**Copy** (verbatim — ship exactly this)

| Element | Text |
|---|---|
| Back link | Dashboard |
| Title | Attendance |
| Section label | Role select |
| Card 1 — name | Parent |
| Card 1 — sub | Jessica Jones · James May |
| Card 1 — tag | Casual Session |
| Card 2 — name | Collection Contact |
| Card 2 — sub | Samuel Weinhandl |
| Card 2 — tag | Casual Session |

**Redlines** (spec-level — exact pixels in the prototype)

| Element | Spec |
|---|---|
| Card grid | 2 columns, 24px gap |
| Photo tile | 64px, radius 12, initials fallback (no external avatar service) |
| Card padding | 20px |

**Interaction & behaviour**

- Tapping either role card opens Child select (S4).
- Photos fall back to a cyan initials tile — the prototype loads no external avatar assets.

**States:** default

**Accessibility**

- Person cards are divs with role=button + tabIndex — build must add Enter/Space key activation (prototype gap).
- Each card's accessible name should combine role + people (e.g. 'Parent — Jessica Jones and James May').

**Acceptance criteria** (testable)

- [ ] (S3-AC1) Both role cards open Child select.

### S4 · Child select

**Prototype:** [open the live screen](index.html?v=0&step=child&device=phone) · `&bare=1` for chrome-free
**Purpose:** Sign children in — booked sessions plus casual sign-in for children without a booking. **Entry:** From Role select **Exit:** Stays on screen (toast per sign-in); back → S3

**Layout (top → bottom)**

1. Hub shell with back-link 'Dashboard' (returns to Role select); title 'Attendance'
2. Section 'Bookings today': 2-col grid of child cards (photo, name, session time, 'Booked Session' cyan pill, trailing 'Sign In' link)
3. Section 'No bookings': child cards with an orange 'Casual Session' pill and a trailing 'Casual Session' link

**Copy** (verbatim — ship exactly this)

| Element | Text |
|---|---|
| Back link | Dashboard |
| Title | Attendance |
| Section label 1 | Bookings today |
| Booked child 1 | Jessica Jones |
| Booked child 2 | James May |
| Session time | 12.00pm – 2.00pm |
| Booked tag | Booked Session |
| Booked action | Sign In |
| Section label 2 | No bookings |
| No-booking child | Tina Tuna |
| No-booking tag | Casual Session |
| No-booking action | Casual Session |
| Toast | {name} signed in |

**Redlines** (spec-level — exact pixels in the prototype)

| Element | Spec |
|---|---|
| Card grid | 2 columns, 24px gap; 28px between sections |
| Status pill | 24px; cyan tone for booked, orange tone for casual |
| Toast | grey-1100 pill, bottom-centred 28px up, auto-dismiss 1.6s |

**Interaction & behaviour**

- 'Sign In' on a booked child shows the toast '{name} signed in' and stays on this screen (the action stops propagation — the card itself does not navigate).
- Children without a booking carry the orange Casual Session pill and sign in via the 'Casual Session' action, with the same toast.
- The back link returns to Role select (S3) despite its 'Dashboard' label — see open questions.

**States:** default · toast:signed-in

**Accessibility**

- The toast is visual only — build needs aria-live=polite so sign-ins are announced.
- Sign In / Casual Session are text buttons nested in a role=button card — keep them independently focusable with distinct names (e.g. 'Sign in Jessica Jones').

**Acceptance criteria** (testable)

- [ ] (S4-AC1) Booked and no-booking children are visually distinct.
- [ ] (S4-AC2) Signing a child in confirms with a toast and stays on the screen.

### S5 · Educator — start shift

**Prototype:** [open the live screen](index.html?v=0&step=educator&device=phone) · `&bare=1` for chrome-free
**Purpose:** Educator lands here after login to manage their shift: end it or resume it. **Entry:** From a successful login on the educator journey **Exit:** → S1 via End Shift or Resume Shift; back → S1

**Layout (top → bottom)**

1. Hub shell with back-link 'Dashboard'; title 'Welcome Educator'; body vertically centred
2. Panel (max 810px): date line · large clock · shift progress bar (6:00am → 6:00pm, ~40% elapsed)
3. Two action cards side by side: End Shift (danger tile) · Resume Shift (solid teal tile)

**Copy** (verbatim — ship exactly this)

| Element | Text |
|---|---|
| Back link | Dashboard |
| Title | Welcome Educator |
| Date | Friday, 1 May |
| Clock | 10:48 AM |
| Shift bar — start | 6:00am |
| Shift bar — end | 6:00pm |
| Card 1 | End Shift |
| Card 1 — sub | +All day |
| Card 2 | Resume Shift |
| Card 2 — sub | 7h 12m till end of shift |

**Redlines** (spec-level — exact pixels in the prototype)

| Element | Spec |
|---|---|
| Clock | 40px, weight 700, action-primary |
| Shift bar | 11px track (grey-300), teal fill to 40%, 15px white knob with 3px teal ring |
| End Shift tile | surface-orange fill / orange-900 glyph |

**Interaction & behaviour**

- End Shift and Resume Shift both return to the Dashboard in the prototype — real confirmation/rota behaviour is an open question.
- Date, clock and shift progress are static demo values.

**States:** default

**Accessibility**

- The shift progress bar needs role=progressbar with aria-valuenow/min/max in build.
- End Shift is a destructive action — confirm whether it needs a confirmation step on a shared kiosk.

**Acceptance criteria** (testable)

- [ ] (S5-AC1) Both shift actions return to the Dashboard.

### S6 · Educator — no shift (empty state)

**Prototype:** [open the live screen](index.html?v=0&step=educator-noshift&device=phone) · `&bare=1` for chrome-free
**Purpose:** Empty state when the logged-in educator has no shift configured in rostering. **Entry:** Shown instead of S5 when the roster has no shift for the educator (prototype: reachable via the jump rail only — see open questions) **Exit:** Back → S1

**Layout (top → bottom)**

1. Hub shell with back-link 'Dashboard'; title 'Welcome Educator'; body vertically centred
2. 464px centred panel: heading · inline SVG illustration (roster card) · helper paragraph; no primary action

**Copy** (verbatim — ship exactly this)

| Element | Text |
|---|---|
| Back link | Dashboard |
| Title | Welcome Educator |
| Heading | No shifts to begin |
| Helper | To start a shift, make sure your centre administrator has one configured in the rostering. |

**Redlines** (spec-level — exact pixels in the prototype)

| Element | Spec |
|---|---|
| Panel | 464px wide, 48px padding, centred text |
| Illustration | 120×96 inline SVG, token-coloured (no image asset) |

**Interaction & behaviour**

- Terminal empty state — the only exit is the back link to the Dashboard.
- In the prototype this screen is reached via the left jump rail; the real Hub must branch here from login when the roster lookup returns no shift.

**States:** empty:no-shift

**Accessibility**

- The illustration is decorative — aria-hidden.
- The helper text carries the recovery instruction; keep it programmatically associated with the heading.

**Acceptance criteria** (testable)

- [ ] (S6-AC1) The empty state offers no shift actions.

### S7 · Visitor log

**Prototype:** [open the live screen](index.html?v=0&step=visitor&device=phone) · `&bare=1` for chrome-free
**Purpose:** Log of today's visitors: sign a new visitor in, or sign an existing one out. **Entry:** From the Dashboard (Visitor log) — no login required **Exit:** → S8 via the Sign in card; back → S1

**Layout (top → bottom)**

1. Hub shell with back-link 'Dashboard'; title 'Visitor Log'
2. Full-width action card: Sign in — New visitor (solid teal tile)
3. Section label 'Afternoon' over a stacked list of visitor rows (initials tile, name, 'Signed in {time}', Sign out link)

**Copy** (verbatim — ship exactly this)

| Element | Text |
|---|---|
| Back link | Dashboard |
| Title | Visitor Log |
| Action card | Sign in |
| Action card — sub | New visitor |
| Section label | Afternoon |
| Visitor 1 | William Walker |
| Visitor 2 | Sussan Boale |
| Visitor 3 | James David |
| Row sub | Signed in 12:54 PM |
| Row action | Sign out |
| Toast | {name} signed out |

**Redlines** (spec-level — exact pixels in the prototype)

| Element | Spec |
|---|---|
| Visitor row | 18px 24px padding; 48px initials tile at --sd-radius-m |
| List gap | 16px between rows; 28px below the Sign in card |

**Interaction & behaviour**

- Sign out removes the visitor's row immediately and shows the toast '{name} signed out'.
- The Sign in card opens the New Visitor form (S8).
- Signing out every visitor leaves the 'Afternoon' section empty — no designed empty state (see open questions). The list resets when a journey relaunches.

**States:** default (3 visitors) · toast:signed-out · empty:all-signed-out (undesigned)

**Accessibility**

- Each Sign out needs a distinct accessible name ('Sign out William Walker').
- Row removal + toast must be announced (aria-live=polite).

**Acceptance criteria** (testable)

- [ ] (S7-AC1) Sign out removes the row and confirms with a toast.
- [ ] (S7-AC2) The Sign in card opens the New Visitor form.

### S8 · New visitor

**Prototype:** [open the live screen](index.html?v=0&step=newvisitor&device=phone) · `&bare=1` for chrome-free
**Purpose:** Capture a new visitor's details and sign them in. **Entry:** From the Visitor log (Sign in — New visitor) **Exit:** → S7 via Sign in; back → S7

**Layout (top → bottom)**

1. Hub shell with back-link 'Dashboard' (returns to the Visitor log); title 'New Visitor'
2. Full-width panel: First Name + Last Name side by side · Phone Number · Address · Reason for Visit (textarea) · full-width Sign in button

**Copy** (verbatim — ship exactly this)

| Element | Text |
|---|---|
| Back link | Dashboard |
| Title | New Visitor |
| Field — label | First Name |
| Field — placeholder | Please enter first name |
| Field — label | Last Name |
| Field — placeholder | Please enter last name |
| Field — label | Phone Number |
| Field — placeholder | Please enter phone number |
| Field — label | Address |
| Field — placeholder | Where you live? |
| Field — label | Reason for Visit |
| Field — placeholder | Why you here? |
| Button | Sign in |

**Redlines** (spec-level — exact pixels in the prototype)

| Element | Spec |
|---|---|
| Name row | 2 columns, 24px gap; 24px between field rows |
| Textarea | min-height 96px, no resize handle |
| Sign in button | 48px full-width pill |

**Interaction & behaviour**

- Sign in returns to the Visitor log (S7). The prototype performs no field validation and does not append the visitor to the list — see open questions.
- Form values reset when a journey relaunches.
- The 'Where you live?' / 'Why you here?' placeholders are carried verbatim from the Figma — flag for a copy review before build.

**States:** default (empty form) · filled

**Accessibility**

- Each field's floating label is its programmatic label — keep the <label> association.
- Visitor details are personal information on a shared kiosk — do not echo them back on screen after submission, and confirm the retention policy with engineering before build.

**Acceptance criteria** (testable)

- [ ] (S8-AC1) Sign in returns to the Visitor log.
- [ ] (S8-AC2) The form resets between journeys.

## 4. State & edge matrix

| State | Trigger | Screen(s) | UI | Copy | Recovery | Prototype |
|---|---|---|---|---|---|---|
| `error-required` | Login with an empty email or password | S2 | inline error under the fields + danger field border/label | Required | Fill the field and retry | [open](index.html?v=0&step=signin&device=phone) |
| `empty-no-shift` | Educator logs in with no shift configured in rostering | S6 | centred panel: heading + illustration + helper, no primary action | No shifts to begin — To start a shift, make sure your centre administrator has one configured in the rostering. | Back to Dashboard; administrator configures a shift | [open](index.html?v=0&step=educator-noshift&device=phone) |
| `empty-visitor-list` | Every visitor signed out | S7 | section label with an empty list (undesigned) | Afternoon | Sign a new visitor in | [open](index.html?v=0&step=visitor&device=phone) |

## 5. Platform deltas

| Area | web |
|---|---|
| Surface | Fixed landscape tablet kiosk, 1103×768 logical px; prototype and this handoff are web-only |

## 6. Open questions

| Question | Owner | Due | Status |
|---|---|---|---|
| S6 (no shift) has no in-flow trigger in the prototype (jump-rail only) — the real Hub must branch S2 → S6 on the roster lookup after educator login. Confirm the branching rule. | Sam Weinhandl | 2026-07-17 | open |
| The prototype routes login by the active journey (parent vs educator launcher). The real Hub has one login — role must come from the account. Confirm role detection. | Sam Weinhandl | 2026-07-17 | open |
| S4/S8 back-links are labelled 'Dashboard' but return one step (Role select / Visitor log). Confirm label vs target. | Sam Weinhandl | 2026-07-17 | open |
| New visitor form ships with no validation and doesn't append to the visitor list — define required fields and the post-submit state. | Sam Weinhandl | 2026-07-17 | open |
| Visitor log has no designed empty state once everyone signs out — design or accept the bare section label. | Sam Weinhandl | 2026-07-17 | open |
| End Shift is destructive on a shared kiosk with no confirmation — confirm whether it needs one. | Sam Weinhandl | 2026-07-17 | open |
| hub-field uses a notched floating label (per the Figma) while the shipped ds-input uses an outside label — reconcile before build. | Sam Weinhandl | 2026-07-17 | open |

## 7. Changelog

| Version | Date | Change |
|---|---|---|
| 0.1 | 2026-07-05 | Initial handoff: 8 screens across three journeys (parent/contact attendance, educator shift, visitor log), incl. the no-shift empty state and the sign-in Required error. |
