# Vacation Care — Office · UX audit

Heuristic review of the desktop prototype (`docs/sandbox/vacation-care/`), run before dev handover.
Severity: 🔴 Critical · 🟠 Major · 🟡 Minor. "Fix" column = where it should be addressed.

> Captured for review. Nothing in here has been changed in the prototype yet — Sam to triage,
> then fold the agreed items into the handover spec.

---

## Strengths (preserve)
- The **forms loop** is coherent end-to-end: attach in Setup → "forms missing" on the Calendar →
  per-child Received/Missing in the table → Notify. The contextual **Add/Edit form** menu answers the
  original "Manage Form" question without ambiguity.
- Status is **never colour-only** — every pill has a text label.
- **Program delete** has a confirmation that warns about live bookings.
- Real `--sd-*` tokens / `ds-*` components throughout; missing rows correctly show "—" for *Attached by*.

## Usability
| # | Severity | Finding | Recommendation | Fix |
|---|---|---|---|---|
| U1 | 🟠 Major | **No Publish action** in Program Setup — only Save. A "Parent booking opens" date exists but nothing flips Draft→Published / opens bookings. | Add explicit **Publish** + **Save draft** in the Setup header; define what Publish does (validation, opens bookings, notifies). | Spec |
| U2 | 🟠 Major | **"Number of weeks" doesn't drive the form** — shows "2 weeks" but only Week 1 renders. | Render Week 2…N from the control, or state the proto limitation. | Spec (+ proto if time) |
| U3 | 🟠 Major | **Forms table: bulk-select ↔ "Notify missing forms" is ambiguous** — row checkboxes have no visible bulk action; unclear if Notify targets selected or all-missing. | Define **Notify selected** vs **Notify all missing**; show a bulk action bar when rows are checked. | Spec |
| U4 | 🟡 Minor | **Delete activity row is instant** (no confirm/undo), unlike program delete. | Undo toast or confirm. | Spec |
| U5 | 🟡 Minor | **No busy/disabled state** on Save / Notify; only a success toast. | Add loading + disabled-while-pending. | Spec |
| U6 | 🟡 Minor | **"Today" jumps to March 2026** (the demo data month), not the real current month. | Acceptable for the demo; note it's a prototype convenience. | Note only |

## Accessibility (WCAG 2.1 AA)
| # | Severity | Finding | WCAG | Required fix |
|---|---|---|---|---|
| A1 | 🔴 Critical | **Left-nav items are non-focusable `<div>`s** — keyboard users can't reach navigation. | 2.1.1 Keyboard | Render as `<button>`/`<a>` with focus styles. |
| A2 | 🟠 Major | **"Back to all Programs" / "+ Add activity" are `<a>` with no `href`** — not keyboard-operable. | 2.1.1 | Real `<button>`s. |
| A3 | 🟠 Major | **Form dialog doesn't manage focus** — focus stays on `<body>` on open; no focus trap; no Esc-to-close. | 2.4.3 / 4.1.2 | Move focus in on open, trap, restore on close, Esc closes. |
| A4 | 🟡 Minor | **Search inputs have no programmatic label** (placeholder only). | 3.3.2 / 4.1.2 | `aria-label` / visible label. |
| A5 | 🟡 Minor | **Custom controls lack a visible keyboard focus ring** (SegSwitch, IconBtn, search circle, nav). Hover glow was intentionally removed; keyboard focus still needs a ring. | 2.4.7 | Add `:focus-visible` rings. |
| A6 | 🟡 Minor | **Verify contrast** of "Starts in X days" (orange-on-subtle) and red "forms missing" on the cyan cell. | 1.4.3 | Confirm ≥ 4.5:1; adjust token if short. |

## Improvement opportunities
- Calendar capacity as a small **progress bar**, not just "43/50".
- Forms table: **sortable columns + row count / pagination**.
- Show the **form indicator on every calendar activity** that has a form, not only the one with missing forms.
- Note (org/compliance): forms carry **children's personal data** — privacy review (AU Privacy Act) on the upload + Notify behaviour before build.

---

### Suggested triage for handover
- **Build-blocking design decisions → into the spec:** U1, U2, U3, A1–A3.
- **Polish → spec backlog:** U4, U5, A4–A6, all opportunities.
- **No action:** U6.
