# Playground Sign-in — Developer Handoff

> **Build from this, not from Figma.** The runnable prototype is the source of truth for
> pixels; this spec is the contract for behaviour, states, tokens, redlines, a11y, and
> acceptance. Pixel-exact values: open the deep-link and inspect in the browser.

<!-- GENERATED from handoff.source.json by scripts/build-handoff.mjs — do not edit by hand. -->

| | |
|---|---|
| **Status** | Draft |
| **Version** | 0.2 — 2026-06-23 |
| **Approved direction** | Playful tall-scene (`v=3`) |
| **Prototype** | [`version-0.2/index.html`](version-0.2/index.html) |
| **Devices** | phone · ipad |
| **Platforms** | ios · android |
| **Owner** | Sam Weinhandl |
| **Agent export** | [`handover/manifest.json`](handover/manifest.json) |

## 0. At a glance

The Playground educator sign-in journey for a SHARED ROOM TABLET: service login → educator select → PIN → room select → room hub, plus the returning-educator (same-day) path. The chosen, locked direction is Playful tall-scene: a full-bleed teal hero (kid-friendly drifting scene) over a white sheet, on real Stardust --sd-* tokens. The hero brand mark swaps with progress — Playground 'P' (service) → the service's logo, e.g. Little Bugs (educator select) → the signing-in educator's photo (PIN / room / same-day). Because the device is shared, identity safety is first-class: Switch educator and Log out are always reachable, and the session idle-locks after ~30s on the hub (PIN re-auth). 'Done' = a returning educator reaches their room hub in under four taps, no error state dead-ends, and a tablet left unattended cannot be acted on as the signed-in educator. Exact pixels live in the runnable prototype — each screen links to its live state (append &bare=1 for a chrome-free frame).

## 1. Scope & flow map

| ID | Screen | Purpose | Prototype |
|---|---|---|---|
| S1 | Service sign-in | Authenticate the device to a childcare service. | [open](version-0.2/index.html?v=3&step=service&device=phone) |
| S2 | Educator select | Choose which educator is signing in to this service. | [open](version-0.2/index.html?v=3&step=educators&device=phone) |
| S3 | Add educator profile | Sign in a new educator profile not yet in the list. | [open](version-0.2/index.html?v=3&step=addEducator&device=phone) |
| S4 | PIN entry | Verify the selected educator with a 4-digit PIN. | [open](version-0.2/index.html?v=3&step=pin&device=phone) |
| S5 | Room select | Choose the room the educator is working in today. | [open](version-0.2/index.html?v=3&step=rooms&device=phone) |
| S6 | Welcome back (same-day) | Fast-path a returning educator to their remembered room — with shared-device escape hatches. | [open](version-0.2/index.html?v=3&step=sameday&device=phone) |
| S7 | Educator password (PIN fallback) | Let an educator sign in with a password when they can't use their PIN. | [open](version-0.2/index.html?v=3&step=edupass&device=phone) |

**Route map**

```
entries: cold-start (service), service-signed-in (educators), returning (sameday)
S1 --(submit:valid)--> S2
S1 --(submit:invalid)--> e-creds
S2 --(select:educator)--> S4
S2 --(tap:add-educator)--> S3
S3 --(submit:valid)--> S5
S4 --(pin:correct)--> S5
S4 --(pin:5-fails)--> e-locked
S4 --(tap:use-password)--> S7
S7 --(submit:valid)--> S5
S7 --(tap:use-pin)--> S4
S5 --(tap:continue)--> room-hub
S6 --(tap:continue)--> S4
S6 --(tap:switch-educator)--> S2
room-hub --(idle:30s)--> e-lock
room-hub --(tap:switch-educator)--> S2
e-lock --(pin:correct)--> room-hub
exits: room-hub
```

**Out of scope**

- Room Hub screen itself (Phase 3 — separate spec); this flow ends by routing into it
- Account creation / self-service password reset (admin-managed)
- Offline sync + token-refresh internals (handled by the offline architecture, Phase 1)
- Final educator photos / service logos — the prototype uses swappable placeholder images (pravatar / loremflickr / a 'Little Bugs' crest)

