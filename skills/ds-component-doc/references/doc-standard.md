# Xplor Design System — Component Documentation Standard

Every component that enters the system must include all 10 sections below.
Nothing is marked Stable without meeting this standard in full.

---

## Section 1 — Header

- Component name (canonical — identical in Figma, code, and docs)
- Status badge: WIP | Beta | Stable | Deprecated
- One-line description: what it is and what it solves
- Version (semver: 1.0.0, 1.1.0, etc.)
- Last updated date
- DRI (designer who owns this component's spec)

## Section 2 — Anatomy

A labelled diagram OR a written breakdown of every named subpart.
For each subpart, list:
- Part name
- What it does
- Whether it is required or optional
- Token references for its visual properties

Example:
| Part | Description | Required | Token |
|---|---|---|---|
| Container | Outer bounding box | Yes | `color.surface.default`, `radius.md` |
| Label | Button text | Yes | `color.text.on-action`, `typography.label.md` |
| Icon | Leading or trailing icon slot | No | `color.text.on-action` |
| Focus ring | Keyboard focus indicator | Conditional | `color.focus.ring`, `spacing.focus-offset` |

## Section 3 — Variants

All intentional variant dimensions, with accepted values and defaults.

Example:
| Prop | Values | Default |
|---|---|---|
| variant | primary, secondary, ghost, destructive | primary |
| size | sm, md, lg | md |
| iconPosition | leading, trailing, none | none |
| fullWidth | true, false | false |

Include a visual grid showing key variant combinations.
Note any combinations that are explicitly NOT supported.

## Section 4 — States

Every state the component can be in, with:
- State name
- Trigger / condition
- Visual change from default (token delta only — not full re-spec)
- Any behaviour change (e.g. disabled = not focusable)

Required states for interactive components:
- Default
- Hover (web only)
- Pressed / Active
- Focused (keyboard)
- Disabled
- Loading (if applicable)

Additional states by component type:
- Form inputs: Empty, Filled, Error, Success, Read-only
- Selection: Selected, Checked, Indeterminate
- Cards/containers: Expanded, Collapsed

## Section 5 — Usage Guidelines

Write for designers making decisions about which component to use.

Structure:
1. **Use this component when** — the specific jobs this component is right for
2. **Don't use this component when** — explicit anti-patterns with alternatives named
3. **Content guidelines** — label length limits, casing, tone (if text-bearing)
4. **Layout guidelines** — spacing from other elements, minimum/maximum sizing constraints
5. **Do / Don't examples** — at least one paired visual or described example per major misuse pattern

## Section 6 — Token References

Complete map of every visual property to its token. No hardcoded values.

| Property | Token | Value (current) |
|---|---|---|
| Background (default) | `color.action.primary` | #FF5A35 |
| Background (hover) | `color.action.primary-hover` | #E04D2C |
| Background (disabled) | `color.action.disabled` | #C5C5C5 |
| Label text | `color.text.on-action` | #FFFFFF |
| Border radius | `radius.md` | 8px |
| Padding (md) | `spacing.3` `spacing.6` | 12px 24px |
| Focus ring | `color.focus.ring` | #1A2B4A |
| Focus offset | `spacing.focus-offset` | 2px |

## Section 7 — Accessibility

Required for every component. Non-negotiable.

- **Touch target:** Minimum 44×44pt (mobile). State the actual size for each size variant.
- **Contrast ratios:** List text/background pairing and ratio for each state.
  WCAG AA minimum: 4.5:1 for text, 3:1 for large text and UI components.
- **Screen reader:** ARIA role, label pattern, and any aria-* attributes required.
- **Keyboard:** Tab order, focus behaviour, Enter/Space/Escape behaviour where applicable.
- **Motion:** Does this component animate? If yes, document the `prefers-reduced-motion`
  fallback — what does the component do when motion is reduced or off?
- **Platform notes:** Any iOS/Android-specific accessibility behaviour (e.g. VoiceOver
  vs TalkBack differences).

## Section 8 — Motion & Interaction

Only required if the component has animated states or transitions.

For each animation:
| Trigger | Property animated | Duration token | Easing token | Reduced-motion fallback |
|---|---|---|---|---|
| Hover | background-color | `motion.duration.fast` (150ms) | `motion.easing.standard` | Instant |
| Press | scale | `motion.duration.fast` (150ms) | `motion.easing.standard` | Instant |
| Focus ring appear | opacity | `motion.duration.fast` (150ms) | `motion.easing.standard` | Instant |

## Section 9 — Engineering

This section is populated by the engineer building the component, not by design.
Design pre-fills the scaffold. Engineering completes it.

Pre-filled by design:
- Component name in code (must match Figma name exactly)
- Props interface (derived from Variants section)
- Token references (from Section 6)
- Acceptance criteria (what QA checks against the spec)

Completed by engineering:
- Framework-specific code snippet (Vue / React Native)
- Storybook or equivalent link
- Any implementation notes, known constraints, or edge case handling
- Dependency list (if any third-party libraries used)

## Section 10 — Changelog

Append-only log. Every change to this doc gets an entry.

| Version | Date | Author | Change |
|---|---|---|---|
| 1.0.0 | 2026-06-01 | Mason | Initial spec — status: WIP |
| 1.1.0 | — | — | — |

---

## Status definitions

| Status | Meaning | Consumable? |
|---|---|---|
| WIP | In progress — spec incomplete | No |
| Beta | Complete spec, available in one product only | With caution |
| Stable | Approved, documented, meets full standard | Yes — all products |
| Deprecated | Being replaced — see replacement noted in doc | No — use replacement |
