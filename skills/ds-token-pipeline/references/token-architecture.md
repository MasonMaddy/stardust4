# Xplor Design System — Token Architecture

> ⚠️ **IMPORTANT — GREENFIELD vs LIVE FIGMA**
>
> The token values documented below describe the **future-state / greenfield DTCG architecture**
> using Xplor corporate brand colours (coral `#FF5A35`, navy `#1A2B4A`).
>
> The **live Figma file** (`a7JnfZ0Nd8df1TBPaMQ5Tj`) uses **Legacy Stardust naming and values**:
> - `colour/action/primary` = **#00776B** (teal/cyan, NOT coral)
> - `colour/accent/subtle` = **#F3F1FF** (purple/50, NOT a cyan tint)
> - `colour/border/default` = **#D0C7E5** (purple/200, NOT neutral)
>
> **Use Legacy Stardust token names and values** for all current documentation, component pages,
> and `tokens.css` regeneration. The greenfield architecture below is preserved as future-state
> reference — do not apply it until a migration is formally approved.
>
> The `docs/assets/css/tokens.css` file in the stardust4 repo contains the authoritative live values.

---

## The two-layer model

**Layer 1 — Primitive tokens**
Raw values. Never referenced directly in components or code.
Named by their value, not their intent.

```json
{
  "color": {
    "coral": {
      "400": { "$value": "#FF7A5A", "$type": "color" },
      "500": { "$value": "#FF5A35", "$type": "color" },
      "600": { "$value": "#E04D2C", "$type": "color" },
      "700": { "$value": "#C0401F", "$type": "color" }
    },
    "navy": {
      "800": { "$value": "#243556", "$type": "color" },
      "900": { "$value": "#1A2B4A", "$type": "color" }
    },
    "neutral": {
      "0":   { "$value": "#FFFFFF", "$type": "color" },
      "50":  { "$value": "#F7F8FA", "$type": "color" },
      "100": { "$value": "#ECEEF2", "$type": "color" },
      "300": { "$value": "#8A9BAE", "$type": "color" },
      "500": { "$value": "#3D5068", "$type": "color" },
      "900": { "$value": "#1A2B4A", "$type": "color" }
    },
    "green": {
      "500": { "$value": "#00A878", "$type": "color" }
    },
    "amber": {
      "500": { "$value": "#F5A623", "$type": "color" }
    },
    "red": {
      "500": { "$value": "#D94035", "$type": "color" }
    }
  }
}
```

**Layer 2 — Semantic tokens**
Intent-based aliases. Reference primitives. Used in components.
Split into Light and Dark modes in Figma (two modes, one collection).

```json
{
  "color": {
    "action": {
      "primary":          { "$value": "{color.coral.500}", "$type": "color" },
      "primary-hover":    { "$value": "{color.coral.600}", "$type": "color" },
      "primary-pressed":  { "$value": "{color.coral.700}", "$type": "color" },
      "disabled":         { "$value": "{color.neutral.300}", "$type": "color" }
    },
    "surface": {
      "default":          { "$value": "{color.neutral.0}", "$type": "color" },
      "subtle":           { "$value": "{color.neutral.50}", "$type": "color" },
      "strong":           { "$value": "{color.navy.900}", "$type": "color" }
    },
    "text": {
      "default":          { "$value": "{color.navy.900}", "$type": "color" },
      "subtle":           { "$value": "{color.neutral.500}", "$type": "color" },
      "on-action":        { "$value": "{color.neutral.0}", "$type": "color" },
      "on-strong":        { "$value": "{color.neutral.0}", "$type": "color" }
    },
    "border": {
      "default":          { "$value": "{color.neutral.100}", "$type": "color" },
      "strong":           { "$value": "{color.neutral.300}", "$type": "color" }
    },
    "focus": {
      "ring":             { "$value": "{color.navy.900}", "$type": "color" }
    },
    "feedback": {
      "success":          { "$value": "{color.green.500}", "$type": "color" },
      "warning":          { "$value": "{color.amber.500}", "$type": "color" },
      "error":            { "$value": "{color.red.500}", "$type": "color" }
    }
  }
}
```

---

## Token categories

### Spacing
Base unit: 4px. Numeric scale.

