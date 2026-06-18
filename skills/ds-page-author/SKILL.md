---
name: ds-page-author
description: >
  Use this skill to author a narrative/content page on the Stardust docs site — the
  About, Foundations (non-token), Playbook, and Resources sections. Triggers include:
  "write a DS page", "add this to the design system site", "create a page for [section]",
  "document this in the DS", "write up the [philosophy / sync pipeline / handoff /
  contributing / governance / getting started] page", or any request to turn notes,
  decisions, or a conversation into a publishable site page. This skill produces a
  static HTML page matching the site chrome and adds its nav link. It is NOT for
  component doc pages (use `ds-component-doc`) or token reference pages (use
  `ds-token-pipeline`).
---

# Stardust — Page Author Skill

Turns a topic + raw notes into a publishable **content page** on the no-build static
HTML site, matching the existing page chrome, and registers it in the nav.

**This is a no-build HTML site** — there is no MDX, frontmatter, or build step. A page is
a self-contained `.html` file under `docs/<section>/` that links the shared `main.css` +
`tokens.css`, includes the injected nav, and follows the page-layout structure.

## When to use this vs other skills

| You're writing… | Skill |
|---|---|
| An About / Foundations explainer / Playbook / Resources page | **this skill** |
| A component doc page (anatomy, variants, the 10-section standard) | `ds-component-doc` |
| A token reference page (colour/spacing/etc.) | `ds-token-pipeline` |
| The site shell, the nav contract itself, the index grid | `ds-site-setup` |

This skill **authors content + adds one nav link**. It does not own the nav file — for
the nav edit it follows `ds-site-setup`'s Phase B procedure (below). Anything beyond a
single link addition (reordering sections, shell changes) is a `ds-site-setup` task.

## Inputs

- **Topic** and which section it belongs to (About / Foundations / Playbook / Resources).
- **Raw notes / source material.** Author from provided content; do not invent
  Xplor-specific facts. If the page is voice-driven (vision, problem, governance) and no
  notes are given, produce a **stub** (page-header + a "Coming soon" callout + a planned
  outline) rather than generated prose, and say so.

## Workflow

1. **Pick the section + file path.** `docs/about/`, `docs/foundations/`, `docs/playbook/`,
   or `docs/resources/`. Filename is kebab-case (`sync-pipeline.html`). These dirs sit
   outside the `lint-hex` / `check-architecture` / `build-*` scopes — only `check-links`
   and `html-validate` apply.
2. **Copy `references/page-template.html`** as the scaffold. It is the one-folder-deep
   chrome (`../assets/...` paths): `#site-nav` → `.site-content > .page-layout >
   main.main-content` (page-header + numbered-optional `.section.scroll-spy-target`
   blocks) → `aside.page-toc` → `<script src="../assets/js/nav.js">`.
3. **Fill content.** Set `<title>`, the `page-header__eyebrow` to the section name, the
   `<h1>`, and the body sections. Reuse existing chrome classes — `ds-table`, `callout
   callout--info`, `code-block` (wrap `<pre>` to get the auto Copy button). Keep every
   TOC `#anchor` matched to a section `id`. **Use `--sd-*` tokens** for any inline page
   styles; never hardcode hex.
4. **Cross-link, don't duplicate.** Link to component pages (`../components/<x>.html`),
   their `#engineering` sections, the Component API (`../api.html`), and the DTCG export
   (`../tokens/stardust.tokens.json`) rather than restating their content. Use relative
   paths that resolve to real files (anchors are fine; bare `#` is not).
5. **Add the nav link (ds-site-setup Phase B).** In `docs/assets/js/nav.js`, add one
   hardcoded object to the matching array (`ABOUT_LINKS`, `FOUNDATION_LINKS`,
   `PLAYBOOK_LINKS`, `RESOURCE_LINKS`). Hardcoded strings only — never `innerHTML`. Mark
   voice-driven stubs `status: 'wip'`. Keep the href a full `.html` path.
6. **Live data?** If the page shows a list derived from an export (e.g. the changelog or
   component catalogue), render it client-side with `fetch` + `createElement` (no
   `innerHTML`) — copy the pattern from `docs/api.html` / `docs/about/changelog.html`. If
   the data is a derived artifact, generate it with a `build-*.mjs` script + a CI
   `--check` step (mirror `scripts/build-component-api.mjs`) rather than hand-writing it.

## Quality checklist (these are the CI guards — run before presenting)

```
node scripts/check-links.mjs                 # all relative links/assets resolve
node --check docs/assets/js/nav.js           # nav still parses after the link addition
npx --yes html-validate@8 "docs/**/*.html"    # the new page validates (give every <button> a type)
```
Also confirm: eyebrow matches the section; every TOC anchor has a matching `id`; no
`ds-*` rules and no hardcoded hex in the page's inline `<style>`; cross-links point at
real files.

## Reference files
- `references/page-template.html` — the content-page scaffold (one-folder-deep chrome).
  Copy it for every new page.

## Relationship to the broader roadmap
Part of the website IA expansion. Sibling generators it should reuse rather than
reinvent: `scripts/build-component-api.mjs` (Component API), `scripts/build-changelog.mjs`
(site-wide changelog). See [[reference_figma_component_mapping]] only if the page documents
Figma↔code specifics.