## 2. Global foundations

| Component | DS ver | Status | Variants | Notes |
|---|---|---|---|---|
| `ds-input` | current | extend | with-leading-icon, with-trailing-toggle | 52px tall, radius-lg, 1px grey-500 border; leading-icon (username) + trailing password-reveal toggle slots |
| `ds-btn` | current | reuse | primary, ghost, outline | primary full-width 52px; loading state shows spinner + 'Signing in…'; outline used for Change room / Switch educator |
| `ds-card` | current | extend | selectable, with-thumbnail | educator rows (photo + name + last-login) and room rows (photo thumbnail + ratio badge + selected/green, needs-attention amber accent, disabled/closed) |
| `ds-avatar` | current | extend | photo, initials-fallback | educator avatars are photo-first with a graceful initials fallback if the image fails to load |
| `ds-selection-pill` | current | reuse | — | educator sort: Recent / Name |
| `ds-message-box` | current | extend | inline-warning, inline-error | inline Alert banner (offline / closed-room) with optional action link |
| `ds-pin-keypad` | — | build | circular-keys | NET-NEW: 4 PIN dots (ring→filled) + circular on-screen numeric keypad with delete; auto-submits on the 4th digit. No system keyboard. Reused by the idle screen-lock. |
| `ds-state-panel` | — | build | error, empty | NET-NEW: centred blocking/empty state — icon circle + title + body + optional secondary action. Used by app-disabled, no-access, no-rooms, PIN-lockout, bootstrap-failed. |
| `ds-lock-screen` | — | build | — | NET-NEW: idle auto-lock overlay — educator photo + 'Screen locked' + PIN re-auth (reuses ds-pin-keypad) + 'Not <name>?' / 'Log out'. Shared-device safeguard. |

## 3. Screen specs

### S1 · Service sign-in

**Prototype:** [open the live screen](version-0.2/index.html?v=3&step=service&device=phone) · `&bare=1` for chrome-free
**Purpose:** Authenticate the device to a childcare service. **Entry:** Cold start / after logout **Exit:** → S2 Educator select on success; inline error on failure (see e-creds)

**Layout (top → bottom)**

1. Full-bleed teal hero (≈338px phone): drifting kid-friendly scene + Playground 'P' mark + 'Rise and shine' heading + subtitle
2. White sheet overlaps the hero (rounded top, ~24px overlap)
3. Service username field → Service password field (reveal toggle)
4. Sign in button (full-width, pinned to the bottom of the sheet)
5. Forgot password? link (centred, under the button)

**Copy** (verbatim — ship exactly this)

| Element | Text |
|---|---|
| Heading | Rise and shine |
| Subtitle | Sign in to your service and start your day. |
| Username field label | Service username |
| Password field label | Service password |
| Primary button | Sign in |
| Primary button (loading) | Signing in… |
| Forgot-password link | Forgot password? |

**Redlines** (spec-level — exact pixels in the prototype)

| Element | Spec |
|---|---|
| Hero | teal vertical gradient cyan-700→cyan-900, ~338px tall (phone) |
| Sheet | white, top radius ~28–32px, overlaps hero by ~24px |
| Field height | 52px, radius-lg (16px), 1px grey-500 border |
| Button | 52px tall, full-width, radius-lg, teal action-primary, white text; pinned bottom |
| Brand mark | Playground 'P' (≈64px) — placeholder logo, swappable |

**Interaction & behaviour**

- Sign in is enabled only when both username and password are non-empty.
- Tap Sign in → ~1.15s loading state (spinner + 'Signing in…') → success routes to S2.
- Invalid credentials show the inline service error (e-creds) and keep the user on S1.
- Password field has a trailing reveal toggle (show/hide).
- Demo credentials in the prototype: username LittleBugs · password bugs123.

**States:** default · focused · filled · loading · error:e-creds · error:e-offline

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

