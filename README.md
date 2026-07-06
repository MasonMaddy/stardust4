# Stardust Design System

Documentation site and component workshop for **Stardust**, the Xplor design system. Published via GitHub Pages from the `docs/` folder on `main`: https://masonmaddy.github.io/stardust4/

**A product + design system.** Beyond the design system, the repo hosts an *upstream product
pipeline* of skills (`product-research` → `research-accuracy-review` → `discovery-backlog-card`
→ `product-brief` → `brief-review`) that feed the prototyping track — see
[Product pipeline](#product-pipeline). Agent-facing product knowledge (suite map, personas,
per-surface design ethos, AU/NZ sector facts) lives in [`context/`](context/README.md).

> **Operating principle:** AI automates the *manual* parts of product and design work —
> gathering, collating, drafting, decomposing — to free people for what is irreducibly human:
> creativity, judgement, and direct customer contact. Every skill keeps a human in the loop and
> checks in at each step. AI never replaces the creative or customer-facing act; it clears the
> path to it.

## What's here

```
docs/
├── index.html                 Landing page
├── components/                Component doc pages
├── tokens/                    Token reference pages (colour, typography, spacing, radius, motion)
├── sandbox/                   Development sandbox — WIP iteration + component library reference
└── assets/
    ├── css/
    │   ├── tokens.css         Design tokens as CSS custom properties (--sd-*) — synced from Figma
    │   ├── components/        Per-component CSS — the single source of truth for ds-* styles
    │   └── main.css           Site chrome only (--xp-* vars; not part of the design system)
    ├── js/nav.js              Site navigation (single source of truth for nav links)
    └── icons/                 SVG icon library (outline + colour sets, downloaded from Figma)
skills/                        Claude Code skills encoding the component workshop workflow
scripts/                       Tooling (icon download, CI checks)
```

## Architecture

- **Tokens** (`tokens.css`) are two-tier: primitives (raw scales) → semantic (purpose-named aliases).
  Most are synced from the Figma *Stardust Components* file (`a7JnfZ0Nd8df1TBPaMQ5Tj`); a trailing
  **CSS-first** section (font weights, motion, z-index) is pending Figma variable creation and is
  preserved across syncs. CSS variable *names* are the stable contract — values may change on
  sync, names never do.
- **Component CSS** lives in `docs/assets/css/components/<name>.css`. Doc pages and the sandbox
  link these shared files; pages keep only page-chrome/demo styles inline. Composed components
  link their dependencies too (e.g. Title Block loads `avatar.css` + `pill.css`).
- **No build step.** The site is plain HTML/CSS/JS served as-is.

## Workflow

Component work follows a four-phase pipeline, encoded as Claude Code skills in `skills/`:

1. **Review** (`component-review`) — audit the Figma component, gap analysis, decision log
2. **Spec** (`figma-component-builder`) — extract/produce the component spec
3. **Sandbox** (`component-sandbox`) — iterate the implementation in `docs/sandbox/`
3.5. **Sandbox Review** (`sandbox-review`) — independent senior engineer + designer gate;
   audits the WIP for token/architecture/a11y/design standards before Build
4. **Build** (`ds-component-doc`) — extract approved CSS to `components/<name>.css` and produce the doc page

Supporting skills: `ds-token-pipeline` (token sync), `ds-site-setup` (site shell + nav),
`figma-component-review` / `figma-component-uplift` (Figma-side audits),
`apollo-comparison` (read-only cross-check against Xplor's global Apollo design system —
explicit-invoke only; Apollo is a reference, Stardust/iOS/MD3 take precedence),
`component-checker` (audit any Figma file for design-system alignment — instances of the
central library `a7JnfZ0Nd8df1TBPaMQ5Tj` + mapped tokens, matched to the live site).

## Product pipeline

