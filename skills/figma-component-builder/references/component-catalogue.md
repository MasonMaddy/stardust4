# Component Library Catalogue

This file lists every component to be built for the Xplor design system, grouped by category. Use this as the build backlog and to understand related components when briefing a specific one.

---

## Priority tiers

- **P1 — Foundation** (build first, everything depends on these)
- **P2 — Core UI** (needed for first mobile screens)
- **P3 — Patterns** (composite components built from P1/P2)

---

## P1 — Foundation Components

### Typography
Not a component per se — published **Figma text styles** built from `base` primitives (`font/font-size/*`, `font/line-height/*`, `font/weight/*`, `font/font-family/Inter`).

Styles to publish: Display LG, Display MD, Heading XL, Heading LG, Heading MD, Heading SM, Body LG, Body MD, Body SM, Label LG, Label MD, Label SM, Caption MD

Minimum for interactive components: **Label SM** (14px / `font/font-size/sm`).

### Colour Styles
Published colour styles from **`Color/*`** semantic tokens in the `value` collection for fills and strokes. Do not publish styles from `colour/*` primitives directly.

### Icon
- Variants: `size` (sm=16, md=20, lg=24), individual icon instances
- Acts as the base for all icon usage across components
- Source: define icon set (e.g. Phosphor, Lucide, or custom)

### Button
- **Spec:** `button-spec.md` (canonical — aligned to Figma node 1:6036)
- Variants: `type` (solid, ghost, minimal, destructive), `state` (default, hover, focus, pressed, disabled), `size` (hug, full width)
- Boolean props: `text` (default true), `leadIcon` (default false), `trailIcon` (default false)
- Single fixed height (48px). No loading variant — use loading animation overlay.
- FAB / icon-only → separate **Icon Button** component (not Button)

### Icon Button
- Variants: `variant` (primary, secondary, ghost, destructive), `size` (sm, md, lg), `state` (default, hover, pressed, focused, disabled, loading)

### Badge / Chip
- Variants: `variant` (neutral, info, success, warning, error), `size` (sm, md), `has icon` (true/false), `dismissible` (true/false)

### Avatar
- **Spec:** `avatar-spec.md` (canonical — aligned to Figma node 316:7102)
- Variants: `type` (image, initials, icon-colour, icon-outline), `shape` (round, square)
- Boolean props: `hasStatus` (default false — unchecked/new child profile data), `showStackedAvatar` (default false)
- Default size **64px (md)** in Figma; **scales to fit** parent containers in product UI
- `icon-colour` and `icon-outline` use **swappable icon placeholders** (not fixed assets)
- Round shape: white ring border on all types. Square shape: border on `icon-colour` only (intentional)

### Divider
- Variants: `orientation` (horizontal, vertical), `variant` (default, subtle)

---

## P2 — Core UI Components

### Input Field
- Variants: `state` (default, focused, filled, disabled, error, success, readonly), `size` (sm, md, lg), `has label` (true/false), `has helper text` (true/false), `has leading icon` (true/false), `has trailing icon` (true/false), `has character count` (true/false)

### Text Area
- Variants: `state` (default, focused, filled, disabled, error, readonly), `has label` (true/false), `has helper text` (true/false), `resizable` (true/false)

### Select / Dropdown Trigger
- Variants: `state` (default, focused, filled, disabled, error), `size` (sm, md, lg), `has label` (true/false)

### Checkbox
- **Spec:** `checkbox-spec.md` (canonical — aligned to Figma node 806:540057)
- Variants: `type` (checked, unchecked, intermediate), `state` (default, hover, focused, pressed, disabled, error)
- **18 variants** = 3 types × 6 states
- Control-only — **no label variant**; labels composed in parent layouts
- 44×44px hit area; 18×18px visual box; circular focus halo (separate from Button pattern)
- Figma `intermediate` → code `indeterminate`

### Radio Button
- Variants: `state` (default, hover, focused, selected, disabled), `has label` (true/false)

### Toggle / Switch
- Variants: `state` (default, hover, focused, on, off, disabled), `size` (sm, md)

### Label (Form label)
- Variants: `required` (true/false), `size` (sm, md)

### Helper Text / Caption
- Variants: `type` (default, error, success, warning), `has icon` (true/false)

### Card
- Variants: `variant` (default, elevated, outlined, filled), `interactive` (true/false), `state` (default, hover, pressed) — only when interactive=true

### List Item
- Variants: `state` (default, hover, pressed, selected, disabled), `has leading` (true/false), `leading type` (icon, avatar, image), `has trailing` (true/false), `trailing type` (icon, badge, text, chevron)

### Navigation Bar (Mobile bottom nav)
- Variants: `item count` (3, 4, 5), item `state` (default, active)

### Top App Bar (Mobile header)
- Variants: `variant` (default, large), `has back` (true/false), `has actions` (true/false), `action count` (1, 2, 3)

### Tab Bar
- Variants: `variant` (default, pill), `item state` (default, active, disabled), `has icon` (true/false)

### Modal / Bottom Sheet
- Variants: `type` (modal, bottom-sheet), `has header` (true/false), `has footer` (true/false), `has close` (true/false)

### Toast / Snackbar
- Variants: `variant` (default, success, warning, error, info), `has action` (true/false), `has icon` (true/false)

### Tooltip
- Variants: `position` (top, bottom, left, right), `size` (sm, md)

### Empty State
- Variants: `has illustration` (true/false), `has action` (true/false)

### Loading / Spinner
- Variants: `size` (sm, md, lg), `variant` (spinner, skeleton)

### Skeleton
- Variants: `type` (text, circle, rectangle), `size` (sm, md, lg, xl)

---

## P3 — Pattern Components (composite)

### Form Group
Combines: Label + Input Field + Helper Text

### Search Bar
Combines: Input Field (specialised) + Icon Button

### Selection List
Combines: List Items in a scroll container

### Action Sheet
Combines: Bottom Sheet + List Items

### Confirmation Dialog
Combines: Modal + Button group

### Date Picker (Mobile)
- Variants: `type` (single, range), `state` (default, open)

### Stepper / Quantity Input
- Variants: `state` (default, min, max, disabled), `size` (sm, md)

### Progress Indicator
- Variants: `type` (bar, circle, step), `size` (sm, md, lg)

### Banner
- Variants: `variant` (info, success, warning, error), `dismissible` (true/false), `has action` (true/false)

### Tag Input
Combines: Input Field + Badge/Chip

---

## Notes

- Components in P3 should not be built until their P1/P2 dependencies are complete and published
- Each component should be built following the Component Spec Standard (component-spec.md)
- All token references must follow the Token Architecture and Token Cheatsheet (`token-architecture.md`, `token-cheatsheet.md`)
- Mobile-first: default sizes and spacing target mobile; desktop variants only where behaviour meaningfully differs