**Prototype:** [open the live screen](version-0.2/index.html?v=3&step=educators&device=phone) · `&bare=1` for chrome-free
**Purpose:** Choose which educator is signing in to this service. **Entry:** After successful service sign-in **Exit:** → S4 PIN on selecting an educator; → S3 Add educator on tapping add

**Layout (top → bottom)**

1. Teal hero (shrunk) — brand mark is now the SERVICE logo (e.g. Little Bugs crest); 'Log out' nav top-left
2. Sort pills (Recent / Name) + search field
3. Add-educator row
4. Educator list — photo avatar + name + 'Signed in <ago>'
5. Whole page scrolls (hero scrolls away; NOT sticky)

**Copy** (verbatim — ship exactly this)

| Element | Text |
|---|---|
| Title | Select your educator |
| Subtitle | Choose your profile to continue |
| Sort pill A | Recent |
| Sort pill B | Name |
| Row subtitle | Signed in <ago> |
| Add-educator row | Add educator profile |
| Empty / no-match | No educators match “<query>”. |

**Redlines** (spec-level — exact pixels in the prototype)

| Element | Spec |
|---|---|
| Educator row | card, radius-lg, 42px photo avatar + name + last-login; rows stagger in |
| Sort default | Recent (most-recent login) |
| Scroll | single scroll container — the hero scrolls off; not pinned |

**Interaction & behaviour**

- Selecting an educator carries it into context and routes to S4 PIN.
- Search filters the list live; no match shows the empty line.
- Sort toggles between most-recent-login and alphabetical.
- Add-educator row opens S3.
- Avatars are photo-first with an initials fallback when the image can't load.

**States:** default · loading · searching · empty:no-match · error:e-edulist

**Accessibility**

- Educator rows are buttons with accessible names (name + last-login); ≥44px targets.
- Sort pills expose selected state; search field has a label.
- Avatar images are decorative (the name carries identity).

**Acceptance criteria** (testable)

- [ ] (S2-AC1) Selecting an educator routes to S4 carrying that educator.
- [ ] (S2-AC2) A search with no matches shows the no-match line.
- [ ] (S2-AC3) The add-educator row opens S3.

### S3 · Add educator profile

**Prototype:** [open the live screen](version-0.2/index.html?v=3&step=addEducator&device=phone) · `&bare=1` for chrome-free
**Purpose:** Sign in a new educator profile not yet in the list. **Entry:** From the add-educator row on S2 **Exit:** → S5 Room select on success; back returns to S2

**Layout (top → bottom)**

1. Teal hero (service logo), back nav
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

**Prototype:** [open the live screen](version-0.2/index.html?v=3&step=pin&device=phone) · `&bare=1` for chrome-free
**Purpose:** Verify the selected educator with a 4-digit PIN. **Entry:** After selecting an educator on S2 **Exit:** → S5 Room select (cold start) / → Room Hub (returning) on correct PIN; → S7 via 'Use password'; lockout after 5 failures (e-locked)

**Layout (top → bottom)**

1. Teal hero — brand mark is now the EDUCATOR'S PHOTO + greeting
2. 4 PIN dots (ring → filled, pop on entry)
3. Circular on-screen numeric keypad with delete
4. 'Forgot PIN? Use password' link

**Copy** (verbatim — ship exactly this)

| Element | Text |
|---|---|
| Title | Hi <FirstName> |
| Subtitle | Enter your PIN to continue |
| Remaining attempts | Incorrect PIN — <n> tries left |
| Password fallback link | Forgot PIN? Use password |

**Redlines** (spec-level — exact pixels in the prototype)

| Element | Spec |
|---|---|
| PIN length | 4 digits, auto-submit |
| Keypad | circular keys, max-width ~300 (phone), centred |
| Lockout | 5 incorrect attempts → e-locked |

**Interaction & behaviour**

- PIN auto-submits once the 4th digit is entered (no submit button).
- Incorrect PIN shakes the dots and shows 'Incorrect PIN — <n> tries left'; attempts increment.
- After 5 incorrect attempts the screen shows the locked panel (e-locked) with a Switch educator action.
- 'Forgot PIN? Use password' routes to S7 (password fallback).
- Demo PIN in the prototype: 1234.
- Back returns to the educator list (or same-day for returning users).

