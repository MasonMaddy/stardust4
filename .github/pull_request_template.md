## What & why

<!-- One or two lines. Link the spec / prototype / issue if there is one. -->

## Track

<!-- Tick one. Your branch prefix should match: component/  page/  proto/  chore/ -->

- [ ] **Component** — DS core (`component/…`)
- [ ] **Page / content** — consumer (`page/…`)
- [ ] **Prototype + handover** — consumer (`proto/…`)
- [ ] **Repo / process** — CI, docs, governance (`chore/…`)

## Checklist (all PRs)

- [ ] Branched off the latest `main`; the `checks` CI job is green
- [ ] No inline `ds-*` rules and no hardcoded hex — pages & prototypes link the shared component CSS

### If Component (DS core)

- [ ] Changelog row added to the component doc page
- [ ] Tokens changed? regenerated `stardust.tokens.json` (`node scripts/build-tokens-json.mjs`)
- [ ] Component facts changed? regenerated `api/*` + `llms.txt` (`node scripts/build-component-api.mjs`)
- [ ] A code-owner review is required and will be requested automatically (CODEOWNERS)

### If Page / content

- [ ] Internal links/assets resolve and HTML validates
- [ ] Page authored with `ds-page-author`; any nav/index change went through `ds-site-setup`

### If Prototype + handover

- [ ] Lives under `docs/sandbox/` or `docs/handover/`; on-token only, no DS-core changes
- [ ] Handoff artifacts regenerated from source if applicable (`node scripts/build-handoff.mjs`)
