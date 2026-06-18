# Component Registry — what must be a Stardust instance

Every interactive / structural UI element in a consuming file must be an **instance of a
main component from the central library**:

**Central library file key: `a7JnfZ0Nd8df1TBPaMQ5Tj` (Stardust Components)**

If an element's main component is not in this file — or the element is a detached frame,
a local component, or a hand-built cluster of rectangles + text — it is off-system.

## How to verify provenance with the MCP

1. `get_metadata` on the target → note which nodes are `instance` vs `frame`/`rectangle`/`text`.
2. For each `instance`, run `get_code_connect_map` and `get_libraries` to see the linked
   library and the main-component source file. The main component's file key must equal
   `a7JnfZ0Nd8df1TBPaMQ5Tj`.
3. `search_design_system` with the element's role (e.g. "button", "avatar") returns the
   canonical component it *should* be — use this to tell the designer exactly what to swap to.
4. If provenance can't be confirmed via the tools, report **unverified**, never **pass**.

## The live component set

These are the components that exist in the system today (live at
`https://masonmaddy.github.io/stardust4/`). Each has a spec and a live CSS file. If a file
contains one of these UI patterns, it must be the matching library instance.

| Component | Figma main (in `a7JnfZ0Nd8df1TBPaMQ5Tj`) | Spec | Live CSS |
|---|---|---|---|
| Avatar | `Stardust/Avatar` | `figma-component-builder/references/avatar-spec.md` | `docs/assets/css/components/avatar.css` |
| Bottom Sheet | `Stardust/BottomSheet` (`ds-sheet`) | `…/bottom-sheet-spec.md` | `…/bottom-sheet.css` |
| Button | `Stardust/Button` | `…/button-spec.md` | `…/button.css` |
| Card / Clickable Card | `Stardust/Card`, `Stardust/ClickableCard` | `…/clickable-card-spec.md` | `…/card.css` |
| Checkbox | `Stardust/Checkbox` | `…/checkbox-spec.md` | `…/checkbox.css` |
| FAB | `Stardust/FAB` | `…/fab-spec.md` | `…/fab.css` |
| Icon | `Stardust/Icon` (iconOutline + iconColoured) | — (see `docs/components/icons.html`) | — |
| Input | `Stardust/Input` | (input on `docs/components/input.html`) | `…/input.css` |
| Message Box | `Stardust/MessageBox` | (see `docs/components/message-box.html`) | `…/message-box.css` |
| Pill | `Stardust/Pill` | `…/pill-spec.md` | `…/pill.css` |
| Radio Button | `Stardust/RadioButton` | `…/radio-button-spec.md` | `…/radio-button.css` |
| Selection Pill | `Stardust/SelectionPill` | `…/selection-pill-spec.md` | `…/selection-pill.css` |
| Title Block | `Stardust/TitleBlock` | `…/title-block-spec.md` | `…/title-block.css` |
| Toggle | `Stardust/Toggle` | `…/toggle-spec.md` | `…/toggle.css` |

> Component names above are the expected canonical names; confirm exact node names with
> `search_design_system` against the live library — don't assume the slash/casing.

## Spec-alignment check

Once provenance is confirmed, open the component's `-spec.md` and verify the instance:
- uses a **variant/state that exists** in the spec (e.g. Button `type` ∈ {solid, ghost,
  minimal, destructive}; no invented variants),
- matches the spec **dimensions** (e.g. Button height 48px, radius `radius/lg`; Avatar 64px
  default; Checkbox 44px hit-area / 18px box),
- has overrides that stay within allowed bounds (text/icon swaps fine; restyled fills,
  resized containers, or off-spec colours are flags).

## Common off-system patterns to catch

- A "button" that is a rounded-rectangle + text frame, not a `Stardust/Button` instance → 🔴
- An avatar drawn as an ellipse + image fill instead of `Stardust/Avatar` → 🔴
- A card built from a frame with a hand-set shadow instead of `Stardust/Card` + `hoverShadow` → 🔴
- A real Button instance whose fill was overridden to a raw hex → 🟠 (instance ok, token wrong)
- An instance from a *personal* or *Moondust* library, not Stardust → 🔴 (wrong system)
- Icons placed as raster/exported PNG instead of the `Stardust/Icon` set → 🟠