**States:** default · entering · incorrect · locked:e-locked

**Accessibility**

- Keypad keys are ≥44px labelled buttons; delete key labelled.
- PIN progress is announced; the incorrect message is announced (role=alert).
- Don't rely on colour alone for the incorrect state (message + shake + remaining count).

**Acceptance criteria** (testable)

- [ ] (S4-AC1) Entering the 4th digit auto-submits without a button.
- [ ] (S4-AC2) A correct PIN advances to S5 (cold start).
- [ ] (S4-AC3) Each incorrect PIN shows remaining tries and increments attempts.
- [ ] (S4-AC4) Five incorrect attempts lock the screen.
- [ ] (S4-AC5) The password link routes to the password fallback (S7).

### S5 · Room select

**Prototype:** [open the live screen](version-0.2/index.html?v=3&step=rooms&device=phone) · `&bare=1` for chrome-free
**Purpose:** Choose the room the educator is working in today. **Entry:** After a correct PIN (cold start) or Add educator **Exit:** → Room Hub on Continue

**Layout (top → bottom)**

1. Teal hero (educator photo), back nav
2. Room rows — photo thumbnail + name + ratio, selectable
3. Continue button (pinned to the bottom)
4. Whole page scrolls; hero scrolls away

**Copy** (verbatim — ship exactly this)

| Element | Text |
|---|---|
| Title | Select your room |
| Subtitle | Where are you working today? |
| Needs-attention label | · Needs attention |
| Button (no room selected) | Select a room |
| Button (room selected) | Continue to <Room> |

**Redlines** (spec-level — exact pixels in the prototype)

| Element | Spec |
|---|---|
| Room row | selectable card; 46px photo thumbnail + name + 'Ratio x:1'; selected = teal border + green check |
| Needs-attention | amber (orange-500) left accent + label |
| Disabled / closed | greyed, dashed border, status chip (e.g. 'At capacity'), not selectable |
| Continue | disabled until a room is selected; pinned bottom |

**Interaction & behaviour**

- Selecting a room enables Continue and updates its label to 'Continue to <Room>'.
- Continue routes to the Room Hub.
- Needs-attention rooms (under ratio) are selectable; disabled rooms (closed / at capacity) are not.
- A closed room shows a warning but can still be entered (see e-closed).
- Room thumbnails are placeholder photos with a letter-tile fallback if the image can't load.

**States:** default · room-selected · needs-attention · disabled · empty:e-norooms · warning:e-closed

**Accessibility**

- Room rows are radio-like selectable buttons (name + ratio + status); selected exposed non-visually; disabled rooms are not focusable as actions.

**Acceptance criteria** (testable)

- [ ] (S5-AC1) Continue is disabled until a selectable room is chosen.
- [ ] (S5-AC2) Continue routes to the Room Hub with the selected room in context.
- [ ] (S5-AC3) Disabled rooms cannot be selected.

### S6 · Welcome back (same-day)

**Prototype:** [open the live screen](version-0.2/index.html?v=3&step=sameday&device=phone) · `&bare=1` for chrome-free
**Purpose:** Fast-path a returning educator to their remembered room — with shared-device escape hatches. **Entry:** Returning-educator (same-day) scenario **Exit:** → PIN re-auth on Continue; Change room → S5; Switch educator → S2; Log out → S1

**Layout (top → bottom)**

1. Teal hero (educator photo) — 'Log out' nav top-left
2. Greeting (Welcome Back + name)
3. Remembered room card (selected/green)
4. Change room link
5. 'Not <name>? Switch educator' (shared-device safety)
6. Continue button

**Copy** (verbatim — ship exactly this)

| Element | Text |
|---|---|
| Title | Welcome Back <Name> |
| Subtitle | Your room for today |
| Remembered note | Remembered from your last session |
| Change-room link | Change room |
| Switch-educator | Not <FirstName>? Switch educator |
| Button | Continue to <Room> |

**Redlines** (spec-level — exact pixels in the prototype)

