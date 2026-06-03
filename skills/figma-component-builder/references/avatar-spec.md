# Avatar — Component Specification

**Source of truth:** [Figma node 316:7102](https://www.figma.com/design/a7JnfZ0Nd8df1TBPaMQ5Tj/Stardust-Components?node-id=316-7102)  
**Status:** Published (v1.0.0)  
**Primary use:** Child profile identity in live products (photo, initials, icon, or add placeholder).

---

## Overview

Avatar represents a person — typically a child profile — in lists, headers, and profile pickers. The component set ships at **64×64px (md)** in Figma but **scales to fit** its parent container in production UI. Optional overlays flag **unchecked profile data** (`hasStatus`) or show a **linked profile badge** (`showStackedAvatar`).

---

## Figma component description

Copy into the Avatar component set description in Figma:

```
Represents a child profile identity — photo, initials, icon, or add placeholder.
Use when: showing who a profile belongs to in lists, headers, pickers, or family views.
Don't use when: displaying brand logos, category icons, or decorative illustration (use Icon).
Note: Default size is 64px but scales to fit parent containers. hasStatus = unchecked/new profile data (not online status). icon-colour and icon-outline slots are swappable placeholders. Round avatars use a white ring border; square avatars omit it by design.
```

---

## Variant matrix

**8 type × shape variants** in Figma, plus two boolean overlays on any variant.

| Figma property | Values | Default | Code prop |
|---|---|---|---|
| `type` | `image`, `initials`, `icon-colour`, `icon-outline` | `icon-colour` | `type` |
| `shape` | `round`, `square` | `round` | `shape` |
| `hasStatus` | true, false | **false** | `hasStatus` / `hasNewData` |
| `showStackedAvatar` | true, false | **false** | `showStackedAvatar` |

> **Product semantics:** `hasStatus=true` means the child profile has **unchecked / new data** that needs review — not user online/offline presence.

---

## Sizing

| Context | Behaviour |
|---|---|
| Figma component set | Fixed **64×64px** (md reference) |
| Standalone in product UI | Default **64px**; may render smaller or larger per layout |
| Inside another component (list row, card, nav) | **Scales to fit** parent slot — maintain **1:1 aspect ratio** |
| Typography | **Scales proportionally** with avatar dimensions (see table below) |

### Typography scale (relative to avatar width)

| Avatar width | Initials style | Stacked badge style | Initials size ratio |
|---|---|---|---|
| 64px (md) | Header/H2/regular | Header/H3/regular | 32px (50%) |
| 48px | Scale ~75% | Scale ~75% | ~24px |
| 40px | Scale ~62.5% | Scale ~62.5% | ~20px |

Engineering: derive font size as `avatarSize * 0.5` for main initials and `avatarSize * 0.375` for stacked badge initials at md, clamping to available text styles.

---

## Anatomy

| Part | Layer name | Required | Notes |
|---|---|---|---|
| Container | auto-layout frame | Yes | 1:1 aspect ratio, clips content |
| Image | image fill | When `type=image` | `object-cover`, shape-aware radius |
| Initials | text | When `type=initials` | 1–2 chars typical; scales with container |
| Icon slot | `Icon` | When `type=icon-colour` or `icon-outline` | **Placeholder** — swap for any icon instance |
| Status indicator | `status` | When `hasStatus=true` | Top-right; see Status indicator |
| Stacked badge | `stackedAvatar` | When `showStackedAvatar=true` | Bottom-right overlay; see Stacked badge |

---

## Type specifications

### `image`

| Property | Round | Square |
|---|---|---|
| Fill | Photo (`object-cover`) | Photo |
| Radius | `radius/full` | `radius/m` |
| Border | 2px `colour/surface/default` | None |
| Background | — | — |

### `initials`

| Property | Round | Square |
|---|---|---|
| Background | `colour/surface/green` | `colour/surface/green` |
| Text | `colour/action/primary` | `colour/action/primary` |
| Text style | Header/H2/regular (at md) | Header/H2/regular (at md) |
| Radius | `radius/full` | `radius/m` |
| Border | 2px `colour/surface/default` | None |

### `icon-colour`

Placeholder for a **coloured / illustrative icon** (`iconColoured` family). The Figma default icon is a demo asset — replace with the appropriate profile or category icon in product.

| Property | Round | Square |
|---|---|---|
| Background | `colour/surface/grey` | `colour/surface/grey` |
| Icon | Centred, ~50% of container | Centred, ~50% of container |
| Icon type | `iconColoured` (swappable) | `iconColoured` (swappable) |
| Radius | `radius/full` | `radius/m` |
| Border | 2px `colour/surface/default` | 2px `colour/surface/default` |

### `icon-outline`

Placeholder for an **add / empty profile** action. The Figma default is the Add (+) icon — swap for any `iconOutline` icon, commonly plus or person-add.

| Property | Round | Square |
|---|---|---|
| Background | `colour/action/primary` | `colour/action/primary` |
| Icon | Centred, white (`colour/text/text-inverse`) | Centred, white |
| Icon type | `iconOutline` (swappable) | `iconOutline` (swappable) |
| Radius | `radius/full` | `radius/m` |
| Border | 2px `colour/surface/default` | None |

---

## Shape border rule (intentional)

| Shape | White 2px `surface/default` border |
|---|---|
| **round** | On **all** types (including `image`) — separates avatar from varied backgrounds |
| **square** | On **`icon-colour` only** — other square types rely on fill/radius alone |

This is by design. Do not add borders to square `image`, `initials`, or `icon-outline` variants.

---

## Status indicator (`hasStatus`)

Flags **unchecked / new profile data** on a child profile.

| Property | md (64px avatar) | Token |
|---|---|---|
| Size | 16px diameter | 25% of avatar width |
| Fill | Teal dot | `colour/feedback/success/default` |
| Ring | 2px white | `colour/surface/default` |
| Position | Top-right, overlapping edge | See positioning below |

When `hasStatus=false`, no indicator is rendered.

---

## Stacked badge (`showStackedAvatar`)

Shows a **secondary linked profile** (e.g. parent/guardian) overlapping the bottom-right corner.

| Property | md (64px avatar) | Token / style |
|---|---|---|
| Badge size | ~43px (66.7% of avatar) | Scales with avatar |
| Badge shape | Circle (`radius/full`) | — |
| Badge background | Dark | `colour/text/text-primary` |
| Badge initials | Header/H3/regular (at md) | `colour/text/text-inverse` |
| Position | Bottom-right, overlapping | Anchored to container corner |

Badge initials and container scale proportionally when avatar scales.

---

## Status & badge positioning (md reference)

All values scale proportionally when avatar size changes.

### Status indicator

| Shape | Anchor | md offset |
|---|---|---|
| `round` | Top-right | Overlaps top-right edge by ~2px; dot centre ~12px from top, ~12px from right |
| `square` | Top-right | `top: -3px`, `left: calc(100% - 15px)` (16px dot) |

### Stacked badge

| Shape | Anchor | md offset |
|---|---|---|
| `round` | Bottom-right | Badge centre ~75% from top-left; extends ~16px beyond right and bottom edges |
| `square` | Bottom-right | `top: 30.67px`, `left: 30.67px` (43px badge on 64px container) |

---

## Usage guidelines

### Use when
- Identifying a **child profile** in a list, header, or picker
- Showing profile photo or initials when no photo exists
- Indicating an **empty slot** to add a profile (`icon-outline`)
- Flagging a profile with **data awaiting review** (`hasStatus`)
- Showing a **linked secondary profile** on the avatar (`showStackedAvatar`)

### Don't use when
- Displaying app icons, UI affordances, or decorative illustration → use **Icon**
- Showing online/presence status → Avatar status is **not** presence; use a dedicated presence pattern if needed
- Non-person entities (locations, classes) → use Icon or a domain-specific component

### Content
- Initials: first + last initial (`JA`), max 2 characters in md; truncate or shrink font for longer strings
- `icon-colour` / `icon-outline`: treat Figma defaults as placeholders only

### Layout in parent components
- Set avatar container to desired pixel or percentage width; height follows (1:1)
- Minimum recommended touch target when interactive: **44×44pt** — use at least 48px if tappable

---

## Engineering interface

```typescript
type AvatarType = 'image' | 'initials' | 'icon-colour' | 'icon-outline';
type AvatarShape = 'round' | 'square';

interface AvatarProps {
  /** Visual content type */
  type?: AvatarType;
  /** Circle or rounded square */
  shape?: AvatarShape;
  /** Profile photo URL — required when type=image */
  src?: string;
  /** Initials text — required when type=initials */
  initials?: string;
  /** Icon name / slot — when type=icon-colour or icon-outline */
  icon?: string;
  /** Child profile has unchecked / new data */
  hasStatus?: boolean;
  /** Show linked secondary profile badge */
  showStackedAvatar?: boolean;
  /** Badge initials when showStackedAvatar=true */
  stackedInitials?: string;
  /** Accessible name — required (full name, not just initials) */
  accessibilityLabel: string;
  /** Container width in px — defaults to 64; height derived (1:1) */
  size?: number;
}
```

---

## Accessibility

| Scenario | Requirement |
|---|---|
| All avatars | **`accessibilityLabel` required** with full person name ("Jane Appleseed"), never just initials |
| `type=image` | If photo is decorative in context, `alt=""` + label on container; if photo conveys identity, meaningful `alt` matching label |
| `type=initials` | Container carries `aria-label`; initials are visual shorthand only |
| `type=icon-outline` (add) | Label as action: "Add child profile" — not "Plus icon" |
| `hasStatus=true` | Include in accessible name or `aria-describedby`: "has unchecked data" / "new data to review" |
| `showStackedAvatar=true` | Name both profiles: "Jane Appleseed, linked to Lisa Brown" or equivalent |
| Interactive avatar | Use `<button>` or `<a>` with visible focus; min 44×44pt touch target |
| Status indicator | Do not rely on colour alone — status must be conveyed in text (label or description) |

---

## Acceptance criteria

- [ ] All 4 types × 2 shapes render correctly
- [ ] Default md size 64px; scales proportionally in parent layouts
- [ ] Typography scales with avatar size
- [ ] Round border on all round types; square border on `icon-colour` only
- [ ] `hasStatus` shows teal dot with white ring; hidden when false
- [ ] `showStackedAvatar` shows bottom-right badge; hidden when false
- [ ] `icon-colour` and `icon-outline` accept swappable icon instances
- [ ] `accessibilityLabel` required on all instances
- [ ] Status communicated in accessible name, not colour alone

---

## Changelog

| Version | Date | Change |
|---|---|---|
| 1.0.0 | 2026-06-02 | Initial spec aligned to Figma — child profile use case, boolean status/stacked, scalable sizing |
