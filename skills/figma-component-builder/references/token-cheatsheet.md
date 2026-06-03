# Token Cheatsheet — Component Build & Review

Quick lookup for the **legacy Stardust token system**. Use these names in build briefs and reviews. Do not use greenfield names (`color/action/default`, `color/neutral/*`, `space/component/*`).

**Collections:** primitives = `base` · semantic = `value`

---

## Valid vs invalid token names

| ✅ Use in components | ❌ Do not use (greenfield / wrong) |
|---|---|
| `Color/primary` | `color/action/default` |
| `Color/primary-hover` | `color/cyan/700` (primitive — use semantic) |
| `Color/text-primary` | `color/text/primary` |
| `Color/background-cyan` | `color/surface/muted` |
| `Color/border` | `color/border/default` |
| `spacing/component-m` | `space/component/lg` |
| `radius/m` | `radius/md` |
| `colour/grey/1100` | Only in `base` — never on components |

**Colour primitives** use British spelling (`colour/`). **Semantic colour** group uses capital C (`Color/`).

---

## Colour — by role

| Role | Token |
|---|---|
| Brand / primary action fill | `Color/primary` |
| Primary hover | `Color/primary-hover` |
| Primary pressed | `Color/primary-pressed` |
| Secondary / accent fill | `Color/secondary` |
| Tertiary / emphasis | `Color/tertiary` |
| Success | `Color/success` |
| Error fill / icon | `Color/error` |
| Warning | `Color/warning` |
| Focus ring / halo | `Color/focus` or `Color/background-cyan` |
| Body text | `Color/text-primary` |
| Secondary text | `Color/text-secondary` |
| Disabled text | `Color/text-disabled` |
| Text on dark fills | `Color/text-white` |
| Error message text | `Color/text-error` |
| Link text | `Color/text-link` |
| Page / card background | `Color/background-white` |
| Subtle surface | `Color/background-grey` |
| Brand tint surface | `Color/background-cyan` |
| Success tint surface | `Color/background-green` |
| Error tint surface | `Color/background-red` or `Color/background-error-subtle` |
| Warning tint surface | `Color/background-orange` |
| Default border | `Color/border` |
| Error border | `Color/border-error` |

---

## Spacing

| Role | Token | px |
|---|---|---|
| Tight inset / checkbox gap | `spacing/component-xs` | 4 |
| Compact padding / gap | `spacing/component-sm` | 8 |
| Standard padding / gap | `spacing/component-m` | 16 |
| Generous padding / gap | `spacing/component-l` | 24 |
| Stack — tight | `spacing/stack-gap-tight` | 4 |
| Stack — default | `spacing/stack-gap-default` | 8 |
| Stack — loose | `spacing/stack-gap-loose` | 12 |
| Section gap | `spacing/section-gap` | 24 |
| Page margin (mobile) | `spacing/page-margin-mobile` | 20 |
| Page margin (tablet) | `spacing/page-margin-tablet` | 24 |
| Page margin (desktop) | `spacing/page-margin-desktop` | 32 |

Primitive fallback (layout math only — prefer semantic): `spacing/1` = 4px, `spacing/2` = 8px, `spacing/4` = 16px, `spacing/6` = 24px.

---

## Radius

| Role | Token | px |
|---|---|---|
| None / square | `radius/none` | 0 |
| Small (checkbox, chip) | `radius/sm` | 4 |
| Default (button, input) | `radius/m` | 8 |
| Large (card, modal) | `radius/lg` | 16 |
| Pill / circle | `radius/full (pills+circles)` | 9999 |

---

## Typography (Figma text styles)

Typography is **not** bound via `Color/*` or composite `text/*` variables. Use published **text styles** built from `base` primitives:

| Style | Size primitive | Weight | Min use |
|---|---|---|---|
| Label SM | `font/font-size/sm` (14px) | `font/weight/medium` | Interactive labels — **minimum** |
| Label MD | `font/font-size/base` (16px) | `font/weight/medium` | Buttons, inputs |
| Body SM | `font/font-size/sm` (14px) | `font/weight/regular` | Helper text |
| Body MD | `font/font-size/base` (16px) | `font/weight/regular` | Default body |
| Heading SM | `font/font-size/lg` (20px) | `font/weight/semibold` | Section titles |

Pair each size with matching `font/line-height/{size}` and `font/font-family/Inter`.

**Do not** use `font/font-size/tiny` (9px) on interactive components.

---

## Component-specific defaults

### Button — see `button-spec.md` for full state matrix

Canonical spec: **`button-spec.md`** (Figma node 1:6036). Summary:

| Element | Property | Token |
|---|---|---|
| Container | Height | `spacing/12 (48px)` |
| Container | Radius (all types) | `radius/lg` |
| Container | Padding H / V | `spacing/component/md` · `spacing/component/sm` |
| Container | Gap | `spacing/stack-gap/default` (solid/ghost/destructive) · `spacing/2` (minimal) |
| Label | Text style | **Header/Body/Medium** (16/20 Inter Medium) |
| Solid | Background default / hover / pressed / disabled | `colour/action/primary` · `hover` · `pressed` · `disabled` |
| Solid | Label | `colour/text/text-inverse` (default) · `text-disabled` (disabled) |
| Ghost | Border default / hover / focus / pressed / disabled | 1px `action/primary` · 1px `action/hover` · 2px `action/pressed` · 1px `action/pressed` · 1px `text-disabled` |
| Ghost | Hover/focus/pressed fill | `colour/feedback/success/subtle` |
| Minimal | Hover fill | `colour/surface/cyan` (same hex as success/subtle) |
| Minimal | Focus border | 1px `colour/action/pressed` |
| Destructive | Background default / pressed / disabled | `colour/feedback/error/default` · `error/subtle` · `text-disabled` |
| Focus glow (solid/ghost/minimal) | Drop shadow | `colour/feedback/success/subtle`, spread `spacing/1` |
| Focus glow (destructive) | Drop shadow | `colour/surface/red`, spread 3px |

### Avatar — see `avatar-spec.md`

Canonical spec: **`avatar-spec.md`** (Figma node 316:7102). Default **64px**; scales in parent layouts.

| Element | Property | Token |
|---|---|---|
| Container (md) | Size | 64×64px (1:1) |
| Round | Radius | `radius/full` |
| Square | Radius | `radius/m` |
| Round border | All types | 2px `colour/surface/default` |
| Square border | `icon-colour` only | 2px `colour/surface/default` |
| Image / icon-colour bg | Fill | — / `colour/surface/grey` |
| Initials bg | Fill | `colour/surface/green` |
| Initials text | Colour + style | `colour/action/primary` · Header/H2/regular (scales) |
| icon-outline bg | Fill | `colour/action/primary` |
| icon-outline icon | Colour | `colour/text/text-inverse` |
| Status dot | Fill + ring | `colour/feedback/success/default` · 2px `surface/default` |
| Stacked badge bg | Fill | `colour/text/text-primary` |
| Stacked badge text | Style | Header/H3/regular · `text-inverse` (scales) |

### Input Field
| Element | Property | Token |
|---|---|---|
| Container | Background | `Color/background-white` |
| Container | Border (default) | `Color/border` |
| Container | Border (focused) | `Color/focus` or `Color/primary` |
| Container | Border (error) | `Color/border-error` |
| Input text | Color | `Color/text-primary` |
| Placeholder | Color | `Color/text-secondary` |
| Helper text (error) | Color | `Color/text-error` |
| Container | Radius | `radius/m` |
| Container | Padding | `spacing/component-sm` / `spacing/component-m` |

### Checkbox
| Element | Property | Token |
|---|---|---|
| Hit-area wrapper | Size | 44×44px fixed |
| Box | Size | 18×18px |
| Box (checked / intermediate) | Fill | `colour/action/primary` |
| Box (unchecked) | Border | 2px `colour/border/strong` |
| Box (unchecked hover/focus/pressed) | Border | 2px `colour/text/text-primary` |
| Box (error checked / intermediate) | Fill | `colour/feedback/error/default` |
| Box (error unchecked) | Border | 2px `colour/border/error` |
| Check / dash icon | Color | `colour/text/text-inverse` (baked SVG) |
| Hover halo (checked / intermediate) | Fill | `colour/surface/cyan` |
| Hover halo (unchecked) | Fill | `colour/surface/grey` |
| Focus halo | Fill + border | `colour/feedback/success/subtle` + 2px `colour/action/pressed` |
| Pressed halo (checked / intermediate) | Fill | `colour/feedback/success/default` |
| Pressed halo (unchecked) | Fill | `colour/text/text-secondary` |
| Disabled box (checked / intermediate) | Fill | grey SVG (maps to `colour/action/disabled`) |
| Disabled box (unchecked) | Border | 2px `colour/text/text-disabled` |
| Box | Radius | `radius/sm` |
| Wrapper (interactive) | Shape | `radius/full` |
| Label row gap (parent layout) | Gap | `spacing/stack-gap/default` |

### Badge / Chip
| Variant | Background | Text |
|---|---|---|
| neutral | `Color/background-grey` | `Color/text-primary` |
| info | `Color/background-cyan` | `Color/primary` |
| success | `Color/background-green` | `Color/success` |
| warning | `Color/background-orange` | `Color/warning` |
| error | `Color/background-red` | `Color/error` |

### Toast / Banner
| Variant | Background | Icon/text accent |
|---|---|---|
| info | `Color/background-cyan` | `Color/primary` |
| success | `Color/background-green` | `Color/success` |
| warning | `Color/background-orange` | `Color/warning` |
| error | `Color/background-red` | `Color/error` |

---

## Review red flags

Flag as **❌ Fail** if you see:
- Raw hex values (`#00776B`, `#fce8ed`)
- Greenfield token paths (`color/action/*`, `color/surface/*`, `color/text/*`)
- Primitive colour bound directly on component layers (`colour/cyan/700`, `colour/grey/1100`) — except radius/spacing primitives where no semantic exists yet
- Wrong collection references (broken ⚠️ aliases)

Flag as **⚠️ Warning** if you see:
- Legacy primitive colours that have a semantic equivalent not yet applied
- `Enabled` / `Focus` instead of `default` / `focused` for state property values
- Text styled manually instead of via published text style
