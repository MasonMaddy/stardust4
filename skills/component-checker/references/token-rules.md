# Token Rules — what "aligned" means

Mirror of the **live** Stardust token system. The checker validates every bound value
against this. Authoritative source in the repo: `docs/assets/css/tokens.css` and
`docs/tokens/stardust.tokens.json`. Authoritative source in Figma: the `mapped`
collection in `a7JnfZ0Nd8df1TBPaMQ5Tj`.

## The two-tier model

- **`base`** (primitives, ~113 vars) — raw values: `colour/cyan/700`, `colour/grey/0`,
  `spacing/4`. **Never bind a component directly to these.**
- **`mapped`** (semantic, 47 vars) — intent aliases that reference `base`:
  `colour/action/primary`, `spacing/component/md`. **Components bind to these.**

Naming: primitives + semantic both use British **`colour/`** with **slash** separators
(`colour/action/primary`). The capital-C `Color/primary` and `value`-collection naming
is **legacy/wrong** — flag it if seen.

## ⚠️ Legacy vs greenfield — read this

The live file uses **Legacy Stardust** values. A separate *greenfield* architecture
(Xplor corporate coral `#FF5A35` / navy `#1A2B4A` / neutral ramp) exists as future-state
only and is **NOT approved**. If a node resolves to coral/navy/neutral values, that's a
🔴 critical violation — it's the wrong palette. Live `colour/action/primary` is teal
**`#00776B`**, not coral.

## mapped colour — ground truth (light mode)

| Token | Resolves to | Hex |
|---|---|---|
| `colour/action/primary` | cyan/700 | `#00776B` |
| `colour/action/hover` | cyan/600 | `#008480` |
| `colour/action/pressed` | cyan/900 | `#004B40` |
| `colour/action/disabled` | grey/200 | `#F6F6F6` |
| `colour/action/foreground` | grey/0 | `#FFFFFF` |
| `colour/accent/secondary` | purple/500 | `#8068BA` |
| `colour/accent/subtle` | purple/50 | `#F3F1FF` |
| `colour/text/text-primary` | grey/1100 | `#252525` |
| `colour/text/text-secondary` | grey/800 | `#838383` |
| `colour/text/text-disabled` | grey/600 | `#BDBDBD` |
| `colour/text/text-inverse` | grey/0 | `#FFFFFF` |
| `colour/text/text-link` | cyan/700 | `#00776B` |
| `colour/surface/default` | grey/0 | `#FFFFFF` |
| `colour/surface/grey` | grey/200 | `#F6F6F6` |
| `colour/surface/cyan` | cyan/50 | `#DFF2F1` |
| `colour/surface/green` | green/50 | `#F1F8F2` |
| `colour/surface/purple` | purple/50 | `#F3F1FF` |
| `colour/surface/red` | red/50 | `#FBDAE3` |
| `colour/surface/orange` | orange/50 | `#FEF2E0` |
| `colour/surface/inverse` | grey/1200 | `#121212` |
| `colour/border/default` | purple/200 | `#D0C7E5` |
| `colour/border/strong` | grey/800 | `#838383` |
| `colour/border/focus` | cyan/700 | `#00776B` |
| `colour/border/error` | red/800 | `#D21D3E` |
| `colour/focus/primary` | cyan/200 | `#7BCAC5` |
| `colour/focus/secondary` | grey/800 | `#838383` |
| `colour/feedback/success/default` | cyan/500 | `#01A39D` |
| `colour/feedback/success/subtle` | cyan/50 | `#DFF2F1` |
| `colour/feedback/warning/default` | orange/700 | `#EC7702` |
| `colour/feedback/warning/subtle` | orange/50 | `#FEF2E0` |
| `colour/feedback/error/default` | red/800 | `#D21D3E` |
| `colour/feedback/error/subtle` | red/400 | `#D54263` |

## mapped spacing — ground truth

| Token | px |
|---|---|
| `spacing/component/sm` | 8 |
| `spacing/component/md` | 16 |
| `spacing/component/lg` | 24 |
| `spacing/stack-gap/tight` | 4 |
| `spacing/stack-gap/default` | 8 |
| `spacing/stack-gap/loose` | 12 |
| `spacing/stack-gap/wide` | 16 |
| `spacing/section/gap` | 24 |
| `spacing/page-margin/mobile` | 20 |
| `spacing/page-margin/tablet` | 24 |
| `spacing/page-margin/desktop` | 32 |

## radius — ground truth

| Token | px |
|---|---|
| `radius/sm` | 4 |
| `radius/m` | 8 |
| `radius/lg` | 16 |
| `radius/full` | 9999 |

## Typography

Type is bound via published **text styles** (not colour/composite variables). Valid
styles include `Header/H1…H4/*`, `Body/Regular|Medium|Bold`, `Subtitle/Regular|Medium|Bold`,
`Caption/Regular|Bold`, `Overline/Regular`. Interactive elements: minimum `Subtitle`
(14px). Caption (12px) on an interactive element is a 🟠 major flag.

## Effect styles

`hoverShadow`, `focusBorder` (focus ring), `errorborder` (error ring). Hand-built drop
shadows that should be one of these = 🟡 minor.

## How to decide pass / fail per bound value

1. `get_variable_defs` returns a variable name for the property →
   - name is in `mapped` above → ✅ pass
   - name is a `base` primitive (`colour/cyan/700`, `spacing/4`) → 🟠 major (use the semantic alias)
   - name uses legacy `Color/...` form → 🟠 major (wrong collection)
2. No variable, just a raw value →
   - hex/number matches a `mapped` value but isn't bound → 🔴 critical (detached — won't track the system)
   - hex is a greenfield colour (coral/navy/neutral) → 🔴 critical (wrong palette)
   - hex matches nothing → 🔴 critical (off-system)
