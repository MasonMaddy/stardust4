# Error & empty states — the gallery scenario

Edge/empty/error states rarely sit on a happy path, so they're awkward to reach by clicking. The
cleanest way to make the whole surface reviewable is a dedicated **gallery scenario** — and because
the prototype themes by direction, each state should re-theme across every direction for free.

## The pattern

1. **One scenario, gallery entry.** Add a scenario (e.g. a 4th `ds-btn--ghost` launcher
   "Error states") whose entry step is `gallery`. `goScenario('errors')` sets `step='gallery'` and —
   since it isn't a sign-in flow — skips the launch splash.

2. **A neutral gallery list.** `gallery` renders a device-agnostic picker (a plain list on phone, a
   2-col grid on tablet via a `big` flag) of every state — label + one-line sub + chevron. Drive it
   from a single `ERROR_STATES = [{ step, label, sub }]` array so the list and the routing share one
   source of truth. Derive an `isErrorView(step)` helper from it.

3. **Each state is an `e-*` step in the SAME builder.** Handle `e-creds`, `e-offline`, `e-disabled`,
   … inside `buildStep(step, ctx)` (and the tablet `iCfg`) exactly like happy-path steps — returning
   `{ title, children, footer, nav, center?, noBrand? }`. They route through the per-direction
   `Shell`/`IShell`, so they inherit each direction's visual language automatically. **Exclude error
   views from any animated path** (e.g. an animated hero/sheet direction) — they're static gallery
   views, no transition needed.

4. **Two shared primitives, both `dark`-aware:**
   - `Alert` — inline banner (offline / closed-room warning): icon + text + optional action link.
   - `StatePanel` — centred blocking/empty state: an icon circle (text glyph / asset / custom SVG
     `node`) + title + body + optional secondary link. Give it a `big` flag so the tablet path reuses
     the same component at scale instead of a parallel copy.

5. **`noBrand` for blocking panels.** Centred state panels pass `noBrand: true`; each shell then skips
   the brand emblem/logo so it isn't floating above the error icon. Field-flavoured states
   (wrong-credentials, offline, password) **keep** the normal login header — there the brand reads as
   a screen title, not a duplicate. (Thread `noBrand` through every shell's destructure, like `center`.)

6. **Back/primary actions return to the gallery.** `nav: 'back'`, `onNav: () => setStep('gallery')`;
   primary buttons ("Back to sign in" / "Retry") also go to the gallery. **Switching direction while
   viewing a state should KEEP the current step and just re-theme** — special-case the direction
   picker for the errors scenario (`setVariant(n)` only) instead of resetting to the entry step, so
   you can flip through directions to see one state themed in each.

## Sourcing the state list

Mine the PRD's "error & system states" matrix (e.g. a login PRD §9): no-network, invalid credentials,
no-access/forbidden, app-disabled, PIN incorrect/locked, educator-list-failed, no-rooms, room-closed,
auth-invalid. Add product-specific branches (e.g. educator password-auth, bootstrap-failed). Each row
→ one `e-*` step + one `ERROR_STATES` entry. Confirm the exact set with the user at the scope gate
(the matrix can be large; you don't always want all of it).

## Honesty

The gallery is **demo chrome** that lists states — it is not a screen in the shipped product. Say so
in the handoff summary so it isn't mistaken for a real menu.