| Element | Spec |
|---|---|
| Remembered room | selected (green) card, no needs-attention accent |
| Content | phone/iPad-portrait top-aligned under the hero; iPad-landscape centred |

**Interaction & behaviour**

- Shows the room remembered from the last session as pre-selected.
- Continue re-authenticates with PIN (S4) before entering the hub.
- Change room opens the full S5 list.
- 'Switch educator' drops the remembered educator and returns to S2 (service stays signed in) — for when a different person picks up the tablet.
- 'Log out' signs the service out and returns to S1.

**States:** default

**Accessibility**

- Greeting heading receives focus on entry; Change room / Switch educator / Log out are clearly labelled controls.

**Acceptance criteria** (testable)

- [ ] (S6-AC1) The remembered room is pre-selected and Continue re-auths via PIN.
- [ ] (S6-AC2) Change room opens the full room list (S5).
- [ ] (S6-AC3) Switch educator returns to the educator list without logging the service out.

### S7 · Educator password (PIN fallback)

**Prototype:** [open the live screen](version-0.2/index.html?v=3&step=edupass&device=phone) · `&bare=1` for chrome-free
**Purpose:** Let an educator sign in with a password when they can't use their PIN. **Entry:** From 'Forgot PIN? Use password' on S4 **Exit:** → S5 Room select (cold start) / → Room Hub (returning) on success; 'Use PIN instead' → S4

**Layout (top → bottom)**

1. Teal hero (educator photo)
2. 'Enter your password' header (+ 'Signing in as <Name>')
3. Password field (reveal toggle)
4. Sign in button
5. 'Use PIN instead' link

**Copy** (verbatim — ship exactly this)

| Element | Text |
|---|---|
| Title | Enter your password |
| Subtitle | Signing in as <Name> |
| Field label | Password |
| Primary button | Sign in |
| PIN link | Use PIN instead |

**Redlines** (spec-level — exact pixels in the prototype)

| Element | Spec |
|---|---|
| Field | 52px, radius-lg, reveal toggle |
| Button | disabled until the password field has content |

**Interaction & behaviour**

- Sign in enabled only when the password field is non-empty.
- On success routes onward exactly like a correct PIN (S5 cold start / hub returning).
- 'Use PIN instead' returns to S4.

**States:** default · filled · disabled

**Accessibility**

- Labelled input; reveal toggle is a labelled button; both links reachable.

**Acceptance criteria** (testable)

- [ ] (S7-AC1) Sign in is disabled until the password has content.
- [ ] (S7-AC2) Success routes onward like a correct PIN.
- [ ] (S7-AC3) 'Use PIN instead' returns to S4.

## 4. State & edge matrix

