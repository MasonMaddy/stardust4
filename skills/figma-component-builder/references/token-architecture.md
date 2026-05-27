# Token Architecture

This document defines the token system used in the Stardust / Xplor design system library. Components reference **semantic tokens** from the `value` collection — never raw hex or primitive values directly.

---

## Collections in Figma

| Tier | Figma collection | Mode | Used in components? |
|---|---|---|---|
| 1 — Primitive | `base` | Mode 1 | **No** — raw values only |
| 2 — Semantic | `value` | value | **Yes** — all component bindings |
| 3 — Component | (per component, optional) | — | **Yes** — scoped overrides |

**Import order:** `base` first, then `value` (semantic aliases depend on primitives).

**Repo files:**
- `tokens/tier-1-primitives.tokens.json` → import to **`base`**
- `tokens/tier-2-semantic.tokens.json` → import to **`value`**
- Regenerate both: `node tokens/build-figma-tokens.mjs`

---

## Naming conventions (legacy — do not rename)

### Tier 1 — Primitives (`base`)

Named by what they **are**, not what they **do**.

```
colour/cyan/700          → #00776B
colour/grey/1100         → #252525
colour/purple/500        → #8068BA
colour/orange/500        → #FF9800   (warning palette — not "amber")
colour/red/400           → #D54263

spacing/4                → 16px
spacing/6                → 24px

font/font-size/base      → 16
font/font-size/md        → 18   (audit addition)
font/line-height/base    → 24   (px, not unitless)
font/font-family/Inter   → Inter
font/weight/medium       → Medium

radius/sm                → 4
radius/m                 → 8
radius/lg                → 16
radius/none              → 0    (audit addition)
radius/full (pills+circles) → 9999
```

**Colour palettes:** `cyan`, `green`, `grey`, `orange`, `purple`, `red`

**Rules:**
- British spelling: `colour` not `color`
- Grey scale includes steps `0`, `50`–`900`, `1000`, `1050`, `1100`, `1200`
- Purple includes step `550`
- Cyan and red include step `20`
- Spacing uses numeric scale (`spacing/1` = 4px base-4)

---

### Tier 2 — Semantic (`value`)

Named by **role**. Group names use legacy casing:

```
Color/primary              → colour/cyan/700
Color/primary-hover        → colour/cyan/800    (audit addition)
Color/primary-pressed      → colour/cyan/900    (audit addition)
Color/secondary            → colour/purple/500
Color/tertiary             → colour/orange/900
Color/success              → colour/cyan/500
Color/error                → colour/red/400
Color/warning                → colour/orange/500  (audit addition)
Color/focus                → colour/cyan/500    (audit addition)

Color/text-primary         → colour/grey/1100
Color/text-secondary       → colour/grey/900
Color/text-disabled        → colour/grey/700
Color/text-white           → colour/grey/0
Color/text-error           → colour/red/800     (audit addition)
Color/text-link            → colour/cyan/700    (audit addition)

Color/background-white     → colour/grey/0
Color/background-grey      → colour/grey/200
Color/background-cyan      → colour/cyan/50
Color/background-green     → colour/green/50
Color/background-purple    → colour/purple/50
Color/background-red       → colour/red/50
Color/background-orange    → colour/orange/50   (audit addition)
Color/background-error-subtle → colour/red/20   (audit addition)

Color/border               → colour/purple/200
Color/border-error         → colour/red/400     (audit addition)

spacing/component-xs         → spacing/1          (audit addition)
spacing/component-sm         → spacing/2
spacing/component-m          → spacing/4
spacing/component-l          → spacing/6
spacing/stack-gap-tight      → spacing/1
spacing/stack-gap-default    → spacing/2
spacing/stack-gap-loose      → spacing/3
spacing/section-gap          → spacing/6
spacing/page-margin-mobile   → spacing/5
spacing/page-margin-tablet   → spacing/6
spacing/page-margin-desktop  → spacing/8
```

**Naming pattern:**
- Color group: **`Color`** (capital C)
- Color roles: **hyphenated** (`text-primary`, `background-cyan`, `primary-hover`)
- Spacing group: **`spacing`** (lowercase)
- Spacing roles: **hyphenated** (`component-m`, `stack-gap-default`)

---

### Tier 3 — Component tokens (optional)

Scoped overrides per component. Pattern:

```
[component]/[element]/[property]/[state]
```

Example — Button:
```
button/background/default     → Color/primary
button/background/hover       → Color/primary-hover
button/background/pressed       → Color/primary-pressed
button/background/disabled    → Color/text-disabled
button/label/default          → Color/text-white
button/padding/horizontal     → spacing/component-m
button/radius                   → radius/m
```

Component tokens must reference **semantic** tokens, not primitives.

---

## Typography in Figma

Text styles are published separately in Figma (not as semantic variables). Pair:
- `font/font-size/{size}` + `font/line-height/{size}` + `font/weight/{weight}` + `font/font-family/Inter`

Available sizes: `tiny`, `xs`, `sm`, `base`, `md`, `lg`, `xl`, `2xl`, `3xl`

---

## Rules

1. **Never bind a primitive directly in a component.** Use `Color/*` or `spacing/*` semantic tokens.
2. **Keep legacy names.** Do not migrate to `color/text/primary` or `color/neutral/*` — that was the abandoned greenfield rebuild.
3. **If a new value is needed**, add the primitive to `base` first, then create a semantic alias in `value`.
4. **No raw hex in components.** Every fill, stroke, spacing, and radius must reference a variable.
5. **Dark mode** is not yet defined in the semantic layer. Defer until legacy dark mappings are agreed.

---

## Token counts (current)

| File | Tokens |
|---|---|
| `tier-1-primitives.tokens.json` | 103 (99 from Figma + 4 audit additions) |
| `tier-2-semantic.tokens.json` | 36 (26 from Figma + 10 audit additions) |

Greenfield rebuild tokens (Light/Dark `color/action/*` architecture) are archived in `tokens/_archive/greenfield/`.
