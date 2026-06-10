# Component Specification Standard

Every component built for the Xplor design system must meet this specification. This file is the source of truth for what "complete" looks like.

---

## Component Workshop Workflow

All new components and major updates follow this four-phase workflow. Each phase is triggered
by natural language — Claude detects the intended phase from context.

```
Phase 1 — Review        Phase 2 — Spec         Phase 3 — Sandbox       Phase 4 — Build
─────────────────        ──────────────         ─────────────────       ───────────────
Review the component →   Create the spec   →   Build + iterate    →    Publish to DS
Compare vs MD3 (opt.)    from review log        in shared sandbox       Final page + nav
Confirm decisions        Save [name]-spec.md    docs/sandbox/           docs/components/
[name]-review.md         Hands off to sandbox   Approved = source       Update nav + index
```

### Triggering each phase (natural language)

| What you say | Phase triggered |
|---|---|
| "let's review [component]", "compare to MD3", "audit [component]" | 1 — Review |
| "create the spec", "spec it", "let's write up the spec" | 2 — Spec |
| "build the sandbox", "let's test it", "add to sandbox", "iterate" | 3 — Sandbox |
| "build it", "we're happy", "add to the design system", "publish" | 4 — Build |
| Component name with no other context | Claude asks which phase |

### Sandbox (Phase 3) — what it is

The sandbox is a single shared HTML file at `docs/sandbox/index.html` that shows:
1. **WIP section** — the component being worked on, in all states/variants, fully interactive
2. **Library section** — all existing built components for visual comparison

The sandbox uses the same `main.css`, `tokens.css`, and `nav.js` as the live site.
All CSS uses `var(--sd-*)` token variables — no hardcoded hex.
Iterate on the sandbox until the design is approved, then trigger Phase 4.

---

---

## Documentation page standard

Every component page in `docs/components/` **must follow the structure of `button.html`**. That page is the canonical template. Key structural rules:

### Page-level structure
- Use `class="section scroll-spy-target"` for all `<section>` elements (not `doc-section`)
- Use `<span class="section-number" aria-hidden="true">N</span>` inside `<h2>` for numbered headings
- Right TOC with `<aside class="page-toc">` linking to every section

### Required sections (in order)
1. **Anatomy** — Figma source callout + SVG anatomy diagram + numbered parts table
2. **Variants** — prop table + live HTML demo grids
3. **States** (if applicable) — all interactive states shown
4. **Usage Guidelines** — do/don't, when to use/not use
5. **Token References** — table per layer: Property / Token / CSS var / Value
6. **Accessibility** — requirements and patterns
7. **Engineering** — eng-note + Props interface + Web/iOS/Android TODO stubs (no example code) + Acceptance criteria
8. **Open Questions** — warning/info callouts for unresolved design decisions
9. **Changelog** — version table

### Anatomy diagram (SVG — matches button.html)
- `<figure class="anatomy-diagram">` wrapping an `<svg viewBox="0 0 560 H">` element
- Background: grey rect `#F6F6F6` with `#D0C7E5` border
- Component drawn at realistic scale in the centre
- Dashed connector lines in `#8068BA` from numbered callout circles to component parts
- Callout circles: `r=15`, fill `#4E3A7E`, white number labels
- Target dots: `r=4`, fill `#4E3A7E` at the pointed-to part
- `<figcaption>` below the SVG describing what is shown
- Anatomy table below: columns `#` / Part / Layer name / Required / Token(s)
- `<span class="anatomy-num">N</span>` in the `#` column cross-references diagram

### Engineering section (matches button.html)
Must use `eng-section` blocks from main.css. Platform blocks contain a **TODO stub only** — no example code. Engineers fill these in using their existing implementation patterns.

**Do not generate Vue 3, SwiftUI, or Jetpack Compose example code.** Each platform team has existing implementations and conventions — the design system provides the spec (props, tokens, ARIA, dimensions), not the code.

```html
<div class="eng-note">Replace TODO blocks with platform implementations. Spec: component-spec.md</div>

<!-- Props interface — TypeScript only, always included -->
<div class="eng-section">
  <div class="eng-section__header">
    <h4>Props interface</h4>
    <span class="eng-section__badge">Aligned to Figma vX.X</span>
  </div>
  <div class="eng-section__body">
    <div class="code-block"><span class="code-block__lang">TypeScript</span><pre>…</pre></div>
  </div>
</div>

<!-- Platform stub (repeat for Web/iOS/Android) — TODO only, no example code -->
<div class="eng-section">
  <div class="eng-section__header">
    <span class="platform-badge platform-badge--web">Web</span>
    <h4>Vue 3</h4>
    <span class="eng-section__badge">TODO</span>
  </div>
  <div class="eng-section__body">
    <div class="todo"><div class="todo__label">TODO</div>
      Key implementation notes: what element to use, ARIA pattern, focus handling,
      token mapping, any non-obvious constraints from the spec.
    </div>
  </div>
</div>
<!-- Repeat for iOS (SwiftUI) and Android (Jetpack Compose) -->

<!-- Acceptance criteria -->
<div class="eng-section">
  <div class="eng-section__header"><h4>Acceptance criteria</h4></div>
  <div class="eng-section__body"><ul>…</ul></div>
</div>
```

### What goes in TODO stubs
Each platform TODO should cover:
- Which native element or primitive to use (e.g. `<button role="switch">`, `Toggle`, `Switch`)
- Key ARIA requirements and accessible name pattern
- Focus behaviour (`:focus-visible` / keyboard-only)
- Any critical constraints from the spec (e.g. button-inside-button rule, touch target handling)
- Token mapping notes if non-obvious

Keep stubs concise — 2–4 sentences. Engineers reference the full spec for details.

### Callout pattern (always use icon + body wrapper)
```html
<div class="callout callout--info">
  <span class="callout__icon" aria-hidden="true">ℹ️</span>
  <div class="callout__body">Content here.</div>
</div>
```

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
| `State` | `default`, `hover`, `focus`, `pressed`, `disabled` | Only states that visually differ. Map `focus` → `:focus-visible` in code |
| `Type` | component-specific | e.g. `solid`, `ghost`, `minimal`, `destructive` for buttons — see `button-spec.md` |
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