| State | Trigger | Screen(s) | UI | Copy | Recovery | Prototype |
|---|---|---|---|---|---|---|
| `e-creds` | Wrong/empty service credentials | S1 | inline error on the password field | We couldn't sign in to that service, please try again. For password reset please contact the service administrator. | Re-enter credentials | [open](version-0.2/index.html?v=3&step=e-creds&device=phone) |
| `e-offline` | No network on service login | S1 | inline Alert banner + Retry (button disabled) | No internet connection. | Retry | [open](version-0.2/index.html?v=3&step=e-offline&device=phone) |
| `e-disabled` | App disabled for the service | bootstrap | blocking StatePanel | This app has been disabled for your service. Please contact your service administrator. | Back to sign in | [open](version-0.2/index.html?v=3&step=e-disabled&device=phone) |
| `e-noaccess` | Account lacks access to the app | bootstrap | blocking StatePanel | Your account doesn't have access to this app. Contact your service administrator to request access. | Back to sign in | [open](version-0.2/index.html?v=3&step=e-noaccess&device=phone) |
| `e-edulist` | Educator list failed to load | S2 | blocking StatePanel + Retry | Something went wrong loading the educator list. Check your connection and try again. | Retry | [open](version-0.2/index.html?v=3&step=e-edulist&device=phone) |
| `e-locked` | 5 incorrect PIN attempts | S4 | blocking StatePanel (lock glyph) + Switch educator | Too many incorrect attempts for <FirstName>. Try again in 5 minutes, or switch educator. | Switch educator / wait | [open](version-0.2/index.html?v=3&step=e-locked&device=phone) |
| `e-norooms` | No rooms set up for the service | S5 | empty StatePanel + Refresh | There are no rooms set up for this service yet. Contact your service administrator. | Refresh | [open](version-0.2/index.html?v=3&step=e-norooms&device=phone) |
| `e-closed` | Selected room is closed today | S5 | inline Alert + 'enter anyway' | <Room> is closed today. You can still enter if you need to. | Enter <Room> anyway | [open](version-0.2/index.html?v=3&step=e-closed&device=phone) |
| `e-password` | Educator uses password auth instead of PIN | S4, S7 | password field + 'Use PIN instead' link (S7) | Enter your password | Use PIN instead | [open](version-0.2/index.html?v=3&step=e-password&device=phone) |
| `e-bootstrap` | App failed to start / load | bootstrap | blocking StatePanel + Retry | Something went wrong while loading. Please try again. | Retry | [open](version-0.2/index.html?v=3&step=e-bootstrap&device=phone) |
| `e-lock` | Tablet idle ~30s on the hub (shared device) | room-hub | full lock overlay — educator photo + PIN re-auth | Screen locked — Enter <FirstName>'s PIN to continue | PIN re-auth · Not <name>? · Log out | [open](version-0.2/index.html?v=3&step=e-lock&device=phone) |

## 5. Platform deltas

| Area | ios | android |
|---|---|---|
| Navigation | SwiftUI NavigationStack push; iPad NavigationSplitView | Jetpack Navigation Compose; equivalent back stack |
| Token consumption | Asset catalogue (colours/fonts) per Phase 0 preference | resources / Compose theme from the same token values |
| Credential storage | Keychain | EncryptedSharedPreferences |
| Password field | isSecureTextEntry + reveal toggle | inputType=textPassword + reveal toggle |
| PIN keypad | Custom on-screen circular keypad (no system keyboard) | Custom on-screen circular keypad (no system keyboard) |
| Idle auto-lock | App-level inactivity timer (~30s on hub) → lock overlay; reset on touch | Equivalent inactivity timer → lock overlay; reset on touch |
| Images | Async image load (educator photos / room thumbnails) with initials/letter fallback | Coil/async load with the same fallback |
| Layout split | iPad landscape uses a hero/form split + centred return screen | Tablet landscape equivalent |
| Minimum OS | iOS 17+ assumed — iOS 16 support is an OPEN question (~2,000 field devices below 17) | Per project minimum (Jetpack Compose) |

## 6. Open questions

| Question | Owner | Due | Status |
|---|---|---|---|
| Idle auto-lock timeout — prototype uses ~30s on the hub. Confirm the production value and whether it also applies to room-select / same-day, plus whether biometric (Face/Touch ID) is an allowed unlock alongside PIN. | TBD | — | open |
| PIN lockout = 5 attempts in the prototype, with a '5 minute' cool-down copy. Confirm the real threshold, cool-down duration, and admin reset path. | TBD | — | open |
| Confirm iOS minimum deployment target — iOS 17+ vs iOS 16 support for ~2,000 field devices (affects SwiftUI APIs). | TBD | — | open |
| Room Hub (Phase 3) — this flow routes into it but the hub itself is a placeholder (roster skeleton). Needs its own spec. | TBD | — | open |

## 7. Changelog

| Version | Date | Change |
|---|---|---|
| 0.1 | 2026-06-22 | Isolated the Playful tall-scene as the chosen direction (v0.1): placeholder images + brand logo-swap, redesigned PIN, non-sticky hero scroll. |
| 0.2 | 2026-06-23 | Shared-device safety (Switch educator + idle auto-lock); PIN 'tries left' + lockout-after-5 + password fallback (S7); iPad parity (photos, room thumbnails, circular keypad); image fallbacks; keyboard focus rings; sliding tab-toggle; handoff retargeted to the v0.2 tall-scene prototype. |