```json
{
  "spacing": {
    "1":  { "$value": "4px",  "$type": "dimension" },
    "2":  { "$value": "8px",  "$type": "dimension" },
    "3":  { "$value": "12px", "$type": "dimension" },
    "4":  { "$value": "16px", "$type": "dimension" },
    "6":  { "$value": "24px", "$type": "dimension" },
    "8":  { "$value": "32px", "$type": "dimension" },
    "10": { "$value": "40px", "$type": "dimension" },
    "12": { "$value": "48px", "$type": "dimension" },
    "16": { "$value": "64px", "$type": "dimension" },
    "focus-offset": { "$value": "2px", "$type": "dimension" }
  }
}
```

### Border radius
T-shirt sizing.

```json
{
  "radius": {
    "sm":   { "$value": "4px",    "$type": "dimension" },
    "md":   { "$value": "8px",    "$type": "dimension" },
    "lg":   { "$value": "12px",   "$type": "dimension" },
    "xl":   { "$value": "16px",   "$type": "dimension" },
    "full": { "$value": "9999px", "$type": "dimension" }
  }
}
```

### Typography
Scale: Sora (headings) + Inter (body).

```json
{
  "typography": {
    "family": {
      "heading": { "$value": "Sora, sans-serif", "$type": "fontFamily" },
      "body":    { "$value": "Inter, sans-serif", "$type": "fontFamily" }
    },
    "size": {
      "xs":  { "$value": "11px", "$type": "dimension" },
      "sm":  { "$value": "13px", "$type": "dimension" },
      "md":  { "$value": "15px", "$type": "dimension" },
      "lg":  { "$value": "17px", "$type": "dimension" },
      "xl":  { "$value": "20px", "$type": "dimension" },
      "2xl": { "$value": "24px", "$type": "dimension" },
      "3xl": { "$value": "32px", "$type": "dimension" }
    },
    "weight": {
      "regular":  { "$value": "400", "$type": "fontWeight" },
      "medium":   { "$value": "500", "$type": "fontWeight" },
      "semibold": { "$value": "600", "$type": "fontWeight" },
      "bold":     { "$value": "700", "$type": "fontWeight" }
    },
    "leading": {
      "tight":  { "$value": "1.2", "$type": "number" },
      "normal": { "$value": "1.5", "$type": "number" },
      "loose":  { "$value": "1.7", "$type": "number" }
    }
  }
}
```

### Motion

```json
{
  "motion": {
    "duration": {
      "instant": { "$value": "0ms",   "$type": "duration" },
      "fast":    { "$value": "150ms", "$type": "duration" },
      "normal":  { "$value": "250ms", "$type": "duration" },
      "slow":    { "$value": "400ms", "$type": "duration" }
    },
    "easing": {
      "standard":   { "$value": "cubic-bezier(0.4, 0, 0.2, 1)", "$type": "cubicBezier" },
      "enter":      { "$value": "cubic-bezier(0, 0, 0.2, 1)",   "$type": "cubicBezier" },
      "exit":       { "$value": "cubic-bezier(0.4, 0, 1, 1)",   "$type": "cubicBezier" },
      "spring":     { "$value": "cubic-bezier(0.34, 1.56, 0.64, 1)", "$type": "cubicBezier" }
    }
  }
}
```

---

## Naming convention rules

1. Lowercase, dot-separated only. No camelCase, underscores, or hyphens.
2. Semantic tokens use intent names, never brand or raw value names.
3. Spacing uses numeric scale (1, 2, 3...). Subjective dimensions use t-shirt sizes (sm, md, lg).
4. Dark mode = a mode on the semantic token collection, not a separate token name.
5. Component-scoped tokens are prefixed with the component name: `button.background.primary`

---

## DTCG format quick reference

The W3C DTCG specification (v1.0, stable as of October 2025) uses `$` prefixed properties:

```json
{
  "token-name": {
    "$value": "...",
    "$type": "color | dimension | fontFamily | fontWeight | duration | cubicBezier | number",
    "$description": "Optional — what this token is for",
    "$extensions": {}
  }
}
```

File extension: `.tokens.json`
MIME type: `application/design-tokens+json`

Token reference (alias): `{ "$value": "{path.to.token}" }`