*Upstream* of design: skills that help PMs turn raw signal into research and product briefs, then
hand off to the existing prototyping track. **Atlassian is the system of record** — research
reports and briefs are Confluence pages; discovery cards and epics are Jira issues. The repo holds
only the skills; running them mostly writes to Atlassian, not here.

```
sources (stakeholder idea · Canny · interviews · Jira/Confluence)
  → product-research        → Research Report (local .md → Confluence)
  → research-accuracy-review → fact-check + Research accuracy findings appended (recommended)
  → discovery-backlog-card  → Discovery Backlog Card (Jira XR Initiative), filled out over time
        └─ offered after research, or run standalone
  → product-brief           → Product Brief / PRD (Confluence) → slices → Epics (Jira) → eng-check
        └─ brief-review        → principal-PM + eng critique gate (default-on, before publish)
  → flow-prototype          → runnable multi-direction prototype (docs/sandbox/)
        └─ proto-design-review → "second designer" gate: craft + persona walkthrough + System-gaps
  → dev-handoff             → build spec (HANDOFF.md · handoff.html · handover/*.json)
        └─ handoff-review      → receiving-engineer + delivery/QA gate (schema-validated)
```

- **`product-research`** — gather + synthesise sources into a research report (written first to a
  local `.md` for review, then Confluence); when discovery is incomplete, hands off to
  `discovery-backlog-card`.
- **`research-accuracy-review`** — a senior-UX-researcher fact-check pass over a finished report:
  re-pulls every cited Canny post / web source, catches hallucinations, misquotes, wrong counts and
  biased framing, and appends a *Research accuracy findings* section. Read-only on sources.
- **`discovery-backlog-card`** — turn a research report / opportunity into a short discovery
  backlog card: a Jira `XR` Initiative (status *In discovery*) shaped as a **Vision Canvas**
  snapshot with **Pirate Metrics (AARRR)** success metrics, linking out to the report and (later)
  the brief. Runs standalone or straight after a research run. A living doc, re-run as discovery
  progresses.
- **`product-brief`** — turn research / a discovery initiative into an Xplor product brief
  (Confluence, under *Product Briefs*), link it to its Jira initiative, then slice into epics in
  the delivery project with an engineering-check loop.
- **`brief-review`** — an independent principal-PM + engineering-lens critique of a brief before
  publish: evidence traceability, falsifiable metrics, provider-level and jurisdiction coverage,
  slicing sanity. Appends *Brief review findings*; any Blocker blocks publish.

Downstream, the prototyping track carries matching gates: **`proto-design-review`** (the "second
designer" — visual craft, a persona walkthrough on the target surface, and a System-gaps triage
that routes design-system gaps to Track 1 or hands novel moments to the designer in Figma) and
**`handoff-review`** (a receiving-engineer + delivery/QA pass over the handoff package, with real
JSON-schema validation and cross-system dependency checks). All review gates are default-on.

