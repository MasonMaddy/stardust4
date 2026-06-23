# Vacation Care — Office — Developer Handoff

> **Build from this, not from Figma.** The runnable prototype is the source of truth for
> pixels; this spec is the contract for behaviour, states, tokens, redlines, a11y, and
> acceptance. Pixel-exact values: open the deep-link and inspect in the browser.

<!-- GENERATED from handoff.source.json by scripts/build-handoff.mjs — do not edit by hand. -->

| | |
|---|---|
| **Status** | In review |
| **Version** | 0.1 — 2026-06-24 |
| **Approved direction** | Office desktop (`v=0`) |
| **Prototype** | [`index.html`](index.html) |
| **Devices** | desktop |
| **Platforms** | web |
| **Owner** | Sam · **Eng:** David |
| **Agent export** | [`handover/manifest.json`](handover/manifest.json) |

## 0. At a glance

Desktop Office flow for centre staff to plan and run a Vacation Care holiday program: browse the month Calendar, manage Programs, build a program in Program Setup (days → activities → attached forms), and track per-child form completion in the Forms table. 'Done' = staff can set up a program with activity forms and see which children are missing a required form, end to end. The PES parent-facing mobile flow is a separate, later handoff.

## 1. Scope & flow map

| ID | Screen | Purpose | Prototype |
|---|---|---|---|
| S1 | Vacation Care Calendar | Month view of scheduled activities; jump into a day's forms. | [open](index.html?v=0&step=calendar&device=phone) |
| S2 | Vacation Care Programs | List, filter and manage holiday programs. | [open](index.html?v=0&step=programs&device=phone) |
| S3 | Program Setup + Form dialog | Build a program: details → per-day activities → attached forms. | [open](index.html?v=0&step=setup&device=phone) |
| S4 | Forms tracking table | Track per-child form completion for an activity and chase missing forms. | [open](index.html?v=0&step=forms&device=phone) |

**Route map**

```
entries: calendar, program-list
S1 --(switch:list)--> S2
S1 --(click:activity)--> S4
S2 --(switch:calendar)--> S1
S2 --(edit|view|add)--> S3
S2 --(delete:confirm)--> S2
S3 --(menu:add-form|edit-form)--> S3:dialog
S3 --(save)--> S2
S4 --(back)--> S1
exits: program-saved, forms-tracked
```

**Out of scope**

- Bulk CSV import wizard (stubbed in the prototype)
- PES parent-facing mobile flow (separate handoff, next)
- Publish / booking-open back-end behaviour (see open questions)
- Real file storage + parent notification delivery

## 2. Global foundations

| Component | DS ver | Status | Variants | Notes |
|---|---|---|---|---|
| `ds-btn` | 2.1 | reuse | solid, ghost, minimal, destructive | primary actions, Add, Save, Notify, Remove form (minimal+error) |
| `ds-pill` | 2.1 | reuse | minimal-green, minimal-orange, minimal-purple, minimal-grey | status (Published/Draft/Completed/Starts in N), form indicator, Received/Missing |
| `ds-selection-pill` | 2.1 | extend | selected | filters + day toggles. VC overrides: selected = solid --sd-colour-action-primary + white text (not the default mint); day toggles are 44x44 square at --sd-radius-m. Worth a DS variant decision. |
| `ds-toggle` | 2.1 | reuse | — | Mandatory-form switch in the Form dialog |
| `ds-checkbox` | 2.1 | reuse | — | Forms table row + header select |
| `ds-input` | 2.1 | extend | text, select, search | prototype uses a notched-label field/select (label sits on the top border) and a search field with a trailing circular teal button — reconcile with the shipped ds-input (56px, label-above). |
| `vc-seg-switch` | — | build | — | net-new segmented track switch (Calendar/List view), phone/tablet-switch style — grey track, selected segment raised white + teal border |
| `vc-form-dialog` | — | build | add, edit | centred modal (not the mobile bottom-sheet); needs focus management — see a11y |

## 3. Screen specs

### S1 · Vacation Care Calendar

**Prototype:** [open the live screen](index.html?v=0&step=calendar&device=phone) · `&bare=1` for chrome-free
**Purpose:** Month view of scheduled activities; jump into a day's forms. **Entry:** Vacation Care → Calendar View (default landing) **Exit:** → S2 via the List View switch; → S4 by clicking an activity chip

**Layout (top → bottom)**

1. Page head: title + Calendar/List segmented switch (right)
2. Card: month nav (‹ Month YYYY ›, Today) + 7-col Mon-start grid
3. Day cell: date number, activity chips (name, booked/capacity, optional 'N forms missing' in error red); program week is tinted

**Copy** (verbatim — ship exactly this)

| Element | Text |
|---|---|
| Title | Vacation Care Calendar |
| Switch | Calendar View / List View |
| Today button | Today |
| Chip — missing forms | {n} forms missing |

**Redlines** (spec-level — exact pixels in the prototype)

