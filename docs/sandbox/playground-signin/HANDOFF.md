# Playground Sign-in — Developer Handoff

> **Build from this, not from Figma.** The runnable prototype is the source of truth for
> pixels; this spec is the contract for behaviour, states, tokens, redlines, a11y, and
> acceptance. Pixel-exact values: open the deep-link and inspect in the browser.

<!-- GENERATED from handoff.source.json by scripts/build-handoff.mjs — do not edit by hand. -->

| | |
|---|---|
| **Status** | Draft |
| **Version** | 0.1 — 2026-06-21 |
| **Approved direction** | Centred classic (`v=1`) |
| **Prototype** | [`index.html`](index.html) |
| **Devices** | phone · ipad |
| **Platforms** | ios · android |
| **Owner** | Sam Weinhandl |
| **Agent export** | [`handover/manifest.json`](handover/manifest.json) |

## 0. At a glance

The Playground educator sign-in journey: service login → educator select → PIN → room select → room hub, plus the returning-educator (same-day) path. This is the native rebuild's foundational auth flow. The documented direction is Centred classic (v=1): white surface, centred column, teal 'P' emblem, on real Stardust --sd-* tokens. 'Done' = a returning educator reaches their room hub in under four taps and every error state recovers without a dead end. Exact pixels live in the runnable prototype — each screen links to its state.

## 1. Scope & flow map

| ID | Screen | Purpose | Prototype |
|---|---|---|---|
| S1 | Service sign-in | Authenticate the device to a childcare service. | [open](index.html?v=1&step=service&device=phone) |
| S2 | Educator select | Choose which educator is signing in to this service. | [open](index.html?v=1&step=educators&device=phone) |
| S3 | Add educator profile | Sign in a new educator profile not yet in the list. | [open](index.html?v=1&step=addEducator&device=phone) |
| S4 | PIN entry | Verify the selected educator with a 4-digit PIN. | [open](index.html?v=1&step=pin&device=phone) |
| S5 | Room select | Choose the room the educator is working in today. | [open](index.html?v=1&step=rooms&device=phone) |
| S6 | Welcome back (same-day) | Fast-path a returning educator straight to their remembered room. | [open](index.html?v=1&step=sameday&device=phone) |

**Route map**

```
entries: cold-start (service), service-signed-in (educators), returning (sameday)
S1 --(submit:valid)--> S2
S1 --(submit:invalid)--> e-creds
S2 --(select:educator)--> S4
S2 --(tap:add-educator)--> S3
S3 --(submit:valid)--> S5
S4 --(pin:correct)--> S5
S4 --(pin:locked)--> e-locked
S5 --(tap:continue)--> room-hub
S6 --(tap:continue)--> room-hub
exits: room-hub
```

**Out of scope**

- Room Hub screen itself (Phase 3 — separate spec); this flow ends by routing into it
- Account creation / self-service password reset (admin-managed)
- Offline sync + token-refresh internals (handled by the offline architecture, Phase 1)

## 2. Global foundations

| Component | DS ver | Status | Variants | Notes |
|---|---|---|---|---|
| `ds-input` | current | extend | with-leading-icon, with-trailing-toggle | 52px tall, radius-lg, 1px grey-500 border; needs leading-icon (username) + trailing password-reveal toggle slots |
| `ds-btn` | current | reuse | primary, ghost | primary full-width 52px; loading state shows spinner + 'Signing in…' |
| `ds-card` | current | extend | selectable | educator rows + room rows; room rows carry a ratio badge and a selected (green) treatment |
| `ds-avatar` | current | reuse | initials, photo | educator list avatars |
| `ds-selection-pill` | current | reuse | — | educator sort: Recent / Name |
| `ds-message-box` | current | extend | inline-warning | inline Alert banner (offline / closed-room) with optional action link |
| `ds-pin-keypad` | — | build | — | NET-NEW: 4-digit PIN dots + on-screen numeric keypad with delete; auto-submits on the 4th digit. No system keyboard. |
| `ds-state-panel` | — | build | error, empty | NET-NEW: centred blocking/empty state — icon circle + title + body + optional secondary action. Used by app-disabled, no-access, no-rooms, lockout, bootstrap-failed. |

## 3. Screen specs

### S1 · Service sign-in

**Prototype:** [open the live screen](index.html?v=1&step=service&device=phone) · `&bare=1` for chrome-free
**Purpose:** Authenticate the device to a childcare service. **Entry:** Cold start / after logout **Exit:** → S2 Educator select on success; inline error on failure (see e-creds)

**Layout (top → bottom)**