Every external write is **draft → review → approve → write**; nothing is created in Jira or
Confluence without explicit approval. Build these skills on a `product/` branch + PR (running them
needs no PR — they don't change the repo).

### Canny MCP setup

`product-research` reads Canny feature requests via the **official Canny MCP** (remote, OAuth) —
see [Canny's setup doc](https://help.canny.io/en/articles/13063190-canny-mcp-server). It connects
to the `xplor.canny.io` workspace.

**Why this is more than a one-liner:** Canny's OAuth server does **not** support dynamic client
registration (no `registration_endpoint`), which is what Claude Code's automatic remote-OAuth flow
relies on. A plain `claude mcp add <url>` therefore fails with **"Failed to connect"**. Instead you
supply Canny's **pre-registered client credentials** (published in their setup doc, under *Claude /
Claude Code*) manually.

Each person registers it **locally** (so the secret never lands in the repo), then authenticates:

```bash
# 1. Register at LOCAL scope with Canny's pre-registered Claude client.
#    Paste the Client Secret from Canny's doc between the quotes — inline, so it isn't
#    exported into your shell or committed anywhere. The client-id is a public identifier.
MCP_CLIENT_SECRET='<paste-secret-from-canny-doc>' claude mcp add --transport http canny \
  https://api.canny.io/api/mcp/v1 \
  -s local \
  --client-id <paste-client-id-from-canny-doc> \
  --client-secret

# 2. Start a FRESH session in this directory (a resumed --continue session won't load a
#    newly-added server), then authenticate in the browser:
#    /mcp  →  canny  →  Authenticate
```

Notes:
- **Local scope, not project scope** — the credentials stay in your machine's config, never in a
  committed `.mcp.json`. **Never paste the client secret into the repo.**
- `--client-secret` reads `MCP_CLIENT_SECRET` when there's no interactive TTY (e.g. the `!` runner).
- `claude mcp get canny` should report `Needs authentication` then, after step 2, `connected`.
- If the browser step errors on a redirect/callback mismatch, re-add with `--callback-port <port>`
  matching the redirect URI Canny registered for that client.
- Read-only for research; this skill never writes to Canny.

## Contribution tracks

Work in this repo falls into **three tracks**, deliberately *not* held to the same bar. The
difference is each track's relationship to the source of truth:

- **DS core** — the `ds-*` components and `--sd-*` tokens. This *is* the design system.
- **DS consumers** — pages and prototypes built *on* the core. They reference it; they are not
  part of it. **A consumer must never inline-redefine a `ds-*` rule or a token** (CI's
  architecture guard enforces this). If a page or prototype reveals a gap in the system, open a
  **component (core)** change rather than patching around it locally.

| Track | Layer | Branch | Skills | What lands | Review bar |
|---|---|---|---|---|---|
| **Component** | core | `component/…` | component-review → figma-component-builder → component-sandbox → sandbox-review → ds-component-doc (+ ds-token-pipeline / ds-component-api) | `assets/css/components/`, `components/`, `tokens.css`, `api/` | **Highest** — code-owner review required, changelog row, full CI |
| **Page / content** | consumer | `page/…` | ds-page-author, ds-site-setup | narrative `docs/*.html`, nav, index | Medium — CI + a content read; self-merge (Foundations pages + nav.js need a code-owner approval) |
| **Prototype + handover** | consumer | `proto/…` | flow-prototype → proto-design-review → dev-handoff → handoff-review | `docs/sandbox/`, `docs/handover/` | Lightest — on-token + CI; self-merge, moves fast |

Repo/process changes (CI, docs, governance) use `chore/…`. The differing bars are enforced, not
just suggested: `.github/CODEOWNERS` requires a peer (code-owner) approval whenever a PR touches
anything that **defines or guards the system**: the DS core (shared CSS, component doc pages,
tokens, exports), Foundations pages, shared site JS, the process layer (`skills/`, `CLAUDE.md`,
`context/`), and the guardrails (`scripts/`, `.github/`). Day-to-day artifacts — prototypes,
handoffs, briefs, sandbox and non-Foundations content — self-merge once CI is green.

## Collaborating (more than one of us in here)

`main` deploys live to GitHub Pages — **a push to `main` is a production deploy.** With
multiple people pushing, work through short-lived branches and pull requests, never straight
to `main`:

```bash
git checkout main && git pull --rebase   # start from the latest main
git checkout -b mason/input-states       # branch name: who/what
# ...work, committing small and often...
git push -u origin mason/input-states
gh pr create                             # open a PR; merge it on GitHub once CI is green
```

- **Branch protection is enabled on `main`:** direct pushes are blocked, a PR is required,
  and the `checks` CI job must pass before merge. Merge and delete the branch same-day —
  branches are meant to be short-lived, not long-running forks.
- **Pull `main` at the start of every session,** not just before pushing.
- **Claim the component before you touch it** (a quick ping). Two people editing the same
  `components/*.css` is the expensive case — CI catches token/architecture breaks, but it
  cannot resolve a logical conflict in shared CSS, which is the single source of truth.
- **One active session per working tree.** Concurrent editors/agents on the same checkout
  overwrite each other's *uncommitted* edits with no git involved (this has bitten us). To
  work in parallel on one machine, give each task its own checkout with
  `git worktree add ../stardust-<task> <branch>`.

## Conventions

- Never hardcode hex in component CSS — reference `--sd-*` tokens (CI enforces this for
  `components/*.css`).
- Font weights and motion use `--sd-font-weight-*` / `--sd-motion-*` tokens.
- `nav.js` builds DOM via `createElement`/`createTextNode` from hardcoded strings only — never
  `innerHTML` (see the header comment in that file).
- Component pages carry a changelog table; add a row for every change.

## Tokens for engineers (DTCG export)

The full token set is published in the W3C **DTCG format** at a stable URL:

```
https://masonmaddy.github.io/stardust4/tokens/stardust.tokens.json
```

- **Derived, never hand-edited**: generated from `tokens.css` by
  `node scripts/build-tokens-json.mjs`; CI fails if the two drift.
- **Consume it** with any DTCG-aware tool — e.g. Style Dictionary v4 turns it into
  Compose/Kotlin, Swift, or XML resources:
  ```js
  // style-dictionary.config.js (consumer side — not part of this repo)
  export default {
    source: ['stardust.tokens.json'],
    platforms: {
      android: { transformGroup: 'android', buildPath: 'src/main/res/values/',
                 files: [{ destination: 'stardust.xml', format: 'android/resources' }] },
    },
  };
  ```
- **Sync chain**: Figma → tokens.css (Claude re-sync) → `build-tokens-json.mjs` →
  committed JSON → consumers re-fetch on release. Pin a commit SHA or vendor the file
  if you need reproducible builds.
- **It IS a committed source file** — `docs/tokens/stardust.tokens.json` in this repo.
  The Pages URL above is just that file served verbatim (GitHub Pages publishes the
  `docs/` folder; nothing is generated at serve time). Three ways to consume it:
  | Need | Use |
  |---|---|
  | Always-latest (CI regenerates on merge) | The Pages URL above |
  | Reproducible builds (pinned version) | `https://raw.githubusercontent.com/MasonMaddy/stardust4/<commit-sha>/docs/tokens/stardust.tokens.json` |
  | Offline / vendored | Commit a copy into your repo and diff against the URL on upgrade |

## Tooling

- `node scripts/download-colour-icons.mjs` — refresh the colour icon set from Figma
  (requires a `FIGMA_TOKEN` env var; never commit tokens).
- `node scripts/lint-hex.mjs` — fail on hardcoded hex in shared component CSS (runs in CI).
- `node scripts/check-token-refs.mjs` — fail if a component references a `var(--sd-*)` token
  that isn't defined in `tokens.css` (runs in CI).
- `node scripts/check-links.mjs` — verify internal links/assets resolve (runs in CI).
- `node scripts/check-icon-assets.mjs` — verify the icon-browser JS arrays in `icons.html`
  only reference SVGs that exist on disk (runs in CI).
- `node scripts/check-skill-refs.mjs` — verify every `references/`, `context/`, and cross-skill
  path named in any `skills/*/SKILL.md` exists on disk (runs in CI).

### CI security guards

This repo is **public** and the product pipeline can leave customer-voice drafts in the working
tree, so CI also enforces:

- **No confidential drafts committed** — `session-notes/` and `*-research-report.md` are
  gitignored; CI fails if any are tracked. Drafts publish to Confluence, never to git.
- **Secret scan (gitleaks)** — every PR is scanned for credentials; allowlist intentional
  non-secrets in `.gitleaks.toml` with a comment.
- The workflow runs with least-privilege (`permissions: contents: read`), cancels superseded
  runs, and pins tool versions (`html-validate`, gitleaks-by-checksum) for reproducibility.
