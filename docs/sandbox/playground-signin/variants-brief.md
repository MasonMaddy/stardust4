# Service sign-in — 5 visual direction variants (build brief)

Five alternative treatments of the **Playground service sign-in** screen, handed over as a
comparison round to pick a direction. Build them as runnable screens to compare side-by-side.

**Where to build:** new comparison page under `docs/sandbox/playground-signin/` (reuse the
prototype's approach — wired to the repo's real `--sd-*` tokens + Inter; the existing
`flow-proto.jsx` / `helpers.jsx` and the device-frame harness are the reference). A simple
side-by-side board of 5 device frames is ideal.

## Shared anatomy (consistent across all 5)
- **Service username** field — person (`user`) lead icon + "Username" placeholder.
- **Service password** field — "Password" placeholder + `view` eye toggle (trailing).
- Full-width **Sign in** button — teal `--sd-colour-action-primary` (#00776B), white text.
- Playground **"P"** brand mark in teal.
- Field spec matches the prototype: 52px tall, radius `--sd-radius-lg` (16), 1px grey-500 border.

## The five variants

1. **Centred classic** — white bg, centred column. Teal "P" emblem (circle) on top →
   "Sign in to Playground" (dark heading) → subtitle "Sign in to your service to get started." →
   username + password → **Forgot password?** link (right-aligned, **purple**) → full-width Sign in →
   terms line "By signing in you agree to our Terms of Service and Privacy Policy" (teal links) under button.

2. **Editorial / left-aligned** — white bg, left-aligned. Small "P" + **"Playground" wordmark** top-left →
   "Sign in to your service" (large heading) → "Welcome back — let's get started." → username + password →
   **Forgot password?** (right, **teal**) → full-width Sign in. Terms line pinned to the **page footer**.

3. **Cosmic tall-scene** — teal gradient hero + starfield + white planet/blob illustration →
   "Ready for liftoff" (white) → "Sign in to your service and start your day." → white bottom sheet with
   username + password → Sign in → **Forgot password?** (centred, teal).
   ⭐ This is the direction the existing prototype already uses.

4. **Cosmic card hero** — rounded teal card hero (not full-bleed) + starfield + blob →
   "Let's get you signed in" / "Your room is ready and waiting." → on white: username + password → Sign in →
   **"Sign in with a passcode instead"** link (**purple**) — a NEW alt-auth affordance at the service step.
   No terms line, no emblem in the form area.

5. **Floating card on tint** — mint/cyan-tinted bg. White card with teal "P" emblem overlapping its top →
   "Welcome back" → "Sign in to your service" → username + password → full-width Sign in →
   **Forgot password?** (centred, teal).

## Decisions these variants are really testing
- **Layout paradigm:** centred (1,5) vs editorial left-aligned (2) vs cosmic hero+sheet (3,4).
- **Brand treatment:** emblem (1,5) vs wordmark (2) vs illustration-in-hero (3,4).
- **Light/neutral (1,2,5) vs cosmic brand moment (3,4).**
- **Alt auth:** only #4 surfaces passcode-instead.
- **Terms & privacy:** present in 1,2; absent in 3,4,5.

## Stardust note to flag while building
"Forgot password?" / "passcode" link colour is **inconsistent** across the set: teal `#00776B` is
`colour/text/text-link`; **purple is `accent-secondary`, off the link convention**. Variants 1 and 4
use purple links — call this out (or normalise to teal) when building.