1. Centred column on white surface, max-width ~320
2. Teal 'P' emblem (62px)
3. Heading + subtitle (centred)
4. Service username field → Service password field
5. Forgot password? link (right-aligned)
6. Sign in button (full-width)
7. Terms line (centred)

**Copy** (verbatim — ship exactly this)

| Element | Text |
|---|---|
| Heading | Sign in to Playground |
| Subtitle | Sign in to your service to get started. |
| Username field label | Service username |
| Password field label | Service password |
| Forgot-password link | Forgot password? |
| Primary button | Sign in |
| Primary button (loading) | Signing in… |
| Terms line | By signing in you agree to our Terms of Service and Privacy Policy |

**Redlines** (spec-level — exact pixels in the prototype)

| Element | Spec |
|---|---|
| Field height | 52px |
| Field radius | --sd-radius-lg (16px) |
| Field border | 1px grey-500 |
| Button | 52px tall, full-width, radius-lg, teal action-primary, white text |
| Column max-width | ~320px, horizontal padding 26px |
| Emblem | 62px |

**Interaction & behaviour**

- Sign in is enabled only when both username and password are non-empty.
- Tap Sign in → ~1.15s loading state (spinner + 'Signing in…') → success routes to S2.
- Invalid credentials show the inline service error (e-creds) and keep the user on S1.
- Password field has a trailing reveal toggle (show/hide).
- Demo credentials in the prototype: username LittleBugs · password bugs123.

**States:** default · focused · filled · loading · error:e-creds

**Accessibility**

- Both inputs have visible persistent labels; focus order top→bottom.
- Password reveal toggle is a labelled button (aria-label 'Toggle password').
- Inline error is announced (role=alert); error text contrast ≥4.5:1.
- Sign in button ≥44px touch target (rendered 52px).

**Acceptance criteria** (testable)

- [ ] (S1-AC1) Sign in is disabled until both fields have content.
- [ ] (S1-AC2) Valid credentials show the loading state then route to S2.
- [ ] (S1-AC3) Invalid credentials show the inline service error and stay on S1.
- [ ] (S1-AC4) Password reveal toggle flips the field between masked and plain.

### S2 · Educator select

**Prototype:** [open the live screen](index.html?v=1&step=educators&device=phone) · `&bare=1` for chrome-free
**Purpose:** Choose which educator is signing in to this service. **Entry:** After successful service sign-in **Exit:** → S4 PIN on selecting an educator; → S3 Add educator on tapping add

**Layout (top → bottom)**

1. Header: title + subtitle, logout nav (top-left)
2. Sort pills (Recent / Name) + search field
3. Add-educator row
4. Scrollable educator list (avatar + name + role)

**Copy** (verbatim — ship exactly this)

| Element | Text |
|---|---|
| Title | Select your educator |
| Subtitle | Choose your profile to continue |
| Sort pill A | Recent |
| Sort pill B | Name |
| Empty / no-match | No educators match “<query>”. |

**Redlines** (spec-level — exact pixels in the prototype)

| Element | Spec |
|---|---|
| Educator row | card, radius-lg, avatar + name + role |
| Sort default | Recent (most-recent login) |

**Interaction & behaviour**

- Selecting an educator carries it into context and routes to S4 PIN.
- Search filters the list live; no match shows the empty line.
- Sort toggles between most-recent-login and alphabetical.
- Add-educator row opens S3.

**States:** default · loading · searching · empty:no-match · error:e-edulist

**Accessibility**

- Educator rows are buttons with accessible names (name + role); ≥44px targets.
- Sort pills expose selected state; search field has a label.

**Acceptance criteria** (testable)

- [ ] (S2-AC1) Selecting an educator routes to S4 carrying that educator.
- [ ] (S2-AC2) A search with no matches shows the no-match line.
- [ ] (S2-AC3) The add-educator row opens S3.

### S3 · Add educator profile

**Prototype:** [open the live screen](index.html?v=1&step=addEducator&device=phone) · `&bare=1` for chrome-free
**Purpose:** Sign in a new educator profile not yet in the list. **Entry:** From the add-educator row on S2 **Exit:** → S5 Room select on success; back returns to S2

**Layout (top → bottom)**

1. Header: title + subtitle, back nav
2. Email/phone field
3. Password/PIN field (reveal toggle)
4. Terms line
5. Sign in button

**Copy** (verbatim — ship exactly this)

| Element | Text |
|---|---|
| Title | Add Educator Profile |
| Subtitle | Please sign into your Educator Profile |
| Field 1 label | Educator email or phone |
| Field 1 placeholder | Email or phone number |
| Field 2 label | Password or access PIN |
| Field 2 placeholder | Password or Pin |
| Primary button | Sign in |

**Redlines** (spec-level — exact pixels in the prototype)

