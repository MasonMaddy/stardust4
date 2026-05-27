# Component Specification Standard

Every component built for the Xplor design system must meet this specification. This file is the source of truth for what "complete" looks like.

---

## Anatomy of a complete component

### 1. Naming
- Component name uses Title Case: `Button`, `Input Field`, `Navigation Bar`
- Variants use consistent property names across all components
- No spaces in variant values — use camelCase or kebab-case consistently

### 2. Required Figma properties (variant properties)

Every component must define all applicable properties from this list:

| Property | Values | Notes |
|---|---|---|
| `Size` | `sm`, `md`, `lg` | Not all components need all three |
| `State` | `default`, `hover`, `pressed`, `focused`, `disabled`, `loading` | Only states that visually differ |
| `Variant` | component-specific | e.g. `primary`, `secondary`, `ghost`, `destructive` for buttons |
| `Platform` | `mobile`, `desktop` | Only if behaviour/sizing meaningfully differs |
| `Has Icon` | `true`, `false` | When icon is optional |
| `Icon Position` | `leading`, `trailing` | When position is variable |
| `Has Label` | `true`, `false` | When label is optional |

### 3. Token compliance

**Token tiers (Stardust legacy):**
- **Colours & spacing on components** → `Color/*` and `spacing/*` from the `value` collection (semantic)
- **Radius** → `radius/*` from the `base` collection (no semantic radius tier)
- **Typography** → published Figma text styles built from `font/font-size/*`, `font/weight/*`, `font/line-height/*` in `base`
- **Never** bind `colour/*` primitives directly on component layers when a `Color/*` semantic equivalent exists

- All colour values must reference `Color/*` semantic tokens or component-tier tokens — no raw hex values
- All spacing values must reference `spacing/*` semantic tokens — no hardcoded numbers
- All text must use published text styles — not manual font size/weight
- All border radius values must reference `radius/*` token variables

See `token-cheatsheet.md` for component-specific token mappings.

### 4. Auto layout
- Every component must use auto layout — no manual pinning
- Padding uses token variables, not fixed numbers
- Gap between elements uses token variables
- Resize behaviour defined: `hug`, `fill`, or `fixed` set intentionally per element

### 5. Mobile-first sizing
- Default size targets 44px minimum touch target height (Apple HIG / WCAG)
- Text is minimum 14px (`font/font-size/sm` / Label SM text style) — nothing smaller in interactive components
- Tap/touch affordance considered — targets are not too dense

### 6. Component description (in Figma)
Every published component must have a description that includes:
- What the component is used for (1 sentence)
- When to use it vs a similar component (if applicable)
- Any usage rules or known constraints

**Format:**
```
[What it is and does.]
Use when: [context]
Don't use when: [context, if relevant]
Note: [any constraints]
```

### 7. Documentation layer (optional but encouraged)
A hidden `_docs` frame inside the component with:
- Annotations on key elements
- Token names labelled on padding/colour/type

---

## State requirements by component type

### Interactive components (buttons, inputs, toggles, checkboxes, etc.)
Must have: `default`, `hover`, `focused`, `disabled`
Should have: `pressed`, `loading` (if applicable)
Optional: `error`, `success` (if the component has validation states)

### Display components (cards, badges, avatars, etc.)
Must have: `default`
Should have: any visual variants relevant to usage

### Navigation components
Must have: `default`, `active`, `disabled`
Should have: `hover`, `focused`

### Form components (inputs, selects, date pickers, etc.)
Must have: `default`, `focused`, `filled`, `disabled`, `error`
Should have: `success`, `readonly`

---

## Checklist before publishing a component

- [ ] Named correctly with Title Case
- [ ] All variant properties defined and consistently named
- [ ] No raw hex, spacing, or radius values — all tokens
- [ ] Auto layout applied throughout
- [ ] Minimum touch target met (44px height for interactive components)
- [ ] All required states present for this component type
- [ ] Component description written in Figma
- [ ] Tested at all defined sizes
- [ ] Tested with long text / edge case content
- [ ] Layers are named clearly (not "Rectangle 47")
- [ ] No detached instances of other components inside

---

## Common failure modes to avoid

| Issue | What it looks like | Fix |
|---|---|---|
| Raw values | Hex `#00776B` in fill | Replace with `Color/primary` variable |
| Greenfield tokens | `color/action/default`, `color/text/primary` | Replace with legacy `Color/primary`, `Color/text-primary` |
| Primitive on component | `colour/cyan/700` bound to button fill | Replace with `Color/primary` |
| Broken token reference | Variable shows ⚠️ or "?" | Re-link to correct variable in `value` or `base` |
| Hardcoded spacing | Padding set to `16` not a variable | Link to `spacing/component-m` |
| Hardcoded radius | Corner radius `8` not a variable | Link to `radius/m` |
| Legacy state names | `Enabled`, `Focus`, `Pressed` | Rename to `default`, `focused`, `pressed` |
| Missing states | Button has no `disabled` | Add variant row for disabled state |
| Fixed sizing | Frame is fixed width, not auto layout | Convert to auto layout with hug/fill |
| Detached components | Icon inside button is not a component instance | Replace with component instance |
| Poor layer naming | Layers called `Frame 3`, `Group 12` | Name layers: `label`, `icon`, `container` |
| Manual typography | Font set to 16/Medium manually | Apply Label MD or Body MD text style |
