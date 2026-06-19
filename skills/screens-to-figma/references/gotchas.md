# Plugin-API gotchas (read before building)

These are the failures that actually cost debug cycles authoring screens via `use_figma`. Each is
cheap to avoid once you know it and confusing to hit blind. The screenshot-after-every-batch loop
exists largely to catch these.

## Absolute positioning — append BEFORE you set it
Setting `node.layoutPositioning = 'ABSOLUTE'` throws *"Can only set layoutPositioning = ABSOLUTE
if the parent node has layoutMode !== NONE"* if the node has no parent yet (or the parent isn't
auto-layout). **Order: `parent.appendChild(node)` → `node.layoutPositioning = 'ABSOLUTE'` → set
`node.x/​y`.** This bites starfields, nav bars, popovers — anything floating in an auto-layout
hero. Symptom: the whole call errors out mid-build.

## Icons render as grey squares
`createNodeFromSvg` returns a wrapper **frame** containing vector nodes. Two mistakes:
1. Recolouring the wrapper's `fills` paints a solid square over the icon. **Clear the wrapper
   fill (`n.fills = []`) and recolour only vector descendants** (`VECTOR/ELLIPSE/RECTANGLE/…`).
2. `resize()` on the wrapper resizes the frame but **not** its children → the icon is clipped or
   tiny. **Use `n.rescale(size / n.width)`** to scale node + children together.
Recolour both `fills` *and* `strokes` on each vector — some icons are stroked (`fill="none"`),
some filled. Symptom: grey/black squares where icons should be.

## Inter weight names have spaces
`figma.loadFontAsync` / `fontName.style` use **"Semi Bold"** and **"Extra Bold"** (with a space),
not "SemiBold"/"ExtraBold". Wrong name → font load rejects or text falls back. **Load every
weight you use up front** with `Promise.all([...].map(loadFontAsync))` *before* setting any
`characters` — setting text with an unloaded font throws.

## `use_figma` returns no value
The tool reports "executed with no return value" — a trailing `node.id` expression is **not**
returned to you. To get node ids for screenshotting, call `get_metadata` (no `nodeId` → lists
pages; then pass a page/frame id to drill in) and read the ids out, or screenshot the page node
(`0:1`) wholesale. Don't rely on the call echoing ids back.

## Gradients
`GRADIENT_LINEAR` with `gradientTransform: [[0,1,0],[-1,0,1]]` gives a clean **top→bottom**
vertical gradient — a robust stand-in for a top-centre radial glow (radial transforms are fiddly
to orient; reach for them only if the look demands it). Gradient stop colours take `{r,g,b,a}` —
remember the `a`.

## `figma.currentPage`
Renaming the current page (`figma.currentPage.name = '…'`) is fine. **Switching** the current
page (`figma.currentPage = somePage`) is not supported by the plugin sandbox — author on the page
you're on.

## Auto-layout sizing, briefly
- `layoutAlign = 'STRETCH'` → child fills the parent's **cross** axis (e.g. full width in a
  vertical stack). This is how inputs/buttons go full-width.
- `layoutGrow = 1` → child absorbs remaining **primary**-axis space (a spacer that pushes a CTA
  to the bottom; a text node that fills a row).
- Fixed size needs `primaryAxisSizingMode`/`counterAxisSizingMode = 'FIXED'` **and** a `resize()`;
  width still yields to `STRETCH` inside an auto-layout parent.
- A horizontal auto-layout's *counter* axis is height — to pin a 52px input height, set
  `counterAxisSizingMode = 'FIXED'` and `resize(w, 52)`.

## Scope vs. node persistence
Each `use_figma` call is a fresh JS scope (re-paste helpers every call), but the **nodes persist**
in the file across calls. So build incrementally across calls (one flow/row each), positioning new
frames with `.x`/`.y`; don't try to hold one giant call. Clear the page with
`figma.currentPage.children.forEach(c => c.remove())` only when you intend a full rebuild.