| Element | Spec |
|---|---|
| Fields | 52px, radius-lg |
| Button | enabled only when both fields filled |

**Interaction & behaviour**

- Sign in enabled only when both fields are non-empty.
- Password/PIN field has a reveal toggle.
- On success routes to S5 Room select.

**States:** default · filled · disabled

**Accessibility**

- Labelled inputs; reveal toggle is a labelled button; back nav is reachable.

**Acceptance criteria** (testable)

- [ ] (S3-AC1) Sign in is disabled until both fields have content.
- [ ] (S3-AC2) Successful add routes to S5.

### S4 · PIN entry

**Prototype:** [open the live screen](index.html?v=1&step=pin&device=phone) · `&bare=1` for chrome-free
**Purpose:** Verify the selected educator with a 4-digit PIN. **Entry:** After selecting an educator on S2 **Exit:** → S5 Room select (cold start) / → Room Hub (returning) on correct PIN; lockout after repeated failures (e-locked)

**Layout (top → bottom)**

1. Centred group (brand + header + dots + keypad)
2. Greeting header
3. 4 PIN dots
4. On-screen numeric keypad with delete

**Copy** (verbatim — ship exactly this)

| Element | Text |
|---|---|
| Title | Hi <FirstName> |
| Subtitle | Enter your PIN to continue |
| Incorrect-attempt message | Incorrect PIN — try again |

**Redlines** (spec-level — exact pixels in the prototype)

| Element | Spec |
|---|---|
| PIN length | 4 digits |
| Keypad | max-width 300, centred |

**Interaction & behaviour**

- PIN auto-submits once the 4th digit is entered (no submit button).
- Incorrect PIN shakes the dots and shows the incorrect-attempt message; attempts increment.
- Repeated failures lead to a locked state (e-locked).
- Demo PIN in the prototype: 1234.
- Back returns to the educator list (or same-day for returning users).

**States:** default · entering · incorrect · locked:e-locked

**Accessibility**

- Keypad keys are ≥44px labelled buttons; delete key labelled.
- PIN progress is announced; the incorrect message is announced (role=alert).
- Avoid relying on colour alone for the incorrect state (message + shake).

**Acceptance criteria** (testable)

- [ ] (S4-AC1) Entering the 4th digit auto-submits without a button.
- [ ] (S4-AC2) A correct PIN advances to S5 (cold start).
- [ ] (S4-AC3) An incorrect PIN shows the incorrect message and increments attempts.

### S5 · Room select

**Prototype:** [open the live screen](index.html?v=1&step=rooms&device=phone) · `&bare=1` for chrome-free
**Purpose:** Choose the room the educator is working in today. **Entry:** After a correct PIN (cold start) or Add educator **Exit:** → Room Hub on Continue

**Layout (top → bottom)**

1. Header: title + subtitle, back nav
2. List of room rows (name + ratio, selectable)
3. Continue button (pinned)

**Copy** (verbatim — ship exactly this)

| Element | Text |
|---|---|
| Title | Select your room |
| Subtitle | Where are you working today? |
| Button (no room selected) | Select a room |
| Button (room selected) | Continue to <Room> |

**Redlines** (spec-level — exact pixels in the prototype)

| Element | Spec |
|---|---|
| Room row | selectable card with ratio badge; selected = green treatment |
| Continue | disabled until a room is selected |

**Interaction & behaviour**

- Selecting a room enables Continue and updates its label to 'Continue to <Room>'.
- Continue routes to the Room Hub.
- A closed room shows a warning but can still be entered (see e-closed).

**States:** default · room-selected · empty:e-norooms · warning:e-closed

**Accessibility**

- Room rows are radio-like selectable buttons with names + ratio; selected state is exposed non-visually.

**Acceptance criteria** (testable)

- [ ] (S5-AC1) Continue is disabled until a room is selected.
- [ ] (S5-AC2) Continue routes to the Room Hub with the selected room in context.

### S6 · Welcome back (same-day)

**Prototype:** [open the live screen](index.html?v=1&step=sameday&device=phone) · `&bare=1` for chrome-free
**Purpose:** Fast-path a returning educator straight to their remembered room. **Entry:** Returning-educator (same-day) scenario **Exit:** → Room Hub on Continue; Change room → S5

**Layout (top → bottom)**

1. Centred group
2. Greeting (Welcome Back + name)
3. Remembered room card (selected/green)
4. Change room link
5. Continue button

**Copy** (verbatim — ship exactly this)

| Element | Text |
|---|---|
| Title | Welcome Back <Name> |
| Subtitle | Your room for today |
| Remembered note | Remembered from your last session |
| Change-room link | Change room |
| Button | Continue to <Room> |

