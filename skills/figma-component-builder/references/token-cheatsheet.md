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

### Button (primary)
| Element | Property | Token |
|---|---|---|
| Container | Background (default) | `Color/primary` |
| Container | Background (hover) | `Color/primary-hover` |
| Container | Background (pressed) | `Color/primary-pressed` |
| Container | Background (disabled) | `Color/background-grey` |
| Label | Text (default) | `Color/text-white` |
| Label | Text (disabled) | `Color/text-disabled` |
| Container | Radius | `radius/m` |
| Container | Padding H | `spacing/component-m` |
| Container | Padding V | `spacing/component-sm` |
| Container | Gap (icon ↔ label) | `spacing/stack-gap-default` |

### Button (secondary)
| Element | Property | Token |
|---|---|---|
| Container | Background | `Color/secondary` or `Color/background-purple` |
| Label | Text | `Color/text-white` |

### Button (ghost / minimal)
| Element | Property | Token |
|---|---|---|
| Container | Background | transparent or `Color/background-white` |
| Label | Text | `Color/primary` or `Color/text-link` |
| Container | Border (if outlined) | `Color/border` |

### Button (destructive)
| Element | Property | Token |
|---|---|---|
| Container | Background | `Color/error` |
| Label | Text | `Color/text-white` |

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
| Box (checked) | Fill | `Color/primary` |
| Box (unchecked) | Border | `colour/grey/1000` → prefer semantic: use `Color/text-primary` at reduced opacity OR add component token |
| Box (error checked) | Fill | `Color/error` |
| Box (error unchecked) | Border | `Color/border-error` |
| Check icon | Color | `Color/text-white` |
| Focus/hover halo | Fill | `Color/background-cyan` |
| Error halo | Fill | `Color/background-error-subtle` |
| Disabled | Fill/border | `Color/text-disabled` |
| Box | Radius | `radius/sm` |
| Label | Text style | Label SM / Label MD |
| Row gap | Gap | `spacing/stack-gap-default` |

> **Note:** Some legacy components bind `colour/grey/*` or `colour/cyan/*` primitives directly. Flag as ⚠️ in review — migrate to `Color/*` semantic tokens where a mapping exists.

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