| Element | Spec |
|---|---|
| Day cell min-height | 96px |
| Month nav button | 36px circle, teal outline |
| Activity chip radius | 7px |

**Interaction & behaviour**

- Grid is Monday-start; leading blanks computed from the 1st weekday.
- ‹ / › move month within Jan 2025 – Dec 2027 (chevrons disable at the bounds).
- Today returns to the demo data month (March 2026); activities render only there in the prototype.
- Clicking an activity chip opens that activity's Forms table (S4).

**States:** default (March 2026 with activities) · empty month · month-nav min bound · month-nav max bound

**Accessibility**

- Month-nav and Today are buttons with accessible names.
- Activity chips are buttons; needs a visible focus ring (gap A5).
- 'forms missing' must not rely on colour alone — keep the text.

**Acceptance criteria** (testable)

- [ ] (S1-AC1) Month navigation is bounded to 2025–2027.
- [ ] (S1-AC2) Activities only show in the data month.
- [ ] (S1-AC3) Clicking an activity opens its Forms table.

### S2 · Vacation Care Programs

**Prototype:** [open the live screen](index.html?v=0&step=programs&device=phone) · `&bare=1` for chrome-free
**Purpose:** List, filter and manage holiday programs. **Entry:** Vacation Care → Program list, or the List View switch **Exit:** → S3 via Edit / View / + Add; delete via confirm dialog

**Layout (top → bottom)**

1. Page head: title + Calendar/List segmented switch
2. Row: full-width Search (trailing teal circle) + status filters (All/Published/Draft/Completed)
3. Program card: name, dates · duration, status pills, row actions (View if published · Edit · Duplicate · Delete)
4. Bottom-right: + Add

**Copy** (verbatim — ship exactly this)

| Element | Text |
|---|---|
| Title | Vacation Care Programs |
| Search placeholder | Search |
| Filters | All (n) / Published (n) / Draft (n) / Completed (n) |
| Add button | Add |

**Redlines** (spec-level — exact pixels in the prototype)

| Element | Spec |
|---|---|
| Filter pill height | 44px; selected = solid action-primary + white |
| Row action button | 52px square, --sd-radius-lg, teal outline |
| Search field height | 52px; trailing circle 40px |

**Interaction & behaviour**

- Filters narrow the list by status; counts reflect the data set.
- Edit / + Add open Program Setup (S3); View opens S3 read-only for published programs.
- Duplicate clones the program as a draft copy (toast).
- Delete opens a confirm dialog warning if the program is published / may have live bookings.

**States:** default · filter:published · filter:draft · filter:completed · empty filter result · delete-confirm

**Accessibility**

- Row-action icon buttons have aria-labels (View/Edit/Duplicate/Delete program).
- Filters are buttons; selected conveyed by more than colour (text + count remain).
- Confirm dialog needs focus management (gap A3).

**Acceptance criteria** (testable)

- [ ] (S2-AC1) Status filters narrow the list and show counts.
- [ ] (S2-AC2) Delete always routes through a confirm dialog.
- [ ] (S2-AC3) View action appears only for published programs.

### S3 · Program Setup + Form dialog

**Prototype:** [open the live screen](index.html?v=0&step=setup&device=phone) · `&bare=1` for chrome-free
**Purpose:** Build a program: details → per-day activities → attached forms. **Entry:** From S2 (Edit / View / + Add) **Exit:** Save → back to S2; Form dialog overlays this screen

**Layout (top → bottom)**

1. Back link + title + Save
2. Program Details card: Program Name, Number of weeks, Holiday start date, Parent booking opens
3. Week card: day toggles (M T W T F S S, square) + Clear days; per active day a title row (day name + form indicator pill(s)) then activity rows
4. Activity row: Name / Fee / Room / ⋯ (48px outlined)
5. Form dialog (centred modal): Form name, Form upload (drag/drop document or Browse), Mandatory toggle + helper, footer Remove form (edit) · Cancel · Save

**Copy** (verbatim — ship exactly this)

| Element | Text |
|---|---|
| Title | Program Setup |
| Back link | ‹ Back to all Programs |
| Activity name placeholder | Name of Activity |
| Add activity link | + Add activity |
| Row menu — no form | Add form · Duplicate · Delete |
| Row menu — has form | Edit form · Remove form · Duplicate · Delete |
| Form dialog title | Add form / Edit form |
| Mandatory helper | Parents must complete this form before their booking for the activity is confirmed. |
| Upload prompt | Drag and drop a document here · Accepted: PDF, DOC, DOCX · max 10 MB |

**Redlines** (spec-level — exact pixels in the prototype)

| Element | Spec |
|---|---|
| Day toggle | 44x44 square, --sd-radius-m; selected solid action-primary |
| Field / select height | 48px; notched label on the top border |
| Activity ⋯ button | 48px square, --sd-radius-lg, teal outline |
| Form dialog width | 480px, centred, --sd-radius-lg |

**Interaction & behaviour**