**Redlines** (spec-level — exact pixels in the prototype)

| Element | Spec |
|---|---|
| Remembered room | selected (green) card, no needs-attention accent |

**Interaction & behaviour**

- Shows the room remembered from the last session as pre-selected.
- Continue routes to the Room Hub.
- Change room opens the full S5 list.

**States:** default

**Accessibility**

- Greeting heading receives focus on entry; Change room is a clearly labelled link.

**Acceptance criteria** (testable)

- [ ] (S6-AC1) The remembered room is pre-selected and Continue routes to the hub.
- [ ] (S6-AC2) Change room opens the full room list (S5).

## 4. State & edge matrix

| State | Trigger | Screen(s) | UI | Copy | Recovery | Prototype |
|---|---|---|---|---|---|---|
| `e-creds` | Wrong/empty service credentials | S1 | inline error on the password field | We couldn't sign in to that service, please try again. For password reset please contact the service administrator. | Re-enter credentials | [open](index.html?v=1&step=e-creds&device=phone) |
| `e-offline` | No network on service login | S1 | inline Alert banner + Retry (button disabled) | No internet connection. | Retry | [open](index.html?v=1&step=e-offline&device=phone) |
| `e-disabled` | App disabled for the service | bootstrap | blocking StatePanel | This app has been disabled for your service. Please contact your service administrator. | Back to sign in | [open](index.html?v=1&step=e-disabled&device=phone) |
| `e-noaccess` | Account lacks access to the app | bootstrap | blocking StatePanel | Your account doesn't have access to this app. Contact your service administrator to request access. | Back to sign in | [open](index.html?v=1&step=e-noaccess&device=phone) |
| `e-edulist` | Educator list failed to load | S2 | blocking StatePanel + Retry | Something went wrong loading the educator list. Check your connection and try again. | Retry | [open](index.html?v=1&step=e-edulist&device=phone) |
| `e-locked` | Too many incorrect PIN attempts | S4 | blocking StatePanel (lock glyph) | Too many incorrect attempts. Contact your service administrator to reset your PIN. | Back to sign in | [open](index.html?v=1&step=e-locked&device=phone) |
| `e-norooms` | No rooms set up for the service | S5 | empty StatePanel + Refresh | There are no rooms set up for this service yet. Contact your service administrator. | Refresh | [open](index.html?v=1&step=e-norooms&device=phone) |
| `e-closed` | Selected room is closed today | S5 | inline Alert + 'enter anyway' | <Room> is closed today. You can still enter if you need to. | Enter <Room> anyway | [open](index.html?v=1&step=e-closed&device=phone) |
| `e-password` | Educator uses password auth instead of PIN | S4 | email + password fields, 'Use PIN instead' link | Sign in with your password | Use PIN instead | [open](index.html?v=1&step=e-password&device=phone) |
| `e-bootstrap` | App failed to start / load | bootstrap | blocking StatePanel + Retry | Something went wrong while loading. Please try again. | Retry | [open](index.html?v=1&step=e-bootstrap&device=phone) |

## 5. Platform deltas

| Area | ios | android |
|---|---|---|
| Navigation | SwiftUI NavigationStack push; iPad NavigationSplitView | Jetpack Navigation Compose; equivalent back stack |
| Token consumption | Asset catalogue (colours/fonts) per Phase 0 preference | resources / Compose theme from the same token values |
| Credential storage | Keychain | EncryptedSharedPreferences |
| Password field | isSecureTextEntry + reveal toggle | inputType=textPassword + reveal toggle |
| PIN keypad | Custom on-screen keypad (no system keyboard) | Custom on-screen keypad (no system keyboard) |
| Minimum OS | iOS 17+ assumed — iOS 16 support is an OPEN question (~2,000 field devices below 17) | Per project minimum (Jetpack Compose) |

## 6. Open questions

| Question | Owner | Due | Status |
|---|---|---|---|
| 'Forgot password?' link colour is off-convention in the Centred-classic direction (purple accent-secondary vs the teal text-link convention) — normalise to teal, or add an accent-link token? | Sam | — | open |
| Confirm iOS minimum deployment target — iOS 17+ vs iOS 16 support for ~2,000 field devices (affects SwiftUI APIs). | TBD | — | open |
| Does the service step need an alternate 'passcode instead' affordance? (Only direction 4 surfaced it; Centred classic does not.) | TBD | — | open |
| PIN lockout threshold — how many incorrect attempts before e-locked, and what is the reset path? | TBD | — | open |

## 7. Changelog

| Version | Date | Change |
|---|---|---|
| 0.1 | 2026-06-21 | Initial handoff — Centred classic direction, phone + iPad, iOS + Android. |