- Day toggles add/remove that day's activity block.
- Activity ⋯ menu is contextual: no form → Add form; has form → Edit form + Remove form.
- Add/Edit form opens the dialog; Edit pre-fills name, file and mandatory state.
- Remove form (menu or dialog) detaches the form (toast).
- The form indicator pill ('Form' / 'Form · required') sits beside the day title.
- Save returns to S2 (prototype shows a toast; real publish behaviour TBD).

**States:** default · menu:no-form · menu:has-form · dialog:add · dialog:edit · dialog:file-attached

**Accessibility**

- Form dialog must move focus in on open, trap focus, close on Esc, and restore focus on close (gap A3).
- Back link and + Add activity must be real buttons/links, keyboard-operable (gap A2).
- Mandatory toggle is role=switch with an accessible name.

**Acceptance criteria** (testable)

- [ ] (S3-AC1) Row menu is contextual to whether a form is attached.
- [ ] (S3-AC2) Edit form opens the dialog pre-filled.
- [ ] (S3-AC3) Remove form detaches the form from the activity.
- [ ] (S3-AC4) Save is disabled until the form has a name.

### S4 · Forms tracking table

**Prototype:** [open the live screen](index.html?v=0&step=forms&device=phone) · `&bare=1` for chrome-free
**Purpose:** Track per-child form completion for an activity and chase missing forms. **Entry:** From a Calendar activity chip (S1) **Exit:** Back to Calendar View

**Layout (top → bottom)**

1. Back link + activity title + date + Notify missing forms (n)
2. Search (trailing teal circle) + status filters (All/Received/Missing)
3. Table: select · Actions (view, send reminder) · Child's first/last name · Primary carer · Form name · Attached by · Status · Upload date

**Copy** (verbatim — ship exactly this)

| Element | Text |
|---|---|
| Back link | ‹ Back to Calendar View |
| Notify button | Notify missing forms ({n}) |
| Columns | Child’s first name · Child’s last name · Primary carer · Form name · Attached by · Status · Upload date |
| Status | Received / Missing |

**Redlines** (spec-level — exact pixels in the prototype)

| Element | Spec |
|---|---|
| Row padding | 14px 16px |
| Action button | 32px, teal outline |

**Interaction & behaviour**

- Status filter narrows rows to All / Received / Missing.
- Missing rows show '—' for Attached by and Upload date (nothing attached).
- Notify sends a reminder; toast confirms the count.
- Per-row send-reminder is available; bulk-select ↔ Notify scope is an open question.

**States:** default · filter:received · filter:missing · rows-selected · empty filter result

**Accessibility**

- Row checkboxes + header select-all have accessible names.
- Action icon buttons (View form / Send reminder) have aria-labels.
- Status is text, not colour alone.

**Acceptance criteria** (testable)

- [ ] (S4-AC1) Missing rows never show an 'Attached by' name.
- [ ] (S4-AC2) Notify count equals the number of missing rows.
- [ ] (S4-AC3) Status filter narrows the table.

## 4. State & edge matrix

| State | Trigger | Screen(s) | UI | Copy | Recovery | Prototype |
|---|---|---|---|---|---|---|
| `delete-confirm` | Delete a program | S2 | centred alertdialog | <Program> will be permanently deleted. (published → may have live bookings.) This can’t be undone. | Cancel | [open](index.html?v=0&step=programs&device=phone) |
| `form-dialog` | Add/Edit form on an activity | S3 | centred modal | Add form / Edit form — name, upload, mandatory | Cancel / Esc | [open](index.html?v=0&step=setup&device=phone) |
| `empty-filter` | Filter with no matches | S2, S4 | inline empty message | No programs in this view. | Change filter | [open](index.html?v=0&step=programs&device=phone) |

## 5. Platform deltas

| Area | web |
|---|---|
| Surface | Desktop Office portal (1280+), left nav + top bar |
| Form upload | Drag-and-drop + Browse (PDF/DOC/DOCX) |

## 6. Open questions

| Question | Owner | Due | Status |
|---|---|---|---|
| Program Setup has no Publish action — what flips Draft→Published and opens parent bookings? (audit U1) | David | 2026-06-30 | open |
| 'Number of weeks' doesn't yet render Week 2…N — confirm multi-week behaviour. (audit U2) | Sam | 2026-06-30 | open |
| Forms table: does Notify act on selected rows or all-missing? Need a bulk-action bar. (audit U3) | Sam | 2026-06-30 | open |
| Keyboard a11y: nav items + links must be focusable, dialog needs focus trap/Esc. (audit A1–A3) | David | 2026-06-30 | open |
| ds-selection-pill: ship a solid-green selected variant + a square day-toggle variant, or keep as prototype overrides? | Sam | 2026-06-30 | open |

## 7. Changelog

| Version | Date | Change |
|---|---|---|
| 0.1 | 2026-06-24 | Initial Office handoff (Calendar, Programs, Setup + Form dialog, Forms table). |
